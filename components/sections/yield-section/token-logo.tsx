'use client';

import { useState } from 'react';

interface TokenLogoProps {
  src: string;
  symbol: string;
  className?: string;
}

/**
 * Token logo component with fallback handling
 * Displays token logo with graceful fallback to first letter
 */
export function TokenLogo({ src, symbol, className = '' }: TokenLogoProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  // If no src or error, show fallback with first letter
  if (!src || hasError) {
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

  return (
    <img
      src={src}
      alt={`${symbol} logo`}
      onError={handleError}
      className={`ring-theme-border rounded-full ring-1 ${className}`}
    />
  );
}
