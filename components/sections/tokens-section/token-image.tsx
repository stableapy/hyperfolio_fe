"use client"

import { useState } from "react"
import type { TokenImageProps } from "./types"

/**
 * Token image component with fallback for broken/missing images
 * Displays the first character of the symbol as fallback
 */
export function TokenImage({ src, symbol, className }: TokenImageProps) {
  const [hasError, setHasError] = useState(false)
  
  const defaultClassName = "w-7 h-7 rounded-full flex-shrink-0"
  const appliedClassName = className || defaultClassName
  
  if (!src || hasError) {
    return (
      <div className={`bg-[#1a2225] flex items-center justify-center ${appliedClassName}`}>
        <span className="font-mono text-xs text-[#708090]">
          {symbol?.charAt(0) || "?"}
        </span>
      </div>
    )
  }
  
  return (
    <img 
      src={src} 
      alt={symbol} 
      className={appliedClassName} 
      onError={() => setHasError(true)}
    />
  )
}

