# Meridian Showcase Website — Design Spec

## Goal

Build a full project showcase website that serves both designers/stakeholders (research rationale, visual comparisons, philosophy) and developers (token reference, component demos). The site replaces the current demo app entry point, embedding the demo as one page within a larger documentation site.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | React Router + JSX pages | Clean URLs, lazy loading, one new dep, no MDX build complexity |
| Content format | JSX with reusable prose components | Full React power for live demos; Section/Figure/Citation helpers keep prose readable |
| Entry point | Replaces current `index.html` → `src/site/main.tsx` | Single app; demo becomes a page within the site |
| Navigation | Sidebar with grouped sections | Radix-docs style; familiar for both audiences |
| Research depth | Full inline | All citations, methodology, comparison tables presented on dedicated pages |
| Component demos | Live rendered examples, no code snippets | Clean and visual; developers read the source directly |
| Content framing | Positive framing only | No Bloomberg editorial comparisons in user-facing content |

## Layout

### Top Bar (48px)
- Brand: "MERIDIAN" + "Design System" subtitle
- Right: theme toggle button, GitHub link
- Background: `--bg-surface`, border-bottom: `--border-subtle`

### Sidebar (220px)
- Background: `--bg-base`
- Border-right: `--border-subtle`
- Grouped navigation with uppercase section labels (`--text-muted`, 10px, 600 weight, 1px letter-spacing)
- Active item: `--color-info` text, `--bg-muted` background, `--radius-sm`
- Hover: `--bg-muted` background

### Content Area
- Flex fill, scrollable
- Padding: 32px 48px
- Max-width: 780px (centered) for all pages except Demo
- Demo page: full-bleed, no max-width constraint

## Sidebar Groups & Pages (21 total)

### Overview (2 pages)
1. **Introduction** — What Meridian is, core principles (density, redundant encoding, cognitive load, evidence-based color), technology stack
2. **Getting Started** — Installation, project structure, how tokens/components/themes work together

### Research (7 pages)
Each page presents the full research content from `meridian-research.md` with inline figures, comparison tables, and citations.

3. **Information Density** — Three axes of density, working memory research (Cowan 2001), three-tier hierarchy (glanceable/scannable/explorable), chrome budget (64px)
4. **Color System** — Two separate systems (semantic vs categorical), perceptual science (pre-attentive processing), dark mode research, categorical ramp methodology (CIELAB, CVD simulation, 6+2 structure, max-distance-first ordering with comparison table), light theme derivation
5. **Typography** — Two optimization targets, Inter + JetBrains Mono selection rationale, numeric formatting by asset class
6. **Shape & Radius** — Shape perception research (Bar & Neta 2006), radius-correlates-with-detachment principle, professional signal (2px convergence)
7. **Workspace Layout** — Industry analysis (Bloomberg Launchpad, OpenFin), psychology-driven layout (Sweller, Zeigarnik), hybrid tiling + tabs recommendation
8. **Notifications** — Cognitive workload research (NASA-TLX study), Zeigarnik effect, four-tier taxonomy (critical/urgent/informational/passive), batching
9. **Accessibility** — WCAG 2.2 AA baseline, redundant encoding as default, CVD safety methodology, prefers-reduced-motion, Radix UI primitives

### Tokens (4 pages)
Each page shows visual swatches/grids with token name, CSS variable, hex values for both themes.

10. **Colors** — Categorical ramp swatches (8), semantic color swatches with redundant encoding notes, background scale (5-step gradient), text colors, border colors. Both dark and light values shown.
11. **Typography** — Font stack, complete type scale table (9 entries with font/size/weight/line-height/notes), numeric formatting rules
12. **Spacing** — 4px base grid, all 12 spacing tokens with visual size representation
13. **Borders & Radius** — Border width, 4 radius tokens with usage rules, focus ring spec

### Components (7 pages)
Each page groups related components. Each component gets a heading, short description, and live rendered demo showing key states/variants.

