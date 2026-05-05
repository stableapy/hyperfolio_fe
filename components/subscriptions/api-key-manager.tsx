'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  checkTokenList,
  rotateApiKey,
  SubscriptionApiError,
} from '@/lib/subscriptions/client';
import {
  saveStoredApiCredentials,
} from '@/lib/subscriptions/storage';
import type { StoredApiCredentials } from '@/lib/subscriptions/types';

interface ApiKeyManagerProps {
  initialCredentials: StoredApiCredentials;
  onCredentialsChange?: (value: StoredApiCredentials | null) => void;
}

interface RotationValidationResult {
  oldKeyStatus: number;
  newKeyStatus: number;
}

function formatApiError(error: unknown): string {
  if (error instanceof SubscriptionApiError) {
    return `${error.message} (HTTP ${error.status})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

function formatLimit(value: number | null): string {
  return typeof value === 'number' ? value.toLocaleString() : 'unlimited';
}

export function ApiKeyManager({
  initialCredentials,
  onCredentialsChange,
}: ApiKeyManagerProps) {
  const [credentials, setCredentials] =
    useState<StoredApiCredentials>(initialCredentials);
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');
  const [tokenListStatus, setTokenListStatus] = useState<number | null>(null);
  const [rotationResult, setRotationResult] =
    useState<RotationValidationResult | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [statusSummary, setStatusSummary] = useState<
    'checking' | 'active' | 'invalid' | 'unknown'
  >('checking');

  useEffect(() => {
    setCredentials(initialCredentials);
    setActionError('');
    setTokenListStatus(null);
    setRotationResult(null);
    setStatusSummary('checking');
  }, [initialCredentials]);

  useEffect(() => {
    let canceled = false;

    const validateExistingKey = async () => {
      setStatusSummary('checking');
      try {
        const status = await checkTokenList(credentials.apiKey);
        if (canceled) {
          return;
        }
        setTokenListStatus(status);
        setStatusSummary(status === 200 ? 'active' : 'invalid');
      } catch {
        if (canceled) {
          return;
        }
        setStatusSummary('unknown');
      }
    };

    void validateExistingKey();

    return () => {
      canceled = true;
    };
  }, [credentials.apiKey]);

  const maskedKey = useMemo(() => {
    const key = credentials.apiKey;
    if (key.length < 12) {
      return key;
    }
    return `${key.slice(0, 12)}...${key.slice(-6)}`;
  }, [credentials.apiKey]);

  const handleCopy = async () => {
    setActionError('');
    setCopyFeedback('');

    try {
      await navigator.clipboard.writeText(credentials.apiKey);
      setCopyFeedback('Copied');
      window.setTimeout(() => setCopyFeedback(''), 1500);
    } catch {
      setActionError(
        'Clipboard access failed. Copy manually from the key block.'
      );
    }
  };

  const handleTestKey = async () => {
    setActionError('');
    setTokenListStatus(null);
    setIsTestingKey(true);

    try {
      const status = await checkTokenList(credentials.apiKey);
      setTokenListStatus(status);
    } catch (error) {
      setActionError(formatApiError(error));
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleRotate = async () => {
    setActionError('');
    setRotationResult(null);
    setTokenListStatus(null);
    setIsRotating(true);

    const oldKey = credentials.apiKey;

    try {
      const payload = await rotateApiKey(oldKey);
      const updated = saveStoredApiCredentials({
        apiKey: payload.apiKey,
        plan: credentials.plan,
        dailyLimit: credentials.dailyLimit,
        rateLimitPerSecond: credentials.rateLimitPerSecond,
      });

      setCredentials(updated);
      onCredentialsChange?.(updated);

      const [oldKeyStatus, newKeyStatus] = await Promise.all([
        checkTokenList(oldKey),
        checkTokenList(payload.apiKey),
      ]);

      setRotationResult({
        oldKeyStatus,
        newKeyStatus,
      });
      setTokenListStatus(newKeyStatus);
    } catch (error) {
      setActionError(formatApiError(error));
    } finally {
      setIsRotating(false);
    }
  };

  return (
    <section className="bg-theme-card-bg border-theme-border/70 rounded-sm border p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-theme-text-primary font-mono text-sm font-semibold">
          --your-api-key
        </h2>
        <span className="text-theme-text-muted font-mono text-xs">
          plan: {credentials.plan}
        </span>
      </div>
      <p className="text-theme-text-secondary mb-3 font-mono text-xs">
        status:{' '}
        {statusSummary === 'checking'
          ? 'checking key...'
          : statusSummary === 'active'
            ? 'active'
            : statusSummary === 'invalid'
              ? 'invalid (re-subscribe or rotate)'
              : 'unknown (network/backend issue)'}
      </p>

      <div className="bg-theme-bg border-theme-border/70 mb-4 rounded-sm border p-3">
        <p className="text-theme-text-muted mb-1 font-mono text-[10px] tracking-wide uppercase">
          x-api-key
        </p>
        <p className="text-theme-accent font-mono text-xs break-all">
          {credentials.apiKey}
        </p>
        <p className="text-theme-text-muted mt-2 font-mono text-[11px]">
          masked: {maskedKey}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={handleCopy}
          className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent rounded-sm border px-3 py-2 font-mono text-xs font-semibold"
        >
          copy --key
        </button>
        <button
          type="button"
          onClick={handleTestKey}
          disabled={isTestingKey}
          className="bg-theme-bg border-theme-border/70 text-theme-text-secondary rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
        >
          {isTestingKey ? 'testing...' : 'test --token/list'}
        </button>
        <button
          type="button"
          onClick={handleRotate}
          disabled={isRotating}
          className="bg-theme-bg border-theme-border/70 text-theme-text-secondary rounded-sm border px-3 py-2 font-mono text-xs font-semibold disabled:opacity-50"
        >
          {isRotating ? 'rotating...' : 'rotate --key'}
        </button>
      </div>

      <div className="text-theme-text-muted mb-2 font-mono text-xs">
        daily limit: {formatLimit(credentials.dailyLimit)} requests | rate:{' '}
        {formatLimit(credentials.rateLimitPerSecond)}
        /s
      </div>
      <div className="text-theme-text-muted mb-4 font-mono text-xs">
        stored at: {new Date(credentials.storedAt).toLocaleString()}
      </div>

      {copyFeedback && (
        <p className="mb-2 font-mono text-xs text-emerald-500">
          {copyFeedback}
        </p>
      )}
      {tokenListStatus !== null && (
        <p className="text-theme-text-secondary mb-2 font-mono text-xs">
          `/token/list` returned HTTP {tokenListStatus}
        </p>
      )}
      {rotationResult && (
        <p className="text-theme-text-secondary mb-2 font-mono text-xs">
          Rotation check old key: HTTP {rotationResult.oldKeyStatus} | new key:
          HTTP {rotationResult.newKeyStatus}
        </p>
      )}
      {actionError && (
        <p className="mb-2 font-mono text-xs text-red-500">{actionError}</p>
      )}
    </section>
  );
}
