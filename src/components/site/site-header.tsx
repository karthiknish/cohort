'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'

export function SiteHeader() {
  const { user, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = () => {
    setSigningOut(true)

    void signOut()
      .catch((error) => {
        console.error('Sign out failed', error)
      })
      .finally(() => {
        setSigningOut(false)
      })
  }

  return (
    <header className="sticky top-0 z-40 border-b border-muted/50 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Image src="/logo.svg" alt="Cohorts" width={80} height={80} className="h-20 w-20" priority />
        </Link>

        <div className="flex items-center gap-3">
          {/* Mobile sign-out icon */}
          {user && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={handleSignOut}
              disabled={signingOut || loading}
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}

          {/* Desktop user menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden items-center gap-2 md:flex"
                  disabled={loading}
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-[140px] truncate text-sm">
                    {user.name ?? user.email}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