14. **Data Table** — AG Grid wrapper with density modes (compact/default/comfortable shown side by side), cell renderer types (NumericCell, ChangeCell, BadgeCell, SparklineCell, ActionCell), row grouping with categorical borders, flash-on-update
15. **Chart** — Plotly wrapper with Meridian template applied, candlestick example with semantic colors, responsive resize
16. **Workspace** — react-mosaic tiling demo, preset switching, panel resize handles
17. **Panel** — Panel + PanelHeader + Toolbar composition, chrome budget demonstration (28px + 32px = 60px)
18. **Primitives** — PriceChange (all three states), CatDot (index 0–7), FlashCell (animated value change), MetricCard (with sublabel), Tag (pass/warn/fail variants), Sparkline
19. **Inputs** — Toggle, NumberInput (with stepper), Select (Radix), DatePicker (calendar), Autocomplete (fuzzy matching)
20. **Feedback** — Toast (trigger demo toasts, observe 3-max stack), Modal (open/close), NotificationFeed (scrollable list)

### Demo (1 page)
21. **Trading App** — Full-bleed embed of the existing `demo/App` component with workspace presets and all linked panels. No max-width constraint. Includes the NavBar with preset selector and theme toggle.

## File Structure

```
src/
  site/                        # New — showcase site
    main.tsx                   # Entry point: ThemeProvider + DataProvider + RouterProvider
    App.tsx                    # Shell: TopBar + Sidebar + <Outlet>
    router.tsx                 # Route definitions with React.lazy() imports
    components/                # Site-specific UI (not part of Meridian component library)
      Sidebar.tsx              # Navigation sidebar with grouped links
      TopBar.tsx               # Brand + theme toggle + GitHub link
      PageShell.tsx            # Prose wrapper: max-width 780px + padding
      Section.tsx              # Titled content block with anchor
      Figure.tsx               # Captioned illustration/demo wrapper (bg-surface card)
      TokenSwatch.tsx          # Color swatch: dot + name + hex + CSS variable
      TokenTable.tsx           # Table of token values with columns for name/dark/light/usage
      Citation.tsx             # Inline reference footnote (left-border style)
      ComponentDemo.tsx        # Live example wrapper: bg-surface card with label
    pages/
      overview/
        Introduction.tsx
        GettingStarted.tsx
      research/
        InformationDensity.tsx
        ColorSystem.tsx
        Typography.tsx
        ShapeAndRadius.tsx
        WorkspaceLayout.tsx
        Notifications.tsx
        Accessibility.tsx
      tokens/
        Colors.tsx
        TypographyTokens.tsx
        Spacing.tsx
        Borders.tsx
      components/
        DataTablePage.tsx
        ChartPage.tsx
        WorkspacePage.tsx
        PanelPage.tsx
        PrimitivesPage.tsx
        InputsPage.tsx
        FeedbackPage.tsx
      demo/
        TradingApp.tsx         # Imports and renders existing demo/App full-bleed
  demo/                        # Existing — unchanged
  components/                  # Existing — unchanged (used by both site and demo)
  tokens/                      # Existing — unchanged
```

## Routing

Path-based routing via `react-router-dom` with `createBrowserRouter`.

| Path | Page | Lazy |
|------|------|------|
| `/` | Introduction | yes |
| `/getting-started` | GettingStarted | yes |
| `/research/information-density` | InformationDensity | yes |
| `/research/color-system` | ColorSystem | yes |
| `/research/typography` | Typography | yes |
| `/research/shape-and-radius` | ShapeAndRadius | yes |
| `/research/workspace-layout` | WorkspaceLayout | yes |
| `/research/notifications` | Notifications | yes |
| `/research/accessibility` | Accessibility | yes |
| `/tokens/colors` | Colors | yes |
| `/tokens/typography` | TypographyTokens | yes |
| `/tokens/spacing` | Spacing | yes |
| `/tokens/borders` | Borders | yes |
| `/components/data-table` | DataTablePage | yes |
| `/components/chart` | ChartPage | yes |
| `/components/workspace` | WorkspacePage | yes |
| `/components/panel` | PanelPage | yes |
| `/components/primitives` | PrimitivesPage | yes |
| `/components/inputs` | InputsPage | yes |
| `/components/feedback` | FeedbackPage | yes |
| `/demo` | TradingApp | yes |

## Site Helper Components

These are site-specific (not exported as Meridian components). They use Meridian tokens for styling.

