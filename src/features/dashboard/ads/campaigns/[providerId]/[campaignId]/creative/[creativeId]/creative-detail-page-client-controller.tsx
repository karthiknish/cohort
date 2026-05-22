'use client'


import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useEffectEvent, useMemo, useReducer, useRef } from 'react'
import { useParams } from 'next/navigation'

import { toast } from '@/shared/ui/use-toast'
import { useClientContext } from '@/shared/contexts/client-context'
import { useAuth } from '@/shared/contexts/auth-context'
import { usePreview } from '@/shared/contexts/preview-context'
import { calculateAlgorithmicInsights, calculateEfficiencyScore } from '@/lib/ad-algorithms'
import { mergeMetaDestinationSpec } from '@/services/integrations/meta-ads'
import { formatMetaCallToActionLabel } from '@/services/integrations/meta-ads/meta-call-to-action'
import { useAction } from 'convex/react'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsAdMetricsApi, adsCreativesApi, creativesCopyApi } from '@/lib/convex-api'

import {
  creativeCopyIsDirty,
  mergeMetaAssetFeedSpecForSave,
  normalizeStringList,
} from '@/features/dashboard/ads/creative/components/creative-editing-utils'
import { normalizeCreativeCtaValue } from '@/features/dashboard/ads/creative/components/helpers'
import type { Creative } from '@/features/dashboard/ads/creative/components/types'

import {
  buildCreativePerformanceSummary,
  buildCreativePreviewCreative,
  buildPreviewCopySuggestions,
  buildPreviewCreative,
  buildPreviewCreativeMetrics,
  resolveRouteProviderId,
  type NormalizedAdMetric,
} from './creative-detail-page-client-utils'
import {
  createInitialCreativeDetailPageState,
  creativeDetailPageReducer,
} from './creative-detail-page-client-state'
import { normalizeCurrencyCode } from '@/constants/currencies'

import { CreativeDetailPageContent } from './creative-detail-page-client-sections'
import { CreativeDetailPageLoadingState } from './creative-detail-page-client-loading'
import { CreativeDetailPageNotFoundState } from './creative-detail-page-client-not-found'

export type CreativeDetailPageClientProps = {
  campaignName?: string | null
  currency?: string | null
  searchParamsString?: string
}


