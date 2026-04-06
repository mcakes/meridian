# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Meridian

Meridian is a React design system / component library for trading and financial applications. It provides themed UI primitives, data components, charting, a command palette, keyboard shortcuts, and workspace layout management. It is built as an ES module library (`dist/meridian.js`) with CSS tokens (`dist/meridian.css`).

## Commands

```bash
npm run build          # TypeScript check + Vite library build
npm test               # Run all tests (vitest run)
npm run test:watch     # Run tests in watch mode
npx vitest run src/path/to/file.test.ts  # Run a single test file
npm run dev:site       # Dev server for the documentation site (site/)
npm run dev:demo       # Dev server for the demo app (demo/)
```

## Architecture

### Library (src/)

The library entry point is `src/index.ts`, which re-exports everything consumers need.

- **components/** — organized by domain:
  - `primitives/` — low-level display: CatDot, PriceChange, FlashCell, MetricCard, Tag, ThresholdValue, HealthBar, HeatmapCell, Spinner
  - `inputs/` — form controls: Toggle, NumberInput, Select, DatePicker, Autocomplete, Button
  - `data/` — DataTable (AG Grid wrapper with `ag-grid-meridian.css` theme), Sparkline (SVG)
  - `charting/` — Chart and TimeseriesChart (Plotly.js wrappers using `meridian-plotly-template.ts` for consistent styling)
  - `layout/` — Panel, PanelHeader, Toolbar, Workspace (flexlayout-react), sidebar system (SidebarProvider/Sidebar/Palette with reducer-based state)
  - `feedback/` — Toast, Modal (Radix Dialog), NotificationFeed, Tooltip (Radix)
  - `menus/` — DropdownMenu (Radix)
  - `command-palette/` — CommandPalette with fuzzy scoring, argument stepping, frequency-based sorting
  - `shortcuts/` — ShortcutProvider, ShortcutOverlay, useShortcuts, hotkey parsing
- **hooks/** — useFlash (cell flash animation), useTheme, useWorkspace
- **providers/** — ThemeProvider (sets `data-theme` attribute on `<html>`, persists to localStorage)
- **tokens/** — CSS custom properties for colors, borders, spacing, typography; switched via `data-theme="dark"|"light"`
- **lib/** — utilities (format.ts for number/currency formatting)

### Theming

Theme is driven by CSS custom properties defined in `src/tokens/`. The `ThemeProvider` sets `data-theme` on the document root. Tailwind CSS (v4, via `@tailwindcss/postcss`) consumes these variables. Components read theme values through CSS vars, not JS.

### Build

Vite builds the library in ES module format. React, Radix, AG Grid, Plotly, flexlayout-react, and dnd-kit are externalized (peer dependencies). The `@` path alias maps to `src/`.

### Apps

- **site/** — documentation site with its own Vite config, router, and pages
- **demo/** — demo app with its own Vite config

### Tests

Vitest with jsdom environment and `@testing-library/react`. Tests live in `__tests__/` directories alongside their components, or co-located as `.test.ts` files. Globals are enabled (no need to import `describe`/`it`/`expect`).
