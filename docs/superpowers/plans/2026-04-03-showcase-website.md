# Showcase Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 21-page showcase/documentation website for the Meridian design system, replacing the current demo entry point.

**Architecture:** React Router with lazy-loaded JSX pages. A shell (TopBar + Sidebar + content area) wraps all pages. Site-specific helper components (Section, Figure, Citation, etc.) keep research prose readable as JSX. The existing trading demo embeds as one page.

**Tech Stack:** React 19, react-router-dom, Vite, Tailwind CSS 4, existing Meridian component library.

**Spec:** `docs/superpowers/specs/2026-04-03-showcase-website-design.md`

---

## Task 1: Install dependency and create site shell

**Files:**
- Modify: `package.json` — add `react-router-dom`
- Modify: `index.html:13` — change script src
- Create: `src/site/main.tsx`
- Create: `src/site/App.tsx`
- Create: `src/site/router.tsx`
- Create: `src/site/components/TopBar.tsx`
- Create: `src/site/components/Sidebar.tsx`

### Steps

- [ ] **Step 1: Install react-router-dom**

```bash
npm install react-router-dom
```

- [ ] **Step 2: Create TopBar component**

Create `src/site/components/TopBar.tsx`:

```tsx
import { useTheme } from '@/hooks/useTheme';

export function TopBar() {
  const { theme, toggle } = useTheme();

  return (
    <div
      style={{
        height: 48,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 20px',
        gap: 16,
      }}
    >
      <span
        style={{
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--text-primary)',
        }}
      >
        MERIDIAN
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        Design System
      </span>
      <div style={{ flex: 1 }} />
      <button
        onClick={toggle}
        style={{
          backgroundColor: 'var(--bg-muted)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--text-primary)',
          fontSize: 12,
          padding: '4px 10px',
          borderRadius: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {theme === 'dark' ? '☀ Light' : '☾ Dark'}
      </button>
      <a
        href="https://github.com/anthropics/meridian"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'var(--text-secondary)',
          fontSize: 12,
          padding: '4px 10px',
          border: '1px solid var(--border-subtle)',
          borderRadius: 2,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        GitHub ↗
      </a>
    </div>
  );
}
```

- [ ] **Step 3: Create Sidebar component**

Create `src/site/components/Sidebar.tsx`. The sidebar contains grouped navigation links. It uses `NavLink` from react-router-dom for active state styling.

```tsx
import { NavLink } from 'react-router-dom';

interface NavItem {
  label: string;
  path: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Introduction', path: '/' },
      { label: 'Getting Started', path: '/getting-started' },
    ],
  },
  {
    title: 'Research',
    items: [
      { label: 'Information Density', path: '/research/information-density' },
      { label: 'Color System', path: '/research/color-system' },
      { label: 'Typography', path: '/research/typography' },
      { label: 'Shape & Radius', path: '/research/shape-and-radius' },
      { label: 'Workspace Layout', path: '/research/workspace-layout' },
      { label: 'Notifications', path: '/research/notifications' },
      { label: 'Accessibility', path: '/research/accessibility' },
    ],
  },
  {
    title: 'Tokens',
    items: [
      { label: 'Colors', path: '/tokens/colors' },
      { label: 'Typography', path: '/tokens/typography' },
      { label: 'Spacing', path: '/tokens/spacing' },
      { label: 'Borders & Radius', path: '/tokens/borders' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Data Table', path: '/components/data-table' },
      { label: 'Chart', path: '/components/chart' },
      { label: 'Workspace', path: '/components/workspace' },
      { label: 'Panel', path: '/components/panel' },
      { label: 'Primitives', path: '/components/primitives' },
      { label: 'Inputs', path: '/components/inputs' },
      { label: 'Feedback', path: '/components/feedback' },
    ],
  },
  {
    title: 'Demo',
    items: [{ label: 'Trading App', path: '/demo' }],
  },
];

const groupLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: 1,
  color: 'var(--text-muted)',
  marginBottom: 8,
};

const linkBaseStyle: React.CSSProperties = {
  display: 'block',
  padding: '4px 8px',
  fontSize: 13,
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  borderRadius: 2,
  marginBottom: 2,
};

export function Sidebar() {
  return (
    <nav
      style={{
        width: 220,
        flexShrink: 0,
        backgroundColor: 'var(--bg-base)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '16px 0',
        overflowY: 'auto',
      }}
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.title} style={{ padding: '0 16px', marginBottom: 16 }}>
          <div style={groupLabelStyle}>{group.title}</div>
          {group.items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...linkBaseStyle,
                ...(isActive
                  ? {
                      color: 'var(--color-info)',
                      backgroundColor: 'var(--bg-muted)',
                    }
                  : {}),
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-muted)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Create App shell**

Create `src/site/App.tsx`. This is the layout route — TopBar + Sidebar + scrollable content area with scroll-to-top on navigation.

```tsx
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';

