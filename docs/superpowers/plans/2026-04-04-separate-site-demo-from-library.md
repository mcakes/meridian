# Separate Site & Demo from Library Source

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the repo so `src/` is purely the component library, with the doc site and trading demo as separate top-level apps with independent entry points and build configs.

**Architecture:** Three separate concerns — library (`src/`), doc site (`site/`), demo (`demo/`) — each with its own Vite config and HTML entry point. The library gets a proper build via Vite library mode with `src/index.ts` as its public API. Site and demo import from the library via the `@/` path alias pointing at `src/`.

**Tech Stack:** Vite (library mode + two app builds), TypeScript, React

---

## Target Structure

```
meridian/
├── src/                        # Library (the package)
│   ├── components/
│   ├── hooks/                  # useFlash, useTheme, useWorkspace
│   ├── lib/
│   ├── providers/              # ThemeProvider only
│   ├── tokens/
│   └── index.ts                # Public API barrel
├── site/                       # Doc site (independent app)
│   ├── index.html
│   ├── vite.config.ts
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── components/
│   └── pages/
├── demo/                       # Trading demo (independent app)
│   ├── index.html
│   ├── vite.config.ts
│   ├── main.tsx
│   ├── App.tsx
│   ├── NavBar.tsx
│   ├── data/                   # SimulatedMarketData, types, instruments
│   ├── hooks/                  # useMarketData (moved from src/hooks)
│   ├── providers/              # DataProvider (moved from src/providers)
│   └── panels/
├── vite.config.ts              # Library build (Vite library mode)
├── tsconfig.json
├── package.json
└── ...
```

## Key Decisions

- **`DataProvider` and `useMarketData` move to `demo/`** — they depend on `demo/data/types` and `SimulatedMarketData`, so they are demo-specific, not library code.
- **`@/` alias** continues to point at `src/` in all three Vite configs. Site and demo import library code via `@/components`, `@/hooks/useTheme`, etc.
- **Site loses its `/demo` route** — the demo is now a separate app at its own URL.
- **Library build** uses Vite library mode, externalising React and other peer deps. Output to `dist/`.

---

### Task 1: Create library barrel export (`src/index.ts`)

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Create `src/index.ts`**

This is the library's public API. It re-exports everything consumers need.

```ts
// Components
export * from './components';

// Hooks
export { useFlash } from './hooks/useFlash';
export { useTheme } from './hooks/useTheme';
export { useWorkspace } from './hooks/useWorkspace';

// Providers
export { ThemeProvider } from './providers/ThemeProvider';

// Tokens — consumers import CSS directly: import 'meridian/tokens.css'
```

- [ ] **Step 2: Verify the barrel compiles**

Run: `npx tsc --noEmit`
Expected: No new errors (existing ones are fine)

- [ ] **Step 3: Commit**

```bash
git add src/index.ts
git commit -m "feat: add library barrel export at src/index.ts"
```

---

### Task 2: Move demo-specific code out of `src/`

`DataProvider` and `useMarketData` depend on demo data types — they belong with the demo, not the library.

**Files:**
- Move: `src/providers/DataProvider.tsx` → `demo/providers/DataProvider.tsx`
- Move: `src/hooks/useMarketData.ts` → `demo/hooks/useMarketData.ts`
- Move: `src/demo/*` → `demo/`

- [ ] **Step 1: Move `src/demo/` to `demo/` at the project root**

```bash
git mv src/demo demo
```

- [ ] **Step 2: Create `demo/providers/` and move `DataProvider`**

```bash
mkdir -p demo/providers
git mv src/providers/DataProvider.tsx demo/providers/DataProvider.tsx
```

- [ ] **Step 3: Create `demo/hooks/` and move `useMarketData`**

```bash
mkdir -p demo/hooks
git mv src/hooks/useMarketData.ts demo/hooks/useMarketData.ts
```

- [ ] **Step 4: Update imports in `demo/providers/DataProvider.tsx`**

The file currently imports from `'../demo/data/types'` and `'../demo/data/SimulatedMarketData'`. Now that it lives inside `demo/`, update to:

```ts
// Old:
import type { MarketDataProvider } from '../demo/data/types';
import { SimulatedMarketData } from '../demo/data/SimulatedMarketData';

// New:
import type { MarketDataProvider } from '../data/types';
import { SimulatedMarketData } from '../data/SimulatedMarketData';
```

- [ ] **Step 5: Update imports in `demo/hooks/useMarketData.ts`**

The file currently imports from `'../providers/DataProvider'` and `'../demo/data/types'`. Update to:

```ts
// Old:
import { useDataContext } from '../providers/DataProvider';
import type { Tick, Candle, TimeRange } from '../demo/data/types';

// New:
import { useDataContext } from '../providers/DataProvider';
import type { Tick, Candle, TimeRange } from '../data/types';
```

