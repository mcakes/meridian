import { Section } from '../../components/Section';
import { TokenTable } from '../../components/TokenTable';
import { Citation } from '../../components/Citation';

export default function Notifications() {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Notifications</h1>
      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Constant notifications raise cognitive workload, decrease heart rate variability, and worsen accuracy.
        A tiered system with batching preserves responsiveness while cutting stress.
      </p>

      <Section title="Cognitive Workload Research">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          A hybrid lab and field study (N=120 lab, N=100 field) using NASA-TLX found that constant notifications
          significantly raised cognitive workload, decreased HRV, and worsened task accuracy. Batching notifications
          into 2 to 5 second windows preserved responsiveness while measurably reducing stress.
        </p>
      </Section>

      <Section title="Zeigarnik Effect">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          The Zeigarnik effect creates cognitive open loops when notifications are perceived but not acted on.
          Unresolved notifications occupy working memory, reducing capacity for the primary task. This means every
          notification must be either actionable (user can resolve it) or clearly passive (no action expected).
        </p>
      </Section>

      <Section title="Four-Tier Taxonomy">
        <TokenTable
          columns={['Tier', 'Urgency', 'UI', 'Dismiss', 'Examples']}
          rows={[
            ['Critical', 'Immediate', 'Modal overlay + audio', 'Explicit only', 'Risk limit breach, margin call'],
            ['Urgent', 'Seconds', 'Toast (top-right)', 'Auto + manual', 'Order fill, price alert'],
            ['Informational', 'Next moment', 'Feed entry + badge', 'User-driven', 'News, corporate actions'],
            ['Passive', 'Background', 'Dedicated panel', 'N/A', 'Market feed, order history'],
          ]}
        />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '12px 0' }}>
          Sound is reserved for the Critical tier only — habituation renders frequent sounds meaningless. Toast stack
          is capped at 3 visible; the 4th and beyond collapse to a '+N more' button.
        </p>
      </Section>

      <Section title="References">
        <Citation
          id={28}
          authors="Various"
          title="Managing Digital Notifications and Stress: Evidence from a Hybrid Laboratory and Field Study"
          source="2025"
        />
        <Citation
          id={29}
          authors="NetPsychology"
          title="The Neuroscience of Notifications: Why You Can't Ignore Them"
          url="https://netpsychology.org/the-neuroscience-of-notifications-why-you-cant-ignore-them/"
        />
      </Section>
    </div>
  );
}
