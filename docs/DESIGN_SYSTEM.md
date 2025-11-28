# Crypto Screener Design System

A comprehensive design system for consistent, accessible, and beautiful user interfaces.

## Table of Contents

- [Overview](#overview)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Usage Examples](#usage-examples)

---

## Overview

The design system is built on **Tailwind CSS** with custom tokens defined in:
- `src/styles/design-system.ts` - Design token definitions
- `tailwind.config.js` - Tailwind configuration with extended theme

### Design Principles

1. **Dark-First**: Optimized for extended screen time with dark mode as default
2. **Trading-Focused**: Semantic colors for bullish/bearish/neutral market states
3. **Accessibility**: WCAG 2.1 AA compliant contrast ratios
4. **Consistency**: 4px base unit for spacing, modular scale for typography
5. **Performance**: Utility-first approach for minimal CSS bundle size

---

## Color Palette

### Trading Colors

Used for price movements, gains/losses, and market sentiment indicators.

```tsx
// Bullish (Green) - Gains, positive movements
className="text-bullish"           // #10b981
className="bg-bullish"
className="border-bullish"
className="bg-bullish-bg"          // Semi-transparent background
className="text-bullish-light"     // Lighter shade
className="text-bullish-dark"      // Darker shade

// Bearish (Red) - Losses, negative movements
className="text-bearish"           // #ef4444
className="bg-bearish"
className="bg-bearish-bg"

// Neutral (Gray) - No change, inactive
className="text-neutral"           // #6b7280
className="bg-neutral-bg"
```

### Semantic Colors

For UI feedback and status indicators.

```tsx
// Success - Completed actions, confirmations
className="text-success"           // #22c55e
className="bg-success"

// Danger - Errors, destructive actions
className="text-danger"            // #ef4444
className="bg-danger"

// Warning - Caution, medium priority
className="text-warning"           // #f59e0b
className="bg-warning"

// Info - Informational, neutral messages
className="text-info"              // #3b82f6
className="bg-info"
```

### Surface Colors

For backgrounds, cards, and panels in dark mode.

```tsx
className="bg-surface-dark"        // #0f172a - Deep surfaces
className="bg-surface"             // #1e293b - Default surface
className="bg-surface-light"       // #334155 - Light surface
className="bg-surface-lighter"     // #475569 - Lighter surface
```

### Text Colors

```tsx
className="text-text-primary"      // #f8fafc - Primary text
className="text-text-secondary"    // #cbd5e1 - Secondary text
className="text-text-tertiary"     // #94a3b8 - Tertiary text
className="text-text-disabled"     // #64748b - Disabled text
```

### Border Colors

```tsx
className="border-border"          // #334155 - Default
className="border-border-light"    // #475569 - Light
className="border-border-dark"     // #1e293b - Dark
className="border-border-hover"    // #64748b - Hover state
className="border-border-focus"    // #2B95FF - Focus ring
```

### Accent Colors

```tsx
className="text-accent"            // #2B95FF - Primary brand
className="bg-accent"
className="text-secondary"         // #8b5cf6 - Secondary accent
className="bg-secondary"
```

---

## Typography

### Font Families

```tsx
className="font-sans"              // Inter, system-ui
className="font-mono"              // JetBrains Mono (for numbers)
```

### Font Sizes

Based on modular scale (1.25 ratio):

```tsx
className="text-xs"                // 12px - Captions, labels
className="text-sm"                // 14px - Secondary text
className="text-base"              // 16px - Body text (default)
className="text-lg"                // 18px - Emphasized text
className="text-xl"                // 20px - Section headings
className="text-2xl"               // 24px - Card titles
className="text-3xl"               // 30px - Page headings
className="text-4xl"               // 36px - Hero text
className="text-5xl"               // 48px - Large displays
className="text-6xl"               // 60px - Extra large displays
```

### Font Weights

```tsx
className="font-light"             // 300
className="font-normal"            // 400 - Body text
className="font-medium"            // 500 - Emphasis
className="font-semibold"          // 600 - Headings
className="font-bold"              // 700 - Strong emphasis
className="font-extrabold"         // 800
```

### Letter Spacing

```tsx
className="tracking-tighter"       // -0.05em
className="tracking-tight"         // -0.025em
className="tracking-normal"        // 0
className="tracking-wide"          // 0.025em
className="tracking-wider"         // 0.05em
className="tracking-widest"        // 0.1em
```

### Usage Examples

```tsx
// Heading hierarchy
<h1 className="text-3xl font-semibold text-text-primary">Page Title</h1>
<h2 className="text-2xl font-semibold text-text-primary">Section Title</h2>
<h3 className="text-xl font-medium text-text-primary">Subsection</h3>

// Body text
<p className="text-base text-text-secondary">Regular paragraph text</p>
<p className="text-sm text-text-tertiary">Secondary information</p>

// Monospace for numbers
<span className="font-mono text-bullish">+5.23%</span>
<span className="font-mono text-lg">$42,350.00</span>
```

---

## Spacing

Based on 4px base unit (8-point grid system):

```tsx
// Padding
className="p-2"                    // 8px
className="p-4"                    // 16px
className="p-6"                    // 24px
className="p-8"                    // 32px

// Margin
className="m-2"                    // 8px
className="m-4"                    // 16px

// Gap (Flexbox/Grid)
className="gap-2"                  // 8px
className="gap-4"                  // 16px
className="gap-6"                  // 24px

// Space between
className="space-y-4"              // 16px vertical spacing
className="space-x-2"              // 8px horizontal spacing
```

### Spacing Scale

- `0.5` = 2px
- `1` = 4px
- `1.5` = 6px
- `2` = 8px
- `3` = 12px
- `4` = 16px ✅ Preferred for cards/components
- `6` = 24px ✅ Preferred for sections
- `8` = 32px ✅ Preferred for page margins
- `12` = 48px
- `16` = 64px

---

## Components

### Border Radius

```tsx
className="rounded-sm"             // 2px - Small (badges)
className="rounded"                // 4px - Default (buttons, inputs)
className="rounded-md"             // 6px - Medium (cards)
className="rounded-lg"             // 8px - Large (panels, modals)
className="rounded-xl"             // 12px - Extra large
className="rounded-2xl"            // 16px - Very large
className="rounded-full"           // Circular/pill
```

### Shadows

```tsx
className="shadow-sm"              // Subtle shadow
className="shadow"                 // Default shadow
className="shadow-md"              // Medium shadow (cards)
className="shadow-lg"              // Large shadow (modals)
className="shadow-xl"              // Extra large shadow
className="shadow-2xl"             // Very large shadow

// Glowing effects
className="shadow-glow-bullish"    // Green glow
className="shadow-glow-bearish"    // Red glow
className="shadow-glow-accent"     // Blue glow
```

### Transitions

```tsx
className="transition-fastest"     // 75ms - Instant feedback
className="transition-fast"        // 150ms - Hover states
className="transition"             // 200ms - Default
className="transition-slow"        // 300ms - Smooth animations

// With properties
className="transition-colors"      // Color transitions
className="transition-transform"   // Transform transitions
className="transition-all"         // All properties

// Timing functions
className="ease-in"
className="ease-out"
className="ease-in-out"
className="ease-bounce"            // Bounce effect
```

### Z-Index

Layering for stacking contexts:

```tsx
className="z-10"                   // Dropdowns
className="z-20"                   // Sticky elements
className="z-30"                   // Fixed headers
className="z-40"                   // Modal backdrops
className="z-50"                   // Modal content
className="z-60"                   // Tooltips
className="z-70"                   // Notifications
className="z-100"                  // Maximum priority
```

---

## Usage Examples

### Card Component

```tsx
<div className="bg-surface-dark border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
  <h3 className="text-xl font-semibold text-text-primary mb-2">
    Card Title
  </h3>
  <p className="text-sm text-text-secondary">
    Card description text
  </p>
</div>
```

### Button Variants

```tsx
// Primary button
<button className="px-4 py-2 bg-accent text-white rounded-lg font-medium transition-colors hover:bg-accent-dark">
  Primary Action
</button>

// Secondary button
<button className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg font-medium transition-colors hover:bg-surface-light">
  Secondary Action
</button>

// Danger button
<button className="px-4 py-2 bg-danger text-white rounded-lg font-medium transition-colors hover:bg-danger-dark">
  Delete
</button>
```

### Price Display

```tsx
// Bullish price
<span className="font-mono text-lg text-bullish">
  +5.23%
</span>

// Bearish price
<span className="font-mono text-lg text-bearish">
  -2.15%
</span>

// With background
<span className="px-2 py-1 bg-bullish-bg text-bullish border border-bullish-border rounded font-mono text-sm">
  +5.23%
</span>
```

### Input Field

```tsx
<input
  type="text"
  className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-focus transition-colors"
  placeholder="Search coins..."
/>
```

### Badge

```tsx
// Success badge
<span className="inline-flex px-2 py-1 bg-success-light/10 text-success border border-success/20 rounded text-xs font-medium">
  Active
</span>

// Warning badge
<span className="inline-flex px-2 py-1 bg-warning-light/10 text-warning border border-warning/20 rounded text-xs font-medium">
  Pending
</span>
```

### Loading Skeleton

```tsx
<div className="bg-surface-light animate-pulse rounded h-4 w-32" />
```

---

## Best Practices

### Color Usage

1. **Use semantic colors for meaning**: Bullish for gains, bearish for losses
2. **Maintain contrast**: Ensure text is readable on backgrounds (WCAG AA: 4.5:1 ratio)
3. **Don't rely on color alone**: Use icons, text labels, or patterns for accessibility
4. **Use backgrounds sparingly**: `bg-bullish-bg` instead of full `bg-bullish` for large areas

### Typography

1. **Font hierarchy**: Use consistent heading sizes (3xl → 2xl → xl → lg)
2. **Monospace for numbers**: Use `font-mono` for all numeric values
3. **Line height**: Use default line heights for readability
4. **Text colors**: Primary for headings, secondary for body, tertiary for captions

### Spacing

1. **Use consistent increments**: Prefer 4, 6, 8 over arbitrary values
2. **White space is good**: Don't cram elements together
3. **Vertical rhythm**: Use `space-y-*` for consistent vertical spacing
4. **Container padding**: Use p-4 (mobile) and p-6 (desktop) for cards

### Animations

1. **Use sparingly**: Only for meaningful feedback
2. **Keep it fast**: 150-300ms for most interactions
3. **Prefer transforms**: Use `transform` over position/size changes
4. **Reduce motion**: Respect `prefers-reduced-motion` for accessibility

---

## Accessibility

### Contrast Ratios

All color combinations meet WCAG 2.1 AA standards:

- **Text on dark backgrounds**: 7:1+ ratio (AAA)
- **Large text (18px+)**: 4.5:1+ ratio (AA)
- **UI elements**: 3:1+ ratio (AA)

### Focus States

All interactive elements must have visible focus indicators:

```tsx
className="focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2 focus:ring-offset-surface-dark"
```

### Screen Reader Support

Use semantic HTML and ARIA attributes:

```tsx
<button aria-label="Close modal" className="...">
  <XIcon />
</button>
```

---

## Migration Guide

### From Old Styles to Design System

```tsx
// Before
<div style={{ color: '#10b981' }}>

// After
<div className="text-bullish">

// Before
<span style={{ fontSize: '14px', color: 'gray' }}>

// After
<span className="text-sm text-text-secondary">

// Before
<div style={{ padding: '16px', backgroundColor: '#1e293b' }}>

// After
<div className="p-4 bg-surface">
```

---

## Resources

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Color Palette Tool**: https://uicolors.app
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Typography Scale**: https://typescale.com/

---

**Last Updated**: December 2025  
**Version**: 2.0.0
