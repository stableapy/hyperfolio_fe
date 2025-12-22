import type { Metadata } from "next"
import { ExternalLink, Code2, Zap, Database, Shield } from "lucide-react"

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
    title: "Wallet Data",
    description: "Get complete portfolio data for any HyperEVM wallet address including token balances with USD valuations.",
  },
  {
    icon: Code2,
    title: "Token Information",
    description: "Access real-time token prices, metadata, and market data for all HyperEVM tokens including HYPE.",
  },
  {
    icon: Zap,
    title: "DeFi Positions",
    description: "Query lending, staking, and liquidity positions across Hypercore ecosystem protocols.",
  },
  {
    icon: Shield,
    title: "Transaction History",
    description: "Retrieve complete transaction history with decoded data for any wallet address.",
  },
]

export default function ApiDocsPage() {
  return (
    <main className="min-h-screen bg-[#0a0f0f]">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f0f] via-[#0d1214] to-[#0a0f0f]" />
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(#00ff41 1px, transparent 1px),
              linear-gradient(90deg, #00ff41 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00ff41]/30 bg-[#00ff41]/5 mb-6">
            <Code2 className="w-4 h-4 text-[#00ff41]" />
            <span className="font-mono text-xs text-[#00ff41]">DEVELOPER API</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-mono font-bold mb-6">
            <span className="text-[#00ff41] text-glow-green">Hyperfolio</span>
            <span className="text-white"> API</span>
          </h1>
          
          <p className="text-[#a0aab4] font-mono text-lg max-w-2xl mx-auto mb-8">
            Build powerful applications on HyperEVM with our comprehensive REST API. 
            Access wallet data, token information, NFT collections, and DeFi positions.
          </p>
          
          <a
            href="https://api.hyperfolio.xyz/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#00ff41] text-[#0a0e0f] rounded-lg font-mono font-bold text-lg hover:bg-[#00ff41]/90 transition-all hover:scale-105"
          >
            View API Documentation
            <ExternalLink className="w-5 h-5" />
          </a>
          
          <p className="mt-4 text-[#708090] font-mono text-sm">
            API key required • <a href="https://x.com/stableAPY" target="_blank" rel="noopener noreferrer" className="text-[#00ff41] hover:underline">Contact @stableAPY on X</a> for access
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-[#1a2225]">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-mono font-bold text-center mb-12">
            <span className="text-white">API </span>
            <span className="text-[#00ff41]">Endpoints</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {API_FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div 
                  key={feature.title}
                  className="p-6 rounded-xl border border-[#1a2225] bg-[#0d1214]/50 hover:border-[#00ff41]/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[#00ff41]/10">
                      <Icon className="w-6 h-6 text-[#00ff41]" />
                    </div>
                    <div>
                      <h3 className="text-white font-mono font-semibold mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[#708090] font-mono text-sm leading-relaxed">
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
      <section className="py-16 border-t border-[#1a2225]">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-mono font-bold text-center mb-8 text-white">
            Quick Start
          </h2>
          
          <div className="max-w-2xl mx-auto">
            <div className="rounded-xl border border-[#1a2225] bg-[#0d1214] overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1a2225]">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27ca40]" />
                <span className="ml-2 text-[#708090] font-mono text-xs">Example Request</span>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="font-mono text-sm text-[#a0aab4]">
{`# Get wallet portfolio data
curl -H "x-api-key: YOUR_API_KEY" \\
  https://api.hyperfolio.xyz/v1/wallet/{address}

# Response includes:
# - Token balances with USD values
# - NFT holdings
# - DeFi positions
# - Transaction history`}
                </code>
              </pre>
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a
              href="https://api.hyperfolio.xyz/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#00ff41] hover:text-[#00ff41]/80 font-mono transition-colors"
            >
              Explore full documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Back to App */}
      <section className="py-12 border-t border-[#1a2225]">
        <div className="container mx-auto px-6 text-center">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-[#708090] hover:text-white font-mono text-sm transition-colors"
          >
            ← Back to Hyperfolio
          </a>
        </div>
      </section>
    </main>
  )
}

