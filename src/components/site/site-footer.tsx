import Link from 'next/link'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'


export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-muted/50 bg-background/95">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2">
          <div className="space-y-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Image src="/logo.svg" alt="Cohorts" width={50} height={50} className="h-20 w-20" priority />
        </Link>
            <p className="text-sm text-muted-foreground">
              The unified command center for high-performing marketing agencies. Streamline campaigns, track revenue,
              and keep clients delighted.
            </p>
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
          </div>
        </div>
      </div>
    </footer>
  )
}
