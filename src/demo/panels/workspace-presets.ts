import type { MosaicNode } from 'react-mosaic-component';

export const EQUITY_TRADING: MosaicNode<string> = {
  direction: 'row',
  first: 'watchlist',
  second: {
    direction: 'column',
    first: 'chart',
    second: 'pricer',
    splitPercentage: 60,
  },
  splitPercentage: 35,
};

export const OPTIONS_DESK: MosaicNode<string> = {
  direction: 'column',
  first: {
    direction: 'row',
    first: 'watchlist',
    second: 'pricer',
    splitPercentage: 40,
  },
  second: 'chart',
  splitPercentage: 55,
};

export const PRESETS: Record<string, MosaicNode<string>> = {
  'Equity Trading': EQUITY_TRADING,
  'Options Desk': OPTIONS_DESK,
};
