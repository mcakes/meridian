# Meridian Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete design system with token architecture, React component library, realistic trading workspace demo, and narrative + reference documentation.

**Architecture:** CSS custom properties as the token source of truth, consumed by Tailwind CSS for utility-class DX. React components built on Radix UI primitives. AG Grid for data tables, Plotly.js for charts, FlexLayout React for workspace tiling. Pluggable data layer with simulated market feed.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Radix UI, AG Grid (Community), Plotly.js, flexlayout-react

**Spec:** `docs/superpowers/specs/2026-03-31-meridian-design-system-design.md`

**Source notes:** `meridian-research.md` (research & rationale), `meridian-implementation.md` (token specs & component patterns), `trading-design-system-v3.jsx` (working prototype)

---

## File Map

### Configuration & Build
- Create: `package.json` — dependencies, scripts
- Create: `tsconfig.json` — TypeScript config
- Create: `vite.config.ts` — Vite build config
- Create: `postcss.config.js` — PostCSS with Tailwind v4 plugin
- Create: `index.html` — entry HTML
- Modify: `.gitignore` — add node_modules, dist, etc.

### Tokens (CSS custom properties — source of truth)
- Create: `src/tokens/colors.css` — categorical ramp, semantic, surface/text/border for dark + light
- Create: `src/tokens/typography.css` — font stacks, type scale
- Create: `src/tokens/spacing.css` — 4px base unit scale
- Create: `src/tokens/borders.css` — radius, border-width, focus ring
- Create: `src/tokens/index.css` — aggregates all token files

### Utilities
- Create: `src/lib/format.ts` — fmt, fmtPct, fmtK, fuzzyMatch
- Create: `src/lib/format.test.ts` — unit tests for all formatters

### Providers & Hooks
- Create: `src/providers/ThemeProvider.tsx` — data-theme attribute management, context
- Create: `src/hooks/useTheme.ts` — theme state and toggle, re-exports from provider
- Create: `src/hooks/useFlash.ts` — flash-on-update animation state
- Create: `src/hooks/useWorkspace.ts` — layout serialization, preset management
- Create: `src/hooks/useMarketData.ts` — subscribe to market data provider
- Create: `src/providers/DataProvider.tsx` — market data context + selection state

### Data Layer
- Create: `src/demo/data/types.ts` — Instrument, Tick, Candle, TimeRange, MarketDataProvider interface
- Create: `src/demo/data/instruments.ts` — ~15 sample instruments
- Create: `src/demo/data/SimulatedMarketData.ts` — stochastic price feed implementation
- Create: `src/demo/data/SimulatedMarketData.test.ts` — tests for data provider

### Primitive Components
- Create: `src/components/primitives/CatDot.tsx`
- Create: `src/components/primitives/PriceChange.tsx`
- Create: `src/components/primitives/FlashCell.tsx`
- Create: `src/components/primitives/MetricCard.tsx`
- Create: `src/components/primitives/Tag.tsx`

### Input Components
- Create: `src/components/inputs/Toggle.tsx`
- Create: `src/components/inputs/NumberInput.tsx`
- Create: `src/components/inputs/Select.tsx`
- Create: `src/components/inputs/DatePicker.tsx`
- Create: `src/components/inputs/Autocomplete.tsx`

### Data Components
- Create: `src/components/data/Sparkline.tsx`
- Create: `src/components/data/DataTable.tsx` — AG Grid wrapper with Meridian theme
- Create: `src/components/data/cell-renderers.tsx` — NumericCell, ChangeCell, BadgeCell, SparklineCell, ActionCell

### Layout Components
- Create: `src/components/layout/PanelHeader.tsx`
- Create: `src/components/layout/Toolbar.tsx`
- Create: `src/components/layout/Panel.tsx`
- Create: `src/components/layout/Workspace.tsx` — flexlayout-react wrapper

### Charting
- Create: `src/components/charting/meridian-plotly-template.ts` — Plotly layout template + config
- Create: `src/components/charting/Chart.tsx` — Plotly wrapper component

### Feedback
- Create: `src/components/feedback/Toast.tsx`
- Create: `src/components/feedback/Modal.tsx`
- Create: `src/components/feedback/NotificationFeed.tsx`

### Barrel Export
- Create: `src/components/index.ts` — public API re-exports

### Demo App
- Create: `src/demo/main.tsx` — entry point, providers
- Create: `src/demo/App.tsx` — workspace + nav bar
- Create: `src/demo/NavBar.tsx` — wordmark, preset switcher, theme toggle
- Create: `src/demo/panels/WatchlistPanel.tsx`
- Create: `src/demo/panels/ChartPanel.tsx`
- Create: `src/demo/panels/PricerPanel.tsx`
- Create: `src/demo/panels/workspace-presets.ts` — layout preset definitions

### Documentation
- Create: `docs/philosophy/overview.md`
- Create: `docs/philosophy/color-system.md`
- Create: `docs/philosophy/information-density.md`
- Create: `docs/philosophy/typography.md`
- Create: `docs/philosophy/workspace-layout.md`
- Create: `docs/philosophy/notifications.md`
- Create: `docs/philosophy/accessibility.md`
- Create: `docs/reference/tokens.md`
- Create: `docs/reference/components.md`
- Create: `docs/reference/patterns.md`
- Copy: `meridian-research.md` → `docs/research/meridian-research.md`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Modify: `.gitignore`

- [ ] **Step 1: Initialize package.json with dependencies**

```bash
cd /Users/matthewchivers/Repos/meridian
npm init -y
```

Then replace the generated `package.json` with:

```json
{
  "name": "meridian",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-popover": "^1.1.0",
    "@radix-ui/react-select": "^2.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "ag-grid-community": "^33.0.0",
    "ag-grid-react": "^33.0.0",
    "plotly.js-finance-dist-min": "^3.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "flexlayout-react": "^0.8.0",
    "react-plotly.js": "^2.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/react-plotly.js": "^2.6.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

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
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
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
});
```

- [ ] **Step 4: Create postcss.config.js**

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en" data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Meridian</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/demo/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Update .gitignore**

Append to `.gitignore`:

```
node_modules/
dist/
*.local
```

- [ ] **Step 7: Install dependencies**

```bash
npm install
```

Run: `npm install`
Expected: Clean install, `node_modules/` created, no errors.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts postcss.config.js index.html .gitignore
git commit -m "chore: scaffold Vite + React + TypeScript project with dependencies"
```

---

## Task 2: Token System (CSS Custom Properties)

**Files:**
- Create: `src/tokens/colors.css`
- Create: `src/tokens/typography.css`
- Create: `src/tokens/spacing.css`
- Create: `src/tokens/borders.css`
- Create: `src/tokens/index.css`

- [ ] **Step 1: Create colors.css**

All color tokens — categorical ramp, semantic, surface/text/border — for both dark and light themes. Values from the spec's "Color System" section. Structure:

```css
/* Categorical Ramp — max-distance-first ordering */
/* Semantic Colors — fixed meaning, always use redundant encoding */
/* Surface, Text, Border — UI structure */

