'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ChevronRight } from 'lucide-react'

import { useClientContext } from '@/shared/contexts/client-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { getPreviewClients } from '@/lib/preview-data'
import { cn } from '@/lib/utils'
import type { ClientRecord } from '@/types/clients'
import { Skeleton } from '@/shared/ui/skeleton'

const CLIENT_TILE_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-800',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-indigo-100 text-indigo-700',
] as const

const DEFAULT_CLIENT_TILE_COLOR = CLIENT_TILE_COLORS[0]

function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  const first = parts[0] ?? ''
  if (parts.length === 1) return first.slice(0, 2).toUpperCase()
  const second = parts[1] ?? ''
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

function ClientTile({ client, colorClass }: { client: ClientRecord; colorClass: string }) {
  return (
    <Link
      href={`/dashboard/clients?clientId=${encodeURIComponent(client.id)}`}
      className="group flex w-[7.5rem] shrink-0 flex-col items-center gap-2.5 rounded-xl border border-transparent p-3 transition-colors hover:border-border/80 hover:bg-muted/30 sm:w-[8.5rem]"
    >
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl text-sm font-bold shadow-sm',
          colorClass,
        )}
      >
        {clientInitials(client.name)}
      </div>
      <div className="w-full text-center">
        <p className="truncate text-sm font-semibold text-foreground">{client.name}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{client.accountManager}</p>
      </div>
    </Link>
  )
}

export function ForYouClients() {
  const { clients, loading } = useClientContext()
  const { isPreviewMode } = usePreview()

  const resolved = useMemo(
    () => (isPreviewMode || (!loading && clients.length === 0) ? getPreviewClients() : clients),
    [clients, isPreviewMode, loading],
  )

  const showSkeleton = loading && !isPreviewMode && clients.length === 0

  return (
    <section aria-labelledby="for-you-clients-heading" className="mb-10">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id="for-you-clients-heading" className="text-base font-semibold text-foreground">
          Your clients
        </h2>
        <Link
          href="/dashboard/clients"
          className="inline-flex items-center gap-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Show all
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      {showSkeleton ? (
        <div className="flex gap-2 overflow-hidden">
          {['a', 'b', 'c', 'd'].map((key) => (
            <Skeleton key={key} className="h-[7.5rem] w-[8.5rem] shrink-0 rounded-xl" />
          ))}
        </div>
      ) : resolved.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          No clients yet. Open the dashboard to add your first account.
        </p>
      ) : (
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-thin">
          {resolved.map((client, index) => (
            <ClientTile
              key={client.id}
              client={client}
              colorClass={CLIENT_TILE_COLORS[index % CLIENT_TILE_COLORS.length] ?? DEFAULT_CLIENT_TILE_COLOR}
            />
          ))}
        </div>
      )}
    </section>
  )
}
