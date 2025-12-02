'use client'

import { Calendar, Mail } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface ClientDetailsCardProps {
  billingEmail: string | null
  clientIndex: number
  totalClients: number
  createdAt: string | null
}

function formatDate(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ClientDetailsCard({
  billingEmail,
  clientIndex,
  totalClients,
  createdAt,
}: ClientDetailsCardProps) {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Client Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Billing Email</p>
            <p className="truncate font-medium" title={billingEmail ?? ''}>
              {billingEmail || 'Not provided'}
            </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Workspace Position</p>
            <p className="font-medium">
              {clientIndex >= 0 ? `#${clientIndex + 1} of ${totalClients}` : '—'}
            </p>
          </div>
        </div>
        {createdAt && (
          <>
            <Separator />
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(createdAt)}</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
