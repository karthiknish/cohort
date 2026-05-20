'use client'

import { CircleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Button } from '@/shared/ui/button'

type AdminActionErrorAlertProps = {
  error: string | null
  title?: string
  onDismiss?: () => void
}

/**
 * Inline banner for the last failed admin mutation (dismissible).
 */
export function AdminActionErrorAlert({
  error,
  title = 'Last action failed',
  onDismiss,
}: AdminActionErrorAlertProps) {
  if (!error) {
    return null
  }

  return (
    <Alert variant="destructive">
      <CircleAlert className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span>{error}</span>
        {onDismiss ? (
          <Button type="button" size="sm" variant="outline" onClick={onDismiss}>
            Dismiss
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
