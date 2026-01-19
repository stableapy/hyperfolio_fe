---
phase: quick
plan: 001
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/types/api.ts
  - components/sections/yield-section/hooks/use-yield-data.ts
  - components/sections/yield-section/yield-section.tsx
  - app/api/yield/all/route.ts
autonomous: true
user_setup: []

must_haves:
  truths:
    - "Frontend fetches from new /api/yield/ endpoint with pagination params"
    - "Pagination UI allows navigation between pages"
    - "Filters send query params to backend instead of client-side filtering"
    - "Client-side filtering/sorting logic is removed"
    - "Types match new paginated response structure"
  artifacts:
    - path: "lib/types/api.ts"
      provides: "PaginatedYieldResponse type definition"
      contains: "interface PaginatedYieldResponse"
    - path: "components/sections/yield-section/hooks/use-yield-data.ts"
      provides: "Pagination-aware data fetching hook"
      contains: "page, pageSize state and query params"
    - path: "components/sections/yield-section/yield-section.tsx"
      provides: "Pagination UI component"
      contains: "pagination controls"
    - path: "app/api/yield/all/route.ts"
      provides: "Updated proxy route or removal"
      contains: "GET handler with pagination support"
  key_links:
    - from: "use-yield-data.ts"
      to: "/api/yield/"
      via: "secureFetch with query params"
      pattern: "secureFetch.*api/yield/.*page.*page_size"
    - from: "yield-section.tsx"
      to: "use-yield-data.ts"
      via: "pagination state callbacks"
      pattern: "setPage|setPageSize"
---

<objective>
Adapt frontend to use new paginated /yield/ endpoint with server-side filtering and pagination.

Purpose: Replace client-side filtering/sorting with server-side implementation via new paginated API
Output: Working yield section with pagination UI and server-side filtering
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@lib/types/api.ts
@components/sections/yield-section/hooks/use-yield-data.ts
@components/sections/yield-section/yield-section.tsx
@components/sections/yield-section/types.ts
@app/api/yield/all/route.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update types and API client for paginated response</name>
  <files>lib/types/api.ts</files>
  <action>
    Add new types for paginated yield response:

    1. Add PaginatedYieldResponse interface:
       - data: YieldOpportunity[] (the opportunities array)
       - pagination: { page, page_size, total_items, total_pages, has_next, has_prev }
       - metadata: { last_updated, categories, protocols, tokens }

    2. Add YieldPaginationParams interface for query params:
       - page?: number
       - page_size?: number
       - search?: string
       - categories?: string[]
       - protocols?: string[]
       - token_addresses?: string[]
       - min_value?: number
       - max_value?: number
       - sort_by?: string
       - sort_order?: 'asc' | 'desc'

    Keep existing YieldResponse type for backward compatibility during transition.
  </action>
  <verify>
    Check that types compile: npm run type-check
  </verify>
  <done>
    Types added with pagination metadata structure matching backend response
  </done>
</task>

<task type="auto">
  <name>Task 2: Refactor use-yield-data.ts for server-side filtering and pagination</name>
  <files>components/sections/yield-section/hooks/use-yield-data.ts</files>
  <action>
    Refactor the hook to use new API with pagination:

    1. Update useFetchYieldData to:
       - Accept YieldPaginationParams as argument
       - Build query string from params (URLSearchParams)
       - Fetch from /api/yield/ instead of /api/yield/all
       - Return PaginatedYieldResponse type
       - Add pagination state: { page, pageSize, totalPages, hasNext, hasPrev }

    2. Update useYieldData to:
       - Accept pagination state params in addition to filters
       - Remove ALL client-side filtering logic (lines 264-344)
       - Remove client-side sorting logic (lines 347-356)
       - Pass filters as query params to useFetchYieldData
       - Return paginated data directly from backend

    3. Keep consolidation logic for lending markets (consolidateLendingOpportunities)

    4. Remove filter options generation (protocols/tokens) - these now come from backend metadata

    Reference existing code structure but simplify significantly - backend does the heavy lifting now.
  </action>
  <verify>
    Check hook compiles: npm run type-check
  </verify>
  <done>
    Hook fetches from /api/yield/ with pagination params and returns backend-filtered data
  </done>
</task>

<task type="auto">
  <name>Task 3: Add pagination UI and update yield-section component</name>
  <files>components/sections/yield-section/yield-section.tsx</files>
  <action>
    Update YieldSection component with pagination controls:

    1. Add pagination state to component:
       - page: number (default 1)
       - pageSize: number (default 50)
       - setPage, setPageSize handlers

    2. Pass pagination state to useYieldData hook

    3. Add pagination UI component (after YieldFilterBar, before list):
       - "Showing X-Y of Z opportunities"
       - Previous/Next buttons
       - Page size selector (25, 50, 100)
       - Disable Previous on page 1
       - Disable Next when !hasNext

    4. Update filter change handlers to reset to page 1

    5. Remove client-side filter options - use backend metadata from response

    Use Tailwind classes for styling: flex, gap-2, buttons with disabled states.
  </action>
  <verify>
    Check component compiles: npm run type-check
  </verify>
  <done>
    Pagination UI displayed and functional, filter changes reset to page 1
  </done>
</task>

</tasks>

<verification>
1. TypeScript compiles without errors: npm run type-check
2. Yield section loads with first page of data
3. Pagination controls visible and functional
4. Filters send query params to backend (check Network tab)
5. No client-side filtering occurs in console logs
6. Page size selector changes number of items displayed
</verification>

<success_criteria>
- Frontend successfully fetches from /api/yield/ endpoint
- Pagination UI allows navigation between pages
- All filters (search, categories, protocols, tokens) send as query params
- Client-side filtering and sorting logic removed
- Types match new paginated response structure
- Old /api/yield/all route updated or removed
</success_criteria>

<output>
After completion, create `.planning/quick/001-adapt-frontend-paginated-yield/001-SUMMARY.md`
</output>
