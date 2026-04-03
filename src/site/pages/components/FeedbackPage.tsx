import { useState } from 'react';
import { Section } from '@/site/components/Section';
import { ComponentDemo } from '@/site/components/ComponentDemo';
import { showToast } from '@/components/feedback/Toast';
import { Modal } from '@/components/feedback/Modal';
import { NotificationFeed } from '@/components/feedback/NotificationFeed';

const buttonStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-muted)',
  border: '1px solid var(--border-default)',
  color: 'var(--text-primary)',
  fontSize: 12,
  padding: '6px 12px',
  borderRadius: 2,
  cursor: 'pointer',
};

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
            <button onClick={() => showToast('Order filled: AAPL 100 @ 187.42', 'info')} style={buttonStyle}>Info Toast</button>
            <button onClick={() => showToast('Margin approaching limit', 'warning')} style={buttonStyle}>Warning Toast</button>
            <button onClick={() => showToast('Connection lost to exchange', 'error')} style={buttonStyle}>Error Toast</button>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Modal">
        <ComponentDemo label="Modal Dialog">
          <button onClick={() => setModalOpen(true)} style={buttonStyle}>Open Modal</button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Confirm Order">
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
              Buy 100 shares of AAPL at market price?
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setModalOpen(false)} style={buttonStyle}>Cancel</button>
              <button onClick={() => setModalOpen(false)} style={{ ...buttonStyle, backgroundColor: 'var(--color-info)', color: '#fff', border: 'none' }}>Confirm</button>
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
    </div>
  );
}
