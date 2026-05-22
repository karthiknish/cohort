'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { BarChart3, Bell, BriefcaseBusiness, CheckSquare } from 'lucide-react'

import { cn } from '@/lib/utils'

type QuickLink = {
  name: string
  href: string
  description: string
  icon: LucideIcon
  iconClass: string
}

const QUICK_LINKS: QuickLink[] = [
  {
    name: 'Projects',
    href: '/dashboard/projects',
    description: 'Delivery & milestones',
    icon: BriefcaseBusiness,
    iconClass: 'bg-primary/10 text-primary',
  },
  {
    name: 'Tasks',
    href: '/dashboard/tasks',
    description: 'Assignments & due dates',
    icon: CheckSquare,
    iconClass: 'bg-sky-100 text-sky-700',
  },
  {
    name: 'Notifications',
    href: '/dashboard/notifications',
    description: 'Mentions & alerts',
    icon: Bell,
    iconClass: 'bg-amber-100 text-amber-800',
  },
  {
    name: 'Analytics',
    href: '/dashboard/analytics',
    description: 'Performance & reports',
    icon: BarChart3,
    iconClass: 'bg-violet-100 text-violet-700',
  },
]

function QuickLinkCard({ link }: { link: QuickLink }) {
  const Icon = link.icon

  return (
    <Link
      href={link.href}
      className="group flex min-w-0 flex-1 flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-[border-color,box-shadow] hover:border-border hover:shadow-md"
    >
      <div className={cn('flex size-9 items-center justify-center rounded-lg', link.iconClass)}>
        <Icon className="size-[18px]" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">{link.name}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">Dashboard · {link.description}</p>
      </div>
    </Link>
  )
}

export function ForYouQuickLinks() {
  return (
    <section aria-labelledby="for-you-quick-links-heading" className="mb-10">
      <h2 id="for-you-quick-links-heading" className="mb-3 text-base font-semibold text-foreground">
        Quick links
      </h2>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_LINKS.map((link) => (
          <QuickLinkCard key={link.href} link={link} />
        ))}
      </div>
    </section>
  )
}
