'use client'

import Link from 'next/link'
import { ArrowUpRight, Briefcase, Shield, Trophy } from 'lucide-react'

import { FadeIn } from '@/shared/ui/animate-in'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { usePreview } from '@/shared/contexts/preview-context'

type DashboardRoleBannerProps = {
  userRole?: string | null
  userDisplayName?: string | null
}

export function DashboardRoleBanner({ userRole, userDisplayName }: DashboardRoleBannerProps) {
  const { isPreviewMode } = usePreview()

  if (isPreviewMode) return null

  if (userRole === 'admin') {
    return (
      <FadeIn>
        <Card className="border-primary/25 bg-primary/5">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/12">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-foreground">Administrator view</p>
              <p className="text-sm text-muted-foreground">
                Full workspace access, directory controls, and platform admin. The primary-colored stripe in the shell
                matches this role everywhere in the dashboard.
              </p>
            </div>
            <Link href="/admin" className="shrink-0">
              <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                Admin panel <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  if (userRole === 'team') {
    return (
      <FadeIn>
        <Card className="border-info/25 bg-info/5">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-info/15">
              <Briefcase className="h-5 w-5 text-info" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-foreground">Agency team view</p>
              <p className="text-sm text-muted-foreground">
                Delivery tools, shared clients, and internal collaboration. Use the client switcher in the header to move
                between workspaces—navigation and metrics follow that context.
              </p>
            </div>
            <Link href="/dashboard/tasks" className="shrink-0">
              <Button variant="outline" size="sm" className="border-info/30 text-info hover:bg-info/10">
                Tasks <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  if (userRole === 'client') {
    return (
      <FadeIn>
        <Card className="border-success/25 bg-success/5">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success/15">
              <Trophy className="h-5 w-5 text-success" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-medium text-foreground">
                Welcome back{userDisplayName?.trim() ? `, ${userDisplayName.split(' ')[0]}` : ''}
              </p>
              <p className="text-sm text-muted-foreground">
                This portal highlights your projects, proposals, and messages with your agency. Sensitive admin tools stay
                hidden for your role.
              </p>
            </div>
            <Link href="/dashboard/collaboration" className="shrink-0">
              <Button variant="outline" size="sm" className="border-success/30 text-success hover:bg-success/10">
                Collaboration <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return null
}
