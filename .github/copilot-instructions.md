# AI Coding Agent Instructions - Crypto Screener

## Project Overview
Real-time cryptocurrency market screener refactored from a 3,029-line monolithic HTML file into a modern React/TypeScript application. Fetches data from Binance API, processes 134+ screening criteria, and provides multi-timeframe technical analysis for 25+ trading pairs.

**Legacy Version**: `fast.html` (preserved for reference) - do NOT modify  
**Current Status**: Phase 3 complete (33% overall)  
**Project Tracking**: See `ROADMAP.md` for 9-phase plan and `docs/STATE.md` for detailed action log

### Project Lifecycle Context
- **Start Date**: November 28, 2025
- **Completed Phases**: 1 (Foundation), 2 (Modularization), 3 (Components)
- **Current Phase**: Ready for Phase 4 (Modern UI/UX Design)
- **Next Priorities**: Screening list selector (134 lists), TradingView charts, advanced filtering
- **Files Created**: 74+ files from 1 monolithic HTML file
- **Bundle Size**: 71.84KB gzipped (target: <500KB) ✅

## Core Architecture

### Data Flow Pipeline
1. **Fetch** → `binanceApi.ts` (with retry logic + CORS proxy in dev)
2. **Parse** → `BinanceApiClient.parseTickerBatch()` converts strings to numbers
3. **Filter** → `dataProcessor.ts` filters by currency pair, excludes delisted coins
4. **Enrich** → `indicators.ts` calculates VCP, Fibonacci pivots, technical ratios
5. **Track** → `timeframeService.ts` manages snapshots at 5s/15s/30s/1m/3m/5m/15m intervals
6. **Cache** → TanStack Query handles caching with `['marketData', pair]` key
7. **Store** → Zustand persists user preferences (pair/sort/config) to localStorage

### State Management Strategy
- **Server State**: TanStack Query in `useMarketData` hook (auto-refresh, caching)
- **Global State**: Zustand store in `useStore` hook (user settings, persisted)
- **Local State**: React useState/useMemo for UI-only state (search, modals)

**Critical**: Never duplicate state between Query and Zustand - Query owns data, Zustand owns preferences

### Type System Organization
All types centralized in `src/types/` with barrel exports via `index.ts`:
- `coin.ts` - Core data models (35 currency pairs, 10 timeframes)
- `api.ts` - Binance API contracts (raw + processed)
- `market.ts` - Aggregated market stats
- `screener.ts` - 134+ filtering presets
- `config.ts` - User preferences with defaults

**Pattern**: Import from `@/types` only, never from individual files

## Development Workflows

### Running the App
```bash
npm run dev          # Starts on localhost:3000 with CORS proxy
npm run build        # TypeScript compilation + Vite bundling
npm run preview      # Test production build locally
```

### Testing & Quality
```bash
npm run type-check   # ALWAYS run before commits (strict mode enabled)
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Prettier formatting
npm test             # Vitest watch mode
npm run test:coverage # Generate coverage reports
```

**Required**: All PRs must pass `npm run type-check && npm run lint` without warnings

### Path Aliases (configured in vite.config.ts)
Use `@/` prefix for all imports:
```typescript
import { Coin } from '@/types/coin'           // NOT '../../../types/coin'
import { Button } from '@/components/ui'      // Use barrel exports
import { useMarketData } from '@/hooks'       // Consistent aliases
```

## Project-Specific Conventions

### Technical Indicator Calculations
**VCP (Volatility Contraction Pattern)** - Primary sorting metric:
```typescript
// Formula: (P/WA) * [((close-low)-(high-close))/(high-low)]
// See utils/indicators.ts for full implementation
calculateVCP(coin) // Returns weighted volatility score
```

**Fibonacci Pivots** - 7 support/resistance levels calculated from 24hr high/low/close

### Currency Pair Parsing Logic
Symbol parsing handles variable-length suffixes (3-5 chars):
```typescript
// BTCUSDT → { coin: 'BTC', pair: 'USDT' } (4-char suffix)
// ETHFDUSD → { coin: 'ETH', pair: 'FDUSD' } (5-char suffix)
// See dataProcessor.ts CURRENCY_PAIRS map - sorted longest-first
```

**Excluded Coins**: Filters out delisted/problematic coins (`LUNA`, `LUNC`, `USTC`, etc.)

### Component Architecture Patterns

#### Layout Structure
```
<Layout> (Header/Footer wrapper)
  ├── Controls (Sidebar: PairSelector, RefreshControl, TimeframeSelector)
  ├── MarketSummary (Aggregated stats)
  ├── CoinTable (Sortable data grid)
  └── CoinModal (Detailed view with charts)
```

#### Component Guidelines
- **UI Components** (`src/components/ui/`): Presentational only, no hooks except useState
- **Feature Components** (coin/market/controls): Can use any hooks, handle business logic
- **Props Pattern**: Always define TypeScript interfaces, export if reusable
- **Styling**: Use Tailwind utility classes, semantic color vars (`text-bullish`, `text-bearish`)

#### Barrel Exports Pattern
Every component directory has `index.ts`:
```typescript
export { CoinTable } from './CoinTable'
export { CoinModal } from './CoinModal'
// Allows: import { CoinTable, CoinModal } from '@/components/coin'
```

