import { Panel } from '@/components/layout/Panel';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { Toolbar } from '@/components/layout/Toolbar';
import { Section } from '../../components/Section';
import { ComponentDemo } from '../../components/ComponentDemo';
import { Figure } from '../../components/Figure';

export default function PanelPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}
      >
        Panel
      </h1>
      <p
        style={{
          fontSize: 15,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}
      >
        Panel composes an optional Toolbar and a scrollable content area. In FlexLayout, the panel
        title lives in the tab strip — Panel itself handles toolbar and content. Total chrome
        budget: 64px maximum.
      </p>

      <Section title="Composition">
        <ComponentDemo label="Panel with Header and Toolbar">
          <div style={{ height: 200 }}>
            <Panel
              toolbar={
                <>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: 2,
                    }}
                  >
                    Equities
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      backgroundColor: 'var(--bg-muted)',
                      borderRadius: 2,
                    }}
                  >
                    All Sectors
                  </span>
                </>
              }
            >
              <div style={{ padding: 12, color: 'var(--text-secondary)', fontSize: 13 }}>
                Panel content area — scrollable, fills remaining height.
              </div>
            </Panel>
          </div>
        </ComponentDemo>
      </Section>

      <Section title="Chrome Budget">
        <Figure caption="Panel Chrome Measurements">
          <div
            style={{
              height: 28,
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            PanelHeader — 28px
          </div>
          <div
            style={{
              height: 32,
              backgroundColor: 'var(--bg-surface)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            Toolbar — 32px
          </div>
          <div
            style={{
              height: 60,
              backgroundColor: 'var(--bg-base)',
              display: 'flex',
              alignItems: 'center',
              paddingLeft: 8,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}
          >
            Data Area — fills remainder
          </div>
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              margin: '8px 0 0 0',
            }}
          >
            Total chrome: 60px (under 64px budget)
          </p>
        </Figure>
      </Section>

      <Section title="Individual Components">
        <ComponentDemo label="PanelHeader">
          <PanelHeader
            title="Instrument Details"
            actions={
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  padding: '2px 6px',
                  backgroundColor: 'var(--bg-muted)',
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
              >
                ✕
              </span>
            }
          />
        </ComponentDemo>

        <ComponentDemo label="Toolbar">
          <Toolbar>
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 2,
              }}
            >
              1D
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 2,
              }}
            >
              1W
            </span>
            <span
              style={{
                fontSize: 12,
                color: 'var(--text-secondary)',
                padding: '2px 8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 2,
              }}
            >
              1M
            </span>
          </Toolbar>
        </ComponentDemo>
      </Section>
    </div>
  );
}
