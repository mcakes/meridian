import { describe, it, expect, afterEach } from 'vitest';
import { SimulatedMarketData } from './SimulatedMarketData';

describe('SimulatedMarketData', () => {
  let provider: SimulatedMarketData;

  afterEach(() => {
    provider?.destroy();
  });

  it('provides a list of instruments', () => {
    provider = new SimulatedMarketData();
    expect(provider.instruments.length).toBeGreaterThan(10);
    expect(provider.instruments[0]).toHaveProperty('symbol');
    expect(provider.instruments[0]).toHaveProperty('name');
    expect(provider.instruments[0]).toHaveProperty('assetClass');
    expect(provider.instruments[0]).toHaveProperty('group');
  });

  it('delivers ticks via subscribe', async () => {
    provider = new SimulatedMarketData();
    const ticks: any[] = [];
    const unsub = provider.subscribe('AAPL', (tick) => ticks.push(tick));
    await new Promise((r) => setTimeout(r, 2000));
    unsub();
    expect(ticks.length).toBeGreaterThan(0);
    expect(ticks[0]).toHaveProperty('price');
    expect(ticks[0]).toHaveProperty('bid');
    expect(ticks[0]).toHaveProperty('ask');
    expect(ticks[0].symbol).toBe('AAPL');
  });

  it('unsubscribe stops tick delivery', async () => {
    provider = new SimulatedMarketData();
    const ticks: any[] = [];
    const unsub = provider.subscribe('AAPL', (tick) => ticks.push(tick));
    unsub();
    await new Promise((r) => setTimeout(r, 2000));
    expect(ticks.length).toBe(0);
  });

  it('generates candlestick history', () => {
    provider = new SimulatedMarketData();
    const candles = provider.getHistory('AAPL', '1M');
    expect(candles.length).toBeGreaterThan(0);
    expect(candles[0]).toHaveProperty('open');
    expect(candles[0]).toHaveProperty('high');
    expect(candles[0]).toHaveProperty('low');
    expect(candles[0]).toHaveProperty('close');
    expect(candles[0]).toHaveProperty('volume');
  });
});
