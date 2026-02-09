import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ExternalLink,
  Code2,
  Zap,
  Database,
  Shield,
  Check,
} from 'lucide-react';
import { SeoFooter } from '@/components/seo-footer';
import { SiteTopNav } from '@/components/site-top-nav';

export const metadata: Metadata = {
  title: 'API Documentation | Hyperfolio',
  description:
    'Access the Hyperfolio API to build applications on HyperEVM. Get wallet balances, token data, NFTs, DeFi positions and transaction history.',
  keywords: [
    'Hyperfolio API',
    'HyperEVM API',
    'Hyperliquid API',
    'DeFi API',
    'Wallet API',
    'Blockchain API',
  ],
  openGraph: {
    title: 'Hyperfolio API - HyperEVM Developer Tools',
    description:
      'Build on HyperEVM with the Hyperfolio API. Access wallet data, tokens, NFTs, and DeFi positions.',
  },
};

// API Features for SEO content
const API_FEATURES = [
  {
    icon: Database,
    label: '--wallet',
    title: 'Wallet Data',
    description:
      'Get complete portfolio data for any HyperEVM wallet address including token balances with USD valuations.',
  },
  {
    icon: Code2,
    label: '--tokens',
    title: 'Token Information',
    description:
      'Access real-time token prices, metadata, and market data for all HyperEVM tokens including HYPE.',
  },
  {
    icon: Zap,
    label: '--defi',
    title: 'DeFi Positions',
    description:
      'Query lending, staking, and liquidity positions across Hypercore ecosystem protocols.',
  },
  {
    icon: Shield,
    label: '--history',
    title: 'Transaction History',
    description:
      'Retrieve complete transaction history with decoded data for any wallet address.',
  },
];

const PRICE_INTERVAL =
  process.env.NEXT_PUBLIC_STRIPE_PRICE_INTERVAL || '/month';

