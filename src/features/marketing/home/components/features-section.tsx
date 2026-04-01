'use client'

import type { CSSProperties } from 'react'
import Image from 'next/image'
import {
  BarChart3,
  Bot,
  BriefcaseBusiness,
  CreditCard,
  FileText,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'

import { motionDurationSeconds, motionEasing, motionLoopSeconds } from '@/lib/animation-system'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { FadeIn } from '@/shared/ui/animate-in'
import { LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion'

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

const PORTAL_CLIENTS = [
  {
    id: 'c1',
    name: 'NovaTech Digital',
    initials: 'NT',
    time: 'Today, 11:42',
    value: '+12.4%',
    color: 'bg-blue-500',
    tone: 'border-blue-500/20 bg-blue-500/5 text-blue-600',
    status: 'Report approved',
  },
  {
    id: 'c2',
    name: 'BlueOrbit Media',
    initials: 'BO',
    time: 'Today, 10:28',
    value: '+5.6%',
    color: 'bg-sky-500',
    tone: 'border-sky-500/20 bg-sky-500/5 text-sky-600',
    status: 'Campaign review',
  },
  {
    id: 'c3',
    name: 'Meridian Health',
    initials: 'MH',
    time: 'Today, 09:15',
    value: '+10.2%',
    color: 'bg-emerald-500',
    tone: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600',
    status: 'Deliverable ready',
  },
  {
    id: 'c4',
    name: 'Northstar Labs',
    initials: 'NL',
    time: 'Today, 08:54',
    value: '+7.9%',
    color: 'bg-violet-500',
    tone: 'border-violet-500/20 bg-violet-500/5 text-violet-600',
    status: 'Awaiting approval',
  },
] as const

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

const PROPOSAL_LINES_STYLE: CSSProperties[] = [
  { width: '75%' },
  { width: '100%' },
  { width: '83%' },
  { width: '60%' },
]

const HUB_DOT_DELAYS = [0.44, 0.22, 0, 0.22, 0.44] as const
const PORTAL_SCROLL_ITEMS = [...PORTAL_CLIENTS, ...PORTAL_CLIENTS]
const PORTAL_AVATAR_POSITIONS = [
  'left-3 top-6',
  'right-4 top-10',
  'left-10 bottom-8',
] as const

function DotConnector() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative hidden h-32 w-10 items-center justify-center lg:flex" aria-hidden="true">
        <div className="absolute inset-y-4 left-1/2 h-auto w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary/40 to-transparent" />
        <div className="flex flex-col items-center gap-3.5">
          {HUB_DOT_DELAYS.map((delay, index) => (
            <m.span
              key={index}
              className="block h-[5px] w-[5px] rounded-full bg-primary/60 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
              initial={prefersReducedMotion ? false : { opacity: 0.3, scale: 0.8 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.55 }
                  : {
                      opacity: [0.28, 1, 0.28],
                      scale: [0.8, 1.35, 0.8],
                      boxShadow: [
                        '0 0 0 rgba(32,125,255,0)',
                        '0 0 16px rgba(32,125,255,0.45)',
                        '0 0 0 rgba(32,125,255,0)',
                      ],
                    }
              }
              transition={{
                duration: motionLoopSeconds.pulseSlow,
                delay,
                repeat: Infinity,
                ease: motionEasing.inOut,
              }}
            />
          ))}
        </div>
      </div>
    </LazyMotion>
  )
}

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

function HubCore() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="relative hidden items-center rounded-full bg-primary px-5 py-2.5 shadow-2xl lg:flex"
        initial={prefersReducedMotion ? false : { scale: 0.97, opacity: 0.95 }}
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : {
                scale: [1, 1.035, 1],
                y: [0, -2, 0],
                boxShadow: [
                  '0 18px 40px rgba(15,23,42,0.18)',
                  '0 22px 52px rgba(37,99,235,0.28)',
                  '0 18px 40px rgba(15,23,42,0.18)',
                ],
              }
        }
        transition={{
          duration: motionLoopSeconds.pulse,
          repeat: Infinity,
          ease: motionEasing.inOut,
        }}
      >
        <m.span
          className="absolute inset-[1px] rounded-full border border-white/20"
          aria-hidden="true"
          initial={prefersReducedMotion ? false : { opacity: 0.25, scale: 0.96 }}
          animate={
            prefersReducedMotion
              ? { opacity: 0.2 }
              : { opacity: [0.15, 0.5, 0.15], scale: [0.96, 1.06, 0.96] }
          }
          transition={{
            duration: motionLoopSeconds.pulse,
            repeat: Infinity,
            ease: motionEasing.inOut,
          }}
        />
        <m.span
          className="absolute -inset-3 rounded-full border border-primary/20"
          aria-hidden="true"
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85 }}
          animate={prefersReducedMotion ? { opacity: 0 } : { opacity: [0, 0.35, 0], scale: [0.85, 1.16, 1.22] }}
          transition={{
            duration: motionLoopSeconds.pulse,
            repeat: Infinity,
            ease: motionEasing.out,
          }}
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
          {PROPOSAL_LINES_STYLE.map((style, index) => (
            <div key={index} className="h-[7px] rounded-full bg-muted/80" style={style} />
          ))}
        </div>

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

      <div className="mx-3 h-3 rounded-t-lg border border-b-0 border-border/30 bg-muted/20 opacity-60" />
      <div className="mx-5 h-2 rounded-t-lg border border-b-0 border-border/20 bg-muted/10 opacity-40" />
    </div>
  )
}

