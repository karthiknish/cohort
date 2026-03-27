'use client'

import { useCallback, useState } from 'react'

import { useAction } from 'convex/react'

import { adsTargetingApi } from '@/lib/convex-api'
import { useAuth } from '@/shared/contexts/auth-context'

import { Card } from '@/shared/ui/card'
import { toast } from '@/shared/ui/use-toast'
import { useClientContext } from '@/shared/contexts/client-context'

import { AudienceBuilderDialog } from './audience-builder-dialog'
import {
  AudienceTargetingContent,
  AudienceTargetingDisconnectedState,
  AudienceTargetingHeader,
} from './audience-targeting-card-sections'

// =============================================================================
// TYPES
// =============================================================================

export type TargetingData = {
  providerId: string
  entityId: string
  entityName?: string
  entityType: 'adGroup' | 'campaign'
  demographics: {
    ageRanges: string[]
    genders: string[]
    languages: string[]
  }
  audiences: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  locations: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  }
  interests: Array<{ id: string; name: string; category?: string }>
  keywords: Array<{ text: string; matchType?: string }>
  devices: string[]
  placements: string[]
  professional?: {
    industries: Array<{ id: string; name: string }>
    jobTitles: Array<{ id: string; name: string }>
    companySizes: string[]
    seniorities: string[]
  }
}

export type Insights = {
  totalEntities: number
  demographicCoverage: {
    hasAgeTargeting: boolean
    hasGenderTargeting: boolean
    hasLocationTargeting: boolean
  }
  audienceStats: {
    totalAudiences: number
    hasCustomAudiences: boolean
    hasRemarketingLists: boolean
  }
  interestStats: {
    totalInterests: number
    totalKeywords: number
  }
}

type Props = {
  providerId: string
  providerName: string
  isConnected: boolean
}

type AudienceTargetingResponse = {
  targeting?: TargetingData[]
  insights?: Insights | null
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AudienceTargetingCard({ providerId, providerName, isConnected }: Props) {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const getTargeting = useAction(adsTargetingApi.getTargeting)

  const [targeting, setTargeting] = useState<TargetingData[]>([])
  const [insights, setInsights] = useState<Insights | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [builderOpen, setBuilderOpen] = useState(false)

  const fetchTargeting = useCallback(async () => {
    if (!isConnected) return

    if (!workspaceId) {
      toast({
        title: 'Error',
        description: 'Missing workspace id',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    void getTargeting({
        workspaceId,
        providerId,
        clientId: selectedClientId ?? null,
      })

      .then((data) => {
        const payload = data as AudienceTargetingResponse | null | undefined
        setTargeting(Array.isArray(payload?.targeting) ? payload.targeting : [])
        setInsights(payload?.insights ?? null)
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to load audience targeting data'

        if (message.includes('not configured') || message.includes('missing token') || message.includes('expired')) {
          toast({
            title: 'Integration Issue',
            description: 'Please connect or refresh your Meta ad account.',
            variant: 'destructive',
          })
        } else if (message.includes('Meta API') || message.includes('Facebook')) {
          toast({
            title: 'Meta API Error',
            description: 'Could not fetch targeting data. Please check your connection and try again.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Error',
            description: message,
            variant: 'destructive',
          })
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }, [getTargeting, isConnected, providerId, selectedClientId, workspaceId])

  const handleOpenBuilder = useCallback(() => {
    setBuilderOpen(true)
  }, [])

  const handleEdit = useCallback(() => {}, [])

  const handleToggleExpanded = useCallback((entityId: string) => {
    setExpandedId((current) => (current === entityId ? null : entityId))
  }, [])

  const formatAgeRange = useCallback((range: string) => {
    return range.replace(/_/g, '-').replace('AGE', '').replace('RANGE', '').trim()
  }, [])

  if (!isConnected) {
    return <AudienceTargetingDisconnectedState providerName={providerName} />
  }

  return (
    <Card>
      <AudienceTargetingHeader insights={insights} loading={loading} onLoadTargeting={fetchTargeting} onOpenBuilder={handleOpenBuilder} providerName={providerName} />
      <AudienceTargetingContent expandedId={expandedId} formatAgeRange={formatAgeRange} insights={insights} onEdit={handleEdit} onToggleExpanded={handleToggleExpanded} targeting={targeting} />
      <AudienceBuilderDialog 
        isOpen={builderOpen} 
        onOpenChange={setBuilderOpen} 
        providerId={providerId} 
      />
    </Card>
  )
}
