# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-28

### Phase 3 Completion - Component Architecture

#### Added
- **SearchBar Component** - Real-time coin filtering with debouncing
  - Filter by symbol or full symbol name
  - Clear button and search hints
  - 300ms debounce for performance

- **TimeframeSelector Component** - Switch between 10 timeframes
  - Visual grid layout with selected state
  - Support for 5s, 10s, 15s, 30s, 45s, 60s, 1m, 3m, 5m, 15m

- **Reusable UI Components**
  - `Button.tsx` - 4 variants, 3 sizes, loading state support
  - `Input.tsx` - Form input with label, error, helper text
  - `Badge.tsx` - 5 variants for status indicators

- **CoinModal Component** - Detailed coin analysis view
  - Full-screen modal with 3-column layout
  - Price statistics, volume data, order book
  - Keyboard support (Esc to close)
  - Click outside to close

- **TechnicalIndicators Component** - Comprehensive indicator display
  - VCP value with formula
  - Fibonacci pivot levels (6 levels)
  - Price ratios (4 metrics)
  - Volume metrics (4 metrics)
  - Market dominance (ETH, BTC, PAXG)
  - Change metrics (from WA, from prev close)

- **ExternalLinks Component** - Quick access to trading tools
  - CoinGlass (liquidation heatmap)
  - Aggr.trade (real-time order flow)
  - Binance (direct trading)
  - TradingView (advanced charting)

- **TIMEFRAMES Constant** - Added to types/coin.ts for reusability

#### Changed
- **App.tsx** - Major integration update
  - Added search functionality with live filtering
  - Integrated TimeframeSelector in sidebar
  - Added modal state management
  - Enhanced empty states for search results
  - Shows filtered count vs total count

- **CoinTable Component** - Enhanced interactivity
  - Added clickable rows
  - Added `onCoinClick` callback prop
  - Visual feedback on hover

- **Type Exports** - Updated barrel exports
  - `components/controls/index.ts` - Added SearchBar, TimeframeSelector
  - `components/coin/index.ts` - Added TechnicalIndicators, ExternalLinks, CoinModal
  - `components/ui/index.ts` - Created with Button, Input, Badge

#### Fixed
- TypeScript compilation errors with strict mode
- Property name mismatches in TechnicalIndicators
- Missing format function imports

### Phase 2 Completion - Code Extraction & Modularization

#### Added
- **Type Definitions** (7 files, ~1,500 lines)
  - `types/api.ts` - Binance API types
  - `types/coin.ts` - Coin data with 32+ fields
  - `types/market.ts` - Market statistics
  - `types/alert.ts` - Alert system (7 types)
  - `types/screener.ts` - Screening lists
  - `types/config.ts` - App configuration

- **Services Layer**
  - `services/binanceApi.ts` - API client with retry logic
  - `services/dataProcessor.ts` - Symbol parsing for 32 pairs
  - `services/timeframeService.ts` - 10 timeframes tracking
  - `services/mockData.ts` - Development data with CORS workaround

- **Utilities**
  - `utils/indicators.ts` - VCP, Fibonacci calculations
  - `utils/format.ts` - Number/date formatting
  - `utils/sort.ts` - Coin sorting utilities

- **State Management**
  - Zustand store with localStorage persistence
  - Global state for pair, sort, filters, refresh settings

#### Changed
- Extracted 900+ lines of business logic from fast.html
- 100% type safety with strict TypeScript mode

### Phase 1 Completion - Foundation & Project Setup

#### Added
- **Project Structure**
  - Modern directory layout (src/, public/, tests/, docs/)
  - Git repository initialization
  - Comprehensive .gitignore

- **Build Tooling**
  - Vite configuration with path aliases
  - TypeScript strict mode
  - ESLint + Prettier
  - Vitest + React Testing Library

- **Styling**
  - Tailwind CSS with custom theme
  - Dark mode optimized colors
  - Custom utility classes

- **Documentation**
  - README.md with setup instructions
  - ROADMAP.md with 9-phase plan
  - STATE.md for progress tracking
  - .env.example for configuration

- **React App**
  - React 18 with TypeScript
  - TanStack Query for data fetching
  - Layout components (Header, Footer, Layout)
  - QueryClientProvider setup

#### Changed
- Installed 468 npm packages
- Bundle size: 71.84KB gzipped (under 500KB target)

## Project Metrics

### Current State (2025-11-28)
- **Files**: 74+ files created
- **Lines of Code**: ~12,500 lines (from 3,029 monolithic)
- **Bundle Size**: 234KB uncompressed, 71.84KB gzipped
- **Build Time**: 1.58s
- **Test Coverage**: 0% (framework ready, tests pending)
- **Type Coverage**: 100% (strict mode)
- **Components**: 20+ reusable components

### Progress
- **Phases Completed**: 3 of 9 (33%)
- **MVP Status**: Core functionality complete
- **Production Ready**: Not yet (needs backend proxy for API)

## Upcoming

### Phase 4 - Modern UI/UX Design
- shadcn/ui component library integration
- 134 screening lists implementation
- TradingView Lightweight Charts
- Advanced table features (filters, column customization)
- Mobile responsiveness improvements
- Theme toggle (dark/light)

### Phase 5 - Performance Optimization
- Virtualized lists for 100+ coins
- Code splitting optimization
- WebSocket for real-time data
- Service worker for offline support

### Phase 6 - Advanced Features
- Alert system implementation
- Watchlist functionality
- Historical data playback
- Portfolio tracking integration

## Notes

- CORS limitation requires mock data for browser-based development
- Production deployment will need backend proxy or WebSocket API
- Original fast.html preserved as reference
- All 134 screening lists types defined, UI pending Phase 4
