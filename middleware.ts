// Middleware to protect API routes with signed token authentication
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting map (in-memory - resets on restart)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // 100 requests per minute per IP


/**
 * Get CSP headers for the response
 * @returns Headers object with security values
 */
function getSecurityHeaders(): Record<string, string> {
  // Note: We use 'unsafe-inline' without nonce for script-src because:
  // 1. Next.js Script component has complex timing with nonce application
  // 2. 'unsafe-inline' is ignored when nonce is present, causing script blocking
  // 3. The eval is needed for Next.js development mode and some runtime features
  const cspHeader = [
    "default-src 'self'",
    // Scripts: self, inline scripts, eval for Next.js, Google Analytics & Tag Manager
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com",
    // Styles: allow inline for Tailwind/CSS-in-JS
    "style-src 'self' 'unsafe-inline'",
    // Images: self, data URLs, and common image CDNs
    "img-src 'self' data: https: blob:",
    // Fonts: self and data URLs
    "font-src 'self' data:",
    // Connect: self, analytics, API, Web3 providers, external services
    "connect-src 'self' https://api.hyperfolio.xyz https://rpc.hyperlend.finance https://www.google-analytics.com https://*.google-analytics.com https://*.walletconnect.com https://*.cloudfront.net https://raw.githubusercontent.com https://*.githubusercontent.com https://api.etherscan.io https://hyperliquid.xyz https://rpc.hyperliquid.xyz https://*.kyberswap.com https://analytics.google.com ws://localhost:* wss://localhost:* ws://127.0.0.1:* wss://127.0.0.1:*",
    // Media: self only
    "media-src 'self'",
    // Objects: none (prevent plugins)
    "object-src 'none'",
    // Base URI: self only
    "base-uri 'self'",
    // Form actions: self only
    "form-action 'self'",
    // Frame ancestors: prevent clickjacking
    "frame-ancestors 'none'",
    // Upgrade insecure requests
    'upgrade-insecure-requests',
  ].join('; ');

  return {
    'Content-Security-Policy': cspHeader,
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy':
      'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-XSS-Protection': '1; mode=block',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
  };
}

/**
 * Get client IP from request headers
 */
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

/**
 * Check rate limit for an IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

/**
 * Generate fingerprint from User-Agent using Web Crypto API
 */
async function generateFingerprint(
  userAgent: string | null,
  secret: string
): Promise<string> {
  if (!userAgent || !secret) {
    return 'default';
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBytes = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(userAgent)
    );

    // Return first 12 hex chars as fingerprint
    return Array.from(new Uint8Array(signatureBytes))
      .slice(0, 6)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch {
    return 'default';
  }
}

/**
 * Sign a payload using Web Crypto API (for fingerprint comparison)
 */
async function signPayload(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );

  return Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verify the new signed token format
 * Token structure: { iat, exp, fp, sig }
 */
async function verifySignedToken(
  token: string,
  userAgent: string | null,
  secret: string
): Promise<{ valid: boolean; reason?: string }> {
  if (!secret) {
    // Development mode - allow all
    return { valid: true };
  }

  if (!token) {
    return { valid: false, reason: 'Missing token' };
  }

  try {
    // Decode base64 token
    const decoded = JSON.parse(atob(token));
    const { iat, exp, fp, sig } = decoded;

    // Validate required fields
    if (!iat || !exp || !fp || !sig) {
      return { valid: false, reason: 'Malformed token' };
    }

    const now = Date.now();

    // Check expiration
    if (now > exp) {
      return { valid: false, reason: 'Token expired' };
    }

    // Check if token was issued in the future (with 5s clock skew allowance)
    if (iat > now + 5000) {
      return { valid: false, reason: 'Token issued in future' };
    }

    // Verify fingerprint matches current User-Agent
    const expectedFp = await generateFingerprint(userAgent, secret);
    if (fp !== expectedFp) {
      return { valid: false, reason: 'Fingerprint mismatch' };
    }

    // Verify signature
    const expectedSig = await signPayload(`${iat}:${exp}:${fp}`, secret);
    if (sig !== expectedSig) {
      return { valid: false, reason: 'Invalid signature' };
    }

    return { valid: true };
  } catch (error) {
    console.error('[Middleware] Token verification error:', error);
    return { valid: false, reason: 'Token decode error' };
  }
}

