'use client'

import { useAuth } from '@/shared/contexts/auth-context'

function formatGreetingDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function ForYouGreeting() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const salutation = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-muted-foreground">{formatGreetingDate(new Date())}</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.65rem]">
        {salutation}, {firstName}
      </h1>
    </div>
  )
}
