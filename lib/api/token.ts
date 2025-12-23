// Server-side signed token generation for API authentication
// This module generates tokens that are injected into the page on load
// Tokens are signed with HMAC and include fingerprint + expiration

import 'server-only'
import { createHmac, timingSafeEqual } from 'crypto'

// Secret key for signing tokens (must be set in environment)
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || ''

// Token configuration
const TOKEN_LIFETIME_MS = 10 * 60 * 1000 // 10 minutes
const TOKEN_REFRESH_THRESHOLD_MS = 2 * 60 * 1000 // Refresh when < 2 min left

/**
 * Token payload structure
 */
export interface TokenPayload {
  iat: number // Issued at timestamp (ms)
  exp: number // Expiration timestamp (ms)
  fp: string  // Fingerprint (User-Agent hash)
}

/**
 * Full token structure (payload + signature)
 */
interface SignedToken extends TokenPayload {
  sig: string // HMAC signature
}

/**
 * Generate a hash from User-Agent for fingerprinting
 * This adds an extra layer of protection against token theft
 */
export function generateFingerprint(userAgent: string | null): string {
  if (!userAgent || !INTERNAL_API_SECRET) {
    return 'default'
  }

  // Create a short hash of the User-Agent
  return createHmac('sha256', INTERNAL_API_SECRET)
    .update(userAgent)
    .digest('hex')
    .substring(0, 12) // Short hash for fingerprint
}

/**
 * Create HMAC signature for a token payload
 */
function signPayload(payload: TokenPayload): string {
  if (!INTERNAL_API_SECRET) {
    return ''
  }

  const data = `${payload.iat}:${payload.exp}:${payload.fp}`
  return createHmac('sha256', INTERNAL_API_SECRET)
    .update(data)
    .digest('hex')
}

/**
 * Generate a signed page token for API authentication
 * This token is generated server-side and injected into the page
 * 
 * @param userAgent - The User-Agent header from the request
 * @returns Base64-encoded signed token
 */
export function generatePageToken(userAgent: string | null): string {
  if (!INTERNAL_API_SECRET) {
    console.warn('[Token] INTERNAL_API_SECRET not set - token generation disabled')
    return ''
  }

  const now = Date.now()
  const payload: TokenPayload = {
    iat: now,
    exp: now + TOKEN_LIFETIME_MS,
    fp: generateFingerprint(userAgent),
  }

  const signature = signPayload(payload)

  const token: SignedToken = {
    ...payload,
    sig: signature,
  }

  // Encode as base64 for safe transport
  return Buffer.from(JSON.stringify(token)).toString('base64')
}

/**
 * Verify a signed token
 * Checks signature validity, expiration, and fingerprint match
 * 
 * @param token - The base64-encoded token
 * @param userAgent - The User-Agent from the current request
 * @returns Object with validation result and reason if invalid
 */
export function verifyPageToken(
  token: string | null,
  userAgent: string | null
): { valid: boolean; reason?: string; needsRefresh?: boolean } {
  // If no secret configured, allow all (development mode)
  if (!INTERNAL_API_SECRET) {
    console.warn('[Token] INTERNAL_API_SECRET not set - skipping token verification')
    return { valid: true }
  }

  if (!token) {
    return { valid: false, reason: 'Missing token' }
  }

  try {
    // Decode token
    const decoded: SignedToken = JSON.parse(
      Buffer.from(token, 'base64').toString('utf-8')
    )

    const { iat, exp, fp, sig } = decoded

    // Validate required fields
    if (!iat || !exp || !fp || !sig) {
      return { valid: false, reason: 'Malformed token' }
    }

    const now = Date.now()

    // Check expiration
    if (now > exp) {
      return { valid: false, reason: 'Token expired' }
    }

    // Check if token was issued in the future (clock skew protection)
    // Allow 5 seconds of clock skew
    if (iat > now + 5000) {
      return { valid: false, reason: 'Token issued in future' }
    }

    // Verify fingerprint matches current request
    const expectedFp = generateFingerprint(userAgent)
    if (fp !== expectedFp) {
      return { valid: false, reason: 'Fingerprint mismatch' }
    }

    // Verify signature
    const payload: TokenPayload = { iat, exp, fp }
    const expectedSig = signPayload(payload)

    // Use timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(sig, 'hex')
    const expectedBuffer = Buffer.from(expectedSig, 'hex')

    if (sigBuffer.length !== expectedBuffer.length) {
      return { valid: false, reason: 'Invalid signature' }
    }

    if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
      return { valid: false, reason: 'Invalid signature' }
    }

    // Check if token needs refresh (< 2 min remaining)
    const needsRefresh = (exp - now) < TOKEN_REFRESH_THRESHOLD_MS

    return { valid: true, needsRefresh }
  } catch (error) {
    console.error('[Token] Verification error:', error)
    return { valid: false, reason: 'Token decode error' }
  }
}

/**
 * Get token expiration time in seconds
 * Used for cache headers
 */
export function getTokenLifetimeSeconds(): number {
  return Math.floor(TOKEN_LIFETIME_MS / 1000)
}

/**
 * Check if INTERNAL_API_SECRET is configured
 */
export function isSecretConfigured(): boolean {
  return Boolean(INTERNAL_API_SECRET)
}

