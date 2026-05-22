import { LoaderCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function ProfileCardLoading() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update the contact details that appear in proposals and client-facing emails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <output className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
          <LoaderCircle className="size-4 animate-spin" aria-hidden />
          Loading profile…
        </output>
      </CardContent>
    </Card>
  )
}
