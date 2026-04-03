import { useEffect } from 'react';
import { Workspace } from '@/components/layout/Workspace';
import { useWorkspace } from '@/hooks/useWorkspace';
import { NavBar } from './NavBar';
import { panelFactory, PANEL_REGISTRY } from './panels/panel-registry';
import { ToastContainer } from '@/components/feedback/Toast';
import { PRESETS, THREE_PANEL } from './panels/workspace-presets';
import { useTheme } from '@/hooks/useTheme';
import { CommandPaletteProvider, CommandPalette, useCommandPalette, ShortcutProvider, ShortcutOverlay, useShortcuts } from '@/components';
import type { Command } from '@/components';

function DemoCommands() {
  const { registerCommands } = useCommandPalette();
  const { toggle } = useTheme();

  useEffect(() => {
    const commands: Command[] = [
      {
        id: 'demo.toggle-theme',
        label: 'Toggle Theme',
        description: 'Switch between light and dark theme',
        category: 'Appearance',
        execute: () => {
          toggle();
        },
      },
      {
        id: 'demo.jump-to-panel',
        label: 'Jump to Panel',
        description: 'Focus a workspace panel by name',
        category: 'Navigation',
        args: [
          {
            name: 'panel',
            label: 'Panel',
            resolve: async () => {
              return ['Watchlist', 'Chart', 'Order Entry', 'Notifications'].map((name) => ({
                label: name,
                value: name,
              }));
            },
          },
        ],
        execute: (args) => {
          console.log('[DemoCommands] Jump to Panel:', args?.panel);
        },
      },
      {
        id: 'demo.load-vol-surface',
        label: 'Load Vol Surface',
        description: 'Load a volatility surface for an underlying',
        category: 'Market Data',
        args: [
          {
            name: 'underlying',
            label: 'Underlying',
            resolve: async () => {
              return ['SPX', 'NDX', 'RUT'].map((u) => ({ label: u, value: u }));
            },
          },
          {
            name: 'source',
            label: 'Source',
            resolve: async (context) => {
              const sourcesByUnderlying: Record<string, string[]> = {
                SPX: ['CBOE', 'ICE', 'Internal'],
                NDX: ['CBOE', 'ICE', 'Internal'],
                RUT: ['CBOE', 'ICE', 'Internal'],
              };
              const underlying = context.underlying ?? '';
              const sources = sourcesByUnderlying[underlying] ?? ['CBOE', 'ICE', 'Internal'];
              return sources.map((s: string) => ({ label: s, value: s }));
            },
          },
          {
            name: 'date',
            label: 'Date',
            resolve: async (_context) => {
              return ['2026-04-01', '2026-04-02', '2026-04-03'].map((d) => ({
                label: d,
                value: d,
              }));
            },
          },
        ],
        execute: (args) => {
          console.log('[DemoCommands] Load Vol Surface:', args);
        },
      },
    ];

    return registerCommands(commands);
  }, [registerCommands, toggle]);

  return null;
}

function DemoShortcuts() {
  const { register } = useShortcuts();
  const { toggle } = useTheme();
  const { open } = useCommandPalette();

  useEffect(() => {
    return register([
      {
        id: 'demo.toggle-theme',
        key: 'mod+t',
        label: 'Toggle Theme',
        category: 'Appearance',
        execute: toggle,
      },
      {
        id: 'demo.open-command-palette',
        key: 'mod+shift+p',
        label: 'Open Command Palette',
        category: 'Navigation',
        execute: open,
      },
    ]);
  }, [register, toggle, open]);

  return null;
}

export function App() {
  const { model, handleModelChange, presets, activePreset, loadPreset, addPanel } =
    useWorkspace(THREE_PANEL, 'Three Panel', PRESETS);

  return (
    <ShortcutProvider>
      <ShortcutOverlay />
      <CommandPaletteProvider>
        <DemoCommands />
        <DemoShortcuts />
        <div
          style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'var(--bg-base)',
          }}
        >
          <NavBar
            currentPreset={activePreset}
            presets={Object.keys(presets)}
            onPresetChange={loadPreset}
            panelTypes={PANEL_REGISTRY}
            onAddPanel={addPanel}
          />
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <Workspace
              model={model}
              factory={panelFactory}
              onModelChange={handleModelChange}
            />
          </div>
          <ToastContainer />
          <CommandPalette />
        </div>
      </CommandPaletteProvider>
    </ShortcutProvider>
  );
}
