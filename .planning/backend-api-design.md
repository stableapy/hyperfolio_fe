# Backend API Design for Optimized Frontend Performance

**Created**: 2025-01-19
**Purpose**: Design backend endpoints to solve frontend performance issues with ~4000 items

---

## Problem Statement

The frontend is experiencing severe performance issues when filtering and rendering large datasets:

1. **Filter lag**: Category, Protocol, and Token filters are slow (~500ms-2s delays)
2. **View switch freeze**: Table/card view switching causes UI freezes
3. **Button freezes**: "stablecoin" and "hype" buttons block the UI
4. **No pagination**: All ~4000 items sent and processed client-side

**Root cause**: All filtering and sorting happens client-side on the full dataset.

---

## Current Frontend Data Flow

### Existing API Endpoints

```
GET /api/wallet/aggregate/stream (SSE)
→ Streams: tokens, nfts, history
→ Returns: All tokens in single response (~4000 items)

GET /api/positions/stream (SSE)
→ Streams: DeFi positions by protocol
→ Returns: ~20-50 positions (already manageable)
```

### Current Data Structure

```typescript
interface Token {
  address: string;
  balance: string;
  symbol: string;
  name: string;
  decimals: string;
  usdPrice: string;
  usdValue: string;
  image_url: string | null;
  type: string;      // "token", "stablecoin", "nft"
  chain?: string;
  protocol?: string; // For DeFi tokens
}
```

### Current Frontend Filtering (PROBLEMATIC)

```typescript
// components/sections/tokens-section/utils.ts
export function filterTokens(tokens: Token[], query: string): Token[] {
  if (!query.trim()) return tokens;
  const lowerQuery = query.toLowerCase();
  return tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(lowerQuery) ||
      token.name.toLowerCase().includes(lowerQuery)
  );
}

// Multiple filters applied sequentially:
// 1. Search query filter
// 2. Category filter (token, stablecoin, nft)
// 3. Protocol filter (uniswap, aave, etc.)
// 4. Min value filter
// 5. Sort operation

// Each filter creates a new array of ~4000 items
```

---

## Proposed Backend API Design

### Overview: Server-Side Filtering with Pagination

**Key principles**:
1. **Server-side filtering**: All filter operations happen on the backend
2. **Pagination**: Return paginated results (default: 50 items per page)
3. **Metadata**: Return filter options and counts from the backend
4. **Caching**: Cache filtered results on the backend
5. **Streaming for large datasets**: Keep SSE for initial data load

---

## New API Endpoints

### 1. Paginated Tokens Endpoint

```
GET /api/tokens

Query Parameters:
- wallet_addresses: string[]      (required)
- page: number                    (default: 1)
- page_size: number               (default: 50, max: 200)
- search: string                  (optional: search query)
- categories: string[]            (optional: ["token", "stablecoin", "nft"])
- protocols: string[]             (optional: ["uniswap", "aave", ...])
- chains: string[]                (optional: ["ethereum", "polygon", ...])
- min_value: number               (optional: minimum USD value)
- max_value: number               (optional: maximum USD value)
- sort_by: string                 (default: "usdValue", options: "usdValue", "symbol", "name")
- sort_order: string              (default: "desc", options: "asc", "desc")
```

#### Response Structure

```typescript
interface PaginatedTokensResponse {
  // Paginated results
  data: Token[];

  // Pagination metadata
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };

  // Filter metadata (for UI filter options)
  metadata: {
    // Available filter options with counts
    categories: {
      value: string;
      label: string;
      count: number;
    }[];

    protocols: {
      value: string;
      label: string;
      count: number;
    }[];

    chains: {
      value: string;
      label: string;
      count: number;
    }[];

    // Aggregated totals
    totals: {
      total_value: number;
      total_tokens: number;
    };
  };

  // Current filters applied (for UI state)
  filters: {
    search: string | null;
    categories: string[];
    protocols: string[];
    chains: string[];
    min_value: number | null;
    max_value: number | null;
    sort_by: string;
    sort_order: string;
  };
}
```

#### Example Request/Response

**Request**:
```
GET /api/tokens?
  wallet_addresses=0x123...abc,0x456...def&
  page=1&
  page_size=50&
  categories=stablecoin,token&
  min_value=100&
  sort_by=usdValue&
  sort_order=desc
```

