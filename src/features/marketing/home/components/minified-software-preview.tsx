'use client'

import {
  BarChart3,
  Bot,
  CalendarClock,
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
import { startTransition, useCallback, useEffect, useMemo, useState, type MouseEvent } from 'react'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tone = 'success' | 'warning' | 'info' | 'accent'

type BarDatum = { id: string; h: string; accent?: boolean }

type Metric = {
  id: string
  label: string
  value: string
  delta: string
  tone: Tone
  chartLabel: string
  bars: readonly BarDatum[]
}

type QueueItem = {
  id: string
  title: string
  tag: string
  tone: Tone
}

type AgentItem = {
  id: string
  text: string
  time: string
}

type TabView = {
  id: string
  Icon: LucideIcon
  label: string
  eyebrow: string
  status: string
  metrics: readonly Metric[]
  queue: readonly QueueItem[]
  agentItems: readonly AgentItem[]
}

/* ------------------------------------------------------------------ */
/*  Data per tab                                                        */
/* ------------------------------------------------------------------ */

const TABS: readonly TabView[] = [
  {
    id: 'overview',
    Icon: LayoutDashboard,
    label: 'Overview',
    eyebrow: 'Agency pulse',
    status: 'Live board',
    metrics: [
      {
        id: 'delivery',
        label: 'Delivery',
        value: '86%',
        delta: '+8%',
        tone: 'success',
        chartLabel: 'Delivery velocity',
        bars: [
          { id: 'b1', h: 'h-[38%]' },
          { id: 'b2', h: 'h-[52%]' },
          { id: 'b3', h: 'h-[46%]' },
          { id: 'b4', h: 'h-[68%]', accent: true },
          { id: 'b5', h: 'h-[58%]' },
          { id: 'b6', h: 'h-[72%]' },
          { id: 'b7', h: 'h-[62%]' },
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
          { id: 'b1', h: 'h-[58%]' },
          { id: 'b2', h: 'h-[52%]' },
          { id: 'b3', h: 'h-[63%]', accent: true },
          { id: 'b4', h: 'h-[48%]' },
          { id: 'b5', h: 'h-[54%]' },
          { id: 'b6', h: 'h-[46%]' },
          { id: 'b7', h: 'h-[41%]' },
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
          { id: 'b1', h: 'h-[31%]' },
          { id: 'b2', h: 'h-[44%]' },
          { id: 'b3', h: 'h-[57%]' },
          { id: 'b4', h: 'h-[69%]', accent: true },
          { id: 'b5', h: 'h-[66%]' },
          { id: 'b6', h: 'h-[38%]' },
          { id: 'b7', h: 'h-[29%]' },
        ],
      },
    ],
    queue: [
      { id: 'q1', title: 'Apex launch brief', tag: 'Proposal', tone: 'warning' },
      { id: 'q2', title: 'BlueWave weekly report', tag: 'Review', tone: 'info' },
      { id: 'q3', title: 'Novex kickoff room', tag: 'Meeting', tone: 'success' },
    ],
    agentItems: [
      { id: 'a1', text: 'Client recap drafted for Apex', time: '2 min ago' },
      { id: 'a2', text: 'Budget drift flagged on BlueWave', time: '6 min ago' },
      { id: 'a3', text: 'Kickoff checklist assembled', time: '12 min ago' },
    ],
  },
  {
    id: 'automation',
    Icon: Bot,
    label: 'Automation',
    eyebrow: 'Agent mode',
    status: '4 flows running',
    metrics: [
      {
        id: 'follow-ups',
        label: 'Follow-ups',
        value: '27',
        delta: '+11',
        tone: 'accent',
        chartLabel: 'Follow-ups queued',
        bars: [
          { id: 'b1', h: 'h-[28%]' },
          { id: 'b2', h: 'h-[41%]' },
          { id: 'b3', h: 'h-[53%]' },
          { id: 'b4', h: 'h-[74%]', accent: true },
          { id: 'b5', h: 'h-[66%]' },
          { id: 'b6', h: 'h-[49%]' },
          { id: 'b7', h: 'h-[44%]' },
        ],
      },
      {
        id: 'summaries',
        label: 'Summaries',
        value: '14',
        delta: 'Ready',
        tone: 'success',
        chartLabel: 'Summaries drafted',
        bars: [
          { id: 'b1', h: 'h-[36%]' },
          { id: 'b2', h: 'h-[52%]' },
          { id: 'b3', h: 'h-[59%]' },
          { id: 'b4', h: 'h-[68%]' },
          { id: 'b5', h: 'h-[73%]', accent: true },
          { id: 'b6', h: 'h-[46%]' },
          { id: 'b7', h: 'h-[33%]' },
        ],
      },
      {
        id: 'anomalies',
        label: 'Anomalies',
        value: '3',
        delta: 'Review',
        tone: 'warning',
        chartLabel: 'Anomalies flagged',
        bars: [
          { id: 'b1', h: 'h-[22%]' },
          { id: 'b2', h: 'h-[35%]' },
          { id: 'b3', h: 'h-[63%]', accent: true },
          { id: 'b4', h: 'h-[31%]' },
          { id: 'b5', h: 'h-[47%]' },
          { id: 'b6', h: 'h-[25%]' },
          { id: 'b7', h: 'h-[19%]' },
        ],
      },
    ],
    queue: [
      { id: 'q1', title: 'Morning summary pack', tag: 'Drafted', tone: 'accent' },
      { id: 'q2', title: 'LinkedIn pacing alert', tag: 'Escalated', tone: 'warning' },
      { id: 'q3', title: 'Renewal follow-up', tag: 'Queued', tone: 'success' },
    ],
    agentItems: [
      { id: 'a1', text: 'Follow-up drafted for BlueWave', time: '1 min ago' },
      { id: 'a2', text: 'Meeting recap merged into thread', time: '6 min ago' },
      { id: 'a3', text: 'Pacing anomaly tagged for review', time: '10 min ago' },
    ],
  },
  {
    id: 'clients',
    Icon: Users,
    label: 'Clients',
    eyebrow: 'Account focus',
    status: '3 hot accounts',
    metrics: [
      {
        id: 'satisfaction',
        label: 'Satisfaction',
        value: '94%',
        delta: '+6%',
        tone: 'success',
        chartLabel: 'Client satisfaction',
        bars: [
          { id: 'b1', h: 'h-[46%]' },
          { id: 'b2', h: 'h-[54%]' },
          { id: 'b3', h: 'h-[63%]' },
          { id: 'b4', h: 'h-[72%]', accent: true },
          { id: 'b5', h: 'h-[77%]' },
          { id: 'b6', h: 'h-[59%]' },
          { id: 'b7', h: 'h-[51%]' },
        ],
      },
      {
        id: 'expansions',
        label: 'Expansions',
        value: '5',
        delta: 'Open',
        tone: 'accent',
        chartLabel: 'Expansion paths',
        bars: [
          { id: 'b1', h: 'h-[32%]' },
          { id: 'b2', h: 'h-[47%]' },
          { id: 'b3', h: 'h-[58%]' },
          { id: 'b4', h: 'h-[64%]' },
          { id: 'b5', h: 'h-[70%]', accent: true },
          { id: 'b6', h: 'h-[45%]' },
          { id: 'b7', h: 'h-[37%]' },
        ],
      },
      {
        id: 'risks',
        label: 'At risk',
        value: '2',
        delta: 'Watch',
        tone: 'warning',
        chartLabel: 'Accounts at risk',
        bars: [
          { id: 'b1', h: 'h-[18%]' },
          { id: 'b2', h: 'h-[28%]' },
          { id: 'b3', h: 'h-[39%]' },
          { id: 'b4', h: 'h-[61%]', accent: true },
          { id: 'b5', h: 'h-[43%]' },
          { id: 'b6', h: 'h-[24%]' },
          { id: 'b7', h: 'h-[16%]' },
        ],
      },
    ],
    queue: [
      { id: 'q1', title: 'TechCorp pulse check', tag: 'Healthy', tone: 'success' },
      { id: 'q2', title: 'Retail Store renewal', tag: 'Watch', tone: 'warning' },
      { id: 'q3', title: 'StratSoft Q2 review', tag: 'Ready', tone: 'info' },
    ],
    agentItems: [
      { id: 'a1', text: 'Health score refreshed for TechCorp', time: 'just now' },
      { id: 'a2', text: 'Renewal brief queued for Retail Store', time: 'pending' },
      { id: 'a3', text: 'Expansion path drafted for StratSoft', time: 'ready' },
    ],
  },
] as const

/* ------------------------------------------------------------------ */
/*  Sidebar nav (decorative non-tab items)                             */
/* ------------------------------------------------------------------ */

const INITIAL_TAB = TABS[0]!
const INITIAL_METRIC = INITIAL_TAB.metrics[0]!

const SIDEBAR_EXTRA: readonly { id: string; Icon: LucideIcon }[] = [
  { id: 'proposals', Icon: FileText },
  { id: 'meetings', Icon: CalendarClock },
  { id: 'analytics', Icon: BarChart3 },
  { id: 'messages', Icon: MessageSquare },
  { id: 'settings', Icon: Settings },
]

/* ------------------------------------------------------------------ */
/*  Tone palette                                                        */
/* ------------------------------------------------------------------ */

const TONE_BADGE: Record<Tone, string> = {
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-info/30 bg-info/10 text-info',
  accent: 'border-accent/30 bg-accent/15 text-accent',
}

const TONE_ICON: Record<Tone, string> = {
  success: 'text-success/60',
  warning: 'text-warning/60',
  info: 'text-info/60',
  accent: 'text-accent/60',
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MinifiedSoftwarePreview() {
  const [activeTabId, setActiveTabId] = useState(INITIAL_TAB.id)
  const [activeMetricId, setActiveMetricId] = useState(INITIAL_METRIC.id)

  const tab = useMemo(() => TABS.find((t) => t.id === activeTabId) ?? INITIAL_TAB, [activeTabId])
  const metric = useMemo(
    () => tab.metrics.find((m) => m.id === activeMetricId) ?? tab.metrics[0]!,
    [tab, activeMetricId],
  )

  // Reset metric when tab changes and current metric doesn't belong to new tab
  useEffect(() => {
    if (!tab.metrics.some((m) => m.id === activeMetricId)) {
      startTransition(() => setActiveMetricId(tab.metrics[0]!.id))
    }
  }, [tab, activeMetricId])

  const handleTabClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      const id = e.currentTarget.dataset.tabId
      if (id && id !== activeTabId) {
        startTransition(() => {
          setActiveTabId(id)
        })
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
      {/* Ambient glow behind the window */}
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
              <span className="text-[11px] font-medium tracking-wide text-muted-foreground/70">
                app.cohorts.ai/dashboard
              </span>
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
          {/* ── Sidebar (icon rail) ── */}
          <div className="hidden border-r border-border/30 bg-muted/30 py-3 sm:block">
            <div className="flex flex-col items-center gap-1">
              {/* Tab icons */}
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-tab-id={t.id}
                  aria-pressed={t.id === activeTabId}
                  onClick={handleTabClick}
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

              {/* Decorative separator */}
              <div className="my-1 h-px w-5 bg-border/40" />

              {/* Extra nav (non-interactive) */}
              {SIDEBAR_EXTRA.map((item) => (
                <div
                  key={item.id}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground/30"
                >
                  <item.Icon className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="min-h-[340px] p-4 sm:p-5">
            {/* Header row */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                  {tab.eyebrow}
                </p>
                <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
                  {tab.label}
                </h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {tab.status}
              </div>
            </div>

            {/* ── Mobile tab switcher ── */}
            <div className="mb-4 flex gap-1.5 sm:hidden">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  data-tab-id={t.id}
                  onClick={handleTabClick}
                  className={cn(
                    'flex-1 rounded-lg border px-2 py-1.5 text-center text-[10px] font-semibold tracking-wide uppercase transition-colors',
                    t.id === activeTabId
                      ? 'border-primary/30 bg-primary/8 text-primary'
                      : 'border-border/40 text-muted-foreground/50',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Metric cards (clickable) ── */}
            <div className="grid grid-cols-3 gap-2.5">
              {tab.metrics.map((m) => {
                const isActive = m.id === metric.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    data-metric-id={m.id}
                    aria-pressed={isActive}
                    onClick={handleMetricClick}
                    className={cn(
                      'rounded-xl border px-3 py-2.5 text-left transition-colors',
                      isActive
                        ? cn('border-transparent bg-muted/90', TONE_BADGE[m.tone])
                        : 'border-border/40 bg-muted/20 hover:bg-muted/40',
                    )}
                  >
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
                      {m.label}
                    </p>
                    <div className="mt-1.5 flex items-end justify-between gap-2">
                      <span className="text-lg font-semibold text-foreground">{m.value}</span>
                      <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', TONE_BADGE[m.tone])}>
                        {m.delta}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* ── Chart + queue row ── */}
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
              {/* Mini chart — driven by selected metric */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
                    {metric.chartLabel}
                  </p>
                  <TrendingUp className={cn('h-3 w-3', TONE_ICON[metric.tone])} />
                </div>
                <div className="flex h-20 items-end gap-[5px]">
                  {metric.bars.map((bar) => (
                    <div
                      key={bar.id}
                      className={cn(
                        'flex-1 rounded-t-md transition-[height,background-color] duration-300',
                        bar.h,
                        bar.accent ? 'bg-accent' : 'bg-primary/10',
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Mini queue — driven by active tab */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
                  Needs attention
                </p>
                <div className="space-y-2">
                  {tab.queue.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/30 bg-background/60 px-2.5 py-2"
                    >
                      <span className="text-[11px] font-medium text-foreground/80">{item.title}</span>
                      <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', TONE_BADGE[item.tone])}>
                        {item.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Agent panel (right) ── */}
          <div className="hidden border-l border-border/30 bg-primary/[0.03] lg:block">
            <div className="border-b border-border/30 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-[11px] font-semibold tracking-[0.16em] text-foreground/70 uppercase">
                  Agent
                </span>
              </div>
            </div>

            <div className="p-3.5">
              <div className="space-y-2.5">
                {tab.agentItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border/30 bg-background/60 px-3 py-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <Bot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent/70" />
                      <div>
                        <p className="text-[11px] font-medium leading-4 text-foreground/80">
                          {item.text}
                        </p>
                        <p className="mt-1 text-[9px] font-medium tracking-wide text-muted-foreground/50 uppercase">
                          {item.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Agent input */}
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
