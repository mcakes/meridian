import { useState } from 'react';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { Button } from '@/components/inputs/Button';
import { showToast } from '@/components/feedback/Toast';
import { Modal } from '@/components/feedback/Modal';
import { NotificationFeed } from '@/components/feedback/NotificationFeed';
import { Tooltip, TooltipProvider } from '@/components/feedback/Tooltip';

export default function FeedbackPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', message: 'AAPL order filled: 100 @ 187.42', timestamp: Date.now() - 60000, action: 'View' },
    { id: '2', message: 'MSFT price alert: crossed $380', timestamp: Date.now() - 120000 },
    { id: '3', message: 'Portfolio rebalance complete', timestamp: Date.now() - 300000 },
    { id: '4', message: 'Market close summary available', timestamp: Date.now() - 600000, action: 'Open' },
  ]);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Feedback
      </h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Notification and feedback components: toast notifications, modal dialogs, and notification feeds.
      </p>

      <Section title="Toast">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
          Toast notifications appear in the top-right corner. Stack is capped at 3 visible, auto-dismiss after 5 seconds, with variant-colored left border.
        </p>
        <ComponentDemo label="Trigger Toasts">
          <div style={{ display: 'flex', gap: 12 }}>
            <Button size="sm" onClick={() => showToast('Order filled: AAPL 100 @ 187.42', 'info')}>Info Toast</Button>
            <Button size="sm" onClick={() => showToast('Margin approaching limit', 'warning')}>Warning Toast</Button>
            <Button size="sm" onClick={() => showToast('Connection lost to exchange', 'error')}>Error Toast</Button>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Modal">
        <ComponentDemo label="Modal Dialog">
          <Button size="sm" onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Order">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Buy 100 shares of AAPL at market price?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button size="sm" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => setModalOpen(false)}>Confirm</Button>
            </div>
          </Modal>
        </ComponentDemo>
      </Section>

      <Section title="NotificationFeed">
        <ComponentDemo label="Notification Feed">
          <div style={{ height: 200 }}>
            <NotificationFeed
              notifications={notifications}
              onDismiss={(id) => setNotifications(ns => ns.filter(n => n.id !== id))}
            />
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Tooltip">
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px 0' }}>
          Text hint on hover or focus. Requires a TooltipProvider ancestor for shared delay timing (default 700ms).
        </p>
        <TooltipProvider delayDuration={300}>
          <ComponentDemo label="Basic Tooltips">
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <Tooltip content="Save current layout">
                <Button size="sm">Hover me</Button>
              </Tooltip>
              <Tooltip content="Bottom tooltip" side="bottom">
                <Button size="sm">Bottom</Button>
              </Tooltip>
              <Tooltip content="Right tooltip" side="right">
                <Button size="sm">Right</Button>
              </Tooltip>
            </div>
          </ComponentDemo>
        </TooltipProvider>
      </Section>
    </div>
  );
}
