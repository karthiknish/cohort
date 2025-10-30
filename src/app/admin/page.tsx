'use client'

import Link from 'next/link'
import { ArrowRight, Inbox, Megaphone, ShieldCheck, Users } from 'lucide-react'

import { useAuth } from '@/contexts/auth-context'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type AdminSection = {
  title: string
  description: string
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  cta: string
}

const adminSections: AdminSection[] = [
  {
    title: 'Team',
    description: 'Review invites, adjust access, and promote new admins.',
    href: '/admin/team',
    icon: Users,
    cta: 'Open team manager',
  },
  {
    title: 'Clients',
    description: 'Spin up client workspaces and keep delivery teams aligned.',
    href: '/admin/clients',
    icon: ShieldCheck,
    cta: 'Manage clients',
  },
  {
    title: 'Leads',
    description: 'Work through inbound messages and track follow-up statuses.',
    href: '/admin/leads',
    icon: Megaphone,
    cta: 'Review leads',
  },
]

export default function AdminPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-16">
        <Card className="max-w-md border-muted/60">
          <CardHeader>
            <CardTitle className="text-lg">Sign in required</CardTitle>
            <CardDescription>Log in to an admin account to access the console.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-muted/40">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin hub</h1>
            <p className="text-muted-foreground">
              Choose a workspace to manage your team, client pods, or lead intake pipeline.
            </p>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {adminSections.map(({ title, description, href, icon: Icon, cta }) => (
            <Card key={href} className="border-muted/60 bg-background shadow-sm transition hover:shadow-md">
              <CardHeader className="flex flex-row items-start gap-3">
                <div className="rounded-full border border-muted/60 bg-muted/20 p-2 text-muted-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild className="inline-flex items-center gap-2">
                  <Link href={href}>
                    {cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed border-muted/60 bg-background/80">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Inbox className="h-5 w-5 text-muted-foreground" />
                Need something else?
              </CardTitle>
              <CardDescription>
                Reach out to the platform team if you need a one-off admin workflow or custom permission.
              </CardDescription>
            </div>
            <Button asChild variant="ghost" className="self-start sm:self-auto">
              <Link href="/contact">Contact support</Link>
            </Button>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
