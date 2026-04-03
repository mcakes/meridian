import { Section } from '@/site/components/Section';
import { TokenTable } from '@/site/components/TokenTable';

export default function Accessibility() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Accessibility</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        WCAG 2.2 AA is the baseline, not the ceiling. Redundant encoding is the default design mode, not an opt-in feature.
      </p>

      <Section title="Contrast Requirements">
        <TokenTable
          columns={['Category', 'Required Ratio', 'Notes']}
          rows={[
            ['Normal text', '4.5:1', 'All body text, values, labels'],
            ['Large text (18px+ or 14px bold)', '3:1', 'Headings, panel titles'],
            ['UI components', '3:1', 'Borders, icons, focus indicators'],
            ['Non-text content', '3:1', 'Charts, graphs, meaningful images'],
          ]}
        />
      </Section>

      <Section title="Redundant Encoding">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Redundant encoding is the default — not an accessibility add-on. Every semantic signal uses multiple channels:
        </p>
        <TokenTable
          columns={['Signal', 'Color', 'Shape', 'Text']}
          rows={[
            ['Positive', 'var(--color-positive)', '▲ arrow', "'+ prefix"],
            ['Negative', 'var(--color-negative)', '▼ arrow', "'− prefix"],
            ['Neutral', 'var(--color-neutral)', '— dash', 'No prefix'],
            ['Warning', 'var(--color-warning)', 'Warning icon', 'Contextual label'],
            ['Categories ≤6', 'Categorical ramp', 'None needed', 'None needed'],
            ['Categories 7–8', 'Extension colors', 'Dash/marker shape', 'Mandatory label'],
          ]}
        />
      </Section>

      <Section title="Color Vision Deficiency Safety">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Minimum ΔE of 12 or more under deuteranopia simulation (Viénot 1999 matrix). When hue collapses under CVD,
          lightness separation (L*) is the primary mitigation. For example, red (L*=60) versus orange (L*=74) gives
          ΔE of 16.3 even under full deuteranopia.
        </p>
      </Section>

      <Section title="Motion and Animation">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          All animations respect prefers-reduced-motion. When reduced motion is preferred: flash animations are
          disabled, directional micro-animations are disabled, toast slide-ins are disabled, panel resize transitions
          become immediate, and hover transitions become instant.
        </p>
      </Section>

      <Section title="Radix UI Primitives">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Meridian uses Radix UI for the primitive layer: Dialog, Popover, DropdownMenu, Tabs, Tooltip, Select,
          ScrollArea. These provide WAI-ARIA implementations, focus management, and keyboard interaction patterns
          out of the box.
        </p>
      </Section>

      <Section title="Focus Indication">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Focus ring is implemented as box-shadow: 0 0 0 2px var(--color-info). Using box-shadow instead of border
          avoids layout shift. The focus ring must achieve 3:1 contrast against the surface background.
        </p>
      </Section>
    </div>
  );
}
