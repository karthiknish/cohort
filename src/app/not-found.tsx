import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-background via-muted/40 to-background px-6 py-24 text-center">
      <div className="space-y-4">
        <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          404 — Not Found
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">We couldn&apos;t find that page</h1>
        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          The link you followed may be broken, or the page may have been moved. Double-check the URL
          or head back to the dashboard to keep working on your campaigns.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go to landing page</Link>
        </Button>
      </div>
    </main>
  )
}
