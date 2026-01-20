'use client';

import { useMemo, useState, useEffect } from 'react';
import { TerminalCard } from '@/components/ui/terminal-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
import { TokenLogo } from './token-logo';
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
  const [searchInput, setSearchInput] = useState(filters.searchQuery);
  const [minApyInput, setMinApyInput] = useState(filters.minApy);
  const [maxApyInput, setMaxApyInput] = useState(filters.maxApy);
  const [minTvlInput, setMinTvlInput] = useState(filters.minTvl);
  const [maxTvlInput, setMaxTvlInput] = useState(filters.maxTvl);

  const debounceMs = 400;

  useEffect(() => {
    setSearchInput(filters.searchQuery);
  }, [filters.searchQuery]);

  useEffect(() => {
    setMinApyInput(filters.minApy);
  }, [filters.minApy]);

  useEffect(() => {
    setMaxApyInput(filters.maxApy);
  }, [filters.maxApy]);

  useEffect(() => {
    setMinTvlInput(filters.minTvl);
  }, [filters.minTvl]);

  useEffect(() => {
    setMaxTvlInput(filters.maxTvl);
  }, [filters.maxTvl]);

  useEffect(() => {
    if (searchInput === filters.searchQuery) return;
    const timer = setTimeout(() => {
      onFiltersChange({ searchQuery: searchInput });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [searchInput, filters.searchQuery, onFiltersChange]);

  useEffect(() => {
    if (minApyInput === filters.minApy) return;
    const timer = setTimeout(() => {
      onFiltersChange({ minApy: minApyInput });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [minApyInput, filters.minApy, onFiltersChange]);

  useEffect(() => {
    if (maxApyInput === filters.maxApy) return;
    const timer = setTimeout(() => {
      onFiltersChange({ maxApy: maxApyInput });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [maxApyInput, filters.maxApy, onFiltersChange]);

  useEffect(() => {
    if (minTvlInput === filters.minTvl) return;
    const timer = setTimeout(() => {
      onFiltersChange({ minTvl: minTvlInput });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [minTvlInput, filters.minTvl, onFiltersChange]);

  useEffect(() => {
    if (maxTvlInput === filters.maxTvl) return;
    const timer = setTimeout(() => {
      onFiltersChange({ maxTvl: maxTvlInput });
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [maxTvlInput, filters.maxTvl, onFiltersChange]);

  // Fetch HyperEVM tokens for logo URIs
  const { data: hyperEvmTokens } = useHyperEvmTokens();

  // Create a map of token symbol to logo URI for quick lookup
  const tokenLogoMap = useMemo(() => {
    if (!hyperEvmTokens) return new Map<string, string>();
    return new Map(
      hyperEvmTokens.map((token) => [token.symbol.toUpperCase(), token.logoURI])
    );
  }, [hyperEvmTokens]);

  const tokenAddressMap = useMemo(() => {
    if (!hyperEvmTokens) return new Map<string, { symbol: string; logoURI?: string }>();
    return new Map(
      hyperEvmTokens.map((token) => [
        token.address.toLowerCase(),
        { symbol: token.symbol, logoURI: token.logoURI },
      ])
    );
  }, [hyperEvmTokens]);

  // Enhance tokens with logo URIs and sort by logo availability then alphabetically
  const tokensWithLogos: FilterOption[] = useMemo(() => {
    const enhancedTokens = availableTokens.map((token) => {
      const isAddress = token.value.startsWith('0x');
      const addressInfo = isAddress
        ? tokenAddressMap.get(token.value.toLowerCase())
        : undefined;
      const label = addressInfo?.symbol || token.label;
      const logoURI =
        addressInfo?.logoURI || tokenLogoMap.get(label.toUpperCase());

      return {
        ...token,
        label,
        logoURI,
      };
    });

    return enhancedTokens.sort((a, b) => {
      // Tokens with logos come first
      const aHasLogo = Boolean(a.logoURI);
      const bHasLogo = Boolean(b.logoURI);

      if (aHasLogo && !bHasLogo) return -1;
      if (!aHasLogo && bHasLogo) return 1;

      // Within each group, sort alphabetically
      return a.label.localeCompare(b.label);
    });
  }, [availableTokens, tokenLogoMap, tokenAddressMap]);

  const tokenShortcuts = useMemo(() => {
    if (tokensWithLogos.length === 0) return [];

    return [...tokensWithLogos]
      .sort((a, b) => {
        const countDelta = (b.count || 0) - (a.count || 0);
        if (countDelta !== 0) return countDelta;
        return a.label.localeCompare(b.label);
      })
      .slice(0, 6);
  }, [tokensWithLogos]);

  // Sort protocols alphabetically by name
  const sortedProtocols: FilterOption[] = useMemo(() => {
    return [...availableProtocols].sort((a, b) => a.label.localeCompare(b.label));
  }, [availableProtocols]);

  const hasActiveFilters =
    filters.selectedCategories.length > 0 ||
    filters.selectedProtocols.length > 0 ||
    filters.selectedTokens.length > 0 ||
    filters.minApy.trim() !== '' ||
    filters.maxApy.trim() !== '' ||
    filters.minTvl.trim() !== '' ||
    filters.maxTvl.trim() !== '' ||
    filters.stablecoinOnly ||
    filters.hypeOnly ||
    filters.searchQuery.length > 0;

  const handleResetAll = () => {
    onFiltersChange({
      selectedCategories: [],
      selectedProtocols: [],
      selectedTokens: [],
      minApy: '',
      maxApy: '',
      minTvl: '',
      maxTvl: '',
      stablecoinOnly: false,
      hypeOnly: false,
      searchQuery: '',
      sortOrder: 'desc',
    });
  };

  return (
    <TerminalCard compact className="px-3 py-3 sm:px-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="text-theme-text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search token symbol..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onBlur={() => {
              if (searchInput !== filters.searchQuery) {
                onFiltersChange({ searchQuery: searchInput });
              }
            }}
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
                <Tooltip>
                  <TooltipTrigger asChild>
                  <SelectTrigger
                    className="bg-theme-bg/30 border-theme-border/50 hover:bg-theme-bg/50 hover:text-theme-text-primary data-[state=open]:bg-theme-accent/15 data-[state=open]:text-theme-accent data-[state=open]:border-theme-accent/40 h-9 rounded-sm px-3 font-mono text-xs text-theme-text-secondary shadow-none transition-colors"
                    aria-label="Sort yield opportunities by APY"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-theme-text-muted text-[10px] uppercase tracking-wider">
                        APY
                      </span>
                      {filters.sortOrder === 'desc' ? (
                        <TrendingDown className="size-3.5 text-theme-accent" />
                      ) : (
                        <TrendingUp className="size-3.5 text-theme-accent" />
                      )}
                    </span>
                  </SelectTrigger>
                </TooltipTrigger>
                <TooltipContent className="bg-theme-bg border-theme-border border px-2 py-1 text-[10px] font-mono text-theme-text-secondary">
                  {filters.sortOrder === 'desc'
                    ? 'Currently sorting APY high → low (descending)'
                    : 'Currently sorting APY low → high (ascending)'}
                </TooltipContent>
              </Tooltip>
              <SelectContent className="border-theme-border bg-theme-card-bg">
                <SelectItem value="desc" className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="size-3.5 text-theme-accent" />
                    <span className="text-theme-text-muted text-[10px] uppercase tracking-wider">
                      APY
                    </span>
                    <span>High → Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="asc" className="font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="size-3.5 text-theme-accent" />
                    <span className="text-theme-text-muted text-[10px] uppercase tracking-wider">
                      APY
                    </span>
                    <span>Low → High</span>
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

        {tokenShortcuts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-theme-text-muted font-mono text-[10px] uppercase tracking-wide">
              Quick tokens
            </span>
            {tokenShortcuts.map((token) => {
              const isSelected = filters.selectedTokens.includes(token.value);
              return (
                <button
                  key={token.value}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    const updated = isSelected
                      ? filters.selectedTokens.filter((value) => value !== token.value)
                      : [...filters.selectedTokens, token.value];
                    onFiltersChange({ selectedTokens: updated });
                  }}
                  className={`border-theme-border/50 flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase transition-colors ${
                    isSelected
                      ? 'bg-theme-accent/15 text-theme-accent border-theme-accent/50'
                      : 'text-theme-text-secondary hover:text-theme-text-primary hover:border-theme-accent/50'
                  } disabled:opacity-50`}
                >
                  {token.logoURI ? (
                    <TokenLogo
                      src={token.logoURI}
                      symbol={token.label}
                      className="size-4"
                    />
                  ) : null}
                  <span>{token.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-theme-text-muted font-mono text-[10px] uppercase tracking-wide">
              APY %
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="min"
              value={minApyInput}
              onChange={(e) => setMinApyInput(e.target.value)}
              onBlur={() => {
                if (minApyInput !== filters.minApy) {
                  onFiltersChange({ minApy: minApyInput });
                }
              }}
              disabled={disabled}
              className="bg-theme-bg/30 border-theme-border/50 text-theme-text-primary h-8 w-[86px] px-2 font-mono text-xs"
            />
            <span className="text-theme-text-muted text-xs">-</span>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="max"
              value={maxApyInput}
              onChange={(e) => setMaxApyInput(e.target.value)}
              onBlur={() => {
                if (maxApyInput !== filters.maxApy) {
                  onFiltersChange({ maxApy: maxApyInput });
                }
              }}
              disabled={disabled}
              className="bg-theme-bg/30 border-theme-border/50 text-theme-text-primary h-8 w-[86px] px-2 font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-theme-text-muted font-mono text-[10px] uppercase tracking-wide">
              TVL $
            </span>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              placeholder="min"
              value={minTvlInput}
              onChange={(e) => setMinTvlInput(e.target.value)}
              onBlur={() => {
                if (minTvlInput !== filters.minTvl) {
                  onFiltersChange({ minTvl: minTvlInput });
                }
              }}
              disabled={disabled}
              className="bg-theme-bg/30 border-theme-border/50 text-theme-text-primary h-8 w-[110px] px-2 font-mono text-xs"
            />
            <span className="text-theme-text-muted text-xs">-</span>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              placeholder="max"
              value={maxTvlInput}
              onChange={(e) => setMaxTvlInput(e.target.value)}
              onBlur={() => {
                if (maxTvlInput !== filters.maxTvl) {
                  onFiltersChange({ maxTvl: maxTvlInput });
                }
              }}
              disabled={disabled}
              className="bg-theme-bg/30 border-theme-border/50 text-theme-text-primary h-8 w-[110px] px-2 font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </TerminalCard>
  );
}
