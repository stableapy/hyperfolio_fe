import type React from "react"
import { headers } from "next/headers"
import { cookieToInitialState } from "wagmi"

import "./globals.css"

import { Geist, Geist_Mono, Geist as V0_Font_Geist, Geist_Mono as V0_Font_Geist_Mono, Source_Serif_4 as V0_Font_Source_Serif_4 } from 'next/font/google'
import { Providers } from "./providers"
import { config } from "@/lib/wagmi/config"

// Initialize fonts
const _geist = V0_Font_Geist({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _sourceSerif_4 = V0_Font_Source_Serif_4({ subsets: ['latin'], weight: ["200","300","400","500","600","700","800","900"] })

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata = {
  title: "Hyperfolio - DeFi Portfolio Tracker",
  description: "Track your HyperEVM portfolio across multiple wallets",
    generator: 'v0.app'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const cookie = headersList.get("cookie")
  const initialState = cookieToInitialState(config, cookie)

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.className} bg-[#0a0e0f] text-[#00ff41] antialiased`}>
        <Providers initialState={initialState}>
          {children}
        </Providers>
      </body>
    </html>
  )
}
