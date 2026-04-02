import { Workspace } from '@/components/layout/Workspace';
import { useWorkspace } from '@/hooks/useWorkspace';
import { NavBar } from './NavBar';
import { panelFactory, PANEL_REGISTRY } from './panels/panel-registry';
import { ToastContainer } from '@/components/feedback/Toast';
import { PRESETS, THREE_PANEL } from './panels/workspace-presets';

export function App() {
  const { model, handleModelChange, presets, activePreset, loadPreset, addPanel } =
    useWorkspace(THREE_PANEL, 'Three Panel', PRESETS);

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
    </div>
  );
}
