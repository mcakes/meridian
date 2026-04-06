import { useEffect, useState } from 'react';
import { Panel } from '@/components/layout/Panel';
import { HealthBar } from '@/components/primitives/HealthBar';
import { ThresholdValue } from '@/components/primitives/ThresholdValue';
import { Tag } from '@/components/primitives/Tag';
import { HeatmapCell } from '@/components/primitives/HeatmapCell';
import { Sparkline } from '@/components/data/Sparkline';
import { FlashCell } from '@/components/primitives/FlashCell';
import { PriceChange } from '@/components/primitives/PriceChange';
import { fmt } from '@/lib/format';

interface ServiceStatus {
  name: string;
  latencyMs: number;
  cpu: number;
  memory: number;
  rps: number;
  errorRate: number;
  status: 'pass' | 'warn' | 'fail';
  latencyHistory: number[];
}

function generateServices(): ServiceStatus[] {
  return [
    { name: 'Order Gateway', latencyMs: 2.1, cpu: 0.35, memory: 0.62, rps: 12400, errorRate: 0.01, status: 'pass', latencyHistory: [] },
    { name: 'Market Data', latencyMs: 0.8, cpu: 0.72, memory: 0.81, rps: 48200, errorRate: 0.0, status: 'pass', latencyHistory: [] },
    { name: 'Risk Engine', latencyMs: 5.3, cpu: 0.88, memory: 0.74, rps: 3200, errorRate: 0.15, status: 'warn', latencyHistory: [] },
    { name: 'Matching Engine', latencyMs: 0.3, cpu: 0.45, memory: 0.55, rps: 28700, errorRate: 0.0, status: 'pass', latencyHistory: [] },
    { name: 'Settlement', latencyMs: 12.1, cpu: 0.92, memory: 0.89, rps: 850, errorRate: 1.2, status: 'fail', latencyHistory: [] },
    { name: 'Auth Service', latencyMs: 3.4, cpu: 0.22, memory: 0.41, rps: 5100, errorRate: 0.02, status: 'pass', latencyHistory: [] },
  ];
}

function jitter(base: number, range: number): number {
  return Math.max(0, base + (Math.random() - 0.5) * range);
}

export function SystemMonitorPanel() {
  const [services, setServices] = useState<ServiceStatus[]>(generateServices);

  useEffect(() => {
    const interval = setInterval(() => {
      setServices((prev) =>
        prev.map((svc) => {
          const latencyMs = jitter(svc.latencyMs, svc.latencyMs * 0.3);
          const cpu = Math.min(1, Math.max(0, jitter(svc.cpu, 0.08)));
          const memory = Math.min(1, Math.max(0, jitter(svc.memory, 0.04)));
          const rps = Math.max(0, Math.round(jitter(svc.rps, svc.rps * 0.05)));
          const errorRate = Math.max(0, jitter(svc.errorRate, svc.errorRate * 0.5));
          const latencyHistory = [...svc.latencyHistory.slice(-19), latencyMs];

          let status: 'pass' | 'warn' | 'fail' = 'pass';
          if (errorRate > 0.5 || cpu > 0.9) status = 'fail';
          else if (errorRate > 0.05 || cpu > 0.8) status = 'warn';

          return { ...svc, latencyMs, cpu, memory, rps, errorRate, status, latencyHistory };
        }),
      );
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Panel>
      <div style={{ padding: 8, overflow: 'auto', height: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Service', 'Status', 'Req/s', 'Latency', 'Trend', 'CPU', 'Memory', 'Error %'].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: '4px 6px',
                    textAlign: h === 'Service' ? 'left' : 'right',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    fontSize: 10,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map((svc) => (
              <tr key={svc.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '6px', color: 'var(--text-primary)', fontWeight: 500 }}>
                  {svc.name}
                </td>
                <td style={{ padding: '6px', textAlign: 'right' }}>
                  <Tag variant={svc.status}>{svc.status.toUpperCase()}</Tag>
                </td>
                <td style={{ padding: '6px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                  <FlashCell value={svc.rps} format={(n) => n.toLocaleString()} />
                </td>
                <td style={{ padding: '6px', textAlign: 'right' }}>
                  <ThresholdValue
                    value={svc.latencyMs}
                    warnAt={5}
                    errorAt={10}
                    format={(n) => `${fmt(n, 1)}ms`}
                  />
                </td>
                <td style={{ padding: '6px', textAlign: 'right' }}>
                  <Sparkline
                    data={svc.latencyHistory}
                    width={48}
                    height={16}
                    color={svc.status === 'fail' ? 'var(--color-negative)' : svc.status === 'warn' ? 'var(--color-warning)' : 'var(--color-cat-0)'}
                  />
                </td>
                <td style={{ padding: 0 }}>
                  <HeatmapCell
                    value={svc.cpu}
                    scale="sequential"
                    style={{ padding: '4px 6px', fontSize: 10, fontFamily: 'var(--font-mono)', justifyContent: 'flex-end' }}
                  >
                    {Math.round(svc.cpu * 100)}%
                  </HeatmapCell>
                </td>
                <td style={{ padding: '6px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>
                      {Math.round(svc.memory * 100)}%
                    </span>
                    <HealthBar
                      value={svc.memory}
                      status={svc.memory > 0.85 ? 'error' : svc.memory > 0.7 ? 'warn' : 'ok'}
                    />
                  </div>
                </td>
                <td style={{ padding: '6px', textAlign: 'right' }}>
                  <PriceChange value={-svc.errorRate} decimals={2} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