Note: the DataProvider import stays the same relative path since both moved together.

- [ ] **Step 6: Update imports in `demo/main.tsx`**

```ts
// Old:
import { DataProvider } from '@/providers/DataProvider';
import '../tokens/index.css';

// New:
import { DataProvider } from './providers/DataProvider';
import '@/tokens/index.css';
```

The `ThemeProvider` import (`@/providers/ThemeProvider`) stays — it's library code.

- [ ] **Step 7: Update imports in `demo/App.tsx`**

The `@/components` and `@/hooks/*` imports stay (library code). Check for any imports referencing `@/demo/` — there shouldn't be any since this file is already inside demo. No changes expected.

- [ ] **Step 8: Update imports in demo panel files**

In `demo/panels/PricerPanel.tsx`, `demo/panels/ChartPanel.tsx`, and `demo/panels/WatchlistPanel.tsx`, update DataProvider and useMarketData imports:

```ts
// Old:
import { useDataContext } from '@/providers/DataProvider';
import { useMarketData } from '@/hooks/useMarketData';

// New:
import { useDataContext } from '../providers/DataProvider';
import { useMarketData } from '../hooks/useMarketData';
```

For any panel file that only imports `useDataContext`, apply the same pattern.

- [ ] **Step 9: Verify no broken imports**

Run: `npx tsc --noEmit`
Expected: No new errors from the moves

- [ ] **Step 10: Commit**

```bash
git add -A demo/providers demo/hooks
git add src/providers/DataProvider.tsx src/hooks/useMarketData.ts demo/
git commit -m "refactor: move DataProvider and useMarketData to demo"
```

---

### Task 3: Move site out of `src/`

**Files:**
- Move: `src/site/*` → `site/`
- Delete: `site/pages/demo/TradingApp.tsx` (demo is now separate)
- Modify: `site/router.tsx` (remove `/demo` route)
- Modify: `site/App.tsx` (remove `isDemo` logic)
- Modify: `site/main.tsx` (fix CSS import)

- [ ] **Step 1: Move `src/site/` to `site/` at the project root**

```bash
git mv src/site site
```

- [ ] **Step 2: Update the CSS import in `site/main.tsx`**

```ts
// Old:
import '../tokens/index.css';

// New:
import '@/tokens/index.css';
```

All other imports use `@/` and remain valid.

- [ ] **Step 3: Delete `site/pages/demo/TradingApp.tsx`**

```bash
git rm site/pages/demo/TradingApp.tsx
rmdir site/pages/demo 2>/dev/null || true
```

- [ ] **Step 4: Remove the demo route from `site/router.tsx`**

Remove the demo import and route entry:

```ts
// Remove this line:
      { path: 'demo', element: lazyPage(() => import('./pages/demo/TradingApp')) },
```

- [ ] **Step 5: Simplify `site/App.tsx`**

Remove the `isDemo` logic since there's no demo route. The content area always uses padding and max-width:

```tsx
// Old:
  const isDemo = location.pathname === '/demo';
  // ... and later:
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isDemo ? 0 : '32px 48px',
          }}
        >
          {isDemo ? (
            <Outlet />
          ) : (
            <div style={{ maxWidth: 780 }}>
              <Outlet />
            </div>
          )}

// New:
  // Remove isDemo entirely, simplify to:
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 48px',
          }}
        >
          <div style={{ maxWidth: 780 }}>
            <Outlet />
          </div>
```

Also remove the unused `useLocation` import if `location` is no longer used for `isDemo`. Keep it if still used for scroll-to-top.

Actually, `location` is still used for the `useEffect` scroll-to-top, so the import stays. Just remove the `isDemo` const.

- [ ] **Step 6: Update site internal imports that used `@/site/`**

Site pages currently import shared site components like `@/site/components/Section`. After moving, these relative paths change. Check all site page files — they now need to use relative imports or we update the alias.

