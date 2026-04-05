import { useEffect, useState } from 'react';
import { Workspace } from '@/components/layout/Workspace';
import { useWorkspace } from '@/hooks/useWorkspace';
import { SidebarProvider, Sidebar, Palette } from '@/components/layout/sidebar';
import { NavBar } from './NavBar';
import { panelFactory, PANEL_REGISTRY } from './panels/panel-registry';
import { ToastContainer } from '@/components/feedback/Toast';
import { PRESETS, THREE_PANEL } from './panels/workspace-presets';
import { useTheme } from '@/hooks/useTheme';
import { useDataContext } from './providers/DataProvider';
import { CommandPaletteProvider, CommandPalette, useCommandPalette, ShortcutProvider, ShortcutOverlay, useShortcuts } from '@/components';
import type { Command } from '@/components';
import type { Tick } from './data/types';
import { List, Star, BarChart3, Newspaper, CalendarDays, Briefcase, ClipboardList, ArrowLeftRight, Bell } from 'lucide-react';

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

function InstrumentsPalette() {
  const { provider, selectedSymbol, setSelectedSymbol } = useDataContext();
  const [ticks, setTicks] = useState<Record<string, Tick>>({});

  useEffect(() => {
    const unsubs = provider.instruments.map((inst) =>
      provider.subscribe(inst.symbol, (tick) => {
        setTicks((prev) => ({ ...prev, [tick.symbol]: tick }));
      }),
    );
    return () => unsubs.forEach((u) => u());
  }, [provider]);

  const groups = new Map<string, typeof provider.instruments>();
  for (const inst of provider.instruments) {
    const list = groups.get(inst.group) ?? [];
    list.push(inst);
    groups.set(inst.group, list);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {[...groups.entries()].map(([group, instruments]) => (
        <div key={group}>
          <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', padding: '6px 0 2px' }}>
            {group}
          </div>
          {instruments.map((inst) => {
            const tick = ticks[inst.symbol];
            const isSelected = inst.symbol === selectedSymbol;
            return (
              <div
                key={inst.symbol}
                onClick={() => setSelectedSymbol(inst.symbol)}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-highlight)'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '3px 4px',
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'var(--bg-muted)' : 'transparent',
                  fontSize: 11,
                }}
              >
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{inst.symbol}</span>
                {tick && (
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: tick.changePct >= 0 ? 'var(--color-positive)' : 'var(--color-negative)',
                  }}>
                    {tick.changePct >= 0 ? '+' : ''}{(tick.changePct * 100).toFixed(2)}%
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function TradeLogPalette() {
  const [trades, setTrades] = useState<Array<{ id: number; symbol: string; side: string; qty: number; price: number; time: string }>>([]);
  const { provider } = useDataContext();

  useEffect(() => {
    // Simulate occasional trades
    let id = 0;
    const symbols = provider.instruments.map((i) => i.symbol);
    const interval = setInterval(() => {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]!;
      const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
      const qty = Math.round((Math.random() * 500 + 100) / 100) * 100;
      const price = Math.round((Math.random() * 200 + 10) * 100) / 100;
      const now = new Date();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setTrades((prev) => [{ id: ++id, symbol, side, qty, price, time }, ...prev].slice(0, 20));
    }, 3000);
    return () => clearInterval(interval);
  }, [provider.instruments]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {trades.length === 0 && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: 4 }}>Waiting for trades...</div>
      )}
      {trades.map((t) => (
        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ color: t.side === 'BUY' ? 'var(--color-positive)' : 'var(--color-negative)', fontWeight: 600, width: 28 }}>{t.side}</span>
          <span style={{ color: 'var(--text-primary)', width: 50 }}>{t.symbol}</span>
          <span style={{ color: 'var(--text-secondary)', width: 36, textAlign: 'right' }}>{t.qty}</span>
          <span style={{ color: 'var(--text-muted)', width: 52, textAlign: 'right' }}>{t.time}</span>
        </div>
      ))}
    </div>
  );
}

function WatchlistPalette() {
  const { selectedSymbol, setSelectedSymbol } = useDataContext();
  const favorites = ['AAPL', 'MSFT', 'NVDA', 'EURUSD', 'USDJPY'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {favorites.map((sym) => (
        <div
          key={sym}
          onClick={() => setSelectedSymbol(sym)}
          onMouseEnter={(e) => { if (sym !== selectedSymbol) e.currentTarget.style.backgroundColor = 'var(--bg-highlight)'; }}
          onMouseLeave={(e) => { if (sym !== selectedSymbol) e.currentTarget.style.backgroundColor = 'transparent'; }}
          style={{
            fontSize: 11,
            padding: '3px 4px',
            borderRadius: 2,
            cursor: 'pointer',
            fontWeight: 500,
            color: 'var(--text-primary)',
            backgroundColor: sym === selectedSymbol ? 'var(--bg-muted)' : 'transparent',
          }}
        >
          {sym}
        </div>
      ))}
    </div>
  );
}