[data-theme="dark"] {
  /* Categorical ramp */
  --color-cat-0: #7aa2f7;
  --color-cat-1: #9ece6a;
  --color-cat-2: #e06c75;
  --color-cat-3: #41c5b0;
  --color-cat-4: #ff9e64;
  --color-cat-5: #d6a0e8;
  --color-cat-6: #80d8e8;
  --color-cat-7: #b8608e;

  /* Semantic */
  --color-positive: #9ece6a;
  --color-negative: #f7768e;
  --color-neutral: #a9b1d6;
  --color-warning: #e0af68;
  --color-info: #7aa2f7;
  --color-accent: #bb9af7;

  /* Backgrounds */
  --bg-base: #1a1b26;
  --bg-surface: #24283b;
  --bg-muted: #292e42;
  --bg-overlay: #343a52;
  --bg-highlight: #3b4261;

  /* Text */
  --text-primary: #c0caf5;
  --text-secondary: #a9b1d6;
  --text-muted: #565f89;
  --text-inverse: #1a1b26;

  /* Borders */
  --border-subtle: #292e42;
  --border-default: #3b4261;
  --border-active: #565f89;
}

[data-theme="light"] {
  /* Categorical ramp */
  --color-cat-0: #4a76c9;
  --color-cat-1: #4d7a1f;
  --color-cat-2: #c4525c;
  --color-cat-3: #32a18a;
  --color-cat-4: #c97a3e;
  --color-cat-5: #9e6fb8;
  --color-cat-6: #4a9fad;
  --color-cat-7: #9e4a75;

  /* Semantic */
  --color-positive: #1e7a1e;
  --color-negative: #c93545;
  --color-neutral: #6a6b7a;
  --color-warning: #8f6200;
  --color-info: #2e5cb8;
  --color-accent: #7c4dab;

  /* Backgrounds */
  --bg-base: #f0f0f3;
  --bg-surface: #f8f8fb;
  --bg-muted: #e8e8ed;
  --bg-overlay: #d8d8de;
  --bg-highlight: #e0e0e6;

  /* Text */
  --text-primary: #1a1b26;
  --text-secondary: #4a4b5c;
  --text-muted: #8b8c9a;
  --text-inverse: #f0f0f3;

  /* Borders */
  --border-subtle: #d8d8de;
  --border-default: #c0c0c8;
  --border-active: #9a9aa8;
}
```

- [ ] **Step 2: Create typography.css**

```css
:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  --text-panel-title: 600 16px/22px var(--font-sans);
  --text-section: 600 13px/18px var(--font-sans);
  --text-column-header: 500 11px/14px var(--font-sans); /* from implementation notes, not in spec — for AG Grid headers */
  --text-body: 400 13px/18px var(--font-sans);
  --text-body-strong: 600 13px/18px var(--font-sans);
  --text-small: 400 12px/16px var(--font-sans);
  --text-small-strong: 600 12px/16px var(--font-sans);
  --text-caption: 400 11px/14px var(--font-sans);
  --text-mono: 400 12px/16px var(--font-mono);
}
```

- [ ] **Step 3: Create spacing.css**

```css
:root {
  --space-px: 1px;
  --space-0: 0px;
  --space-0-5: 2px;
  --space-1: 4px;
  --space-1-5: 6px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
}
```

- [ ] **Step 4: Create borders.css**

```css
:root {
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;

  --border-width: 1px;
  --focus-ring: 0 0 0 2px var(--color-info);
}
```

- [ ] **Step 5: Create index.css that aggregates all tokens and adds Tailwind**

```css
@import "tailwindcss";

@import "./colors.css";
@import "./typography.css";
@import "./spacing.css";
@import "./borders.css";

/* Global defaults */
* {
  font-variant-numeric: tabular-nums;
}

