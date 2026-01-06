'use client';

import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResetAllButtonProps {
  onReset: () => void;
  disabled: boolean;
  hasActiveFilters: boolean;
}

export function ResetAllButton({
  onReset,
  disabled,
  hasActiveFilters,
}: ResetAllButtonProps) {
  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReset}
      disabled={disabled}
      className="h-9 font-mono text-xs text-theme-text-muted hover:text-theme-text-primary"
    >
      <RotateCcw className="mr-1 size-3" />
      Reset All
    </Button>
  );
}