export function App() {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const isDemo = location.pathname === '/demo';

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <TopBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <div
          ref={contentRef}
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
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create router with placeholder pages**

Create `src/site/router.tsx`. Start with a placeholder component for all routes — actual pages will be filled in by later tasks.

```tsx
import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';

function Loading() {
  return (
    <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '32px 0' }}>
      Loading...
    </div>
  );
}

function lazyPage(factory: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: lazyPage(() => import('./pages/overview/Introduction')) },
      { path: 'getting-started', element: lazyPage(() => import('./pages/overview/GettingStarted')) },
      { path: 'research/information-density', element: lazyPage(() => import('./pages/research/InformationDensity')) },
      { path: 'research/color-system', element: lazyPage(() => import('./pages/research/ColorSystem')) },
      { path: 'research/typography', element: lazyPage(() => import('./pages/research/Typography')) },
      { path: 'research/shape-and-radius', element: lazyPage(() => import('./pages/research/ShapeAndRadius')) },
      { path: 'research/workspace-layout', element: lazyPage(() => import('./pages/research/WorkspaceLayout')) },
      { path: 'research/notifications', element: lazyPage(() => import('./pages/research/Notifications')) },
      { path: 'research/accessibility', element: lazyPage(() => import('./pages/research/Accessibility')) },
      { path: 'tokens/colors', element: lazyPage(() => import('./pages/tokens/Colors')) },
      { path: 'tokens/typography', element: lazyPage(() => import('./pages/tokens/TypographyTokens')) },
      { path: 'tokens/spacing', element: lazyPage(() => import('./pages/tokens/Spacing')) },
      { path: 'tokens/borders', element: lazyPage(() => import('./pages/tokens/Borders')) },
      { path: 'components/data-table', element: lazyPage(() => import('./pages/components/DataTablePage')) },
      { path: 'components/chart', element: lazyPage(() => import('./pages/components/ChartPage')) },
      { path: 'components/workspace', element: lazyPage(() => import('./pages/components/WorkspacePage')) },
      { path: 'components/panel', element: lazyPage(() => import('./pages/components/PanelPage')) },
      { path: 'components/primitives', element: lazyPage(() => import('./pages/components/PrimitivesPage')) },
      { path: 'components/inputs', element: lazyPage(() => import('./pages/components/InputsPage')) },
      { path: 'components/feedback', element: lazyPage(() => import('./pages/components/FeedbackPage')) },
      { path: 'demo', element: lazyPage(() => import('./pages/demo/TradingApp')) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
```

- [ ] **Step 6: Create main.tsx entry point**

Create `src/site/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { router } from './router';
import '../tokens/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
);
```

- [ ] **Step 7: Create placeholder page files**

Create all 21 page files as simple placeholders so the router resolves. Each file follows this pattern:

```tsx
// src/site/pages/overview/Introduction.tsx
export default function Introduction() {
  return <div>Introduction — TODO</div>;
}
```

Create placeholder files for all 21 pages listed in the router.

- [ ] **Step 8: Update index.html**

Change the script src in `index.html` line 13 from:
```html
<script type="module" src="/src/demo/main.tsx"></script>
```
to:
```html
<script type="module" src="/src/site/main.tsx"></script>
```

- [ ] **Step 9: Verify the shell works**

```bash
npx tsc --noEmit && npx vite build
```

Expected: builds successfully. Then run `npm run dev` and verify the site loads with TopBar, Sidebar, and "Introduction — TODO" content. Verify sidebar navigation switches between placeholder pages. Verify theme toggle works.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: add showcase site shell with router, sidebar, and placeholder pages"
```

---

## Task 2: Create site helper components

**Files:**
- Create: `src/site/components/Section.tsx`
- Create: `src/site/components/Figure.tsx`
- Create: `src/site/components/Citation.tsx`
- Create: `src/site/components/TokenSwatch.tsx`
- Create: `src/site/components/TokenTable.tsx`
- Create: `src/site/components/ComponentDemo.tsx`

### Steps

- [ ] **Step 1: Create Section component**

Create `src/site/components/Section.tsx`:

```tsx
import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  id?: string;
  children: ReactNode;
}

