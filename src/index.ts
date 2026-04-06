// Components
export * from './components';

// Hooks
export { useFlash } from './hooks/useFlash';
export { useTheme } from './hooks/useTheme';
export { useWorkspace } from './hooks/useWorkspace';

// Providers
export { ThemeProvider } from './providers/ThemeProvider';
export type { Theme } from './providers/ThemeProvider';

// Utilities
export { fmt, fmtPct, fmtK, fuzzyMatch } from './lib/format';
export type { FuzzyMatchResult } from './lib/format';

// Tokens — consumers import CSS directly: import 'meridian/tokens.css'
