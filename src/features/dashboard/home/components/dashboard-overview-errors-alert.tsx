'use client'

import { LoaderCircle } from 'lucide-react'

import { FadeIn } from '@/shared/ui/animate-in'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

export function DashboardOverviewErrorsAlert({
  errors,
  isRefreshing,
  onRetry,
}: {
  errors: string[]
  isRefreshing: boolean
  onRetry: () => void
}) {
  if (errors.length === 0) return null

  return (
    <FadeIn>
      <Alert variant="destructive">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-1">
            <AlertTitle>Some data could not be loaded</AlertTitle>
            <AlertDescription>{errors.join(' ')}</AlertDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 border-destructive/40 bg-background hover:bg-destructive/10"
            onClick={onRetry}
            disabled={isRefreshing}
          >
            {isRefreshing ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Try again
          </Button>
        </div>
      </Alert>
    </FadeIn>
  )
}