export function Section({ title, id, children }: SectionProps) {
  const anchor = id ?? title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return (
    <section style={{ marginTop: 32 }}>
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: 24,
        }}
      >
        <h2
          id={anchor}
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 12px 0',
          }}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create Figure component**

Create `src/site/components/Figure.tsx`:

```tsx
import type { ReactNode } from 'react';

interface FigureProps {
  caption: string;
  children: ReactNode;
}

export function Figure({ caption, children }: FigureProps) {
  return (
    <figure
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        padding: 16,
        margin: '16px 0',
      }}
    >
      <figcaption
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-muted)',
          marginBottom: 12,
        }}
      >
        {caption}
      </figcaption>
      {children}
    </figure>
  );
}
```

- [ ] **Step 3: Create Citation component**

Create `src/site/components/Citation.tsx`:

```tsx
interface CitationProps {
  id: number;
  authors: string;
  title: string;
  source?: string;
  url?: string;
}

export function Citation({ id, authors, title, source, url }: CitationProps) {
  return (
    <div
      id={`ref-${id}`}
      style={{
        borderLeft: '2px solid var(--border-default)',
        paddingLeft: 12,
        margin: '8px 0',
        fontSize: 12,
        lineHeight: 1.6,
      }}
    >
      <strong style={{ color: 'var(--text-secondary)' }}>[{id}]</strong>{' '}
      <span style={{ color: 'var(--text-muted)' }}>
        {authors}. "{title}."
        {source && <> {source}.</>}
        {url && (
          <>
            {' '}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--color-info)' }}
            >
              Link
            </a>
          </>
        )}
      </span>
    </div>
  );
}
```

- [ ] **Step 4: Create TokenSwatch component**

Create `src/site/components/TokenSwatch.tsx`:

```tsx
interface TokenSwatchProps {
  color: string;
  name: string;
  hex: string;
  variable: string;
}

export function TokenSwatch({ color, name, hex, variable }: TokenSwatchProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        backgroundColor: 'var(--bg-surface)',
        padding: '8px 12px',
        borderRadius: 2,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          backgroundColor: color,
          borderRadius: 2,
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
          {name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {hex}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{variable}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create TokenTable component**

Create `src/site/components/TokenTable.tsx`:

```tsx
interface TokenTableProps {
  columns: string[];
  rows: string[][];
}

