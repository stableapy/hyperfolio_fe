import { ImageResponse } from "next/og"

// Image metadata
export const alt = "Hyperfolio - DeFi Portfolio Tracker for HyperEVM"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#050505",
          backgroundImage:
            "radial-gradient(circle at 2px 2px, #1a1a1a 1px, transparent 0)",
          backgroundSize: "40px 40px",
          position: "relative",
        }}
      >
        {/* Top decorative line */}
        <div
          style={{
            position: "absolute",
            top: 60,
            left: 100,
            right: 100,
            height: "1px",
            background: "linear-gradient(90deg, transparent, #00ff4140, transparent)",
          }}
        />

        {/* Main content container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
          }}
        >
          {/* Terminal prompt style heading */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 90,
                fontWeight: 700,
                color: "#00ff41",
                fontFamily: "monospace",
                textShadow: "0 0 40px #00ff4180, 0 0 80px #00ff4140",
                letterSpacing: "-2px",
              }}
            >
              {">"} HYPERFOLIO_
            </span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              color: "#a1a1aa",
              fontFamily: "system-ui, sans-serif",
              fontWeight: 400,
              marginTop: 10,
            }}
          >
            DeFi Portfolio Tracker for HyperEVM
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 30,
            }}
          >
            {["TOKENS", "DEFI", "NFTS", "TRANSACTIONS"].map((label) => (
              <div
                key={label}
                style={{
                  padding: "10px 24px",
                  borderRadius: 20,
                  border: "1px solid #00ff4150",
                  backgroundColor: "#00ff4110",
                  color: "#00ff41",
                  fontSize: 16,
                  fontFamily: "monospace",
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Stylized chart line at the bottom */}
        <svg
          width="1000"
          height="80"
          viewBox="0 0 1000 80"
          style={{
            position: "absolute",
            bottom: 80,
          }}
        >
          {/* Glow filter */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ff41" stopOpacity="0" />
              <stop offset="20%" stopColor="#00ff41" stopOpacity="1" />
              <stop offset="80%" stopColor="#00ff41" stopOpacity="1" />
              <stop offset="100%" stopColor="#00ff41" stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Chart line path - mimics price movement */}
          <path
            d="M 0 60 Q 100 55, 150 50 T 300 40 T 450 45 T 550 30 T 700 25 T 800 20 T 900 15 T 1000 10"
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            filter="url(#glow)"
          />
        </svg>

        {/* Bottom decorative elements */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#555",
            fontSize: 16,
            fontFamily: "monospace",
          }}
        >
          <span>hyperfolio.xyz</span>
          <span style={{ color: "#333" }}>•</span>
          <span>by @stableAPY</span>
        </div>

        {/* Corner decorations */}
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 30,
            width: 20,
            height: 20,
            borderLeft: "2px solid #00ff4150",
            borderTop: "2px solid #00ff4150",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 30,
            right: 30,
            width: 20,
            height: 20,
            borderRight: "2px solid #00ff4150",
            borderTop: "2px solid #00ff4150",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 30,
            left: 30,
            width: 20,
            height: 20,
            borderLeft: "2px solid #00ff4150",
            borderBottom: "2px solid #00ff4150",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 30,
            right: 30,
            width: 20,
            height: 20,
            borderRight: "2px solid #00ff4150",
            borderBottom: "2px solid #00ff4150",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}

