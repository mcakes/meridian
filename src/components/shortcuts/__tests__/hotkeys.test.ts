// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseHotkey,
  matchesHotkey,
  normaliseKey,
  formatKeyForDisplay,
  keyboardEventToCombo,
} from '../hotkeys';

describe('parseHotkey', () => {
  it('parses mod+k', () => {
    const parsed = parseHotkey('mod+k');
    expect(parsed).toEqual({ key: 'k', mod: true, shift: false, alt: false, ctrl: false });
  });

  it('parses mod+shift+t', () => {
    const parsed = parseHotkey('mod+shift+t');
    expect(parsed).toEqual({ key: 't', mod: true, shift: true, alt: false, ctrl: false });
  });

  it('parses plain key like ?', () => {
    const parsed = parseHotkey('?');
    expect(parsed).toEqual({ key: '?', mod: false, shift: false, alt: false, ctrl: false });
  });

  it('parses escape', () => {
    const parsed = parseHotkey('escape');
    expect(parsed).toEqual({ key: 'escape', mod: false, shift: false, alt: false, ctrl: false });
  });

  it('parses alt+d', () => {
    const parsed = parseHotkey('alt+d');
    expect(parsed).toEqual({ key: 'd', mod: false, shift: false, alt: true, ctrl: false });
  });

  it('parses ctrl+alt+delete', () => {
    const parsed = parseHotkey('ctrl+alt+delete');
    expect(parsed).toEqual({ key: 'delete', mod: false, shift: false, alt: true, ctrl: true });
  });
});

describe('matchesHotkey', () => {
  it('matches mod+k on Mac (metaKey)', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('matches mod+k on Windows (ctrlKey)', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('does not match mod+k when shift is also held', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true, shiftKey: true });
    expect(matchesHotkey(event, parsed)).toBe(false);
  });

  it('matches mod+shift+t with both modifiers', () => {
    const parsed = parseHotkey('mod+shift+t');
    const event = new KeyboardEvent('keydown', { key: 't', metaKey: true, shiftKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('matches ? key directly via e.key', () => {
    const parsed = parseHotkey('?');
    const event = new KeyboardEvent('keydown', { key: '?' });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });

  it('does not match wrong key', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'j', metaKey: true });
    expect(matchesHotkey(event, parsed)).toBe(false);
  });

  it('is case-insensitive', () => {
    const parsed = parseHotkey('mod+k');
    const event = new KeyboardEvent('keydown', { key: 'K', metaKey: true });
    expect(matchesHotkey(event, parsed)).toBe(true);
  });
});

describe('normaliseKey', () => {
  it('sorts modifiers alphabetically', () => {
    expect(normaliseKey('shift+mod+k')).toBe('mod+shift+k');
  });

  it('lowercases everything', () => {
    expect(normaliseKey('MOD+K')).toBe('mod+k');
  });

  it('handles single key', () => {
    expect(normaliseKey('?')).toBe('?');
  });

  it('normalises equivalent combos to same string', () => {
    expect(normaliseKey('shift+mod+t')).toBe(normaliseKey('mod+shift+t'));
  });
});

describe('formatKeyForDisplay', () => {
  it('formats mod+shift+t for Mac', () => {
    const parts = formatKeyForDisplay('mod+shift+t', true);
    expect(parts).toEqual(['⌘', '⇧', 'T']);
  });

  it('formats mod+shift+t for non-Mac', () => {
    const parts = formatKeyForDisplay('mod+shift+t', false);
    expect(parts).toEqual(['Ctrl', 'Shift', 'T']);
  });

  it('formats alt+d for Mac', () => {
    const parts = formatKeyForDisplay('alt+d', true);
    expect(parts).toEqual(['⌥', 'D']);
  });

  it('formats plain ? key', () => {
    const parts = formatKeyForDisplay('?', true);
    expect(parts).toEqual(['?']);
  });

  it('formats escape', () => {
    const parts = formatKeyForDisplay('escape', true);
    expect(parts).toEqual(['Esc']);
  });
});

describe('keyboardEventToCombo', () => {
  it('builds mod+k from metaKey + k', () => {
    const e = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    expect(keyboardEventToCombo(e)).toBe('mod+k');
  });

  it('builds mod+shift+t from metaKey + shiftKey + t', () => {
    const e = new KeyboardEvent('keydown', { key: 't', metaKey: true, shiftKey: true });
    expect(keyboardEventToCombo(e)).toBe('mod+shift+t');
  });

  it('builds alt+d from altKey + d', () => {
    const e = new KeyboardEvent('keydown', { key: 'd', altKey: true });
    expect(keyboardEventToCombo(e)).toBe('alt+d');
  });

  it('builds plain key for no modifiers', () => {
    const e = new KeyboardEvent('keydown', { key: 'a' });
    expect(keyboardEventToCombo(e)).toBe('a');
  });

  it('returns null for modifier-only keypress (Meta)', () => {
    const e = new KeyboardEvent('keydown', { key: 'Meta', metaKey: true });
    expect(keyboardEventToCombo(e)).toBeNull();
  });

  it('returns null for modifier-only keypress (Shift)', () => {
    const e = new KeyboardEvent('keydown', { key: 'Shift', shiftKey: true });
    expect(keyboardEventToCombo(e)).toBeNull();
  });

  it('returns null for modifier-only keypress (Control)', () => {
    const e = new KeyboardEvent('keydown', { key: 'Control', ctrlKey: true });
    expect(keyboardEventToCombo(e)).toBeNull();
  });

  it('lowercases the key', () => {
    const e = new KeyboardEvent('keydown', { key: 'K', metaKey: true });
    expect(keyboardEventToCombo(e)).toBe('mod+k');
  });

  it('handles special characters like ?', () => {
    const e = new KeyboardEvent('keydown', { key: '?', shiftKey: true });
    expect(keyboardEventToCombo(e)).toBe('?');
  });
});
