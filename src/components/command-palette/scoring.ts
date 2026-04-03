// src/components/command-palette/scoring.ts
import { fuzzyMatch } from '@/lib/format';
import type { Command, FrequencyMap } from './types';

export interface ScoredCommand {
  command: Command;
  score: number;
  matchRanges: { start: number; end: number }[];
}

export function scoreCommand(
  command: Command,
  query: string,
  frequency: FrequencyMap,
): ScoredCommand | null {
  let best = fuzzyMatch(command.label, query);
  let bestRanges = best?.ranges ?? [];

  if (command.keywords) {
    for (const kw of command.keywords) {
      const result = fuzzyMatch(kw, query);
      if (result && (!best || result.score > best.score)) {
        best = result;
        bestRanges = [];
      }
    }
  }

  if (command.description) {
    const result = fuzzyMatch(command.description, query);
    if (result && (!best || result.score > best.score)) {
      best = result;
      bestRanges = [];
    }
  }

  if (!best || best.score <= 0) return null;

  const entry = frequency.get(command.id);
  const freqBoost = entry ? 0.1 * Math.log(entry.count + 1) : 0;

  return {
    command,
    score: best.score + freqBoost,
    matchRanges: bestRanges,
  };
}

export function rankCommands(
  commands: Command[],
  query: string,
  frequency: FrequencyMap,
  maxResults = 12,
): ScoredCommand[] {
  if (!query) {
    return commands
      .filter((cmd) => frequency.has(cmd.id))
      .map((cmd) => ({
        command: cmd,
        score: 0,
        matchRanges: [],
      }))
      .sort((a, b) => {
        const aLast = frequency.get(a.command.id)?.lastUsed ?? 0;
        const bLast = frequency.get(b.command.id)?.lastUsed ?? 0;
        return bLast - aLast;
      })
      .slice(0, maxResults);
  }

  const scored: ScoredCommand[] = [];
  for (const cmd of commands) {
    const result = scoreCommand(cmd, query, frequency);
    if (result) scored.push(result);
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aLast = frequency.get(a.command.id)?.lastUsed ?? 0;
    const bLast = frequency.get(b.command.id)?.lastUsed ?? 0;
    return bLast - aLast;
  });

  return scored.slice(0, maxResults);
}
