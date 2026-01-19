'use client';

import { useState, useMemo, useDeferredValue, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { List, type RowComponentProps } from 'react-window';
import { ProtocolLogo } from './protocol-logo';
import { TokenLogo } from './token-logo';
import { getProtocolLogoPath } from './utils';
import type { FilterOption } from './types';

interface MultiSelectFilterProps {
  triggerLabel: string;
  items: FilterOption[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  showProtocolLogo?: boolean;
  showTokenLogo?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// Item height for virtualized list (in pixels)
// Based on py-2 (16px) + content (~32px) = ~48px total
const ITEM_HEIGHT = 48;

export function MultiSelectFilter({
  triggerLabel,
  items,
  selectedValues,
  onSelectionChange,
  showProtocolLogo = false,
  showTokenLogo = false,
  disabled = false,
  placeholder = `Search ${triggerLabel.toLowerCase()}...`,
}: MultiSelectFilterProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const deferredSearchQuery = useDeferredValue(searchQuery);
  const normalizedQuery = deferredSearchQuery.trim().toLowerCase();

  const handleToggle = useCallback((value: string) => {
    const updated = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(updated);
  }, [selectedValues, onSelectionChange]);

  const handleClear = () => {
    onSelectionChange([]);
    setSearchQuery('');
  };

  const filteredItems = useMemo(() => {
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      item.label.toLowerCase().includes(normalizedQuery)
    );
  }, [items, normalizedQuery]);

  // Virtualized row component
  const Row = ({
    index,
    style,
    items: rowItems,
    selectedValues: rowSelectedValues,
    onToggle: rowOnToggle,
    showProtocolLogo: rowShowProtocolLogo,
    showTokenLogo: rowShowTokenLogo,
  }: RowComponentProps<{
    items: FilterOption[];
    selectedValues: string[];
    onToggle: (value: string) => void;
    showProtocolLogo: boolean;
    showTokenLogo: boolean;
  }>) => {
    const item = rowItems[index];
    const isSelected = rowSelectedValues.includes(item.value);

    return (
      <div style={style} className="px-2 py-2">
        <CommandItem
          value={item.label}
          onSelect={() => rowOnToggle(item.value)}
          className="flex items-center gap-2"
        >
          <Checkbox checked={isSelected} className="size-4" />
          {rowShowProtocolLogo && (
            <ProtocolLogo
              src={getProtocolLogoPath(item.label)}
              name={item.label}
              className="size-5"
            />
          )}
          {rowShowTokenLogo && (
            <TokenLogo
              src={item.logoURI || ''}
              symbol={item.label}
              className="size-5"
            />
          )}
          <span className="flex-1 text-sm">{item.label}</span>
          {item.count && (
            <span className="text-theme-text-muted text-xs opacity-60">
              ({item.count})
            </span>
          )}
          {isSelected && (
            <Check className="size-4 text-theme-accent" />
          )}
        </CommandItem>
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-9 font-mono text-xs bg-theme-bg/30 border-theme-border/50 data-[state=open]:bg-theme-accent data-[state=open]:text-white hover:bg-theme-bg/50"
        >
          {triggerLabel}
          {selectedValues.length > 0 && (
            <span className="ml-1 opacity-70">({selectedValues.length})</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[300px] p-0 border-theme-border bg-theme-card-bg"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9 border-theme-border/50"
          />
          <CommandList className="max-h-[300px]">
            <CommandGroup>
              {filteredItems.length > 0 ? (
                <div
                  style={{
                    height: `${Math.min(filteredItems.length * ITEM_HEIGHT, 300)}px`,
                  }}
                >
                  <List
                    rowComponent={Row}
                    rowCount={filteredItems.length}
                    rowHeight={ITEM_HEIGHT}
                    rowProps={{
                      items: filteredItems,
                      selectedValues,
                      onToggle: handleToggle,
                      showProtocolLogo,
                      showTokenLogo,
                    }}
                    overscanCount={3}
                    style={{ height: 300, width: '100%' }}
                  />
                </div>
              ) : (
                <CommandEmpty>No items found.</CommandEmpty>
              )}
            </CommandGroup>
          </CommandList>
          {selectedValues.length > 0 && (
            <div className="border-t border-theme-border/50 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full justify-start text-xs text-theme-text-muted hover:text-theme-text-primary"
              >
                <X className="mr-2 size-3" />
                Clear selection
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
