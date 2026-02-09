import type { Metadata } from 'next';
import { BillingClient } from '@/components/subscriptions/billing-client';
import { SeoFooter } from '@/components/seo-footer';
import { SiteTopNav } from '@/components/site-top-nav';

export const metadata: Metadata = {
  title: 'Billing | Hyperfolio API',
  description:
    'Subscribe to Hyperfolio API plans via Stripe, retrieve your API key, and rotate it from one page.',
};

export default function BillingPage() {
  return (
    <div className="bg-theme-bg min-h-screen flex flex-col">
      <SiteTopNav current="billing" />
      <BillingClient />
      <SeoFooter />
    </div>
  );
}
