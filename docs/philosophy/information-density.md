# Information Density

Density is often treated as a binary quality — an interface is either dense or spacious. Meridian's approach is more precise: density has three axes, each with a different optimization target. Getting density wrong in a professional trading context means either obscuring critical information behind unnecessary whitespace or overwhelming users with unstructured data that cannot be processed quickly.

---

## Three Axes of Density

[Ström-Awn (2024)](https://mattstromawn.com/writing/ui-density/) identifies three independent dimensions:

**Visual density** is information per unit of screen area. A compact table with 32px rows has higher visual density than the same table with 56px rows. Higher visual density is generally better in professional contexts — more data on screen means less navigation, less working memory load, and faster cross-referencing.

**Temporal density** is information per unit of time, achieved through fast navigation and disclosure mechanisms. A panel that reveals secondary data on hover without a page transition has higher temporal density than one that requires a click-through. Progressive disclosure, keyboard shortcuts, and panel linking all increase temporal density.

**Value density** is useful decision-making input per interaction. This is the axis that matters most, and it does not always point toward more information. A cluttered screen with 40 data points, 15 of which are irrelevant to the current decision, has lower value density than a clean screen with 12 precisely chosen ones.

The goal is maximum value density. This sometimes means adding whitespace to reduce competition between data points, not eliminating it.

---

## Working Memory Capacity: Why the Limit Is 4, Not 7

The "7 ± 2" rule from Miller (1956) is widely cited in interface design but does not accurately describe working memory capacity under realistic conditions. [Cowan (2001)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292122/) revised the estimate to approximately 4 chunks — meaningful units held in active attention simultaneously.

This constraint has direct implications for Meridian:

- The categorical color ramp is capped at 6 core colors. [Tseng et al. (2024)](https://arxiv.org/html/2404.03787v2) found discrimination drops sharply beyond 6, and Cowan's limit explains why: tracking more than ~4–6 color-meaning mappings simultaneously is at or beyond working memory capacity.
- The toast stack shows a maximum of 3 visible notifications. A fourth collapses to "+N more."
- Panel chrome (header + toolbar) is limited to 64px combined. Every pixel above that is taken from the data area, reducing how many rows fit in the glanceable tier.

---

## Three-Tier Information Hierarchy

Every panel in a Meridian application organizes its content into three tiers, from most to least accessible:

### Tier 1 — Glanceable

Pre-attentive. Detected in under 200ms without conscious focus. These are the values a trader should be able to read from arm's length or with a peripheral glance:

- Prices and their direction (color + arrow + sign)
- P&L in absolute and percentage terms
- Position sizes

Design requirements: large enough text (13px minimum), high-contrast semantic colors, directional indicators. No abbreviations that require decoding.

### Tier 2 — Scannable

Requires focused but not deep attention. A user actively reading this tier is scanning, not processing prose:

- Bid/ask spreads
- Volume
- Greeks (for derivatives)
- Secondary metrics

Design requirements: secondary text color (`text.secondary`), tabular alignment for numeric columns, consistent column positions across similar panels so spatial muscle memory applies.

### Tier 3 — Explorable

On demand. Not visible by default. Accessible via hover, click, or tab switch — instantly:

- Instrument details and fundamentals
- Historical data
- News and annotations

Design requirements: hover reveals must be instant, not delayed (professionals do not wait for animations). Keyboard depth must be available (Tab, keyboard shortcuts) for users who prefer not to use a mouse.

[Hudson River Trading (2024)](https://www.hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading) specifically notes that professional users expect progressive disclosure to be instant — animation delays that feel polished in consumer contexts feel obstructive in trading.

---

## The 64px Chrome Budget

Panel header plus toolbar must not exceed 64px combined.

| Region | Height range |
|--------|-------------|
| Header (title, tabs, controls) | 24–32px |
| Toolbar (actions, filters, search) | 28–36px |
| Data area | Fills remainder |

On a 1080px-tall monitor, a standard desktop taskbar and window chrome consume roughly 80px. If each of five visible panels uses 80px of internal chrome, approximately 400px — 37% of available height — is used for navigation rather than data. At 64px per panel, the same five panels consume 320px, freeing an additional 80px of data area.

This is not an arbitrary constraint. It reflects the real trade-off between navigational affordance and data visibility in multi-panel layouts.

---

## Spatial Muscle Memory

Professional users build spatial muscle memory across weeks of using an application — they know that the order book is always in the top-right panel, that the P&L column is always the third column in the positions table. This is a feature, not a coincidence, and Meridian is designed to support it.

The implications:

- Column order in tables must persist across sessions (workspace snapshots)
- Panel positions must restore exactly on launch
- The same data in the same panel type should always be in the same position within that panel — avoid context-dependent column reordering

Designing for spatial muscle memory means optimizing for the experienced user's workflow, not the first-session onboarding experience. The two sometimes conflict; Meridian favors the experienced user.

---

## Aversion to Dense Interfaces Is Aversion to Poor Design

The research finding that underlies the entire density philosophy: users who say they prefer "less cluttered" interfaces are not expressing a preference for less information. They are expressing a preference for interfaces where information does not compete, where hierarchy is clear, and where the visual system can parse structure quickly.

[Garrett (2002)](https://blog.logrocket.com/balancing-information-density-in-web-development/) argues that the aversion to dense interfaces is, in practice, aversion to poorly designed dense ones. A high-density interface with clear hierarchy, consistent alignment, and good color discipline is not experienced as cluttered.

This is why Meridian invests heavily in the tier system, in consistent alignment, and in color methodology: the goal is an interface that feels manageable at high density, not an interface that achieves manageability through low density.

---

## References

- [Ström-Awn, M. (2024). "UI Density."](https://mattstromawn.com/writing/ui-density/)
- [Cowan, N. Working memory capacity ~4 items.](https://pmc.ncbi.nlm.nih.gov/articles/PMC12292122/)
- [Tseng, C. et al. (2024). "Revisiting Categorical Color Perception in Scatterplots."](https://arxiv.org/html/2404.03787v2)
- [Hudson River Trading (2024). "Optimizing UX/UI Design for Trading."](https://www.hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading)
- [Garrett, J. J. *The Elements of User Experience.* Referenced via LogRocket.](https://blog.logrocket.com/balancing-information-density-in-web-development/)
- [Ware, C. (2004). *Information Visualization: Perception for Design.* Elsevier.](https://www.elsevier.com/books/information-visualization/ware/978-0-12-381464-7)
