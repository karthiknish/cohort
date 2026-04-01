'use client'

import {
  BarChart3,
  Bot,
  CalendarClock,
  ChevronRight,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Minified bar data                                                  */
/* ------------------------------------------------------------------ */

const MINI_BARS = [
  { id: 'b1', h: 'h-[38%]' },
  { id: 'b2', h: 'h-[52%]' },
  { id: 'b3', h: 'h-[46%]' },
  { id: 'b4', h: 'h-[68%]', accent: true },
  { id: 'b5', h: 'h-[58%]' },
  { id: 'b6', h: 'h-[72%]' },
  { id: 'b7', h: 'h-[62%]' },
] as const

const SIDEBAR_NAV = [
  { id: 'dash', Icon: LayoutDashboard, label: 'Dashboard', active: true },
  { id: 'clients', Icon: Users, label: 'Clients' },
  { id: 'proposals', Icon: FileText, label: 'Proposals' },
  { id: 'meetings', Icon: CalendarClock, label: 'Meetings' },
  { id: 'analytics', Icon: BarChart3, label: 'Analytics' },
  { id: 'messages', Icon: MessageSquare, label: 'Messages' },
  { id: 'settings', Icon: Settings, label: 'Settings' },
] as const

const QUEUE_ITEMS = [
  { id: 'q1', title: 'Apex launch brief', tag: 'Proposal', tone: 'warning' as const },
  { id: 'q2', title: 'BlueWave weekly report', tag: 'Review', tone: 'info' as const },
  { id: 'q3', title: 'Novex kickoff room', tag: 'Meeting', tone: 'success' as const },
] as const

const AGENT_ITEMS = [
  { id: 'a1', text: 'Client recap drafted for Apex', time: '2 min ago' },
  { id: 'a2', text: 'Budget drift flagged on BlueWave', time: '6 min ago' },
  { id: 'a3', text: 'Kickoff checklist assembled', time: '12 min ago' },
] as const

const TONE_CLASSES = {
  warning: 'border-warning/30 bg-warning/10 text-warning',
  info: 'border-info/30 bg-info/10 text-info',
  success: 'border-success/30 bg-success/10 text-success',
} as const

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function MinifiedSoftwarePreview() {
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
            {/* Traffic lights */}
            <div className="flex items-center gap-[7px]">
              <span className="block h-[11px] w-[11px] rounded-full bg-[#ff5f57]" />
              <span className="block h-[11px] w-[11px] rounded-full bg-[#febc2e]" />
              <span className="block h-[11px] w-[11px] rounded-full bg-[#28c840]" />
            </div>
            {/* URL bar */}
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
              {SIDEBAR_NAV.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
                    'active' in item && item.active
                      ? 'bg-primary/12 text-primary'
                      : 'text-muted-foreground/50 hover:text-muted-foreground',
                  )}
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
                  Agency pulse
                </p>
                <h3 className="mt-1 text-base font-semibold text-foreground sm:text-lg">
                  Overview
                </h3>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border/50 bg-muted/40 px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Live board
              </div>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-3 gap-2.5">
              <MetricCard label="Delivery" value="86%" delta="+8%" tone="success" />
              <MetricCard label="Revenue risk" value="$18k" delta="-3%" tone="warning" />
              <MetricCard label="Meetings" value="12" delta="Today" tone="info" />
            </div>

            {/* Chart + queue row */}
            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
              {/* Mini chart */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
                    Delivery velocity
                  </p>
                  <TrendingUp className="h-3 w-3 text-success/60" />
                </div>
                <div className="flex h-20 items-end gap-[5px]">
                  {MINI_BARS.map((bar) => (
                    <div
                      key={bar.id}
                      className={cn(
                        'flex-1 rounded-t-md transition-colors',
                        bar.h,
                        'accent' in bar && bar.accent ? 'bg-accent' : 'bg-primary/10',
                      )}
                    />
                  ))}
                </div>
              </div>

              {/* Mini queue */}
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                <p className="mb-2.5 text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
                  Needs attention
                </p>
                <div className="space-y-2">
                  {QUEUE_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-border/30 bg-background/60 px-2.5 py-2"
                    >
                      <span className="text-[11px] font-medium text-foreground/80">{item.title}</span>
                      <span
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-[9px] font-semibold',
                          TONE_CLASSES[item.tone],
                        )}
                      >
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
                {AGENT_ITEMS.map((item) => (
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

              <div className="mt-4">
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-[11px] font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                >
                  Open full dashboard
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Metric card                                                        */
/* ------------------------------------------------------------------ */

type MetricTone = 'success' | 'warning' | 'info'

const METRIC_TONE = {
  success: 'border-success/20 text-success',
  warning: 'border-warning/20 text-warning',
  info: 'border-info/20 text-info',
} as const

function MetricCard({
  label,
  value,
  delta,
  tone,
}: {
  label: string
  value: string
  delta: string
  tone: MetricTone
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 px-3 py-2.5">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-muted-foreground/60 uppercase">
        {label}
      </p>
      <div className="mt-1.5 flex items-end justify-between gap-2">
        <span className="text-lg font-semibold text-foreground">{value}</span>
        <span className={cn('rounded-full border px-1.5 py-0.5 text-[9px] font-semibold', METRIC_TONE[tone])}>
          {delta}
        </span>
      </div>
    </div>
  )
}
