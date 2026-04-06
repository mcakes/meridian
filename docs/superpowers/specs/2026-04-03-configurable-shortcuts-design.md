# Configurable Shortcuts — Design Spec

## Overview

Enhancement to the existing keyboard shortcuts system. Shortcuts become rebindable via the ShortcutOverlay using a click-to-record interaction. Overrides are maintained in the provider and exposed to the consuming app for persistence. Conflict detection blocks duplicate bindings with inline feedback.

## Provider Changes

### New Props on ShortcutProvider

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `initialOverrides` | `Map<string, string>` | — | Hydrate overrides from storage. Maps shortcut ID → overridden key combo. |
| `onBindingChange` | `(overrides: Map<string, string>) => void` | — | Called whenever an override is added, changed, or reset. For persistence. |

### New Context Values (via useShortcuts)

| Field | Type | Description |
|-------|------|-------------|
| `overrides` | `Map<string, string>` | Current override map (read-only). |
| `rebind` | `(shortcutId: string, newKey: string) => { ok: true } \| { ok: false; conflictsWith: string }` | Attempt to rebind a shortcut. Returns conflict info if the key combo is already in use. |
| `resetBinding` | `(shortcutId: string) => void` | Revert a single shortcut to its original key. |
| `resetAllBindings` | `() => void` | Clear all overrides. |

### Effective Key Resolution

The keydown listener resolves keys as: `overrides.get(shortcut.id) ?? shortcut.key`. The original `key` on the `Shortcut` object is never mutated — it serves as the immutable default.

### Conflict Detection on Rebind

`rebind()` checks the new key combo against all other shortcuts' **effective** keys (including their overrides). If a conflict is found, it returns `{ ok: false, conflictsWith: shortcutId }` and does not apply the override. The overlay uses the `conflictsWith` ID to look up the conflicting shortcut's label for the error message.

### onBindingChange Callback

Called after every successful `rebind()`, `resetBinding()`, or `resetAllBindings()` with the full current overrides map. The consuming app can serialize and persist this.

## Overlay Rebinding UX

### Recording Flow

1. User clicks a key badge → badge enters **recording mode** (pulsing `--color-info` border, "Press keys..." placeholder text)
2. Overlay captures `keydown` events. Modifier-only keypresses (Cmd, Shift, Alt, Ctrl alone) are ignored — recording waits until a non-modifier key is pressed alongside any held modifiers. The combo string is constructed from the held modifiers + the key.
3. Calls `rebind(shortcutId, newCombo)`:
   - If `{ ok: true }` → badge updates to show the new combo, exits recording mode
   - If `{ ok: false, conflictsWith }` → inline error shown below the row: "Already used by [conflicting label]" in `--color-negative`. Recording stays active for another attempt.
4. **Escape** cancels recording, reverts to current binding
5. Clicking outside the recording badge also cancels

### Visual States

**Default row:** Label on the left, `KeyBadge` on the right. Badge has `cursor: pointer` and subtle `--bg-highlight` on hover to signal clickability.

**Recording:** Badge area replaced with a box: `--color-info` 1px border (pulsing via opacity animation), "Press keys..." in `--text-muted`, 11px. All other shortcut rows are dimmed.

**Conflict error:** Below the recording row, a small line of text: "Already used by [label]" in `--color-negative`, 11px. Clears when the user presses a new combo or cancels.

**Overridden shortcut:** Normal badge display, but with a small "×" reset icon to the right of the badge. Clicking it calls `resetBinding(id)`. The icon uses `--text-muted`, turns `--text-primary` on hover.

### Reset All

A text button at the bottom of the overlay: "Reset all to defaults". Only visible when `overrides.size > 0`. Styled as `--text-muted`, 11px, with `--text-primary` on hover. Calls `resetAllBindings()`.

## Updated Types

```ts
export interface ShortcutContextValue {
  shortcuts: Shortcut[];
  register: (shortcuts: Shortcut[]) => () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
  overrides: Map<string, string>;
  rebind: (shortcutId: string, newKey: string) => { ok: true } | { ok: false; conflictsWith: string };
  resetBinding: (shortcutId: string) => void;
  resetAllBindings: () => void;
}
```

## File Changes

**Modified:**
- `src/components/shortcuts/types.ts` — add `overrides`, `rebind`, `resetBinding`, `resetAllBindings` to `ShortcutContextValue`
- `src/components/shortcuts/ShortcutProvider.tsx` — add overrides state, `initialOverrides`/`onBindingChange` props, `rebind`/`resetBinding`/`resetAllBindings` methods, update listener to use effective key
- `src/components/shortcuts/ShortcutOverlay.tsx` — add recording mode state machine, click-to-rebind per row, conflict display, per-shortcut reset icon, reset-all button
- `src/components/shortcuts/KeyBadge.tsx` — add `onClick` prop and `recording` visual state

**New:**
- `src/components/shortcuts/__tests__/overrides.test.ts` — tests for rebind (success + conflict), resetBinding, resetAllBindings, effective key resolution
