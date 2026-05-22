'use client'

import { useCallback, useEffect, useState } from 'react'
import { useAction } from 'convex/react'
import { Loader2, Users } from 'lucide-react'

import { adsAudiencesApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'

type MetaAudienceRow = {
  id: string
  name: string
  description?: string
  approximateCount?: number
  status?: string
}

type MetaAudiencesPanelProps = {
  workspaceId: string
  clientId?: string | null
}

export function MetaAudiencesPanel({ workspaceId, clientId }: MetaAudiencesPanelProps) {
  const listAudiences = useAction(adsAudiencesApi.listAudiences)
  const [audiences, setAudiences] = useState<MetaAudienceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const loadAudiences = useCallback(() => {
    setLoading(true)
    return listAudiences({
      workspaceId,
      providerId: 'facebook',
      clientId: clientId ?? null,
    })
      .then((rows) => {
        setAudiences(Array.isArray(rows) ? (rows as MetaAudienceRow[]) : [])
      })
      .catch((error) => {
        reportConvexFailure({
          error,
          context: 'MetaAudiencesPanel:listAudiences',
          title: 'Could not load audiences',
          fallbackMessage: 'Could not load audiences',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [clientId, listAudiences, workspaceId])

  useEffect(() => {
    void loadAudiences()
  }, [loadAudiences, refreshKey])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Loading Meta custom audiences…
      </div>
    )
  }

  if (audiences.length === 0) {
    return (
      <p className="py-4 text-xs text-muted-foreground">
        No custom audiences in this ad account yet. Create an empty container below, then upload customer lists in Meta Events Manager.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Existing audiences</p>
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setRefreshKey((k) => k + 1)}>
          Refresh
        </Button>
      </div>
      <ul className="max-h-40 space-y-1.5 overflow-auto">
        {audiences.map((audience) => (
          <li
            key={audience.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/10 px-3 py-2"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{audience.name}</p>
                {audience.approximateCount != null ? (
                  <p className="text-[10px] text-muted-foreground">
                    ~{audience.approximateCount.toLocaleString()} people
                  </p>
                ) : null}
              </div>
            </div>
            {audience.status ? (
              <Badge variant="outline" className="shrink-0 text-[10px]">
                {audience.status}
              </Badge>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}
