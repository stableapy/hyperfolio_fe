'use client';

import { TerminalCard } from '@/components/ui/terminal-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import type { YieldFilterBarProps } from './types';

const CATEGORIES: Array<{
  value: 'all' | 'lending' | 'amm' | 'yield' | 'staking';
  label: string;
}> = [
  { value: 'all', label: 'All' },
  { value: 'lending', label: 'Lending' },
  { value: 'amm', label: 'AMM' },
  { value: 'yield', label: 'Yield' },
  { value: 'staking', label: 'Staking' },
];

/**
 * Props for YieldFilterBar component
 * @typedef {Object} YieldFilterBarProps
 * @property {string} searchQuery - Current search query text
 * @property {(query: string) => void} onSearchChange - Callback when search query changes
 * @property {'all' | 'lending' | 'amm' | 'yield' | 'staking'} selectedCategory - Currently selected category filter
 * @property {(category: 'all' | 'lending' | 'amm' | 'yield' | 'staking') => void} onCategoryChange - Callback when category changes
 * @property {'desc' | 'asc'} sortOrder - Current sort order for APY
 * @property {(order: 'desc' | 'asc') => void} onSortChange - Callback when sort order changes
 */

/**
 * YieldFilterBar Component
 * Provides search, category filter, and sort controls for yield opportunities
 *
 * @param {YieldFilterBarProps} props - Component props
 */
export function YieldFilterBar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  sortOrder,
  onSortChange,
  disabled = false,
}: YieldFilterBarProps) {
  return (
    <TerminalCard compact className="px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="text-theme-text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search token symbol..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search yield opportunities by token symbol"
            disabled={disabled}
            className="bg-theme-bg/30 border-theme-border/50 text-theme-text-primary placeholder:text-theme-text-muted h-9 pl-9 font-mono text-sm disabled:opacity-50"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="text-theme-text-muted size-4 sm:hidden" />
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(cat.value)}
              disabled={disabled}
              className={`h-9 font-mono text-xs uppercase ${
                selectedCategory === cat.value
                  ? 'bg-theme-accent border-theme-accent text-white'
                  : 'border-theme-border/50 text-theme-text-secondary hover:border-theme-accent bg-transparent'
              } disabled:opacity-50`}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Select
            value={sortOrder}
            onValueChange={(value: 'desc' | 'asc') => onSortChange(value)}
            disabled={disabled}
          >
            <SelectTrigger
              className="bg-theme-bg/30 border-theme-border/50 h-9 w-[180px] font-mono text-xs disabled:opacity-50"
              aria-label="Sort yield opportunities by APY"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-theme-border bg-theme-card-bg">
              <SelectItem value="desc" className="font-mono text-xs">
                <div className="flex items-center gap-2">
                  <TrendingDown className="size-3" />
                  APY High → Low
                </div>
              </SelectItem>
              <SelectItem value="asc" className="font-mono text-xs">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-3" />
                  APY Low → High
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </TerminalCard>
  );
}
