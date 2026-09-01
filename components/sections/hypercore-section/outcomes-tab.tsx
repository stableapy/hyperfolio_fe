'use client';

import { formatCompactValue, formatPrice } from './utils';
import type { OutcomesTabProps } from './types';

export function OutcomesTab({ balances, privacyMode }: OutcomesTabProps) {
  const outcomes = balances.filter(
    (balance) =>
      balance.assetKind === 'outcome' && parseFloat(balance.total) > 0
  );

  if (outcomes.length === 0) {
    return (
      <div className="py-8 text-center sm:py-12">
        <div className="text-theme-text-secondary mb-2 font-mono text-sm sm:text-base">
          NO OUTCOME POSITIONS
        </div>
        <div className="text-theme-text-muted font-mono text-xs sm:text-sm">
          <span className="text-theme-cyan">&gt;</span> hypercore --outcomes
          returns empty
        </div>
      </div>
    );
  }

  return (
    <div className="divide-theme-border/30 divide-y">
      {outcomes.map((balance) => {
        const outcome = balance.outcome;
        const isYes = outcome?.side === 0;
        const quantity = parseFloat(balance.total);
        const price = parseFloat(balance.usdPrice);
        const value = parseFloat(balance.usdValue);
        return (
          <div
            key={`${balance.token}-${outcome?.side ?? 0}`}
            className="hover:bg-theme-cyan/5 hover:border-l-theme-cyan border-l-2 border-l-transparent px-3 py-4 transition-all sm:px-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-theme-cyan mt-0.5 font-mono text-sm font-bold">
                &gt;
              </span>
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-theme-text-primary font-mono text-sm font-bold sm:text-base">
                      {outcome?.marketName || balance.name}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                          isYes
                            ? 'border-theme-green/20 bg-theme-green/10 text-theme-green'
                            : 'border-theme-magenta/20 bg-theme-magenta/10 text-theme-magenta'
                        }`}
                      >
                        {outcome?.sideName || balance.symbol}
                      </span>
                      <span className="border-theme-cyan/20 bg-theme-cyan/10 text-theme-cyan border px-1.5 py-0.5 font-mono text-[9px] font-bold">
                        HIP-4
                      </span>
                      {outcome?.isSettled !== null &&
                        outcome?.isSettled !== undefined && (
                          <span className="border-theme-border text-theme-text-muted border px-1.5 py-0.5 font-mono text-[9px] uppercase">
                            {outcome.isSettled ? 'settled' : 'open'}
                          </span>
                        )}
                    </div>
                  </div>
                  <div className="text-theme-cyan shrink-0 text-right font-mono text-sm font-bold tabular-nums sm:text-base">
                    {privacyMode ? '•••' : `$${formatCompactValue(value)}`}
                    <div className="text-theme-text-muted mt-0.5 text-[9px] font-normal uppercase">
                      position value
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  <div className="border-theme-border/50 bg-theme-card-bg border px-2.5 py-2">
                    <div className="text-theme-text-muted font-mono text-[9px] uppercase">
                      shares
                    </div>
                    <div className="text-theme-text-primary mt-0.5 font-mono text-xs font-bold tabular-nums">
                      {formatCompactValue(quantity)}
                    </div>
                  </div>
                  <div className="border-theme-border/50 bg-theme-card-bg border px-2.5 py-2">
                    <div className="text-theme-text-muted font-mono text-[9px] uppercase">
                      mark price
                    </div>
                    <div className="text-theme-text-primary mt-0.5 font-mono text-xs font-bold tabular-nums">
                      ${formatPrice(price)}
                    </div>
                  </div>
                  <div className="border-theme-border/50 bg-theme-card-bg col-span-2 border px-2.5 py-2 sm:col-span-1">
                    <div className="text-theme-text-muted font-mono text-[9px] uppercase">
                      quote asset
                    </div>
                    <div className="text-theme-text-primary mt-0.5 font-mono text-xs font-bold">
                      {outcome?.quoteToken || 'USDC'}
                    </div>
                  </div>
                </div>

                <details className="group">
                  <summary className="text-theme-text-muted hover:text-theme-cyan cursor-pointer list-none font-mono text-[10px]">
                    <span className="group-open:hidden">+ market details</span>
                    <span className="hidden group-open:inline">
                      − market details
                    </span>
                  </summary>
                  <div className="border-theme-border/40 text-theme-text-muted mt-2 space-y-2 border-l pl-3 font-mono text-[10px] sm:text-[11px]">
                    {outcome?.description && <p>{outcome.description}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {outcome?.templateId && (
                        <span>template: {outcome.templateId}</span>
                      )}
                      {outcome?.category && (
                        <span>category: {outcome.category}</span>
                      )}
                      {outcome?.expiry && <span>expiry: {outcome.expiry}</span>}
                      {outcome?.venue && <span>venue: {outcome.venue}</span>}
                      {outcome?.questionId !== null &&
                        outcome?.questionId !== undefined && (
                          <span>
                            question #{outcome.questionId} ·{' '}
                            {outcome.questionRole}
                          </span>
                        )}
                      {outcome?.feeScale && (
                        <span>fee scale: {outcome.feeScale}</span>
                      )}
                      {outcome?.deployerFeeScale && (
                        <span>deployer fee: {outcome.deployerFeeScale}</span>
                      )}
                      {outcome?.venueDeployer && (
                        <span>
                          deployer: {outcome.venueDeployer.address.slice(0, 8)}…
                        </span>
                      )}
                    </div>
                  </div>
                </details>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
