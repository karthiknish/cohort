'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/auth-context'

const marketingLinks: { name: string; href: string }[] = []

interface SessionLink {
  name: string
  href: string
}

export function SiteHeader() {
  const { user, loading, signOut } = useAuth()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === '/'

  const marketingLinksDisplay = isHome
    ? marketingLinks
    : marketingLinks.filter((link) => !['Home', 'Features', 'Integrations'].includes(link.name))

  const sessionLinks: SessionLink[] = user
    ? []
    : [{ name: 'Sign in', href: '/' }]

  const mobileLinks = [...marketingLinksDisplay, ...sessionLinks]

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed', error)
    } finally {
      setSigningOut(false)
      setSheetOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-muted/50 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Image src="/logo_new.svg" alt="Cohorts" width={50} height={50} className="h-20 w-20" priority />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {marketingLinksDisplay.map((link) => (
            <Link key={link.name} href={link.href} className="transition hover:text-primary">
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 p-0">
              <SheetHeader className="border-b px-4 py-4">
                <SheetTitle className="text-base font-semibold text-primary">
                  <Link href="/" className="flex items-center" onClick={() => setSheetOpen(false)}>
                    <Image src="/cohorts-logo.png" alt="Cohorts" width={44} height={44} className="h-11 w-11" />
                  </Link>
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full">
                <nav className="flex flex-col gap-2 px-4 py-4 text-sm font-medium text-foreground">
                  {mobileLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      className="rounded-md px-2 py-2 hover:bg-muted"
                      onClick={() => setSheetOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>
                {user ? (
                  <div className="px-4 pb-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        void handleSignOut()
                      }}
                      disabled={signingOut || loading}
                    >
                      {signingOut ? 'Signing out…' : 'Sign out'}
                    </Button>
                  </div>
                ) : null}
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    void handleSignOut()
                  }}
                  disabled={signingOut || loading}
                >
                  {signingOut ? 'Signing out…' : 'Sign out'}
                </Button>
              </>
            ) : (
              <Button asChild>
                <Link href="/">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
