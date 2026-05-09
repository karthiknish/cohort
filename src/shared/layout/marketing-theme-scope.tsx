'use client'

import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

function isAppShellRoute(pathname: string | null): boolean {
  if (!pathname) {
    return false
  }
  return (
    pathname.startsWith('/dashboard')
    || pathname.startsWith('/admin')
    || pathname.startsWith('/settings')
  )
}

/**
 * Wraps all pages to ensure consistent light theme layout.
 */
export function MarketingThemeScope({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {children}
    </div>
  )
}
