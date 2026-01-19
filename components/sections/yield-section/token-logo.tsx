'use client';

interface TokenLogoProps {
  src: string;
  symbol: string;
  className?: string;
}

/**
 * Token logo component with CSS-only fallback handling
 * Displays token logo with graceful fallback to first letter
 * Uses no useState to minimize per-item state overhead
 */
export function TokenLogo({
  src,
  symbol,
  className = '',
}: TokenLogoProps) {
  // If no src provided, show fallback immediately
  if (!src) {
    return (
      <div
        className={`bg-[#1a2225] flex items-center justify-center rounded-full ${className}`}
      >
        <span className="font-mono text-xs text-[#708090]">
          {symbol?.charAt(0) || '?'}
        </span>
      </div>
    );
  }

  // Use CSS-only error handling with direct DOM manipulation
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Hide the failed image
    e.currentTarget.style.display = 'none';
    // Show the fallback sibling div
    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <img
        src={src}
        alt={`${symbol} logo`}
        onError={handleError}
        className="ring-theme-border rounded-full ring-1"
      />
      {/* Fallback - hidden by default, shown via onError handler */}
      <div
        className="absolute inset-0 hidden items-center justify-center bg-[#1a2225] rounded-full"
        style={{ display: 'none' }}
      >
        <span className="font-mono text-xs text-[#708090]">
          {symbol?.charAt(0) || '?'}
        </span>
      </div>
    </div>
  );
}
