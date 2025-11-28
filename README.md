# Crypto Screener

A modern, real-time cryptocurrency market screener with technical analysis and multi-timeframe tracking.

## Features

- Real-time market data from Binance API
- 134+ screening criteria for different market conditions
- Multi-timeframe analysis (5s, 15s, 30s, 45s, 1m, 3m, 5m, 15m)
- Technical indicators (VCP, Fibonacci pivots, weighted averages)
- 25+ trading pairs (TRY, USD, EUR, BTC, ETH, USDT, etc.)
- Price and volume alerts
- Interactive charts and visualizations
- Dark mode UI
- Mobile responsive design

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Charts**: TradingView Lightweight Charts
- **Storage**: IndexedDB (via idb)
- **Testing**: Vitest + React Testing Library

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 (or pnpm/yarn)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd crypto-screener
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Fix auto-fixable ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is formatted
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report

## Project Structure

```
crypto-screener/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # React components
│   │   ├── layout/      # Layout components (Header, Sidebar, Footer)
│   │   ├── market/      # Market overview components
│   │   ├── coin/        # Coin-specific components
│   │   ├── controls/    # Filter and control components
│   │   └── ui/          # Reusable UI components
│   ├── config/          # Configuration files
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API and business logic
│   │   ├── binanceApi.ts      # Binance API client
│   │   ├── dataProcessor.ts   # Data parsing and processing
│   │   └── timeframeService.ts # Timeframe tracking
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
│       └── indicators.ts # Technical indicator calculations
├── public/              # Public static files
├── tests/              # Test files
├── docs/               # Documentation
│   ├── STATE.md        # Project state tracking
│   └── ...
├── fast.html           # Legacy version (v1.0)
└── ROADMAP.md          # Development roadmap
```

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use functional components with hooks
- Keep components small and focused
- Write tests for critical functionality
- Run linting and formatting before committing

### Git Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting: `npm run test && npm run lint`
4. Commit with descriptive messages
5. Push and create a pull request

### Component Guidelines

- Use TypeScript interfaces for props
- Implement proper error boundaries
- Add loading and error states
- Make components accessible (WCAG 2.1 AA)
- Use semantic HTML
- Optimize for performance (memoization, virtualization)

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_BINANCE_API_URL=https://api.binance.com/api/v3
VITE_REFRESH_INTERVAL=5000
VITE_ENABLE_ANALYTICS=false
```

## API Integration

The application fetches data from Binance's public API:

- **Endpoint**: `https://api.binance.com/api/v3/ticker/24hr`
- **Rate Limit**: 1200 requests per minute (IP-based)
- **Response**: 24-hour ticker data for all trading pairs

No API key is required for public endpoints.

## Performance

- Bundle size target: < 500KB (gzipped)
- Initial load time: < 2s (3G connection)
- Time to Interactive: < 3s
- Lighthouse score: > 90 (all categories)

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### Build Issues

If you encounter build errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Type Errors

Run type checking to see detailed errors:
```bash
npm run type-check
```

### Port Already in Use

Change the port in `vite.config.ts` or use:
```bash
PORT=3001 npm run dev
```

## Migration from v1.0

The legacy version (`fast.html`) is preserved for reference. To migrate:

1. User settings and preferences are automatically converted
2. Export your watchlists from the old version (if applicable)
3. Import them in the new version via Settings

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

[License information here]

## Acknowledgments

- Binance API for market data
- TradingView for charting library
- React and TypeScript communities

## Contact

For questions or support, please open an issue on GitHub.

---

**Version**: 2.0.0
**Status**: In Development
**Last Updated**: 2025-11-28
