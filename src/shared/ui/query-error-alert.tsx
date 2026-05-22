'use client'

import { CircleAlert } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'

type QueryErrorAlertProps = {
  error: string | null
  title?: string
}

/** Inline banner for Convex query/load failures. */
export function QueryErrorAlert({
  error,
  title = 'Unable to load data',
}: QueryErrorAlertProps) {
  if (!error) {
    return null
  }

  return (
    <Alert variant="destructive">
      <CircleAlert className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
