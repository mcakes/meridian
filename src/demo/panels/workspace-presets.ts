import type { IJsonModel } from 'flexlayout-react';

export const THREE_PANEL: IJsonModel = {
  global: {
    tabEnableClose: true,
    tabSetEnableMaximize: false,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 35,
        children: [
          { type: 'tab', name: 'Watchlist', component: 'watchlist' },
        ],
      },
      {
        type: 'row',
        weight: 65,
        children: [
          {
            type: 'tabset',
            weight: 60,
            children: [
              { type: 'tab', name: 'Chart', component: 'chart' },
            ],
          },
          {
            type: 'tabset',
            weight: 40,
            children: [
              { type: 'tab', name: 'Pricer', component: 'pricer' },
            ],
          },
        ],
      },
    ],
  },
};

export const STACKED: IJsonModel = {
  global: {
    tabEnableClose: true,
    tabSetEnableMaximize: false,
    rootOrientationVertical: true,
  },
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'row',
        weight: 45,
        children: [
          {
            type: 'tabset',
            weight: 40,
            children: [
              { type: 'tab', name: 'Watchlist', component: 'watchlist' },
            ],
          },
          {
            type: 'tabset',
            weight: 60,
            children: [
              { type: 'tab', name: 'Pricer', component: 'pricer' },
            ],
          },
        ],
      },
      {
        type: 'tabset',
        weight: 55,
        children: [
          { type: 'tab', name: 'Chart', component: 'chart' },
        ],
      },
    ],
  },
};

export const PRESETS: Record<string, IJsonModel> = {
  'Three Panel': THREE_PANEL,
  'Stacked': STACKED,
};
