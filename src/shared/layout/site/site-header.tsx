'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'
import type { CSSProperties } from 'react'
import { LayoutDashboard, LogOut } from 'lucide-react'

import { getPreviewSettingsProfile } from '@/lib/preview-data'
import { Button } from '@/shared/ui/button'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { Badge } from '@/shared/ui/badge'
import { asErrorMessage } from '@/lib/convex-errors'
import { useToast } from '@/shared/ui/use-toast'

const SITE_HEADER_TRANSITION_STYLE = { viewTransitionName: 'site-header' } satisfies CSSProperties

export function SiteHeader() {
  const { toast } = useToast()
  const { user, loading, signOut } = useAuth()
  const { isPreviewMode } = usePreview()
  const pathname = usePathname()
  const [signingOut, setSigningOut] = useState(false)
  const showAccountActions = pathname === '/for-you' && (Boolean(user) || isPreviewMode)
  const previewProfile = getPreviewSettingsProfile()
  const displayedName = isPreviewMode ? previewProfile.name : (user?.name ?? user?.email ?? null)
  const displayedEmail = isPreviewMode ? previewProfile.email : (user?.email ?? null)

  const handleSignOut = useCallback(() => {
    setSigningOut(true)

    void signOut()
      .catch((error) => {
        console.error('Sign out failed', error)
        toast({
          title: 'Sign out failed',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setSigningOut(false)
      })
  }, [signOut, toast])

  return (
    <header
      className="sticky top-0 z-40 border-b border-muted/50 bg-background/90 backdrop-blur"
      style={SITE_HEADER_TRANSITION_STYLE}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Image src="/logo.svg" alt="Cohorts" width={80} height={80} className="h-20 w-20" priority />
        </Link>

        <div className="flex items-center gap-3">
          {/* Mobile actions */}
          {showAccountActions && (
            <div className="flex items-center gap-2 md:hidden">
              <Button asChild variant="default" size="icon" aria-label="Go to Dashboard">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-5 w-5" />
                </Link>
              </Button>
              {user ? (
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
              ) : null}
            </div>
          )}

          {/* Desktop account actions */}
          {showAccountActions && (
            <div className="hidden items-center gap-3 md:flex">
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {isPreviewMode ? (
                    <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px] uppercase tracking-[0.14em]">
                      Preview
                    </Badge>
                  ) : null}
                  <p className="max-w-45 truncate text-sm font-medium text-foreground">
                    {displayedName}
                  </p>
                </div>
                <p className="max-w-55 truncate text-xs text-muted-foreground">
                  {displayedEmail}
                </p>
              </div>
              <Button asChild variant="default" size="sm" className="gap-2">
                <Link href="/dashboard">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
              {user ? (
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
              ) : null}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
