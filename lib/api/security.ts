// API Security - Re-exports from token module and origin validation utilities
// This file provides backwards compatibility and additional security utilities

import 'server-only'

// Re-export token functions from the new token module
export { 
  generatePageToken, 
  verifyPageToken, 
  generateFingerprint,
  getTokenLifetimeSeconds,
  isSecretConfigured,
  type TokenPayload 
} from './token'

/**
 * Legacy function - generate internal token for server-to-server requests
 * Uses the new signed token format
 * @deprecated Use generatePageToken instead
 */
export { generatePageToken as generateInternalToken } from './token'

/**
 * Check if the request origin is from a trusted source
 * This is a secondary check to complement token verification
 */
export function isValidOrigin(origin: string | null, referer: string | null): boolean {
  // Allow requests with no origin (server-side requests, same-origin, etc.)
  if (!origin && !referer) {
    return true
  }

  // Get allowed origins from environment
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hyperfolio.xyz',
    'https://www.hyperfolio.xyz',
  ].filter(Boolean) as string[]

  // Check origin header
  if (origin) {
    return allowedOrigins.some(allowed => origin.startsWith(allowed))
  }

  // Check referer header as fallback
  if (referer) {
    return allowedOrigins.some(allowed => referer.startsWith(allowed))
  }

  return false
}

/**
 * Get security headers for API responses
 */
export function getSecurityResponseHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  }
}
