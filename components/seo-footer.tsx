"use client"

import { ExternalLink } from "lucide-react"

// SVG Icons for social platforms
const XIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

// Social links
const SOCIAL_LINKS = [
  { name: "X", href: "https://x.com/stableAPY", icon: XIcon, label: "Follow on X" },
]

// Quick links
const QUICK_LINKS = [
  { name: "API Docs", href: "/api-docs", external: false },
  { name: "Hyperliquid", href: "https://hyperliquid.xyz", external: true },
  { name: "Explorer", href: "https://hyperevmscan.io", external: true },
]

/**
 * Compact SEO-optimized footer
 * - Minimal visible UI
 * - Hidden SEO content for crawlers (sr-only)
 * - Social links and resources
 */
export function SeoFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#050808] border-t border-[#1a2225] mt-auto">
      <div className="container mx-auto px-6 py-6">
        {/* Compact single row layout */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="flex items-center gap-3">
            <span className="text-[#00ff41] font-mono text-xs font-bold">HYPERFOLIO</span>
            <span className="text-[#3a4448] font-mono text-xs">
              © {currentYear}
            </span>
          </div>

          {/* Center: Quick Links */}
          <div className="flex items-center gap-4">
            {QUICK_LINKS.map((link, index) => (
              <span key={link.name} className="flex items-center gap-4">
                <a
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="text-[#708090] hover:text-[#00ff41] font-mono text-xs transition-colors inline-flex items-center gap-1 group"
                >
                  {link.name}
                  {link.external && (
                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </a>
                {index < QUICK_LINKS.length - 1 && (
                  <span className="text-[#1a2225]">·</span>
                )}
              </span>
            ))}
          </div>

          {/* Right: Social Icons */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2 rounded-md text-[#708090] hover:text-[#00ff41] hover:bg-[#0d1214] transition-all"
                >
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>

        {/* Hidden SEO content - visible to crawlers only */}
        <div className="sr-only">
          <h2>About Hyperfolio - HyperEVM Portfolio Tracker</h2>
          <p>
            Hyperfolio is a free DeFi portfolio tracker for the HyperEVM blockchain 
            in the Hyperliquid ecosystem. Track tokens, NFTs, DeFi positions, and 
            transactions across multiple wallets. Monitor HYPE tokens, Hyperlend 
            positions, and Hyperswap liquidity. No wallet connection required - 
            simply enter any public address to view holdings.
          </p>
          <h3>Features</h3>
          <ul>
            <li>Multi-wallet portfolio tracking on HyperEVM</li>
            <li>Real-time token balances with USD valuations</li>
            <li>NFT collection management</li>
            <li>DeFi position monitoring for Hypercore protocols</li>
            <li>Complete transaction history</li>
            <li>Portfolio analytics and charts</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
