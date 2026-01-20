/**
 * Number of skeleton items to display during loading
 */
const SKELETON_ITEM_COUNT = 7;

/**
 * YieldListSkeleton Component
 * Displays skeleton loading state for yield opportunities list
 */
export function YieldListSkeleton() {
  return (
    <>
      {Array.from({ length: SKELETON_ITEM_COUNT }, (_, i) => i + 1).map((i) => (
        <div key={i} className="animate-pulse px-3 py-3 sm:px-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Protocol and Token */}
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex h-4 w-48 items-center gap-2">
                <div className="bg-theme-border/30 h-full w-32 rounded" />
                <div className="bg-theme-border/20 h-3 w-12 rounded" />
              </div>
              <div className="flex h-3 w-24 items-center gap-2">
                <div className="bg-theme-border/30 h-full w-16 rounded" />
                <div className="bg-theme-border/20 h-3 w-10 rounded" />
              </div>
            </div>

            {/* Middle: APY */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="bg-theme-border/20 mb-1 h-3 w-8 rounded" />
              <div className="bg-theme-border/30 h-5 w-20 rounded" />
            </div>

            {/* Right: Risk */}
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="bg-theme-border/20 mb-1 h-3 w-6 rounded" />
              <div className="bg-theme-border/30 h-5 w-16 rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