export function TokenTable({ columns, rows }: TokenTableProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 4,
        overflow: 'hidden',
        margin: '16px 0',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {columns.map((col) => (
              <th
                key={col}
                style={{
                  padding: '8px 12px',
                  textAlign: 'left',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              style={{
                borderBottom:
                  i < rows.length - 1
                    ? '1px solid var(--border-subtle)'
                    : 'none',
                backgroundColor: i % 2 === 1 ? 'var(--bg-muted)' : 'transparent',
              }}
            >
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    padding: '6px 12px',
                    color: 'var(--text-primary)',
                    fontFamily: cell.startsWith('#') || cell.startsWith('--')
                      ? 'var(--font-mono)'
                      : undefined,
                  }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 6: Create ComponentDemo component**

Create `src/site/components/ComponentDemo.tsx`:

```tsx
import type { ReactNode } from 'react';

interface ComponentDemoProps {
  label: string;
  children: ReactNode;
}

export function ComponentDemo({ label, children }: ComponentDemoProps) {
  return (
    <div style={{ margin: '16px 0' }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: 'var(--text-muted)',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 4,
          padding: 20,
        }}
      >
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Verify build**

```bash
npx tsc --noEmit
```

Expected: passes with no errors.

- [ ] **Step 8: Commit**

```bash
git add src/site/components/ && git commit -m "feat: add site helper components (Section, Figure, Citation, TokenSwatch, TokenTable, ComponentDemo)"
```

---

## Task 3: Overview pages (Introduction + Getting Started)

**Files:**
- Modify: `src/site/pages/overview/Introduction.tsx`
- Modify: `src/site/pages/overview/GettingStarted.tsx`

### Steps

- [ ] **Step 1: Write Introduction page**

Replace the placeholder in `src/site/pages/overview/Introduction.tsx`. Content:
- Page title: "Meridian Design System"
- Subtitle paragraph: An evidence-based design system for professional multi-asset trading and financial analytics applications. Built on perceptual science, cognitive load research, and accessibility-first principles.
- Core principles section: 4 cards in a 2x2 grid (Density backed by science, Redundant encoding, Cognitive load management, Evidence-based color) — each with a brief description. Use `Figure` component to wrap the grid.
- Technology stack section: A `TokenTable` listing the stack (React 19, Radix UI, Tailwind CSS 4, AG Grid, Plotly.js, react-mosaic) with columns: Layer, Library, License.

Import and use `Section`, `Figure`, and `TokenTable` from `@/site/components/`.

**Important:** Do not include any Bloomberg editorial framing ("local maximum" etc.). Frame positively — what Meridian achieves.

- [ ] **Step 2: Write Getting Started page**

Replace the placeholder in `src/site/pages/overview/GettingStarted.tsx`. Content:
- Page title: "Getting Started"
- Project structure section: Describe the directory layout (tokens/, components/, demo/, site/) with a simple tree diagram in a `Figure`.
- How it works section: Explain the token cascade — CSS custom properties switched by `data-theme`, consumed by components via inline styles. Explain ThemeProvider.
- Tokens + Components + Theme: Brief description of each layer and how they connect.

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/overview/ && git commit -m "feat: add Introduction and Getting Started pages"
```

---

## Task 4: Research pages — Information Density & Color System

**Files:**
- Modify: `src/site/pages/research/InformationDensity.tsx`
- Modify: `src/site/pages/research/ColorSystem.tsx`

### Steps

- [ ] **Step 1: Write Information Density page**

Replace placeholder. Source content from `meridian-research.md` sections 2.1–2.3. Include:
- Three Axes of Density (visual, temporal, value) with descriptions
- Key Research Findings: working memory ~4 items (Cowan 2001), professional spatial muscle memory, instant progressive disclosure
- Three-Tier Information Hierarchy: Glanceable / Scannable / Explorable — use a `TokenTable` with columns: Tier, Timing, Examples, Styling
- Chrome budget: 64px max (header 24–32px + toolbar 28–36px). Use `Figure` to show a panel anatomy diagram.
- Citations [1]–[4] at the bottom using `Citation` components

- [ ] **Step 2: Write Color System page**

Replace placeholder. Source from `meridian-research.md` sections 3.1–3.5. This is the longest research page. Include:
- Two Separate Systems: semantic (fixed meaning) vs categorical (application-assigned)
- Perceptual Science: pre-attentive processing (<200ms), hue for categorical, luminance for magnitude, ~6 hue discrimination limit
- Dark Mode Research: reduced eye strain, red text fatigue, no pure black/white
- Categorical Ramp Methodology: CIELAB criteria, CVD simulation (Viénot 1999), Tokyo Night starting point, 6+2 structure rationale. Include the max-distance-first comparison table as a `TokenTable` (N, First N colors, Min ΔE, vs. rainbow).
- Use a `Figure` to show all 8 categorical color swatches (render actual `CatDot` components at size 24, side by side)
- Light Theme Derivation: L* collapse problem, green/teal fix
- Citations [5]–[18] using `Citation` components

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/research/InformationDensity.tsx src/site/pages/research/ColorSystem.tsx && git commit -m "feat: add Information Density and Color System research pages"
```

---

## Task 5: Research pages — Typography, Shape & Radius, Workspace Layout

**Files:**
- Modify: `src/site/pages/research/Typography.tsx`
- Modify: `src/site/pages/research/ShapeAndRadius.tsx`
- Modify: `src/site/pages/research/WorkspaceLayout.tsx`

### Steps

- [ ] **Step 1: Write Typography page**

Source from `meridian-research.md` section 4. Include:
- Two optimization targets: tabular figures + proportional labels
- Inter selection rationale (11–13px optimization, tabular support, weight range)
- JetBrains Mono for price ladders / order books
- `Figure` showing text samples at different type scale sizes (render actual text with the fonts)
- Numeric formatting by asset class: `TokenTable` with columns: Asset Class, Decimal Places, Example
- Citations [19], [30]

- [ ] **Step 2: Write Shape & Radius page**

Source from `meridian-research.md` section 5. Include:
- Shape perception research (Bar & Neta 2006): rounded = friendly, squared = precise
- Professional convergence: Bloomberg 0px, VS Code 0–2px, Meridian 2px
- Radius-correlates-with-detachment principle
- `Figure` showing the 4 radius tokens with example boxes at each radius value (0, 2, 4, 6px)
- `TokenTable` with columns: Token, Value, Usage, Examples
- Citation [20]

- [ ] **Step 3: Write Workspace Layout page**

Source from `meridian-research.md` sections 6.1–6.3. Include:
- Industry Analysis: Bloomberg Launchpad (pages + grid), OpenFin (splits + tabs + serialization)
- Psychology-Driven Layout: Sweller's Cognitive Load Theory, Zeigarnik effect, default-to-persist
- Recommendation: hybrid tiling + tabs with named presets
- Multi-monitor: deferred (3x complexity)
- Citations [21]–[24]

- [ ] **Step 4: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/research/Typography.tsx src/site/pages/research/ShapeAndRadius.tsx src/site/pages/research/WorkspaceLayout.tsx && git commit -m "feat: add Typography, Shape & Radius, and Workspace Layout research pages"
```

---

## Task 6: Research pages — Notifications & Accessibility

**Files:**
- Modify: `src/site/pages/research/Notifications.tsx`
- Modify: `src/site/pages/research/Accessibility.tsx`

### Steps

- [ ] **Step 1: Write Notifications page**

Source from `meridian-research.md` section 9. Include:
- Cognitive workload research: NASA-TLX study (N=120 lab, N=100 field), constant notifications raised cognitive workload, decreased HRV
- Zeigarnik effect: cognitive open loops from unacted-on notifications
- Batching: 2–5 second windows reduce stress while preserving responsiveness
- Four-tier taxonomy: `TokenTable` with columns: Tier, Urgency, UI, Dismiss, Rules
- Sound rule: Critical tier only
- Toast stack: 3 visible max
- Citations [28], [29]

- [ ] **Step 2: Write Accessibility page**

Source from `meridian-research.md` section 11 and `docs/philosophy/accessibility.md`. Include:
- WCAG 2.2 AA baseline: contrast requirements (4.5:1 normal, 3:1 large/UI)
- Redundant encoding as default design mode (not opt-in)
- `TokenTable` showing semantic encoding: Signal, Color, Shape, Text
- CVD safety: min ΔE ≥ 12 under deuteranopia, lightness separation strategy
- prefers-reduced-motion support: list of disabled animations
- Radix UI primitives: WAI-ARIA, focus management, keyboard patterns
- Focus ring spec: `box-shadow: 0 0 0 2px var(--color-info)`

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/research/Notifications.tsx src/site/pages/research/Accessibility.tsx && git commit -m "feat: add Notifications and Accessibility research pages"
```

---

## Task 7: Token pages

**Files:**
- Modify: `src/site/pages/tokens/Colors.tsx`
- Modify: `src/site/pages/tokens/TypographyTokens.tsx`
- Modify: `src/site/pages/tokens/Spacing.tsx`
- Modify: `src/site/pages/tokens/Borders.tsx`

### Steps

- [ ] **Step 1: Write Colors token page**

Replace placeholder. Use `TokenSwatch` and `Section` components. Include:
- Categorical Ramp: 8 swatches in a 2-column grid. Each swatch shows the CSS variable name and hex for the current theme. Note the 6+2 split (dim extensions at indices 6–7).
- Semantic Colors: 6 swatches with redundant encoding notes (e.g., "▲ + '+' prefix")
- Backgrounds: 5 swatches shown as a horizontal gradient strip (base → surface → muted → overlay → highlight)
- Text: 4 swatches
- Borders: 3 swatches
- Each section uses `Section` with a title. Reference `src/tokens/colors.css` for exact values. Render swatches using `var()` references so they update with theme toggle.

- [ ] **Step 2: Write Typography Tokens page**

Replace placeholder. Include:
- Font Stack: `TokenTable` with columns: Role, Font, Usage
- Type Scale: `TokenTable` with all 9 entries (Panel title through Monospace) — columns: Purpose, CSS Token, Font/Size/Weight/Line-Height
- Live type samples: a `Figure` rendering actual text at each scale step using the CSS tokens
- Numeric formatting rules: `TokenTable` with asset class formatting

- [ ] **Step 3: Write Spacing page**

Replace placeholder. Include:
- Base grid explanation: 4px
- All 11 spacing tokens in a visual list. For each token, show a colored bar whose width represents the value, plus the token name, CSS variable (`--space-*`), Tailwind alias (`--spacing-*`), and pixel value.
- Use `Figure` to wrap the visual representation.

- [ ] **Step 4: Write Borders page**

Replace placeholder. Include:
- Border width: 1px everywhere
- Radius tokens: 4 entries (none/sm/md/lg) with live example boxes rendered at each radius. Use `Figure`.
- Radius principle: correlates with detachment — `TokenTable` with columns: Token, Value, Usage
- Focus ring: spec and live demo (show a button with focus ring applied)

- [ ] **Step 5: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/tokens/ && git commit -m "feat: add token pages (Colors, Typography, Spacing, Borders)"
```

---

## Task 8: Component pages — Data Table & Chart

**Files:**
- Modify: `src/site/pages/components/DataTablePage.tsx`
- Modify: `src/site/pages/components/ChartPage.tsx`

### Steps

- [ ] **Step 1: Write Data Table page**

Replace placeholder. Include:
- Intro paragraph: AG Grid wrapper with Meridian theming, density modes, custom cell renderers
- Density modes demo: Render 3 small DataTable instances side by side (compact/default/comfortable) with the same sample data (~5 rows). Use `ComponentDemo` wrapper for each. Sample data: a few rows with symbol, name, last, change%, volume.
- Cell renderers demo: A single DataTable showing all cell types — text (left-aligned), numeric (right-aligned, tabular), change (PriceChange), badge, sparkline, action. Use `ComponentDemo`.
- Row grouping demo: Show DataTable with `groupBy` and categorical left borders. Use `ComponentDemo`.

The data for these demos is static (not from SimulatedMarketData). Define inline sample data arrays in the page file.

- [ ] **Step 2: Write Chart page**

Replace placeholder. Include:
- Intro paragraph: Plotly.js wrapper with Meridian template, dark/light theme support
- Candlestick demo: Render a `Chart` with sample OHLC data (~30 bars). Use `ComponentDemo`. Generate simple synthetic data inline.
- Template details: Describe the Meridian Plotly template — margins, axis config, hover, legend. Use a `TokenTable` for the key template values.
- Config: List the Plotly config object settings (displayModeBar, scrollZoom, etc.)

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/components/DataTablePage.tsx src/site/pages/components/ChartPage.tsx && git commit -m "feat: add Data Table and Chart component pages"
```

---

## Task 9: Component pages — Workspace & Panel

**Files:**
- Modify: `src/site/pages/components/WorkspacePage.tsx`
- Modify: `src/site/pages/components/PanelPage.tsx`

### Steps

- [ ] **Step 1: Write Workspace page**

Replace placeholder. Include:
- Intro paragraph: react-mosaic tiling with serializable layouts and named presets
- Tiling demo: Render a `Workspace` component inside a fixed-height container (400px) with a simple 3-tile layout. Each tile renders a minimal Panel with a title. Use `ComponentDemo`.
- Preset concept: Describe how presets serialize the layout tree to JSON and restore it.

- [ ] **Step 2: Write Panel page**

Replace placeholder. Include:
- Intro paragraph: Panel = PanelHeader + optional Toolbar + scrollable content
- Composition demo: Render a Panel with title, toolbar (with some placeholder buttons), and content. Use `ComponentDemo`.
- Chrome budget demo: Show the exact pixel measurements — PanelHeader 28px + Toolbar 32px = 60px total chrome. Use a `Figure` with a visual diagram.
- Individual components: Show PanelHeader and Toolbar rendered standalone.

- [ ] **Step 3: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/components/WorkspacePage.tsx src/site/pages/components/PanelPage.tsx && git commit -m "feat: add Workspace and Panel component pages"
```

---

## Task 10: Component pages — Primitives

**Files:**
- Modify: `src/site/pages/components/PrimitivesPage.tsx`

### Steps

- [ ] **Step 1: Write Primitives page**

Replace placeholder. Show each primitive with a heading, description, and live demo:

- **PriceChange**: All three states (positive +2.45%, negative -1.23%, neutral 0.00%) side by side. Describe redundant encoding: arrow + sign + color.
- **CatDot**: All 8 indices rendered in a row, each with a label (blue, green, red, teal, orange, purple, cyan, pink). Note 6+2 split.
- **FlashCell**: Render a FlashCell that cycles through values on a 2-second interval (using a `useState` + `useEffect` timer) to demonstrate the flash animation.
- **MetricCard**: 3 cards showing different data (Price: 187.42, Volume: 12.4M, Delta: 0.55).
- **Tag**: All three variants side by side (pass, warn, fail).
- **Sparkline**: Render 3 sparklines with different data patterns (uptrend, downtrend, volatile), showing the `showArea` option on one.

Each demo uses `ComponentDemo` wrapper. Import all components from `@/components`.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/components/PrimitivesPage.tsx && git commit -m "feat: add Primitives component page"
```

---

## Task 11: Component pages — Inputs

**Files:**
- Modify: `src/site/pages/components/InputsPage.tsx`

### Steps

- [ ] **Step 1: Write Inputs page**

Replace placeholder. Each input gets a heading, description, and live interactive demo. Use `useState` to manage demo state.

- **Toggle**: Two toggles — one on, one off. User can click to toggle. Show with and without label.
- **NumberInput**: A number input with min=0, max=100, step=1, suffix="qty". Show with label.
- **Select**: A select with 4 options (e.g., asset classes: Equities, Fixed Income, FX, Crypto). Show with label.
- **DatePicker**: A date picker with today as default. Show with label.
- **Autocomplete**: An autocomplete with ~10 items (e.g., instrument names: AAPL, MSFT, GOOGL, NVDA, AMD, etc.). Show with label and placeholder.

Each demo uses `ComponentDemo` wrapper. All imports from `@/components`.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/components/InputsPage.tsx && git commit -m "feat: add Inputs component page"
```

---

## Task 12: Component pages — Feedback

**Files:**
- Modify: `src/site/pages/components/FeedbackPage.tsx`

### Steps

- [ ] **Step 1: Write Feedback page**

Replace placeholder. Each component gets a heading, description, and live demo.

- **Toast**: Three buttons ("Info Toast", "Warning Toast", "Error Toast") that call `showToast()` with the corresponding variant. The `ToastContainer` will be added to the site shell in Task 14. Describe: 3-max stack, 5s auto-dismiss, variant left-border colors.
- **Modal**: A button ("Open Modal") that opens a `Modal` with a title and some content. Use `useState` for open state.
- **NotificationFeed**: Render a `NotificationFeed` with 4 static sample notifications (with timestamps, messages, one with an action label). Include a dismiss handler that removes from state.

Each demo uses `ComponentDemo` wrapper.

- [ ] **Step 2: Verify and commit**

```bash
npx tsc --noEmit && npx vite build
```

```bash
git add src/site/pages/components/FeedbackPage.tsx && git commit -m "feat: add Feedback component page"
```

---

## Task 13: Demo page (Trading App)

**Files:**
- Modify: `src/site/pages/demo/TradingApp.tsx`

### Steps

- [ ] **Step 1: Write TradingApp page**

Replace placeholder. This embeds the existing demo app full-bleed:

```tsx
import { DataProvider } from '@/providers/DataProvider';
import { App as DemoApp } from '@/demo/App';

export default function TradingApp() {
  return (
    <div style={{ height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      <DataProvider>
        <DemoApp />
      </DataProvider>
    </div>
  );
}
```

The `DemoApp` uses `height: 100vh` internally — the wrapper constrains it within `calc(100vh - 48px)` to account for the TopBar.

- [ ] **Step 2: Verify the demo works**

```bash
npx tsc --noEmit && npx vite build
```

Run `npm run dev`, navigate to `/demo`, and verify:
- The trading app renders full-width (no 780px max-width)
- Watchlist, Chart, and Pricer panels all work
- Market data ticks are flowing
- Workspace preset selector works
- Theme toggle in both the site TopBar and the demo NavBar work together

- [ ] **Step 3: Commit**

```bash
git add src/site/pages/demo/TradingApp.tsx && git commit -m "feat: add Trading App demo page"
```

---

## Task 14: Add ToastContainer to site shell

**Files:**
- Modify: `src/site/App.tsx`

### Steps

- [ ] **Step 1: Add ToastContainer import and render**

The Feedback component page uses `showToast()` which requires a `ToastContainer` mounted in the tree. Add it to the site shell `App.tsx`:

Add import:
```tsx
import { ToastContainer } from '@/components/feedback/Toast';
```

Add `<ToastContainer />` as the last child inside the outermost `div`, after the flex container.

- [ ] **Step 2: Verify toast works**

Run `npm run dev`, navigate to `/components/feedback`, and verify that clicking the toast buttons produces visible toasts in the top-right corner.

- [ ] **Step 3: Commit**

```bash
git add src/site/App.tsx && git commit -m "feat: add ToastContainer to site shell for feedback demos"
```

---

## Task 15: Final verification and build

**Files:** None new — verification only.

### Steps

- [ ] **Step 1: Type check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 2: Build**

```bash
npx vite build
```

Expected: successful build with no errors.

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: all existing tests pass (the site adds no new testable logic — it's content pages).

- [ ] **Step 4: Manual smoke test**

Run `npm run dev` and verify:
1. Every sidebar link navigates to a page with content (no "TODO" placeholders)
2. Theme toggle switches all pages correctly
3. Scroll-to-top works when navigating between pages
4. Demo page renders the full trading app
5. Back/forward browser navigation works
6. Direct URL navigation works (e.g., type `/research/color-system` in address bar)
7. Invalid URLs redirect to Introduction

- [ ] **Step 5: Final commit**

```bash
git add -A && git commit -m "feat: complete showcase website — all 21 pages implemented"
```
