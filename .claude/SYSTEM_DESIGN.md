# Hyperfolio Frontend - Design System

Complete design system documentation for the Hyperfolio DeFi portfolio tracker.

## Table of Contents

1. [Overview](#overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Border Radius & Shadows](#border-radius--shadows)
6. [UI Components](#ui-components)
7. [Specialized Components](#specialized-components)
8. [Section Patterns](#section-patterns)
9. [Animation Patterns](#animation-patterns)
10. [Responsive Design](#responsive-design)

---

## Overview

Hyperfolio uses a **terminal-inspired aesthetic** with modern web technologies:

- **Framework**: Next.js 16 with Tailwind CSS 4.x
- **Color**: OKLCH color space with light/dark mode
- **Theme**: Cyberpunk green (dark) / Teal (light) accents
- **Typography**: Geist (sans), Geist Mono (mono), Source Serif 4 (serif)
- **Components**: Radix UI primitives wrapped with custom styling
- **Animation**: tw-animate-css plugin + custom animations

---

## Color System

### Theme Colors (Primary)

The design uses a cohesive theme with teal/green accents that switch between modes.

#### Light Mode
```css
--theme-bg: #f5f8f5                      /* Main background */
--theme-bg-alt: #e8efe8                 /* Alternate background */
--theme-accent: #0d9488                 /* Primary teal accent */
--theme-accent-darker: #0f766e          /* Hover states */
--theme-accent-muted: rgba(13, 148, 136, 0.08)  /* Muted backgrounds */
--theme-text-primary: #0a1a0f           /* Primary text */
--theme-text-secondary: #3d5a47         /* Secondary text */
--theme-text-muted: #6b8b76             /* Muted text */
--theme-grid-color: rgba(13, 148, 136, 0.12)     /* Grid lines */
--theme-border: rgba(0, 60, 20, 0.12)   /* Borders */
--theme-glow: rgba(13, 148, 136, 0.2)    /* Glow effects */
--theme-card-bg: #ffffff                /* Card background */
--theme-card-border: rgba(13, 148, 136, 0.12)    /* Card borders */
```

#### Dark Mode
```css
--theme-bg: #0a0f0f                     /* Dark background */
--theme-bg-alt: #0d1214                 /* Alternate dark background */
--theme-accent: #22c55e                 /* Cyberpunk green accent */
--theme-accent-darker: #16a34a          /* Darker green */
--theme-accent-muted: rgba(34, 197, 94, 0.08)     /* Muted green */
--theme-text-primary: #ffffff           /* White primary text */
--theme-text-secondary: #708090         /* Light gray secondary */
--theme-text-muted: #4a5568             /* Muted gray text */
--theme-grid-color: rgba(34, 197, 94, 0.06)       /* Subtle grid */
--theme-border: rgba(255, 255, 255, 0.1) /* Light borders */
--theme-glow: rgba(34, 197, 94, 0.35)    /* Green glow */
--theme-card-bg: #1a2225                /* Card background */
--theme-card-border: rgba(34, 197, 94, 0.2)       /* Card borders */
```

### Secondary Accents (Supporting Palette)

Used for category-specific styling (protocols, tags, etc.):

#### Light Mode
```css
--theme-cyan: #0e7490
--theme-purple: #7c3aed
--theme-orange: #ea580c
--theme-magenta: #db2777
--theme-red: #dc2626
```

#### Dark Mode
```css
--theme-cyan: #06b6d4
--theme-purple: #d946ef
--theme-orange: #f97316
--theme-magenta: #f43f5e
--theme-red: #ef4444
```

### Semantic Colors (shadcn/ui)

Base UI colors for dialogs, inputs, etc.:

#### Light Mode
```css
--background: oklch(0.98 0.005 220)
--foreground: oklch(0.2 0.02 220)
--card: oklch(1 0 0)
--card-foreground: oklch(0.145 0 0)
--primary: oklch(0.205 0 0)
--primary-foreground: oklch(0.985 0 0)
--secondary: oklch(0.95 0.01 220)
--muted: oklch(0.95 0.01 220)
--muted-foreground: oklch(0.45 0.02 220)
--accent: oklch(0.95 0.01 220)
--border: oklch(0.88 0.01 220)
--ring: oklch(0.708 0 0)
--destructive: oklch(0.577 0.245 27.325)
```

### Usage Patterns

```tsx
// Backgrounds
className="bg-theme-bg"
className="bg-theme-bg-alt"
className="bg-theme-accent/10"          // With opacity
className="bg-gradient-to-b from-theme-bg via-theme-accent/5 to-theme-bg-alt"

// Text
className="text-theme-text-primary"
className="text-theme-accent"
className="text-theme-cyan"

// Borders
className="border border-theme-border"
className="border-l-2 border-l-theme-accent/30"
```

---

## Typography

### Font Families

```css
--font-sans: 'Geist', 'Geist Fallback'
--font-mono: 'Geist Mono', 'Geist Mono Fallback'
--font-serif: 'Source Serif 4', 'Source Serif 4 Fallback'
```

### Font Size Scale

| Class      | Size  | Usage                          |
|------------|-------|--------------------------------|
| `text-[9px]`   | 9px   | Tiny terminal labels (mobile)  |
| `text-[10px]`  | 10px  | Small terminal labels          |
| `text-xs`      | 12px  | Captions, labels               |
| `text-sm`      | 14px  | Default body text              |
| `text-base`    | 16px  | Standard body text             |
| `text-lg`      | 18px  | Large body                     |
| `text-xl`      | 20px  | Section headings               |
| `text-2xl`     | 24px  | Large headings                 |
| `text-3xl`     | 30px  | Title headings                 |
| `text-4xl`     | 36px  | Hero headings                  |
| `text-5xl`     | 48px  | Large hero headings            |
| `text-6xl+`    | 60px+  | Display headings (rare)        |

### Font Weights

```tsx
font-normal     // 400
font-medium     // 500
font-semibold   // 600
font-bold       // 700
```

### Typography Patterns

```tsx
// Terminal-style labels
className="font-mono text-[9px] font-bold tabular-nums"

// Body text
className="font-sans text-sm text-theme-text-secondary"

// Headings
className="font-semibold text-lg text-theme-text-primary"

// Monospace numbers
className="tabular-nums"  // Aligns numbers in tables
```

---

## Spacing & Layout

### Spacing Scale

| Tailwind | rem | px  | Usage                          |
|----------|-----|-----|--------------------------------|
| `0`      | 0   | 0   | No spacing                     |
| `px`     | -   | 1   | Hairline                       |
| `0.5`    | 0.125| 2   | Minimal gap                    |
| `1`      | 0.25 | 4   | Tiny spacing                   |
| `1.5`    | 0.375| 6   | Small gap (custom)             |
| `2`      | 0.5  | 8   | Small spacing                  |
| `3`      | 0.75 | 12  | Medium spacing                 |
| `4`      | 1    | 16  | Standard spacing               |
| `6`      | 1.5  | 24  | Large spacing                  |
| `8`      | 2    | 32  | Extra large spacing            |

### Common Spacing Patterns

```tsx
// Card padding
className="p-3 sm:p-4"           // Responsive padding
className="px-6 py-4"            // Horizontal and vertical

// Section spacing
className="space-y-3"            // Vertical gap between items
className="space-y-4"            // Standard vertical spacing
className="gap-2"                // Flex/grid gap
className="gap-1.5"              // Small custom gap

// Container spacing
className="px-4 sm:px-6 md:px-10 lg:px-16"  // Responsive container padding
```

### Layout Patterns

**Two-Column with Sticky Sidebar:**
```tsx
<div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
  <div className="min-w-0 flex-1 space-y-4 pb-20 lg:pb-0">
    {/* Main content */}
  </div>
  <div className="hidden w-[380px] flex-shrink-0 lg:block">
    <div className="sticky top-25">
      {/* Sidebar */}
    </div>
  </div>
</div>
```

**Stats Grid:**
```tsx
<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4">
  {/* Stat cards */}
</div>
```

---

## Border Radius & Shadows

### Border Radius

```css
--radius: 0.625rem  // 10px base
--radius-sm: 6px     // Small corners
--radius-md: 8px     // Medium corners
--radius-lg: 10px    // Large corners (default)
--radius-xl: 14px    // Extra large
```

### Usage

```tsx
rounded-sm      // 2px - Terminal/sharp aesthetic
rounded-md      // 6px - Buttons, inputs
rounded-lg      // 8px - Cards
rounded-xl      // 12px - Large cards
rounded-full    // 50% - Circular elements
```

### Shadows

```css
// Base variables
--shadow-opacity: 0.08 (light) | 0.05 (dark)

// Computed shadows
shadow-xs       // Barely visible
shadow-sm       // Cards, buttons
shadow-md       // Raised elements (default)
shadow-lg       // Dropdowns, popovers
shadow-xl       // Modals
```

### Usage

```tsx
className="shadow-sm"              // Subtle card elevation
className="shadow-lg"              // Dialog elevation
className="hover:shadow-md"        // Hover elevation
```

---

## UI Components

All UI components use the `cn()` utility for class merging and follow these patterns:

### Common Patterns

- `data-slot` attributes for styling hooks
- `forwardRef` for ref forwarding
- `asChild` prop using Radix Slot
- `class-variance-authority` (cva) for variants

### Button

```tsx
<Button variant="default" size="default">
  Click me
</Button>
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
**Sizes:** `default`, `sm`, `lg`, `icon`, `icon-sm`, `icon-lg`

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

### Badge

```tsx
<Badge variant="default">Badge</Badge>
```

**Variants:** `default`, `secondary`, `destructive`, `outline`

### Input

```tsx
<Input type="text" placeholder="Enter text..." />
```

### Dialog

```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    Content
  </DialogContent>
</Dialog>
```

### Tooltip

Enhanced touch-friendly implementation with mobile tap support.

```tsx
<Tooltip>
  <TooltipTrigger>Hover</TooltipTrigger>
  <TooltipContent>Tooltip content</TooltipContent>
</Tooltip>
```

---

## Specialized Components

### StatPill

Terminal-style stat badges used across all sections.

```tsx
<StatPill
  color="accent"  // accent | cyan | purple | red | orange | magenta | muted
  icon="Wallet"
  label="--total"
  value="$123,456"
  secondaryValue="+12.5%"
  privacyMode={false}
/>
```

**Color Themes:**
- `accent`: Primary teal/green
- `cyan`, `purple`, `orange`, `magenta`, `red`: Category colors
- `muted`: Disabled/neutral state

### TerminalCard

Terminal-style card container with authentic aesthetic.

```tsx
<TerminalCard showHeader title="section --list">
  <div className="px-4 py-3">
    Content
  </div>
</TerminalCard>
```

Features:
- Sharp corners (`rounded-sm`)
- Optional command-line header
- Scan line effect support

### TerminalHeader

Command-line style header with `>` prompt.

```tsx
<TerminalHeader command="wallet --balance" />
```

---

## Section Patterns

All sections follow this consistent structure:

### Standard Section Layout

```tsx
<div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
  {/* Left: Main Content */}
  <div className="min-w-0 flex-1 space-y-4 pb-20 lg:pb-0">
    {/* 1. Stats/Summary Cards */}
    {/* 2. Filter/Controls */}
    {/* 3. Content List in TerminalCard */}
  </div>

  {/* Right: Sticky Swap Widget (lg+) */}
  <div className="hidden w-[380px] flex-shrink-0 lg:block">
    <div className="sticky top-25">
      <SwapWidgetInline />
    </div>
  </div>
</div>
```

### Terminal List Pattern

```tsx
<TerminalCard showHeader title="section --list">
  <div className="divide-theme-border/30 divide-y">
    {items.map((item) => (
      <div
        key={item.id}
        className="group hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-2.5"
      >
        <ItemContent item={item} />
      </div>
    ))}
  </div>
</TerminalCard>
```

### Stats Grid Pattern

```tsx
<div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 md:gap-4">
  <StatPill color="accent" ... />
  <StatPill color="cyan" ... />
  <StatPill color="purple" ... />
</div>
```

---

## Animation Patterns

### tw-animate-css

Imported plugin for data-state animations:

```tsx
"data-[state=open]:animate-in"
"data-[state=closed]:animate-out"
"data-[state=open]:fade-in-0"
"data-[state=closed]:fade-out-0"
"data-[state=open]:zoom-in-95"
"data-[state=closed]:zoom-out-95"
```

### Text Glow Effects

```css
.text-glow-green {
  text-shadow:
    0 0 10px rgba(34, 197, 94, 0.5),
    0 0 20px rgba(34, 197, 94, 0.3),
    0 0 30px rgba(34, 197, 94, 0.1);
}
```

Available variants: `text-glow-green`, `text-glow-red`, `text-glow-amber`, `text-glow-lime`

### Transitions

```tsx
// Standard
className="transition-all duration-200"

// Optimized (color only)
className="transition-colors"

// Optimized (specific props)
className="transition-[color,box-shadow]"
```

### Loading Animations

```tsx
// Skeleton pulse
className="bg-accent animate-pulse rounded-md"

// Spinner
className="border-[#00ff41] border-t-transparent rounded-full animate-spin"
```

---

## Responsive Design

### Breakpoints (Mobile-First)

| Breakpoint | Width | Usage              |
|------------|-------|--------------------|
| (default)  | 0px   | Mobile base styles |
| `sm:`      | 640px | Small tablets      |
| `md:`      | 768px | Large tablets      |
| `lg:`      | 1024px| Laptops            |
| `xl:`      | 1280px| Desktops           |
| `2xl:`     | 1536px| Large desktops     |

### Responsive Patterns

```tsx
// Typography
className="text-xs sm:text-sm md:text-base"

// Spacing
className="p-3 sm:p-4 md:p-6"

// Layout
className="flex-col sm:flex-row"

// Visibility
className="hidden sm:block"        // Hide on mobile
className="block sm:hidden"        // Mobile only

// Grid
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
```

### Container Padding

```tsx
className="px-4 sm:px-6 md:px-10 lg:px-16"
```

---

## Utility Patterns

### cn() Function

```typescript
import { cn } from '@/lib/utils'

// Merges classes with Tailwind conflicts resolved
className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className
)}
```

### Icon Patterns

```tsx
import { CheckIcon, ChevronDownIcon } from 'lucide-react'

// Standard size
<CheckIcon className="size-4" />

// With opacity
<ChevronDownIcon className="size-4 opacity-50" />

// In buttons (auto-size)
<Button>
  <CheckIcon />  // Auto-sized to 4
  Click me
</Button>
```

### Privacy Mode Pattern

```tsx
const privacyMode = useWalletStore((state) => state.privacyMode)

<span>{privacyMode ? '••••••' : `$${formattedValue}`}</span>
```

---

## Quick Reference

### Common Terminal Classes

```tsx
// Terminal text
"font-mono text-[9px] font-bold tabular-nums sm:text-[10px]"

// Terminal card
"bg-theme-card-bg border border-theme-border/70 rounded-sm"

// Terminal header
"font-mono text-theme-text-muted uppercase tracking-wider text-[10px]"

// List items
"hover:border-l-theme-accent border-l-2 border-l-transparent px-3 py-2.5"
```

### Common Color Classes

```tsx
// Backgrounds
bg-theme-bg
bg-theme-bg-alt
bg-theme-accent/10
bg-theme-card-bg

// Text
text-theme-text-primary
text-theme-text-secondary
text-theme-accent
text-theme-cyan

// Borders
border-theme-border
border-theme-accent/30
border-l-theme-cyan/40
```

---

## Component Checklist

When creating new components, ensure:

- [ ] Use `cn()` for class merging
- [ ] Add `data-slot` attribute
- [ ] Support dark mode with theme variables
- [ ] Use responsive classes (mobile-first)
- [ ] Include loading/skeleton states
- [ ] Support privacy mode
- [ ] Use theme colors (not hardcoded values)
- [ ] Follow spacing conventions
- [ ] Add proper TypeScript types
- [ ] Include accessibility attributes

---

## File Locations

```
components/
├── ui/                    # Radix UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── portfolio-hero/        # Hero section
├── sections/              # Main sections
│   ├── defi-section/
│   ├── tokens-section/
│   ├── nfts-section/
│   └── yield-section/
└── specialized/           # Custom components
    ├── stat-pill.tsx
    ├── terminal-card.tsx
    └── empty.tsx

app/
├── globals.css           # Theme variables
└── layout.tsx            # Font configuration
```

---

*Generated for Hyperfolio Frontend - DeFi Portfolio Tracker*
