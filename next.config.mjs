/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Compiler optimizations for better performance
  compiler: {
    // Remove console.log in production for smaller bundles
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Experimental features for better performance
  experimental: {
    // Optimize package imports for smaller bundles
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@radix-ui/react-icons',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-tabs',
    ],
  },
  // Headers for better caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' 'nonce-*' https://www.googletagmanager.com https://www.google-analytics.com;",
              "style-src 'self' 'unsafe-inline';",
              "img-src 'self' data: https: blob:;",
              "font-src 'self' data:;",
              "connect-src 'self' https://api.hyperfolio.xyz https://rpc.hyperlend.finance https://www.googletagmanager.com https://www.google-analytics.com https://*.walletconnect.com https://*.cloudfront.net https://raw.githubusercontent.com https://*.githubusercontent.com https://api.etherscan.io https://hyperliquid.xyz https://rpc.hyperliquid.xyz https://*.kyberswap.com ws://localhost:* wss://localhost:* ws://127.0.0.1:* wss://127.0.0.1:*;",
              "frame-src 'self' https://www.googletagmanager.com;",
              "object-src 'none';",
              "base-uri 'self';",
              "form-action 'self';",
              "frame-ancestors 'self';",
              "upgrade-insecure-requests;",
            ].join(' '),
          },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/(.*).(ico|svg|png|jpg|jpeg|gif|webp|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache llms.txt for AI crawlers
      {
        source: '/llms.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
    ]
  },
}

export default nextConfig
