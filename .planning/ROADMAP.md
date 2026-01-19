# Roadmap

**Project:** Hyperfolio Frontend - Yield Section Optimization
**Created:** 2025-01-19
**Phases:** 3

## Overview

This roadmap optimizes the yield section for performance and UX, fixing lag/freeze issues while adding card view and enhanced filters. The approach follows research recommendations: measure baseline first, then optimize, then enhance features.

## Phases

### Phase 1: Performance Foundation

**Goal:** Users experience smooth, responsive yield section with no lag or freeze during interactions.
**Depends on:** Nothing (first phase)
**Requirements:** PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, FILT-01, FILT-02, FILT-03, VIEW-01

**Success Criteria:**
1. First load completes without noticeable lag (<100ms to interactive)
2. Filter selection updates UI instantly without freeze (maintains 60fps)
3. List view displays protocols correctly with working filters (protocol, category, token)
4. Data handling is optimized with memoization to prevent unnecessary re-renders

**Plans:** 4 plans in 3 waves
- [x] 01-01-PLAN.md — Measure baseline performance with React DevTools Profiler
- [x] 01-02-PLAN.md — Verify existing filters (protocol, category, token) work correctly
- [x] 01-03-PLAN.md — Consolidate results and confirm Phase 1 completion
- [x] 01-04-PLAN.md — Fix dropdown performance gap with virtualization and CSS-only logo fallback

**Completed:** 2025-01-19 (including gap closure)

---

### Phase 2: Card View Implementation

**Goal:** Users can switch between list and card views to find their preferred display format.
**Depends on:** Phase 1 (stable performance foundation)
**Requirements:** VIEW-02, VIEW-03, VIEW-04

**Success Criteria:**
1. Card view displays protocols in responsive grid layout (2-3 col desktop, 1 col mobile)
2. View toggle button switches between list and card views smoothly without re-mount
3. Card view maintains minimalistic-geeky aesthetic (between rich and simple)
4. View preference persists across page refreshes

**Plans:** (created by /gsd:plan-phase)

---

### Phase 3: Advanced Filters & UX

**Goal:** Users can quickly filter yield opportunities using intuitive inputs and preset buttons.
**Depends on:** Phase 2 (view system complete)
**Requirements:** FILT-04, FILT-05, FILT-06, FILT-07, UX-01, UX-02, UX-03, UX-04, UX-05

**Success Criteria:**
1. APY range filter accepts min/max inputs with preset buttons for common ranges
2. TVL threshold filter accepts min input with preset buttons for common ranges
3. Multi-select filters have autocomplete functionality for smooth selection
4. Active filters display as removable chips/tags
5. Clear filters button resets all filters and filter state persists across refreshes

**Plans:** (created by /gsd:plan-phase)

---

## Progress

| Phase | Status | Plans | Completed |
|-------|--------|-------|-----------|
| 1 - Performance Foundation | ✓ Complete | 4/4 | 100% |
| 2 - Card View Implementation | Not started | 0 | — |
| 3 - Advanced Filters & UX | Not started | 0 | — |

---
*Roadmap for milestone: v1.0*
