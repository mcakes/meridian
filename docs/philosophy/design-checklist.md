# Design Checklist

A set of rules for deciding what to build, where to put it, and when to stop. These rules complement the information hierarchy (glanceable / scannable / explorable) described in the overview — that model governs *how much attention* a piece of information demands, while this checklist governs *whether it should exist at all* and *where it belongs*.

The lessons here draw on [Hudson River Trading's Task Watcher redesign](https://www.hudsonrivertrading.com/hrtbeat/optimizing-ux-ui-design-for-trading/), where user interviews revealed that 80+ fields across 5 sub-tabs were mostly unknown to users and only 20% of features were actually being used. The root cause: the UI had been organized around accumulated feature requests rather than user goals.

---

## Task-Based Organization

Every panel in a trading interface exists to support one of three goals:

| Goal | The user wants to… | Examples |
|------|---------------------|----------|
| **Monitor** | Watch for change without active effort | Watchlist, P&L summary, system health |
| **Investigate** | Understand why something happened | Order history, error logs, execution analysis |
| **Act** | Execute a decision | Order entry, position adjustment, alert configuration |

**Organize panels around goals, not data domains.** A panel titled "AAPL" that mixes a price chart, order entry, and execution history is organized around an entity. A panel titled "Order Entry" that focuses entirely on building and submitting orders is organized around a goal. The second is easier to use because it matches how the user thinks about their task.

A panel should serve **one primary goal**. When a panel accumulates features from multiple goal categories, that is the early stage of the 80-fields problem. The fix is not to add tabs — it is to split the panel or move the secondary features to a panel that already owns that goal.

**Declare the goal.** Every panel component should declare its purpose in a JSDoc comment:

```tsx
/** @goals monitor */
export function WatchlistPanel() { ... }
```

Valid values: `monitor`, `investigate`, `act`. This is documentation, not runtime enforcement. Its purpose is to force the author to articulate why the panel exists. A panel that needs two goals listed is a signal to reconsider its scope.

---

## Anti-Patterns

### Feature Accumulation

Adding a field because someone asked for it, without asking whether it serves one of the panel's stated goals. Over time this produces interfaces where most fields are unknown to most users. The test: pick any field in the panel and ask a current user what it does. If they cannot answer, the field is a candidate for removal or demotion to Tier 3 (explorable, on-demand).

### Tab Proliferation

Splitting a panel into tabs to accommodate unrelated features rather than rethinking the panel's purpose. Tabs are appropriate when they represent different *views of the same goal* (e.g., a chart panel with tabs for different time horizons). They are not appropriate when they represent different goals stuffed into one panel to avoid creating a new one.

### Orphaned Fields

Fields that no current user can explain the purpose of. These accumulate when features are added for a specific request and never revisited. Orphaned fields have a cost even when ignored — they consume space, add visual noise, and make the interface feel overwhelming to new users.

### Density Without Hierarchy

Showing everything at the same visual weight. High density is a feature of professional interfaces, but only when paired with clear hierarchy. A panel with 40 fields at identical font size, weight, and color is not dense — it is noisy. Apply the 3-tier hierarchy: Tier 1 fields get primary text weight and semantic color, Tier 2 fields get secondary text color, Tier 3 fields are hidden until requested.

---

## Pre-Flight Checklist

Answer these five questions before adding a new panel or field. If any answer raises a concern, reconsider the addition.

### 1. What user goal does this serve?

Must be one of: **monitor**, **investigate**, **act**. If the answer is "it might be useful" or "someone asked for it," the feature does not yet have a validated goal. Park it until one emerges.

### 2. Which information tier?

Must be one of: **Tier 1 (glanceable)**, **Tier 2 (scannable)**, **Tier 3 (explorable)**.

New features default to **Tier 3** and promote upward only when validated by usage. This is the pit-of-success inversion: showing less is the default, showing more requires justification. A field that starts at Tier 1 and turns out to be unimportant is much harder to demote than a Tier 3 field that gets promoted.

### 3. Does this duplicate information available elsewhere?

If the same data is already visible in another panel, adding it here must be justified by the user's workflow — not by convenience. Cross-panel linking (shared selected symbol, synchronized time range) is the preferred mechanism for letting panels reference each other's data without duplicating it.

### 4. Can the user accomplish the same goal without this?

If the goal can already be achieved through existing fields or interactions, the new addition is redundant. Redundancy in *encoding* (color + icon + text) is good. Redundancy in *features* (two different ways to do the same thing) adds complexity without value.

### 5. If removed in six months, would anyone notice?

This is the strongest filter. If the honest answer is "probably not," the feature should not be added at its proposed tier. It may still be worth adding at Tier 3 (hidden by default, accessible on demand), but it should not occupy permanent screen space.

---

## Applying This Checklist

This checklist applies equally to human developers and AI agents building with Meridian. When generating or modifying panel layouts:

- State the panel's goal before writing any component code
- Default new fields to Tier 3 unless there is an explicit reason for higher visibility
- Prefer removing or demoting fields over adding toggles to hide them
- When a panel grows beyond its original goal, split rather than tab
