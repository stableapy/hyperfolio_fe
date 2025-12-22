/**
 * Empty state component when no DeFi positions are found
 */
export function DefiEmptyState() {
  return (
    <div className="text-center py-8 sm:py-12">
      <div className="font-mono text-xs sm:text-sm text-[#708090] mb-1 sm:mb-2">NO DEFI POSITIONS</div>
      <div className="font-mono text-[10px] sm:text-sm text-[#556070]">Start earning by depositing into DeFi protocols</div>
    </div>
  )
}

