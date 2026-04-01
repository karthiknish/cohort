'use client'

import {
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'
import { startTransition, useCallback, useMemo, useState, type MouseEvent } from 'react'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Shared types                                                       */
/* ------------------------------------------------------------------ */

type Tone = 'success' | 'warning' | 'info' | 'accent'
type TabId = 'overview' | 'proposals' | 'clients' | 'meetings' | 'agent'

type Tab = {
  id: TabId
  Icon: LucideIcon
  label: string
  eyebrow: string
  status: string
  agentItems: readonly { id: string; text: string; time: string }[]
}

const TONE_BADGE: Record<Tone, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-info/30 bg-info/10 text-info',
  accent: 'border-accent/30 bg-accent/15 text-accent',
}

/* ------------------------------------------------------------------ */
/*  Tab registry                                                       */
/* ------------------------------------------------------------------ */

const TABS: readonly Tab[] = [
  {
    id: 'overview',
    Icon: LayoutDashboard,
    label: 'Overview',
    eyebrow: 'Agency pulse',
    status: 'Live board',
    agentItems: [
      { id: 'a1', text: 'Client recap drafted for Apex', time: '2 min ago' },
      { id: 'a2', text: 'Budget drift flagged · BlueWave', time: '6 min ago' },
      { id: 'a3', text: 'Kickoff checklist assembled', time: '12 min ago' },
    ],
  },
  {
    id: 'proposals',
    Icon: FileText,
    label: 'Proposals',
    eyebrow: 'AI proposals',
    status: '7 active',
    agentItems: [
      { id: 'a1', text: 'NovaTech Q3 proposal drafted', time: 'just now' },
      { id: 'a2', text: 'Pricing section updated auto', time: '4 min ago' },
      { id: 'a3', text: 'Apex proposal sent to client', time: '18 min ago' },
    ],
  },
  {
    id: 'clients',
    Icon: Users,
    label: 'Clients',
    eyebrow: 'Account focus',
    status: '12 active',
    agentItems: [
      { id: 'a1', text: 'Health score refreshed · NovaTech', time: 'just now' },
      { id: 'a2', text: 'Renewal brief queued · Meridian', time: 'pending' },
      { id: 'a3', text: 'Expansion path drafted · BlueOrbit', time: 'ready' },
    ],
  },
  {
    id: 'meetings',
    Icon: CalendarClock,
    label: 'Meetings',
    eyebrow: 'Schedule',
    status: '3 today',
    agentItems: [
      { id: 'a1', text: 'Apex kickoff brief prepared', time: 'ready' },
      { id: 'a2', text: 'BlueOrbit review notes generated', time: '2 min ago' },
      { id: 'a3', text: 'Standup recap auto-published', time: '20 min ago' },
    ],
  },
  {
    id: 'agent',
    Icon: Bot,
    label: 'Agent',
    eyebrow: 'Agent mode',
    status: '4 flows running',
    agentItems: [
      { id: 'a1', text: 'Follow-up sequence triggered', time: '1 min ago' },
      { id: 'a2', text: 'Meeting recap merged into thread', time: '6 min ago' },
      { id: 'a3', text: 'Pacing anomaly escalated', time: '10 min ago' },
    ],
  },
] as const

const SIDEBAR_EXTRA: readonly { id: string; Icon: LucideIcon }[] = [
  { id: 'analytics', Icon: BarChart3 },
  { id: 'messages', Icon: MessageSquare },
  { id: 'settings', Icon: Settings },
]

/* ------------------------------------------------------------------ */
/*  Panel data — Overview                                              */
/* ------------------------------------------------------------------ */

type BarDatum = { id: string; h: string; accent?: boolean }

type OverviewMetric = {
  id: string
  label: string
  value: string
  delta: string
  tone: Tone
  chartLabel: string
  bars: readonly BarDatum[]
}