body {
  font-family: var(--font-sans);
  font: var(--text-body);
  color: var(--text-primary);
  background-color: var(--bg-base);
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 6: Verify tokens load**

Create a minimal `src/demo/main.tsx` to verify:

```typescript
import '../tokens/index.css';

document.getElementById('root')!.innerHTML = '<h1 style="color: var(--text-primary)">Meridian</h1>';
```

Run: `npx vite --open`
Expected: Page loads with "Meridian" in the correct text color on dark background.

- [ ] **Step 7: Commit**

```bash
git add src/tokens/
git commit -m "feat: add CSS custom property token system (colors, typography, spacing, borders)"
```

---

## Task 3: Tailwind v4 Theme Configuration

**Files:**
- Modify: `src/tokens/index.css`

Tailwind v4 uses CSS-first configuration via `@theme` blocks — no `tailwind.config.js` needed. Theme values are defined directly in CSS alongside the token imports.

- [ ] **Step 1: Add @theme block to index.css**

Add a `@theme` block to `src/tokens/index.css` that maps CSS custom properties into Tailwind's utility class system. This goes after the token imports:

```css
@import "tailwindcss";

@import "./colors.css";
@import "./typography.css";
@import "./spacing.css";
@import "./borders.css";

@theme {
  /* Categorical ramp */
  --color-cat-0: var(--color-cat-0);
  --color-cat-1: var(--color-cat-1);
  --color-cat-2: var(--color-cat-2);
  --color-cat-3: var(--color-cat-3);
  --color-cat-4: var(--color-cat-4);
  --color-cat-5: var(--color-cat-5);
  --color-cat-6: var(--color-cat-6);
  --color-cat-7: var(--color-cat-7);

  /* Semantic colors */
  --color-positive: var(--color-positive);
  --color-negative: var(--color-negative);
  --color-neutral: var(--color-neutral);
  --color-warning: var(--color-warning);
  --color-info: var(--color-info);
  --color-accent: var(--color-accent);

  /* Backgrounds */
  --color-base: var(--bg-base);
  --color-surface: var(--bg-surface);
  --color-muted: var(--bg-muted);
  --color-overlay: var(--bg-overlay);
  --color-highlight: var(--bg-highlight);

  /* Text */
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-text-muted: var(--text-muted);
  --color-text-inverse: var(--text-inverse);

  /* Borders */
  --color-border-subtle: var(--border-subtle);
  --color-border-default: var(--border-default);
  --color-border-active: var(--border-active);

  /* Font families */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Border radius */
  --radius-none: 0px;
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 6px;

  /* Spacing (4px base) */
  --spacing-px: 1px;
  --spacing-0-5: 2px;
  --spacing-1: 4px;
  --spacing-1-5: 6px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
}
```

Note: Tailwind v4 `@theme` variable naming determines utility class names. `--color-surface` generates `bg-surface`, `text-surface`, etc. `--color-text-primary` generates `text-text-primary`. The exact naming convention may need adjustment after testing to ensure classes like `bg-surface`, `text-positive`, `border-subtle` work as expected. Consult Tailwind v4 docs for the namespace-to-utility mapping if classes don't resolve correctly.

- [ ] **Step 2: Verify Tailwind classes work**

Update the minimal `src/demo/main.tsx`:

```typescript
import '../tokens/index.css';

document.getElementById('root')!.innerHTML = `
  <div class="bg-surface p-4 rounded-sm border border-subtle">
    <h1 class="text-text-primary font-semibold">Meridian</h1>
    <p class="text-text-secondary text-sm">Design system loaded</p>
  </div>
`;
```

Run: `npx vite --open`
Expected: Styled card with surface background, subtle border, correct text colors. If utility class names don't match expectations, adjust the `@theme` variable names accordingly.

- [ ] **Step 3: Commit**

```bash
git add src/tokens/index.css
git commit -m "feat: configure Tailwind v4 theme to consume CSS custom property tokens"
```

---

## Task 4: Utility Functions

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/format.test.ts`

- [ ] **Step 1: Write tests for format utilities**

Test cases for each function:

```typescript
import { describe, it, expect } from 'vitest';
import { fmt, fmtPct, fmtK, fuzzyMatch } from './format';

describe('fmt', () => {
  it('formats numbers with default 2 decimals', () => {
    expect(fmt(1234.567)).toBe('1,234.57');
  });
  it('formats with custom decimal places', () => {
    expect(fmt(0.12345, 4)).toBe('0.1235');
  });
  it('handles zero', () => {
    expect(fmt(0)).toBe('0.00');
  });
  it('handles negative numbers', () => {
    expect(fmt(-1234.5)).toBe('-1,234.50');
  });
});

describe('fmtPct', () => {
  it('formats positive percentage with + sign', () => {
    expect(fmtPct(0.0523)).toBe('+5.23%');
  });
  it('formats negative percentage with - sign', () => {
    expect(fmtPct(-0.0312)).toBe('-3.12%');
  });
  it('formats zero percentage', () => {
    expect(fmtPct(0)).toBe('0.00%');
  });
});

describe('fmtK', () => {
  it('abbreviates millions', () => {
    expect(fmtK(1500000)).toBe('1.5M');
  });
  it('abbreviates thousands', () => {
    expect(fmtK(45000)).toBe('45.0K');
  });
  it('passes through small numbers', () => {
    expect(fmtK(999)).toBe('999');
  });
});

describe('fuzzyMatch', () => {
  it('matches exact substring (highest priority)', () => {
    const result = fuzzyMatch('AAPL', 'AA');
    expect(result).not.toBeNull();
    expect(result!.ranges).toEqual([{ start: 0, end: 2 }]);
  });
  it('matches sequential characters', () => {
    const result = fuzzyMatch('MICROSOFT', 'MSF');
    expect(result).not.toBeNull();
  });
  it('returns null for no match', () => {
    expect(fuzzyMatch('AAPL', 'XYZ')).toBeNull();
  });
  it('is case-insensitive', () => {
    const result = fuzzyMatch('Apple Inc', 'apple');
    expect(result).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/format.test.ts`
Expected: All tests FAIL — module `./format` not found.

- [ ] **Step 3: Implement format utilities**

```typescript
export function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(n: number): string {
  const pct = n * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export interface FuzzyMatchResult {
  score: number;
  ranges: { start: number; end: number }[];
}

export function fuzzyMatch(text: string, query: string): FuzzyMatchResult | null {
  if (!query) return { score: 0, ranges: [] };

  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact substring match — highest priority
  const substringIndex = lower.indexOf(queryLower);
  if (substringIndex !== -1) {
    return {
      score: 100 - substringIndex,
      ranges: [{ start: substringIndex, end: substringIndex + query.length }],
    };
  }

  // Sequential character match with gap penalty
  const ranges: { start: number; end: number }[] = [];
  let qi = 0;
  let score = 50;
  let rangeStart = -1;
  let lastMatchIndex = -1;

  for (let i = 0; i < lower.length && qi < queryLower.length; i++) {
    if (lower[i] === queryLower[qi]) {
      if (lastMatchIndex !== i - 1) {
        if (rangeStart !== -1) {
          ranges.push({ start: rangeStart, end: lastMatchIndex + 1 });
        }
        rangeStart = i;
        score -= 5; // gap penalty
      }
      lastMatchIndex = i;
      qi++;
    }
  }

  if (qi < queryLower.length) return null;

  if (rangeStart !== -1) {
    ranges.push({ start: rangeStart, end: lastMatchIndex + 1 });
  }

  return { score, ranges };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/format.test.ts`
Expected: All tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/
git commit -m "feat: add number formatting and fuzzy match utilities"
```

---

## Task 5: Theme Provider

**Files:**
- Create: `src/providers/ThemeProvider.tsx`
- Create: `src/hooks/useTheme.ts`

- [ ] **Step 1: Create ThemeProvider**

```typescript
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('meridian-theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('meridian-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}
```

- [ ] **Step 2: Create useTheme hook**

```typescript
export { useThemeContext as useTheme } from '../providers/ThemeProvider';
```

- [ ] **Step 3: Verify theme switching works**

Update `src/demo/main.tsx` to use the ThemeProvider and a toggle button. Confirm that clicking the toggle switches `data-theme` attribute and colors change.

Run: `npx vite --open`
Expected: Toggle button switches theme, background and text colors change instantly.

- [ ] **Step 4: Commit**

```bash
git add src/providers/ThemeProvider.tsx src/hooks/useTheme.ts
git commit -m "feat: add ThemeProvider with localStorage persistence and data-theme switching"
```

---

## Task 6: Data Layer

**Files:**
- Create: `src/demo/data/types.ts`
- Create: `src/demo/data/instruments.ts`
- Create: `src/demo/data/SimulatedMarketData.ts`
- Create: `src/demo/data/SimulatedMarketData.test.ts`
- Create: `src/providers/DataProvider.tsx`
- Create: `src/hooks/useMarketData.ts`

- [ ] **Step 1: Write tests for SimulatedMarketData**

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SimulatedMarketData } from './SimulatedMarketData';

describe('SimulatedMarketData', () => {
  let provider: SimulatedMarketData;

  afterEach(() => {
    provider?.destroy();
  });

  it('provides a list of instruments', () => {
    provider = new SimulatedMarketData();
    expect(provider.instruments.length).toBeGreaterThan(10);
    expect(provider.instruments[0]).toHaveProperty('symbol');
    expect(provider.instruments[0]).toHaveProperty('name');
    expect(provider.instruments[0]).toHaveProperty('assetClass');
    expect(provider.instruments[0]).toHaveProperty('group');
  });

  it('delivers ticks via subscribe', async () => {
    provider = new SimulatedMarketData();
    const ticks: any[] = [];
    const unsub = provider.subscribe('AAPL', (tick) => ticks.push(tick));

    // Wait for at least one tick
    await new Promise((r) => setTimeout(r, 2000));
    unsub();

    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]).toHaveProperty('price');
    expect(ticks[0]).toHaveProperty('bid');
    expect(ticks[0]).toHaveProperty('ask');
    expect(ticks[0].symbol).toBe('AAPL');
  });

  it('unsubscribe stops tick delivery', async () => {
    provider = new SimulatedMarketData();
    const ticks: any[] = [];
    const unsub = provider.subscribe('AAPL', (tick) => ticks.push(tick));
    unsub();

    await new Promise((r) => setTimeout(r, 2000));
    expect(ticks.length).toBe(0);
  });

  it('generates candlestick history', () => {
    provider = new SimulatedMarketData();
    const candles = provider.getHistory('AAPL', '1M');
    expect(candles.length).toBeGreaterThan(0);
    expect(candles[0]).toHaveProperty('open');
    expect(candles[0]).toHaveProperty('high');
    expect(candles[0]).toHaveProperty('low');
    expect(candles[0]).toHaveProperty('close');
    expect(candles[0]).toHaveProperty('volume');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/demo/data/SimulatedMarketData.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Create types.ts**

Define the `Instrument`, `Tick`, `Candle`, `TimeRange`, and `MarketDataProvider` interfaces exactly as specified in the spec (lines 494-529).

- [ ] **Step 4: Create instruments.ts**

~15 sample instruments. Reference the existing prototype `trading-design-system-v3.jsx` for instrument data. Include: AAPL, MSFT, GOOGL, NVDA, AMD, JNJ, PFE, XOM, CVX (equities in groups: Technology, Semiconductors, Healthcare, Energy) plus FX pairs (EURUSD, GBPUSD, USDJPY — group: G10 Majors) and commodity FX (AUDUSD, USDCAD — group: Commodity FX). Each has `symbol`, `name`, `assetClass`, `group`, and a `basePrice` for simulation.

- [ ] **Step 5: Create SimulatedMarketData.ts**

Implement `MarketDataProvider`:
- Constructor starts an interval at ~1-2Hz that generates stochastic price walks for all instruments
- `subscribe(symbol, callback)` — registers callback, returns unsubscribe function
- `getHistory(symbol, range)` — generates synthetic candlestick history (e.g., 30 days for 1M, 250 days for 1Y) using random walk from base price
- `destroy()` — clears interval, cleans up
- Price walk: `price += price * (Math.random() - 0.5) * volatility` where volatility varies by asset class
- Bid/ask: maintain spread proportional to instrument type (equities ~0.01%, FX ~0.001%)

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/demo/data/SimulatedMarketData.test.ts`
Expected: All tests PASS.

- [ ] **Step 7: Create DataProvider.tsx**

Context provider that holds:
- `MarketDataProvider` instance (SimulatedMarketData)
- `selectedSymbol: string | null` — cross-panel linking state
- `setSelectedSymbol(symbol: string)` — setter

```typescript
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type { MarketDataProvider } from '../demo/data/types';
import { SimulatedMarketData } from '../demo/data/SimulatedMarketData';

interface DataContextValue {
  provider: MarketDataProvider;
  selectedSymbol: string | null;
  setSelectedSymbol: (symbol: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const providerRef = useRef(new SimulatedMarketData());
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  return (
    <DataContext.Provider value={{
      provider: providerRef.current,
      selectedSymbol,
      setSelectedSymbol,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used within DataProvider');
  return ctx;
}
```

- [ ] **Step 8: Create useMarketData hook**

```typescript
import { useEffect, useState } from 'react';
import { useDataContext } from '../providers/DataProvider';
import type { Tick, Candle, TimeRange } from '../demo/data/types';

export function useMarketData(symbol: string | null) {
  const { provider } = useDataContext();
  const [tick, setTick] = useState<Tick | null>(null);

  useEffect(() => {
    if (!symbol) return;
    const unsub = provider.subscribe(symbol, setTick);
    return unsub;
  }, [symbol, provider]);

  const getHistory = (range: TimeRange): Candle[] => {
    if (!symbol) return [];
    return provider.getHistory(symbol, range);
  };

  return {
    price: tick?.price ?? 0,
    bid: tick?.bid ?? 0,
    ask: tick?.ask ?? 0,
    change: tick?.change ?? 0,
    changePct: tick?.changePct ?? 0,
    volume: tick?.volume ?? 0,
    getHistory,
  };
}
```

- [ ] **Step 9: Commit**

```bash
git add src/demo/data/ src/providers/DataProvider.tsx src/hooks/useMarketData.ts
git commit -m "feat: add pluggable market data layer with simulated feed"
```

---

## Task 7: Primitive Components

**Files:**
- Create: `src/components/primitives/CatDot.tsx`
- Create: `src/components/primitives/PriceChange.tsx`
- Create: `src/components/primitives/FlashCell.tsx`
- Create: `src/components/primitives/MetricCard.tsx`
- Create: `src/components/primitives/Tag.tsx`

- [ ] **Step 1: Create CatDot**

Props: `index: number` (0-7), `size?: number` (default 8). Renders a colored square using inline style `backgroundColor: var(--color-cat-{index})`. Use `rounded-sm` for 2px radius.

- [ ] **Step 2: Create PriceChange**

Props: `value: number`, `decimals?: number` (default 2). Displays: arrow (▲ for positive, ▼ for negative, — for zero) + sign + formatted value + %. Color via `text-positive`, `text-negative`, or `text-neutral` Tailwind classes. Uses `fmt` from `@/lib/format`.

- [ ] **Step 3: Create FlashCell**

Props: `value: number`, `previousValue?: number`, `format?: (n: number) => string`. Uses the `useFlash` hook (create it here if not yet existing). Flash behavior: when `value` changes from `previousValue`, apply a brief CSS class (`flash-up` or `flash-down`) that adds a colored background tint for 100ms, then fades. Use CSS transition. Wrap in a `@media (prefers-reduced-motion: reduce)` to disable.

Create `src/hooks/useFlash.ts`:
```typescript
import { useEffect, useRef, useState } from 'react';

export function useFlash(value: number) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (prevRef.current !== value) {
      const direction = value > prevRef.current ? 'up' : 'down';
      setFlash(direction);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFlash(null), 100);
      prevRef.current = value;
    }
  }, [value]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return flash;
}
```

- [ ] **Step 4: Create MetricCard**

Props: `label: string`, `value: string | number`, `sublabel?: string`. Surface background card with label in `text-secondary text-caption`, value in `text-primary text-body-strong`, optional sublabel in `text-muted text-caption`.

- [ ] **Step 5: Create Tag**

Props: `variant: 'pass' | 'warn' | 'fail'`, `children: string`. Maps variants to semantic colors: pass → positive, warn → warning, fail → negative. Renders a small pill with tinted background (10% opacity) and semantic text color. `radius-sm`, `text-caption`, `px-2 py-0.5`.

- [ ] **Step 6: Commit**

```bash
git add src/components/primitives/ src/hooks/useFlash.ts
git commit -m "feat: add primitive components (CatDot, PriceChange, FlashCell, MetricCard, Tag)"
```

---

## Task 8: Input Components

**Files:**
- Create: `src/components/inputs/Toggle.tsx`
- Create: `src/components/inputs/NumberInput.tsx`
- Create: `src/components/inputs/Select.tsx`
- Create: `src/components/inputs/DatePicker.tsx`
- Create: `src/components/inputs/Autocomplete.tsx`

- [ ] **Step 1: Create Toggle**

Props: `value: boolean`, `onChange: (v: boolean) => void`, `label?: string`. Track: 36x20px. Knob: 16x16px. On state: info-colored track, white knob translated right. Off state: muted track, muted knob at left. 150ms CSS transition on both background-color and transform. Focus ring via `--focus-ring` box-shadow.

- [ ] **Step 2: Create NumberInput**

Props: `value: number`, `onChange: (n: number) => void`, `min?: number`, `max?: number`, `step?: number` (default 1), `suffix?: string`. Layout: `[−] [input] [+]`. Stepper buttons separated by `border-subtle`. Input is center-aligned with `tabular-nums`. Stepper hover: `bg-muted`. Shift+ArrowUp/Down for 10x step. Focus ring on the whole group.

- [ ] **Step 3: Create Select**

Props: `value: string`, `onChange: (v: string) => void`, `options: { value: string, label: string }[]`, `label?: string`. Built on Radix Select primitive (`@radix-ui/react-select`). Trigger: full width, `rounded-sm`, chevron that rotates on open. Content: `rounded-md`, `border-default`, max-height 180px, `bg-surface`. Items: hover → `bg-highlight`. Selected item: `text-info font-semibold`.

- [ ] **Step 4: Create DatePicker**

Props: `value: Date | null`, `onChange: (date: Date) => void`, `label?: string`. Built on Radix Popover. Trigger: formatted date display or placeholder. Content: month/year header with ‹/› navigation, 7-column grid (Su-Sa). Day cells: `rounded-sm`. Today: `text-info`. Selected: `bg-info text-inverse`. Hover: `bg-highlight`.

- [ ] **Step 5: Create Autocomplete**

Props: `items: { label: string, value: string, sublabel?: string }[]`, `onSelect: (item) => void`, `placeholder?: string`. Input field with dropdown list. Uses `fuzzyMatch` from `@/lib/format`. Highlights matched ranges via `<mark>` with `bg-info/20 text-info` styling. Keyboard: ↑↓ navigate active index, Enter select, Esc close. Max dropdown height 200px, scrollable. "No matches" state. Built on Radix Popover for positioning.

- [ ] **Step 6: Commit**

```bash
git add src/components/inputs/
git commit -m "feat: add input components (Toggle, NumberInput, Select, DatePicker, Autocomplete)"
```

---

## Task 9: Layout Components

**Files:**
- Create: `src/components/layout/PanelHeader.tsx`
- Create: `src/components/layout/Toolbar.tsx`
- Create: `src/components/layout/Panel.tsx`

- [ ] **Step 1: Create PanelHeader**

Props: `title: string`, `actions?: ReactNode`. Height: 28px. Left: title using `text-panel-title` font token (but at a smaller size suitable for the header height — use `text-section` scale: 14px/600). Right: actions slot. Background: `bg-surface`. Bottom border: `border-subtle`. Flex layout, items centered.

- [ ] **Step 2: Create Toolbar**

Props: `children: ReactNode`. Height: 32px. Horizontal bar with `bg-surface` background, `border-subtle` bottom border. Flex layout with `gap-2` for child spacing. Padding: `px-2`.

- [ ] **Step 3: Create Panel**

Props: `title: string`, `toolbar?: ReactNode`, `actions?: ReactNode`, `children: ReactNode`. Composes PanelHeader + optional Toolbar + scrollable content area. Content area fills remaining height (`flex-1 overflow-auto`). Outer container: `bg-surface`, `flex flex-col`, `h-full`.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add layout components (Panel, PanelHeader, Toolbar)"
```

---

## Task 10: Workspace Component

**Files:**
- Create: `src/components/layout/Workspace.tsx`
- Create: `src/hooks/useWorkspace.ts`

- [ ] **Step 1: Create useWorkspace hook**

```typescript
import { useState, useCallback } from 'react';
import { Model } from 'flexlayout-react';
import type { IJsonModel } from 'flexlayout-react';

const STORAGE_KEY = 'meridian-workspace';
const PRESETS_KEY = 'meridian-presets';

export function useWorkspace(
  defaultLayout: IJsonModel,
  builtInPresets: Record<string, IJsonModel>,
) {
  const [model, setModelState] = useState<Model>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return Model.fromJson(JSON.parse(stored)); } catch { /* fall through */ }
    }
    return Model.fromJson(defaultLayout);
  });

  const setModel = useCallback((newModel: Model) => {
    setModelState(newModel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newModel.toJson()));
  }, []);

  const loadPreset = useCallback((name: string) => {
    const preset = builtInPresets[name];
    if (preset) {
      const newModel = Model.fromJson(preset);
      setModelState(newModel);
      setActivePreset(name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
    }
  }, [builtInPresets]);

  const resetLayout = useCallback(() => {
    const newModel = Model.fromJson(defaultLayout);
    setModelState(newModel);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLayout));
  }, [defaultLayout]);

  const [activePreset, setActivePreset] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) ? null : 'Equity Trading';
  });

  const savePreset = useCallback((name: string) => {
    const custom = JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
    custom[name] = model.toJson();
    localStorage.setItem(PRESETS_KEY, JSON.stringify(custom));
  }, [model]);

  return {
    model,
    setModel,
    presets: builtInPresets,
    activePreset,
    loadPreset,
    savePreset,
    resetLayout,
  };
}
```

- [ ] **Step 2: Create Workspace component**

Wraps `flexlayout-react`. Props: `model`, `factory: (node: TabNode) => ReactNode`. Applies Meridian styling: zero-radius tiles, `border-subtle` splitter borders, no default window chrome (we use our own Panel component). Import flexlayout-react CSS and override with Meridian tokens.

```typescript
import { Layout, Model } from 'flexlayout-react';
import type { TabNode } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';

interface WorkspaceProps {
  model: Model;
  factory: (node: TabNode) => React.ReactNode;
}

export function Workspace({ model, factory }: WorkspaceProps) {
  return (
    <Layout
      model={model}
      factory={factory}
      classNameMapper={(defaultClassName) => defaultClassName}
    />
  );
}
```

Add CSS overrides for flexlayout-react in a co-located stylesheet: use `--border-subtle` for splitter borders, zero border-radius on tiles, hide default tab chrome where Meridian Panel provides its own header.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Workspace.tsx src/hooks/useWorkspace.ts
git commit -m "feat: add Workspace component with layout persistence and presets"
```

---

## Task 11: Data Components — Sparkline

**Files:**
- Create: `src/components/data/Sparkline.tsx`

- [ ] **Step 1: Create Sparkline**

Props: `data: number[]`, `width?: number` (default 60), `height?: number` (default 20), `color?: string` (default `var(--color-cat-0)`), `showArea?: boolean`.

Pure SVG implementation:
- Calculate min/max of data for Y scaling
- Map data points to SVG coordinates
- Render `<polyline>` with `fill="none"` and `stroke={color}` at 1.5px stroke-width
- If `showArea`, add a filled `<polygon>` with 10% opacity below the line
- viewBox: `0 0 {width} {height}`, preserveAspectRatio: `none`

- [ ] **Step 2: Commit**

```bash
git add src/components/data/Sparkline.tsx
git commit -m "feat: add SVG Sparkline component"
```

---

## Task 12: Data Components — DataTable (AG Grid)

**Files:**
- Create: `src/components/data/DataTable.tsx`
- Create: `src/components/data/cell-renderers.tsx`
- Create: `src/components/data/ag-grid-meridian.css`

- [ ] **Step 1: Create AG Grid Meridian theme CSS**

Override AG Grid CSS custom properties to map to Meridian tokens:

```css
.ag-theme-meridian {
  --ag-background-color: var(--bg-surface);
  --ag-header-background-color: var(--bg-surface);
  --ag-odd-row-background-color: var(--bg-muted);
  --ag-row-hover-color: var(--bg-highlight);
  --ag-selected-row-background-color: var(--bg-overlay);
  --ag-border-color: var(--border-subtle);
  --ag-header-foreground-color: var(--text-secondary);
  --ag-foreground-color: var(--text-primary);
  --ag-secondary-foreground-color: var(--text-secondary);
  --ag-font-family: var(--font-sans);
  --ag-font-size: 13px;
  --ag-row-height: 32px;
  --ag-header-height: 28px;
  --ag-cell-horizontal-padding: 8px;
  --ag-border-radius: 0px;
}

.ag-theme-meridian.density-compact {
  --ag-row-height: 24px;
  --ag-font-size: 12px;
}

.ag-theme-meridian.density-comfortable {
  --ag-row-height: 40px;
}
```

- [ ] **Step 2: Create cell renderers**

`cell-renderers.tsx` — each renderer is a small React component that AG Grid renders in cells:

- `NumericCell` — right-aligned, `tabular-nums`, uses `fmt()`, configurable decimals via `colDef.cellRendererParams.decimals`
- `ChangeCell` — renders `PriceChange` component
- `BadgeCell` — renders `Tag` component
- `SparklineCell` — renders `Sparkline` component with cell data
- `ActionCell` — renders icon buttons (placeholder icons for now)

- [ ] **Step 3: Create DataTable component**

Props: `columns: ColDef[]`, `rows: any[]`, `density?: 'compact' | 'default' | 'comfortable'`, `onRowClick?: (row: any) => void`, `groupBy?: string`.

Wraps `AgGridReact` from `ag-grid-react`. Applies `ag-theme-meridian` class + density class. Registers custom cell renderers. Passes through AG Grid props. Handles row click via `onRowClicked`. If `groupBy` is set, configure AG Grid row grouping with categorical left-border (2px `border-left` using `--color-cat-{groupIndex}`).

Import `ag-grid-community/styles/ag-grid.css` and `./ag-grid-meridian.css`.

- [ ] **Step 4: Verify DataTable renders**

Add a temporary test in the dev app with sample data to confirm AG Grid loads, theming applies, and cell renderers work.

Run: `npx vite --open`
Expected: Styled data table with Meridian colors, correct font, row hover.

- [ ] **Step 5: Commit**

```bash
git add src/components/data/
git commit -m "feat: add DataTable (AG Grid wrapper) with Meridian theme and cell renderers"
```

---

## Task 13: Chart Component (Plotly)

**Files:**
- Create: `src/components/charting/meridian-plotly-template.ts`
- Create: `src/components/charting/Chart.tsx`

- [ ] **Step 1: Create Plotly template**

`meridian-plotly-template.ts` — exports two functions:

- `getMeridianLayout(theme: 'dark' | 'light'): Partial<Plotly.Layout>` — returns the full layout template. Read CSS custom property values from the DOM at call time using `getComputedStyle(document.documentElement).getPropertyValue('--token-name')`. This ensures the template always reflects the current theme.
- `getMeridianConfig(): Partial<Plotly.Config>` — returns the config object (displayModeBar, scrollZoom, etc.)

Follow the exact template structure from `meridian-implementation.md` lines 228-414. Key elements:
- `paper_bgcolor: 'transparent'`, `plot_bgcolor` from `--bg-base`
- Dotted gridlines from `--border-subtle`
- Right-side Y axis
- Crosshair spikelines
- Horizontal legend above chart
- JetBrains Mono tick labels
- Categorical ramp as colorway
- Per-type overrides for candlestick (semantic positive/negative)

- [ ] **Step 2: Create Chart component**

Props: `data: Plotly.Data[]`, `layout?: Partial<Plotly.Layout>`, `config?: Partial<Plotly.Config>`.

Wraps `react-plotly.js`. Merges user layout with `getMeridianLayout()`. Merges user config with `getMeridianConfig()`. Responsive: `useResizeObserver` or `responsive: true` in config. Re-renders template when theme changes (subscribe to theme context).

```typescript
import Plot from 'react-plotly.js';
import { useTheme } from '@/hooks/useTheme';
import { getMeridianLayout, getMeridianConfig } from './meridian-plotly-template';

interface ChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
}

export function Chart({ data, layout = {}, config = {} }: ChartProps) {
  const { theme } = useTheme();
  const baseLayout = getMeridianLayout(theme);
  const baseConfig = getMeridianConfig();

  return (
    <Plot
      data={data}
      layout={{
        ...baseLayout,
        ...layout,
        xaxis: { ...baseLayout.xaxis, ...layout.xaxis },
        yaxis: { ...baseLayout.yaxis, ...layout.yaxis },
      }}
      config={{ ...baseConfig, ...config }}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
    />
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/charting/
git commit -m "feat: add Chart component with Meridian Plotly template"
```

---

## Task 14: Feedback Components

**Files:**
- Create: `src/components/feedback/Toast.tsx`
- Create: `src/components/feedback/Modal.tsx`
- Create: `src/components/feedback/NotificationFeed.tsx`

- [ ] **Step 1: Create Toast**

A simple toast notification system — not using Radix Toast (to avoid the extra dependency), just a positioned container.

State management via a module-level store:

```typescript
// Toast store
let toasts: ToastItem[] = [];
let listeners: (() => void)[] = [];

interface ToastItem {
  id: string;
  message: string;
  variant: 'info' | 'warning' | 'error';
  createdAt: number;
}

export function showToast(message: string, variant: ToastItem['variant'] = 'info', duration = 5000) {
  const id = crypto.randomUUID();
  toasts = [...toasts, { id, message, variant, createdAt: Date.now() }];
  if (toasts.length > 3) toasts = toasts.slice(-3);
  listeners.forEach((l) => l());
  setTimeout(() => dismissToast(id), duration);
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l());
}
```

`ToastContainer` component — renders in top-right, fixed position. Maps toasts to styled divs with variant-appropriate border-left color (info, warning, negative). Fade-in animation.

- [ ] **Step 2: Create Modal**

Built on Radix Dialog. Props: `open: boolean`, `onClose: () => void`, `title: string`, `children: ReactNode`.

Overlay: `bg-black/50 backdrop-blur-sm`. Content: `bg-surface rounded-lg border border-default p-6 max-w-md`. Title: `text-section` scale. Close button in top-right corner.

- [ ] **Step 3: Create NotificationFeed**

Props: `notifications: { id: string, message: string, timestamp: number, action?: string }[]`, `onDismiss: (id: string) => void`.

Scrollable list. Each entry: timestamp (formatted, `text-muted text-caption`), message (`text-primary text-small`), optional action link (`text-info`), dismiss button (X). `bg-surface` background, `border-subtle` separator between entries.

- [ ] **Step 4: Commit**

```bash
git add src/components/feedback/
git commit -m "feat: add feedback components (Toast, Modal, NotificationFeed)"
```

---

## Task 15: Barrel Export

**Files:**
- Create: `src/components/index.ts`

- [ ] **Step 1: Create barrel export**

Re-export all public components:

```typescript
// Primitives
export { CatDot } from './primitives/CatDot';
export { PriceChange } from './primitives/PriceChange';
export { FlashCell } from './primitives/FlashCell';
export { MetricCard } from './primitives/MetricCard';
export { Tag } from './primitives/Tag';

// Inputs
export { Toggle } from './inputs/Toggle';
export { NumberInput } from './inputs/NumberInput';
export { Select } from './inputs/Select';
export { DatePicker } from './inputs/DatePicker';
export { Autocomplete } from './inputs/Autocomplete';

// Data
export { Sparkline } from './data/Sparkline';
export { DataTable } from './data/DataTable';

// Layout
export { Panel } from './layout/Panel';
export { PanelHeader } from './layout/PanelHeader';
export { Toolbar } from './layout/Toolbar';
export { Workspace } from './layout/Workspace';

// Charting
export { Chart } from './charting/Chart';

// Feedback
export { Toast, ToastContainer, showToast } from './feedback/Toast';
export { Modal } from './feedback/Modal';
export { NotificationFeed } from './feedback/NotificationFeed';
```

- [ ] **Step 2: Commit**

```bash
git add src/components/index.ts
git commit -m "feat: add barrel export for all components"
```

---

## Task 16: Demo Panels

**Files:**
- Create: `src/demo/panels/WatchlistPanel.tsx`
- Create: `src/demo/panels/ChartPanel.tsx`
- Create: `src/demo/panels/PricerPanel.tsx`
- Create: `src/demo/panels/workspace-presets.ts`

- [ ] **Step 1: Create workspace-presets.ts**

Define the two layout presets as FlexLayout React `IJsonModel` objects:

```typescript
import type { IJsonModel } from 'flexlayout-react';

export const EQUITY_TRADING: IJsonModel = {
  global: {},
  layout: {
    type: 'row',
    children: [
      {
        type: 'tabset',
        weight: 35,
        children: [{ type: 'tab', id: 'watchlist', name: 'Watchlist' }],
      },
      {
        type: 'column',
        weight: 65,
        children: [
          { type: 'tabset', weight: 60, children: [{ type: 'tab', id: 'chart', name: 'Chart' }] },
          { type: 'tabset', weight: 40, children: [{ type: 'tab', id: 'pricer', name: 'Pricer' }] },
        ],
      },
    ],
  },
};

export const OPTIONS_DESK: IJsonModel = {
  global: {},
  layout: {
    type: 'column',
    children: [
      {
        type: 'row',
        weight: 55,
        children: [
          { type: 'tabset', weight: 40, children: [{ type: 'tab', id: 'watchlist', name: 'Watchlist' }] },
          { type: 'tabset', weight: 60, children: [{ type: 'tab', id: 'pricer', name: 'Pricer' }] },
        ],
      },
      { type: 'tabset', weight: 45, children: [{ type: 'tab', id: 'chart', name: 'Chart' }] },
    ],
  },
};

export const PRESETS: Record<string, IJsonModel> = {
  'Equity Trading': EQUITY_TRADING,
  'Options Desk': OPTIONS_DESK,
};
```

- [ ] **Step 2: Create WatchlistPanel**

Uses `DataTable` with columns: Symbol, Name, Last, Change %, Bid, Ask, Volume. Data from `DataProvider`. Groups rows by `group` field with categorical left-border. Click handler calls `setSelectedSymbol`. Uses `ChangeCell` for change column, `NumericCell` for prices, `fmtK` for volume.

Subscribes to all instruments' ticks via `useEffect` + `provider.subscribe`. Maintains state of latest tick per instrument.

Wrapped in `Panel` with title "Watchlist".

- [ ] **Step 3: Create ChartPanel**

Consumes `selectedSymbol` from `DataProvider`. Calls `getHistory` for the selected symbol. Renders `Chart` component with candlestick data. Shows instrument symbol in panel title. If no symbol selected, shows placeholder message.

Wrapped in `Panel` with title "Chart — {symbol}".

Candlestick data format for Plotly:
```typescript
const trace = {
  type: 'candlestick',
  x: candles.map(c => new Date(c.time)),
  open: candles.map(c => c.open),
  high: candles.map(c => c.high),
  low: candles.map(c => c.low),
  close: candles.map(c => c.close),
  increasing: { line: { color: 'var(--color-positive)' } },
  decreasing: { line: { color: 'var(--color-negative)' } },
};
```

- [ ] **Step 4: Create PricerPanel**

Consumes `selectedSymbol` from `DataProvider`. Displays option pricing information for the selected instrument. Shows:
- Market data section (price, bid, ask, volume) — using `MetricCard` components
- Greeks section (delta, gamma, vega, theta) — computed from simple Black-Scholes approximation or hardcoded sample values
- Color-coded sections using categorical ramp (e.g., market data = cat-0, volatility = cat-1, rates = cat-2, outputs = cat-3)

Each section has a `CatDot` + section label header. Values displayed in `MetricCard` components.

Wrapped in `Panel` with title "Pricer — {symbol}".

- [ ] **Step 5: Verify panels render independently**

Create a temporary test page that renders each panel in isolation to verify they work before integrating into the workspace.

Run: `npx vite --open`
Expected: Each panel renders with correct data, styling, and cross-panel linking.

- [ ] **Step 6: Commit**

```bash
git add src/demo/panels/
git commit -m "feat: add demo panels (Watchlist, Chart, Pricer) with workspace presets"
```

---

## Task 17: Demo App Shell

**Files:**
- Create: `src/demo/NavBar.tsx`
- Create: `src/demo/App.tsx`
- Modify: `src/demo/main.tsx`

- [ ] **Step 1: Create NavBar**

Props: `currentPreset: string`, `presets: string[]`, `onPresetChange: (name: string) => void`.

Fixed height (40px). `bg-surface`, `border-b border-subtle`. Flex layout:
- Left: "MERIDIAN" in `text-section font-semibold tracking-wider text-primary` + version in `text-muted text-caption ml-2`
- Center: preset switcher — simple `<select>` or the Meridian `Select` component listing preset names
- Right: theme toggle button using `useTheme` — sun/moon icon or text label

- [ ] **Step 2: Create App.tsx**

Main application component:

```typescript
import { Workspace } from '@/components/layout/Workspace';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useDataContext } from '@/providers/DataProvider';
import { NavBar } from './NavBar';
import { WatchlistPanel } from './panels/WatchlistPanel';
import { ChartPanel } from './panels/ChartPanel';
import { PricerPanel } from './panels/PricerPanel';
import { PRESETS, EQUITY_TRADING } from './panels/workspace-presets';

const PANEL_MAP: Record<string, () => React.ReactNode> = {
  watchlist: () => <WatchlistPanel />,
  chart: () => <ChartPanel />,
  pricer: () => <PricerPanel />,
};

export function App() {
  const { layout, setLayout, presets, activePreset, loadPreset } = useWorkspace(EQUITY_TRADING, PRESETS);

  return (
    <div className="h-screen flex flex-col bg-base">
      <NavBar
        currentPreset={activePreset}
        presets={Object.keys(presets)}
        onPresetChange={loadPreset}
      />
      <div className="flex-1 overflow-hidden">
        <Workspace
          layout={layout}
          onChange={setLayout}
          renderTile={(id) => PANEL_MAP[id]?.() ?? <div>Unknown: {id}</div>}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update main.tsx as the entry point**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { DataProvider } from '@/providers/DataProvider';
import { App } from './App';
import '../tokens/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </ThemeProvider>
  </StrictMode>,
);
```

- [ ] **Step 4: Verify the full demo works**

Run: `npx vite --open`

Expected:
- Dark theme loads by default
- NavBar shows "MERIDIAN" wordmark, preset switcher, theme toggle
- Workspace renders with Equity Trading layout (watchlist left, chart top-right, pricer bottom-right)
- Watchlist populates with simulated instruments, prices tick every ~1s
- Clicking a watchlist row updates the chart and pricer panels
- Theme toggle switches to light mode instantly
- Workspace splits are draggable
- Preset switcher changes layout

- [ ] **Step 5: Commit**

```bash
git add src/demo/NavBar.tsx src/demo/App.tsx src/demo/main.tsx
git commit -m "feat: add demo app shell with workspace, nav bar, and full panel integration"
```

---

## Task 18: Philosophy Documentation

**Files:**
- Create: `docs/philosophy/overview.md`
- Create: `docs/philosophy/color-system.md`
- Create: `docs/philosophy/information-density.md`
- Create: `docs/philosophy/typography.md`
- Create: `docs/philosophy/workspace-layout.md`
- Create: `docs/philosophy/notifications.md`
- Create: `docs/philosophy/accessibility.md`

Each doc follows: **What we do → Why (research/evidence) → How it's implemented → References**

Source material: `meridian-research.md` contains the full research, citations, and rationale. `meridian-implementation.md` contains the implementation details. The docs should synthesize both into narrative form.

- [ ] **Step 1: Create overview.md**

Structure:
- What Meridian is (design system for professional trading/analytics apps built on perceptual science)
- Core design principles (density, redundant encoding, cognitive load management, evidence-based color) — expand each with 2-3 sentences explaining the principle
- Technology choices and why (table of stack with brief rationale for each)
- How to use the system (tokens → components → workspace, theme switching)

Do NOT frame as "better than Bloomberg" or compare to any specific product. Lead with Meridian's own principles.

- [ ] **Step 2: Create color-system.md**

Narrative covering:
- Why two separate color systems (semantic vs categorical) — early mistake of baking meaning into ramp
- CIELAB methodology — sRGB → XYZ → CIELAB pipeline, why perceptual distance matters
- CVD-safety validation — Viénot 1999 deuteranopia matrix, the mathematical constraint of 8 CVD-safe colors in sRGB
- Max-distance-first ordering — Tableau methodology, 3x improvement over rainbow, why blue starts
- 6+2 structure — Tseng et al. perception drop at 6, L* as "CVD weapon"
- Light theme derivation — the L* collapse lesson, naively darkening creates perceptually identical colors
- References: Ware, Viénot, Gramazio, Observable, Stone, Berlin-Kay, Tseng, Heer

- [ ] **Step 3: Create information-density.md**

Narrative covering:
- Three axes of density (visual, temporal, value) — the goal is value density
- Working memory ~4 items (not Miller's 7±2) — implications for simultaneous color categories
- Three-tier hierarchy (glanceable, scannable, explorable) — with examples from trading context
- 64px chrome budget — panel header + toolbar ceiling
- Professional spatial muscle memory — consistency over optimization
- References: Ström-Awn, Garrett, Cowan, HRT

- [ ] **Step 4: Create typography.md**

Narrative covering:
- Two optimization targets: tabular figures + proportional spacing
- Why Inter (screen optimization 11-13px, true tabular figures, extensive weights)
- Why JetBrains Mono (price ladders, order books)
- The type scale (11-16px range, rationale for each step)
- Numeric formatting: `tabular-nums` everywhere, decimal precision by asset class
- References: Inforiver, Smashing Magazine

- [ ] **Step 5: Create workspace-layout.md**

Narrative covering:
- Industry analysis: Bloomberg Launchpad (pages + grid), OpenFin (platform-level splits + tabs)
- Psychology: Zeigarnik effect (rebuilding layouts = cognitive tax), Sweller's Cognitive Load Theory
- Three principles: persist by default, progressive disclosure, reduce layout cognitive load
- Recommendation: hybrid tiling + tabs + named presets
- Implementation: FlexLayout React, IJsonModel serialization, localStorage persistence
- References: Bloomberg Launchpad PDF, OpenFin, Patel 2025, Sweller

- [ ] **Step 6: Create notifications.md**

Narrative covering:
- The cognitive load study (N=120 lab, N=100 field, NASA-TLX, HRV findings)
- Batching as solution — preserves responsiveness while cutting stress
- Zeigarnik effect — unacted notifications as "cognitive open loops"
- Four-tier taxonomy: Critical, Urgent, Informational, Passive — with UI mapping
- Toast stack limit rationale (3 visible max)
- References: Notification batching study, Zeigarnik

- [ ] **Step 7: Create accessibility.md**

Narrative covering:
- WCAG 2.2 AA as baseline
- Redundant encoding as default, not opt-in — color is never the sole channel
- 6-color discrimination threshold (Tseng et al.) — why core 6 + secondary encoding for 7-8
- `prefers-reduced-motion` — disable animation but still update values
- Focus ring design (box-shadow, not border — avoids layout shift)
- Keyboard navigation patterns
- References: WCAG, Tseng

- [ ] **Step 8: Commit**

```bash
git add docs/philosophy/
git commit -m "docs: add philosophy documentation explaining design decisions and research"
```

---

## Task 19: Reference Documentation

**Files:**
- Create: `docs/reference/tokens.md`
- Create: `docs/reference/components.md`
- Create: `docs/reference/patterns.md`
- Copy: `meridian-research.md` → `docs/research/meridian-research.md`

- [ ] **Step 1: Create tokens.md**

Complete token reference tables:

- **Categorical Ramp** — table: Index, Name, Dark hex, Light hex, CIELAB values, Berlin-Kay term
- **Semantic Colors** — table: Token, Dark hex, Light hex, Usage, Required redundant encoding
- **Backgrounds** — table: Token, Dark hex, Light hex, Usage
- **Text** — table: Token, Dark hex, Light hex, Usage
- **Borders** — table: Token, Dark hex, Light hex, Usage
- **Typography** — table: Token, Font, Size, Weight, Line height, Usage
- **Spacing** — table: Token, Value, Usage
- **Border Radius** — table: Token, Value, Usage

All values from the spec and `meridian-implementation.md`.

- [ ] **Step 2: Create components.md**

For each component: name, description, props table, usage example, tokens consumed.

Organized by category: Primitives, Inputs, Data, Layout, Charting, Feedback.

Example format:
```markdown
### CatDot

Colored indicator square for categorical data.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| index | 0-7 | required | Categorical ramp index |
| size | number | 8 | Square size in pixels |

**Usage:**
\`\`\`tsx
<CatDot index={0} />
<CatDot index={3} size={12} />
\`\`\`

**Tokens:** `--color-cat-{index}`
```

- [ ] **Step 3: Create patterns.md**

Cross-cutting pattern documentation:

- **Cross-panel linking** — how DataProvider context works, publisher/subscriber pattern, adding new linked panels
- **Workspace persistence** — localStorage serialization, preset system, adding new panels to the registry
- **Flash-on-update** — useFlash hook, CSS transition approach, prefers-reduced-motion
- **Density modes** — compact/default/comfortable, AG Grid row height, switching
- **Keyboard navigation** — Tab order, grid navigation, shortcuts table
- **Theme switching** — data-theme attribute, ThemeProvider, how tokens cascade

- [ ] **Step 4: Copy research to docs/research/**

```bash
mkdir -p docs/research
cp meridian-research.md docs/research/meridian-research.md
```

- [ ] **Step 5: Commit**

```bash
git add docs/reference/ docs/research/
git commit -m "docs: add reference documentation (tokens, components, patterns) and preserve research"
```

---

## Task 20: Final Integration & Verification

- [ ] **Step 1: Run the full build**

```bash
npm run build
```

Expected: Clean build, no TypeScript errors, output in `dist/`.

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 3: Run dev server and manual verification**

```bash
npm run dev
```

Verify:
- [ ] Dark theme loads correctly with all token colors
- [ ] Theme toggle switches to light mode, all tokens update
- [ ] Workspace renders with Equity Trading preset
- [ ] Watchlist shows instruments with live price ticks
- [ ] Clicking a watchlist row updates chart and pricer
- [ ] Chart shows candlestick data with Meridian template styling
- [ ] Pricer shows greeks and market data with categorical color sections
- [ ] Workspace splits are draggable
- [ ] Preset switcher changes layout
- [ ] Layout persists on page refresh
- [ ] No console errors

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration fixes from final verification"
```

(Only if there were fixes needed.)

- [ ] **Step 5: Final commit — tag v0.1.0**

```bash
git tag v0.1.0
```
