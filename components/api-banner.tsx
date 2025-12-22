"use client"

import { useState, useEffect } from "react"
import { Zap, ExternalLink, Code2 } from "lucide-react"

export function ApiBanner() {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Small delay for entrance animation
    const timer = setTimeout(() => {
      setIsAnimating(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`relative z-50 overflow-hidden transition-all duration-300 ease-out ${
        isAnimating ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      }`}
    >
      {/* Background with animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1214] via-[#00ff41]/5 to-[#0d1214]" />
      
      {/* Animated scanline effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 65, 0.03) 2px, rgba(0, 255, 65, 0.03) 4px)',
          animation: 'scanline 8s linear infinite',
        }}
      />

      {/* Content */}
      <div className="relative px-4 py-2.5 sm:py-2">
        <div className="container mx-auto flex items-center justify-center gap-3 sm:gap-4">
          {/* Icon with pulse animation */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Code2 className="w-4 h-4 text-[#00ff41]" />
              <div className="absolute inset-0 animate-ping">
                <Code2 className="w-4 h-4 text-[#00ff41] opacity-40" />
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="flex items-center gap-2 sm:gap-3 text-center">
            <span className="font-mono text-[10px] sm:text-xs text-[#708090] uppercase tracking-wider">
              <span className="text-[#00ff41] font-semibold">Hyperfolio API</span>
              <span className="hidden sm:inline"> — Build on HyperEVM data</span>
            </span>
            
            <span className="text-[#1a2225]">|</span>
            
            {/* CTA Link */}
            <a
              href="https://api.hyperfolio.xyz/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#00ff41]/30 bg-[#00ff41]/10 hover:bg-[#00ff41]/20 hover:border-[#00ff41]/50 transition-all"
            >
              <Zap className="w-3 h-3 text-[#00ff41]" />
              <span className="font-mono text-[10px] sm:text-xs text-[#00ff41] font-semibold">
                View Docs
              </span>
              <ExternalLink className="w-3 h-3 text-[#00ff41] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom border with glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff41]/40 to-transparent" />

      {/* Keyframes for scanline animation */}
      <style jsx>{`
        @keyframes scanline {
          0% { background-position: 0 0; }
          100% { background-position: 0 100vh; }
        }
      `}</style>
    </div>
  )
}
