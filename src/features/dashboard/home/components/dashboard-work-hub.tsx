'use client'

import Link from 'next/link'
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckSquare,
  FileText,
  Home,
  Megaphone,
  MessageSquare,
  Video,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { DASHBOARD_THEME } from '@/lib/dashboard-theme'
import { WORKFORCE_ROUTES } from '@/lib/workforce-routes'
import type { WorkforceVisibility } from '@/types/workforce'
import { Badge } from '@/shared/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

type HubTile = {
  href: string
  title: string
  description: string
  icon: LucideIcon
  roles?: WorkforceVisibility[]
}

const CORE_DELIVERY_TILES: HubTile[] = [
  {
    href: '/dashboard/tasks',
    title: 'Tasks',
    description: 'Assignments, status, and due dates.',
    icon: CheckSquare,
  },
  {
    href: '/dashboard/projects',
    title: 'Projects',
    description: 'Milestones and delivery context.',
    icon: BriefcaseBusiness,
  },
  {
    href: '/dashboard/meetings',
    title: 'Meetings',
    description: 'Rooms, invites, and notes.',
    icon: Video,
  },
  {
    href: '/for-you',
    title: 'For You',
    description: 'Personalized priorities and activity.',
    icon: Home,
  },
]

const GROWTH_TILES: HubTile[] = [
  {
    href: '/dashboard/analytics',
    title: 'Analytics',
    description: 'Traffic, funnels, and trends.',
    icon: BarChart3,
  },
  {
    href: '/dashboard/ads',
    title: 'Ads',
    description: 'Paid media sync and performance.',
    icon: Megaphone,
    roles: ['admin', 'team'],
  },
  {
    href: '/dashboard/proposals',
    title: 'Proposals',
    description: 'Decks and client-ready assets.',
    icon: FileText,
    roles: ['admin', 'team'],
  },
]

const CLIENT_EXTRA_TILES: HubTile[] = [
  {
    href: '/dashboard/collaboration',
    title: 'Collaboration',
    description: 'Channels and direct messages.',
    icon: MessageSquare,
  },
  {
    href: '/dashboard/notifications',
    title: 'Notifications',
    description: 'Mentions and system alerts.',
    icon: Bell,
  },
]

function filterByRole(tiles: HubTile[], role: WorkforceVisibility): HubTile[] {
  return tiles.filter((tile) => !tile.roles || tile.roles.includes(role))
}

function HubCluster({
  label,
  description,
  tiles,
}: {
  label: string
  description?: string
  tiles: Array<{ href: string; title: string; description: string; icon: LucideIcon }>
}) {
  if (tiles.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-0.5 border-b border-muted/40 pb-2">
        <p className={DASHBOARD_THEME.stats.label}>{label}</p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => {
          const Icon = tile.icon
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className={cn(
                'group flex min-h-[5.5rem] flex-col rounded-xl border border-muted/50 bg-background/80 p-4 shadow-sm transition',
                'hover:border-primary/30 hover:bg-primary/[0.03] hover:shadow-md',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className={cn(
                    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" aria-hidden />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{tile.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{tile.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

type DashboardWorkHubProps = {
  userRole: string | null
}

/**
 * Connecteam-style hub: grouped shortcuts so desk and HQ roles reach time, comms, and delivery
 * without hunting the sidebar ([Connecteam](https://connecteam.com/) “all tools in one place” pattern).
 */
export function DashboardWorkHub({ userRole }: DashboardWorkHubProps) {
  const role = (userRole ?? 'client') as WorkforceVisibility
  const isClient = role === 'client'

  const operations = WORKFORCE_ROUTES.filter((r) => r.section === 'operations').map((r) => ({
    href: r.href,
    title: r.name,
    description: r.description,
    icon: r.icon,
  }))

  const people = WORKFORCE_ROUTES.filter((r) => r.section === 'people').map((r) => ({
    href: r.href,
    title: r.name,
    description: r.description,
    icon: r.icon,
  }))

  const coreTiles = isClient
    ? [...filterByRole(CORE_DELIVERY_TILES, role), ...CLIENT_EXTRA_TILES]
    : filterByRole(CORE_DELIVERY_TILES, role)

  const growthTiles = filterByRole(GROWTH_TILES, role)

  return (
    <Card className={cn(DASHBOARD_THEME.cards.base)}>
      <CardHeader className="space-y-2 border-b border-muted/40 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg tracking-tight">Work hub</CardTitle>
          <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide">
            One-tap modules
          </Badge>
        </div>
        <CardDescription className="max-w-3xl text-pretty">
          Jump straight into operations, conversations, and delivery—similar to how leading employee-ops suites surface
          scheduling, forms, and comms on the home screen, adapted for this workspace.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-6">
        {!isClient ? (
          <>
            <HubCluster
              label="Operations"
              description="Time, shifts, and repeatable field quality."
              tiles={operations}
            />
            <HubCluster label="People" description="Leave and availability." tiles={people} />
          </>
        ) : null}

        <HubCluster
          label={isClient ? 'Your workspace' : 'Core delivery'}
          description={isClient ? 'Tasks, projects, and team touchpoints.' : 'Execution threads everyone shares.'}
          tiles={coreTiles}
        />

        {!isClient && growthTiles.length > 0 ? (
          <HubCluster
            label="Performance & growth"
            description="Measurement and revenue-facing workflows."
            tiles={growthTiles}
          />
        ) : null}
      </CardContent>
    </Card>
  )
}
