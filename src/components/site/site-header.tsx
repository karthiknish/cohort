'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

const marketingLinks: { name: string; href: string }[] = []

export function SiteHeader() {
  const { user, loading, signOut } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed', error)
    } finally {
      setSigningOut(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-muted/50 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Image src="/logo.svg" alt="Cohorts" width={80} height={80} className="h-20 w-20" priority />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {marketingLinks.map((link) => (
            <Link key={link.name} href={link.href} className="transition hover:text-primary">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => {
              void handleSignOut()
            }}
            disabled={signingOut || loading || !user}
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
