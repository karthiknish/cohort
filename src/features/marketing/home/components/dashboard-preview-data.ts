import { Bot, BriefcaseBusiness, LayoutDashboard, type LucideIcon } from 'lucide-react'

export type PreviewTone = 'primary' | 'accent' | 'info' | 'success' | 'warning'

export type PreviewBar = {
  id: string
  label: string
  heightClass: string
  emphasized?: boolean
}

export type PreviewMetric = {
  id: string
  label: string
  value: string
  delta: string
  tone: PreviewTone
  detail: string
  focusLabel: string
  focusItems: readonly string[]
  bars: readonly PreviewBar[]
}

export type PreviewQueueItem = {
  id: string
  title: string
  meta: string
  stage: string
  tone: PreviewTone
}

export type PreviewActivityItem = {
  id: string
  label: string
  meta: string
}

export type PreviewView = {
  id: 'overview' | 'automation' | 'clients'
  label: string
  eyebrow: string
  summary: string
  status: string
  Icon: LucideIcon
  metrics: readonly PreviewMetric[]
  queue: readonly PreviewQueueItem[]
  agentTitle: string
  agentSummary: string
  agentItems: readonly PreviewActivityItem[]
}

export const DASHBOARD_VIEWS = [
  {
    id: 'overview',
    label: 'Overview',
    eyebrow: 'Agency pulse',
    summary: 'A compact command board for launches, client commitments, and next actions that need a human decision.',
    status: 'Live board',
    Icon: LayoutDashboard,
    metrics: [
      {
        id: 'delivery-velocity',
        label: 'Delivery velocity',
        value: '86%',
        delta: '+8%',
        tone: 'success',
        detail: 'Four active launches are ahead of schedule and one handoff needs owner attention before noon.',
        focusLabel: 'What is driving the pace',
        focusItems: ['4 projects are ahead of plan', '1 blocked review needs approval', '2 client replies are waiting in queue'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[42%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[56%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[51%]' },
          { id: 'thu', label: 'T', heightClass: 'h-[67%]', emphasized: true },
          { id: 'fri', label: 'F', heightClass: 'h-[61%]' },
          { id: 'sat', label: 'S', heightClass: 'h-[72%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[64%]' },
        ],
      },
      {
        id: 'revenue-at-risk',
        label: 'Revenue at risk',
        value: '$18k',
        delta: '-3%',
        tone: 'warning',
        detail: 'Two renewal conversations need follow-up before Friday so the finance handoff does not slip into next week.',
        focusLabel: 'Where the exposure sits',
        focusItems: ['Apex scope add-on is awaiting sign-off', 'BlueWave renewal call needs a recap today', 'One upsell path is blocked on performance notes'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[58%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[52%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[63%]', emphasized: true },
          { id: 'thu', label: 'T', heightClass: 'h-[48%]' },
          { id: 'fri', label: 'F', heightClass: 'h-[54%]' },
          { id: 'sat', label: 'S', heightClass: 'h-[46%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[41%]' },
        ],
      },
      {
        id: 'meeting-load',
        label: 'Meeting load',
        value: '12',
        delta: 'Today',
        tone: 'info',
        detail: 'Reporting, kickoff, and strategy rooms are sequenced against project milestones so no client thread gets lost.',
        focusLabel: 'How the day is stacked',
        focusItems: ['3 client reviews are bundled before lunch', '2 internal standups share the same prep pack', 'Calendar holds are tied to launch milestones'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[31%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[44%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[57%]' },
          { id: 'thu', label: 'T', heightClass: 'h-[69%]', emphasized: true },
          { id: 'fri', label: 'F', heightClass: 'h-[66%]' },
          { id: 'sat', label: 'S', heightClass: 'h-[38%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[29%]' },
        ],
      },
    ],
    queue: [
      { id: 'apex-brief', title: 'Apex launch brief', meta: 'Proposal sent · waiting on pricing sign-off', stage: 'Proposal', tone: 'warning' },
      { id: 'bluewave-report', title: 'BlueWave weekly report', meta: 'Analytics deck is ready for the 3pm client review', stage: 'Review', tone: 'info' },
      { id: 'novex-kickoff', title: 'Novex kickoff room', meta: 'Prep notes and invite sequence already drafted', stage: 'Meetings', tone: 'success' },
    ],
    agentTitle: 'The board keeps the next move visible',
    agentSummary: 'This mini workspace compresses delivery, pipeline, and meetings into one surface so you can inspect the pulse before opening the full dashboard.',
    agentItems: [
      { id: 'overview-1', label: 'Client recap drafted', meta: 'Apex · 2 min ago' },
      { id: 'overview-2', label: 'Budget drift highlighted', meta: 'BlueWave · awaiting review' },
      { id: 'overview-3', label: 'Kickoff checklist assembled', meta: 'Novex · ready to send' },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    eyebrow: 'Agent mode',
    summary: 'Autonomous work stays compact here: follow-ups, summaries, and anomalies flow in without turning the hero into a static mockup.',
    status: '4 flows running',
    Icon: Bot,
    metrics: [
      {
        id: 'follow-ups-queued',
        label: 'Follow-ups queued',
        value: '27',
        delta: '+11',
        tone: 'accent',
        detail: 'Client reminders, proposal nudges, and internal task prompts are staged and ready to review before sending.',
        focusLabel: 'What the agents are preparing',
        focusItems: ['8 proposal nudges are ready to send', '11 task reminders are scheduled this afternoon', '3 client notes were bundled into one recap'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[28%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[41%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[53%]' },
          { id: 'thu', label: 'T', heightClass: 'h-[74%]', emphasized: true },
          { id: 'fri', label: 'F', heightClass: 'h-[66%]' },
          { id: 'sat', label: 'S', heightClass: 'h-[49%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[44%]' },
        ],
      },
      {
        id: 'summaries-drafted',
        label: 'Summaries drafted',
        value: '14',
        delta: 'Ready',
        tone: 'success',
        detail: 'Meeting recaps and analytics snapshots are staged in one place so the team can skim before they go out.',
        focusLabel: 'Where summaries are landing',
        focusItems: ['5 meeting recaps are in review', '4 analytics digests have fresh metrics', '2 project updates were merged into one client note'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[36%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[52%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[59%]' },
          { id: 'thu', label: 'T', heightClass: 'h-[68%]' },
          { id: 'fri', label: 'F', heightClass: 'h-[73%]', emphasized: true },
          { id: 'sat', label: 'S', heightClass: 'h-[46%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[33%]' },
        ],
      },
      {
        id: 'anomalies-flagged',
        label: 'Anomalies flagged',
        value: '3',
        delta: 'Needs review',
        tone: 'warning',
        detail: 'Pacing drift, attribution mismatches, and stale proposal steps are surfaced as compact interventions rather than noisy alerts.',
        focusLabel: 'Signals waiting on a human',
        focusItems: ['LinkedIn pacing is drifting above target', 'One attribution feed missed yesterday’s sync', 'A proposal thread has been quiet for 4 days'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[22%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[35%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[63%]', emphasized: true },
          { id: 'thu', label: 'T', heightClass: 'h-[31%]' },
          { id: 'fri', label: 'F', heightClass: 'h-[47%]' },
          { id: 'sat', label: 'S', heightClass: 'h-[25%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[19%]' },
        ],
      },
    ],
    queue: [
      { id: 'summary-pack', title: 'Morning summary pack', meta: 'Bundled ads, meetings, and tasks into one client-facing note', stage: 'Drafted', tone: 'accent' },
      { id: 'linkedin-alert', title: 'LinkedIn pacing alert', meta: 'Spend is above guardrail and queued for review', stage: 'Escalated', tone: 'warning' },
      { id: 'renewal-follow-up', title: 'Renewal follow-up', meta: 'Draft is personalized and waiting on approval', stage: 'Queued', tone: 'success' },
    ],
    agentTitle: 'Agents run in the background, not in your way',
    agentSummary: 'The mini surface mirrors Cursor’s compact interactivity by letting you inspect autonomous work without opening another page or modal.',
    agentItems: [
      { id: 'automation-1', label: 'Follow-up drafted for BlueWave', meta: 'Queued · 1 min ago' },
      { id: 'automation-2', label: 'Meeting recap merged into project thread', meta: 'Published · 6 min ago' },
      { id: 'automation-3', label: 'Pacing anomaly tagged for review', meta: 'Escalated · 10 min ago' },
    ],
  },
  {
    id: 'clients',
    label: 'Client Pulse',
    eyebrow: 'Account focus',
    summary: 'A tighter client lane that shows satisfaction, expansion potential, and risk before the next call or review.',
    status: '3 workspaces hot',
    Icon: BriefcaseBusiness,
    metrics: [
      {
        id: 'satisfaction',
        label: 'Satisfaction',
        value: '94%',
        delta: '+6%',
        tone: 'success',
        detail: 'Recent reporting cycles landed cleanly and client response time has shortened across the highest-value accounts.',
        focusLabel: 'Why accounts feel healthy',
        focusItems: ['Reporting turned around inside one working day', 'Meeting notes are reaching clients faster', 'Open tasks now map cleanly to account owners'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[46%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[54%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[63%]' },
          { id: 'thu', label: 'T', heightClass: 'h-[72%]', emphasized: true },
          { id: 'fri', label: 'F', heightClass: 'h-[77%]' },
          { id: 'sat', label: 'S', heightClass: 'h-[59%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[51%]' },
        ],
      },
      {
        id: 'expansions',
        label: 'Expansion paths',
        value: '5',
        delta: 'Open',
        tone: 'accent',
        detail: 'Proposal momentum is strongest where recent performance gains are already visible inside the account.',
        focusLabel: 'Where growth can happen next',
        focusItems: ['2 retainers are ready for scope expansion', '1 client asked for a quarterly planning pack', '2 cross-sell notes are drafted and ready'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[32%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[47%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[58%]' },
          { id: 'thu', label: 'T', heightClass: 'h-[64%]' },
          { id: 'fri', label: 'F', heightClass: 'h-[70%]', emphasized: true },
          { id: 'sat', label: 'S', heightClass: 'h-[45%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[37%]' },
        ],
      },
      {
        id: 'risks',
        label: 'Accounts at risk',
        value: '2',
        delta: 'Watch',
        tone: 'warning',
        detail: 'Only a small slice of accounts need attention, but surfacing them early keeps the preview useful rather than decorative.',
        focusLabel: 'What needs attention first',
        focusItems: ['One reporting deck missed its first review window', 'A paid social account has pacing drift', 'A renewal conversation needs clearer next steps'],
        bars: [
          { id: 'mon', label: 'M', heightClass: 'h-[18%]' },
          { id: 'tue', label: 'T', heightClass: 'h-[28%]' },
          { id: 'wed', label: 'W', heightClass: 'h-[39%]' },
          { id: 'thu', label: 'T', heightClass: 'h-[61%]', emphasized: true },
          { id: 'fri', label: 'F', heightClass: 'h-[43%]' },
          { id: 'sat', label: 'S', heightClass: 'h-[24%]' },
          { id: 'sun', label: 'S', heightClass: 'h-[16%]' },
        ],
      },
    ],
    queue: [
      { id: 'mia-note', title: 'TechCorp pulse check', meta: 'Client health is strong and expansion copy is drafted', stage: 'Healthy', tone: 'success' },
      { id: 'retail-renewal', title: 'Retail Store renewal', meta: 'Recap needs a sharper next-step recommendation', stage: 'Watch', tone: 'warning' },
      { id: 'stratsoft-review', title: 'StratSoft Q2 review', meta: 'Performance story is ready for tomorrow’s call', stage: 'Ready', tone: 'info' },
    ],
    agentTitle: 'Client context stays one click away',
    agentSummary: 'The compact dashboard switches into account mode so the hero feels demonstrably useful instead of just visually dense.',
    agentItems: [
      { id: 'clients-1', label: 'Health score refreshed for TechCorp', meta: 'Updated · just now' },
      { id: 'clients-2', label: 'Renewal brief queued for Retail Store', meta: 'Pending review' },
      { id: 'clients-3', label: 'Expansion path drafted for StratSoft', meta: 'Ready to send' },
    ],
  },
] as const satisfies readonly PreviewView[]

export const PREVIEW_VIEW_IDS = new Set<string>(DASHBOARD_VIEWS.map((view) => view.id))

export const TONE_BADGE_CLASSES = {
  primary: 'border-border/70 bg-background text-foreground',
  accent: 'border-border/70 bg-background text-accent',
  info: 'border-border/70 bg-background text-info',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
} as const satisfies Record<PreviewTone, string>

export const TONE_DOT_CLASSES = {
  primary: 'bg-foreground/55',
  accent: 'bg-accent',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
} as const satisfies Record<PreviewTone, string>

export const EMPHASIZED_BAR_CLASSES = {
  primary: 'bg-foreground/65',
  accent: 'bg-accent/70',
  info: 'bg-info/70',
  success: 'bg-success/80',
  warning: 'bg-warning/80',
} as const satisfies Record<PreviewTone, string>

export const INITIAL_VIEW_ID = DASHBOARD_VIEWS[0].id
export const INITIAL_METRIC_ID = DASHBOARD_VIEWS[0].metrics[0].id

export function isPreviewViewId(value: string | undefined): value is PreviewView['id'] {
  if (!value) {
    return false
  }

  return PREVIEW_VIEW_IDS.has(value)
}

export function findPreviewView(viewId: PreviewView['id']) {
  return DASHBOARD_VIEWS.find((view) => view.id === viewId) ?? DASHBOARD_VIEWS[0]
}

export function getNextPreviewViewId(currentViewId: PreviewView['id']): PreviewView['id'] {
  const currentIndex = DASHBOARD_VIEWS.findIndex((view) => view.id === currentViewId)
  if (currentIndex === -1 || currentIndex === DASHBOARD_VIEWS.length - 1) {
    return DASHBOARD_VIEWS[0].id
  }

  return DASHBOARD_VIEWS[currentIndex + 1]?.id ?? DASHBOARD_VIEWS[0].id
}

export function resetSurfaceTransform(node: HTMLDivElement | null) {
  if (!node) {
    return
  }

  node.style.transform = ''
}

export function applySurfaceTransform(node: HTMLDivElement | null, rotateX: number, rotateY: number) {
  if (!node) {
    return
  }

  node.style.transform = `translate3d(0, -6px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
}
