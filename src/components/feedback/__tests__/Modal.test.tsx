// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

afterEach(() => cleanup());

describe('Modal', () => {
  it('renders title and children when open', () => {
    render(
      <Modal open onClose={() => {}} title="Confirm">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.getByText('Confirm')).toBeDefined();
    expect(screen.getByText('Are you sure?')).toBeDefined();
  });

  it('does not render content when closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Confirm">
        <p>Are you sure?</p>
      </Modal>,
    );
    expect(screen.queryByText('Confirm')).toBeNull();
    expect(screen.queryByText('Are you sure?')).toBeNull();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(
      <Modal open onClose={onClose} title="Confirm">
        <p>Are you sure?</p>
      </Modal>,
    );
    await user.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
