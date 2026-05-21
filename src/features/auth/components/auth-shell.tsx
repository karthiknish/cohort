'use client'

import Link from 'next/link'
import { BarChart3, Layers, ShieldCheck, Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

const HIGHLIGHTS = [
  {
    icon: Layers,
    title: 'One workspace per client',
    description: 'Campaigns, tasks, proposals, and reporting stay aligned in a single hub.',
  },
  {
    icon: BarChart3,
    title: 'Live performance context',
    description: 'Pull insights from connected ad platforms without jumping between tools.',
  },
  {
    icon: ShieldCheck,
    title: 'Built for agency teams',
    description: 'Role-aware access, secure sign-in, and audit-friendly workflows.',
  },
] as const

type AuthShellProps = {
  children: ReactNode
  className?: string
}

export function AuthShell({ children, className }: AuthShellProps) {
  return (
    <div className={cn('relative min-h-dvh overflow-hidden', className)}>
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/[0.08] via-background to-info/[0.06]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-info/10 blur-3xl"
        aria-hidden
      />

      <div className="relative grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_min(520px,44vw)]">
        <aside className="relative hidden flex-col justify-between border-r border-border/40 bg-background/40 p-10 xl:p-14 lg:flex">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3 rounded-2xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <span>
                <span className="block text-lg font-semibold tracking-tight text-foreground">Cohorts</span>
                <span className="block text-xs text-muted-foreground">AI-native agency workspace</span>
              </span>
            </Link>

            <div className="mt-14 max-w-md space-y-4">
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground xl:text-4xl">
                Run the agency.
                <span className="block text-primary">Prove the impact.</span>
              </h1>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                Sign in to manage clients, ship proposals, and keep your team on the same page — from first pitch to
                monthly reporting.
              </p>
            </div>
          </div>

          <ul className="mt-12 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                  <item.icon className="h-4 w-4" aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-medium text-foreground">{item.title}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex flex-col justify-center px-5 py-10 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
            </span>
            <div className="text-center">
              <p className="text-sm font-semibold tracking-tight text-foreground">Cohorts</p>
              <p className="text-[11px] text-muted-foreground">Agency workspace</p>
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}
