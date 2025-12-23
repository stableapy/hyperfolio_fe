// Client-side fetch wrapper with security headers
// This wrapper automatically adds security headers to all API requests

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>
}

/**
 * Generate a signed internal token for API requests (client-side version)
 * Uses Web Crypto API for HMAC signing
 */
async function generateClientToken(): Promise<string> {
  // Get the secret from a secure cookie or skip if not available
  // For client-side, we rely on origin verification as the primary security
  // The token provides additional security for programmatic requests
  const secret = typeof window !== 'undefined' 
    ? (window as unknown as { __INTERNAL_API_SECRET?: string }).__INTERNAL_API_SECRET 
    : undefined

  if (!secret) {
    return ''
  }

  try {
    const timestamp = Date.now().toString()
    const encoder = new TextEncoder()
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(timestamp)
    )

    const signature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return btoa(JSON.stringify({ t: timestamp, s: signature }))
  } catch (error) {
    console.error('[API Fetch] Token generation error:', error)
    return ''
  }
}

/**
 * Secure fetch wrapper for internal API calls
 * Automatically adds security headers for origin verification
 */
export async function secureFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const token = await generateClientToken()
  
  const securityHeaders: Record<string, string> = {
    'x-requested-with': 'hyperfolio-internal',
  }

  if (token) {
    securityHeaders['x-internal-token'] = token
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

