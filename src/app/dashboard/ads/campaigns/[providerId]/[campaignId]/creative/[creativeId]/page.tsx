'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/use-toast'
import { useClientContext } from '@/contexts/client-context'
import { useAuth } from '@/contexts/auth-context'
import { usePreview } from '@/contexts/preview-context'
import { calculateAlgorithmicInsights, calculateEfficiencyScore } from '@/lib/ad-algorithms'
import { useAction } from 'convex/react'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsAdMetricsApi, adsCreativesApi, creativesCopyApi } from '@/lib/convex-api'
import { isoDaysAgo } from '@/lib/preview-data'

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

type ProviderId = 'google' | 'tiktok' | 'linkedin' | 'facebook'

function isProviderId(value: string): value is ProviderId {
  return value === 'google' || value === 'tiktok' || value === 'linkedin' || value === 'facebook'
}

function buildPreviewCreative(
  providerId: ProviderId,
  campaignId: string,
  creativeId: string,
  campaignName: string,
): Creative {
  const baseCreative = {
    providerId,
    creativeId,
    campaignId,
    campaignName,
    status: providerId === 'google' ? 'ENABLED' : 'ACTIVE',
  }

  switch (providerId) {
    case 'linkedin':
      return {
        ...baseCreative,
        name: 'Executive Pipeline Narrative',
        type: 'image',
        headlines: ['Turn paid media into qualified pipeline, not vanity clicks'],
        descriptions: ['Position your team as the clear category leader with proof-led creative, sharper ICP targeting, and landing pages designed for decision makers.'],
        imageUrl: 'https://placehold.co/1200x1200/png?text=LinkedIn+Creative',
        landingPageUrl: 'https://techcorp.example/demo',
        callToAction: 'LEARN_MORE',
        pageName: 'Tech Corp',
        pageProfileImageUrl: 'https://placehold.co/80x80/png?text=TC',
        metrics: {
          impressions: 48200,
          clicks: 912,
          spend: 1240,
          conversions: 38,
        },
      }
    case 'google':
      return {
        ...baseCreative,
        name: 'Brand Search Expansion',
        type: 'search',
        headlines: ['Capture demand already looking for you'],
        descriptions: ['Tighten intent capture, lower wasted spend, and direct high-intent traffic into a conversion-first landing flow.'],
        landingPageUrl: 'https://startupxyz.example/waitlist',
        callToAction: 'SIGN_UP',
        pageName: 'StartupXYZ',
        metrics: {
          impressions: 36100,
          clicks: 1348,
          spend: 880,
          conversions: 71,
        },
      }
    case 'tiktok':
      return {
        ...baseCreative,
        name: 'Launch Momentum Cutdown',
        type: 'video',
        headlines: ['Make launch week impossible to ignore'],
        descriptions: ['Fast-paced product proof, creator energy, and a simple CTA built for waitlist growth during launch week.'],
        imageUrl: 'https://placehold.co/1080x1920/png?text=TikTok+Preview',
        thumbnailUrl: 'https://placehold.co/1080x1920/png?text=TikTok+Preview',
        landingPageUrl: 'https://startupxyz.example/app',
        callToAction: 'DOWNLOAD',
        pageName: 'StartupXYZ',
        pageProfileImageUrl: 'https://placehold.co/80x80/png?text=SX',
        metrics: {
          impressions: 112000,
          clicks: 2840,
          spend: 940,
          conversions: 54,
        },
      }
    case 'facebook':
    default:
      return {
        ...baseCreative,
        name: 'Spring Collection Hero',
        type: 'image',
        headlines: ['Make every scroll feel like a store visit'],
        descriptions: ['Showcase your spring collection with dynamic product storytelling, stronger urgency, and repeat-purchase messaging built for higher AOV.'],
        imageUrl: 'https://placehold.co/1200x1200/png?text=Meta+Creative',
        landingPageUrl: 'https://retailstore.example/spring',
        callToAction: 'SHOP_NOW',
        pageName: 'Retail Store',
        pageProfileImageUrl: 'https://placehold.co/80x80/png?text=RS',
        metrics: {
          impressions: 84600,
          clicks: 1834,
          spend: 640,
          conversions: 96,
        },
      }
  }
}

