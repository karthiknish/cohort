'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'

const SITE_HEADER_TRANSITION_STYLE = { viewTransitionName: 'site-header' } satisfies CSSProperties

export function SiteHeader() {
  const pathname = usePathname()
  const isAppShellRoute =
    pathname.startsWith('/dashboard')
    || pathname.startsWith('/for-you')
    || pathname.startsWith('/admin')
    || pathname.startsWith('/settings')
    || pathname.startsWith('/auth')

  if (isAppShellRoute) {
    return null
  }

  return (
    <header
      className="sticky top-0 z-40 border-b border-border/40 bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={SITE_HEADER_TRANSITION_STYLE}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Image src="/logo.svg" alt="Cohorts" width={80} height={80} className="h-20 w-20" priority />
        </Link>
      </div>
    </header>
  )
}
