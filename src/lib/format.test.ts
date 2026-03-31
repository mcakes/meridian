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
