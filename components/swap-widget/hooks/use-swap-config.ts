import { useMemo } from "react"
import type { KyberSwapTheme, FeeSetting } from "../types"

/**
 * Hook that provides KyberSwap widget configuration (theme and fee settings)
 * Centralized configuration to ensure consistency between modal and inline variants
 */
export function useSwapConfig() {
  // KyberSwap Widget theme - matching Hyperfolio design system
  const theme: KyberSwapTheme = useMemo(() => ({
    // Background colors - matching terminal-card
    primary: "#0a0e0f",
    secondary: "#111618",
    dialog: "#0a0e0f",
    // Rounded corners
    borderRadius: "8px",
    buttonRadius: "8px",
    // Borders - matching terminal-card
    stroke: "#1a2225",
    interactive: "#1a2225",
    // Accent color - Hyperfolio green
    accent: "#00ff41",
    success: "#00ff41",
    warning: "#ffaa00",
    error: "#ff4444",
    // Text colors
    text: "#ffffff",
    subText: "#708090",
    // Typography - Geist Mono
    fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace",
    boxShadow: "none",
  }), [])

  // Fee configuration (0.15% = 15 bps)
  const feeSetting: FeeSetting = useMemo(() => ({
    feeAmount: 15,
    feeReceiver: "0x8A4a9A0B03E01AbE12e39e40fB14BbE625a0CF7A",
    chargeFeeBy: "currency_in" as const,
    isInBps: true,
  }), [])

  return { theme, feeSetting }
}

