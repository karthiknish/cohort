'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import { Bot, FileText, Sparkles, Users } from 'lucide-react'

import { motionDurationSeconds, motionEasing, motionLoopSeconds } from '@/lib/animation-system'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { PlatformBrandLogo, type PlatformBrandSlug } from '@/features/marketing/home/components/platform-brand-logos'
import { FadeIn } from '@/shared/ui/animate-in'
import { LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'

type IntegrationInsight = {
  stat: string
  label: string
  trend: string
  trendUp: boolean
}

type Integration = {
  id: string
  label: string
  brand: PlatformBrandSlug
  iconBg: string
  accentColor: string
  insights: IntegrationInsight[]
}

const HUB_CONNECTOR_DOTS = [
  { id: 'hub-dot-1', delay: 0 },
  { id: 'hub-dot-2', delay: 1 },
  { id: 'hub-dot-3', delay: 2 },
  { id: 'hub-dot-4', delay: 3 },
  { id: 'hub-dot-5', delay: 4 },
] as const

const CONNECTOR_DOT_INITIAL = { opacity: 0.15, scale: 0.7 } as const
const CONNECTOR_DOT_REDUCED = { opacity: 0.35 } as const
const CONNECTOR_DOT_ANIMATE = { opacity: [0.15, 1, 0.15], scale: [0.7, 1.3, 0.7] }
const HUB_CORE_INITIAL = { scale: 0.97, opacity: 0.95 } as const
const HUB_CORE_REDUCED = { opacity: 1 } as const
const HUB_CORE_ANIMATE = {
  scale: [1, 1.035, 1],
  y: [0, -2, 0],
  boxShadow: [
    '0 18px 40px hsl(var(--foreground) / 0.18)',
    '0 22px 52px hsl(var(--primary) / 0.28)',
    '0 18px 40px hsl(var(--foreground) / 0.18)',
  ],
}
const HUB_CORE_TRANSITION = {
  duration: motionLoopSeconds.pulse,
  repeat: Infinity,
  ease: motionEasing.inOut,
} as const
const HUB_RING_INITIAL = { opacity: 0.25, scale: 0.96 } as const
const HUB_RING_REDUCED = { opacity: 0.2 } as const
const HUB_RING_ANIMATE = { opacity: [0.15, 0.5, 0.15], scale: [0.96, 1.06, 0.96] }
const HUB_GLOW_INITIAL = { opacity: 0, scale: 0.85 } as const
const HUB_GLOW_REDUCED = { opacity: 0 } as const
const HUB_GLOW_ANIMATE = { opacity: [0, 0.35, 0], scale: [0.85, 1.16, 1.22] }
const HUB_GLOW_TRANSITION = {
  duration: motionLoopSeconds.pulse,
  repeat: Infinity,
  ease: motionEasing.out,
} as const
const PROPOSAL_BOUNCE_DOTS = [
  { id: 'proposal-bounce-1', style: { animationDelay: '0ms' } },
  { id: 'proposal-bounce-2', style: { animationDelay: '150ms' } },
  { id: 'proposal-bounce-3', style: { animationDelay: '300ms' } },
] as const satisfies readonly { id: string; style: CSSProperties }[]
const PORTAL_SCROLL_ANIMATE = { y: ['0%', '-50%'] }
const PORTAL_SCROLL_TRANSITION = {
  duration: 12,
  repeat: Infinity,
  repeatType: 'loop',
  ease: 'linear',
} as const
const TREE_CONNECTOR_BRANCH_STYLE = { left: 'calc(100% / 6)', right: 'calc(100% / 6)' } as const satisfies CSSProperties
const TREE_CONNECTOR_LEFT_STYLE = { left: 'calc(100% / 6)' } as const satisfies CSSProperties
const TREE_CONNECTOR_RIGHT_STYLE = { right: 'calc(100% / 6)' } as const satisfies CSSProperties

function getConnectorTransition(direction: 'ltr' | 'rtl', index: number) {
  return {
    duration: 2,
    delay: direction === 'ltr' ? index * 0.25 : (4 - index) * 0.25,
    repeat: Infinity,
    ease: 'easeInOut',
  } as const
}

const INTEGRATIONS_LEFT: Integration[] = [
  {
    id: 'google',
    label: 'Google Ads',
    brand: 'googleads',
    iconBg: 'bg-white ring-1 ring-border/70',
    accentColor: 'text-primary',
    insights: [
      { stat: '4.2×', label: 'Avg. ROAS', trend: '+18% MoM', trendUp: true },
      { stat: '3.8%', label: 'Click-through rate', trend: '+0.4pp', trendUp: true },
      { stat: '12', label: 'Active campaigns', trend: 'Synced live', trendUp: true },
    ],
  },
  {
    id: 'meta',
    label: 'Meta',
    brand: 'meta',
    iconBg: 'bg-white ring-1 ring-border/70',
    accentColor: 'text-info',
    insights: [
      { stat: '$8.40', label: 'Avg. CPM', trend: '−12% vs last week', trendUp: true },
      { stat: '2.4M', label: 'Total reach', trend: '+22% MoM', trendUp: true },
      { stat: '6', label: 'Ad sets active', trend: 'Auto-optimising', trendUp: true },
    ],
  },
]

const INTEGRATIONS_RIGHT: Integration[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    brand: 'linkedin',
    iconBg: 'bg-white ring-1 ring-border/70',
    accentColor: 'text-accent',
    insights: [
      { stat: '$34', label: 'Cost per lead', trend: '−8% vs last month', trendUp: true },
      { stat: '890', label: 'Leads this month', trend: '+11% MoM', trendUp: true },
      { stat: '5', label: 'Campaigns live', trend: 'All healthy', trendUp: true },
    ],
  },
  {
    id: 'stripe',
    label: 'Stripe',
    brand: 'stripe',
    iconBg: 'bg-white ring-1 ring-border/70',
    accentColor: 'text-success',
    insights: [
      { stat: '$48.2K', label: 'MRR tracked', trend: '+9% MoM', trendUp: true },
      { stat: '98.4%', label: 'Payment success rate', trend: 'Above benchmark', trendUp: true },
      { stat: '3', label: 'Active billing plans', trend: 'Auto-synced', trendUp: true },
    ],
  },
]