/**
 * Legacy token verification (for backwards compatibility during transition)
 * Token structure: { t: timestamp, s: signature }
 */
async function verifyLegacyToken(
  token: string,
  secret: string
): Promise<boolean> {
  if (!secret || !token) {
    return !secret; // Allow if no secret configured (dev mode)
  }

  try {
    const decoded = JSON.parse(atob(token));
    const { t: timestamp, s: signature } = decoded;

    if (!timestamp || !signature) {
      return false;
    }

    // Check token age (5 minutes for legacy tokens)
    const tokenAge = Date.now() - parseInt(timestamp, 10);
    if (tokenAge > 5 * 60 * 1000 || tokenAge < 0) {
      return false;
    }

    // Verify signature
    const expectedSignature = await signPayload(timestamp, secret);
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * Check if origin is valid
 */
function isValidOrigin(origin: string | null, referer: string | null): boolean {
  // Server-side requests typically don't have origin/referer
  if (!origin && !referer) {
    return true;
  }

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    'http://localhost:3000',
    'http://localhost:3001',
    'https://hyperfolio.xyz',
    'https://www.hyperfolio.xyz',
  ].filter(Boolean) as string[];

  if (origin && allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
    return true;
  }

  if (
    referer &&
    allowedOrigins.some((allowed) => referer.startsWith(allowed))
  ) {
    return true;
  }

  return false;
}

/**
 * Apply security headers to a response
 * @param response - The NextResponse to modify
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // For non-API routes, just apply security headers and continue
  if (!pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // API routes - apply authentication
  // Allow health check endpoint without authentication
  if (pathname === '/api/health') {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Allow token refresh endpoint (it has its own origin validation)
  if (pathname === '/api/auth/token') {
    const response = NextResponse.next();
    return applySecurityHeaders(response);
  }

  // Get request info
  const clientIP = getClientIP(request);
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const userAgent = request.headers.get('user-agent');
  const apiToken = request.headers.get('x-api-token');
  const legacyToken = request.headers.get('x-internal-token');
  const requestedWith = request.headers.get('x-requested-with');
  const secret = process.env.INTERNAL_API_SECRET || '';

  // Apply rate limiting
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
          'X-RateLimit-Remaining': '0',
        },
      }
    );
    return applySecurityHeaders(response);
  }

  // Development mode - allow all if no secret configured
  if (!secret) {
    const response = NextResponse.next();
    response.headers.set(
      'X-RateLimit-Remaining',
      rateLimit.remaining.toString()
    );
    return applySecurityHeaders(response);
  }

  // ALL requests to /api/ routes MUST have x-requested-with: hyperfolio-internal
  // This is because:
  // - SSR uses lib/api/client.ts which calls the external API directly
  // - Client requests use secureFetch which adds this header
  // - Any request without this header is external/unauthorized

  if (requestedWith !== 'hyperfolio-internal') {
    console.warn(
      `[Middleware] Blocked request without internal marker. Origin: ${origin || 'none'}, UA: ${userAgent?.substring(0, 50) || 'none'}`
    );
    const response = NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
    return applySecurityHeaders(response);
  }

  // Request has x-requested-with: hyperfolio-internal - now verify the token

  // Try new signed token format
  if (apiToken) {
    const verification = await verifySignedToken(apiToken, userAgent, secret);
    if (verification.valid) {
      const response = NextResponse.next();
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimit.remaining.toString()
      );
      return applySecurityHeaders(response);
    }

    // Log why token was rejected
    console.warn(`[Middleware] Token rejected: ${verification.reason}`);
  }

  // Fall back to legacy token format (for backwards compatibility)
  if (legacyToken) {
    const isValidLegacy = await verifyLegacyToken(legacyToken, secret);
    if (isValidLegacy) {
      const response = NextResponse.next();
      response.headers.set(
        'X-RateLimit-Remaining',
        rateLimit.remaining.toString()
      );
      return applySecurityHeaders(response);
    }
  }

  // Has internal marker but no valid token - BLOCK
  console.warn(
    `[Middleware] Invalid/missing token. Origin: ${origin || 'none'}`
  );
  const response = NextResponse.json(
    { error: 'Invalid or expired token' },
    { status: 401 }
  );
  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    // Apply to all routes except static files and Next.js internals
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff|woff2|ico)).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
