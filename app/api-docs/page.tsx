import type { Metadata } from "next"
import { ExternalLink, Code2, Zap, Database, Shield, ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "API Documentation | Hyperfolio",
  description: "Access the Hyperfolio API to build applications on HyperEVM. Get wallet balances, token data, NFTs, DeFi positions and transaction history.",
  keywords: [
    "Hyperfolio API",
    "HyperEVM API",
    "Hyperliquid API",
    "DeFi API",
    "Wallet API",
    "Blockchain API",
  ],
  openGraph: {
    title: "Hyperfolio API - HyperEVM Developer Tools",
    description: "Build on HyperEVM with the Hyperfolio API. Access wallet data, tokens, NFTs, and DeFi positions.",
  },
}

// API Features for SEO content
const API_FEATURES = [
  {
    icon: Database,
    label: "--wallet",
    title: "Wallet Data",
    description: "Get complete portfolio data for any HyperEVM wallet address including token balances with USD valuations.",
  },
  {
    icon: Code2,
    label: "--tokens",
    title: "Token Information",
    description: "Access real-time token prices, metadata, and market data for all HyperEVM tokens including HYPE.",
  },
  {
    icon: Zap,
    label: "--defi",
    title: "DeFi Positions",
    description: "Query lending, staking, and liquidity positions across Hypercore ecosystem protocols.",
  },
  {
    icon: Shield,
    label: "--history",
    title: "Transaction History",
    description: "Retrieve complete transaction history with decoded data for any wallet address.",
  },
]

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-theme-bg">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Subtle grid background */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(var(--theme-accent) 1px, transparent 1px),
              linear-gradient(90deg, var(--theme-accent) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          {/* Terminal-style badge */}
          <div className="inline-flex items-center gap-1.5 mb-8">
            <span className="font-mono text-sm text-theme-accent">&gt;</span>
            <span className="font-mono text-sm text-theme-text-secondary tracking-wider">
              developer_tools
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold mb-6">
            <span className="text-theme-accent">hyperfolio</span>
            <span className="text-theme-text">_API</span>
          </h1>
          
          <p className="text-theme-text-secondary font-mono text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Build powerful applications on HyperEVM with our comprehensive REST API. 
            Access wallet data, token information, NFT collections, and DeFi positions.
          </p>
          
          {/* CTA Button - Terminal style */}
          <a
            href="https://api.hyperfolio.xyz/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden transition-all duration-200 hover:border-theme-accent/50 hover:scale-[1.02]"
          >
            <div className="px-4 py-3 bg-theme-accent/10 border-r border-theme-accent/20 transition-colors group-hover:bg-theme-accent/15">
              <span className="font-mono text-base font-bold text-theme-accent">&gt;</span>
            </div>
            <div className="flex items-center gap-2 px-5 py-3">
              <span className="font-mono text-sm sm:text-base font-bold text-theme-accent">
                --view-docs
              </span>
              <ExternalLink className="w-4 h-4 text-theme-accent opacity-60 group-hover:opacity-100 transition-opacity" />
            </div>
          </a>
          
          <p className="mt-6 text-theme-text-muted font-mono text-xs sm:text-sm">
            # API key required — <a href="https://x.com/stableAPY" target="_blank" rel="noopener noreferrer" className="text-theme-accent hover:underline">contact @stableAPY on X</a> for access
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-theme-border/30">
        <div className="container mx-auto px-6">
          <h2 className="font-mono text-center mb-12">
            <span className="text-theme-text-muted text-sm">&gt; api</span>
            <span className="text-2xl md:text-3xl font-bold text-theme-text ml-2">--endpoints</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {API_FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div 
                  key={feature.title}
                  className="group p-5 rounded-sm border border-theme-border/50 bg-theme-card-bg/30 hover:border-theme-accent/30 transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon with terminal label */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="p-2.5 rounded-sm bg-theme-accent/10 border border-theme-accent/20">
                        <Icon className="w-5 h-5 text-theme-accent" />
                      </div>
                      <span className="font-mono text-[9px] text-theme-accent/70">
                        {feature.label}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-theme-text font-mono font-semibold mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-theme-text-muted font-mono text-xs leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Code Example Section */}
      <section className="py-16 border-t border-theme-border/30">
        <div className="container mx-auto px-6">
          <h2 className="font-mono text-center mb-8">
            <span className="text-theme-text-muted text-sm">&gt;</span>
            <span className="text-2xl font-bold text-theme-text ml-2">quick_start</span>
          </h2>
          
          <div className="max-w-2xl mx-auto">
            {/* Terminal-style code block */}
            <div className="rounded-sm border border-theme-border/70 bg-theme-card-bg overflow-hidden">
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-theme-border/50 bg-theme-bg/50">
                <span className="font-mono text-[10px] text-theme-text-muted uppercase tracking-wider">
                  example --request
                </span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="font-mono text-xs sm:text-sm text-theme-text-secondary">
                  <span className="text-theme-text-muted"># Get wallet portfolio data</span>{'\n'}
                  <span className="text-theme-accent">curl</span> -H <span className="text-[#00d9ff]">&quot;x-api-key: YOUR_API_KEY&quot;</span> \{'\n'}
                  {'  '}https://api.hyperfolio.xyz/v1/wallet/<span className="text-[#a855f7]">{'{address}'}</span>{'\n'}
                  {'\n'}
                  <span className="text-theme-text-muted"># Response includes:</span>{'\n'}
                  <span className="text-theme-text-muted"># - Token balances with USD values</span>{'\n'}
                  <span className="text-theme-text-muted"># - NFT holdings</span>{'\n'}
                  <span className="text-theme-text-muted"># - DeFi positions</span>{'\n'}
                  <span className="text-theme-text-muted"># - Transaction history</span>
                </code>
              </pre>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a
              href="https://api.hyperfolio.xyz/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-mono text-sm text-theme-accent hover:text-theme-accent/80 transition-colors"
            >
              <span>&gt;</span>
              <span>explore --full-docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Back to App */}
      <section className="py-10 border-t border-theme-border/30">
        <div className="container mx-auto px-6 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 font-mono text-sm text-theme-text-muted hover:text-theme-text transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>cd ~/hyperfolio</span>
          </a>
        </div>
      </section>
    </main>
  )
}