export function useCreativeDetailPageClient(props: CreativeDetailPageClientProps) {
  const {
    campaignName: initialCampaignName,
    currency,
    searchParamsString = '',
  } = props
  const params = useParams<{ providerId: string; campaignId: string; creativeId: string }>()
  const { selectedClientId } = useClientContext()
  const { user } = useAuth()
  const { isPreviewMode } = usePreview()
  const workspaceId = user?.agencyId ? String(user.agencyId) : null

  const listCreatives = useAction(adsCreativesApi.listCreatives)
  const updateCreative = useAction(adsCreativesApi.updateCreative)
  const listAdMetrics = useAction(adsAdMetricsApi.listAdMetrics)
  const generateCopyAction = useAction(creativesCopyApi.generateCopy)

  const [state, dispatch] = useReducer(
    creativeDetailPageReducer,
    undefined,
    createInitialCreativeDetailPageState,
  )
  const {
    creative,
    loading,
    copiedField,
    isEditing,
    editedHeadlines,
    editedDescriptions,
    editedCta,
    editedLandingPage,
    previewHeadlineIndex,
    previewDescriptionIndex,
    isSaving,
    generatingHeadlines,
    generatingDescriptions,
    days,
    creativeMetrics,
  } = state

  const metricsLoadingRef = useRef(false)
  const metricsErrorRef = useRef<string | null>(null)

  const setPreviewHeadlineIndex = useCallback((value: number) => {
    dispatch({ type: 'setPreviewHeadlineIndex', value })
  }, [])
  const setPreviewDescriptionIndex = useCallback((value: number) => {
    dispatch({ type: 'setPreviewDescriptionIndex', value })
  }, [])
  const setEditedCta = useCallback((value: string) => {
    dispatch({ type: 'setEditedCta', value })
  }, [])
  const setEditedLandingPage = useCallback((value: string) => {
    dispatch({ type: 'setEditedLandingPage', value })
  }, [])

  const campaignName = initialCampaignName || 'Campaign'
  const displayCurrency = useMemo(
    () => normalizeCurrencyCode(currency ?? undefined) ?? 'USD',
    [currency],
  )
  const convexProviderId = useMemo(
    () => resolveRouteProviderId(params.providerId),
    [params.providerId],
  )

  const fetchCreative = useCallback(async () => {
    dispatch({ type: 'setLoading', value: true })

    if (!convexProviderId) {
      dispatch({ type: 'setLoading', value: false })
      notifyFailure({
        title: 'Unsupported provider',
        message: 'This provider is not supported in the creative detail view.',
      })
      return
    }

    if (isPreviewMode) {
      dispatch({
        type: 'setCreative',
        value: buildPreviewCreative(convexProviderId, params.campaignId, params.creativeId, campaignName),
      })
      dispatch({ type: 'setLoading', value: false })
      return
    }

    if (!workspaceId) {
      dispatch({ type: 'setLoading', value: false })
      return
    }

    await listCreatives({
      workspaceId,
      providerId: convexProviderId,
      clientId: selectedClientId ?? null,
      campaignId: params.campaignId,
      includeMedia: convexProviderId === 'facebook',
      maxMetaCreativePages: convexProviderId === 'facebook' ? 40 : undefined,
      maxGoogleAdsSearchPages: convexProviderId === 'google' ? 15 : undefined,
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

        dispatch({ type: 'setCreative', value: match })
      })
      .catch((error) => {
        reportConvexFailure({
          error: error,
          context: 'CreativeDetailPage:fetchCreative',
          title: 'Error',
          fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        dispatch({ type: 'setLoading', value: false })
      })
  }, [campaignName, convexProviderId, isPreviewMode, listCreatives, params.campaignId, params.creativeId, selectedClientId, workspaceId])

  const fetchMetrics = useCallback(async () => {
    if (!convexProviderId) {
      dispatch({ type: 'setCreativeMetrics', value: null })
      metricsErrorRef.current = 'Unsupported provider'
      metricsLoadingRef.current = false
      return
    }

    if (isPreviewMode) {
      metricsLoadingRef.current = true
      metricsErrorRef.current = null
      dispatch({
        type: 'setCreativeMetrics',
        value: buildPreviewCreativeMetrics(convexProviderId, params.creativeId, params.campaignId, days),
      })
      metricsLoadingRef.current = false
      return
    }

    metricsLoadingRef.current = true
    metricsErrorRef.current = null

    if (!workspaceId) {
      dispatch({ type: 'setCreativeMetrics', value: null })
      metricsErrorRef.current = 'Sign in required'
      metricsLoadingRef.current = false
      return
    }

    await listAdMetrics({
      workspaceId,
      providerId: convexProviderId,
      clientId: selectedClientId ?? null,
      campaignId: params.campaignId,
      adGroupId: creative?.adGroupId,
      days,
      level: convexProviderId === 'linkedin' ? 'creative' : 'ad',
    })
      .then((response) => {
        const record = response && typeof response === 'object' ? (response as { metrics?: unknown }) : null
        const allMetrics = Array.isArray(record?.metrics) ? (record.metrics as NormalizedAdMetric[]) : []
        const metricTargetId = creative?.adId ?? params.creativeId
        const filtered = allMetrics.filter((m) => m.adId === metricTargetId)
        dispatch({ type: 'setCreativeMetrics', value: filtered })
      })
      .catch((error) => {
        logError(error, 'CreativeDetailPage:fetchMetrics')
        dispatch({ type: 'setCreativeMetrics', value: null })
        metricsErrorRef.current = asErrorMessage(error)
      })
      .finally(() => {
        metricsLoadingRef.current = false
      })
  }, [convexProviderId, days, isPreviewMode, listAdMetrics, params.campaignId, params.creativeId, selectedClientId, creative?.adGroupId, creative?.adId, workspaceId])

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

    dispatch({ type: 'syncFromCreative', creative })
  }, [creative])

  const runMetricsFetch = useEffectEvent(() => {
    void fetchMetrics()
  })

  useEffect(() => {
    if (!creative) return

    const frameId = requestAnimationFrame(() => {
      runMetricsFetch()
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [creative, days, runMetricsFetch])

  const handleCopy = useCallback((text: string, field: string) => {
    const canUseClipboardApi =
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.clipboard !== 'undefined' &&
      window.isSecureContext

    const copyPromise = canUseClipboardApi
      ? navigator.clipboard.writeText(text)
      : Promise.resolve().then(() => {
          const textArea = document.createElement('textarea')
          textArea.value = text
          textArea.style.cssText = 'position:fixed;left:-999999px;top:-999999px'
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
        dispatch({ type: 'setCopiedField', value: field })
        toast({
          title: 'Copied to clipboard',
          description: 'Text has been copied successfully.',
        })
        setTimeout(() => dispatch({ type: 'setCopiedField', value: null }), 2000)
      })
      .catch((err) => {
        reportConvexFailure({
          error: err,
          context: 'CreativeDetailPage:copyField',
          title: 'Copy failed',
          fallbackMessage: 'Copy failed',
        })
      })
  }, [])

  const isDirty = useMemo(() => {
    if (!creative) return false
    return creativeCopyIsDirty(creative, {
      headlines: editedHeadlines,
      descriptions: editedDescriptions,
      cta: editedCta,
      landingPage: editedLandingPage,
    })
  }, [creative, editedCta, editedDescriptions, editedHeadlines, editedLandingPage])

  const previewCreative = useMemo(() => {
    if (!creative) return null
    return buildCreativePreviewCreative(
      creative,
      editedHeadlines,
      editedDescriptions,
      editedCta,
      editedLandingPage,
      previewHeadlineIndex,
      previewDescriptionIndex,
    )
  }, [
    creative,
    editedCta,
    editedDescriptions,
    editedHeadlines,
    editedLandingPage,
    previewDescriptionIndex,
    previewHeadlineIndex,
  ])

  const cancelEditing = useCallback(() => {
    if (!creative) return
    dispatch({ type: 'syncFromCreative', creative })
  }, [creative])

  const generateCopy = useCallback(async (kind: 'headlines' | 'captions') => {
    if (!creative) return

    const setGenerating =
      kind === 'headlines'
        ? (value: boolean) => dispatch({ type: 'setGeneratingHeadlines', value })
        : (value: boolean) => dispatch({ type: 'setGeneratingDescriptions', value })

    if (isPreviewMode) {
      setGenerating(true)

      const additions = buildPreviewCopySuggestions(kind, creative, campaignName)

      if (kind === 'headlines') {
        dispatch({
          type: 'updateEditedHeadlines',
          updater: (prev) => {
            const base = prev.length > 0 ? prev : (creative.headlines ?? [])
            const seen = new Set(base.flatMap((value) => { const v = value.trim().toLowerCase(); return v ? [v] : [] }))
            const uniqueAdditions = additions.filter((value) => {
              const key = value.trim().toLowerCase()
              if (!key || seen.has(key)) {
                return false
              }
              seen.add(key)
              return true
            })
            return [...base, ...uniqueAdditions]
          },
        })
      } else {
        dispatch({
          type: 'updateEditedDescriptions',
          updater: (prev) => {
            const base = prev.length > 0 ? prev : (creative.descriptions ?? [])
            const seen = new Set(base.flatMap((value) => { const v = value.trim().toLowerCase(); return v ? [v] : [] }))
            const uniqueAdditions = additions.filter((value) => {
              const key = value.trim().toLowerCase()
              if (!key || seen.has(key)) {
                return false
              }
              seen.add(key)
              return true
            })
            return [...base, ...uniqueAdditions]
          },
        })
      }

      toast({
        title: kind === 'headlines' ? 'Sample headlines added' : 'Sample captions added',
        description: 'Preview mode generated local-only sample variants for this session.',
      })
      setGenerating(false)
      return
    }

    setGenerating(true)

    if (!convexProviderId) {
      setGenerating(false)
      notifyFailure({
        title: 'Unsupported provider',
        message: 'AI copy generation is not available for this ad platform.',
      })
      return
    }

    if (!workspaceId) {
      setGenerating(false)
      notifyFailure({
        title: 'Sign in required',
        message: 'You need to be signed in to generate AI copy.',
      })
      return
    }

    const ctaForPrompt =
      formatMetaCallToActionLabel(editedCta || creative.callToAction)
      || editedCta
      || creative.callToAction

    await generateCopyAction({
      providerId: convexProviderId,
      clientId: selectedClientId ?? undefined,
      campaignId: params.campaignId,
      creativeId: params.creativeId,
      campaignName,
      creativeName: creative.name,
      landingPageUrl: editedLandingPage || creative.landingPageUrl,
      callToAction: ctaForPrompt,
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
          dispatch({
            type: 'updateEditedHeadlines',
            updater: (prev) => {
              const base = prev.length ? prev : []
              const existing = new Set(base.flatMap((s) => { const v = s.trim().toLowerCase(); return v ? [v] : [] }))
              const additions = headlines.filter((h: string) => {
                const key = h.trim().toLowerCase()
                if (!key) return false
                if (existing.has(key)) return false
                existing.add(key)
                return true
              })
              return [...base, ...additions]
            },
          })
          toast({ title: 'Generated headlines', description: `Added ${headlines.length} new variant(s).` })
          return
        }

        if (captions.length === 0) {
          toast({ title: 'No new captions', description: 'Try again with different inputs.' })
          return
        }

        dispatch({
          type: 'updateEditedDescriptions',
          updater: (prev) => {
            const base = prev.length ? prev : []
            const existing = new Set(base.flatMap((s) => { const v = s.trim().toLowerCase(); return v ? [v] : [] }))
            const additions = captions.filter((c: string) => {
              const key = c.trim().toLowerCase()
              if (!key) return false
              if (existing.has(key)) return false
              existing.add(key)
              return true
            })
            return [...base, ...additions]
          },
        })
        toast({ title: 'Generated captions', description: `Added ${captions.length} new variant(s).` })
      })
      .catch((error) => {
        reportConvexFailure({
          error: error,
          context: 'CreativeDetailPage:generateCopy',
          title: 'AI generation error',
          fallbackMessage: 'AI generation error',
        })
      })
      .finally(() => {
        setGenerating(false)
      })
  }, [campaignName, convexProviderId, creative, editedCta, editedDescriptions, editedHeadlines, editedLandingPage, isPreviewMode, params.campaignId, params.creativeId, selectedClientId, generateCopyAction, workspaceId])

  const handleSave = useCallback(async () => {
    if (isPreviewMode) {
      if (!creative) {
        return
      }

      const normalizedHeadlines = editedHeadlines.flatMap((headline) => { const h = headline.trim(); return h ? [h] : [] })
      const normalizedDescriptions = editedDescriptions.flatMap((description) => { const d = description.trim(); return d ? [d] : [] })
      const normalizedCta = editedCta.trim()
      const normalizedLandingPage = editedLandingPage.trim()

      dispatch({
        type: 'patchCreative',
        updater: (previousCreative) => {
          if (!previousCreative) {
            return previousCreative
          }

          return {
            ...previousCreative,
            headlines: normalizedHeadlines,
            descriptions: normalizedDescriptions,
            callToAction: normalizedCta,
            landingPageUrl: normalizedLandingPage,
          }
        },
      })
      dispatch({ type: 'setIsEditing', value: false })
      toast({
        title: 'Sample creative updated',
        description: 'Preview mode applied your edits locally for this session only.',
      })
      return
    }

    if (!workspaceId) {
      notifyFailure({
        title: 'Sign in required',
        message: 'You need to be signed in to save creative updates.',
      })
      return
    }

    if (!creative) {
      notifyFailure({
        title: 'Creative unavailable',
        message: 'Creative details are not loaded yet.',
      })
      return
    }

    if (!convexProviderId) {
      notifyFailure({
        title: 'Unsupported provider',
        message: 'This provider is not supported for updates.',
      })
      return
    }

    dispatch({ type: 'setIsSaving', value: true })

    const normalizedHeadlines = normalizeStringList(editedHeadlines)
    const normalizedDescriptions = normalizeStringList(editedDescriptions)
    const normalizedCta = normalizeCreativeCtaValue(editedCta)
    const normalizedLandingPage = editedLandingPage.trim()
    const mergedAssetFeedSpec =
      convexProviderId === 'facebook'
        ? mergeMetaAssetFeedSpecForSave(
            creative.assetFeedSpec,
            normalizedHeadlines,
            normalizedDescriptions,
            normalizedLandingPage,
          ) ?? creative.assetFeedSpec
        : creative.assetFeedSpec

    await updateCreative({
      workspaceId,
      providerId: convexProviderId,
      clientId: selectedClientId ?? null,
      creativeId: creative.platformCreativeId ?? creative.creativeId,
      adId: creative.adId ?? creative.creativeId,
      name: creative.name,
      title: normalizedHeadlines[0],
      body: normalizedDescriptions[0],
      description:
        creative.objectType?.toUpperCase() === 'VIDEO' || creative.videoId
          ? undefined
          : normalizedDescriptions[1],
      callToActionType: normalizedCta || undefined,
      linkUrl: normalizedLandingPage || undefined,
      objectType: creative.objectType,
      imageUrl: creative.imageUrl || creative.thumbnailUrl,
      imageHash: creative.imageHash,
      videoId: creative.videoId,
      pageId: creative.pageId,
      assetFeedSpec: mergedAssetFeedSpec,
      destinationSpec: mergeMetaDestinationSpec(creative.destinationSpec, normalizedLandingPage || undefined),
    })
      .then((result) => {
        if (creative) {
          dispatch({
            type: 'patchCreative',
            updater: (previousCreative) => {
              if (!previousCreative) {
                return previousCreative
              }

              return {
                ...previousCreative,
                platformCreativeId: (result as { creativeId?: string } | undefined)?.creativeId ?? previousCreative.platformCreativeId,
                headlines: normalizedHeadlines,
                descriptions: normalizedDescriptions,
                callToAction: normalizedCta,
                landingPageUrl: normalizedLandingPage,
              }
            },
          })
        }

        void fetchCreative()

        toast({
          title: 'Changes saved',
          description: 'Your creative has been updated successfully.',
        })
        dispatch({ type: 'setIsEditing', value: false })
      })
      .catch((error) => {
        reportConvexFailure({
          error: error,
          context: 'CreativeDetailPage:handleSave',
          title: 'Error',
          fallbackMessage: 'Error',
        })
      })
      .finally(() => {
        dispatch({ type: 'setIsSaving', value: false })
      })
  }, [convexProviderId, creative, editedCta, editedDescriptions, editedHeadlines, editedLandingPage, fetchCreative, isPreviewMode, selectedClientId, updateCreative, workspaceId])

  const addHeadline = useCallback(() => {
    dispatch({ type: 'updateEditedHeadlines', updater: (current) => [...current, ''] })
  }, [])

  const removeHeadline = useCallback((index: number) => {
    dispatch({ type: 'updateEditedHeadlines', updater: (current) => current.filter((_, currentIndex) => currentIndex !== index) })
    dispatch({
      type: 'updatePreviewHeadlineIndex',
      updater: (current) => {
        if (index < current) return current - 1
        if (index === current) return Math.max(0, current - 1)
        return current
      },
    })
  }, [])

  const updateHeadline = useCallback((index: number, value: string) => {
    dispatch({
      type: 'updateEditedHeadlines',
      updater: (current) => {
        const updated = [...current]
        updated[index] = value
        return updated
      },
    })
  }, [])

  const addDescription = useCallback(() => {
    dispatch({ type: 'updateEditedDescriptions', updater: (current) => [...current, ''] })
  }, [])

  const removeDescription = useCallback((index: number) => {
    dispatch({ type: 'updateEditedDescriptions', updater: (current) => current.filter((_, currentIndex) => currentIndex !== index) })
    dispatch({
      type: 'updatePreviewDescriptionIndex',
      updater: (current) => {
        if (index < current) return current - 1
        if (index === current) return Math.max(0, current - 1)
        return current
      },
    })
  }, [])

  const updateDescription = useCallback((index: number, value: string) => {
    dispatch({
      type: 'updateEditedDescriptions',
      updater: (current) => {
        const updated = [...current]
        updated[index] = value
        return updated
      },
    })
  }, [])

  const handleGenerateHeadlines = useCallback(() => {
    void generateCopy('headlines')
  }, [generateCopy])

  const handleGenerateDescriptions = useCallback(() => {
    void generateCopy('captions')
  }, [generateCopy])

  const onSaveShortcut = useEffectEvent(() => {
    if (isDirty && !isSaving) {
      void handleSave()
    }
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        onSaveShortcut()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const backUrl = `/dashboard/ads/campaigns/${params.providerId}/${params.campaignId}${searchParamsString ? `?${searchParamsString}` : ''}`

  const displayName = useMemo(() => {
    if (!creative) return params.creativeId
    return creative.name || creative.headlines?.[0] || creative.creativeId
  }, [creative, params.creativeId])

  const performanceSummary = useMemo(
    () => buildCreativePerformanceSummary(creativeMetrics, convexProviderId, days, displayCurrency),
    [convexProviderId, creativeMetrics, days, displayCurrency],
  )

  const efficiencyScore = useMemo(() => {
    if (!performanceSummary) return null
    return calculateEfficiencyScore(performanceSummary)
  }, [performanceSummary])

  const algorithmicInsights = useMemo(() => {
    if (!performanceSummary) return []
    return calculateAlgorithmicInsights(performanceSummary)
  }, [performanceSummary])

  if (loading) {
    return <CreativeDetailPageLoadingState />
  }

  if (!creative) {
    return <CreativeDetailPageNotFoundState backUrl={backUrl} />
  }

  return (
    <CreativeDetailPageContent
      creative={creative}
      previewCreative={previewCreative ?? creative}
      backUrl={backUrl}
      campaignName={campaignName}
      displayName={displayName}
      isDirty={isDirty}
      isSaving={isSaving}
      copiedField={copiedField}
      isEditing={isEditing}
      editedHeadlines={editedHeadlines}
      editedDescriptions={editedDescriptions}
      editedCta={editedCta}
      editedLandingPage={editedLandingPage}
      previewHeadlineIndex={previewHeadlineIndex}
      previewDescriptionIndex={previewDescriptionIndex}
      generatingHeadlines={generatingHeadlines}
      generatingDescriptions={generatingDescriptions}
      performanceSummary={performanceSummary}
      efficiencyScore={efficiencyScore}
      algorithmicInsights={algorithmicInsights}
      onCopy={handleCopy}
      onCancelEditing={cancelEditing}
      onSave={handleSave}
      onRefreshCreative={fetchCreative}
      onRefreshPerformance={fetchMetrics}
      onPreviewHeadlineIndexChange={setPreviewHeadlineIndex}
      onPreviewDescriptionIndexChange={setPreviewDescriptionIndex}
      onAddHeadline={addHeadline}
      onRemoveHeadline={removeHeadline}
      onUpdateHeadline={updateHeadline}
      onAddDescription={addDescription}
      onRemoveDescription={removeDescription}
      onUpdateDescription={updateDescription}
      onChangeCta={setEditedCta}
      onChangeLandingPage={setEditedLandingPage}
      onGenerateHeadlines={handleGenerateHeadlines}
      onGenerateDescriptions={handleGenerateDescriptions}
    />
  )
}
