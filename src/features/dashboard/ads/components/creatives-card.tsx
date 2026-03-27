'use client'

import { useCallback, useState } from 'react'
import { useAction } from 'convex/react'

import { Card } from '@/shared/ui/card'
import { toast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsCreativesApi } from '@/lib/convex-api'

import {
  CreativeComparisonDialog,
  CreativesCardContent,
  CreativesCardHeader,
  CreativesDisconnectedState,
  type Creative,
} from './creatives-card-sections'

// =============================================================================
// TYPES
// =============================================================================

type Props = {
  providerId: string
  providerName: string
  isConnected: boolean
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CreativesCard({ providerId, providerName, isConnected }: Props) {
  const { user } = useAuth()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null
  const listCreatives = useAction(adsCreativesApi.listCreatives)

  const [creatives, setCreatives] = useState<Creative[]>([])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<{ total: number; byType: Record<string, number> } | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [compareOpen, setCompareOpen] = useState(false)

  const handleOpenCompare = useCallback(() => {
    setCompareOpen(true)
  }, [])

  const handlePromoteCreative = useCallback(() => {
    toast({
      title: 'A/B Test Action',
      description: 'Creative promoted to primary. Syncing with platform...',
    })
  }, [])

  const fetchCreatives = useCallback(async () => {
    if (!isConnected) return

    setLoading(true)
    if (!workspaceId) {
      setLoading(false)
      return
    }

    void listCreatives({
        workspaceId,
        providerId,
        clientId: null,
      })

      .then((creativesList) => {
        setCreatives(Array.isArray(creativesList) ? (creativesList as Creative[]) : [])
        setSummary(null)
      })
      .catch((error) => {
        logError(error, 'CreativesCard:fetchCreatives')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [isConnected, listCreatives, providerId, workspaceId])

  const handleToggleSelected = useCallback((creativeId: string) => {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(creativeId)) {
        next.delete(creativeId)
      } else {
        next.add(creativeId)
      }
      return next
    })
  }, [])

  if (!isConnected) {
    return <CreativesDisconnectedState providerName={providerName} />
  }

  return (
    <Card>
      <CreativesCardHeader loading={loading} onCompare={handleOpenCompare} onLoad={fetchCreatives} providerName={providerName} selectedCount={selectedIds.size} summary={summary} />
      <CreativesCardContent creatives={creatives} onToggleSelected={handleToggleSelected} selectedIds={selectedIds} summary={summary} />
      <CreativeComparisonDialog creatives={creatives} onOpenChange={setCompareOpen} onPromote={handlePromoteCreative} open={compareOpen} providerName={providerName} selectedIds={selectedIds} />
    </Card>
  )
}
