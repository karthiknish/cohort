import type { CSSProperties } from 'react'
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Globe,
  LayoutDashboard,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { FadeIn } from '@/shared/ui/animate-in'

/* ------------------------------------------------------------------ */
/*  Integration hub data                                               */
/* ------------------------------------------------------------------ */

const INTEGRATIONS_LEFT = [
  {
    id: 'google',
    label: 'Google Ads',
    Icon: BarChart3,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    id: 'meta',
    label: 'Meta',
    Icon: Target,
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-500',
  },
] as const

const INTEGRATIONS_RIGHT = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    Icon: BriefcaseBusiness,
    iconBg: 'bg-blue-600/10',
    iconColor: 'text-blue-600',
  },
  {
    id: 'stripe',
    label: 'Stripe',
    Icon: CreditCard,
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
  },
] as const

type Integration = (typeof INTEGRATIONS_LEFT)[number] | (typeof INTEGRATIONS_RIGHT)[number]

/* ------------------------------------------------------------------ */
/*  Card 2 — Client Portal: activity list                             */
/* ------------------------------------------------------------------ */

const PORTAL_CLIENTS = [
  { id: 'c1', name: 'NovaTech Digital', initials: 'NT', time: 'Today, 11:42', value: '+12.4%', color: 'bg-blue-500' },
  { id: 'c2', name: 'BlueOrbit Media', initials: 'BO', time: 'Today, 10:28', value: '+5.6%', color: 'bg-sky-500' },
  { id: 'c3', name: 'Meridian Health', initials: 'MH', time: 'Today, 09:15', value: '+10.2%', color: 'bg-emerald-500' },
] as const

/* ------------------------------------------------------------------ */
/*  Card 3 — Team Collaboration: members + tasks                      */
/* ------------------------------------------------------------------ */

const TEAM_MEMBERS = [
  { id: 't1', initials: 'JL', color: 'bg-violet-500' },
  { id: 't2', initials: 'SR', color: 'bg-blue-500' },
  { id: 't3', initials: 'KP', color: 'bg-emerald-500' },
  { id: 't4', initials: 'MA', color: 'bg-amber-500' },
  { id: 't5', initials: 'DW', color: 'bg-rose-500' },
] as const

const TEAM_TASKS = [
  { id: 'tk1', label: 'Q3 report for Apex', stage: 'In review', stageClass: 'border-info/30 bg-info/10 text-info' },
  { id: 'tk2', label: 'Campaign brief: BlueOrbit', stage: 'Assigned', stageClass: 'border-accent/30 bg-accent/15 text-accent' },
  { id: 'tk3', label: 'Kickoff deck: Novex', stage: 'Done', stageClass: 'border-success/30 bg-success/10 text-success' },
] as const

/* ------------------------------------------------------------------ */
/*  Dot connector (desktop)                                            */
/* ------------------------------------------------------------------ */

