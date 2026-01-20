---
phase: 002-add-skeleton-loading-yield-views
plan: 002
type: execute
wave: 1
depends_on: []
files_modified:
  - components/sections/yield-section/yield-section.tsx
autonomous: true

must_haves:
  truths:
    - "Loading state shows YieldListSkeleton when viewMode is 'list'"
    - "Loading state shows YieldGridSkeleton when viewMode is 'card'"
    - "Skeletons are not shown when error exists"
    - "Actual content is shown after loading completes"
  artifacts:
    - path: "components/sections/yield-section/yield-section.tsx"
      provides: "Main yield section component with proper skeleton loading"
      contains: "viewMode-based skeleton rendering"
  key_links:
    - from: "yield-section.tsx"
      to: "YieldListSkeleton"
      via: "Conditional render when showLoading && viewMode === 'list'"
      pattern: "showLoading.*viewMode.*list"
    - from: "yield-section.tsx"
      to: "YieldGridSkeleton"
      via: "Conditional render when showLoading && viewMode === 'card'"
      pattern: "showLoading.*viewMode.*card"
---

<objective>
Fix skeleton loading states in yield section to show the correct skeleton component based on current view mode (list vs card).

Purpose: Currently only YieldListSkeleton is shown during loading, regardless of view mode. Card view users see no skeleton during initial load.

Output: Updated yield-section.tsx with viewMode-aware skeleton rendering
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/quick/002-add-skeleton-loading-yield-views/STATE.md
@components/sections/yield-section/yield-section.tsx
@components/sections/yield-section/yield-card-grid.tsx
@components/sections/yield-section/yield-list-skeleton.tsx
@components/sections/yield-section/yield-grid-skeleton.tsx
</context>

<tasks>

<task type="auto">
  <name>Fix skeleton loading to respect view mode</name>
  <files>components/sections/yield-section/yield-section.tsx</files>
  <action>
    Modify the loading state rendering in yield-section.tsx (around line 162) to show the appropriate skeleton based on viewMode:

    1. Replace the current skeleton rendering at line 162:
       ```typescript
       {showLoading && !error && <YieldListSkeleton />}
       ```

    2. With viewMode-aware skeleton rendering:
       ```typescript
       {showLoading && !error && (
         viewMode === 'card' ? <YieldGridSkeleton /> : <YieldListSkeleton />
       )}
       ```

    3. Import YieldGridSkeleton if not already imported (check imports at top of file)

    This ensures:
    - Card view shows YieldGridSkeleton during loading
    - List view shows YieldListSkeleton during loading
    - Skeletons are hidden when error exists
    - Actual content renders after loading completes (line 228-236)
  </action>
  <verify>
    1. Check imports include YieldGridSkeleton
    2. Verify skeleton rendering uses viewMode conditional
    3. Confirm both skeleton paths exist and are properly exported
  </verify>
  <done>
    Loading state shows correct skeleton component based on current view mode, providing consistent UX across both list and card views
  </done>
</task>

</tasks>

<verification>
- [ ] YieldGridSkeleton is imported at top of yield-section.tsx
- [ ] Loading state shows YieldGridSkeleton when viewMode === 'card'
- [ ] Loading state shows YieldListSkeleton when viewMode === 'list'
- [ ] Skeletons are hidden when error exists
- [ ] No TypeScript errors after changes
</verification>

<success_criteria>
The yield section now displays the appropriate skeleton loading state based on the user's selected view mode, with YieldGridSkeleton for card view and YieldListSkeleton for list view.
</success_criteria>

<output>
After completion, create `.planning/quick/002-add-skeleton-loading-yield-views/002-SUMMARY.md`
</output>
