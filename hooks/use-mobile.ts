import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Detects if the current viewport is mobile-sized (width < 768px)
 *
 * @returns {boolean} true if mobile, false if desktop
 *
 * @remarks
 * SSR Limitation: Server always returns `false` (desktop view).
 *
 * This hook uses React's `useSyncExternalStore` to sync with the window's
 * matchMedia, which provides performant, reactive viewport detection.
 *
 * ⚠️ **Hydration Mismatch on Mobile:**
 * When a user loads the app on a mobile device (width < 768px):
 * 1. Server renders with `isMobile = false` (desktop layout)
 * 2. Client hydrates with `isMobile = true` (mobile layout)
 * 3. Brief flash of desktop content (100-500ms)
 *
 * **Impact:**
 * - Desktop users: ✅ No mismatch, seamless experience
 * - Mobile users: ⚠️ Flash of desktop layout before correction
 *
 * **Why This Design:**
 * - Most users likely on desktop (portfolio tracker use case)
 * - Conservative fix requires significant infrastructure changes
 * - Self-corrects automatically once client mounts
 *
 * **Potential Improvements:**
 * - Server-side User-Agent parsing (complex, can be spoofed)
 * - CSS-based responsive design (bypasses React state entirely)
 * - Bot detection with `isbot()` to assume desktop for crawlers only
 */
export function useIsMobile() {
  const subscribe = (callback: () => void) => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener('change', callback);
    return () => mql.removeEventListener('change', callback);
  };

  const getSnapshot = () => {
    return window.innerWidth < MOBILE_BREAKPOINT;
  };

  const getServerSnapshot = () => {
    // NOTE: Server-side rendering always defaults to desktop (false)
    //
    // This assumes users primarily use desktop devices. If loading on mobile
    // (< 768px), there will be a brief hydration mismatch that
    // self-corrects once the client mounts and detects mobile width.
    //
    // IMPACT: Mobile users see a flash of desktop layout (100-500ms)
    // FIXES CONSIDERED:
    //   - User-Agent detection on server (complex, can be spoofed)
    //   - CSS-based responsive design (bypasses this hook)
    //   - isbot() detection to assume desktop for bots only
    //
    return false;
  };

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
