'use client';

import { useMemo } from 'react';
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
import { Search, TrendingUp, TrendingDown, Grid3x3, List } from 'lucide-react';
import { MultiSelectFilter } from './multi-select-filter';
import { ResetAllButton } from './reset-all-button';
import { useHyperEvmTokens } from '@/hooks/use-hyperevm-tokens';
import type { YieldFilterBarProps, YieldCategoryFilter, FilterOption } from './types';

const CATEGORIES: Array<{
  value: Exclude<YieldCategoryFilter, 'all'>;
  label: string;
  count?: number;
}> = [
  { value: 'lending', label: 'Lending' },
  { value: 'amm', label: 'AMM' },
  { value: 'yield', label: 'Yield' },
  { value: 'staking', label: 'Staking' },
  { value: 'derivatives', label: 'Derivatives' },
];

/**
 * YieldFilterBar Component
 * Provides search, multi-select filters, and sort controls for yield opportunities
 */
export function YieldFilterBar({
  filters,
  onFiltersChange,
  availableProtocols,
  availableTokens,
  disabled = false,
  viewMode = 'list',
  onViewModeChange,
}: YieldFilterBarProps) {
  // Fetch HyperEVM tokens for logo URIs
  const { data: hyperEvmTokens } = useHyperEvmTokens();

  // Create a map of token symbol to logo URI for quick lookup
  const tokenLogoMap = useMemo(() => {
    if (!hyperEvmTokens) return new Map<string, string>();
    return new Map(
      hyperEvmTokens.map((token) => [token.symbol.toUpperCase(), token.logoURI])
    );
  }, [hyperEvmTokens]);

  // Enhance tokens with logo URIs and sort by logo availability then alphabetically
  const tokensWithLogos: FilterOption[] = useMemo(() => {
    const enhancedTokens = availableTokens.map((token) => ({
      ...token,
      logoURI: tokenLogoMap.get(token.label.toUpperCase()),
    }));

    return enhancedTokens.sort((a, b) => {
      // Tokens with logos come first
      const aHasLogo = Boolean(a.logoURI);
      const bHasLogo = Boolean(b.logoURI);

      if (aHasLogo && !bHasLogo) return -1;
      if (!aHasLogo && bHasLogo) return 1;

      // Within each group, sort alphabetically
      return a.label.localeCompare(b.label);
    });
  }, [availableTokens, tokenLogoMap]);

  // Sort protocols alphabetically by name
  const sortedProtocols: FilterOption[] = useMemo(() => {
    return [...availableProtocols].sort((a, b) => a.label.localeCompare(b.label));
  }, [availableProtocols]);

  const hasActiveFilters =
    filters.selectedCategories.length > 0 ||
    filters.selectedProtocols.length > 0 ||
    filters.selectedTokens.length > 0 ||
    filters.stablecoinOnly ||
    filters.hypeOnly ||
    filters.searchQuery.length > 0;

  const handleResetAll = () => {
    onFiltersChange({
      selectedCategories: [],
      selectedProtocols: [],
      selectedTokens: [],
      stablecoinOnly: false,
      hypeOnly: false,
      searchQuery: '',
      sortOrder: 'desc',
    });
  };

  return (
    <TerminalCard compact className="px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="text-theme-text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search token symbol..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ searchQuery: e.target.value })}
            aria-label="Search yield opportunities by token symbol"
            disabled={disabled}
            className="bg-theme-bg/30 border-theme-border/50 text-theme-text-primary placeholder:text-theme-text-muted h-9 pl-9 font-mono text-sm disabled:opacity-50"
          />
        </div>

        {/* Multi-Select Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Categories Dropdown */}
          <MultiSelectFilter
            triggerLabel="Categories"
            items={CATEGORIES}
            selectedValues={filters.selectedCategories}
            onSelectionChange={(values) =>
              onFiltersChange({ selectedCategories: values as YieldCategoryFilter[] })
            }
            disabled={disabled}
            placeholder="Search categories..."
          />

          {/* Protocols Dropdown */}
          <MultiSelectFilter
            triggerLabel="Protocols"
            items={sortedProtocols}
            selectedValues={filters.selectedProtocols}
            onSelectionChange={(values) =>
              onFiltersChange({ selectedProtocols: values })
            }
            showProtocolLogo={true}
            disabled={disabled}
            placeholder="Search protocols..."
          />

          {/* Tokens Dropdown */}
          <MultiSelectFilter
            triggerLabel="Tokens"
            items={tokensWithLogos}
            selectedValues={filters.selectedTokens}
            onSelectionChange={(values) =>
              onFiltersChange({ selectedTokens: values })
            }
            showTokenLogo={true}
            disabled={disabled}
            placeholder="Search tokens..."
          />

          {/* Stablecoin Toggle */}
          <Button
            variant={filters.stablecoinOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltersChange({ stablecoinOnly: !filters.stablecoinOnly })}
            disabled={disabled}
            className={`h-9 font-mono text-xs uppercase ${
              filters.stablecoinOnly
                ? 'bg-theme-accent border-theme-accent text-white'
                : 'border-theme-border/50 text-theme-text-secondary hover:border-theme-accent bg-transparent'
            } disabled:opacity-50`}
          >
            Stablecoin
          </Button>

          {/* HYPE Toggle */}
          <Button
            variant={filters.hypeOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFiltersChange({ hypeOnly: !filters.hypeOnly })}
            disabled={disabled}
            className={`h-9 font-mono text-xs uppercase ${
              filters.hypeOnly
                ? 'bg-theme-accent border-theme-accent text-white'
                : 'border-theme-border/50 text-theme-text-secondary hover:border-theme-accent bg-transparent'
            } disabled:opacity-50`}
          >
            HYPE
          </Button>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex bg-theme-card-bg border border-theme-border/70 rounded-sm overflow-hidden">
              <button
                type="button"
                onClick={() => onViewModeChange('card')}
                disabled={disabled}
                className={`px-2.5 py-2 transition-all duration-150 border-r border-theme-border/50 ${
                  viewMode === 'card'
                    ? 'bg-theme-purple/10 text-theme-purple'
                    : 'text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg/50'
                } disabled:opacity-50`}
                aria-label="Switch to card view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                disabled={disabled}
                className={`px-2.5 py-2 transition-all duration-150 ${
                  viewMode === 'list'
                    ? 'bg-theme-purple/10 text-theme-purple'
                    : 'text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg/50'
                } disabled:opacity-50`}
                aria-label="Switch to list view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.sortOrder}
            onValueChange={(value: 'desc' | 'asc') =>
              onFiltersChange({ sortOrder: value })
            }
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

          <ResetAllButton
            onReset={handleResetAll}
            disabled={disabled}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>
    </TerminalCard>
  );
}
