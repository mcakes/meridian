import type { ReactNode } from 'react';
import {
  Layout,
  type Model,
  type Action,
  type TabNode,
  type TabSetNode,
  type BorderNode,
  type ITabSetRenderValues,
  type ITabRenderValues,
} from 'flexlayout-react';
import 'flexlayout-react/style/gray.css';
import './workspace.css';

interface WorkspaceProps {
  model: Model;
  factory: (node: TabNode) => ReactNode;
  onModelChange: (model: Model, action: Action) => void;
}

function handleRenderTabSet(
  _tabSetNode: TabSetNode | BorderNode,
  _renderValues: ITabSetRenderValues,
) {
  // Augment the tabset header — styling is handled via CSS overrides in workspace.css.
  // This callback is available for adding per-tabset action buttons in the future.
}

function handleRenderTab(_node: TabNode, _renderValues: ITabRenderValues) {
  // Augment individual tab rendering — styling handled via CSS overrides.
  // This callback is available for adding icons or badges per tab in the future.
}

export function Workspace({ model, factory, onModelChange }: WorkspaceProps) {
  return (
    <Layout
      model={model}
      factory={factory}
      onModelChange={onModelChange}
      onRenderTabSet={handleRenderTabSet}
      onRenderTab={handleRenderTab}
    />
  );
}
