---
phase: quick-003
plan: 003
type: execute
wave: 1
depends_on: []
files_modified:
  - components/wallet/add-wallet-dialog.tsx
  - components/wallet/utils.ts
  - components/wallet/types.ts
autonomous: true

must_haves:
  truths:
    - "User can paste a .hl domain name (e.g., 'user.hl') in the address field"
    - ".hl domain is resolved to its corresponding Ethereum address before submission"
    - "Dialog shows loading state while resolving .hl domain"
    - "Validation error shown if .hl domain resolution fails"
    - "Resolved Ethereum address is stored in wallet store"
  artifacts:
    - path: "components/wallet/utils.ts"
      provides: "resolveHLDomain function for DNS resolution"
      exports: ["resolveHLDomain"]
    - path: "components/wallet/add-wallet-dialog.tsx"
      provides: "Updated dialog with .hl domain support"
      contains: "resolveHLDomain"
  key_links:
    - from: "components/wallet/add-wallet-dialog.tsx"
      to: "components/wallet/utils.ts"
      via: "import resolveHLDomain"
      pattern: "resolveHLDomain.*\\.hl"
---

<objective>
Add .hl DNS domain support to the wallet add dialog

Purpose: Allow users to add wallets using .hl domain names (Hyperliquid naming service) instead of only raw Ethereum addresses
Output: Enhanced wallet dialog that accepts and resolves .hl domains to Ethereum addresses

This is a focused UX improvement that removes the need for users to look up their own Ethereum address when using a .hl domain.
</objective>

<execution_context>
@/Users/macbookpro/.claude/get-shit-done/workflows/execute-plan.md
@/Users/macbookpro/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@components/wallet/add-wallet-dialog.tsx
@components/wallet/utils.ts
@components/wallet/types.ts

## Current State

The wallet dialog currently only accepts Ethereum addresses (0x...) via `isValidEthereumAddress()` validation. .hl domains are a naming service for Hyperliquid that resolve to Ethereum addresses.

## Pattern: .hl Domain Resolution

.hl domains use a specific resolution pattern. The API endpoint for resolving .hl domains is:

```
GET https://api.hyperliquid.xyz/info?suggestId={domain}
```

Response format:
```json
{
  "address": "0x..." // Resolved Ethereum address
}
```

If a .hl domain doesn't exist or resolution fails, the API returns an error.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add resolveHLDomain utility function</name>
  <files>components/wallet/utils.ts</files>
  <action>
    Add a new async function `resolveHLDomain(domain: string): Promise<string>` to components/wallet/utils.ts that:

    1. Checks if input ends with ".hl" (case-insensitive)
    2. Calls the Hyperliquid API: `https://api.hyperliquid.xyz/info?suggestId={domain}`
    3. Parses the response to extract the resolved address
    4. Returns the resolved Ethereum address
    5. Throws error if resolution fails (network error, invalid domain, etc.)

    Function signature:
    ```typescript
    export async function resolveHLDomain(domain: string): Promise<string>
    ```

    API call pattern:
    - Use fetch() with AbortSignal for timeout handling
    - 10 second timeout
    - Validate response contains valid address
    - Throw descriptive error for failure cases

    Do NOT modify existing functions (isValidEthereumAddress, formatAddress, formatAddressCompact).
  </action>
  <verify>
    Check that:
    - File exports `resolveHLDomain` function
    - Function is async and returns Promise<string>
    - API endpoint is correct: `https://api.hyperliquid.xyz/info?suggestId=`
    - Has timeout handling (10s)
    - Throws error on failure
  </verify>
  <done>
    resolveHLDomain function exists in utils.ts, properly handles API resolution with error handling
  </done>
</task>

<task type="auto">
  <name>Task 2: Update AddWalletDialog to support .hl domain resolution</name>
  <files>components/wallet/add-wallet-dialog.tsx</files>
  <action>
    Modify AddWalletDialog component to handle .hl domain resolution:

    1. Add state for resolution:
       - `isResolving: boolean` - tracks if currently resolving a .hl domain
       - `resolvedAddress: string | null` - stores the resolved address

    2. Update `handleAddressBlur()` to:
       - Check if address ends with ".hl" (case-insensitive)
       - If yes, call `resolveHLDomain(address)` with loading state
       - On success: store resolved address, clear any errors
       - On error: set addressError with resolution failure message
       - If no .hl suffix: use existing `isValidEthereumAddress()` validation

    3. Update `handleSubmit()` to:
       - Submit `resolvedAddress || address` as the final wallet address
       - This ensures resolved .hl addresses are stored

    4. Update input field visual feedback:
       - Show loading indicator (spinner or text) in input field when `isResolving` is true
       - Show "Resolved: 0x..." helper text below input when `resolvedAddress` exists

    5. Error messages:
       - "Failed to resolve .hl domain. Please check the domain name or use the Ethereum address directly."
       - "Network error while resolving .hl domain. Please try again."

    6. Import the new `resolveHLDomain` function from utils.ts

    Do NOT change:
    - Terminal-style UI theme
    - Color picker functionality
    - Name input behavior
    - Existing form layout structure
  </action>
  <verify>
    Check that:
    - Component imports resolveHLDomain from utils
    - isResolving state added and used
    - handleAddressBlur calls resolveHLDomain for .hl domains
    - Loading indicator shown during resolution
    - Error handling for failed resolution
    - Resolved address is submitted to onAdd
    - Terminal styling preserved
  </verify>
  <done>
    Dialog accepts .hl domains, resolves them to Ethereum addresses, shows loading/error states, and stores the resolved address
  </done>
</task>

<task type="auto">
  <name>Task 3: Update types and validation to reflect .hl support</name>
  <files>components/wallet/utils.ts components/wallet/add-wallet-dialog.tsx</files>
  <action>
    Update validation logic and helper text:

    1. In add-wallet-dialog.tsx:
       - Update placeholder text from "paste wallet address..." to "paste wallet address or .hl domain..."
       - Update helper text from "# ethereum address (0x...)" to "# ethereum address (0x...) or .hl domain"
       - Update validation error messages to reference both formats

    2. In utils.ts (optional enhancement):
       - Add JSDoc comment to resolveHLDomain explaining .hl domain format
       - Consider adding `isHLDomain(domain: string): boolean` helper if needed for cleaner code

    Keep the "0x" prefix visual in the input field - it's part of the terminal aesthetic and doesn't affect .hl input.
  </action>
  <verify>
    Check that:
    - Placeholder mentions .hl domains
    - Helper text mentions both address formats
    - Error messages are clear about supported formats
    - Terminal aesthetic preserved (0x prefix still shown)
  </verify>
  <done>
    UI text reflects both Ethereum address and .hl domain support with clear instructions
  </done>
</task>

</tasks>

<verification>
Manual verification steps after implementation:
1. Open wallet add dialog
2. Enter a .hl domain (e.g., "test.hl")
3. Verify loading indicator appears on blur
4. If domain doesn't exist, verify error message shown
5. If domain exists, verify resolved address displayed
6. Submit and verify wallet is added with resolved Ethereum address
7. Test with regular 0x address - verify still works
8. Test with invalid input - verify appropriate error
</verification>

<success_criteria>
1. Users can enter .hl domains in the wallet address field
2. .hl domains are resolved to Ethereum addresses via API call
3. Loading state shown during resolution
4. Clear error messages for failed resolution
5. Resolved addresses stored correctly in wallet store
6. Regular Ethereum addresses still work as before
7. Terminal UI aesthetic preserved
</success_criteria>

<output>
After completion, create `.planning/quick/003-add-hl-dns-support-to-wallet-dialog/003-SUMMARY.md`
</output>
