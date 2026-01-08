'use client'

import { Calendar, Mail } from 'lucide-react'

import { Separator } from '@/components/ui/separator'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { DATE_FORMATS, formatDate as formatDateLib } from '@/lib/dates'

interface ClientDetailsCardProps {
  billingEmail: string | null
  clientIndex: number
  totalClients: number
  createdAt: string | null
}

function formatDate(value: string | null): string {
  return formatDateLib(value, DATE_FORMATS.SHORT, undefined, '—')
}

export function ClientDetailsCard({
  billingEmail,
  clientIndex,
  totalClients,
  createdAt,
}: ClientDetailsCardProps) {
  return (
    <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
      <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Client Identity</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        <div className="group flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-sm border border-primary/10 transition-colors group-hover:bg-primary/10">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Billing Corridor</p>
            <p className="mt-0.5 truncate text-xs font-black text-foreground" title={billingEmail ?? ''}>
              {billingEmail || 'Not configured'}
            </p>
          </div>
        </div>

        <div className="group flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/5 text-violet-500 shadow-sm border border-violet-500/10 transition-colors group-hover:bg-violet-500/10">
            <Calendar className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Workspace Index</p>
            <p className="mt-0.5 text-xs font-black text-foreground">
              {clientIndex >= 0 ? `#${clientIndex + 1} of ${totalClients} Global` : '—'}
            </p>
          </div>
        </div>

        {createdAt && (
          <div className="group flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/5 text-emerald-500 shadow-sm border border-emerald-500/10 transition-colors group-hover:bg-emerald-500/10">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Registration</p>
              <p className="mt-0.5 text-xs font-black text-foreground">{formatDate(createdAt)}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
