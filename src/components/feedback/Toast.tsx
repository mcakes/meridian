import { useSyncExternalStore } from 'react';

type ToastVariant = 'info' | 'warning' | 'error';

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

let toasts: ToastItem[] = [];
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((l) => l());
}

function dismiss(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

export function showToast(
  message: string,
  variant: ToastVariant = 'info',
  duration: number = 5000,
) {
  const id = `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, message, variant }];
  if (toasts.length > 3) {
    toasts = toasts.slice(toasts.length - 3);
  }
  notify();
  setTimeout(() => dismiss(id), duration);
}

const variantBorderColor: Record<ToastVariant, string> = {
  info: 'var(--color-info)',
  warning: 'var(--color-warning)',
  error: 'var(--color-negative)',
};

export function ToastContainer() {
  const snapshot = useSyncExternalStore(
    (cb) => {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    },
    () => toasts,
  );

  if (snapshot.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {snapshot.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 4,
            borderLeft: `3px solid ${variantBorderColor[toast.variant]}`,
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            minWidth: 240,
            maxWidth: 360,
          }}
        >
          <span
            style={{
              color: 'var(--text-primary)',
              fontSize: 13,
              flex: 1,
            }}
          >
            {toast.message}
          </span>
          <button
            onClick={() => dismiss(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
