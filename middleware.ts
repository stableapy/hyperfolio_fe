// Middleware to protect API routes from unauthorized external access
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting map (in-memory - resets on restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // 100 requests per minute per IP

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

/**
 * Check rate limit for an IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 }
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count }
}

/**
 * Verify HMAC token (simplified version for Edge runtime)
 * Note: Full crypto verification happens in the route handlers
 */
async function verifyToken(token: string, secret: string): Promise<boolean> {
  if (!secret || !token) {
    return !secret // Allow if no secret configured (dev mode)
  }

  try {
    const decoded = JSON.parse(atob(token))
    const { t: timestamp, s: signature } = decoded

    if (!timestamp || !signature) {
      return false
    }

    // Check token age (5 minutes)
    const tokenAge = Date.now() - parseInt(timestamp, 10)
    if (tokenAge > 5 * 60 * 1000 || tokenAge < 0) {
      return false
    }

    // Verify signature using Web Crypto API (Edge runtime compatible)
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

    const expectedSignature = Array.from(new Uint8Array(signatureBytes))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    return signature === expectedSignature
  } catch (error) {
    console.error('[Middleware] Token verification error:', error)
    return false
  }
}

/**
 * Check if origin is valid
 */
function isValidOrigin(origin: string | null, referer: string | null): boolean {
  // Server-side requests typically don't have origin/referer
  if (!origin && !referer) {
    return true
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hyperfolio.xyz',
    'https://www.hyperfolio.xyz',
  ].filter(Boolean) as string[]

  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return true
  }

  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return true
  }

  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Allow health check endpoint without authentication
  if (pathname === '/api/health') {
    return NextResponse.next()
  }

  // Get request info
  const clientIP = getClientIP(request)
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const internalToken = request.headers.get('x-internal-token')
  const requestedWith = request.headers.get('x-requested-with')
  const secret = process.env.INTERNAL_API_SECRET || ''

  // Apply rate limiting
  const rateLimit = checkRateLimit(clientIP)
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': '0',
        }
      }
    )
  }

  // Check if this is an internal request with valid token
  if (requestedWith === 'hyperfolio-internal' && internalToken) {
    const isValidToken = await verifyToken(internalToken, secret)
    if (isValidToken) {
      const response = NextResponse.next()
      response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())
      return response
    }
  }

  // Check origin for browser requests
  if (!isValidOrigin(origin, referer)) {
    console.warn(`[Middleware] Blocked request from unauthorized origin: ${origin || referer || 'unknown'}`)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // Add security headers to response
  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString())

  return response
}

export const config = {
  matcher: '/api/:path*',
}