const OVERVIEW_METRICS: readonly OverviewMetric[] = [
  {
    id: 'delivery',
    label: 'Delivery',
    value: '86%',
    delta: '+8%',
    tone: 'success',
    chartLabel: 'Delivery velocity',
    bars: [
      { id: 'b1', h: 'h-[38%]' }, { id: 'b2', h: 'h-[52%]' }, { id: 'b3', h: 'h-[46%]' },
      { id: 'b4', h: 'h-[68%]', accent: true }, { id: 'b5', h: 'h-[58%]' },
      { id: 'b6', h: 'h-[72%]' }, { id: 'b7', h: 'h-[62%]' },
    ],
  },
  {
    id: 'revenue',
    label: 'Revenue risk',
    value: '$18k',
    delta: '-3%',
    tone: 'warning',
    chartLabel: 'Revenue at risk',
    bars: [
      { id: 'b1', h: 'h-[58%]' }, { id: 'b2', h: 'h-[52%]' }, { id: 'b3', h: 'h-[63%]', accent: true },
      { id: 'b4', h: 'h-[48%]' }, { id: 'b5', h: 'h-[54%]' }, { id: 'b6', h: 'h-[46%]' }, { id: 'b7', h: 'h-[41%]' },
    ],
  },
  {
    id: 'meetings',
    label: 'Meetings',
    value: '12',
    delta: 'Today',
    tone: 'info',
    chartLabel: 'Meeting load',
    bars: [
      { id: 'b1', h: 'h-[31%]' }, { id: 'b2', h: 'h-[44%]' }, { id: 'b3', h: 'h-[57%]' },
      { id: 'b4', h: 'h-[69%]', accent: true }, { id: 'b5', h: 'h-[66%]' },
      { id: 'b6', h: 'h-[38%]' }, { id: 'b7', h: 'h-[29%]' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Panel data — Proposals                                             */
/* ------------------------------------------------------------------ */

const PROPOSAL_STAGES: readonly { id: string; label: string; count: number; tone: Tone }[] = [
  { id: 's1', label: 'Draft', count: 3, tone: 'info' },
  { id: 's2', label: 'Review', count: 2, tone: 'warning' },
  { id: 's3', label: 'Sent', count: 4, tone: 'accent' },
  { id: 's4', label: 'Accepted', count: 3, tone: 'success' },
]

const PROPOSALS: readonly { id: string; title: string; stage: string; tone: Tone; value: string }[] = [
  { id: 'p1', title: 'Apex Technologies Q3 pitch', stage: 'Sent', tone: 'accent', value: '$14.5K' },
  { id: 'p2', title: 'BlueOrbit brand refresh', stage: 'Review', tone: 'warning', value: '$8.2K' },
  { id: 'p3', title: 'Meridian Health retainer', stage: 'Accepted', tone: 'success', value: '$22K' },
]

/* ------------------------------------------------------------------ */
/*  Panel data — Clients                                               */
/* ------------------------------------------------------------------ */

const CLIENT_ACCOUNTS: readonly {
  id: string; initials: string; name: string; tag: string
  health: number; revenue: string; tone: Tone; color: string
}[] = [
  { id: 'c1', initials: 'NT', name: 'NovaTech Digital', tag: 'SaaS', health: 94, revenue: '$12.4K', tone: 'success', color: 'bg-blue-500' },
  { id: 'c2', initials: 'BO', name: 'BlueOrbit Media', tag: 'E-commerce', health: 71, revenue: '$8.6K', tone: 'accent', color: 'bg-sky-500' },
  { id: 'c3', initials: 'MH', name: 'Meridian Health', tag: 'Healthcare', health: 52, revenue: '$9.1K', tone: 'warning', color: 'bg-emerald-500' },
]

/* ------------------------------------------------------------------ */
/*  Panel data — Meetings                                              */
/* ------------------------------------------------------------------ */

type NoteStatus = 'ready' | 'active' | 'upcoming'

const MEETING_ITEMS: readonly {
  id: string; timeHour: string; timeAmPm: string; title: string
  attendees: readonly string[]; type: string; tone: Tone
  note: string; noteStatus: NoteStatus
}[] = [
  {
    id: 'm1', timeHour: '10:00', timeAmPm: 'AM', title: 'Apex Q3 kickoff',
    attendees: ['JL', 'SR', 'KP'], type: 'Kickoff', tone: 'accent',
    note: 'Brief ready', noteStatus: 'ready',
  },
  {
    id: 'm2', timeHour: '2:00', timeAmPm: 'PM', title: 'BlueOrbit weekly review',
    attendees: ['MA', 'DW', 'JL'], type: 'Review', tone: 'info',
    note: 'In progress', noteStatus: 'active',
  },
  {
    id: 'm3', timeHour: '4:30', timeAmPm: 'PM', title: 'Internal standup',
    attendees: ['SR', 'KP', 'MA', 'DW'], type: 'Internal', tone: 'info',
    note: 'Upcoming', noteStatus: 'upcoming',
  },
]

const ATTENDEE_COLORS: Record<string, string> = {
  JL: 'bg-violet-500', SR: 'bg-blue-500', KP: 'bg-emerald-500',
  MA: 'bg-amber-500', DW: 'bg-rose-500',
}

/* ------------------------------------------------------------------ */
/*  Panel data — Agent                                                 */
/* ------------------------------------------------------------------ */

const AGENT_FLOWS: readonly { id: string; label: string; status: string; tone: Tone }[] = [
  { id: 'f1', label: 'Client follow-up sequences', status: 'Running', tone: 'success' },
  { id: 'f2', label: 'Proposal nudges & reminders', status: 'Running', tone: 'success' },
  { id: 'f3', label: 'Budget anomaly detection', status: 'Active', tone: 'accent' },
  { id: 'f4', label: 'Meeting recap publisher', status: 'Queued', tone: 'info' },
]

const AGENT_RECENT: readonly { id: string; text: string; time: string; tone: Tone }[] = [
  { id: 'r1', text: 'NovaTech follow-up drafted & queued', time: '1 min ago', tone: 'success' },
  { id: 'r2', text: 'LinkedIn spend anomaly flagged (+18%)', time: '6 min ago', tone: 'warning' },
  { id: 'r3', text: 'BlueOrbit meeting recap published', time: '10 min ago', tone: 'accent' },
]

/* ------------------------------------------------------------------ */
/*  Content panels                                                     */
/* ------------------------------------------------------------------ */

function OverviewPanel({
  activeMetricId,
  onMetricClick,
}: {
  activeMetricId: string
  onMetricClick: (e: MouseEvent<HTMLButtonElement>) => void
}) {
  const metric = OVERVIEW_METRICS.find((m) => m.id === activeMetricId) ?? OVERVIEW_METRICS[0]!

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        {OVERVIEW_METRICS.map((m) => {
          const isActive = m.id === activeMetricId
          return (
            <button
              key={m.id}
              type="button"
              data-metric-id={m.id}
              aria-pressed={isActive}
              onClick={onMetricClick}
              className={cn(
                'rounded-xl border px-3 py-2.5 text-left transition-colors',
                isActive
                  ? cn('border-transparent bg-muted/90', TONE_BADGE[m.tone])
                  : 'border-border/40 bg-muted/20 hover:bg-muted/40',
              )}
            >
              <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">{m.label}</p>
              <div className="mt-1.5 flex items-end justify-between gap-2">
                <span className="text-lg font-semibold text-foreground">{m.value}</span>
                <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', TONE_BADGE[m.tone])}>{m.delta}</span>
              </div>
            </button>
          )
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">{metric.chartLabel}</p>
            <TrendingUp className="h-3 w-3 text-muted-foreground/40" />
          </div>
          <div className="flex h-20 items-end gap-[5px]">
            {metric.bars.map((bar) => (
              <div
                key={bar.id}
                className={cn('flex-1 rounded-t-md transition-[height,background-color] duration-300', bar.h, bar.accent ? 'bg-accent' : 'bg-primary/10')}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
          <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">Needs attention</p>
          <div className="space-y-2">
            {[
              { id: 'q1', title: 'Apex launch brief', tag: 'Proposal', tone: 'warning' as Tone },
              { id: 'q2', title: 'BlueWave weekly report', tag: 'Review', tone: 'info' as Tone },
              { id: 'q3', title: 'Novex kickoff room', tag: 'Meeting', tone: 'success' as Tone },
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/60 px-2.5 py-2">
                <span className="text-[11px] font-medium text-foreground/80">{item.title}</span>
                <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', TONE_BADGE[item.tone])}>{item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProposalsPanel() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {PROPOSAL_STAGES.map((stage) => (
          <div key={stage.id} className={cn('rounded-xl border px-2.5 py-2 text-center', TONE_BADGE[stage.tone])}>
            <p className="text-[10px] font-semibold tracking-wide uppercase">{stage.label}</p>
            <p className="mt-0.5 text-xl font-bold">{stage.count}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {PROPOSALS.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-3.5 w-3.5 shrink-0 text-primary/40" />
              <span className="truncate text-[11px] font-medium text-foreground/80">{p.title}</span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] font-semibold text-foreground/60">{p.value}</span>
              <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', TONE_BADGE[p.tone])}>{p.stage}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3 py-2.5">
        <Sparkles className="h-3.5 w-3.5 shrink-0 text-accent" />
        <span className="flex-1 text-[11px] font-medium text-foreground/70">AI generating: NovaTech Digital proposal…</span>
        <div className="flex items-center gap-[3px]">
          {[0, 150, 300].map((d) => (
            <span key={d} className="block h-1.5 w-1.5 animate-bounce rounded-full bg-accent" style={{ animationDelay: `${d}ms` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

function ClientsPanel() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
        <Search className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/40">Search clients…</span>
        <span className="ml-auto rounded border border-border/40 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground/50">12 accounts</span>
      </div>

      {CLIENT_ACCOUNTS.map((client) => (
        <div key={client.id} className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white', client.color)}>
              {client.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-semibold text-foreground">{client.name}</span>
                <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{client.revenue}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-border/50">
                  <div
                    className={cn('h-full rounded-full transition-[width]', client.health >= 80 ? 'bg-success' : client.health >= 60 ? 'bg-accent' : 'bg-warning')}
                    style={{ width: `${client.health}%` }}
                  />
                </div>
                <span className={cn('text-[9px] font-bold', client.health >= 80 ? 'text-success' : client.health >= 60 ? 'text-accent' : 'text-warning')}>
                  {client.health}%
                </span>
                <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', TONE_BADGE[client.tone])}>
                  {client.tag}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function MeetingsPanel() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/20 px-3 py-2">
        <CalendarClock className="h-3.5 w-3.5 text-primary/50" />
        <span className="text-[11px] font-semibold text-foreground/70">Today — 3 meetings scheduled</span>
        <span className="ml-auto rounded-full border border-info/30 bg-info/10 px-2 py-0.5 text-[9px] font-semibold text-info">Wed</span>
      </div>

      {MEETING_ITEMS.map((meeting) => (
        <div key={meeting.id} className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
          <div className="flex items-start gap-3">
            <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg border border-border/40 bg-background/60 py-1.5">
              <span className="text-[10px] font-bold leading-none text-foreground/80">{meeting.timeHour}</span>
              <span className="text-[8px] font-medium text-muted-foreground/60">{meeting.timeAmPm}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-[11px] font-semibold text-foreground">{meeting.title}</span>
                <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-semibold', TONE_BADGE[meeting.tone])}>{meeting.type}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex -space-x-1.5">
                  {meeting.attendees.slice(0, 3).map((att) => (
                    <div
                      key={att}
                      className={cn('flex h-4 w-4 items-center justify-center rounded-full border border-background text-[7px] font-bold text-white', ATTENDEE_COLORS[att] ?? 'bg-muted-foreground')}
                    >
                      {att[0]}
                    </div>
                  ))}
                  {meeting.attendees.length > 3 && (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border border-background bg-muted text-[7px] font-bold text-muted-foreground">
                      +{meeting.attendees.length - 3}
                    </div>
                  )}
                </div>
                <div className={cn(
                  'flex items-center gap-1 text-[9px] font-medium',
                  meeting.noteStatus === 'ready' ? 'text-success' : meeting.noteStatus === 'active' ? 'text-accent' : 'text-muted-foreground/50',
                )}>
                  {meeting.noteStatus === 'ready' && <CheckCircle2 className="h-2.5 w-2.5" />}
                  {meeting.noteStatus === 'active' && <Sparkles className="h-2.5 w-2.5" />}
                  {meeting.noteStatus === 'upcoming' && <Clock className="h-2.5 w-2.5" />}
                  {meeting.note}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function AgentTabPanel() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
        <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">Active flows</p>
        <div className="space-y-1.5">
          {AGENT_FLOWS.map((flow) => (
            <div key={flow.id} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/60 px-2.5 py-2">
              <div className="flex items-center gap-2">
                <span className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  flow.tone === 'success' ? 'animate-pulse bg-success' : flow.tone === 'accent' ? 'bg-accent' : 'bg-info',
                )} />
                <span className="text-[11px] font-medium text-foreground/80">{flow.label}</span>
              </div>
              <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', TONE_BADGE[flow.tone])}>{flow.status}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
        <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">Recent actions</p>
        <div className="space-y-1.5">
          {AGENT_RECENT.map((item) => (
            <div key={item.id} className="flex items-start gap-2 rounded-lg border border-border/30 bg-background/60 px-2.5 py-2">
              <Bot className="mt-0.5 h-3 w-3 shrink-0 text-accent/70" />
              <span className="flex-1 text-[11px] font-medium text-foreground/80">{item.text}</span>
              <span className="shrink-0 text-[9px] text-muted-foreground/50">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TabId validator                                                    */
/* ------------------------------------------------------------------ */

const TAB_ID_SET = new Set<string>(['overview', 'proposals', 'clients', 'meetings', 'agent'])
function isTabId(v: string | undefined): v is TabId {
  return v !== undefined && TAB_ID_SET.has(v)
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const INITIAL_TAB = TABS[0]!

export function MinifiedSoftwarePreview() {
  const [activeTabId, setActiveTabId] = useState<TabId>(INITIAL_TAB.id)
  const [activeMetricId, setActiveMetricId] = useState(OVERVIEW_METRICS[0]!.id)

  const tab = useMemo(() => TABS.find((t) => t.id === activeTabId) ?? INITIAL_TAB, [activeTabId])

  const handleTabClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const id = e.currentTarget.dataset.tabId
      if (isTabId(id) && id !== activeTabId) {
        startTransition(() => setActiveTabId(id))
      }
    },
    [activeTabId],
  )

  const handleMetricClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const id = e.currentTarget.dataset.metricId
      if (id && id !== activeMetricId) {
        startTransition(() => setActiveMetricId(id))
      }
    },
    [activeMetricId],
  )

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Ambient glow */}
      <div aria-hidden="true" className="absolute inset-x-16 -top-8 h-32 rounded-full bg-accent/15 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-8 top-16 h-40 w-40 rounded-full bg-info/10 blur-3xl" />

      {/* Window frame */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-background/95 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        {/* ── Title bar ── */}
        <div className="flex items-center justify-between border-b border-border/40 bg-muted/60 px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-[7px]">
              <span className="block h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
              <span className="block h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
              <span className="block h-[11px] w-[11px] rounded-full bg-[#28c840]" />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-border/50 bg-background/80 px-3 py-1">
              <Search className="h-3 w-3 text-muted-foreground/50" />
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground/70">app.cohorts.ai/dashboard</span>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-success uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Live
            </span>
          </div>
        </div>

        {/* ── App body ── */}
        <div className="grid grid-cols-1 sm:grid-cols-[52px_1fr] lg:grid-cols-[52px_1fr_260px]">
          {/* ── Sidebar ── */}
          <div className="hidden border-r border-border/30 bg-muted/30 py-3 sm:block">
            <div className="flex flex-col items-center gap-1">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-tab-id={t.id}
                  aria-pressed={t.id === activeTabId}
                  onClick={handleTabClick}
                  title={t.label}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    t.id === activeTabId
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground/50 hover:text-muted-foreground',
                  )}
                >
                  <t.Icon className="h-4 w-4" />
                </button>
              ))}
              <div className="my-1 h-px w-5 bg-border/40" />
              {SIDEBAR_EXTRA.map((item) => (
                <div key={item.id} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/25">
                  <item.Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="min-h-[380px] p-4 sm:p-5">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">{tab.eyebrow}</p>
                <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">{tab.label}</h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {tab.status}
              </div>
            </div>

            {/* Mobile tab switcher */}
            <div className="mb-4 flex gap-1 overflow-x-auto sm:hidden">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-tab-id={t.id}
                  onClick={handleTabClick}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold tracking-wide uppercase transition-colors',
                    t.id === activeTabId
                      ? 'border-primary/30 bg-primary/8 text-primary'
                      : 'border-border/40 text-muted-foreground/50',
                  )}
                >
                  <t.Icon className="h-3 w-3" />
                  {t.label}
                </button>
              ))}
            </div>

            {/* Per-tab content */}
            {activeTabId === 'overview' && (
              <OverviewPanel activeMetricId={activeMetricId} onMetricClick={handleMetricClick} />
            )}
            {activeTabId === 'proposals' && <ProposalsPanel />}
            {activeTabId === 'clients' && <ClientsPanel />}
            {activeTabId === 'meetings' && <MeetingsPanel />}
            {activeTabId === 'agent' && <AgentTabPanel />}
          </div>

          {/* ── Agent right panel ── */}
          <div className="hidden border-l border-border/30 bg-primary/[0.03] lg:block">
            <div className="border-b border-border/30 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] font-semibold tracking-[0.16em] text-foreground/70 uppercase">Agent</span>
              </div>
            </div>
            <div className="p-3.5">
              <div className="space-y-2.5">
                {tab.agentItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border/30 bg-background/60 px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" />
                      <div>
                        <p className="text-[11px] font-medium leading-4 text-foreground/80">{item.text}</p>
                        <p className="mt-1 text-[9px] font-medium tracking-wide text-muted-foreground/50 uppercase">{item.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-border/40 bg-background/70 px-3 py-2">
                <MessageSquare className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/40">Ask the agent anything…</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

