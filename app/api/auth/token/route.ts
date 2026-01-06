// Token refresh endpoint
// Generates a new signed token for authenticated clients

import { NextRequest, NextResponse } from 'next/server'
import { generatePageToken, getTokenLifetimeSeconds, verifyPageToken } from '@/lib/api/token'

/**
 * POST /api/auth/token
 * 
 * Refreshes the API token for the current session.
 * Only accepts requests from valid origins and optionally validates existing token.
 */
export async function POST(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const existingToken = request.headers.get('x-api-token')

  // Validate origin - only allow requests from our domains
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hyperfolio.xyz',
    'https://www.hyperfolio.xyz',
  ].filter(Boolean) as string[]

  const isValidOrigin =
    !origin ||
    allowedOrigins.some((allowed) => origin.startsWith(allowed)) ||
    (referer && allowedOrigins.some((allowed) => referer.startsWith(allowed)))

  if (!isValidOrigin) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    )
  }

  // If an existing token is provided, validate it (allows for seamless refresh)
  // Even if expired, we allow refresh if the fingerprint matches
  if (existingToken) {
    const verification = verifyPageToken(existingToken, userAgent)
    
    // If the fingerprint doesn't match, reject the refresh
    if (!verification.valid && verification.reason === 'Fingerprint mismatch') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }
  }

  // Generate new token
  const newToken = generatePageToken(userAgent)

  if (!newToken) {
    // No secret configured - return empty token (development mode)
    return NextResponse.json(
      { token: '', expiresIn: 0 }
    )
  }

  return NextResponse.json(
    {
      token: newToken,
      expiresIn: getTokenLifetimeSeconds(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      },
    }
  )
}











