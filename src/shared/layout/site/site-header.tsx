'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import { LayoutDashboard, LogOut } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { useAuth } from '@/shared/contexts/auth-context'

export function SiteHeader() {
  const { user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)
  const showAccountActions = pathname === '/for-you'

  const handleSignOut = useCallback(() => {
    setSigningOut(true)

    void signOut()
      .catch((error) => {
        console.error('Sign out failed', error)
      })
      .finally(() => {
        setSigningOut(false)
      })
  }, [signOut])

  return (
    <header className="sticky top-0 z-40 border-b border-muted/50 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Image src="/logo.svg" alt="Cohorts" width={80} height={80} className="h-20 w-20" priority />
        </Link>

        <div className="flex items-center gap-3">
          {/* Mobile actions */}
          {user && showAccountActions && (
            <div className="flex items-center gap-2 md:hidden">
              <Button asChild variant="default" size="icon" aria-label="Go to Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                disabled={signingOut || loading}
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          )}

          {/* Desktop account actions */}
          {user && showAccountActions && (
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right">
                <p className="max-w-[180px] truncate text-sm font-medium text-foreground">
                  {user.name ?? user.email}
                </p>
                <p className="max-w-[220px] truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <Button asChild variant="default" size="sm" className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                disabled={signingOut || loading}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {signingOut ? 'Signing out…' : 'Sign out'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
