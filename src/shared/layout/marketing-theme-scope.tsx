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
    || pathname.startsWith('/auth')
  )
}

/**
 * When `html` has `.dark` (system dark / user preference), semantic tokens still point at dark
 * ink on dark surfaces. Marketing surfaces use paper-white layouts — without resetting tokens,
 * `text-foreground` becomes light gray on white. This wrapper reapplies light palette vars via
 * `globals.css` (`.theme-marketing-light` under `html.dark`).
 */
export function MarketingThemeScope({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const marketingLight = !isAppShellRoute(pathname)

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col',
        marketingLight && 'theme-marketing-light bg-background text-foreground',
      )}
    >
      {children}
    </div>
  )
}
