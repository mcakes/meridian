import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';

export function App() {
  const location = useLocation();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [location.pathname]);

  const isDemo = location.pathname === '/demo';

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-base)',
      }}
    >
      <TopBar />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <div
          ref={contentRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isDemo ? 0 : '32px 48px',
          }}
        >
          {isDemo ? (
            <Outlet />
          ) : (
            <div style={{ maxWidth: 780 }}>
              <Outlet />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
