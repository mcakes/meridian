// src/components/command-palette/__tests__/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreCommand, rankCommands } from '../scoring';
import type { Command, FrequencyMap } from '../types';

function makeCommand(overrides: Partial<Command> & { id: string; label: string }): Command {
  return { execute: () => {}, ...overrides };
}

describe('scoreCommand', () => {
  it('returns null for no fuzzy match', () => {
    const cmd = makeCommand({ id: 'a', label: 'Toggle Theme' });
    const result = scoreCommand(cmd, 'zzz', new Map());
    expect(result).toBeNull();
  });

  it('scores exact substring higher than sequential match', () => {
    const cmd1 = makeCommand({ id: 'a', label: 'Toggle Theme' });
    const cmd2 = makeCommand({ id: 'b', label: 'Test Helpers' });
    const freq: FrequencyMap = new Map();
    const r1 = scoreCommand(cmd1, 'the', freq);
    const r2 = scoreCommand(cmd2, 'the', freq);
    expect(r1).not.toBeNull();
    expect(r2).not.toBeNull();
    expect(r1!.score).toBeGreaterThan(r2!.score);
  });

  it('boosts score based on frequency (log dampened)', () => {
    const cmd = makeCommand({ id: 'a', label: 'Toggle Theme' });
    const noFreq: FrequencyMap = new Map();
    const withFreq: FrequencyMap = new Map([
      ['a', { count: 10, lastUsed: Date.now() }],
    ]);
    const r1 = scoreCommand(cmd, 'tog', noFreq);
    const r2 = scoreCommand(cmd, 'tog', withFreq);
    expect(r2!.score).toBeGreaterThan(r1!.score);
  });

  it('matches against keywords', () => {
    const cmd = makeCommand({
      id: 'a',
      label: 'Toggle Theme',
      keywords: ['dark', 'light', 'mode'],
    });
    const result = scoreCommand(cmd, 'dark', new Map());
    expect(result).not.toBeNull();
  });

  it('matches against description', () => {
    const cmd = makeCommand({
      id: 'a',
      label: 'Toggle Theme',
      description: 'Switch between dark and light mode',
    });
    const result = scoreCommand(cmd, 'switch', new Map());
    expect(result).not.toBeNull();
  });
});

describe('rankCommands', () => {
  it('returns commands sorted by score descending', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'Zebra Action' }),
      makeCommand({ id: 'b', label: 'Toggle Theme' }),
      makeCommand({ id: 'c', label: 'Theme Settings' }),
    ];
    const ranked = rankCommands(cmds, 'theme', new Map());
    expect(ranked.length).toBe(2);
    expect(ranked[0]!.command.id).toBe('c');
    expect(ranked[1]!.command.id).toBe('b');
  });

  it('respects maxResults', () => {
    const cmds = Array.from({ length: 20 }, (_, i) =>
      makeCommand({ id: `cmd-${i}`, label: `Command ${i}` }),
    );
    const ranked = rankCommands(cmds, 'command', new Map(), 5);
    expect(ranked.length).toBe(5);
  });

  it('uses lastUsed as tiebreaker', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'Toggle Alpha' }),
      makeCommand({ id: 'b', label: 'Toggle Beta' }),
    ];
    const freq: FrequencyMap = new Map([
      ['a', { count: 1, lastUsed: 1000 }],
      ['b', { count: 1, lastUsed: 2000 }],
    ]);
    const ranked = rankCommands(cmds, 'toggle', freq);
    expect(ranked[0]!.command.id).toBe('b');
  });

  it('returns recents when query is empty', () => {
    const cmds = [
      makeCommand({ id: 'a', label: 'Alpha' }),
      makeCommand({ id: 'b', label: 'Beta' }),
      makeCommand({ id: 'c', label: 'Gamma' }),
    ];
    const freq: FrequencyMap = new Map([
      ['b', { count: 3, lastUsed: 2000 }],
      ['a', { count: 1, lastUsed: 1000 }],
    ]);
    const ranked = rankCommands(cmds, '', freq, 10);
    expect(ranked.length).toBe(2);
    expect(ranked[0]!.command.id).toBe('b');
    expect(ranked[1]!.command.id).toBe('a');
  });
});
