---
phase: quick-004
plan: 004
type: execute
wave: 1
depends_on: []
files_modified:
  - app/page.tsx
autonomous: true
user_setup: []

must_haves:
  truths:
    - "User can share URL with ?wallet=0x... or ?wallet=name.hl and wallet is added on visit"
    - "Wallet from URL is added automatically without user opening dialog"
    - "URL parameter is cleared after wallet is added (prevent re-adding on refresh)"
    - "Invalid wallet addresses in URL are ignored with no error shown"
  artifacts:
    - path: "app/page.tsx"
      provides: "URL parameter detection and wallet addition"
      contains: "useSearchParams, useEffect, addWallet"
  key_links:
    - from: "app/page.tsx"
      to: "lib/store/wallet-store.ts addWallet"
      via: "useWalletStore().addWallet()"
      pattern: "addWallet.*address"
    - from: "app/page.tsx"
      to: "URL searchParams"
      via: "useSearchParams() from next/navigation"
      pattern: "useSearchParams"
---

<objective>
Add wallet via URL parameter feature

Purpose: Enable users to share direct links that automatically add a wallet when visited (e.g., sharing portfolio via `?wallet=0x1234...`)
Output: URL parameter detection in page.tsx that adds wallet on mount and clears URL to prevent re-adding
</objective>

<execution_context>
@/Users/macbookpro/.claude/get-shit-done/workflows/execute-plan.md
@/Users/macbookpro/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@app/page.tsx
@lib/store/wallet-store.ts
@components/wallet/add-wallet-dialog.tsx
@components/wallet/utils.ts

# Only reference prior plan SUMMARYs if genuinely needed
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add URL parameter wallet detection</name>
  <files>app/page.tsx</files>
  <action>
    In app/page.tsx, add URL parameter detection for wallet addition:

    1. Import `useSearchParams` and `useRouter` from 'next/navigation'
    2. Add `useEffect` that runs once on mount to check URL params
    3. Check for `wallet` query parameter (supports both 0x addresses and .hl/.hype domains)
    4. Validate the wallet input using existing `isValidWalletInput()` utility from components/wallet/utils.ts
    5. If valid and not already in wallets array, call `addWallet()` with:
       - address: the wallet parameter value
       - name: use address as default name
       - color: use first preset color
    6. After processing, use `router.replace()` to remove the wallet parameter from URL (prevents re-adding on refresh)
    7. If wallet already exists in store, skip adding and just clear URL parameter

    IMPORTANT: Place this effect AFTER the store destructuring and BEFORE the streaming providers to ensure wallet is added before providers mount.

    Use ref pattern to track if URL has been processed (prevents re-processing):
    ```typescript
    const urlProcessedRef = useRef(false)
    ```

    Only process URL on first mount, not on every render.
  </action>
  <verify>
    1. Visit `http://localhost:3000?wallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` (example address)
    2. Wallet should appear in the wallet list automatically
    3. URL should update to remove ?wallet= parameter
    4. Refreshing page should not add wallet again
    5. Visit `http://localhost:3000?wallet=test.hype` - .hype domain should work
    6. Visit `http://localhost:3000?wallet=invalid` - should be ignored, no error shown
  </verify>
  <done>
    - Visiting URL with ?wallet=0x... automatically adds the wallet
    - URL parameter is cleared after processing
    - Refreshing doesn't re-add the wallet
    - Already-added wallets are detected and skipped
    - Invalid addresses are silently ignored
  </done>
</task>

</tasks>

<verification>
- Test with valid 0x address in URL parameter
- Test with .hl domain in URL parameter
- Test with .hype domain in URL parameter
- Test with invalid address (should be ignored)
- Test that refreshing after adding doesn't re-add
- Test that existing wallet in URL doesn't create duplicate
- Check browser console for any errors
</verification>

<success_criteria>
Users can share links like `hyperfolio.xyz?wallet=0x1234...` or `hyperfolio.xyz?wallet=myname.hype` and the wallet is automatically added when the page loads. The URL parameter is cleared immediately after processing to prevent re-adding on refresh.
</success_criteria>

<output>
After completion, create `.planning/quick/004-add-wallet-via-url-param/004-SUMMARY.md`
</output>