**Response**:
```json
{
  "data": [
    {
      "address": "0xa0b86a33e6d81b17a9c7c85b3b1d3c7b0e5f6g7h",
      "symbol": "USDC",
      "name": "USD Coin",
      "balance": "5000000000",
      "decimals": "6",
      "usdPrice": "1.00",
      "usdValue": "5000.00",
      "type": "stablecoin",
      "chain": "ethereum",
      "protocol": null,
      "image_url": "https://example.com/usdc.png"
    },
    // ... 49 more tokens
  ],
  "pagination": {
    "current_page": 1,
    "page_size": 50,
    "total_items": 847,
    "total_pages": 17,
    "has_next_page": true,
    "has_prev_page": false
  },
  "metadata": {
    "categories": [
      { "value": "token", "label": "Tokens", "count": 520 },
      { "value": "stablecoin", "label": "Stablecoins", "count": 847 },
      { "value": "nft", "label": "NFTs", "count": 1240 }
    ],
    "protocols": [
      { "value": "uniswap", "label": "Uniswap", "count": 45 },
      { "value": "aave", "label": "Aave", "count": 12 },
      { "value": "curve", "label": "Curve", "count": 8 }
    ],
    "chains": [
      { "value": "ethereum", "label": "Ethereum", "count": 1200 },
      { "value": "polygon", "label": "Polygon", "count": 890 }
    ],
    "totals": {
      "total_value": 125000.50,
      "total_tokens": 2607
    }
  },
  "filters": {
    "search": null,
    "categories": ["stablecoin", "token"],
    "protocols": [],
    "chains": [],
    "min_value": 100,
    "max_value": null,
    "sort_by": "usdValue",
    "sort_order": "desc"
  }
}
```

---

### 2. Filter Metadata Endpoint (Lightweight)

```
GET /api/tokens/filters/metadata

Query Parameters:
- wallet_addresses: string[]  (required)
```

#### Response Structure

```typescript
interface TokenFiltersMetadata {
  categories: {
    value: string;
    label: string;
    count: number;
  }[];

  protocols: {
    value: string;
    label: string;
    count: number;
  }[];

  chains: {
    value: string;
    label: string;
    count: number;
  }[];

  // Value range for slider
  value_range: {
    min: number;
    max: number;
  };
}
```

#### Use Case
Load filter options quickly without fetching all token data. Use on page load to populate filter dropdowns.

---

### 3. Single Token Detail Endpoint

```
GET /api/tokens/:address

Query Parameters:
- wallet_addresses: string[]  (required)
```

#### Response Structure

```typescript
interface TokenDetailResponse {
  token: Token;
  transactions: {
    total: number;
    recent: Transaction[];
  };
  history: {
    price_history: PricePoint[];
    value_history: ValuePoint[];
  };
}
```

#### Use Case
Show token details when clicking on a token in the list.

---

## Backend Implementation Requirements

### Database Queries

1. **Indexing Strategy**:
   ```sql
   -- Essential indexes for filtering
   CREATE INDEX idx_tokens_wallet_address ON tokens(wallet_address);
   CREATE INDEX idx_tokens_type ON tokens(type);
   CREATE INDEX idx_tokens_protocol ON tokens(protocol);
   CREATE INDEX idx_tokens_chain ON tokens(chain);
   CREATE INDEX idx_tokens_usd_value ON tokens(usd_value);
   CREATE INDEX idx_tokens_symbol ON tokens(symbol);
   ```

2. **Efficient Filtering Query**:
   ```sql
   SELECT * FROM tokens
   WHERE wallet_address IN ($1, $2, ...)
     AND type = ANY($3)  -- categories filter
     AND protocol = ANY($4)  -- protocols filter
     AND usd_value >= $5  -- min_value filter
   ORDER BY usd_value DESC
   LIMIT $6 OFFSET $7;  -- pagination
   ```

3. **Count Query for Metadata**:
   ```sql
   -- Get counts for each filter option
   SELECT
     type,
     COUNT(*) as count,
     SUM(usd_value) as total_value
   FROM tokens
   WHERE wallet_address IN ($1, $2, ...)
   GROUP BY type;
   ```

### Caching Strategy

