export function fmt(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtPct(n: number): string {
  const pct = n * 100;
  const sign = pct > 0 ? '+' : '';
  return `${sign}${pct.toFixed(2)}%`;
}

export function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export interface FuzzyMatchResult {
  score: number;
  ranges: { start: number; end: number }[];
}

export function fuzzyMatch(text: string, query: string): FuzzyMatchResult | null {
  if (!query) return { score: 0, ranges: [] };

  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();

  // Exact substring match — highest priority
  const substringIndex = lower.indexOf(queryLower);
  if (substringIndex !== -1) {
    return {
      score: 100 - substringIndex,
      ranges: [{ start: substringIndex, end: substringIndex + query.length }],
    };
  }

  // Sequential character match with gap penalty
  const ranges: { start: number; end: number }[] = [];
  let qi = 0;
  let score = 50;
  let rangeStart = -1;
  let lastMatchIndex = -1;

  for (let i = 0; i < lower.length && qi < queryLower.length; i++) {
    if (lower[i] === queryLower[qi]) {
      if (lastMatchIndex !== i - 1) {
        if (rangeStart !== -1) {
          ranges.push({ start: rangeStart, end: lastMatchIndex + 1 });
        }
        rangeStart = i;
        score -= 5; // gap penalty
      }
      lastMatchIndex = i;
      qi++;
    }
  }

  if (qi < queryLower.length) return null;

  if (rangeStart !== -1) {
    ranges.push({ start: rangeStart, end: lastMatchIndex + 1 });
  }

  return { score, ranges };
}
