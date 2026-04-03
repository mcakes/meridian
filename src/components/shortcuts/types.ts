// src/components/shortcuts/types.ts

export interface Shortcut {
  id: string;
  /** Key combo string, e.g. "mod+d", "mod+shift+t", "escape", "?" */
  key: string;
  label: string;
  category?: string;
  description?: string;
  execute: () => void;
  /** When false, the listener skips this shortcut. Default true. */
  enabled?: boolean;
}

export interface ShortcutContextValue {
  shortcuts: Shortcut[];
  register: (shortcuts: Shortcut[]) => () => void;
  open: () => void;
  close: () => void;
  isOpen: boolean;
}
