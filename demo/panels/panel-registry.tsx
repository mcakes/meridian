import type { ReactNode } from 'react';
import { TabNode } from 'flexlayout-react';
import { WatchlistPanel } from './WatchlistPanel';
import { ChartPanel } from './ChartPanel';
import { PricerPanel } from './PricerPanel';

export interface PanelDefinition {
  type: string;
  title: string;
  component: () => ReactNode;
}

export const PANEL_REGISTRY: PanelDefinition[] = [
  { type: 'watchlist', title: 'Watchlist', component: () => <WatchlistPanel /> },
  { type: 'chart',     title: 'Chart',     component: () => <ChartPanel /> },
  { type: 'pricer',    title: 'Pricer',    component: () => <PricerPanel /> },
];

export function panelFactory(node: TabNode): ReactNode {
  const componentType = node.getComponent();
  const def = PANEL_REGISTRY.find((p) => p.type === componentType);
  return def ? def.component() : <div>Unknown panel: {componentType}</div>;
}
