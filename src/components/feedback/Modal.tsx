import * as Dialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';
import '../shared.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 999,
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1000,
            maxWidth: '28rem',
            width: '100%',
            background: 'var(--bg-surface)',
            borderRadius: 6,
            border: '1px solid var(--border-default)',
            padding: 24,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Dialog.Title
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              {title}
            </Dialog.Title>
            <Dialog.Close
              className="m-close"
              style={{ fontSize: 16 }}
            >
              ×
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
