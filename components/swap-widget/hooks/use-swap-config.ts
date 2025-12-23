import { useMemo } from "react"
import { useTheme } from "next-themes"
import type { KyberSwapTheme, FeeSetting } from "../types"

/**
 * Hook that provides KyberSwap widget configuration (theme and fee settings)
 * Centralized configuration to ensure consistency between modal and inline variants
 * Automatically adapts to the current light/dark theme
 */
export function useSwapConfig() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // KyberSwap Widget theme - adapts to light/dark mode
  const theme: KyberSwapTheme = useMemo(() => {
    if (isDark) {
      // Dark theme matching Hyperfolio dark mode
      return {
        // Background colors - dark theme
        primary: "#1a2225",
        secondary: "#0d1214",
        dialog: "#1a2225",
        // Rounded corners
        borderRadius: "12px",
        buttonRadius: "10px",
        // Borders - subtle dark borders with green accent
        stroke: "rgba(0, 255, 65, 0.2)",
        interactive: "rgba(0, 255, 65, 0.15)",
        // Accent color - Hyperfolio green
        accent: "#00ff41",
        success: "#00ff41",
        warning: "#e6a700",
        error: "#dc3545",
        // Text colors - light on dark
        text: "#ffffff",
        subText: "#708090",
        // Typography - Geist Mono
        fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
      }
    }
    
    // Light theme matching Hyperfolio light mode
    return {
      // Background colors - light theme
      primary: "#ffffff",
      secondary: "#f5f8f5",
      dialog: "#ffffff",
      // Rounded corners
      borderRadius: "12px",
      buttonRadius: "10px",
      // Borders - subtle light borders
      stroke: "rgba(0, 80, 20, 0.12)",
      interactive: "rgba(0, 80, 20, 0.15)",
      // Accent color - Hyperfolio green
      accent: "#00cc33",
      success: "#00cc33",
      warning: "#e6a700",
      error: "#dc3545",
      // Text colors - dark on light
      text: "#0a1a0f",
      subText: "#3d5a47",
      // Typography - Geist Mono
      fontFamily: "'Geist Mono', 'SF Mono', 'Fira Code', monospace",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    }
  }, [isDark])

  // Fee configuration (0.1% = 10 bps)
  const feeSetting: FeeSetting = useMemo(() => ({
    feeAmount: 10,
    feeReceiver: "0x8A4a9A0B03E01AbE12e39e40fB14BbE625a0CF7A",
    chargeFeeBy: "currency_in" as const,
    isInBps: true,
  }), [])

  // Default slippage tolerance (0.1%) 10 bps
  const defaultSlippage = 10

  // Use exact token allowance instead of infinite (more secure)
  const exactAmount = true

  return { theme, feeSetting, defaultSlippage, exactAmount }
}

