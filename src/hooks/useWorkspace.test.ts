// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { Model } from 'flexlayout-react';
import { THREE_PANEL, STACKED } from '@/demo/panels/workspace-presets';

// Test that presets produce valid models
describe('useWorkspace presets', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('creates a valid Model from THREE_PANEL preset', () => {
    const model = Model.fromJson(THREE_PANEL);
    expect(model).toBeDefined();
    expect(model.toJson()).toBeTruthy();
  });

  it('creates a valid Model from STACKED preset', () => {
    const model = Model.fromJson(STACKED);
    expect(model).toBeDefined();
    expect(model.toJson()).toBeTruthy();
  });

  it('round-trips through JSON serialisation', () => {
    const model = Model.fromJson(THREE_PANEL);
    const json = model.toJson();
    const restored = Model.fromJson(json);
    expect(restored.toJson()).toEqual(json);
  });
});
