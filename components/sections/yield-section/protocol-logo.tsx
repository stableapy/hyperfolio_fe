'use client';

interface ProtocolLogoProps {
  src: string;
  name: string;
  className?: string;
}

/**
 * Protocol logo component with CSS-only fallback handling
 * Displays protocol logo with graceful fallback to placeholder
 * Uses no useState to minimize per-item state overhead
 */
export function ProtocolLogo({
  src,
  name,
  className = '',
}: ProtocolLogoProps) {
  const fallbackSrc = '/placeholder.svg';

  // Use CSS-only error handling with direct DOM manipulation
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Replace src with fallback
    e.currentTarget.src = fallbackSrc;
  };

  return (
    <img
      src={src}
      alt={`${name} logo`}
      onError={handleError}
      className={`ring-theme-border rounded ring-1 ${className}`}
    />
  );
}
