// API Security - HMAC signing for internal API requests
// This ensures only authorized internal requests can access the API routes
import { createHmac, timingSafeEqual } from 'crypto'

// Secret key for signing internal requests (must be set in environment)
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || ''

// Token validity duration (5 minutes)
const TOKEN_VALIDITY_MS = 5 * 60 * 1000

/**
 * Generate a signed token for internal API requests
 * This token should be included in the x-internal-token header
 */
export function generateInternalToken(): string {
  if (!INTERNAL_API_SECRET) {
    console.warn('[API Security] INTERNAL_API_SECRET not set - internal tokens disabled')
    return ''
  }

  const timestamp = Date.now().toString()
  const signature = createHmac('sha256', INTERNAL_API_SECRET)
    .update(timestamp)
    .digest('hex')

  // Return as base64-encoded JSON for easy transport
  return Buffer.from(JSON.stringify({ t: timestamp, s: signature })).toString('base64')
}

/**
 * Verify an internal API token
 * Returns true if the token is valid and not expired
 */
export function verifyInternalToken(token: string): boolean {
  if (!INTERNAL_API_SECRET) {
    // If no secret is configured, allow all requests (development mode)
    console.warn('[API Security] INTERNAL_API_SECRET not set - skipping token verification')
    return true
  }

  if (!token) {
    return false
  }

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'))
    const { t: timestamp, s: signature } = decoded

    if (!timestamp || !signature) {
      return false
    }

    // Check token age
    const tokenAge = Date.now() - parseInt(timestamp, 10)
    if (tokenAge > TOKEN_VALIDITY_MS || tokenAge < 0) {
      console.warn('[API Security] Token expired or invalid timestamp')
      return false
    }

    // Verify signature using timing-safe comparison
    const expectedSignature = createHmac('sha256', INTERNAL_API_SECRET)
      .update(timestamp)
      .digest('hex')

    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false
    }

    return timingSafeEqual(signatureBuffer, expectedBuffer)
  } catch (error) {
    console.error('[API Security] Token verification error:', error)
    return false
  }
}

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
 * Security headers to add to internal API requests from the client
 */
export function getSecurityHeaders(): HeadersInit {
  return {
    'x-internal-token': generateInternalToken(),
    'x-requested-with': 'hyperfolio-internal',
  }
}

/**
 * Verify a request is authorized for internal API access
 * Combines token verification and origin checking
 */
export function verifyInternalRequest(
  internalToken: string | null,
  origin: string | null,
  referer: string | null,
  requestedWith: string | null
): { authorized: boolean; reason?: string } {
  // Check for internal request marker
  if (requestedWith !== 'hyperfolio-internal') {
    // Could be a direct browser request - check origin
    if (!isValidOrigin(origin, referer)) {
      return { authorized: false, reason: 'Invalid origin' }
    }
  }

  // If INTERNAL_API_SECRET is not set, we're in development mode
  if (!INTERNAL_API_SECRET) {
    return { authorized: true }
  }

  // Verify the internal token
  if (!internalToken || !verifyInternalToken(internalToken)) {
    // If no valid token but origin is valid, allow (for browser requests from our domain)
    if (isValidOrigin(origin, referer)) {
      return { authorized: true }
    }
    return { authorized: false, reason: 'Invalid or missing internal token' }
  }

  return { authorized: true }
}

