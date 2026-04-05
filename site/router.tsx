import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from './App';

function Loading() {
  return (
    <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '32px 0' }}>
      Loading...
    </div>
  );
}

function lazyPage(factory: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<Loading />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: lazyPage(() => import('./pages/overview/Introduction')) },
      { path: 'getting-started', element: lazyPage(() => import('./pages/overview/GettingStarted')) },
      { path: 'research/information-density', element: lazyPage(() => import('./pages/research/InformationDensity')) },
      { path: 'research/color-system', element: lazyPage(() => import('./pages/research/ColorSystem')) },
      { path: 'research/typography', element: lazyPage(() => import('./pages/research/Typography')) },
      { path: 'research/shape-and-radius', element: lazyPage(() => import('./pages/research/ShapeAndRadius')) },
      { path: 'research/workspace-layout', element: lazyPage(() => import('./pages/research/WorkspaceLayout')) },
      { path: 'research/notifications', element: lazyPage(() => import('./pages/research/Notifications')) },
      { path: 'research/accessibility', element: lazyPage(() => import('./pages/research/Accessibility')) },
      { path: 'tokens/colors', element: lazyPage(() => import('./pages/tokens/Colors')) },
      { path: 'tokens/typography', element: lazyPage(() => import('./pages/tokens/TypographyTokens')) },
      { path: 'tokens/spacing', element: lazyPage(() => import('./pages/tokens/Spacing')) },
      { path: 'tokens/borders', element: lazyPage(() => import('./pages/tokens/Borders')) },
      { path: 'components/data-table', element: lazyPage(() => import('./pages/components/DataTablePage')) },
      { path: 'components/chart', element: lazyPage(() => import('./pages/components/ChartPage')) },
      { path: 'components/workspace', element: lazyPage(() => import('./pages/components/WorkspacePage')) },
      { path: 'components/panel', element: lazyPage(() => import('./pages/components/PanelPage')) },
      { path: 'components/sidebar', element: lazyPage(() => import('./pages/components/SidebarPage')) },
      { path: 'components/primitives', element: lazyPage(() => import('./pages/components/PrimitivesPage')) },
      { path: 'components/inputs', element: lazyPage(() => import('./pages/components/InputsPage')) },
      { path: 'components/feedback', element: lazyPage(() => import('./pages/components/FeedbackPage')) },
      { path: 'components/command-palette', element: lazyPage(() => import('./pages/components/CommandPalettePage')) },
      { path: 'components/shortcuts', element: lazyPage(() => import('./pages/components/ShortcutsPage')) },
      { path: 'components/menus', element: lazyPage(() => import('./pages/components/MenusPage')) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
