// Client-side fetch wrapper with signed token authentication
// This wrapper automatically adds the pre-signed API token to all requests

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
function isTokenExpired(): boolean {
  if (typeof window === 'undefined') {
    return true
  }

  const exp = window.__API_TOKEN_EXP || 0
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
      window.__API_TOKEN = data.token
      // Parse expiration from token
      try {
        const decoded = JSON.parse(atob(data.token))
        window.__API_TOKEN_EXP = decoded.exp || 0
      } catch {
        window.__API_TOKEN_EXP = Date.now() + (data.expiresIn * 1000)
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
  if (isTokenExpired()) {
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
