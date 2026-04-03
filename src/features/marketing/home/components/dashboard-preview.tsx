'use client'

import {
  ArrowUpRight,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { ViewTransition } from 'react'
import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'

import { cn } from '@/lib/utils'

type PreviewTone = 'primary' | 'accent' | 'info' | 'success' | 'warning'

type PreviewBar = {
  id: string
  label: string
  heightClass: string
  emphasized?: boolean
}

type PreviewMetric = {
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

type PreviewQueueItem = {
  id: string
  title: string
  meta: string
  stage: string
  tone: PreviewTone
}

type PreviewActivityItem = {
  id: string
  label: string
  meta: string
}

type PreviewView = {
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

const DASHBOARD_VIEWS = [
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

const PREVIEW_VIEW_IDS = new Set<string>(DASHBOARD_VIEWS.map((view) => view.id))

const TONE_BADGE_CLASSES = {
  primary: 'border-primary/20 bg-primary/10 text-primary',
  accent: 'border-accent/30 bg-accent/15 text-accent',
  info: 'border-info/20 bg-info/10 text-info',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
} as const satisfies Record<PreviewTone, string>

const TONE_DOT_CLASSES = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
} as const satisfies Record<PreviewTone, string>

const INITIAL_VIEW_ID = DASHBOARD_VIEWS[0].id
const INITIAL_METRIC_ID = DASHBOARD_VIEWS[0].metrics[0].id

function isPreviewViewId(value: string | undefined): value is PreviewView['id'] {
  if (!value) {
    return false
  }

  return PREVIEW_VIEW_IDS.has(value)
}

function findPreviewView(viewId: PreviewView['id']) {
  return DASHBOARD_VIEWS.find((view) => view.id === viewId) ?? DASHBOARD_VIEWS[0]
}

function getNextPreviewViewId(currentViewId: PreviewView['id']): PreviewView['id'] {
  const currentIndex = DASHBOARD_VIEWS.findIndex((view) => view.id === currentViewId)
  if (currentIndex === -1 || currentIndex === DASHBOARD_VIEWS.length - 1) {
    return DASHBOARD_VIEWS[0].id
  }

  return DASHBOARD_VIEWS[currentIndex + 1]?.id ?? DASHBOARD_VIEWS[0].id
}

function resetSurfaceTransform(node: HTMLDivElement | null) {
  if (!node) {
    return
  }

  node.style.transform = ''
}

function applySurfaceTransform(node: HTMLDivElement | null, rotateX: number, rotateY: number) {
  if (!node) {
    return
  }

  node.style.transform = `translate3d(0, -6px, 0) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`
}

export function DashboardPreview() {
  const [activeViewId, setActiveViewId] = useState<PreviewView['id']>(INITIAL_VIEW_ID)
  const [activeMetricId, setActiveMetricId] = useState<string>(INITIAL_METRIC_ID)
  const [isAutoRotationPaused, setIsAutoRotationPaused] = useState(false)
  const surfaceRef = useRef<HTMLDivElement | null>(null)

  const currentView = useMemo(() => findPreviewView(activeViewId), [activeViewId])
  const currentMetric = useMemo(
    () => currentView.metrics.find((metric) => metric.id === activeMetricId) ?? currentView.metrics[0],
    [activeMetricId, currentView],
  )

  useEffect(() => {
    if (currentView.metrics.some((metric) => metric.id === activeMetricId)) {
      return
    }

    startTransition(() => {
      setActiveMetricId(currentView.metrics[0].id)
    })
  }, [activeMetricId, currentView])

  useEffect(() => {
    if (isAutoRotationPaused || typeof window === 'undefined') {
      return
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const intervalId = window.setInterval(() => {
      startTransition(() => {
        setActiveViewId((current) => getNextPreviewViewId(current))
      })
    }, 4800)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isAutoRotationPaused])

  const handlePreviewMouseEnter = useCallback(() => {
    setIsAutoRotationPaused(true)
  }, [])

  const handlePreviewMouseLeave = useCallback(() => {
    resetSurfaceTransform(surfaceRef.current)
    setIsAutoRotationPaused(false)
  }, [])

  const handlePreviewMouseMove = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const node = surfaceRef.current
    if (!node) {
      return
    }

    const bounds = node.getBoundingClientRect()
    const horizontalOffset = (event.clientX - bounds.left) / bounds.width - 0.5
    const verticalOffset = (event.clientY - bounds.top) / bounds.height - 0.5

    applySurfaceTransform(node, verticalOffset * -8, horizontalOffset * 10)
  }, [])

  const handleViewSelect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const nextViewId = event.currentTarget.dataset.viewId
    if (!isPreviewViewId(nextViewId) || nextViewId === activeViewId) {
      return
    }

    startTransition(() => {
      setActiveViewId(nextViewId)
      setActiveMetricId(findPreviewView(nextViewId).metrics[0].id)
    })
  }, [activeViewId])

  const handleMetricSelect = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const nextMetricId = event.currentTarget.dataset.metricId
    if (!nextMetricId || !currentView.metrics.some((metric) => metric.id === nextMetricId)) {
      return
    }

    startTransition(() => {
      setActiveMetricId(nextMetricId)
    })
  }, [currentView.metrics])

  return (
    <div className="relative mx-auto w-full max-w-280">
      <div aria-hidden="true" className="absolute inset-x-12 top-10 h-24 rounded-full bg-accent/20 blur-3xl" />
      <div aria-hidden="true" className="absolute -right-4 top-28 h-44 w-44 rounded-full bg-info/15 blur-3xl" />

      <div
        className="relative perspective-[1800px]"
        onMouseEnter={handlePreviewMouseEnter}
        onMouseLeave={handlePreviewMouseLeave}
        onMouseMove={handlePreviewMouseMove}
      >
        <div
          ref={surfaceRef}
          className="relative overflow-hidden rounded-[28px] border border-border/60 bg-background/95 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out"
        >
          <div className="border-b border-border/60 bg-muted/70 px-4 py-3 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive/70" />
                  <span className="h-3 w-3 rounded-full bg-warning/70" />
                  <span className="h-3 w-3 rounded-full bg-success/70" />
                </div>
                <div className="rounded-full border border-border/70 bg-background px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
                  app.cohorts.ai/dashboard
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-success uppercase">
                  Interactive preview
                </div>
                <Link
                  href="/dashboard"
                  transitionTypes={['nav-forward']}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  Open dashboard
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[90px_minmax(0,1fr)] lg:gap-6">
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
              {DASHBOARD_VIEWS.map((view) => {
                const isActive = view.id === activeViewId
                const ViewIcon = view.Icon

                return (
                  <button
                    key={view.id}
                    type="button"
                    data-view-id={view.id}
                    aria-pressed={isActive}
                    onClick={handleViewSelect}
                    className={cn(
                      'flex min-h-20 flex-col items-start justify-between rounded-2xl border px-3 py-3 text-left transition-colors lg:min-h-27',
                      isActive
                        ? 'border-primary/30 bg-primary/8 text-foreground'
                        : 'border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted/70',
                    )}
                  >
                    <ViewIcon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">{view.label}</p>
                      <p className="mt-1 text-[11px] leading-4 text-muted-foreground lg:text-[10px]">{view.status}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)] lg:gap-5">
              <div className="space-y-4">
                <div className="rounded-3xl border border-border/60 bg-background/90 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
                        {currentView.eyebrow}
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-foreground sm:text-[1.9rem]">
                        {currentView.label}
                      </h3>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                        {currentView.summary}
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/60 px-3 py-1.5 text-xs font-medium text-foreground">
                      <span className="h-2 w-2 rounded-full bg-accent" />
                      {currentView.status}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {currentView.metrics.map((metric) => {
                      const isActive = metric.id === currentMetric.id

                      return (
                        <ViewTransition key={metric.id}>
                          <button
                            type="button"
                            data-metric-id={metric.id}
                            aria-pressed={isActive}
                            onClick={handleMetricSelect}
                            className={cn(
                              'rounded-2xl border px-3 py-3 text-left transition-colors',
                              isActive
                                ? cn('border-transparent bg-muted/90', TONE_BADGE_CLASSES[metric.tone])
                                : 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60',
                            )}
                          >
                            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                              {metric.label}
                            </p>
                            <div className="mt-2 flex items-end justify-between gap-3">
                              <span className="text-2xl font-semibold text-foreground">{metric.value}</span>
                              <span className={cn('rounded-full border px-2 py-1 text-[11px] font-semibold', TONE_BADGE_CLASSES[metric.tone])}>
                                {metric.delta}
                              </span>
                            </div>
                          </button>
                        </ViewTransition>
                      )
                    })}
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(250px,0.85fr)]">
                  <ViewTransition key={currentMetric.id}>
                    <div className="rounded-3xl border border-border/60 bg-background/90 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                          {currentMetric.focusLabel}
                        </p>
                        <h4 className="mt-2 text-lg font-semibold text-foreground">{currentMetric.label}</h4>
                      </div>
                      <div className={cn('rounded-full border px-3 py-1 text-xs font-semibold', TONE_BADGE_CLASSES[currentMetric.tone])}>
                        {currentMetric.delta}
                      </div>
                    </div>

                    <div className="mt-6 flex h-32 items-end gap-2">
                      {currentMetric.bars.map((bar) => (
                        <div key={bar.id} className="flex flex-1 flex-col items-center gap-2">
                          <div
                            className={cn(
                              'w-full rounded-t-2xl transition-[height,background-color] duration-300',
                              bar.heightClass,
                              'emphasized' in bar && bar.emphasized ? 'bg-accent' : 'bg-primary/12',
                            )}
                          />
                          <span className="text-[11px] font-medium text-muted-foreground">{bar.label}</span>
                        </div>
                      ))}
                    </div>

                    <p className="mt-5 text-sm leading-6 text-muted-foreground">{currentMetric.detail}</p>
                    </div>
                  </ViewTransition>

                  <ViewTransition key={`${currentMetric.id}-focus`}>
                    <div className="rounded-3xl border border-border/60 bg-muted/35 p-4 sm:p-5">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Focus summary
                      </p>
                    </div>

                    <div className="mt-4 space-y-3">
                      {currentMetric.focusItems.map((item) => (
                        <ViewTransition key={item}>
                          <div className="flex items-start gap-3 rounded-2xl border border-border/50 bg-background/85 px-3 py-3">
                            <span className={cn('mt-1 h-2.5 w-2.5 rounded-full', TONE_DOT_CLASSES[currentMetric.tone])} />
                            <p className="text-sm leading-6 text-foreground">{item}</p>
                          </div>
                        </ViewTransition>
                      ))}
                    </div>
                    </div>
                  </ViewTransition>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-border/60 bg-background/90 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Live queue
                      </p>
                      <h4 className="mt-2 text-lg font-semibold text-foreground">What needs attention next</h4>
                    </div>
                    <CalendarClock className="h-4 w-4 text-primary" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {currentView.queue.map((item) => (
                      <ViewTransition key={item.id}>
                        <div className="rounded-2xl border border-border/50 bg-muted/35 px-3 py-3 transition-colors hover:bg-muted/60">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{item.title}</p>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.meta}</p>
                            </div>
                            <span className={cn('rounded-full border px-2 py-1 text-[11px] font-semibold', TONE_BADGE_CLASSES[item.tone])}>
                              {item.stage}
                            </span>
                          </div>
                        </div>
                      </ViewTransition>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-primary/12 bg-primary px-4 py-4 text-primary-foreground sm:px-5 sm:py-5">
                  <div className="flex items-center gap-2 text-primary-foreground/80">
                    <Sparkles className="h-4 w-4" />
                    <p className="text-[11px] font-semibold tracking-[0.18em] uppercase">Agent readout</p>
                  </div>

                  <h4 className="mt-3 text-lg font-semibold">{currentView.agentTitle}</h4>
                  <p className="mt-3 text-sm leading-6 text-primary-foreground/80">{currentView.agentSummary}</p>

                  <div className="mt-4 space-y-3">
                    {currentView.agentItems.map((item) => (
                      <ViewTransition key={item.id}>
                        <div className="rounded-2xl border border-primary-foreground/12 bg-primary-foreground/8 px-3 py-3">
                          <div className="flex items-start gap-3">
                            <Bot className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                            <div>
                              <p className="text-sm font-semibold text-primary-foreground">{item.label}</p>
                              <p className="mt-1 text-[11px] font-medium tracking-[0.16em] text-primary-foreground/70 uppercase">
                                {item.meta}
                              </p>
                            </div>
                          </div>
                        </div>
                      </ViewTransition>
                    ))}
                  </div>

                  <Link
                    href="/dashboard"
                    transitionTypes={['nav-forward']}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                  >
                    Launch workspace
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 text-[11px] font-medium tracking-[0.16em] text-primary-foreground/65 uppercase sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Hover to tilt, tap lanes to inspect the board.
        </div>
        <div className="inline-flex items-center gap-2">
          <BriefcaseBusiness className="h-3.5 w-3.5" />
          Compact on purpose, interactive by default.
        </div>
      </div>
    </div>
  )
}