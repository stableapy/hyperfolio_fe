'use client';

import { useState } from 'react';

interface PointImageProps {
  protocolName: string;
  className?: string;
}

export function PointImage({ protocolName, className }: PointImageProps) {
  const [hasError, setHasError] = useState(false);

  const getImageUrl = (name: string): { url: string; fallback: string } => {
    const normalizedName = name.toLowerCase().replace(/\s+/g, '');

    const extensionMap: Record<string, string> = {
      felix: 'felix.jpg',
      hyperdrive: 'hyperdrive.jpg',
      hyperlend: 'hyperlend.jpg',
      theo: 'theo.svg',
    };

    const url = extensionMap[normalizedName] || `${normalizedName}.png`;
    return { url, fallback: normalizedName.charAt(0).toUpperCase() };
  };

  const { url, fallback } = getImageUrl(protocolName);

  const defaultClassName = 'w-7 h-7 rounded-full flex-shrink-0';
  const appliedClassName = className || defaultClassName;

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-[#1a2225] ${appliedClassName}`}
      >
        <span className="font-mono text-xs text-[#708090]">{fallback}</span>
      </div>
    );
  }

  return (
    <img
      src={`/${url}`}
      alt={protocolName}
      className={appliedClassName}
      onError={() => setHasError(true)}
    />
  );
}