### PageShell
Wraps page content in a scrollable container with max-width 780px and 32px/48px padding. Demo page bypasses this (renders full-bleed).

### Section
A titled content block: `<h2>` heading with optional anchor ID, followed by children. Uses `--text-primary` for heading, horizontal rule (`--border-subtle`) above.

### Figure
A captioned illustration wrapper. Background `--bg-surface`, border `--border-subtle`, radius `--radius-md`. Caption in uppercase 10px `--text-muted` above the content.

### TokenSwatch
Renders a color dot (28x28px), color name, hex value (monospace), and CSS variable name. Used in grid layouts on token pages.

### TokenTable
An HTML table styled with Meridian tokens. Columns configurable. Alternating row backgrounds using `--bg-muted`.

### Citation
Left-border (2px `--border-default`) block with reference number in `--text-secondary` bold and citation text in `--text-muted`. Used inline within research prose.

### ComponentDemo
A card (bg-surface, border-subtle, radius-md) containing a live rendered Meridian component. Label in 10px uppercase above.

## Entry Point Change

`index.html` script src changes from:
```html
<script type="module" src="/src/demo/main.tsx"></script>
```
to:
```html
<script type="module" src="/src/site/main.tsx"></script>
```

## Routing Details

### 404 Handling
A catch-all route (`*`) redirects to `/` (the Introduction page).

### Scroll Behavior
On route change, the content area scrolls to top. Implemented via a `useEffect` on `location.pathname` inside the layout route.

### Lazy Loading Fallback
All lazy routes are wrapped in a `<Suspense>` with a minimal loading indicator (centered spinner or "Loading..." text in `--text-muted`).

### SPA Fallback
Production deployment requires SPA fallback (all paths serve `index.html`). Vite dev server handles this automatically. For production, a `_redirects` or equivalent must be configured per hosting platform.

### Responsive Scope
Desktop-only. No responsive breakpoints for sidebar collapse. The sidebar is always visible at 220px. This matches the professional trading context where users are on large monitors.

## Dependencies

One new dependency:
- `react-router-dom` (MIT)

## Styling Approach

All site-specific components use inline styles with Meridian CSS custom properties (e.g., `var(--bg-surface)`). No new CSS files for site components — keeps styling co-located and avoids class name conflicts. The existing `tokens/index.css` import provides all variables.

## Provider & Router Hierarchy

```
ThemeProvider                    # Outermost — sets data-theme on <html>
  RouterProvider(router)         # Controls which page renders
    Layout route (App.tsx)       # TopBar + Sidebar + <Outlet>
      Lazy page routes           # Each page component
        DataProvider             # Only wraps the TradingApp page (demo)
```

`ThemeProvider` wraps everything so `data-theme` is set before any component renders. `DataProvider` is scoped to the demo page only — it starts market data subscriptions/timers, so it should not run when the user is reading research pages. `TradingApp.tsx` wraps its content in `<DataProvider>` internally.

## Demo Integration

`TradingApp.tsx` imports the existing `demo/App` component and wraps it in `DataProvider`. It renders full-bleed (no PageShell wrapper). The wrapper sets `height: calc(100vh - 48px)` and `overflow: hidden` to account for the 48px TopBar, since the existing `demo/App` uses `height: 100vh` internally — the wrapper constrains it. The existing demo code requires no modifications.

## Token Page: Spacing

The spacing page displays all tokens from `spacing.css` (the `--space-*` variables). There are 11 tokens (`--space-px` through `--space-8`; `--space-0` is included as explicit zero). The `@theme` block in `index.css` aliases these as `--spacing-*` for Tailwind consumption — the token page should show both the raw `--space-*` variable and its Tailwind mapping.

## Theme Support

The site inherits theme switching from the existing `ThemeProvider`. The TopBar includes a theme toggle. All site components reference CSS variables, so they switch automatically.

## Content Authoring

Research pages are manually authored as JSX, transcribing content from `meridian-research.md` and the `docs/philosophy/` files. The `Section`, `Figure`, `Citation`, and `TokenTable` helper components keep the JSX readable despite being prose-heavy. This is a one-time content task — once written, research pages change infrequently.
