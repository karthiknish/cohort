'use client'

import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

export function SettingsPageSkeleton() {
  const fieldSlots = ['field-1', 'field-2', 'field-3', 'field-4']

  return (
    <main className="mx-auto w-full max-w-3xl space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-64" />
      </div>

      <Skeleton className="h-11 w-full rounded-xl" />

      <Card className="border-border/60">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          {fieldSlots.map((slot) => (
            <div key={slot} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 rounded-md" />
        </CardContent>
      </Card>
    </main>
  )
}