const PORTAL_CLIENTS = [
  {
    id: 'c1',
    name: 'NovaTech Digital',
    initials: 'NT',
    time: 'Today, 11:42',
    value: '+12.4%',
    color: 'bg-primary',
    tone: 'border-primary/20 bg-primary/10 text-primary',
    status: 'Report approved',
  },
  {
    id: 'c2',
    name: 'BlueOrbit Media',
    initials: 'BO',
    time: 'Today, 10:28',
    value: '+5.6%',
    color: 'bg-info',
    tone: 'border-info/20 bg-info/10 text-info',
    status: 'Campaign review',
  },
  {
    id: 'c3',
    name: 'Meridian Health',
    initials: 'MH',
    time: 'Today, 09:15',
    value: '+10.2%',
    color: 'bg-success',
    tone: 'border-success/20 bg-success/10 text-success',
    status: 'Deliverable ready',
  },
  {
    id: 'c4',
    name: 'Northstar Labs',
    initials: 'NL',
    time: 'Today, 08:54',
    value: '+7.9%',
    color: 'bg-accent',
    tone: 'border-accent/20 bg-accent/15 text-accent',
    status: 'Awaiting approval',
  },
] as const

const TEAM_MEMBERS = [
  { id: 't1', initials: 'JL', name: 'James Liu', color: 'bg-accent' },
  { id: 't2', initials: 'SR', name: 'Sofia Reyes', color: 'bg-primary' },
  { id: 't3', initials: 'KP', name: 'Kiran Patel', color: 'bg-success' },
  { id: 't4', initials: 'MA', name: 'Maya Adler', color: 'bg-warning' },
  { id: 't5', initials: 'DW', name: 'Dan Wright', color: 'bg-destructive' },
] as const

const TEAM_TASKS = [
  { id: 'tk1', label: 'Q3 report for Apex', stage: 'In review', stageClass: 'border-info/30 bg-info/10 text-info' },
  { id: 'tk2', label: 'Campaign brief: BlueOrbit', stage: 'Assigned', stageClass: 'border-accent/30 bg-accent/15 text-accent' },
  { id: 'tk3', label: 'Kickoff deck: Novex', stage: 'Done', stageClass: 'border-success/30 bg-success/10 text-success' },
] as const

const PROPOSAL_LINES_STYLE: CSSProperties[] = [
  { width: '75%' },
  { width: '100%' },
  { width: '83%' },
  { width: '60%' },
]

