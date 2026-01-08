'use client';

import { useState } from 'react';

interface ProtocolLogoProps {
  src: string;
  name: string;
  className?: string;
}

/**
 * Protocol logo component with fallback handling
 * Displays protocol logo with graceful fallback to placeholder
 */
export function ProtocolLogo({ src, name, className = '' }: ProtocolLogoProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const fallbackSrc = '/placeholder-logo.svg';
  const imageSrc = hasError ? fallbackSrc : src;

  return (
    <img
      src={imageSrc}
      alt={`${name} logo`}
      onError={handleError}
      className={`ring-theme-border rounded ring-1 ${className}`}
    />
  );
}

