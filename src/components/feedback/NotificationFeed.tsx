interface Notification {
  id: string;
  message: string;
  timestamp: number;
  action?: string;
}

interface NotificationFeedProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationFeed({ notifications, onDismiss }: NotificationFeedProps) {
  if (notifications.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--text-muted)',
          fontSize: 13,
        }}
      >
        No notifications
      </div>
    );
  }

  return (
    <div
      style={{
        overflowY: 'auto',
        maxHeight: '100%',
      }}
    >
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 0',
            borderTop: index > 0 ? '1px solid var(--border-subtle)' : 'none',
          }}
        >
          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: 11,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formatTime(notification.timestamp)}
          </span>
          <span
            style={{
              color: 'var(--text-primary)',
              fontSize: 12,
              flex: 1,
            }}
          >
            {notification.message}
          </span>
          {notification.action && (
            <span
              style={{
                color: 'var(--color-info)',
                fontSize: 12,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {notification.action}
            </span>
          )}
          <button
            onClick={() => onDismiss(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 14,
              lineHeight: 1,
              padding: 0,
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
