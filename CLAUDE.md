# MaccBodyTracker (MeasureMe)

A mobile-first React web app for tracking body measurements over time with interactive visualizations. Single-user, no authentication.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS (dark mode via `dark:` class strategy)
- **Charts:** Recharts
- **Routing:** React Router v6
- **Database:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Dates:** date-fns
- **Hosting:** Vercel

## Commands

```bash
npm run dev       # Start dev server (Vite, hot reload)
npm run build     # TypeScript check + production build to dist/
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Button, Card, Modal, Input, Loading, EmptyState, ErrorBoundary
│   ├── layout/          # Header, Navigation, Layout
│   ├── measurements/    # CRUD UI, QuickLogBar, JP3FormModal
│   └── analytics/       # ProgressChart, ComparisonChart, StatsCard, DateRangePicker
├── contexts/            # ThemeContext, SettingsContext, ToastContext
├── hooks/               # useMeasurements, useEntries (Supabase CRUD)
├── lib/                 # supabase.ts (client init), utils.ts (formatting, conversions, JP3 calc)
├── pages/               # MeasurementsPage, AnalyticsPage, SettingsPage
├── types/               # All TypeScript interfaces and types
├── App.tsx              # Root component with routing
└── main.tsx             # Entry point
supabase/migrations/     # SQL schema (001_create_tables, 002_seed_measurements)
```

## Architecture

- **State:** React Context API (Theme, Settings, Toasts) — no Redux/Zustand
- **Data:** Custom hooks (`useMeasurements`, `useEntries`) wrap Supabase client calls
- **Imports:** Use `@/` path alias (maps to `src/`)
- **Components:** Functional only, barrel exports via `index.ts` files
- **Storage:** All measurement values stored in metric; converted to imperial for display only

## Database

Three tables: `measurements` (type definitions), `measurement_entries` (data points), `settings` (single-row user prefs). RLS disabled. Auto-updating timestamps via trigger.

## Environment

Requires `.env.local` with:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Conventions

- **Components:** PascalCase filenames matching component name, one per file
- **Functions/hooks:** camelCase
- **Constants:** UPPER_SNAKE_CASE
- **TypeScript:** Strict mode enabled. Interface for all component props
- **Styling:** Tailwind utilities in className, custom Sharky Blue color palette, responsive with `sm:`/`lg:` prefixes
- **No testing framework** currently configured
