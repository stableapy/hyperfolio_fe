'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import {
  checkTokenList,
  createCheckoutSession,
  createPortalSession,
  getApiKeyWithRecovery,
  getSubscriptionMe,
  getApiKeyFromSession,
  requestRecoveryCode,
  rotateApiKeyWithRecovery,
  SubscriptionApiError,
  verifyRecoveryCode,
} from '@/lib/subscriptions/client';
import { hasPublicApiBaseUrl } from '@/lib/subscriptions/config';
import {
  loadStoredApiCredentials,
  saveStoredApiCredentials,
} from '@/lib/subscriptions/storage';
import type {
  StoredApiCredentials,
  SubscriptionMeResponse,
} from '@/lib/subscriptions/types';
import { ApiKeyManager } from '@/components/subscriptions/api-key-manager';

const PRICE_INTERVAL =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_INTERVAL || '/month';
const BILLING_PLAN_IDS = ['solo', 'starter', 'growth', 'scale'] as const;
type BillingPlanId = (typeof BILLING_PLAN_IDS)[number];
type RecoveryStep = 'email' | 'code' | 'session';

const PLAN_LABELS: Record<
  BillingPlanId,
  {
    title: string;
    summary: string;
    priceDisplay: string;
    badge?: string;
    features: string[];
  }
> = {
  solo: {
    title: 'Solo Dev',
    summary:
      'For individual developers shipping personal tools. Great for MVPs and low-traffic apps that need full API access at a lower cost.',
    priceDisplay: process.env.NEXT_PUBLIC_STRIPE_PRICE_SOLO_DISPLAY || '$9',
    features: [
      '1,000 API calls/day',
      '3 requests/second rate limit',
      'Full access to all DeFi protocols',
      'Wallet composition',
      'Portfolio tracking',
    ],
  },
  starter: {
    title: 'Starter',
    summary:
      'For builders getting started. Great for prototypes and early production usage with reliable baseline limits.',
    priceDisplay: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_DISPLAY || '$29',
    features: [
      '5,000 API calls/day',
      '5 requests/second rate limit',
      'Everything in Solo',
    ],
  },
  growth: {
    title: 'Growth',
    summary:
      'For growing projects and applications. Ideal for production apps with moderate usage and needs higher throughput.',
    priceDisplay: process.env.NEXT_PUBLIC_STRIPE_PRICE_GROWTH_DISPLAY || '$99',
    badge: 'Most popular',
    features: [
      '25,000 API calls/day',
      '10 requests/second rate limit',
      'Everything in Starter',
    ],
  },
  scale: {
    title: 'Scale',
    summary:
      'For scaling applications and businesses. Perfect for high-traffic production environments and enterprise integration.',
    priceDisplay: process.env.NEXT_PUBLIC_STRIPE_PRICE_SCALE_DISPLAY || '$299',
    features: [
      '75,000 API calls/day',
      '20 requests/second rate limit',
      'Everything in Growth',
      'Priority support',
    ],
  },
};

