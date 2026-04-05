import { DataProvider } from '../../../../demo/providers/DataProvider';
import { App as DemoApp } from '../../../../demo/App';

export default function TradingApp() {
  return (
    <div style={{ height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      <DataProvider>
        <DemoApp />
      </DataProvider>
    </div>
  );
}
