'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const target = sessionId
      ? `/billing?session_id=${encodeURIComponent(sessionId)}`
      : '/billing';

    router.replace(target);
  }, [router, searchParams]);

  return (
    <main className="bg-theme-bg min-h-screen">
      <section className="container mx-auto max-w-3xl px-6 py-14">
        <p className="text-theme-accent mb-2 font-mono text-xs">
          &gt; billing/success
        </p>
        <h1 className="text-theme-text-primary font-mono text-3xl font-bold">
          Redirecting...
        </h1>
        <p className="text-theme-text-secondary mt-3 font-mono text-sm">
          Sending you back to `/billing`.
        </p>
      </section>
    </main>
  );
}