function PortalIllustration() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative mx-4 mt-6 overflow-hidden rounded-t-[1.25rem] border border-b-0 border-border/50 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0))] px-4 pt-4 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.2),_transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.55),rgba(15,23,42,0))]">
        <div className="relative overflow-hidden rounded-[1.15rem] border border-border/60 bg-background/95 p-3 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3 border-b border-border/50 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/65">Client portal</p>
              <p className="mt-1 text-sm font-semibold text-foreground">Live approvals and reporting</p>
            </div>
            <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-[10px] text-primary">
              4 active workspaces
            </Badge>
          </div>

          {PORTAL_AVATAR_POSITIONS.map((position, index) => {
              const member = PORTAL_CLIENTS[index]!
              return (
                <m.div
                  key={member.id}
                  className={cn('absolute z-10 hidden rounded-full border border-white/70 bg-background/90 p-1 shadow-lg md:block', position)}
                  initial={prefersReducedMotion ? false : { y: 0, opacity: 0.7 }}
                  animate={
                    prefersReducedMotion
                      ? { opacity: 0.8 }
                      : { y: [0, index % 2 === 0 ? -8 : 8, 0], opacity: [0.7, 1, 0.7] }
                  }
                  transition={{
                    duration: motionLoopSeconds.blob,
                    delay: index * 0.4,
                    repeat: Infinity,
                    ease: motionEasing.inOut,
                  }}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn('text-[10px] font-semibold text-white', member.color)}>
                      {member.initials}
                    </AvatarFallback>
                  </Avatar>
                </m.div>
              )
            })}

          <div className="relative h-[176px] overflow-hidden rounded-2xl border border-border/50 bg-muted/20 px-2 py-2">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-background via-background/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-12 bg-gradient-to-t from-background via-background/80 to-transparent" />

            <m.div
              className="space-y-2"
              initial={prefersReducedMotion ? false : { y: 0 }}
              animate={prefersReducedMotion ? { y: 0 } : { y: ['0%', '-50%'] }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: motionEasing.linear,
              }}
            >
              {PORTAL_SCROLL_ITEMS.map((client, index) => (
                <div
                  key={`${client.id}-${index}`}
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
        <div className="flex -space-x-2.5">
          {TEAM_MEMBERS.map((member, index) => (
            <Avatar
              key={member.id}
              className={cn(
                'h-11 w-11 border-2 border-background shadow-sm',
                index === 2 ? 'z-10 ring-2 ring-accent/40' : '',
              )}
            >
              <AvatarFallback className={cn('text-xs font-bold text-white', member.color)}>
                {member.initials}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
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

        <FadeIn>
          <div className="relative mb-12 flex w-full flex-col items-center sm:mb-16 lg:mb-20">
            <div className="flex items-center rounded-full bg-primary px-5 py-2.5 shadow-xl lg:hidden">
              <Image src="/logo_white.svg" alt="Cohorts" width={100} height={32} className="h-8 w-auto" priority />
            </div>

            <div className="relative flex w-full items-center justify-center max-lg:mt-6 max-lg:flex-wrap max-lg:gap-4 lg:justify-between">
              <div className="flex gap-4 lg:flex-col lg:gap-16">
                {INTEGRATIONS_LEFT.map((chip) => (
                  <IntegrationChip key={chip.id} chip={chip} />
                ))}
              </div>

              <DotConnector />
              <HubCore />
              <DotConnector />

              <div className="flex gap-4 lg:flex-col lg:gap-16">
                {INTEGRATIONS_RIGHT.map((chip) => (
                  <IntegrationChip key={chip.id} chip={chip} />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>

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
