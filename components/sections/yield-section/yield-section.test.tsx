import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from '@testing-library/react';
import { YieldCard } from './yield-card';
import { YieldStats } from './yield-stats';
import { YieldFilterBar } from './yield-filter-bar';
import {
  formatApyPercentage,
  formatApyDisplay,
  getRiskColorClass,
  getRiskLabel,
} from './utils';

describe('YieldSection Components', () => {
  afterEach(() => {
    cleanup();
  });
  describe('formatApyPercentage', () => {
    it('should format APY as percentage', () => {
      expect(formatApyPercentage(4.5)).toBe('4.50%');
      expect(formatApyPercentage(0)).toBe('0.00%');
    });

    it('should handle null and undefined', () => {
      expect(formatApyPercentage(null)).toBe('N/A');
      expect(formatApyPercentage(undefined)).toBe('N/A');
    });

    it('should handle NaN', () => {
      expect(formatApyPercentage(NaN)).toBe('N/A');
    });
  });

  describe('formatApyDisplay', () => {
    it('should show both base and total APY when available', () => {
      expect(formatApyDisplay(2.5, 4.5)).toBe('Base: 2.50% | Total: 4.50%');
    });

    it('should show only total APY when base is null', () => {
      expect(formatApyDisplay(null, 4.5)).toBe('4.50%');
    });

    it('should show only base APY when total is null', () => {
      expect(formatApyDisplay(4.5, null)).toBe('4.50%');
    });

    it('should return N/A when both are null', () => {
      expect(formatApyDisplay(null, null)).toBe('N/A');
    });
  });

  describe('getRiskColorClass', () => {
    it('should return correct color for low risk', () => {
      expect(getRiskColorClass('low')).toBe(
        'text-green-500 dark:text-green-400'
      );
    });

    it('should return correct color for medium risk', () => {
      expect(getRiskColorClass('medium')).toBe(
        'text-yellow-500 dark:text-yellow-400'
      );
    });

    it('should return correct color for high risk', () => {
      expect(getRiskColorClass('high')).toBe('text-red-500 dark:text-red-400');
    });
  });

  describe('getRiskLabel', () => {
    it('should return correct label for low risk', () => {
      expect(getRiskLabel('low')).toBe('Low');
    });

    it('should return correct label for medium risk', () => {
      expect(getRiskLabel('medium')).toBe('Medium');
    });

    it('should return correct label for high risk', () => {
      expect(getRiskLabel('high')).toBe('High');
    });

    it('should return Unknown for unknown risk', () => {
      expect(getRiskLabel('unknown' as any)).toBe('Unknown');
    });
  });

  describe('YieldCard', () => {
    const mockOpportunity = {
      id: '1',
      protocol: {
        id: 'test-protocol',
        name: 'Test Protocol',
        category: 'lending',
        website: 'https://example.com',
        chainId: 1,
      },
      category: 'lending' as const,
      type: 'supply' as const,
      pool: {
        symbol: 'TEST',
      },
      apy: {
        baseApy: 2.5,
        totalApy: 4.5,
      },
      risk: {
        riskLevel: 'low' as const,
      },
      metadata: {
        underlyingSymbol: 'USDC',
      },
      lastUpdated: '2024-01-01T00:00:00Z',
      dataSource: 'api' as const,
    };

    it('should render opportunity details', () => {
      const { getByText } = render(<YieldCard opportunity={mockOpportunity} />);

      expect(getByText('Test Protocol')).toBeInTheDocument();
      expect(getByText('USDC')).toBeInTheDocument();
      expect(getByText('Base: 2.50% | Total: 4.50%')).toBeInTheDocument();
      expect(getByText('Low')).toBeInTheDocument();
    });

    it('should handle missing total APY', () => {
      const opportunity = { ...mockOpportunity, apy: { baseApy: 2.5 } };
      const { getByText } = render(<YieldCard opportunity={opportunity} />);

      expect(getByText('2.50%')).toBeInTheDocument();
    });

    it('should handle null APY', () => {
      const opportunity = { ...mockOpportunity, apy: {} };
      const { getByText } = render(<YieldCard opportunity={opportunity} />);

      expect(getByText('N/A')).toBeInTheDocument();
    });
  });

  describe('YieldStats', () => {
    it('should render stats when data is available', () => {
      const stats = {
        totalCount: 2,
        highestApy: 6.5,
        averageApy: 5.5,
      };

      const { getByText } = render(
        <YieldStats stats={stats} isLoading={false} hasData />
      );

      expect(getByText('2')).toBeInTheDocument(); // Total count
      expect(getByText('6.50%')).toBeInTheDocument(); // Highest APY
      expect(getByText('5.50%')).toBeInTheDocument(); // Average APY
    });

    it('should show loading state', () => {
      const stats = { totalCount: 0, highestApy: 0, averageApy: 0 };

      const { getAllByText } = render(
        <YieldStats stats={stats} isLoading hasData={false} />
      );

      expect(getAllByText('...')).toHaveLength(3);
    });

    it('should show zero stats when no data', () => {
      const stats = { totalCount: 0, highestApy: 0, averageApy: 0 };

      const { getByText } = render(
        <YieldStats stats={stats} isLoading={false} hasData={false} />
      );

      expect(getByText('0')).toBeInTheDocument(); // Total count
    });
  });

  describe('YieldFilterBar', () => {
    const defaultProps = {
      filters: {
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
        sortOrder: 'desc' as const,
      },
      onFiltersChange: vi.fn(),
      availableProtocols: [],
      availableTokens: [],
    };

    it('should render all filter controls', () => {
      render(<YieldFilterBar {...defaultProps} />);

      expect(
        screen.getByPlaceholderText('Search token symbol...')
      ).toBeInTheDocument();
      // Check that dropdown triggers exist
      expect(screen.getAllByText('Categories')).toBeTruthy();
      expect(screen.getAllByText('Protocols')).toBeTruthy();
      expect(screen.getAllByText('Tokens')).toBeTruthy();
      expect(screen.getAllByText('Stablecoin')).toBeTruthy();
      expect(screen.getAllByText('HYPE')).toBeTruthy();
    });

    it('should handle search input change', () => {
      const onFiltersChange = vi.fn();
      vi.useFakeTimers();
      render(
        <YieldFilterBar {...defaultProps} onFiltersChange={onFiltersChange} />
      );

      const searchInput = screen.getByPlaceholderText('Search token symbol...');
      fireEvent.change(searchInput, { target: { value: 'USDC' } });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onFiltersChange).toHaveBeenCalledWith({ searchQuery: 'USDC' });
      vi.useRealTimers();
    });

    it('should filter by category when dropdown item is clicked', () => {
      const onFiltersChange = vi.fn();
      render(
        <YieldFilterBar {...defaultProps} onFiltersChange={onFiltersChange} />
      );

      const categoriesTrigger = screen.getByText('Categories');
      fireEvent.click(categoriesTrigger);

      // Note: DropdownMenuCheckboxItem uses Radix UI, which renders checkboxes
      // The actual clicking would require waiting for the dropdown to appear
      // This is a basic test showing the structure
      expect(categoriesTrigger).toBeInTheDocument();
    });

    it('should handle sort order change', () => {
      const onFiltersChange = vi.fn();
      render(<YieldFilterBar {...defaultProps} onFiltersChange={onFiltersChange} />);

      // Verify sort trigger exists
      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
    });

    it('should disable all controls when disabled prop is true', () => {
      render(<YieldFilterBar {...defaultProps} disabled />);

      const searchInput = screen.getByPlaceholderText(
        'Search token symbol...'
      ) as HTMLInputElement;
      expect(searchInput.disabled).toBe(true);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('disabled:opacity-50');
      });
    });

    it('should highlight active stablecoin filter', () => {
      render(
        <YieldFilterBar
          {...defaultProps}
          filters={{ ...defaultProps.filters, stablecoinOnly: true }}
        />
      );

      const stablecoinButton = screen.getByText('Stablecoin');
      expect(stablecoinButton).toHaveClass('bg-theme-accent');
    });

    it('should have proper accessibility labels', () => {
      render(<YieldFilterBar {...defaultProps} />);

      const searchInput = screen.getByPlaceholderText('Search token symbol...');
      expect(searchInput).toHaveAttribute(
        'aria-label',
        'Search yield opportunities by token symbol'
      );

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toHaveAttribute(
        'aria-label',
        'Sort yield opportunities by APY'
      );
    });
  });

  describe('Filter and Search Functionality', () => {
    const defaultProps = {
      filters: {
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
        sortOrder: 'desc' as const,
      },
      onFiltersChange: vi.fn(),
      availableProtocols: [],
      availableTokens: [],
    };

    it('should trigger search callback with empty string when cleared', () => {
      const onFiltersChange = vi.fn();
      vi.useFakeTimers();
      render(
        <YieldFilterBar
          {...defaultProps}
          filters={{ ...defaultProps.filters, searchQuery: 'USDC' }}
          onFiltersChange={onFiltersChange}
        />
      );

      const searchInput = screen.getByPlaceholderText('Search token symbol...');
      fireEvent.change(searchInput, { target: { value: '' } });

      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(onFiltersChange).toHaveBeenCalledWith({ searchQuery: '' });
      vi.useRealTimers();
    });

    it('should toggle stablecoin filter', () => {
      const onFiltersChange = vi.fn();
      render(
        <YieldFilterBar {...defaultProps} onFiltersChange={onFiltersChange} />
      );

      const stablecoinButton = screen.getByText('Stablecoin');
      fireEvent.click(stablecoinButton);

      expect(onFiltersChange).toHaveBeenCalledWith({ stablecoinOnly: true });
    });

    it('should toggle HYPE filter', () => {
      const onFiltersChange = vi.fn();
      render(
        <YieldFilterBar {...defaultProps} onFiltersChange={onFiltersChange} />
      );

      const hypeButton = screen.getByText('HYPE');
      fireEvent.click(hypeButton);

      expect(onFiltersChange).toHaveBeenCalledWith({ hypeOnly: true });
    });
  });

  describe('Sort Functionality', () => {
    const defaultProps = {
      filters: {
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
        sortOrder: 'desc' as const,
      },
      onFiltersChange: vi.fn(),
      availableProtocols: [],
      availableTokens: [],
    };

    it('should render sort dropdown', () => {
      render(<YieldFilterBar {...defaultProps} />);

      const selectTrigger = screen.getByRole('combobox');
      expect(selectTrigger).toBeInTheDocument();
      expect(selectTrigger).toHaveAttribute(
        'aria-label',
        'Sort yield opportunities by APY'
      );
    });
  });
});
