const MODIFIERS = ['mod', 'shift', 'alt', 'ctrl'] as const;
type Modifier = (typeof MODIFIERS)[number];

export interface ParsedHotkey {
  key: string;
  mod: boolean;
  shift: boolean;
  alt: boolean;
  ctrl: boolean;
}

export function parseHotkey(hotkey: string): ParsedHotkey {
  const parts = hotkey.toLowerCase().split('+');
  const modifiers = new Set(parts.filter((p): p is Modifier => MODIFIERS.includes(p as Modifier)));
  const key = parts.filter((p) => !MODIFIERS.includes(p as Modifier)).join('+') || hotkey.toLowerCase();

  return {
    key,
    mod: modifiers.has('mod'),
    shift: modifiers.has('shift'),
    alt: modifiers.has('alt'),
    ctrl: modifiers.has('ctrl'),
  };
}

export function matchesHotkey(e: KeyboardEvent, parsed: ParsedHotkey): boolean {
  const modHeld = e.metaKey || e.ctrlKey;
  if (parsed.mod !== modHeld) return false;

  // Special case: if key is a character produced by shift (like ?), don't require shift modifier match
  const keyIsShiftProduced = parsed.key.length === 1 && /[^a-z0-9]/.test(parsed.key) && !parsed.shift;
  if (!keyIsShiftProduced && parsed.shift !== e.shiftKey) return false;

  if (parsed.alt !== e.altKey) return false;

  // Only check explicit ctrl if mod is not set (mod already covers ctrl on non-Mac)
  if (!parsed.mod && parsed.ctrl !== e.ctrlKey) return false;

  return e.key.toLowerCase() === parsed.key.toLowerCase();
}

export function normaliseKey(key: string): string {
  const parts = key.toLowerCase().split('+');
  const modifiers = parts.filter((p) => MODIFIERS.includes(p as Modifier)).sort();
  const nonModifiers = parts.filter((p) => !MODIFIERS.includes(p as Modifier));
  return [...modifiers, ...nonModifiers].join('+');
}

const MAC_SYMBOLS: Record<string, string> = {
  mod: '⌘',
  shift: '⇧',
  alt: '⌥',
  ctrl: '⌃',
};

const PC_SYMBOLS: Record<string, string> = {
  mod: 'Ctrl',
  shift: 'Shift',
  alt: 'Alt',
  ctrl: 'Ctrl',
};

const SPECIAL_KEYS: Record<string, string> = {
  escape: 'Esc',
  enter: '↵',
  backspace: '⌫',
  delete: 'Del',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  ' ': 'Space',
};

export function formatKeyForDisplay(key: string, isMac: boolean): string[] {
  const parts = key.toLowerCase().split('+');
  const symbols = isMac ? MAC_SYMBOLS : PC_SYMBOLS;
  const result: string[] = [];

  for (const part of parts) {
    if (MODIFIERS.includes(part as Modifier)) {
      result.push(symbols[part] ?? part);
    } else {
      const special = SPECIAL_KEYS[part];
      if (special) {
        result.push(special);
      } else if (part.length === 1) {
        result.push(part.toUpperCase());
      } else {
        result.push(part.charAt(0).toUpperCase() + part.slice(1));
      }
    }
  }

  return result;
}

/** Returns true if the shortcut has at least one non-shift modifier (mod, alt, ctrl). */
export function hasNonShiftModifier(key: string): boolean {
  const parts = key.toLowerCase().split('+');
  return parts.some((p) => p === 'mod' || p === 'alt' || p === 'ctrl');
}

const MODIFIER_KEYS = new Set(['Meta', 'Control', 'Alt', 'Shift']);

/**
 * Converts a live KeyboardEvent into a combo string (e.g. "mod+shift+t").
 * Returns null if the event is a modifier-only keypress.
 */
export function keyboardEventToCombo(e: KeyboardEvent): string | null {
  if (MODIFIER_KEYS.has(e.key)) return null;

  const parts: string[] = [];
  if (e.metaKey || e.ctrlKey) parts.push('mod');
  if (e.shiftKey) parts.push('shift');
  if (e.altKey) parts.push('alt');

  const key = e.key.toLowerCase();

  // If shift is the only modifier and the key is a shifted character (like ?),
  // don't include shift — the key itself encodes it
  if (parts.length === 1 && parts[0] === 'shift' && key.length === 1 && /[^a-z0-9]/.test(key)) {
    return key;
  }

  parts.push(key);
  return parts.join('+');
}
