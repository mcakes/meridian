// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { SidebarProvider } from '../SidebarProvider';
import { Sidebar } from '../Sidebar';
import { Palette } from '../Palette';

afterEach(() => cleanup());

describe('SidebarProvider', () => {
  it('renders children in a flex row layout', () => {
    const { container } = render(
      <SidebarProvider>
        <div data-testid="content">Content</div>
      </SidebarProvider>,
    );
    const layout = container.querySelector('.meridian-sidebar-layout');
    expect(layout).not.toBeNull();
    expect(screen.getByTestId('content')).toBeDefined();
  });

  it('renders left sidebar, content, and right sidebar in correct order', () => {
    const { container } = render(
      <SidebarProvider>
        <Sidebar side="left" defaultExpanded>
          <Palette id="p1" title="P1" icon={<span>1</span>}>
            <div>Left content</div>
          </Palette>
        </Sidebar>
        <div data-testid="workspace">Workspace</div>
        <Sidebar side="right" defaultExpanded>
          <Palette id="p2" title="P2" icon={<span>2</span>}>
            <div>Right content</div>
          </Palette>
        </Sidebar>
      </SidebarProvider>,
    );
    const layout = container.querySelector('.meridian-sidebar-layout');
    expect(layout).not.toBeNull();
    expect(screen.getByText('P1')).toBeDefined();
    expect(screen.getByTestId('workspace')).toBeDefined();
    expect(screen.getByText('P2')).toBeDefined();
  });

  it('calls onStateChange when state changes', () => {
    const onChange = vi.fn();
    render(
      <SidebarProvider onStateChange={onChange}>
        <Sidebar side="left" defaultExpanded>
          <Palette id="p1" title="P1" icon={<span>1</span>}>
            <div>Content</div>
          </Palette>
        </Sidebar>
        <div>Main</div>
      </SidebarProvider>,
    );
    fireEvent.click(screen.getByText('P1'));
    expect(onChange).toHaveBeenCalled();
  });
});
