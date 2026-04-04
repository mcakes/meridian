// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DropdownMenu } from '../DropdownMenu';

afterEach(() => cleanup());

describe('DropdownMenu', () => {
  function renderMenu(itemProps?: Record<string, unknown>) {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    return {
      onEdit,
      onDelete,
      ...render(
        <DropdownMenu>
          <DropdownMenu.Trigger>
            <button>Actions</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Label>File</DropdownMenu.Label>
            <DropdownMenu.Item onSelect={onEdit} {...itemProps}>Edit</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item variant="destructive" onSelect={onDelete}>Delete</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu>,
      ),
    };
  }

  it('renders the trigger', () => {
    renderMenu();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeDefined();
  });

  it('opens on trigger click and shows items', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toBeDefined();
  });

  it('shows group labels', async () => {
    const user = userEvent.setup();
    renderMenu();
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByText('File')).toBeDefined();
  });

  it('calls onSelect when an item is clicked', async () => {
    const user = userEvent.setup();
    const { onEdit } = renderMenu();
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('renders shortcut hint when provided', async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <button>Actions</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={() => {}} shortcut="⌘E">Edit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    expect(screen.getByText('⌘E')).toBeDefined();
  });

  it('does not call onSelect for disabled items', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenu.Trigger>
          <button>Actions</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={onEdit} disabled>Edit</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>,
    );
    await user.click(screen.getByRole('button', { name: 'Actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Edit' }));
    expect(onEdit).not.toHaveBeenCalled();
  });
});
