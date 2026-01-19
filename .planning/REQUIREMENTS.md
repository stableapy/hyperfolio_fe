# Requirements: Hyperfolio Yield Section Optimization

**Defined:** 2025-01-19
**Core Value:** Users can quickly find and compare yield opportunities across 30+ HyperEVM protocols with smooth, responsive filtering and view switching.

## v1 Requirements

Requirements for yield section performance and UX improvements.

### Performance

- [x] **PERF-01**: First load completes without noticeable lag
- [x] **PERF-02**: Filter selection doesn't freeze UI
- [x] **PERF-03**: Filter changes complete under 100ms
- [x] **PERF-04**: UI maintains 60fps during interactions
- [x] **PERF-05**: Data handling optimized to prevent unnecessary re-renders

### Views

- [x] **VIEW-01**: List view displays protocols in table format (existing, verified working)
- [ ] **VIEW-02**: Card view displays protocols in grid layout (2-3 col desktop, 1 col mobile)
- [ ] **VIEW-03**: View toggle button switches between list and card views
- [ ] **VIEW-04**: Card view maintains minimalistic-geeky aesthetic (between rich and simple)

### Filters - Existing

- [x] **FILT-01**: Protocol multi-select filter works (existing, verified working)
- [x] **FILT-02**: Category multi-select filter works (existing, verified working)
- [x] **FILT-03**: Token multi-select filter works (existing, verified working)

### Filters - New

- [ ] **FILT-04**: APY range filter with min/max input fields (not sliders)
- [ ] **FILT-05**: TVL threshold filter with min input field (not sliders)
- [ ] **FILT-06**: Preset buttons for common APY ranges (e.g., "0-10%", "10-50%", "50%+")
- [ ] **FILT-07**: Preset buttons for common TVL ranges (e.g., "<$1M", "$1M-$10M", ">$10M")

### Filter UX

- [ ] **UX-01**: Multi-select filters have autocomplete functionality
- [ ] **UX-02**: Multi-select filters have smoother selection feel
- [ ] **UX-03**: Active filters display as chips/tags with remove buttons
- [ ] **UX-04**: Clear filters button resets all filters to default state
- [ ] **UX-05**: Filter state persists across page refreshes (localStorage via Zustand)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Command palette (Cmd+K) for keyboard-first navigation
- **ADV-02**: Virtual scrolling optimization (TanStack Virtual)
- **ADV-03**: Real-time APY pulse indicator for live data
- **ADV-04**: Advanced filter preset chips (user-defined combinations)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Social/share features | Privacy concern for DeFi users; requires auth infrastructure |
| Protocol comparison table | Mobile-unfriendly; sort/filter sufficient for most users |
| Advanced query builder | 30 protocols don't need SQL-like queries; preset chips cover 95% of use cases |
| Push notifications | Requires service workers; in-app indicators sufficient |
| Yield calculator/projections | Requires assumptions; show historical APY ranges instead |
| Light theme toggle | Terminal aesthetic is inherently dark; breaks brand vibe |
| Dual-handle sliders | User prefers min/max inputs or preset buttons; simpler implementation |
| Multi-chain support | HyperEVM only (chain ID 999); out of scope for this project |
| Protocol rating system | Subjective; TVL serves as trust proxy |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PERF-01 | Phase 1 | Complete |
| PERF-02 | Phase 1 | Complete |
| PERF-03 | Phase 1 | Complete |
| PERF-04 | Phase 1 | Complete |
| PERF-05 | Phase 1 | Complete |
| VIEW-01 | Phase 1 | Complete |
| VIEW-02 | Phase 2 | Pending |
| VIEW-03 | Phase 2 | Pending |
| VIEW-04 | Phase 2 | Pending |
| FILT-01 | Phase 1 | Complete |
| FILT-02 | Phase 1 | Complete |
| FILT-03 | Phase 1 | Complete |
| FILT-04 | Phase 3 | Pending |
| FILT-05 | Phase 3 | Pending |
| FILT-06 | Phase 3 | Pending |
| FILT-07 | Phase 3 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 3 | Pending |
| UX-05 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2025-01-19*
*Last updated: 2025-01-19 after Phase 1 completion*