function formatApiError(error: unknown): string {
  if (error instanceof SubscriptionApiError) {
    return `${error.message} (HTTP ${error.status})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

function toBillingPlanId(
  plan: string | null | undefined
): BillingPlanId | null {
  if (!plan) {
    return null;
  }

  const normalized = plan.toLowerCase();
  if (BILLING_PLAN_IDS.includes(normalized as BillingPlanId)) {
    return normalized as BillingPlanId;
  }

  return null;
}

function getNextPlanId(plan: BillingPlanId | null): BillingPlanId | null {
  if (!plan) {
    return null;
  }

  const index = BILLING_PLAN_IDS.indexOf(plan);
  if (index === -1 || index === BILLING_PLAN_IDS.length - 1) {
    return null;
  }

  return BILLING_PLAN_IDS[index + 1];
}

type StatusStyle = {
  label: string;
  className: string;
};

function getSubscriptionStatusStyle(status: string | undefined): StatusStyle {
  if (!status) {
    return { label: 'Unknown', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  }

  const normalized = status.toLowerCase();
  switch (normalized) {
    case 'active':
    case 'trialing':
      return { label: 'Active', className: 'bg-green-500/15 text-green-400 border-green-500/30' };
    case 'canceled':
      return { label: 'Canceled', className: 'bg-red-500/15 text-red-400 border-red-500/30' };
    case 'past_due':
      return { label: 'Past Due', className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' };
    case 'incomplete':
    case 'incomplete_expired':
      return { label: 'Incomplete', className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' };
    case 'unpaid':
      return { label: 'Unpaid', className: 'bg-red-500/15 text-red-400 border-red-500/30' };
    case 'paused':
      return { label: 'Paused', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    default:
      return { label: status, className: 'bg-gray-500/15 text-gray-400 border-gray-500/30' };
  }
}

export function BillingClient() {
  const searchParams = useSearchParams();
  const [billingMode, setBillingMode] = useState<'subscribe' | 'recover'>(
    'subscribe'
  );
  const [selectedPlan, setSelectedPlan] = useState<BillingPlanId>('solo');
  const [email, setEmail] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [sessionExchangeError, setSessionExchangeError] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isExchangingSession, setIsExchangingSession] = useState(false);
  const [tokenListStatus, setTokenListStatus] = useState<number | null>(null);
  const [storedCredentials, setStoredCredentials] =
    useState<StoredApiCredentials | null>(null);
  const [recoveryStep, setRecoveryStep] = useState<RecoveryStep>('email');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [recoveryStatus, setRecoveryStatus] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [recoveryDebugCode, setRecoveryDebugCode] = useState('');
  const [recoveryMe, setRecoveryMe] = useState<SubscriptionMeResponse | null>(
    null
  );
  const [isLoadingRecoveryMe, setIsLoadingRecoveryMe] = useState(true);
  const [isRequestingRecoveryCode, setIsRequestingRecoveryCode] =
    useState(false);
  const [isVerifyingRecoveryCode, setIsVerifyingRecoveryCode] = useState(false);
  const [isUpgradingPlan, setIsUpgradingPlan] = useState<BillingPlanId | null>(
    null
  );
  const [isRotatingRecoveryKey, setIsRotatingRecoveryKey] = useState(false);
  const [isLoadingRecoveryKey, setIsLoadingRecoveryKey] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const lastHandledSessionId = useRef<string | null>(null);

  const sessionId = searchParams.get('session_id');
  const checkoutCancelled = searchParams.get('checkout') === 'cancelled';
  const planFromQuery = searchParams.get('plan');
  const currentRecoveredPlanId = toBillingPlanId(recoveryMe?.plan);
  const nextRecoveredPlanId = getNextPlanId(currentRecoveredPlanId);

  useEffect(() => {
    setStoredCredentials(loadStoredApiCredentials());
  }, []);

  useEffect(() => {
    if (!planFromQuery) {
      return;
    }

    const normalizedPlan = planFromQuery.toLowerCase();
    if (BILLING_PLAN_IDS.includes(normalizedPlan as BillingPlanId)) {
      setSelectedPlan(normalizedPlan as BillingPlanId);
      setBillingMode('subscribe');
    }
  }, [planFromQuery]);

  const refreshRecoveryMe = async (silent = false): Promise<void> => {
    if (!silent) {
      setRecoveryError('');
      setRecoveryStatus('');
    }

    setIsLoadingRecoveryMe(true);
    try {
      const payload = await getSubscriptionMe();
      setRecoveryMe(payload);
      setRecoveryStep('session');
      setBillingMode('recover');
      setRecoveryEmail((previous) => previous || payload.email);
      setEmail((previous) => previous || payload.email);
    } catch (error) {
      if (error instanceof SubscriptionApiError && error.status === 401) {
        setRecoveryMe(null);
        setRecoveryStep('email');
        if (!silent) {
          setRecoveryStatus(
            'No active recovery session. Request an OTP code to continue.'
          );
        }
      } else if (!silent) {
        setRecoveryError(formatApiError(error));
      }
    } finally {
      setIsLoadingRecoveryMe(false);
    }
  };

  useEffect(() => {
    void refreshRecoveryMe(true);
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    if (lastHandledSessionId.current === sessionId) {
      return;
    }

    lastHandledSessionId.current = sessionId;
    setSessionExchangeError('');
    setTokenListStatus(null);
    setIsExchangingSession(true);

    const exchangeSessionForApiKey = async () => {
      try {
        const payload = await getApiKeyFromSession({ sessionId });
        const saved = saveStoredApiCredentials({
          apiKey: payload.apiKey,
          plan: payload.plan,
          dailyLimit: payload.dailyLimit,
          rateLimitPerSecond: payload.rateLimitPerSecond,
        });
        setStoredCredentials(saved);

        const status = await checkTokenList(payload.apiKey);
        setTokenListStatus(status);

        const url = new URL(window.location.href);
        url.searchParams.delete('session_id');
        const nextQuery = url.searchParams.toString();
        const nextUrl = nextQuery
          ? `${url.pathname}?${nextQuery}`
          : url.pathname;
        window.history.replaceState({}, '', nextUrl);
      } catch (error) {
        setSessionExchangeError(formatApiError(error));
        setStoredCredentials(loadStoredApiCredentials());
      } finally {
        setIsExchangingSession(false);
      }
    };

    void exchangeSessionForApiKey();
  }, [sessionId]);

  const handleCreateCheckout = async () => {
    setBillingMode('subscribe');
    setCheckoutError('');
    setSessionExchangeError('');

    if (!hasPublicApiBaseUrl()) {
      setCheckoutError('NEXT_PUBLIC_API_BASE_URL is missing.');
      return;
    }

    const effectiveEmail = email.trim() || recoveryEmail.trim();

    if (!effectiveEmail || !effectiveEmail.includes('@')) {
      setCheckoutError('Please enter a valid email address.');
      return;
    }

    setIsCreatingSession(true);
    try {
      const checkout = await createCheckoutSession({
        planId: selectedPlan,
        email: effectiveEmail,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
      });

      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      setCheckoutError(formatApiError(error));
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleRequestRecoveryCode = async () => {
    const normalizedEmail = recoveryEmail.trim();
    setRecoveryError('');
    setRecoveryStatus('');
    setRecoveryDebugCode('');

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setRecoveryError('Please enter a valid email address.');
      return;
    }

    setIsRequestingRecoveryCode(true);
    try {
      const payload = await requestRecoveryCode({ email: normalizedEmail });
      setRecoveryStatus('OTP sent. Check your email and enter the code below.');
      setRecoveryDebugCode(payload.debugCode || '');
      setRecoveryCode('');
      setRecoveryStep('code');
      setBillingMode('recover');
      setEmail((previous) => previous || normalizedEmail);
    } catch (error) {
      setRecoveryError(formatApiError(error));
    } finally {
      setIsRequestingRecoveryCode(false);
    }
  };

  const handleVerifyRecoveryCode = async () => {
    const normalizedEmail = recoveryEmail.trim();
    const normalizedCode = recoveryCode.trim();
    setRecoveryError('');
    setRecoveryStatus('');

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setRecoveryError('Please enter a valid email address.');
      return;
    }

    if (!normalizedCode) {
      setRecoveryError('Please enter the OTP code.');
      return;
    }

    setIsVerifyingRecoveryCode(true);
    try {
      await verifyRecoveryCode({
        email: normalizedEmail,
        code: normalizedCode,
      });
      setRecoveryStatus('');
      setRecoveryStep('session');
      setBillingMode('recover');
      setRecoveryCode('');
      setRecoveryDebugCode('');
      await refreshRecoveryMe(true);
    } catch (error) {
      setRecoveryError(formatApiError(error));
    } finally {
      setIsVerifyingRecoveryCode(false);
    }
  };

  const handleRecoveryPlanCheckout = async (planId: BillingPlanId) => {
    if (!recoveryMe) {
      setRecoveryError('No active recovery session.');
      return;
    }

    if (isUpgradingPlan) {
      return;
    }

    if (!hasPublicApiBaseUrl()) {
      setRecoveryError('NEXT_PUBLIC_API_BASE_URL is missing.');
      return;
    }

    setRecoveryError('');
    setRecoveryStatus('');

    const checkoutWindow = window.open('', '_blank');
    if (!checkoutWindow) {
      setRecoveryError('Popup blocked. Please allow popups and try again.');
      return;
    }

    checkoutWindow.document.title = 'Hyperfolio Checkout';
    if (checkoutWindow.document.body) {
      checkoutWindow.document.body.innerHTML =
        '<p style="font-family: monospace; padding: 16px;">Opening Stripe checkout...</p>';
    }
    setIsUpgradingPlan(planId);
    try {
      const checkout = await createCheckoutSession({
        planId,
        email: recoveryMe.email,
        successUrl: `${window.location.origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/billing/cancel`,
      });
      checkoutWindow.location.href = checkout.checkoutUrl;
    } catch (error) {
      if (!checkoutWindow.closed) {
        checkoutWindow.close();
      }
      setRecoveryError(formatApiError(error));
    } finally {
      setIsUpgradingPlan(null);
    }
  };

  const handleRotateKeyWithRecovery = async () => {
    if (!recoveryMe) {
      setRecoveryError('No active recovery session.');
      return;
    }

    setRecoveryError('');
    setRecoveryStatus('');
    setIsRotatingRecoveryKey(true);
    try {
      const payload = await rotateApiKeyWithRecovery();
      const saved = saveStoredApiCredentials({
        apiKey: payload.apiKey,
        plan: recoveryMe.plan,
        dailyLimit: recoveryMe.dailyLimit,
        rateLimitPerSecond: recoveryMe.rateLimitPerSecond,
      });
      setStoredCredentials(saved);

      const status = await checkTokenList(payload.apiKey);
      setTokenListStatus(status);
      setRecoveryStatus('API key rotated successfully and saved locally.');
      await refreshRecoveryMe(true);
    } catch (error) {
      setRecoveryError(formatApiError(error));
    } finally {
      setIsRotatingRecoveryKey(false);
    }
  };

  const handleLoadKeyWithRecovery = async () => {
    if (!recoveryMe) {
      setRecoveryError('No active recovery session.');
      return;
    }

    setRecoveryError('');
    setRecoveryStatus('');
    setTokenListStatus(null);
    setIsLoadingRecoveryKey(true);
    try {
      const payload = await getApiKeyWithRecovery();
      const saved = saveStoredApiCredentials({
        apiKey: payload.apiKey,
        plan: payload.plan,
        dailyLimit: payload.dailyLimit,
        rateLimitPerSecond: payload.rateLimitPerSecond,
      });
      setStoredCredentials(saved);

      const status = await checkTokenList(payload.apiKey);
      setTokenListStatus(status);
      setRecoveryStatus('API key loaded and saved locally.');
    } catch (error) {
      setRecoveryError(formatApiError(error));
    } finally {
      setIsLoadingRecoveryKey(false);
    }
  };

  const handleOpenStripePortal = async () => {
    setRecoveryError('');
    setIsOpeningPortal(true);
    try {
      const portal = await createPortalSession({
        returnUrl: typeof window !== 'undefined'
          ? `${window.location.origin}/billing`
          : undefined,
      });
      if (portal.url) {
        window.location.assign(portal.url);
      } else {
        setRecoveryError('Failed to get portal URL from server.');
      }
    } catch (error) {
      setRecoveryError(formatApiError(error));
    } finally {
      setIsOpeningPortal(false);
    }
  };

  const handleBackToRecoveryEmailStep = () => {
    setBillingMode('recover');
    setRecoveryStep('email');
    setRecoveryCode('');
    setRecoveryError('');
    setRecoveryStatus('');
    setRecoveryDebugCode('');
  };

  return (
    <main className="flex-1">
      <section className="container mx-auto max-w-4xl px-6 py-14">
        <div className="mb-8">
          <p className="text-theme-accent mb-2 font-mono text-xs">
            &gt; billing
          </p>
          <h1 className="text-theme-text-primary font-mono text-3xl font-bold">
            Subscribe And Manage Hyperfolio API Access
          </h1>
          <p className="text-theme-text-secondary mt-3 max-w-2xl font-mono text-sm leading-relaxed">
            Select a plan, complete Stripe checkout, then manage your API key on
            this page. Site API calls keep using the project key; your personal
            key is for direct API usage.
          </p>
        </div>

        {checkoutCancelled && (
          <section className="bg-theme-card-bg border-theme-border/70 mb-8 rounded-sm border p-5">
            <p className="text-theme-text-secondary font-mono text-xs">
              Checkout was canceled. No charge was completed.
            </p>
          </section>
        )}

        {isExchangingSession && (
          <section className="bg-theme-card-bg border-theme-border/70 mb-8 rounded-sm border p-5">
            <p className="text-theme-text-secondary font-mono text-xs">
              Fetching API key from `/subscriptions/api-key`...
            </p>
          </section>
        )}

        {sessionExchangeError && (
          <section className="bg-theme-card-bg border-theme-border/70 mb-8 rounded-sm border p-5">
            <p className="font-mono text-xs text-red-500">
              {sessionExchangeError}
            </p>
            <p className="text-theme-text-muted mt-2 font-mono text-xs">
              Common causes: invalid session, incomplete payment, or already
              used session.
            </p>
          </section>
        )}

        {tokenListStatus !== null && (
          <section className="bg-theme-card-bg border-theme-border/70 mb-8 rounded-sm border p-5">
            <p className="text-theme-text-secondary font-mono text-xs">
              Checkout validation: `/token/list` returned HTTP {tokenListStatus}
            </p>
          </section>
        )}

        <section className="bg-theme-card-bg border-theme-border/70 mb-6 rounded-sm border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setBillingMode('subscribe')}
              className={`rounded-sm border px-3 py-2 text-left font-mono text-xs font-semibold ${
                billingMode === 'subscribe'
                  ? 'bg-theme-accent/10 border-theme-accent/40 text-theme-accent'
                  : 'bg-theme-bg border-theme-border/70 text-theme-text-secondary'
              }`}
            >
              --subscribe
            </button>
            <button
              type="button"
              onClick={() => setBillingMode('recover')}
              className={`rounded-sm border px-3 py-2 text-left font-mono text-xs font-semibold ${
                billingMode === 'recover'
                  ? 'bg-theme-accent/10 border-theme-accent/40 text-theme-accent'
                  : 'bg-theme-bg border-theme-border/70 text-theme-text-secondary'
              }`}
            >
              --already-subscribed
            </button>
          </div>
        </section>

        {billingMode === 'recover' && (
          <section className="bg-theme-card-bg border-theme-border/70 mb-8 rounded-sm border p-5">
            <h2 className="text-theme-text-primary mb-4 font-mono text-sm font-semibold">
              Recover Existing Subscription
            </h2>
            <p className="text-theme-text-muted mb-4 font-mono text-xs">
              Use OTP by email to restore access, then pick a plan to upgrade in
              Stripe checkout.
            </p>

            {isLoadingRecoveryMe ? (
              <p className="text-theme-text-secondary font-mono text-xs">
                Checking existing recovery session...
              </p>
            ) : recoveryStep === 'session' && recoveryMe ? (
              <div>
                <div className="bg-theme-bg border-theme-border/70 rounded-sm border p-4">
                  <p className="text-theme-text-primary mb-3 font-mono text-xs font-semibold">
                    Plan comparison
                  </p>
                  <p className="text-theme-text-muted mb-4 font-mono text-xs">
                    Your current plan is highlighted. Clicking another plan
                    opens Stripe checkout in a new tab.
                  </p>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {BILLING_PLAN_IDS.map((planId) => {
                      const plan = PLAN_LABELS[planId];
                      const targetIndex = BILLING_PLAN_IDS.indexOf(planId);
                      const currentIndex = currentRecoveredPlanId
                        ? BILLING_PLAN_IDS.indexOf(currentRecoveredPlanId)
                        : -1;
                      const isCurrentPlan = currentRecoveredPlanId === planId;
                      const isRecommendedUpgrade =
                        !isCurrentPlan && nextRecoveredPlanId === planId;
                      const isUpgrade =
                        currentIndex >= 0 && targetIndex > currentIndex;
                      const isDowngrade =
                        currentIndex >= 0 && targetIndex < currentIndex;
                      const isCardLoading = isUpgradingPlan === planId;

                      return (
                        <article
                          key={`recover-${planId}`}
                          className={`flex h-full flex-col rounded-xl border p-4 ${
                            isCurrentPlan
                              ? 'border-theme-accent bg-theme-accent/10 ring-theme-accent/40 shadow-[0_0_0_1px_var(--theme-accent)]'
                              : isRecommendedUpgrade
                                ? 'border-theme-accent/40 bg-theme-bg'
                                : 'border-theme-border/70 bg-theme-bg'
                          }`}
                        >
                          <div className="mb-4">
                            <div className="mb-3 flex items-center justify-between gap-2">
                              <p className="text-theme-text-primary font-mono text-base font-semibold">
                                {plan.title}
                              </p>
                              {isCurrentPlan ? (
                                <span className="bg-theme-accent text-theme-bg rounded-full px-2 py-1 font-mono text-[10px] font-semibold tracking-wide uppercase">
                                  current
                                </span>
                              ) : isRecommendedUpgrade ? (
                                <span className="bg-theme-accent/15 text-theme-accent border-theme-accent/30 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide uppercase">
                                  recommended
                                </span>
                              ) : plan.badge ? (
                                <span className="bg-theme-accent/15 text-theme-accent border-theme-accent/30 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide uppercase">
                                  {plan.badge}
                                </span>
                              ) : null}
                            </div>
                            <p className="text-theme-text-muted min-h-[112px] font-mono text-xs leading-relaxed">
                              {plan.summary}
                            </p>
                          </div>

                          <div className="mb-4 flex items-end gap-1">
                            <span className="text-theme-text-primary font-mono text-3xl font-bold tracking-tight">
                              {plan.priceDisplay}
                            </span>
                            {plan.priceDisplay.trim().startsWith('$') && (
                              <span className="text-theme-text-muted pb-1 font-mono text-xs">
                                {PRICE_INTERVAL}
                              </span>
                            )}
                          </div>

                          <ul className="mb-4 flex-1 space-y-2">
                            {plan.features.map((feature) => (
                              <li
                                key={`${planId}-${feature}`}
                                className="text-theme-text-secondary flex items-start gap-2 font-mono text-[11px]"
                              >
                                <Check className="text-theme-accent mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>

                          {isCurrentPlan ? (
                            <div className="bg-theme-accent text-theme-bg border-theme-accent mt-auto rounded-md border px-3 py-2 text-center font-mono text-xs font-semibold">
                              current plan
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                void handleRecoveryPlanCheckout(planId)
                              }
                              disabled={isUpgradingPlan !== null}
                              className={`mt-auto rounded-md border px-3 py-2 text-center font-mono text-xs font-semibold disabled:opacity-60 ${
                                isRecommendedUpgrade
                                  ? 'bg-theme-accent/10 border-theme-accent/40 text-theme-accent'
                                  : 'border-theme-border/60 text-theme-text-secondary hover:border-theme-accent/40 hover:text-theme-accent'
                              }`}
                            >
                              {isCardLoading
                                ? 'opening checkout...'
                                : isUpgrade
                                  ? 'upgrade plan'
                                  : isDowngrade
                                    ? 'switch plan'
                                    : 'select plan'}
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>

                {/* Subscription Status & Management */}
                <div className="bg-theme-bg border-theme-border/70 mt-4 rounded-sm border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-theme-text-muted font-mono text-xs">Status:</span>
                      <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase ${getSubscriptionStatusStyle(recoveryMe?.subscriptionStatus).className}`}>
                        {getSubscriptionStatusStyle(recoveryMe?.subscriptionStatus).label}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleOpenStripePortal()}
                      disabled={isOpeningPortal}
                      className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
                    >
                      {isOpeningPortal ? 'opening...' : 'manage --subscription'}
                    </button>
                  </div>
                  <p className="text-theme-text-muted mt-2 font-mono text-[10px]">
                    Manage payment methods, view invoices, or cancel subscription via Stripe portal.
                  </p>
                </div>

                {!storedCredentials && (
                  <div className="bg-theme-bg border-theme-border/70 mt-4 rounded-sm border p-4">
                    <p className="text-theme-text-secondary mb-3 font-mono text-xs">
                      API key not loaded on this device yet. Show the existing
                      key from your recovery session, or rotate if you need to
                      invalidate the previous key.
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleLoadKeyWithRecovery}
                        disabled={isLoadingRecoveryKey}
                        className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
                      >
                        {isLoadingRecoveryKey
                          ? 'loading...'
                          : 'show --api-key'}
                      </button>
                      <button
                        type="button"
                        onClick={handleRotateKeyWithRecovery}
                        disabled={isRotatingRecoveryKey}
                        className="bg-theme-bg border-theme-border/70 text-theme-text-secondary rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
                      >
                        {isRotatingRecoveryKey
                          ? 'rotating...'
                          : 'rotate --key'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : recoveryStep === 'email' ? (
              <div>
                <label className="text-theme-text-muted mb-2 block font-mono text-xs">
                  Enter your billing email
                </label>
                <input
                  type="email"
                  value={recoveryEmail}
                  onChange={(event) => setRecoveryEmail(event.target.value)}
                  placeholder="user@example.com"
                  className="bg-theme-bg border-theme-border/70 text-theme-text-primary w-full rounded-sm border px-3 py-2 font-mono text-sm outline-none"
                />
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleRequestRecoveryCode}
                    disabled={isRequestingRecoveryCode}
                    className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
                  >
                    {isRequestingRecoveryCode ? 'sending otp...' : 'send --otp'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void refreshRecoveryMe()}
                    className="bg-theme-bg border-theme-border/70 text-theme-text-secondary rounded-sm border px-3 py-2 font-mono text-xs font-semibold"
                  >
                    check --existing-session
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <p className="text-theme-text-muted mb-2 font-mono text-xs">
                    Enter OTP code sent to: {recoveryEmail}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="text-theme-text-muted mb-2 block font-mono text-xs">
                    otp code
                  </label>
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(event) => setRecoveryCode(event.target.value)}
                    placeholder="123456"
                    className="bg-theme-bg border-theme-border/70 text-theme-text-primary w-full rounded-sm border px-3 py-2 font-mono text-sm tracking-[0.2em] outline-none"
                  />
                </div>
                <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={handleVerifyRecoveryCode}
                    disabled={isVerifyingRecoveryCode}
                    className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
                  >
                    {isVerifyingRecoveryCode ? 'verifying...' : 'verify --otp'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestRecoveryCode}
                    disabled={isRequestingRecoveryCode}
                    className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
                  >
                    {isRequestingRecoveryCode ? 'resending...' : 'resend --otp'}
                  </button>
                  <button
                    type="button"
                    onClick={handleBackToRecoveryEmailStep}
                    className="bg-theme-bg border-theme-border/70 text-theme-text-secondary rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
                  >
                    back --email-step
                  </button>
                </div>
              </div>
            )}

            {recoveryStatus && (
              <p className="text-theme-text-secondary mb-2 font-mono text-xs">
                {recoveryStatus}
              </p>
            )}
            {recoveryDebugCode && (
              <p className="mb-2 font-mono text-xs text-amber-400">
                debug code: {recoveryDebugCode}
              </p>
            )}
            {recoveryError && (
              <p className="font-mono text-xs text-red-500">{recoveryError}</p>
            )}
          </section>
        )}

        {billingMode === 'subscribe' && (
          <section className="bg-theme-card-bg border-theme-border/70 mb-8 rounded-sm border p-5">
            <h2 className="text-theme-text-primary mb-4 font-mono text-sm font-semibold">
              Subscribe To Hyperfolio API
            </h2>
            <p className="text-theme-text-muted mb-4 font-mono text-xs">
              Pick a plan, enter your billing email, then continue to Stripe
              Checkout.
            </p>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {BILLING_PLAN_IDS.map((planId) => {
                const selected = selectedPlan === planId;
                const plan = PLAN_LABELS[planId];

                return (
                  <button
                    key={planId}
                    type="button"
                    onClick={() => setSelectedPlan(planId)}
                    className={`group h-full rounded-xl border p-4 text-left transition-all ${
                      selected
                        ? 'border-theme-accent bg-theme-accent/10 ring-theme-accent/40 shadow-[0_0_0_1px_var(--theme-accent)]'
                        : 'border-theme-border/70 bg-theme-bg hover:border-theme-accent/50 hover:shadow-lg'
                    } flex flex-col`}
                  >
                    <div className="mb-4">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-theme-text-primary font-mono text-base font-semibold">
                          {plan.title}
                        </p>
                        {plan.badge && (
                          <span className="bg-theme-accent/15 text-theme-accent border-theme-accent/30 shrink-0 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide uppercase">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p
                        className={`mt-1 min-h-[104px] font-mono text-xs leading-relaxed sm:min-h-[112px] ${
                          selected
                            ? 'text-theme-text-secondary'
                            : 'text-theme-text-muted'
                        }`}
                      >
                        {plan.summary}
                      </p>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-end gap-1">
                        <span className="text-theme-text-primary font-mono text-3xl font-bold tracking-tight">
                          {plan.priceDisplay}
                        </span>
                        {plan.priceDisplay.trim().startsWith('$') && (
                          <span className="text-theme-text-muted pb-1 font-mono text-xs">
                            {PRICE_INTERVAL}
                          </span>
                        )}
                      </div>
                    </div>

                    <ul className="mb-4 flex-1 space-y-2">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="text-theme-text-secondary flex items-start gap-2 font-mono text-[11px]"
                        >
                          <Check className="text-theme-accent mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div
                      className={`mt-auto rounded-md border px-3 py-2 text-center font-mono text-xs font-semibold ${
                        selected
                          ? 'bg-theme-accent text-theme-bg border-theme-accent'
                          : 'border-theme-border/60 text-theme-text-secondary group-hover:border-theme-accent/40'
                      }`}
                    >
                      {selected ? 'selected plan' : 'select plan'}
                    </div>
                  </button>
                );
              })}
            </div>

            <label className="text-theme-text-muted mb-2 block font-mono text-xs">
              billing email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              className="bg-theme-bg border-theme-border/70 text-theme-text-primary mb-4 w-full rounded-sm border px-3 py-2 font-mono text-sm outline-none"
            />

            <button
              type="button"
              onClick={handleCreateCheckout}
              disabled={isCreatingSession}
              className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent rounded-sm border px-4 py-2 font-mono text-xs font-semibold disabled:opacity-50"
            >
              {isCreatingSession
                ? 'creating checkout session...'
                : 'checkout --stripe'}
            </button>

            {checkoutError && (
              <p className="mt-3 font-mono text-xs text-red-500">
                {checkoutError}
              </p>
            )}

            {!hasPublicApiBaseUrl() && (
              <p className="text-theme-text-muted mt-3 font-mono text-xs">
                Missing env variable `NEXT_PUBLIC_API_BASE_URL`.
              </p>
            )}
          </section>
        )}

        {storedCredentials && (
          <ApiKeyManager
            initialCredentials={storedCredentials}
            onCredentialsChange={setStoredCredentials}
          />
        )}
      </section>
    </main>
  );
}
