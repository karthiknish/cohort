'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { calculateAlgorithmicInsights, calculateEfficiencyScore } from '@/lib/ad-algorithms'

import { CreativeHeader } from './components/creative-header'
import { CreativeSocialPreview } from './components/creative-social-preview'
import { CreativeEditorTabs } from './components/creative-editor-tabs'
import type { Creative } from './components/types'

type NormalizedAdMetric = {
  providerId: string
  adId: string
  adGroupId?: string
  campaignId: string
  name?: string
  date: string
  impressions: number
  clicks: number
  spend: number
  conversions: number
  revenue: number
  ctr?: number
  cpc?: number
  roas?: number
}

function unwrapApiData(payload: unknown): unknown {
  const record = payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : null
  return record && 'data' in record ? record.data : payload
}

export default function CreativeDetailPage() {
  const params = useParams<{ providerId: string; campaignId: string; creativeId: string }>()
  const searchParams = useSearchParams()
  const { selectedClientId } = useClientContext()

  const [creative, setCreative] = useState<Creative | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedHeadlines, setEditedHeadlines] = useState<string[]>([])
  const [editedDescriptions, setEditedDescriptions] = useState<string[]>([])
  const [editedCta, setEditedCta] = useState('')
  const [editedLandingPage, setEditedLandingPage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [generatingHeadlines, setGeneratingHeadlines] = useState(false)
  const [generatingDescriptions, setGeneratingDescriptions] = useState(false)

  const [days, setDays] = useState('7')
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [creativeMetrics, setCreativeMetrics] = useState<NormalizedAdMetric[] | null>(null)

  const campaignName = searchParams.get('campaignName') || 'Campaign'

  const fetchCreative = useCallback(async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        providerId: params.providerId,
        campaignId: params.campaignId,
      })
      if (selectedClientId) queryParams.set('clientId', selectedClientId)
      if (params.providerId === 'facebook') queryParams.set('includeMedia', '1')

      const response = await fetch(`/api/integrations/creatives?${queryParams.toString()}`)
      const payload = await response.json().catch(() => ({})) as unknown

      if (!response.ok) {
        throw new Error('Failed to load creatives')
      }

      const data = unwrapApiData(payload) as { creatives?: Creative[] } | undefined
      const creatives = Array.isArray(data?.creatives) ? data.creatives : []
      const match = creatives.find((c) => c.creativeId === params.creativeId)

      if (!match) {
        throw new Error('Creative not found')
      }

      setCreative(match)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load creative',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [params.providerId, params.campaignId, params.creativeId, selectedClientId])

  const fetchMetrics = useCallback(async () => {
    if (params.providerId === 'facebook') {
      setCreativeMetrics(null)
      setMetricsError(null)
      return
    }
    setMetricsLoading(true)
    setMetricsError(null)

    try {
      const queryParams = new URLSearchParams({
        providerId: params.providerId,
        campaignId: params.campaignId,
        days,
        level: params.providerId === 'linkedin' ? 'creative' : 'ad',
      })
      if (selectedClientId) queryParams.set('clientId', selectedClientId)
      if (creative?.adGroupId) queryParams.set('adGroupId', creative.adGroupId)

      const response = await fetch(`/api/integrations/metrics/ads?${queryParams.toString()}`)
      const payload = await response.json().catch(() => ({})) as unknown
      if (!response.ok) {
        throw new Error('Failed to load performance metrics')
      }

      const data = unwrapApiData(payload) as { metrics?: NormalizedAdMetric[] } | undefined
      const allMetrics = Array.isArray(data?.metrics) ? data.metrics : []
      const filtered = allMetrics.filter((m) => m.adId === params.creativeId)
      setCreativeMetrics(filtered)
    } catch (error) {
      setCreativeMetrics(null)
      setMetricsError(error instanceof Error ? error.message : 'Failed to load performance metrics')
    } finally {
      setMetricsLoading(false)
    }
  }, [params.providerId, params.campaignId, params.creativeId, days, selectedClientId, creative?.adGroupId])

  useEffect(() => {
    void fetchCreative()
  }, [fetchCreative])

  useEffect(() => {
    if (!creative) return
    void fetchMetrics()
  }, [creative, fetchMetrics])

  const handleCopy = async (text: string, field: string) => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback to execCommand for non-secure contexts or older browsers
        const textArea = document.createElement("textarea")
        textArea.value = text
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      setCopiedField(field)
      toast({
        title: "Copied to clipboard",
        description: "Text has been copied successfully.",
      })
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying manually.",
        variant: "destructive",
      })
    }
  }

  const startEditing = () => {
    if (!creative) return
    setEditedHeadlines(creative.headlines || [])
    setEditedDescriptions(creative.descriptions || [])
    setEditedCta(creative.callToAction || '')
    setEditedLandingPage(creative.landingPageUrl || '')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    setEditedHeadlines([])
    setEditedDescriptions([])
    setEditedCta('')
    setEditedLandingPage('')
  }

  const generateCopy = useCallback(async (kind: 'headlines' | 'captions') => {
    if (!creative) return
    if (!isEditing) {
      toast({
        title: 'Start editing to use AI',
        description: 'Click Edit to enable AI-assisted generation.',
      })
      return
    }

    const setLoading = kind === 'headlines' ? setGeneratingHeadlines : setGeneratingDescriptions
    setLoading(true)

    try {
      const payload: Record<string, unknown> = {
        providerId: params.providerId,
        clientId: selectedClientId ?? undefined,
        campaignId: params.campaignId,
        creativeId: params.creativeId,
        campaignName,
        creativeName: creative.name,
        landingPageUrl: editedLandingPage || creative.landingPageUrl,
        callToAction: editedCta || creative.callToAction,
        creativeType: creative.type,
        pageName: creative.pageName,
        existingHeadlines: (editedHeadlines.length ? editedHeadlines : (creative.headlines ?? [])).filter(Boolean),
        existingCaptions: (editedDescriptions.length ? editedDescriptions : (creative.descriptions ?? [])).filter(Boolean),
        kind: kind === 'headlines' ? 'headlines' : 'captions',
        count: 5,
      }

      const res = await fetch('/api/integrations/creatives/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': `${params.creativeId}-gen-${kind}-${Date.now()}`,
        },
        body: JSON.stringify(payload),
      })

      const resp = await res.json().catch(() => ({})) as unknown
      const rec = resp && typeof resp === 'object' ? (resp as Record<string, unknown>) : null
      if (!res.ok) {
        const msg = (rec && typeof rec.error === 'string' && rec.error) || (rec && typeof rec.message === 'string' && rec.message) || 'AI generation failed'
        throw new Error(msg)
      }

      const headlines = Array.isArray(rec?.headlines) ? (rec!.headlines as unknown[]).filter((v): v is string => typeof v === 'string') : []
      const captions = Array.isArray(rec?.captions) ? (rec!.captions as unknown[]).filter((v): v is string => typeof v === 'string') : []

      if (kind === 'headlines') {
        if (headlines.length === 0) {
          toast({ title: 'No new headlines', description: 'Try again with different inputs.' })
          return
        }
        setEditedHeadlines((prev) => {
          const base = prev.length ? prev : []
          const existing = new Set(base.map((s) => s.trim().toLowerCase()).filter(Boolean))
          const additions = headlines.filter((h) => {
            const key = h.trim().toLowerCase()
            if (!key) return false
            if (existing.has(key)) return false
            existing.add(key)
            return true
          })
          return [...base, ...additions]
        })
        toast({ title: 'Generated headlines', description: `Added ${headlines.length} new variant(s).` })
      } else {
        if (captions.length === 0) {
          toast({ title: 'No new captions', description: 'Try again with different inputs.' })
          return
        }
        setEditedDescriptions((prev) => {
          const base = prev.length ? prev : []
          const existing = new Set(base.map((s) => s.trim().toLowerCase()).filter(Boolean))
          const additions = captions.filter((c) => {
            const key = c.trim().toLowerCase()
            if (!key) return false
            if (existing.has(key)) return false
            existing.add(key)
            return true
          })
          return [...base, ...additions]
        })
        toast({ title: 'Generated captions', description: `Added ${captions.length} new variant(s).` })
      }
    } catch (error) {
      toast({
        title: 'AI generation error',
        description: error instanceof Error ? error.message : 'AI generation failed',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [campaignName, creative, editedCta, editedDescriptions, editedHeadlines, editedLandingPage, isEditing, params.campaignId, params.creativeId, params.providerId, selectedClientId])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate save - in a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (creative) {
        setCreative({
          ...creative,
          headlines: editedHeadlines.filter(h => h.trim()),
          descriptions: editedDescriptions.filter(d => d.trim()),
          callToAction: editedCta,
          landingPageUrl: editedLandingPage,
        })
      }

      toast({
        title: 'Changes saved',
        description: 'Your creative has been updated successfully.',
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addHeadline = () => {
    setEditedHeadlines([...editedHeadlines, ''])
  }

  const removeHeadline = (index: number) => {
    setEditedHeadlines(editedHeadlines.filter((_, i) => i !== index))
  }

  const updateHeadline = (index: number, value: string) => {
    const updated = [...editedHeadlines]
    updated[index] = value
    setEditedHeadlines(updated)
  }

  const addDescription = () => {
    setEditedDescriptions([...editedDescriptions, ''])
  }

  const removeDescription = (index: number) => {
    setEditedDescriptions(editedDescriptions.filter((_, i) => i !== index))
  }

  const updateDescription = (index: number, value: string) => {
    const updated = [...editedDescriptions]
    updated[index] = value
    setEditedDescriptions(updated)
  }

  const backUrl = `/dashboard/ads/campaigns/${params.providerId}/${params.campaignId}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

  const displayName = useMemo(() => {
    if (!creative) return params.creativeId
    return creative.name || creative.headlines?.[0] || creative.creativeId
  }, [creative, params.creativeId])

  const performanceSummary = useMemo(() => {
    if (!creativeMetrics) return null

    const totals = creativeMetrics.reduce(
      (acc, m) => {
        acc.impressions += m.impressions
        acc.clicks += m.clicks
        acc.spend += m.spend
        acc.conversions += m.conversions
        acc.revenue += m.revenue
        return acc
      },
      { impressions: 0, clicks: 0, spend: 0, conversions: 0, revenue: 0 }
    )

    const averageRoaS = totals.spend > 0 ? totals.revenue / totals.spend : 0
    const averageCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0

    return {
      providerId: params.providerId,
      totalSpend: totals.spend,
      totalRevenue: totals.revenue,
      totalClicks: totals.clicks,
      totalConversions: totals.conversions,
      totalImpressions: totals.impressions,
      averageRoaS,
      averageCpc,
      averageCtr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      averageConvRate: totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0,
      period: `Last ${days} days`,
      dayCount: Number(days),
      ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
      roas: averageRoaS,
      cpc: averageCpc,
    }
  }, [creativeMetrics, days, params.providerId])

  const efficiencyScore = useMemo(() => {
    if (!performanceSummary) return null
    return calculateEfficiencyScore(performanceSummary)
  }, [performanceSummary])

  const algorithmicInsights = useMemo(() => {
    if (!performanceSummary) return []
    return calculateAlgorithmicInsights(performanceSummary)
  }, [performanceSummary])

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <Skeleton className="aspect-square rounded-3xl" />
          </div>
          <div className="lg:col-span-7 space-y-4">
            <Skeleton className="h-[400px] rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!creative) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-lg font-medium">Creative Not Found</p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={backUrl}>Back to Campaign</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl">
      <CreativeHeader
        creative={creative}
        backUrl={backUrl}
        displayName={displayName}
        isEditing={isEditing}
        isSaving={isSaving}
        onStartEditing={startEditing}
        onCancelEditing={cancelEditing}
        onSave={handleSave}
        onRefreshCreative={fetchCreative}
        onRefreshPerformance={fetchMetrics}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        <CreativeSocialPreview
          creative={creative}
          campaignName={campaignName}
          displayName={displayName}
          performanceSummary={performanceSummary}
          efficiencyScore={efficiencyScore}
        />

        <CreativeEditorTabs
          providerId={params.providerId}
          creative={creative}
          copiedField={copiedField}
          onCopy={handleCopy}
          isEditing={isEditing}
          editedHeadlines={editedHeadlines}
          editedDescriptions={editedDescriptions}
          editedCta={editedCta}
          editedLandingPage={editedLandingPage}
          onAddHeadline={addHeadline}
          onRemoveHeadline={removeHeadline}
          onUpdateHeadline={updateHeadline}
          onAddDescription={addDescription}
          onRemoveDescription={removeDescription}
          onUpdateDescription={updateDescription}
          onChangeCta={setEditedCta}
          onChangeLandingPage={setEditedLandingPage}

          generatingHeadlines={generatingHeadlines}
          generatingDescriptions={generatingDescriptions}
          onGenerateHeadlines={() => void generateCopy('headlines')}
          onGenerateDescriptions={() => void generateCopy('captions')}
          days={days}
          onChangeDays={setDays}
          metricsLoading={metricsLoading}
          metricsError={metricsError}
          performanceSummary={performanceSummary}
          efficiencyScore={efficiencyScore}
          onRefreshPerformance={fetchMetrics}
          algorithmicInsights={algorithmicInsights}
        />
      </div>

    </div>
  )
}