const API_PRICING_PLANS = [
  {
    id: 'solo',
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
  {
    id: 'starter',
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
  {
    id: 'growth',
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
  {
    id: 'scale',
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
] as const;

interface ApiPricingPlan {
  id: string;
  title: string;
  summary: string;
  priceDisplay: string;
  features: string[];
  badge?: string;
}

const API_PRICING_PLAN_LIST: ApiPricingPlan[] = API_PRICING_PLANS.map(
  (plan) => ({
    id: plan.id,
    title: plan.title,
    summary: plan.summary,
    priceDisplay: plan.priceDisplay,
    features: [...plan.features],
    badge: 'badge' in plan ? plan.badge : undefined,
  })
);

export default function ApiDocsPage() {
  return (
    <div className="bg-theme-bg flex min-h-screen flex-col">
      <SiteTopNav current="api-docs" />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20">
          {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
              linear-gradient(var(--theme-accent) 1px, transparent 1px),
              linear-gradient(90deg, var(--theme-accent) 1px, transparent 1px)
            `,
              backgroundSize: '60px 60px',
            }}
          />

          <div className="relative z-10 container mx-auto px-6 text-center">
            {/* Terminal-style badge */}
            <div className="mb-8 inline-flex items-center gap-1.5">
              <span className="text-theme-accent font-mono text-sm">&gt;</span>
              <span className="text-theme-text-secondary font-mono text-sm tracking-wider">
                developer_tools
              </span>
            </div>

            <h1 className="mb-6 font-mono text-4xl font-bold md:text-5xl lg:text-6xl">
              <span className="text-theme-accent">hyperfolio</span>
              <span className="text-theme-text">_API</span>
            </h1>

            <p className="text-theme-text-secondary mx-auto mb-10 max-w-2xl font-mono text-base leading-relaxed sm:text-lg">
              Build powerful applications on HyperEVM with our comprehensive
              REST API. Access wallet data, token information, NFT collections,
              and DeFi positions.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="#api-pricing"
                className="group bg-theme-card-bg border-theme-border/70 hover:border-theme-accent/50 inline-flex items-center overflow-hidden rounded-sm border transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="bg-theme-accent/10 border-theme-accent/20 group-hover:bg-theme-accent/15 border-r px-4 py-3 transition-colors">
                  <span className="text-theme-accent font-mono text-base font-bold">
                    &gt;
                  </span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3">
                  <span className="text-theme-accent font-mono text-sm font-bold sm:text-base">
                    --view-pricing
                  </span>
                </div>
              </Link>
              <a
                href="https://api.hyperfolio.xyz/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-theme-card-bg border-theme-border/70 hover:border-theme-accent/50 inline-flex items-center overflow-hidden rounded-sm border transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="bg-theme-accent/10 border-theme-accent/20 group-hover:bg-theme-accent/15 border-r px-4 py-3 transition-colors">
                  <span className="text-theme-accent font-mono text-base font-bold">
                    &gt;
                  </span>
                </div>
                <div className="flex items-center gap-2 px-5 py-3">
                  <span className="text-theme-accent font-mono text-sm font-bold sm:text-base">
                    --view-docs
                  </span>
                  <ExternalLink className="text-theme-accent h-4 w-4 opacity-60 transition-opacity group-hover:opacity-100" />
                </div>
              </a>
            </div>

            <p className="text-theme-text-muted mt-6 font-mono text-xs sm:text-sm">
              # API key required - get one instantly from{' '}
              <Link
                href="/billing"
                className="text-theme-accent hover:underline"
              >
                /billing
              </Link>
            </p>
          </div>
        </section>

        <section
          id="api-pricing"
          className="border-theme-border/30 border-t py-16"
        >
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center font-mono">
              <span className="text-theme-text-muted text-sm">
                &gt; billing
              </span>
              <span className="text-theme-text ml-2 text-2xl font-bold md:text-3xl">
                --pricing
              </span>
            </h2>

            <div className="mx-auto mb-6 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {API_PRICING_PLAN_LIST.map((plan) => (
                <article
                  key={plan.id}
                  className="border-theme-border/70 bg-theme-card-bg flex h-full flex-col rounded-xl border p-5"
                >
                  <div className="mb-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <h3 className="text-theme-text-primary font-mono text-base font-semibold">
                        {plan.title}
                      </h3>
                      {plan.badge && (
                        <span className="bg-theme-accent/15 text-theme-accent border-theme-accent/30 shrink-0 rounded-full border px-2 py-1 font-mono text-[10px] font-semibold tracking-wide uppercase">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-theme-text-muted min-h-[104px] font-mono text-xs leading-relaxed sm:min-h-[112px]">
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
                        key={feature}
                        className="text-theme-text-secondary flex items-start gap-2 font-mono text-[11px]"
                      >
                        <Check className="text-theme-accent mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/billing?plan=${plan.id}`}
                    className="bg-theme-accent/10 border-theme-accent/40 text-theme-accent mt-auto rounded-md border px-3 py-2 text-center font-mono text-xs font-semibold"
                  >
                    subscribe --{plan.id}
                  </Link>
                </article>
              ))}
            </div>

            <p className="text-theme-text-muted text-center font-mono text-xs">
              Need to rotate key or manage existing subscription? Go to{' '}
              <Link href="/billing" className="text-theme-accent underline">
                /billing
              </Link>
              .
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-theme-border/30 border-t py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-12 text-center font-mono">
              <span className="text-theme-text-muted text-sm">&gt; api</span>
              <span className="text-theme-text ml-2 text-2xl font-bold md:text-3xl">
                --endpoints
              </span>
            </h2>

            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
              {API_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group border-theme-border/50 bg-theme-card-bg/30 hover:border-theme-accent/30 rounded-sm border p-5 transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon with terminal label */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="bg-theme-accent/10 border-theme-accent/20 rounded-sm border p-2.5">
                          <Icon className="text-theme-accent h-5 w-5" />
                        </div>
                        <span className="text-theme-accent/70 font-mono text-[9px]">
                          {feature.label}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-theme-text mb-1.5 font-mono font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-theme-text-muted font-mono text-xs leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Code Example Section */}
        <section className="border-theme-border/30 border-t py-16">
          <div className="container mx-auto px-6">
            <h2 className="mb-8 text-center font-mono">
              <span className="text-theme-text-muted text-sm">&gt;</span>
              <span className="text-theme-text ml-2 text-2xl font-bold">
                quick_start
              </span>
            </h2>

            <div className="mx-auto max-w-2xl">
              {/* Terminal-style code block */}
              <div className="border-theme-border/70 bg-theme-card-bg overflow-hidden rounded-sm border">
                {/* Terminal header */}
                <div className="border-theme-border/50 bg-theme-bg/50 flex items-center gap-2 border-b px-4 py-2.5">
                  <span className="text-theme-text-muted font-mono text-[10px] tracking-wider uppercase">
                    example --request
                  </span>
                </div>
                <pre className="overflow-x-auto p-4">
                  <code className="text-theme-text-secondary font-mono text-xs sm:text-sm">
                    <span className="text-theme-text-muted">
                      # Get wallet portfolio data
                    </span>
                    {'\n'}
                    <span className="text-theme-accent">curl</span> -H{' '}
                    <span className="text-[#ffb000]">
                      &quot;x-api-key: YOUR_API_KEY&quot;
                    </span>{' '}
                    \{'\n'}
                    {'  '}https://api.hyperfolio.xyz/v1/wallet/
                    <span className="text-[#b4ff00]">{'{address}'}</span>
                    {'\n'}
                    {'\n'}
                    <span className="text-theme-text-muted">
                      # Response includes:
                    </span>
                    {'\n'}
                    <span className="text-theme-text-muted">
                      # - Token balances with USD values
                    </span>
                    {'\n'}
                    <span className="text-theme-text-muted">
                      # - NFT holdings
                    </span>
                    {'\n'}
                    <span className="text-theme-text-muted">
                      # - DeFi positions
                    </span>
                    {'\n'}
                    <span className="text-theme-text-muted">
                      # - Transaction history
                    </span>
                  </code>
                </pre>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href="https://api.hyperfolio.xyz/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-theme-accent hover:text-theme-accent/80 inline-flex items-center gap-2 font-mono text-sm transition-colors"
              >
                <span>&gt;</span>
                <span>explore --full-docs</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </section>
      </main>
      <SeoFooter />
    </div>
  );
}
