import { useState, useCallback, useRef } from 'react';
import { Model, Action, Actions, DockLocation } from 'flexlayout-react';
import type { IJsonModel } from 'flexlayout-react';

const STORAGE_KEY = 'meridian-workspace';

function createModel(json: IJsonModel): Model {
  return Model.fromJson(json);
}

export function useWorkspace(
  defaultPreset: IJsonModel,
  defaultPresetName: string,
  builtInPresets: Record<string, IJsonModel>,
) {
  const [model, setModel] = useState<Model>(() => {
    if (typeof window === 'undefined') return createModel(defaultPreset);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return createModel(JSON.parse(stored));
      } catch {
        /* corrupted or invalid — fall through to default */
      }
    }
    return createModel(defaultPreset);
  });

  // Keep a ref to the current model so addPanel always uses the latest instance
  const modelRef = useRef(model);
  modelRef.current = model;

  const [activePreset, setActivePreset] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY) ? null : defaultPresetName;
  });

  // FlexLayout's onModelChange passes the same mutable Model instance, not a new one.
  // The model has already been mutated by the time this fires — we just persist and clear preset.
  const handleModelChange = useCallback((model: Model, _action: Action) => {
    setActivePreset(null);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model.toJson()));
  }, []);

  const loadPreset = useCallback((name: string) => {
    const preset = builtInPresets[name];
    if (preset) {
      const newModel = createModel(preset);
      setModel(newModel);
      setActivePreset(name);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newModel.toJson()));
    }
  }, [builtInPresets]);

  const resetLayout = useCallback(() => {
    const newModel = createModel(defaultPreset);
    setModel(newModel);
    setActivePreset(defaultPresetName);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newModel.toJson()));
  }, [defaultPreset, defaultPresetName]);

  const addPanel = useCallback((type: string, title: string) => {
    const currentModel = modelRef.current;
    const activeTabset = currentModel.getActiveTabset();
    const targetId = activeTabset
      ? activeTabset.getId()
      : currentModel.getRoot().getId();
    const dockLocation = activeTabset
      ? DockLocation.CENTER
      : DockLocation.RIGHT;
    currentModel.doAction(
      Actions.addNode(
        { type: 'tab', name: title, component: type },
        targetId,
        dockLocation,
        -1,
      ),
    );
  }, []);

  return {
    model,
    handleModelChange,
    presets: builtInPresets,
    activePreset,
    loadPreset,
    resetLayout,
    addPanel,
  };
}
