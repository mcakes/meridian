import { useState, useCallback } from 'react';
import type { MosaicNode } from 'react-mosaic-component';

const STORAGE_KEY = 'meridian-workspace';

export function useWorkspace(
  defaultLayout: MosaicNode<string>,
  builtInPresets: Record<string, MosaicNode<string>>,
) {
  const [layout, setLayoutState] = useState<MosaicNode<string>>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { /* fall through */ }
    }
    return defaultLayout;
  });

  const [activePreset, setActivePreset] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) ? null : 'Equity Trading';
  });

  const setLayout = useCallback((newLayout: MosaicNode<string> | null) => {
    if (newLayout) {
      setLayoutState(newLayout);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newLayout));
    }
  }, []);

  const loadPreset = useCallback((name: string) => {
    const preset = builtInPresets[name];
    if (preset) {
      setLayoutState(preset);
      setActivePreset(name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preset));
    }
  }, [builtInPresets]);

  const savePreset = useCallback((_name: string) => {
    // Custom presets could be persisted to localStorage in future
  }, []);

  const resetLayout = useCallback(() => {
    setLayoutState(defaultLayout);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLayout));
  }, [defaultLayout]);

  return {
    layout,
    setLayout,
    presets: builtInPresets,
    activePreset,
    loadPreset,
    savePreset,
    resetLayout,
  };
}