The simplest fix: since the site files moved from `src/site/` to `site/`, their `@/site/...` imports no longer resolve (because `@/` points to `src/`, and there's no `src/site/` anymore).

Update all `@/site/` imports in site files to use relative imports:

```ts
// Old (in e.g. site/pages/components/InputsPage.tsx):
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';

// New:
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
```

Apply this pattern across all files under `site/pages/` that import from `@/site/components/`. The depth varies by nesting level:
- `site/pages/components/*.tsx` → `../../components/...`
- `site/pages/overview/*.tsx` → `../../components/...`
- `site/pages/research/*.tsx` → `../../components/...`
- `site/pages/tokens/*.tsx` → `../../components/...`

- [ ] **Step 7: Verify no broken imports**

Run: `npx tsc --noEmit`
Expected: No new errors from the moves

- [ ] **Step 8: Commit**

```bash
git add site/ src/site
git commit -m "refactor: move doc site to top-level site/ directory"
```

---

### Task 4: Update root `index.html` and Vite config

The root `index.html` currently serves the site. After the restructure, the root build is for the library. Each app gets its own HTML.

**Files:**
- Move: `index.html` → `site/index.html`
- Modify: `site/index.html` (update script src)
- Create: `demo/index.html`
- Modify: `vite.config.ts` (library mode)
- Create: `site/vite.config.ts`
- Create: `demo/vite.config.ts`

- [ ] **Step 1: Move `index.html` to `site/index.html`**

```bash
git mv index.html site/index.html
```

- [ ] **Step 2: Update the script src in `site/index.html`**

```html
<!-- Old: -->
<script type="module" src="/src/site/main.tsx"></script>

<!-- New: -->
<script type="module" src="./main.tsx"></script>
```

- [ ] **Step 3: Create `demo/index.html`**

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meridian Demo</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Update root `vite.config.ts` for library mode**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'meridian',
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react-router-dom',
        'flexlayout-react',
        'ag-grid-react',
        'ag-grid-community',
        'react-plotly.js',
        'plotly.js-finance-dist-min',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-select',
        '@radix-ui/react-tooltip',
        '@dnd-kit/core',
        '@dnd-kit/sortable',
        '@dnd-kit/utilities',
      ],
    },
    cssFileName: 'meridian',
  },
});
```

- [ ] **Step 5: Create `site/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist/site'),
    emptyOutDir: true,
  },
});
```

- [ ] **Step 6: Create `demo/vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  build: {
    outDir: path.resolve(__dirname, '../dist/demo'),
    emptyOutDir: true,
  },
});
```

- [ ] **Step 7: Commit**

```bash
git add vite.config.ts site/vite.config.ts site/index.html demo/vite.config.ts demo/index.html
git commit -m "feat: add separate Vite configs for library, site, and demo"
```

---

### Task 5: Update `package.json` scripts and add exports

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update `package.json`**

Update the scripts and add library export metadata:

```jsonc
{
  "name": "meridian",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "main": "./dist/meridian.js",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "import": "./dist/meridian.js",
      "types": "./src/index.ts"
    },
    "./tokens.css": "./dist/meridian.css"
  },
  "scripts": {
    "dev:site": "vite --config site/vite.config.ts",
    "dev:demo": "vite --config demo/vite.config.ts",
    "build": "tsc -b && vite build",
    "build:site": "vite build --config site/vite.config.ts",
    "build:demo": "vite build --config demo/vite.config.ts",
    "preview:site": "vite preview --config site/vite.config.ts",
    "preview:demo": "vite preview --config demo/vite.config.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  }
  // ... dependencies unchanged
}
```

- [ ] **Step 2: Commit**

```bash
git add package.json
git commit -m "feat: update scripts for site/demo/library builds"
```

---

### Task 6: Update `tsconfig.json`

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Update `include` to cover all three directories**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["src", "site", "demo"]
}
```

- [ ] **Step 2: Verify type checking passes**

Run: `npx tsc --noEmit`
Expected: No new errors

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: update tsconfig to include site and demo directories"
```

---

### Task 7: Update the GettingStarted page

The `site/pages/overview/GettingStarted.tsx` page shows a directory tree that references the old structure. Update it to reflect the new layout.

**Files:**
- Modify: `site/pages/overview/GettingStarted.tsx`

- [ ] **Step 1: Update the directory tree in GettingStarted.tsx**

Find the code block that shows the project structure (lines referencing `providers/`, `hooks/`, `demo/`). Update to reflect that `src/` is the library only, and site/demo are top-level:

```
src/
  components/      Component library
  hooks/           useTheme, useWorkspace, useFlash
  providers/       ThemeProvider
  tokens/          Design token CSS variables
  lib/             Utility functions
  index.ts         Public API barrel
site/              Documentation site (separate app)
demo/              Trading demo app (separate app)
```

- [ ] **Step 2: Commit**

```bash
git add site/pages/overview/GettingStarted.tsx
git commit -m "docs: update GettingStarted to reflect new project structure"
```

---

### Task 8: Verify all builds work

- [ ] **Step 1: Run the library build**

Run: `npm run build`
Expected: Produces `dist/meridian.js` and `dist/meridian.css`

- [ ] **Step 2: Run the site dev server**

Run: `npm run dev:site`
Expected: Starts on localhost, site loads with all pages working. Stop with Ctrl+C.

- [ ] **Step 3: Run the demo dev server**

Run: `npm run dev:demo`
Expected: Starts on localhost, trading demo loads with workspace. Stop with Ctrl+C.

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: All existing tests pass

- [ ] **Step 5: Build site and demo**

Run: `npm run build:site && npm run build:demo`
Expected: Produces `dist/site/` and `dist/demo/` with static assets

- [ ] **Step 6: Final commit if any fixups were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from restructure"
```

---
