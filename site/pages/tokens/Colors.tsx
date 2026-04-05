import { Section } from '../../components/Section';
import { Figure } from '../../components/Figure';
import { TokenSwatch } from '../../components/TokenSwatch';

const categoricalRamp = [
  { name: 'blue', hex: '#7aa2f7 / #4a76c9', variable: '--color-cat-0', color: 'var(--color-cat-0)' },
  { name: 'green', hex: '#9ece6a / #4d7a1f', variable: '--color-cat-1', color: 'var(--color-cat-1)' },
  { name: 'red', hex: '#e06c75 / #c4525c', variable: '--color-cat-2', color: 'var(--color-cat-2)' },
  { name: 'teal', hex: '#41c5b0 / #32a18a', variable: '--color-cat-3', color: 'var(--color-cat-3)' },
  { name: 'orange', hex: '#ff9e64 / #c97a3e', variable: '--color-cat-4', color: 'var(--color-cat-4)' },
  { name: 'purple', hex: '#d6a0e8 / #9e6fb8', variable: '--color-cat-5', color: 'var(--color-cat-5)' },
  { name: 'cyan (ext)', hex: '#80d8e8 / #4a9fad', variable: '--color-cat-6', color: 'var(--color-cat-6)' },
  { name: 'pink (ext)', hex: '#b8608e / #9e4a75', variable: '--color-cat-7', color: 'var(--color-cat-7)' },
];

const semanticColors = [
  { name: 'positive', hex: '#9ece6a / #1e7a1e', variable: '--color-positive', color: 'var(--color-positive)' },
  { name: 'negative', hex: '#f7768e / #c93545', variable: '--color-negative', color: 'var(--color-negative)' },
  { name: 'neutral', hex: '#a9b1d6 / #6a6b7a', variable: '--color-neutral', color: 'var(--color-neutral)' },
  { name: 'warning', hex: '#e0af68 / #8f6200', variable: '--color-warning', color: 'var(--color-warning)' },
  { name: 'info', hex: '#7aa2f7 / #2e5cb8', variable: '--color-info', color: 'var(--color-info)' },
  { name: 'accent', hex: '#bb9af7 / #7c4dab', variable: '--color-accent', color: 'var(--color-accent)' },
];

const backgrounds = [
  { label: 'base', variable: 'var(--bg-base)' },
  { label: 'surface', variable: 'var(--bg-surface)' },
  { label: 'muted', variable: 'var(--bg-muted)' },
  { label: 'overlay', variable: 'var(--bg-overlay)' },
  { label: 'highlight', variable: 'var(--bg-highlight)' },
];

const textColors = [
  { name: 'primary', hex: '#c0caf5 / #1a1b26', variable: '--text-primary', color: 'var(--text-primary)' },
  { name: 'secondary', hex: '#a9b1d6 / #4a4b5c', variable: '--text-secondary', color: 'var(--text-secondary)' },
  { name: 'muted', hex: '#565f89 / #8b8c9a', variable: '--text-muted', color: 'var(--text-muted)' },
  { name: 'inverse', hex: '#1a1b26 / #f0f0f3', variable: '--text-inverse', color: 'var(--text-inverse)' },
];

const borderColors = [
  { name: 'subtle', hex: '#292e42 / #d8d8de', variable: '--border-subtle', color: 'var(--border-subtle)' },
  { name: 'default', hex: '#3b4261 / #c0c0c8', variable: '--border-default', color: 'var(--border-default)' },
  { name: 'active', hex: '#565f89 / #9a9aa8', variable: '--border-active', color: 'var(--border-active)' },
];

export default function Colors() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Color Tokens</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        All color values for both dark and light themes. Tokens are CSS custom properties switched by data-theme on the root element.
      </p>

      <Section title="Categorical Ramp">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {categoricalRamp.map((c) => (
            <TokenSwatch key={c.variable} color={c.color} name={c.name} hex={c.hex} variable={c.variable} />
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Core 6 (indices 0–5) can be used directly. Extensions (6–7) require secondary encoding (dash pattern, marker shape, or label).
        </p>
      </Section>

      <Section title="Semantic Colors">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {semanticColors.map((c) => (
            <TokenSwatch key={c.variable} color={c.color} name={c.name} hex={c.hex} variable={c.variable} />
          ))}
        </div>
      </Section>

      <Section title="Backgrounds">
        <Figure caption="Background Scale">
          <div style={{ display: 'flex' }}>
            {backgrounds.map((bg) => (
              <div
                key={bg.label}
                style={{
                  flex: 1,
                  height: 48,
                  backgroundColor: bg.variable,
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  padding: 4,
                }}
              >
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{bg.label}</span>
              </div>
            ))}
          </div>
        </Figure>
      </Section>

      <Section title="Text">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {textColors.map((c) => (
            <TokenSwatch key={c.variable} color={c.color} name={c.name} hex={c.hex} variable={c.variable} />
          ))}
        </div>
      </Section>

      <Section title="Borders">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {borderColors.map((c) => (
            <TokenSwatch key={c.variable} color={c.color} name={c.name} hex={c.hex} variable={c.variable} />
          ))}
        </div>
      </Section>
    </div>
  );
}
