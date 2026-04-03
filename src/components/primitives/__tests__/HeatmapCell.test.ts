// src/components/primitives/__tests__/HeatmapCell.test.ts
import { describe, it, expect } from 'vitest';
import { computeHeatmap } from '../HeatmapCell';

describe('computeHeatmap', () => {
  describe('clamping', () => {
    it('clamps values below 0 to 0', () => {
      const result = computeHeatmap(-0.5, 'diverging');
      expect(result).toEqual(computeHeatmap(0, 'diverging'));
    });

    it('clamps values above 1 to 1', () => {
      const result = computeHeatmap(1.5, 'diverging');
      expect(result).toEqual(computeHeatmap(1, 'diverging'));
    });
  });

  describe('diverging scale', () => {
    it('returns full negative at 0', () => {
      const result = computeHeatmap(0, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-negative) 100%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('returns neutral at 0.5', () => {
      const result = computeHeatmap(0.5, 'diverging');
      expect(result.bg).toBe('var(--bg-surface)');
      expect(result.textColor).toBe('var(--text-primary)');
    });

    it('returns full positive at 1', () => {
      const result = computeHeatmap(1, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-positive) 100%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('returns partial negative between 0 and 0.5', () => {
      const result = computeHeatmap(0.2, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-negative) 60%, var(--bg-surface))');
    });

    it('returns partial positive between 0.5 and 1', () => {
      const result = computeHeatmap(0.8, 'diverging');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-positive) 60%, var(--bg-surface))');
    });
  });

  describe('sequential scale', () => {
    it('returns surface at 0', () => {
      const result = computeHeatmap(0, 'sequential');
      expect(result.bg).toBe('var(--bg-surface)');
      expect(result.textColor).toBe('var(--text-primary)');
    });

    it('returns full info at 1', () => {
      const result = computeHeatmap(1, 'sequential');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-info) 100%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('returns partial info at 0.4', () => {
      const result = computeHeatmap(0.4, 'sequential');
      expect(result.bg).toBe('color-mix(in srgb, var(--color-info) 40%, var(--bg-surface))');
      expect(result.textColor).toBe('var(--text-primary)');
    });
  });

  describe('text contrast', () => {
    it('uses inverse text when intensity exceeds 60%', () => {
      const result = computeHeatmap(0.1, 'diverging'); // intensity = 80%
      expect(result.textColor).toBe('var(--text-inverse)');
    });

    it('uses primary text when intensity is at or below 60%', () => {
      const result = computeHeatmap(0.3, 'diverging'); // intensity = 40%
      expect(result.textColor).toBe('var(--text-primary)');
    });

    it('uses primary text at midpoint', () => {
      const result = computeHeatmap(0.5, 'diverging'); // intensity = 0%
      expect(result.textColor).toBe('var(--text-primary)');
    });
  });
});
