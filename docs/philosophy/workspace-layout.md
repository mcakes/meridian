# Workspace Layout

A trading workspace is not a page. It is a spatial environment that a professional inhabits for eight or more hours a day. The layout decisions made here — how panels are organized, whether state persists, how complexity is disclosed — have cognitive consequences that compound over hundreds of hours of use.

---

## Industry Context

Two approaches have shaped how the industry thinks about multi-panel trading layouts.

**Bloomberg Launchpad** ([Bloomberg, 2014](https://library.iima.ac.in/public/download/bloomberg/launchpad.pdf)) organizes panels using the concept of *pages* — complete, named layout snapshots that traders switch between as a unit. A trader might maintain a "morning macro" page and an "equity flow" page, switching between complete contexts rather than rearranging individual panels. The page abstraction is the key insight: it externalizes layout memory into named presets.

**OpenFin Workspace** ([OpenFin, 2022](https://www.openfin.co/blog/openfins-platform-api-introducing-multiple-layouts/)) provides a platform-level layout engine with splits, tabs, and serializable snapshots. Goldman Sachs Marquee and BNP Paribas Cortex both run on this infrastructure. OpenFin demonstrates that layout state (panel positions, sizes, active tabs, scroll offsets) can be fully serialized and restored — this is now an expected capability, not a premium feature.

These examples inform Meridian's direction: named workspaces with full serialization, following established patterns rather than reinventing them.

---

## The Cognitive Cost of Layout Reconstruction

[Patel (2025)](https://medium.com/@p_viraj/psychology-driven-layouts-designing-for-how-traders-think-b11e2e7cac5c), building on [Sweller's Cognitive Load Theory (1988)](https://www.tandfonline.com/doi/abs/10.1207/s15516709cog1202_4), identifies layout reconstruction as a meaningful source of *extraneous cognitive load* — mental effort spent on the environment rather than on the task itself.

Sweller distinguishes three types of cognitive load:

- **Intrinsic load:** complexity inherent in the task (understanding a complex derivatives position)
- **Germane load:** effort invested in building mental models (learning a new instrument)
- **Extraneous load:** effort consumed by the environment (rearranging panels, re-applying filters)

Only extraneous load can be reduced through interface design without affecting the underlying task. A trader who spends two minutes each morning reconstructing their workspace has incurred cognitive cost before any analytical work has begun. The [Zeigarnik effect](https://netpsychology.org/the-neuroscience-of-notifications-why-you-cant-ignore-them/) adds a further cost: incomplete tasks — including the implicit task of "get my workspace back to the right state" — consume working memory until resolved.

---

## Three Principles

### 1. Default to Persist

Traders expect their workspace to restore exactly. Panel positions, sizes, active tabs, scroll positions, column visibility, applied filters — all of it. This is not a power-user feature; it is the baseline expectation of anyone who has used a professional terminal for more than a week.

Persistence is the primary function of the named workspace system. A workspace is a JSON snapshot of the complete layout tree, stored and restored atomically.

### 2. Progressive Disclosure

Complexity should appear when needed and not before. A trader focused on a single equity should not see derivatives-specific panels competing for attention. The workspace system supports multiple named presets — "equities flow," "macro rates," "end-of-day review" — that each expose only the complexity relevant to that mode of work.

Within a single workspace, panels themselves use the three-tier information hierarchy (glanceable → scannable → explorable) to avoid forcing a choice between showing too little and overwhelming.

### 3. Reduce Layout Cognitive Load

The layout itself should impose as little cognitive load as possible:

- Panel borders are 1px `border.subtle` — present but not demanding attention
- Panel chrome (header + toolbar) is capped at 64px — the data area dominates
- No gratuitous animation in layout transitions — panel resize and rearrangement should be immediate
- Consistent panel positions within a workspace build spatial muscle memory over time

---

## Architecture: Hybrid Tiling and Tabs

Meridian uses a hybrid model: tiling for spatial organization, tabs for depth within a panel.

**Tiling** (via [flexlayout-react](https://github.com/caplin/FlexLayout)) organizes panels in a tree of rows, tabsets, and tabs. Any panel can be split horizontally or vertically, and panels can be dragged between tabsets. The tree is fully serializable to a JSON model (`IJsonModel`). This handles the primary use case: "I need to see positions, a chart, and the order book simultaneously."

**Tabs within panels** handle the secondary case: "I need 8 views but only have room for 5 panels." FlexLayout React natively supports tabsets — multiple logical views occupy the same spatial position while preserving the physical workspace layout. Panels can be dynamically added or closed at runtime.

**Named workspace presets** are saved/switched atomically. The snapshot includes:
- The full panel tree (splits, sizes, positions)
- Active tab within each tabbed panel
- Per-panel state (scroll position, applied filters, column visibility)
- 2–3 default presets ship with the system

**Multi-monitor support is deferred.** It represents a 3x complexity multiplier (window management, cross-monitor drag, serialization of multi-window state) that does not change the fundamental single-window design. The single-window architecture should be proven first.

---

## Panel Anatomy

| Region | Height | Content |
|--------|--------|---------|
| Header | 24–32px | Title, tab strip, close/maximize/minimize |
| Toolbar (optional) | 28–36px | Actions, filters, search |
| Data area | Fills remainder | Table, chart, or form |

Total chrome: ≤ 64px. This limit ensures that on a 1080px monitor, a five-panel layout has meaningful data area in every panel.

---

## Implementation

Layout state is managed via FlexLayout React's serializable `IJsonModel` structure. Workspace snapshots are stored in `localStorage` in the initial implementation, with the expectation that server-side persistence replaces this for production deployments where workspaces should follow the user across machines.

Panel split, resize, and drag operations use FlexLayout React's built-in drag handles. The handle hit area is 8px wide — large enough to target without being visually obtrusive at 1px visual thickness.

---

## References

- [Bloomberg Launchpad overview.](https://library.iima.ac.in/public/download/bloomberg/launchpad.pdf)
- [OpenFin Platform API: Multiple Layouts.](https://www.openfin.co/blog/openfins-platform-api-introducing-multiple-layouts/)
- [Patel, V. (2025). "Psychology-Driven Layouts: Designing for How Traders Think."](https://medium.com/@p_viraj/psychology-driven-layouts-designing-for-how-traders-think-b11e2e7cac5c)
- [Sweller, J. (1988). "Cognitive Load During Problem Solving." *Cognitive Science*, 12(2).](https://www.tandfonline.com/doi/abs/10.1207/s15516709cog1202_4)
- [Zeigarnik effect and notifications.](https://netpsychology.org/the-neuroscience-of-notifications-why-you-cant-ignore-them/)
- [flexlayout-react.](https://github.com/caplin/FlexLayout)
