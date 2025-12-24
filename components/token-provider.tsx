'use client'

import { useEffect, useCallback, useRef } from 'react'

// Token refresh interval (check every minute)
const REFRESH_CHECK_INTERVAL_MS = 60 * 1000

// Refresh when token has less than this much time left
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000

/**
 * Declare the global API token on the window object
 */
declare global {
  interface Window {
    __API_TOKEN?: string
    __API_TOKEN_EXP?: number
  }
}

interface TokenProviderProps {
  initialToken: string
}

/**
 * TokenProvider - Client component that manages API token lifecycle
 * 
 * - Receives initial token from server
 * - Sets it on window.__API_TOKEN for client-side fetches
 * - Refreshes token before expiration
 */
export function TokenProvider({ initialToken }: TokenProviderProps) {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Extract expiration time from token
   */
  const getTokenExp = useCallback((token: string): number => {
    try {
      const decoded = JSON.parse(atob(token))
      return decoded.exp || 0
    } catch {
      return 0
    }
  }, [])

  /**
   * Refresh the token from the server
   */
  const refreshToken = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/token', {
        method: 'POST',
        credentials: 'same-origin',
      })

      if (!response.ok) {
        console.warn('[TokenProvider] Failed to refresh token:', response.status)
        return false
      }

      const data = await response.json()
      if (data.token) {
        window.__API_TOKEN = data.token
        window.__API_TOKEN_EXP = getTokenExp(data.token)
        return true
      }

      return false
    } catch (error) {
      console.error('[TokenProvider] Token refresh error:', error)
      return false
    }
  }, [getTokenExp])

  /**
   * Check if token needs refresh and schedule next check
   */
  const checkAndRefresh = useCallback(async () => {
    const exp = window.__API_TOKEN_EXP || 0
    const now = Date.now()
    const timeLeft = exp - now

    // Refresh if token expires in less than 2 minutes
    if (timeLeft < REFRESH_THRESHOLD_MS) {
      await refreshToken()
    }

    // Schedule next check
    refreshTimeoutRef.current = setTimeout(checkAndRefresh, REFRESH_CHECK_INTERVAL_MS)
  }, [refreshToken])

  /**
   * Initialize token on mount
   */
  useEffect(() => {
    // Set initial token
    if (initialToken) {
      window.__API_TOKEN = initialToken
      window.__API_TOKEN_EXP = getTokenExp(initialToken)
    }

    // Start refresh cycle
    refreshTimeoutRef.current = setTimeout(checkAndRefresh, REFRESH_CHECK_INTERVAL_MS)

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, [initialToken, getTokenExp, checkAndRefresh])

  // This component doesn't render anything
  return null
}






