'use client'

import { CircleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

type AdminQueryErrorAlertProps = {
  error: string | null
  title?: string
}

/**
 * Inline banner for Convex query/load failures on admin pages.
 */
export function AdminQueryErrorAlert({
  error,
  title = 'Unable to load data',
}: AdminQueryErrorAlertProps) {
  if (!error) {
    return null
  }

  return (
    <Alert variant="destructive">
      <CircleAlert className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
