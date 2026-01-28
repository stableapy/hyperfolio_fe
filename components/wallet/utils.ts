// Utility functions for wallet module

/**
 * Validate Ethereum address format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check if a string is a .hl domain name
 *
 * .hl domains are Hyperliquid's naming service that resolve to Ethereum addresses.
 *
 * @param input - The string to check
 * @returns true if the input ends with ".hl" (case-insensitive)
 *
 * @example
 * ```ts
 * isHLDomain("user.hl") // true
 * isHLDomain("USER.HL") // true
 * isHLDomain("0x1234...") // false
 * ```
 */
export function isHLDomain(input: string): boolean {
  if (!input || typeof input !== "string") return false
  return input.trim().toLowerCase().endsWith(".hl")
}

/**
 * Format address for display (shortened version)
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Format address even shorter for mobile/compact displays
 */
export function formatAddressCompact(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-3)}`
}

/**
 * Resolve a .hl domain to its Ethereum address
 *
 * .hl domains are Hyperliquid's naming service that resolve to Ethereum addresses.
 * This function calls the Hyperliquid API to resolve the domain.
 *
 * @param domain - The .hl domain name (e.g., "user.hl")
 * @returns Promise resolving to the Ethereum address
 * @throws Error if resolution fails (network error, invalid domain, etc.)
 *
 * @example
 * ```ts
 * try {
 *   const address = await resolveHLDomain("mywallet.hl")
 *   console.log(address) // "0x1234..."
 * } catch (error) {
 *   console.error("Failed to resolve:", error)
 * }
 * ```
 */
export async function resolveHLDomain(domain: string): Promise<string> {
  // Validate .hl domain format (case-insensitive)
  const normalizedDomain = domain.trim().toLowerCase()
  if (!normalizedDomain.endsWith(".hl")) {
    throw new Error("Invalid .hl domain format. Must end with '.hl'")
  }

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    // Call Hyperliquid API to resolve domain
    const response = await fetch(`https://api.hyperliquid.xyz/info?suggestId=${normalizedDomain}`, {
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Validate response contains address
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response format from API")
    }

    const resolvedAddress = data.address

    if (!resolvedAddress || typeof resolvedAddress !== "string") {
      throw new Error("No address found in API response")
    }

    // Validate the resolved address is a valid Ethereum address
    if (!isValidEthereumAddress(resolvedAddress)) {
      throw new Error(`Resolved address is not a valid Ethereum address: ${resolvedAddress}`)
    }

    return resolvedAddress
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Domain resolution timed out. Please try again.")
      }
      if (error.message.includes("fetch")) {
        throw new Error("Network error while resolving .hl domain. Please check your connection.")
      }
      // Re-throw our custom errors
      throw error
    }
    throw new Error("Failed to resolve .hl domain. Please check the domain name or use the Ethereum address directly.")
  } finally {
    clearTimeout(timeoutId)
  }
}