function NewsPalette() {
  const headlines = [
    { time: '14:32', text: 'Fed holds rates steady, signals patience' },
    { time: '13:15', text: 'NVDA beats Q3 estimates, guides higher' },
    { time: '12:48', text: 'EUR/USD slips on weak PMI data' },
    { time: '11:20', text: 'Oil rises 2% on supply concerns' },
    { time: '10:05', text: 'BOJ holds, yen weakens to 156' },
    { time: '09:30', text: 'US jobless claims fall to 210K' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {headlines.map((h, i) => (
        <div key={i} style={{ display: 'flex', gap: 6, fontSize: 10, padding: '2px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{h.time}</span>
          <span style={{ color: 'var(--text-secondary)' }}>{h.text}</span>
        </div>
      ))}
    </div>
  );
}

function MarketOverviewPalette() {
  const indices = [
    { name: 'S&P 500', value: '5,248.30', change: '+0.42%', up: true },
    { name: 'NASDAQ', value: '16,891.10', change: '+0.67%', up: true },
    { name: 'DOW', value: '39,112.50', change: '-0.12%', up: false },
    { name: 'VIX', value: '14.32', change: '-3.10%', up: false },
    { name: 'US 10Y', value: '4.28%', change: '+2bp', up: true },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {indices.map((idx) => (
        <div key={idx.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, padding: '3px 0' }}>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{idx.name}</span>
          <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: 'var(--text-primary)' }}>{idx.value}</span>
            <span style={{ color: idx.up ? 'var(--color-positive)' : 'var(--color-negative)', width: 48, textAlign: 'right' }}>{idx.change}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function CalendarPalette() {
  const events = [
    { time: '08:30', event: 'Non-Farm Payrolls', impact: 'high' },
    { time: '10:00', event: 'ISM Manufacturing', impact: 'high' },
    { time: '14:00', event: 'FOMC Minutes', impact: 'high' },
    { time: '08:30', event: 'Initial Jobless Claims', impact: 'med' },
    { time: '10:00', event: 'Consumer Confidence', impact: 'med' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {events.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, padding: '2px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', flexShrink: 0 }}>{e.time}</span>
          <span style={{ color: 'var(--text-secondary)', flex: 1 }}>{e.event}</span>
          <span style={{
            fontSize: 9,
            fontWeight: 600,
            textTransform: 'uppercase',
            color: e.impact === 'high' ? 'var(--color-negative)' : 'var(--color-warning)',
          }}>{e.impact}</span>
        </div>
      ))}
    </div>
  );
}

function PositionsPalette() {
  const positions = [
    { symbol: 'AAPL', qty: 500, pnl: '+$1,240', up: true },
    { symbol: 'MSFT', qty: -200, pnl: '-$380', up: false },
    { symbol: 'NVDA', qty: 300, pnl: '+$2,850', up: true },
    { symbol: 'EURUSD', qty: 100000, pnl: '-$120', up: false },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {positions.map((p) => (
        <div key={p.symbol} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 500, width: 48 }}>{p.symbol}</span>
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.qty > 0 ? '+' : ''}{p.qty.toLocaleString()}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: p.up ? 'var(--color-positive)' : 'var(--color-negative)' }}>{p.pnl}</span>
        </div>
      ))}
    </div>
  );
}

function OrdersPalette() {
  const orders = [
    { id: 'ORD-001', symbol: 'AAPL', side: 'BUY', qty: 100, price: '194.50', status: 'Working' },
    { id: 'ORD-002', symbol: 'GOOGL', side: 'SELL', qty: 50, price: '176.00', status: 'Working' },
    { id: 'ORD-003', symbol: 'AMD', side: 'BUY', qty: 200, price: '158.00', status: 'Pending' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {orders.map((o) => (
        <div key={o.id} style={{ fontSize: 10, padding: '3px 0', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <span style={{ color: o.side === 'BUY' ? 'var(--color-positive)' : 'var(--color-negative)', fontWeight: 600 }}>{o.side}</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{o.symbol}</span>
            </div>
            <span style={{ color: 'var(--text-muted)', fontSize: 9 }}>{o.status}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span>{o.qty} @ {o.price}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AlertsPalette() {
  const alerts = [
    { symbol: 'AAPL', condition: '> 196.00', active: true },
    { symbol: 'NVDA', condition: '< 125.00', active: true },
    { symbol: 'EURUSD', condition: '< 1.0800', active: false },
    { symbol: 'VIX', condition: '> 20.00', active: true },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {alerts.map((a, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, padding: '3px 0' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: a.active ? 'var(--color-positive)' : 'var(--border-default)', alignSelf: 'center', flexShrink: 0 }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{a.symbol}</span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{a.condition}</span>
        </div>
      ))}
    </div>
  );
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
            backgroundColor: 'var(--bg-base)',
          }}
        >
          <SidebarProvider>
            <Sidebar side="left" defaultExpanded defaultWidth={200}>
              <Palette id="instruments" title="Instruments" icon={<List size={14} />} defaultExpanded>
                <InstrumentsPalette />
              </Palette>
              <Palette id="watchlist" title="Watchlist" icon={<Star size={14} />} defaultExpanded>
                <WatchlistPalette />
              </Palette>
              <Palette id="overview" title="Market Overview" icon={<BarChart3 size={14} />} defaultExpanded>
                <MarketOverviewPalette />
              </Palette>
              <Palette id="news" title="News" icon={<Newspaper size={14} />}>
                <NewsPalette />
              </Palette>
              <Palette id="calendar" title="Calendar" icon={<CalendarDays size={14} />}>
                <CalendarPalette />
              </Palette>
            </Sidebar>
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0 }}>
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
            </div>
            <Sidebar side="right" defaultWidth={220}>
              <Palette id="positions" title="Positions" icon={<Briefcase size={14} />} defaultExpanded>
                <PositionsPalette />
              </Palette>
              <Palette id="orders" title="Orders" icon={<ClipboardList size={14} />} defaultExpanded>
                <OrdersPalette />
              </Palette>
              <Palette id="trades" title="Trade Log" icon={<ArrowLeftRight size={14} />}>
                <TradeLogPalette />
              </Palette>
              <Palette id="alerts" title="Alerts" icon={<Bell size={14} />}>
                <AlertsPalette />
              </Palette>
            </Sidebar>
          </SidebarProvider>
          <ToastContainer />
          <CommandPalette />
        </div>
      </CommandPaletteProvider>
    </ShortcutProvider>
  );
}