function buildPreviewCreativeMetrics(
  providerId: ProviderId,
  creativeId: string,
  campaignId: string,
  days: string,
): NormalizedAdMetric[] {
  const dayCount = Math.max(1, Number.parseInt(days, 10) || 7)
  const baseByProvider: Record<ProviderId, { impressions: number; clicks: number; spend: number; conversions: number; revenue: number }> = {
    google: { impressions: 5200, clicks: 180, spend: 126, conversions: 9, revenue: 950 },
    facebook: { impressions: 9800, clicks: 220, spend: 88, conversions: 11, revenue: 760 },
    linkedin: { impressions: 2600, clicks: 52, spend: 178, conversions: 3, revenue: 1100 },
    tiktok: { impressions: 13200, clicks: 320, spend: 104, conversions: 6, revenue: 620 },
  }

  const base = baseByProvider[providerId]

  return Array.from({ length: dayCount }, (_, index) => {
    const impressions = Math.round(base.impressions * (0.88 + index * 0.03))
    const clicks = Math.round(base.clicks * (0.9 + index * 0.025))
    const spend = Math.round(base.spend * (0.92 + index * 0.02) * 100) / 100
    const conversions = Math.round(base.conversions * (0.86 + index * 0.04))
    const revenue = Math.round(base.revenue * (0.9 + index * 0.03))

    return {
      providerId,
      adId: creativeId,
      campaignId,
      date: isoDaysAgo(dayCount - index - 1).split('T')[0] ?? isoDaysAgo(dayCount - index - 1),
      impressions,
      clicks,
      spend,
      conversions,
      revenue,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      cpc: clicks > 0 ? spend / clicks : 0,
      roas: spend > 0 ? revenue / spend : 0,
    }
  })
}

function buildPreviewCopySuggestions(kind: 'headlines' | 'captions', creative: Creative, campaignName: string): string[] {
  const baseName = creative.pageName || creative.campaignName || creative.name || campaignName

  if (kind === 'headlines') {
    return [
      `${baseName} with clearer performance proof`,
      `The fastest route from impression to action for ${baseName}`,
      `Creative built to convert high-intent buyers, not just attract clicks`,
    ]
  }

  return [
    `Give ${baseName} a stronger hook, sharper social proof, and a cleaner CTA so the ad does more than win attention. It should push people into the next step with less friction.`,
    `Use this version when you want the first sentence to establish urgency, the middle section to prove credibility, and the close to point directly at the offer.`,
    `This sample caption keeps the message concise while still covering the customer problem, the core promise, and the action worth taking right now.`,
  ]
}

