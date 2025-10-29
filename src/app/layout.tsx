import type { Metadata } from 'next'
import Link from 'next/link'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Menu } from 'lucide-react'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Cohorts - Marketing Agency Dashboard',
  description: 'Unified client management & analytics dashboard for marketing agencies',
}

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Features', href: '/#features' },
  { name: 'Integrations', href: '/#integrations' },
  { name: 'Contact', href: '/contact' },
  { name: 'Admin', href: '/admin' },
  { name: 'Dashboard', href: '/auth' },
]

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '/#features' },
      { name: 'Integrations', href: '/#integrations' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'Terms', href: '/terms' },
      { name: 'Privacy', href: '/privacy' },
      { name: 'Support', href: '/#contact' },
      { name: 'Contact', href: '/contact' },
    ],
  },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          'min-h-screen bg-background font-sans antialiased text-foreground'
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-40 border-b border-muted/50 bg-background/90 backdrop-blur">
              <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                <Link href="/marketing" className="text-lg font-semibold text-primary">
                  Cohorts
                </Link>
                <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
                  {navLinks.map((link) => (
                    <Link key={link.name} href={link.href} className="transition hover:text-primary">
                      {link.name}
                    </Link>
                  ))}
                </nav>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden" aria-label="Toggle navigation">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64 p-0">
                    <div className="border-b px-4 py-4">
                      <Link href="/marketing" className="text-base font-semibold text-primary">
                        Cohorts
                      </Link>
                    </div>
                    <ScrollArea className="h-full">
                      <nav className="flex flex-col gap-2 px-4 py-4 text-sm font-medium text-foreground">
                        {navLinks.map((link) => (
                          <Link key={link.name} href={link.href} className="rounded-md px-2 py-2 hover:bg-muted">
                            {link.name}
                          </Link>
                        ))}
                      </nav>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="border-t border-muted/50 bg-background/95">
              <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2">
                  <div className="space-y-3">
                    <Link href="/marketing" className="text-lg font-semibold text-primary">
                      Cohorts
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      The unified command center for high-performing marketing agencies. Streamline campaigns, track
                      revenue, and keep clients delighted.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    {footerLinks.map((group) => (
                      <div key={group.title} className="space-y-3">
                        <h4 className="font-semibold text-foreground">{group.title}</h4>
                        <ul className="space-y-2 text-muted-foreground">
                          {group.links.map((link) => (
                            <li key={link.name}>
                              <Link href={link.href} className="transition hover:text-primary">
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator className="my-8" />
                <div className="flex flex-col gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                  <span>© {new Date().getFullYear()} Cohorts. All rights reserved.</span>
                  <div className="flex items-center gap-4">
                    <Link href="/terms" className="transition hover:text-primary">
                      Terms
                    </Link>
                    <Link href="/privacy" className="transition hover:text-primary">
                      Privacy
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
