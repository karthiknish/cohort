import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { CookieSettingsButton } from './cookie-settings-button'

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
      { name: 'Cookies', href: '/cookies' },
      { name: 'Support', href: '/#contact' },
      { name: 'Contact', href: '/contact' },
    ],
  },
]

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-muted/50 bg-background/95">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Image src="/logo_new.svg" alt="Cohorts" width={50} height={50} className="h-20 w-20" priority />
        </Link>
            <p className="text-sm text-muted-foreground">
              The unified command center for high-performing marketing agencies. Streamline campaigns, track revenue,
              and keep clients delighted.
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
          <span>© {currentYear} Cohorts. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="transition hover:text-primary">
              Terms
            </Link>
            <Link href="/privacy" className="transition hover:text-primary">
              Privacy
            </Link>
            <Link href="/cookies" className="transition hover:text-primary">
              Cookies
            </Link>
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  )
}
