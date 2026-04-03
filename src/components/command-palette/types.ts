// src/components/command-palette/types.ts
import type { ReactNode } from 'react';

export interface Command {
  id: string;
  label: string;
  description?: string;
  category?: string;
  icon?: ReactNode;
  /** Display-only shortcut hint, e.g. "⌘T". Does not register a listener. */
  shortcut?: string;
  /** Additional terms included in fuzzy search beyond label/description. */
  keywords?: string[];
  /** Argument definitions. If present, palette enters arg-stepping mode on selection. */
  args?: ArgDefinition[];
  /** Called when the command is executed. Receives collected args if any. */
  execute: (args?: Record<string, string>) => void;
  /** Custom renderer for this command in the results list. */
  renderItem?: (props: ItemRenderProps) => ReactNode;
}

export interface ArgDefinition {
  name: string;
  label: string;
  /** Resolves available options. Receives args collected so far. */
  resolve: (context: Record<string, string>) => Promise<ArgOption[]>;
}

export interface ArgOption {
  label: string;
  value: string;
  description?: string;
}

export interface ItemRenderProps {
  command: Command;
  active: boolean;
  matchRanges: { start: number; end: number }[];
}

export interface FrequencyEntry {
  count: number;
  lastUsed: number;
}

export type FrequencyMap = Map<string, FrequencyEntry>;

export interface CommandPaletteContextValue {
  commands: Command[];
  open: () => void;
  close: () => void;
  isOpen: boolean;
  registerCommands: (commands: Command[]) => () => void;
  frequency: FrequencyMap;
  recordExecution: (commandId: string) => void;
}
