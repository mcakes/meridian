# Notifications

Notifications in a trading application are not a secondary concern. Price alerts, order fills, risk limit warnings, and news events all compete for attention in an environment where the primary work is already cognitively demanding. A poorly designed notification system imposes a measurable cost on performance and wellbeing.

---

## The Research: Cognitive Load and HRV

A [hybrid laboratory and field study (2025)](https://www.researchgate.net/publication/396180740_Managing_Digital_Notifications_and_Stress_Evidence_from_a_Hybrid_Laboratory_and_Field_Study_on_Cognitive_Load_HRV_and_Well-being) examined the effects of notification frequency on knowledge workers under realistic task conditions. Key findings:

- **N = 120 (lab), N = 100 (field)**
- Constant notifications raised cognitive workload as measured by the NASA Task Load Index (NASA-TLX)
- Heart rate variability (HRV) decreased under high notification load — a physiological marker of elevated stress
- Task accuracy worsened under constant notification conditions
- **Batching notifications** — delivering them in grouped intervals rather than immediately — preserved responsiveness to important events while significantly reducing stress and workload scores

The study did not find that traders should receive fewer notifications overall. It found that the timing and grouping of notifications determines their cognitive cost more than their raw volume.

---

## The Zeigarnik Effect: Open Loops

The [Zeigarnik effect](https://netpsychology.org/the-neuroscience-of-notifications-why-you-cant-ignore-them/) describes the psychological phenomenon where incomplete tasks occupy working memory disproportionately compared to completed ones. Bluma Zeigarnik's original research (1927) found that waiters remembered orders they hadn't yet delivered in greater detail than orders they had — the incomplete task remained "open" in memory until resolved.

Applied to notifications: a notification that is perceived but not acted on creates a cognitive open loop. The user registers that something happened, but has not resolved what it means or what to do about it. This loop consumes working memory until closed — either by acting on the notification or by the notification becoming irrelevant.

Meridian's design implication: notifications must either be actionable (with a clear resolution path) or passive (clearly marked as informational with no expected response). Notifications that occupy the space between — urgent in presentation but not clearly actionable — are the most cognitively costly category.

---

## Four-Tier Taxonomy

Meridian organizes all notifications into four tiers based on urgency and required response:

### Critical — Immediate, Undismissable

| Property | Value |
|----------|-------|
| UI | Modal overlay (blocks interaction) or audio alert |
| Dismiss | Explicit user action only |
| Examples | Risk limit breach, margin call, system failure |

Critical notifications block the interface until acknowledged. This is intentional: a risk limit breach requires a decision, not an optional glance. The cognitive cost of the modal is less than the cost of a critical event being scrolled past in a notification feed.

Sound is used for critical notifications only. Frequent use of audio alerts habituates users and causes them to treat all sounds as background noise.

### Urgent — Self-Dismissing Toast

| Property | Value |
|----------|-------|
| UI | Toast notification (top-right), unread badge count |
| Dismiss | Self-dismissing after a configurable duration; manually dismissable |
| Examples | Order fill, price alert trigger, approaching limit |

Urgent notifications warrant immediate awareness but not immediate action. The toast format satisfies awareness without blocking work.

**Toast stack limit: 3 visible.** When more than 3 urgent notifications are pending, the oldest visible toast collapses to "+N more" and opens the notification panel on click. This prevents the notification stack from growing to obscure data — a particularly harmful failure mode in a trading context.

### Informational — Silent Feed Entry

| Property | Value |
|----------|-------|
| UI | Feed entry in notification panel, unread count badge |
| Dismiss | User-driven; marking as read, or clearing the panel |
| Examples | News headlines, corporate actions, scheduled event reminders |

Informational notifications do not interrupt the current task. They accumulate in the notification panel and are reviewed when the user chooses. The unread count badge provides awareness without interruption.

### Passive — Dedicated Panel

| Property | Value |
|----------|-------|
| UI | Dedicated data panel (e.g., news feed, audit log) |
| Dismiss | Not applicable — always visible within its panel |
| Examples | Market data feed, order history, system logs |

Passive notifications are structural — they represent data streams rather than discrete events. They live in their own panel and are consulted rather than received.

---

## Batching

For Urgent and Informational tiers, Meridian supports configurable batching: accumulate events over a short window (2–5 seconds) and deliver them as a grouped notification rather than as individual toasts. The 2025 study found that batching was the most effective mechanism for reducing cognitive load while preserving responsiveness to time-sensitive events.

Batching configuration is per-notification-type. Price alerts at the Urgent tier might batch at 2 seconds; news headlines at the Informational tier might batch at 30 seconds.

---

## Implementation Rules

- Sound for Critical tier only
- Toast stack: 3 visible maximum; overflow collapses to "+N more"
- Notification panel is always accessible from the toolbar — never forced into view
- Per-instrument alert configuration: traders configure which instruments trigger which tiers
- Notifications respect `prefers-reduced-motion`: no slide animations when the OS setting is active
- The notification panel is filterable by tier, instrument, and time range

---

## References

- [Notification batching study (2025). "Managing Digital Notifications and Stress: Evidence from a Hybrid Laboratory and Field Study on Cognitive Load, HRV, and Well-being."](https://www.researchgate.net/publication/396180740_Managing_Digital_Notifications_and_Stress_Evidence_from_a_Hybrid_Laboratory_and_Field_Study_on_Cognitive_Load_HRV_and_Well-being)
- [Zeigarnik effect and notifications.](https://netpsychology.org/the-neuroscience-of-notifications-why-you-cant-ignore-them/)
- [Sweller, J. (1988). "Cognitive Load During Problem Solving." *Cognitive Science*, 12(2).](https://www.tandfonline.com/doi/abs/10.1207/s15516709cog1202_4)