### API Integration & Error Handling

#### CORS Strategy
**Development**: Uses `allorigins.win` proxy (see `config/api.ts`)  
**Production**: Requires backend proxy (CORS not supported by Binance)

#### Retry Logic
`binanceApi.ts` implements exponential backoff (3 retries, 10s timeout):
```typescript
// Falls back to mockData.ts on failure
// NEVER remove fallback - enables offline development
```

#### Mock Data Toggle
Set `USE_MOCK_DATA = true` in `services/mockData.ts` to work offline

### Timeframe Snapshot System
`timeframeService.ts` maintains historical snapshots:
- Tracks last update timestamp per timeframe
- `shouldUpdate(timeframe)` checks if interval elapsed
- `createSnapshot()` captures price/volume/VCP at update time
- `calculateDelta()` computes % changes from snapshot

**Why**: Enables "vs 15s ago" comparisons without storing full history

### Performance Optimizations

#### Code Splitting (vite.config.ts)
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom'],
  'query-vendor': ['@tanstack/react-query'],
  'chart-vendor': ['lightweight-charts'],  // Heavy dependency
}
```

#### Memoization Strategy
```typescript
// GOOD: Memoize filtered/sorted arrays
const filtered = useMemo(() => coins.filter(...), [coins, query])

// BAD: Don't memoize simple calculations
const isPending = isLoading || isFetching  // No useMemo needed
```

## Critical "Gotchas"

1. **Weighted Average Price**: Binance's `weightedAvgPrice` is VWAP - central to VCP calculations
2. **Quote Volume**: Volume measured in quote currency (TRY/USDT), NOT base currency
3. **Symbol Parsing Order**: MUST check longest suffixes first (`FDUSD` before `USD`)
4. **Timeframe Independence**: Each timeframe tracked separately - updates don't cascade
5. **Zustand Persistence**: Changes to `DEFAULT_CONFIG` won't override existing localStorage

## Essential Files to Review First

### For Understanding Data Flow
1. **`src/hooks/useMarketData.ts`** - Complete data pipeline from API to UI
2. **`src/services/dataProcessor.ts`** - Currency pair parsing logic (handles 3-5 char suffixes)
3. **`src/utils/indicators.ts`** - VCP/Fibonacci calculations (core business logic)
4. **`src/types/coin.ts`** - Core data model (228 lines, 32+ fields)

### For Understanding Project State
1. **`ROADMAP.md`** - 9-phase refactor plan with checkmarks showing completed work
2. **`docs/STATE.md`** - Complete action log with 1,191 lines of decisions/changes
3. **`README.md`** - Setup instructions and architecture overview
4. **`fast.html`** - Legacy version (DO NOT MODIFY - reference only)

### For Adding Features
- Check `ROADMAP.md` Phase 4-6 tasks to align with planned work
- Review `docs/STATE.md` "files.created" section to avoid duplication
- Verify against "Working Features" and "Known Issues" in ROADMAP status

## Debugging Tips
- Check browser console for "Using mock data" - indicates API failure
- If types break, run `npm run type-check` to see all errors (not just VSCode hints)
- TanStack Query DevTools available in dev mode (see React DevTools panel)
- Zustand state visible in browser localStorage: `appConfig` key

## Migration Context
This refactor transforms a monolithic HTML/CSS/JS file into modular architecture while preserving:
- All 134+ screening criteria logic
- Turkish locale support (future phase)
- Original VCP/Fibonacci calculations
- localStorage compatibility

**Do NOT**: Reference `fast.html` patterns - it represents the OLD architecture

## Working with ROADMAP.md and docs/STATE.md

### Before Starting Any Task
1. **Check ROADMAP.md** - Is this task already planned? Which phase?
2. **Check docs/STATE.md** - Has similar work been done? Any relevant decisions?
3. **Update both files** after completing significant work

### ROADMAP.md Structure
- **9 Phases**: Foundation → Modularization → Components → UI/UX → Performance → Advanced Features → QA → Deployment → Migration
- **Phase Status**: Uses checkmarks (✅) for completed tasks
- **Current Status Summary**: Bottom section with metrics (bundle size, file count, features)
- **Known Issues**: Lists limitations and planned improvements

### docs/STATE.md Structure
- **JSON Metadata**: Phase tracking, dates, progress percentages
- **Phase Tasks**: Detailed completion status with notes
- **Files Section**: Complete list of created/modified files with purposes
- **Codebase Insights**: Technical analysis of original `fast.html`
- **Tech Stack Decisions**: Rationale for React/TypeScript/Zustand/etc.

### When to Update These Files
**Update ROADMAP.md when**:
- Completing a major task (add ✅)
- Adding new features to track
- Updating "Current Status Summary" metrics
- Discovering new "Known Issues"

**Update docs/STATE.md when**:
- Starting/completing a phase
- Creating new files (add to "files.created")
- Making architectural decisions
- Fixing critical bugs (add to "files.modified")

### Example Workflow
```
1. Check ROADMAP.md Phase 4 tasks → "Add screening list selector"
2. Check docs/STATE.md → No similar component exists
3. Implement feature
4. Update ROADMAP.md → Add ✅ to task
5. Update docs/STATE.md → Add to files.created with purpose
6. Update "Current Status Summary" if bundle size/metrics changed
```
