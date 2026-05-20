'use client'

import Image from 'next/image'
import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

import { getButtonClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'

export function ForYouShell() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href="/for-you"
          className="flex min-w-0 items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
        >
          <Image src="/logo.svg" alt="" width={36} height={36} className="h-9 w-9 shrink-0" priority />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold tracking-tight">Cohorts</p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              For you
            </p>
          </div>
        </Link>

        <Button
          asChild
          size="sm"
          className={cn('shrink-0 shadow-sm', getButtonClasses('primary'))}
        >
          <Link href="/dashboard">
            <LayoutDashboard aria-hidden="true" className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Link>
        </Button>
      </div>
    </header>
  )
}
