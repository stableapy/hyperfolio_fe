'use client';

import { Coins, ImageIcon, TrendingUp, Clock, Zap, Trophy } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SectionNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const SECTIONS = [
  {
    id: 'tokens',
    label: 'Tokens',
    icon: Coins,
    ariaLabel: 'View token balances',
  },
  {
    id: 'defi',
    label: 'DeFi',
    icon: TrendingUp,
    ariaLabel: 'View DeFi positions',
  },
  // TODO: Re-enable yield tab in next upgrade
  // {
  //   id: 'yield',
  //   label: 'Yield',
  //   icon: Percent,
  //   ariaLabel: 'View yield opportunities',
  // },
  {
    id: 'points',
    label: 'Points',
    icon: Trophy,
    ariaLabel: 'View protocol points',
  },
  {
    id: 'nfts',
    label: 'NFTs',
    icon: ImageIcon,
    ariaLabel: 'View NFT collections',
  },
  {
    id: 'hypercore',
    label: 'Hypercore',
    icon: Zap,
    ariaLabel: 'View Hypercore assets',
  },
  {
    id: 'transactions',
    label: 'History',
    icon: Clock,
    ariaLabel: 'View transaction history',
  },
];

export function SectionNav({
  activeSection,
  onSectionChange,
}: SectionNavProps) {
  return (
    <TooltipProvider>
      <nav
        className="flex w-full justify-between gap-0 pb-px sm:justify-start sm:gap-2"
        aria-label="Portfolio sections"
        role="tablist"
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <Tooltip key={section.id}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${section.id}-panel`}
                  aria-label={section.ariaLabel}
                  onClick={() => onSectionChange(section.id)}
                  className={`group -mb-px flex flex-1 items-center justify-center gap-2 border-b-2 px-2 py-3 font-mono text-sm transition-all sm:flex-initial sm:justify-start sm:px-4 ${
                    isActive
                      ? 'border-theme-accent text-theme-accent dark:text-glow-green'
                      : 'text-theme-text-secondary hover:text-theme-accent hover:border-theme-border border-transparent'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 sm:h-4 sm:w-4 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}
                    aria-hidden="true"
                  />
                  <span className="hidden sm:inline">{section.label}</span>
                </button>
              </TooltipTrigger>
              {/* Tooltip only shows on mobile - hidden on sm and up */}
              <TooltipContent
                side="bottom"
                className="bg-theme-bg-alt border-theme-border font-mono text-xs sm:hidden"
              >
                {section.label}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}