export default function CreativeDetailPage() {
  const params = useParams<{ providerId: string; campaignId: string; creativeId: string }>()
  const searchParams = useSearchParams()
  const { selectedClientId } = useClientContext()
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const listCreatives = useAction(adsCreativesApi.listCreatives)
  const updateCreative = useAction(adsCreativesApi.updateCreative)
  const listAdMetrics = useAction(adsAdMetricsApi.listAdMetrics)
  const generateCopyAction = useAction(creativesCopyApi.generateCopy)

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

    if (!isProviderId(params.providerId)) {
      setLoading(false)
      toast({
        title: 'Unsupported provider',
        description: 'This provider is not supported in the creative detail view.',
        variant: 'destructive',
      })
      return
    }

    if (isPreviewMode) {
      setCreative(buildPreviewCreative(params.providerId, params.campaignId, params.creativeId, campaignName))
      setLoading(false)
      return
    }

    if (!workspaceId) {
      setLoading(false)
      return
    }

    await listCreatives({
      workspaceId,
      providerId: params.providerId,
      clientId: selectedClientId ?? null,
      campaignId: params.campaignId,
      includeMedia: params.providerId === 'facebook',
    })
      .then((creatives) => {
        const normalizedCreatives = Array.isArray(creatives) ? (creatives as Creative[]) : []
        const match = normalizedCreatives.find((c) => (
          c.creativeId === params.creativeId
          || c.adId === params.creativeId
          || c.platformCreativeId === params.creativeId
        ))

        if (!match) {
          throw new Error('Creative not found')
        }

        setCreative(match)
      })
      .catch((error) => {
        logError(error, 'CreativeDetailPage:fetchCreative')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [campaignName, isPreviewMode, listCreatives, params.providerId, params.campaignId, params.creativeId, selectedClientId, workspaceId])

  const fetchMetrics = useCallback(async () => {
    if (!isProviderId(params.providerId)) {
      setCreativeMetrics(null)
      setMetricsError('Unsupported provider')
      setMetricsLoading(false)
      return
    }

    if (isPreviewMode) {
      setMetricsLoading(true)
      setMetricsError(null)
      setCreativeMetrics(buildPreviewCreativeMetrics(params.providerId, params.creativeId, params.campaignId, days))
      setMetricsLoading(false)
      return
    }

    if (params.providerId === 'facebook') {
      setCreativeMetrics(null)
      setMetricsError(null)
      return
    }
    setMetricsLoading(true)
    setMetricsError(null)


    if (!workspaceId) {
      setCreativeMetrics(null)
      setMetricsError('Sign in required')
      setMetricsLoading(false)
      return
    }

    await listAdMetrics({
      workspaceId,
      providerId: params.providerId,
      clientId: selectedClientId ?? null,
      campaignId: params.campaignId,
      adGroupId: creative?.adGroupId,
      days,
      level: params.providerId === 'linkedin' ? 'creative' : 'ad',
    })
      .then((response) => {
        const record = response && typeof response === 'object' ? (response as { metrics?: unknown }) : null
        const allMetrics = Array.isArray(record?.metrics) ? (record.metrics as NormalizedAdMetric[]) : []
        const metricTargetId = creative?.adId ?? params.creativeId
        const filtered = allMetrics.filter((m) => m.adId === metricTargetId)
        setCreativeMetrics(filtered)
      })
      .catch((error) => {
        logError(error, 'CreativeDetailPage:fetchMetrics')
        setCreativeMetrics(null)
        setMetricsError(asErrorMessage(error))
      })
      .finally(() => {
        setMetricsLoading(false)
      })
  }, [days, isPreviewMode, listAdMetrics, params.providerId, params.campaignId, params.creativeId, selectedClientId, creative?.adGroupId, creative?.adId, workspaceId])

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      void fetchCreative()
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [fetchCreative])

  useEffect(() => {
    if (!creative) return

    const frameId = requestAnimationFrame(() => {
      void fetchMetrics()
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [creative, fetchMetrics])

  const handleCopy = (text: string, field: string) => {
    const canUseClipboardApi =
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.clipboard !== 'undefined' &&
      window.isSecureContext

    const copyPromise = canUseClipboardApi
      ? navigator.clipboard.writeText(text)
      : Promise.resolve().then(() => {
          // Fallback to execCommand for non-secure contexts or older browsers
          const textArea = document.createElement("textarea")
          textArea.value = text
          textArea.style.position = "fixed"
          textArea.style.left = "-999999px"
          textArea.style.top = "-999999px"
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          const copied = document.execCommand('copy')
          textArea.remove()

          if (!copied) {
            throw new Error('Copy command failed')
          }
        })

    void copyPromise
      .then(() => {
        setCopiedField(field)
        toast({
          title: "Copied to clipboard",
          description: "Text has been copied successfully.",
        })
        setTimeout(() => setCopiedField(null), 2000)
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
        toast({
          title: "Copy failed",
          description: "Please try selecting and copying manually.",
          variant: "destructive",
        })
      })
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

    if (isPreviewMode) {
      setLoading(true)

      const additions = buildPreviewCopySuggestions(kind, creative, campaignName)

      if (kind === 'headlines') {
        setEditedHeadlines((prev) => {
          const base = prev.length > 0 ? prev : (creative.headlines ?? [])
          const seen = new Set(base.map((value) => value.trim().toLowerCase()).filter(Boolean))
          const uniqueAdditions = additions.filter((value) => {
            const key = value.trim().toLowerCase()
            if (!key || seen.has(key)) {
              return false
            }
            seen.add(key)
            return true
          })
          return [...base, ...uniqueAdditions]
        })
      } else {
        setEditedDescriptions((prev) => {
          const base = prev.length > 0 ? prev : (creative.descriptions ?? [])
          const seen = new Set(base.map((value) => value.trim().toLowerCase()).filter(Boolean))
          const uniqueAdditions = additions.filter((value) => {
            const key = value.trim().toLowerCase()
            if (!key || seen.has(key)) {
              return false
            }
            seen.add(key)
            return true
          })
          return [...base, ...uniqueAdditions]
        })
      }

      toast({
        title: kind === 'headlines' ? 'Sample headlines added' : 'Sample captions added',
        description: 'Preview mode generated local-only sample variants for this session.',
      })
      setLoading(false)
      return
    }

    setLoading(true)

    await generateCopyAction({
      providerId: params.providerId as 'google' | 'tiktok' | 'linkedin' | 'facebook',
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
    })
      .then((result) => {
        const headlines = result.headlines
        const captions = result.captions

        if (kind === 'headlines') {
          if (headlines.length === 0) {
            toast({ title: 'No new headlines', description: 'Try again with different inputs.' })
            return
          }
          setEditedHeadlines((prev) => {
            const base = prev.length ? prev : []
            const existing = new Set(base.map((s) => s.trim().toLowerCase()).filter(Boolean))
            const additions = headlines.filter((h: string) => {
              const key = h.trim().toLowerCase()
              if (!key) return false
              if (existing.has(key)) return false
              existing.add(key)
              return true
            })
            return [...base, ...additions]
          })
          toast({ title: 'Generated headlines', description: `Added ${headlines.length} new variant(s).` })
          return
        }

        if (captions.length === 0) {
          toast({ title: 'No new captions', description: 'Try again with different inputs.' })
          return
        }

        setEditedDescriptions((prev) => {
          const base = prev.length ? prev : []
          const existing = new Set(base.map((s) => s.trim().toLowerCase()).filter(Boolean))
          const additions = captions.filter((c: string) => {
            const key = c.trim().toLowerCase()
            if (!key) return false
            if (existing.has(key)) return false
            existing.add(key)
            return true
          })
          return [...base, ...additions]
        })
        toast({ title: 'Generated captions', description: `Added ${captions.length} new variant(s).` })
      })
      .catch((error) => {
        logError(error, 'CreativeDetailPage:generateCopy')
        toast({
          title: 'AI generation error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }, [campaignName, creative, editedCta, editedDescriptions, editedHeadlines, editedLandingPage, isEditing, isPreviewMode, params.campaignId, params.creativeId, params.providerId, selectedClientId, generateCopyAction])

  const handleSave = async () => {
    if (isPreviewMode) {
      if (!creative) {
        return
      }

      const normalizedHeadlines = editedHeadlines.map((headline) => headline.trim()).filter(Boolean)
      const normalizedDescriptions = editedDescriptions.map((description) => description.trim()).filter(Boolean)
      const normalizedCta = editedCta.trim()
      const normalizedLandingPage = editedLandingPage.trim()

      setCreative({
        ...creative,
        headlines: normalizedHeadlines,
        descriptions: normalizedDescriptions,
        callToAction: normalizedCta,
        landingPageUrl: normalizedLandingPage,
      })
      setIsEditing(false)
      toast({
        title: 'Sample creative updated',
        description: 'Preview mode applied your edits locally for this session only.',
      })
      return
    }

    if (!workspaceId) {
      toast({
        title: 'Sign in required',
        description: 'You need to be signed in to save creative updates.',
        variant: 'destructive',
      })
      return
    }

    if (!creative) {
      toast({
        title: 'Creative unavailable',
        description: 'Creative details are not loaded yet.',
        variant: 'destructive',
      })
      return
    }

    if (!isProviderId(params.providerId)) {
      toast({
        title: 'Unsupported provider',
        description: 'This provider is not supported for updates.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    const normalizedHeadlines = editedHeadlines.map((headline) => headline.trim()).filter(Boolean)
    const normalizedDescriptions = editedDescriptions.map((description) => description.trim()).filter(Boolean)
    const normalizedCta = editedCta.trim()
    const normalizedLandingPage = editedLandingPage.trim()

    await updateCreative({
      workspaceId,
      providerId: params.providerId,
      clientId: selectedClientId ?? null,
      creativeId: creative.platformCreativeId ?? creative.creativeId,
      adId: creative.adId ?? creative.creativeId,
      name: creative.name,
      title: normalizedHeadlines[0],
      body: normalizedDescriptions[0],
      callToActionType: normalizedCta || undefined,
      linkUrl: normalizedLandingPage || undefined,
      objectType: creative.objectType,
      imageUrl: creative.imageUrl,
      imageHash: creative.imageHash,
      videoId: creative.videoId,
      pageId: creative.pageId,
      instagramActorId: creative.instagramActorId,
      assetFeedSpec: creative.assetFeedSpec,
      destinationSpec: creative.destinationSpec,
    })
      .then((result) => {
        if (creative) {
          setCreative({
            ...creative,
            platformCreativeId: (result as { creativeId?: string } | undefined)?.creativeId ?? creative.platformCreativeId,
            headlines: normalizedHeadlines,
            descriptions: normalizedDescriptions,
            callToAction: normalizedCta,
            landingPageUrl: normalizedLandingPage,
          })
        }

        void fetchCreative()

        toast({
          title: 'Changes saved',
          description: 'Your creative has been updated successfully.',
        })
        setIsEditing(false)
      })
      .catch((error) => {
        logError(error, 'CreativeDetailPage:handleSave')
        toast({
          title: 'Error',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsSaving(false)
      })
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