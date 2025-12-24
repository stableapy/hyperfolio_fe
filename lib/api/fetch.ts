// Client-side fetch wrapper with signed token authentication
// This wrapper automatically adds the pre-signed API token to all requests

import { jwtVerify } from 'jose'

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

/**
 * Declare the global API token on the window object
 */
declare global {
  interface Window {
    __API_TOKEN?: string
    __API_TOKEN_EXP?: number
  }
}

/**
 * Token structure for internal HMAC-signed tokens
 * This is NOT a JWT but a custom signed format
 */
interface InternalToken {
  iat: number // Issued at timestamp (ms)
  exp: number // Expiration timestamp (ms)
  fp: string  // Fingerprint (User-Agent hash)
  sig: string // HMAC signature
}

/**
 * Parse and validate token structure
 * Validates both JWT tokens and internal HMAC-signed tokens
 *
 * @param token - The token string to validate
 * @returns Parsed token payload or null if invalid
 */
function parseTokenPayload(token: string): { iat: number; exp: number } | null {
  try {
    // Try parsing as JWT first (standard format: header.payload.signature)
    const parts = token.split('.')
    if (parts.length === 3) {
      // JWT format - decode payload (second part)
      const payload = JSON.parse(atob(parts[1]))
      if (payload.iat && payload.exp) {
        return { iat: payload.iat, exp: payload.exp }
      }
    }

    // Try parsing as internal HMAC-signed token (base64-encoded JSON)
    const decoded: InternalToken = JSON.parse(atob(token))
    if (decoded.iat && decoded.exp) {
      return { iat: decoded.iat, exp: decoded.exp }
    }

    return null
  } catch {
    return null
  }
}

/**
 * Verify JWT token signature
 * Only works for JWT format tokens
 *
 * @param token - The JWT token to verify
 * @returns True if signature is valid
 */
async function verifyJwtSignature(token: string): Promise<boolean> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      return false // Not a JWT
    }

    const secret = new TextEncoder().encode(
      process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || ''
    )

    if (!secret || secret.length === 0) {
      // No secret configured - allow in development
      return true
    }

    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

/**
 * Verify internal HMAC-signed token
 * This validates the signature structure (full verification happens server-side)
 *
 * @param token - The internal token to verify
 * @returns True if token structure is valid
 */
async function verifyInternalToken(token: string): Promise<boolean> {
  try {
    const decoded: InternalToken = JSON.parse(atob(token))

    // Validate required fields
    if (!decoded.iat || !decoded.exp || !decoded.fp || !decoded.sig) {
      return false
    }

    const now = Date.now()

    // Check expiration
    if (now > decoded.exp) {
      return false
    }

    // Check if token was issued in the future (with 5s clock skew allowance)
    if (decoded.iat > now + 5000) {
      return false
    }

    // Note: We can't fully verify signature client-side without exposing the secret
    // The server will do full signature verification
    return true
  } catch {
    return false
  }
}

/**
 * Verify token validity (structure and expiration)
 * Supports both JWT and internal HMAC-signed tokens
 *
 * @param token - The token to verify
 * @returns True if token is valid
 */
async function verifyToken(token: string): Promise<boolean> {
  if (!token) {
    return false
  }

  const parts = token.split('.')
  if (parts.length === 3) {
    return verifyJwtSignature(token)
  }

  return verifyInternalToken(token)
}

/**
 * Get the current API token
 * The token is set by the TokenProvider component on page load
 */
function getApiToken(): string {
  if (typeof window === 'undefined') {
    // Server-side - no token available
    return ''
  }

  return window.__API_TOKEN || ''
}

/**
 * Check if the current token is expired or close to expiry
 */
async function isTokenExpired(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return true
  }

  const token = window.__API_TOKEN
  if (!token) {
    return true
  }

  const payload = parseTokenPayload(token)
  if (!payload) {
    return true
  }

  // Convert to milliseconds if needed (JWT uses seconds, internal uses ms)
  const exp = payload.exp > 1000000000000 ? payload.exp : payload.exp * 1000
  const now = Date.now()

  // Consider expired if less than 30 seconds remaining
  return exp < (now + 30000)
}

/**
 * Attempt to refresh the token if it's expired
 * Returns true if refresh was successful
 */
async function tryRefreshToken(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    const response = await fetch('/api/auth/token', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'x-api-token': getApiToken(),
      },
    })

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    if (data.token) {
      // Verify token before accepting it
      if (!(await verifyToken(data.token))) {
        console.warn('[fetch] Received invalid token from refresh endpoint')
        return false
      }

      window.__API_TOKEN = data.token

      // Parse expiration from token
      const payload = parseTokenPayload(data.token)
      if (payload) {
        // Convert to milliseconds if needed (JWT uses seconds, internal uses ms)
        const exp = payload.exp > 1000000000000 ? payload.exp : payload.exp * 1000
        window.__API_TOKEN_EXP = exp
      } else {
        // Fallback to provided expiresIn
        window.__API_TOKEN_EXP = Date.now() + ((data.expiresIn ?? 600) * 1000)
      }
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Secure fetch wrapper for internal API calls
 * Automatically adds the signed API token for authentication
 */
export async function secureFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  // Check if token needs refresh before making the request
  if (await isTokenExpired()) {
    await tryRefreshToken()
  }

  const token = getApiToken()
  
  const securityHeaders: Record<string, string> = {
    'x-requested-with': 'hyperfolio-internal',
  }

  if (token) {
    securityHeaders['x-api-token'] = token
  }

  const headers = {
    ...securityHeaders,
    ...options.headers,
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

/**
 * Convenience method for GET requests
 */
export async function secureGet(url: string): Promise<Response> {
  return secureFetch(url, { method: 'GET' })
}

/**
 * Convenience method for POST requests with JSON body
 */
export async function securePost(
  url: string,
  body: unknown
): Promise<Response> {
  return secureFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

/**
 * Type-safe JSON fetch wrapper
 */
export async function secureJsonFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await secureFetch(url, options)
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`)
  }
  
  return response.json()
}
