'use client'

import { useAuth } from '@/shared/contexts/auth-context'
import { useClientNow } from '@/lib/hooks/use-client-relative-time'
import { cn } from '@/lib/utils'

import { SectionPatternBackground } from '@/features/marketing/components/section-pattern-background'

function formatGreetingDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function ForYouGreeting() {
  const { user } = useAuth()
  const now = useClientNow()
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const hour = now?.getHours() ?? 12
  const salutation = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <section
      className={cn(
        'relative mb-8 overflow-hidden rounded-2xl border border-primary/10',
        'bg-card/80 shadow-sm shadow-primary/[0.04] backdrop-blur-sm',
      )}
      aria-labelledby="for-you-greeting-heading"
    >
      <SectionPatternBackground variant="subtle" />
      <div className="relative px-5 py-6 sm:px-7 sm:py-7">
        <p className="text-sm font-medium tracking-wide text-muted-foreground" suppressHydrationWarning>
          {now ? formatGreetingDate(now) : '\u00a0'}
        </p>
        <h1
          id="for-you-greeting-heading"
          className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]"
        >
          {salutation}, {firstName}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Your priorities, clients, and next steps - in one place.
        </p>
      </div>
    </section>
  )
}