function ScrollGroup() {
  return (
    <div className="flex flex-col gap-2 py-1">
      {PORTAL_CLIENTS.map((client) => (
        <div
          key={client.id}
          className="flex items-center gap-3 rounded-[1.1rem] border border-border/50 bg-background/95 px-3 py-2.5 shadow-sm"
        >
          <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border/60">
            <AvatarFallback className={cn('text-[10px] font-semibold text-white', client.color)}>
              {client.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-[12px] font-semibold text-foreground">{client.name}</p>
              <span className="shrink-0 text-[12px] font-semibold text-success">{client.value}</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="truncate text-[10px] text-muted-foreground">{client.time}</p>
              <span className={cn('rounded-full border px-2 py-0.5 text-[9px] font-semibold', client.tone)}>
                {client.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DotConnector({ direction }: { direction: 'ltr' | 'rtl' }) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      {/* Dots only — the line is a full-width absolute behind the entire row */}
      <div className="hidden h-10 w-full items-center justify-evenly lg:flex" aria-hidden="true">
        {HUB_CONNECTOR_DOTS.map((dot, index) => (
          <m.span
            key={dot.id}
            className="block h-[5px] w-[5px] rounded-full bg-primary/50"
            initial={prefersReducedMotion ? false : CONNECTOR_DOT_INITIAL}
            animate={prefersReducedMotion ? CONNECTOR_DOT_REDUCED : CONNECTOR_DOT_ANIMATE}
            transition={getConnectorTransition(direction, index)}
          />
        ))}
      </div>
    </LazyMotion>
  )
}

function IntegrationChip({ chip }: { chip: Integration }) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex h-10 w-fit cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium shadow-sm transition-shadow hover:shadow-md">
            <span className={cn('flex h-6 w-6 items-center justify-center rounded-md', chip.iconBg)}>
              <PlatformBrandLogo brand={chip.brand} className="h-4 w-4" labeled={false} />
            </span>
            {chip.label}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={8}
          className="w-52 border border-border/60 bg-popover p-0 shadow-xl"
        >
          <div className="px-3 pt-3 pb-2">
            <div className="mb-2.5 flex items-center gap-2">
              <span className={cn('flex h-5 w-5 items-center justify-center rounded', chip.iconBg)}>
                <PlatformBrandLogo brand={chip.brand} className="h-3.5 w-3.5" labeled={false} />
              </span>
              <span className="text-[11px] font-semibold text-foreground">{chip.label}</span>
              <span className="ml-auto rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-semibold text-success">Live</span>
            </div>
            <div className="space-y-2">
              {chip.insights.map((insight) => (
                <div key={`${chip.id}-${insight.label}`} className="flex items-center justify-between">
                  <div>
                    <span className={cn('text-[13px] font-bold tabular-nums', chip.accentColor)}>{insight.stat}</span>
                    <p className="text-[10px] text-muted-foreground">{insight.label}</p>
                  </div>
                  <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-[9px] font-medium text-success">
                    {insight.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-border/40 px-3 py-1.5">
            <p className="text-[9px] text-muted-foreground/60">Synced via Cohorts · Updated just now</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function HubCore() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="relative hidden items-center rounded-full bg-primary px-5 py-2.5 shadow-2xl lg:flex"
        initial={prefersReducedMotion ? false : HUB_CORE_INITIAL}
        animate={prefersReducedMotion ? HUB_CORE_REDUCED : HUB_CORE_ANIMATE}
        transition={HUB_CORE_TRANSITION}
      >
        <m.span
          className="absolute inset-[1px] rounded-full border border-white/20"
          aria-hidden="true"
          initial={prefersReducedMotion ? false : HUB_RING_INITIAL}
          animate={prefersReducedMotion ? HUB_RING_REDUCED : HUB_RING_ANIMATE}
          transition={HUB_CORE_TRANSITION}
        />
        <m.span
          className="absolute -inset-3 rounded-full border border-primary/20"
          aria-hidden="true"
          initial={prefersReducedMotion ? false : HUB_GLOW_INITIAL}
          animate={prefersReducedMotion ? HUB_GLOW_REDUCED : HUB_GLOW_ANIMATE}
          transition={HUB_GLOW_TRANSITION}
        />
        <Image src="/logo_white.svg" alt="Cohorts" width={100} height={32} className="relative h-8 w-auto" priority />
      </m.div>
    </LazyMotion>
  )
}

function ProposalIllustration() {
  return (
    <div className="mx-4 mt-6 overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-muted/40 px-4 pt-4">
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

        <div className="space-y-1.5">
          {PROPOSAL_LINES_STYLE.map((style) => (
            <div key={String(style.width)} className="h-[7px] rounded-full bg-muted/80" style={style} />
          ))}
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-border/40 pt-3">
          <Sparkles className="h-3 w-3 text-accent" />
          <span className="text-[10px] text-muted-foreground">AI generating insights</span>
          <div className="ml-auto flex items-center gap-[3px]">
            {PROPOSAL_BOUNCE_DOTS.map((dot) => (
              <span
                key={dot.id}
                className="block h-1.5 w-1.5 animate-bounce rounded-full bg-accent"
                style={dot.style}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-3 h-3 rounded-t-lg border border-b-0 border-border/30 bg-muted/20 opacity-60" />
      <div className="mx-5 h-2 rounded-t-lg border border-b-0 border-border/20 bg-muted/10 opacity-40" />
    </div>
  )
}

function PortalIllustration() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative mx-4 mt-6 overflow-hidden rounded-t-[1.25rem] border border-b-0 border-border/50 bg-muted/35 px-4 pt-4">
        <div className="relative overflow-hidden rounded-[1.15rem] border border-border/60 bg-background/95 p-3 shadow-xl backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/50 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/65">Client portal</p>
              <p className="mt-1 text-sm font-semibold text-foreground">Live approvals and reporting</p>
            </div>
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-[10px] text-primary">
              4 active workspaces
            </Badge>
          </div>

          <div className="relative h-[176px] overflow-hidden rounded-2xl border border-border/50 bg-muted/20 px-2 py-2">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background via-background/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background via-background/80 to-transparent" />

            <m.div
              className="flex flex-col"
              animate={prefersReducedMotion ? undefined : PORTAL_SCROLL_ANIMATE}
              transition={PORTAL_SCROLL_TRANSITION}
            >
              <ScrollGroup />
              <ScrollGroup />
            </m.div>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </LazyMotion>
  )
}

function TeamIllustration() {
  return (
    <div className="mx-4 mt-6 overflow-hidden rounded-t-xl border border-b-0 border-border/50 bg-muted/40 px-4 pt-6">
      <div className="flex items-center justify-center">
        <TooltipProvider delayDuration={100}>
          <div className="flex -space-x-2.5">
            {TEAM_MEMBERS.map((member, index) => (
              <Tooltip key={member.id}>
                <TooltipTrigger asChild>
                  <Avatar
                    className={cn(
                      'h-11 w-11 cursor-pointer border-2 border-background shadow-sm transition-transform hover:-translate-y-1 hover:z-20',
                      index === 2 ? 'z-10 ring-2 ring-accent/40' : '',
                    )}
                  >
                    <AvatarFallback className={cn('text-xs font-bold text-white', member.color)}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className={cn('border-0 text-white', member.color)}
                >
                  {member.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>

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

export function FeaturesSection() {
  return (
    <section className="bg-muted/20 py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 space-y-4 text-center sm:mb-16 lg:mb-20">
          <FadeIn>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/50">Our Platform</p>
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

        <FadeIn>
          <div className="relative mb-12 flex w-full flex-col items-center sm:mb-16 lg:mb-20">
            <div className="flex items-center rounded-full bg-primary px-5 py-2.5 shadow-xl lg:hidden">
              <Image src="/logo_white.svg" alt="Cohorts" width={100} height={32} className="h-8 w-auto" priority />
            </div>

            <div className="relative max-lg:mt-6 max-lg:flex max-lg:flex-wrap max-lg:items-center max-lg:justify-center max-lg:gap-4 lg:grid lg:w-full lg:grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto] lg:items-center">
              {/* Full-width line behind everything */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[1px] -translate-y-1/2 bg-border/60 lg:block" />

              <div className="relative z-10 flex gap-4 lg:flex-col lg:gap-16">
                {INTEGRATIONS_LEFT.map((chip) => (
                  <IntegrationChip key={chip.id} chip={chip} />
                ))}
              </div>

              <DotConnector direction="ltr" />
              <div className="relative z-10">
                <HubCore />
              </div>
              <DotConnector direction="rtl" />

              <div className="relative z-10 flex gap-4 lg:flex-col lg:gap-16">
                {INTEGRATIONS_RIGHT.map((chip) => (
                  <IntegrationChip key={chip.id} chip={chip} />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Tree connector: hub -> 3 cards */}
        <div className="pointer-events-none relative -mt-8 mb-0 hidden h-16 lg:block">
          {/* Vertical line from hub section */}
          <div className="absolute left-1/2 top-0 h-8 w-[1px] -translate-x-1/2 bg-gradient-to-b from-border/60 to-border/40" />
          {/* Horizontal branch */}
          <div className="absolute top-8 h-[1px] bg-border/40" style={TREE_CONNECTOR_BRANCH_STYLE} />
          {/* Vertical drops to each card */}
          <div className="absolute top-8 h-8 w-[1px] bg-border/40" style={TREE_CONNECTOR_LEFT_STYLE} />
          <div className="absolute left-1/2 top-8 h-8 w-[1px] -translate-x-1/2 bg-border/40" />
          <div className="absolute top-8 h-8 w-[1px] bg-border/40" style={TREE_CONNECTOR_RIGHT_STYLE} />
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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