1. **Redis Cache for Filtered Results**:
   ```javascript
   const cacheKey = `tokens:${walletAddresses}:${hashFilters(filters)}`;

   // Cache for 30 seconds
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);

   const result = await queryDatabase(filters);
   await redis.setex(cacheKey, 30, JSON.stringify(result));
   return result;
   ```

2. **Invalidate Cache On**:
   - New wallet added
   - Sync triggered
   - 30 seconds TTL expires

### Performance Requirements

1. **Response Time Targets**:
   - Filtered tokens API: < 200ms
   - Filter metadata API: < 100ms
   - Token detail API: < 150ms

2. **Query Optimization**:
   - Use prepared statements
   - Limit result set with pagination
   - Use database indexes
   - Implement query result caching

---

## Frontend Migration Plan

### Phase 1: Add New Endpoints Alongside Existing

```typescript
// New hook for paginated tokens
export function usePaginatedTokens(filters: TokenFilters) {
  const [page, setPage] = useState(1);

  return useQuery({
    queryKey: ['tokens', 'paginated', filters, page],
    queryFn: () => fetchPaginatedTokens({ ...filters, page }),
    staleTime: 30000, // 30 seconds
  });
}
```

### Phase 2: Update UI Components

1. **Replace client-side filtering with server-side**:
   ```typescript
   // Before (client-side)
   const filteredTokens = filterTokens(allTokens, searchQuery);

   // After (server-side)
   const { data, isLoading } = usePaginatedTokens({ search: searchQuery });
   ```

2. **Add pagination controls**:
   ```typescript
   <Pagination
     currentPage={data.pagination.current_page}
     totalPages={data.pagination.total_pages}
     onPageChange={setPage}
   />
   ```

3. **Use metadata for filter options**:
   ```typescript
   const { data: metadata } = useTokenFiltersMetadata();

   <FilterSelect options={metadata.categories} />
   <FilterSelect options={metadata.protocols} />
   ```

### Phase 3: Keep SSE for Initial Load

SSE streaming remains useful for:
- Initial data population
- Real-time updates
- Progress indication

Hybrid approach:
1. Use SSE to load initial data progressively
2. Switch to paginated API for user interactions
3. Use SSE to refresh data on sync

---

## Key Performance Improvements

### Before (Current State)

| Operation | Time | Issue |
|-----------|------|-------|
| Initial load | 5-10s | SSE streams all ~4000 items |
| Filter change | 500ms-2s | Client-side filters all items |
| View switch | 300ms-1s | Re-renders all items |
| Search keystroke | 100-300ms | Filters on every keystroke |

### After (With Backend Filtering)

| Operation | Time | Improvement |
|-----------|------|-------------|
| Initial load | 5-10s | Same (SSE unchanged) |
| Filter change | < 200ms | **5-10x faster** |
| View switch | < 50ms | **6-20x faster** |
| Search keystroke | < 200ms (debounced) | **Similar (but debounced)** |
| Pagination | < 100ms | **New capability** |

---

## Summary for Backend Implementation

### Must-Have Features

1. ✅ **GET /api/tokens** - Paginated, filtered tokens endpoint
2. ✅ **Server-side filtering** - All filter logic on backend
3. ✅ **Filter metadata** - Return available options with counts
4. ✅ **Database indexes** - On filter/sort columns
5. ✅ **Redis caching** - Cache filtered results

### Nice-to-Have Features

1. ⭐ **GET /api/tokens/filters/metadata** - Lightweight metadata endpoint
2. ⭐ **GET /api/tokens/:address** - Token detail endpoint
3. ⭐ **Query result caching** - Cache common filter combinations
4. ⭐ **Response compression** - Gzip responses

### Implementation Priority

1. **High Priority**: Core `/api/tokens` endpoint with filtering and pagination
2. **Medium Priority**: Metadata endpoint and caching
3. **Low Priority**: Token detail endpoint (can use existing endpoints)

---

## Next Steps

1. **Share this document with backend agent**
2. **Backend agent implements**: `/api/tokens` endpoint with filtering, pagination, and metadata
3. **Frontend updates**: Use new endpoint in tokens-section component
4. **Testing**: Verify performance improvements with ~4000 items
5. **Migration**: Gradually replace client-side filtering with server-side

---

**End of Document**
