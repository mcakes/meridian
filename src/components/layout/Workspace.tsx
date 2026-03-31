import type { ReactNode } from 'react';
import { Mosaic, type MosaicNode } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import './workspace.css';

interface WorkspaceProps {
  layout: MosaicNode<string>;
  onChange: (layout: MosaicNode<string> | null) => void;
  renderTile: (id: string) => ReactNode;
}

export function Workspace({ layout, onChange, renderTile }: WorkspaceProps) {
  return (
    <Mosaic<string>
      className="meridian-mosaic"
      value={layout}
      onChange={onChange}
      renderTile={(id) => renderTile(id)}
    />
  );
}
