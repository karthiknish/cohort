'use client'

import Link from 'next/link'
import { ArrowUpRight, Shield, Trophy } from 'lucide-react'

import { FadeIn } from '@/shared/ui/animate-in'
import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'

type DashboardRoleBannerProps = {
  userRole?: string | null
  userDisplayName?: string | null
}

export function DashboardRoleBanner({ userRole, userDisplayName }: DashboardRoleBannerProps) {
  if (userRole === 'admin') {
    return (
      <FadeIn>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Admin Dashboard</p>
              <p className="text-sm text-muted-foreground">
                You have full access to all workspaces, team management, and administrative functions.
              </p>
            </div>
            <Link href="/admin">
              <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                Admin Panel <ArrowUpRight className="ml-1 h-3 w-3" />
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
        <Card className="border-green-200 bg-green-50">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Trophy className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-green-900">Welcome, {userDisplayName?.split(' ')[0] || 'Client'}!</p>
              <p className="text-sm text-green-700">
                View your project progress, proposals, and collaborate with your team.
              </p>
            </div>
            <Link href="/dashboard/collaboration">
              <Button variant="outline" size="sm" className="border-green-300 text-green-700 hover:bg-green-100">
                Messages <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </FadeIn>
    )
  }

  return null
}