import type { ReactNode } from 'react';
import { Workspace } from '@/components/layout/Workspace';
import { useWorkspace } from '@/hooks/useWorkspace';
import { NavBar } from './NavBar';
import { WatchlistPanel } from './panels/WatchlistPanel';
import { ChartPanel } from './panels/ChartPanel';
import { PricerPanel } from './panels/PricerPanel';
import { ToastContainer } from '@/components/feedback/Toast';
import { PRESETS, EQUITY_TRADING } from './panels/workspace-presets';

const PANEL_MAP: Record<string, () => ReactNode> = {
  watchlist: () => <WatchlistPanel />,
  chart: () => <ChartPanel />,
  pricer: () => <PricerPanel />,
};

export function App() {
  const { layout, setLayout, presets, activePreset, loadPreset } = useWorkspace(
    EQUITY_TRADING,
    PRESETS,
  );

  return (
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
      />
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Workspace
          layout={layout}
          onChange={setLayout}
          renderTile={(id) => PANEL_MAP[id]?.() ?? <div>Unknown panel: {id}</div>}
        />
      </div>
      <ToastContainer />
    </div>
  );
}
