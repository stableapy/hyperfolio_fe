---
phase: quick-004
plan: 004
subsystem: wallet
tags: [url-parameters, next-navigation, wallet-management, zustand]

# Dependency graph
requires: []
provides:
  - URL parameter detection for wallet addition (?wallet=0x... or ?wallet=name.hl)
  - Automatic wallet addition via shared links
  - URL cleanup after wallet processing to prevent re-adding
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - URL parameter processing with useSearchParams and useRouter from next/navigation
    - Ref pattern for one-time URL processing (urlProcessedRef)

key-files:
  created: []
  modified:
    - app/page.tsx

key-decisions:
  - "Silently ignore invalid wallet addresses - no error shown to user"
  - "Clear URL parameter immediately after processing to prevent re-adding on refresh"
  - "Use ref pattern (urlProcessedRef) to ensure URL is only processed once on mount"
  - "Support both 0x addresses and .hl/.hype domains via existing isValidWalletInput utility"
  - "Use 100ms setTimeout to wait for Zustand persist hydration before processing URL"

patterns-established:
  - "URL Parameter Pattern: useSearchParams + router.replace() for one-time URL processing"
  - "Ref Pattern: useRef with boolean flag to prevent re-running effects"

# Metrics
duration: 1min
completed: 2026-01-28
---

# Quick Task 004: Add Wallet via URL Parameter Summary

**URL parameter wallet detection using Next.js useSearchParams and router.replace() for automatic wallet addition via shared links**

## Performance

- **Duration:** 1 min
- **Started:** 2026-01-28T11:02:04Z
- **Completed:** 2026-01-28T11:03:26Z
- **Tasks:** 1
- **Files modified:** 1

## Accomplishments

- Added `useSearchParams` and `useRouter` imports from `next/navigation`
- Added `useEffect` that checks for `?wallet=` query parameter on mount
- Implemented wallet validation using existing `isValidWalletInput()` utility
- Added wallet with default name (address/domain) and first preset color
- Implemented URL cleanup using `router.replace()` to remove parameter after processing
- Used ref pattern (`urlProcessedRef`) to ensure URL is only processed once

## Task Commits

1. **Task 1: Add URL parameter wallet detection** - `a723580` (feat)
2. **Fix lint errors** - `4e87ab7` (fix)
3. **Fix duplicate wallet bug** - `a631fb5` (fix)

**Plan metadata:** (none - will be added at end)

## Files Created/Modified

- `app/page.tsx` - Added URL parameter handling for automatic wallet addition

## Decisions Made

- **Silently ignore invalid addresses**: Invalid wallet addresses are ignored without showing errors to maintain clean UX
- **Clear URL after processing**: Using `router.replace()` to remove `?wallet=` parameter prevents re-adding wallet on refresh
- **Ref pattern for one-time processing**: Using `urlProcessedRef` ensures the effect only runs once on mount, not on every render
- **Support all wallet formats**: Leveraging existing `isValidWalletInput()` utility ensures support for 0x addresses and .hl/.hype domains

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

**Duplicate wallet bug:** Initial implementation would add the same wallet multiple times when reloading the page with `?wallet=` parameter. This was because the URL processing effect ran before Zustand's persist middleware had hydrated the store from localStorage.

**Fix:** Added a 100ms setTimeout delay to ensure the persist middleware has hydrated before checking for existing wallets. This ensures we check against the fully persisted wallet list and prevent duplicates.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Feature is complete and ready for use. Users can now share links like `hyperfolio.xyz?wallet=0x1234...` or `hyperfolio.xyz?wallet=myname.hype` and the wallet will be automatically added when the page loads.

## Verification Checklist

To verify this feature works:

1. Visit `http://localhost:3000?wallet=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb` (example address)
2. Wallet should appear in the wallet list automatically
3. URL should update to remove `?wallet=` parameter
4. Refreshing page should not add wallet again
5. Visit `http://localhost:3000?wallet=test.hype` - .hype domain should work
6. Visit `http://localhost:3000?wallet=invalid` - should be ignored, no error shown

---
*Phase: quick-004*
*Completed: 2026-01-28*