function DotConnector() {
  return (
    <div className="hidden flex-col items-center gap-3.5 lg:flex" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="block h-[3px] w-[3px] rounded-full bg-border/70" />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Integration chip                                                   */
/* ------------------------------------------------------------------ */

function IntegrationChip({ chip }: { chip: Integration }) {
  return (
    <div className="flex h-10 w-fit items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium shadow-sm">
      <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', chip.iconBg)}>
        <chip.Icon className={cn('h-3.5 w-3.5', chip.iconColor)} />
      </span>
      {chip.label}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stacked card illustration for card 1 (Proposal)                   */
/* ------------------------------------------------------------------ */

const PROPOSAL_LINES_STYLE: CSSProperties[] = [
  { width: '75%' },
  { width: '100%' },
  { width: '83%' },
  { width: '60%' },
]

function ProposalIllustration() {
  return (
    <div className="mx-4 mt-6 overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-muted/40 px-4 pt-4">
      {/* Main card */}
      <div className="rounded-xl border border-border/60 bg-background p-3.5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-primary/60" />
            <span className="text-[11px] font-medium text-muted-foreground">Proposal · NovaTech Q3</span>
          </div>
          <span className="rounded-full border border-success/25 bg-success/10 px-2 py-0.5 text-[9px] font-semibold text-success">
            Ready
          </span>
        </div>

        {/* Skeleton lines */}
        <div className="space-y-1.5">
          {PROPOSAL_LINES_STYLE.map((style, i) => (
            <div
              key={i}
              className="h-[7px] rounded-full bg-muted/80"
              style={style}
            />
          ))}
        </div>

        {/* AI generating row */}
        <div className="mt-3 flex items-center gap-1.5 border-t border-border/40 pt-3">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="text-[10px] text-muted-foreground">AI generating insights</span>
          <div className="ml-auto flex items-center gap-[3px]">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="block h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Ghost cards stacked behind */}
      <div className="mx-3 h-3 rounded-t-lg border border-b-0 border-border/30 bg-muted/20 opacity-60" />
      <div className="mx-5 h-2 rounded-t-lg border border-b-0 border-border/20 bg-muted/10 opacity-40" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Client portal illustration for card 2                             */
/* ------------------------------------------------------------------ */

function PortalIllustration() {
  return (
    <div className="mx-4 mt-6 overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-muted/40 px-4 pt-4">
      <div className="space-y-2.5">
        {PORTAL_CLIENTS.map((client) => (
          <div
            key={client.id}
            className="flex items-center gap-3 rounded-xl border border-border/40 bg-background px-3 py-2.5 shadow-sm"
          >
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className={cn('text-[10px] font-semibold text-white', client.color)}>
                {client.initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-semibold text-foreground">{client.name}</p>
              <p className="text-[10px] text-muted-foreground">{client.time}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-success">{client.value}</span>
          </div>
        ))}
      </div>
      {/* Bottom spacer so illustration bleeds into card edge */}
      <div className="h-4" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Team collaboration illustration for card 3                        */
/* ------------------------------------------------------------------ */

function TeamIllustration() {
  return (
    <div className="mx-4 mt-6 overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-muted/40 px-4 pt-6">
      {/* Stacked avatars */}
      <div className="flex items-center justify-center">
        <div className="flex -space-x-2.5">
          {TEAM_MEMBERS.map((member, i) => (
            <Avatar
              key={member.id}
              className={cn(
                'h-11 w-11 border-2 border-background shadow-sm',
                i === 2 ? 'z-10 ring-2 ring-accent/40' : '',
              )}
            >
              <AvatarFallback className={cn('text-xs font-bold text-white', member.color)}>
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="mt-5 space-y-2">
        {TEAM_TASKS.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between rounded-xl border border-border/40 bg-background px-3 py-2.5 shadow-sm"
          >
            <span className="text-[11px] font-medium text-foreground/80">{task.label}</span>
            <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', task.stageClass)}>
              {task.stage}
            </span>
          </div>
        ))}
      </div>
      <div className="h-4" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function FeaturesSection() {
  return (
    <section className="bg-muted/20 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* ── Header ── */}
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-20">
          <FadeIn>
            <Badge variant="outline" className="text-sm font-normal">
              Our Platform
            </Badge>
          </FadeIn>
          <FadeIn>
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
              Every client engagement,<br className="hidden sm:block" /> seamlessly connected
            </h2>
          </FadeIn>
          <FadeIn>
            <p className="mx-auto max-w-xl text-lg text-muted-foreground">
              One workspace where proposals, campaigns, reports, and client conversations all live.
            </p>
          </FadeIn>
        </div>

        {/* ── Integration hub ── */}
        <FadeIn>
          <div className="relative mb-12 flex w-full flex-col items-center sm:mb-16 lg:mb-20">

            {/* Mobile: center pill only */}
            <div className="flex items-center gap-3 rounded-full bg-primary px-5 py-2.5 text-xl font-semibold text-primary-foreground shadow-xl lg:hidden">
              <LayoutDashboard className="h-5 w-5" />
              Cohorts
            </div>

            {/* Desktop: full hub layout */}
            <div className="relative flex w-full items-center justify-center max-lg:mt-6 max-lg:flex-wrap max-lg:gap-4 lg:justify-between">

              {/* Left chips */}
              <div className="flex gap-4 lg:flex-col lg:gap-16">
                {INTEGRATIONS_LEFT.map((chip) => (
                  <IntegrationChip key={chip.id} chip={chip} />
                ))}
              </div>

              <DotConnector />

              {/* Center pill (desktop only) */}
              <div className="hidden animate-pulse items-center gap-3 rounded-full bg-primary px-5 py-2.5 text-xl font-semibold text-primary-foreground shadow-2xl lg:flex">
                <LayoutDashboard className="h-5 w-5" />
                Cohorts
              </div>

              <DotConnector />

              {/* Right chips */}
              <div className="flex gap-4 lg:flex-col lg:gap-16">
                {INTEGRATIONS_RIGHT.map((chip) => (
                  <IntegrationChip key={chip.id} chip={chip} />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ── Feature cards ── */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Card 1: AI Proposals */}
          <FadeIn>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="px-6 pt-6 text-center">
                <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
                  <Sparkles className="h-5 w-5 text-accent" />
                  AI Proposals
                </div>
                <p className="mx-auto mt-2 max-w-[18rem] text-sm text-muted-foreground">
                  Draft tailored pitch decks with automated insights and instant presentation exports.
                </p>
              </div>
              <ProposalIllustration />
            </div>
          </FadeIn>

          {/* Card 2: Client Portal */}
          <FadeIn>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="px-6 pt-6 text-center">
                <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
                  <Users className="h-5 w-5 text-primary" />
                  Client Portal
                </div>
                <p className="mx-auto mt-2 max-w-[18rem] text-sm text-muted-foreground">
                  Give every client their own workspace to track performance, approve deliverables, and stay aligned.
                </p>
              </div>
              <PortalIllustration />
            </div>
          </FadeIn>

          {/* Card 3: Team Collaboration */}
          <FadeIn>
            <div className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm md:col-span-2 lg:col-span-1">
              <div className="px-6 pt-6 text-center">
                <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
                  <Bot className="h-5 w-5 text-primary" />
                  Team & Tasks
                </div>
                <p className="mx-auto mt-2 max-w-[18rem] text-sm text-muted-foreground">
                  Assign work, track progress, and coordinate across your agency team from a single board.
                </p>
              </div>
              <TeamIllustration />
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  )
}
