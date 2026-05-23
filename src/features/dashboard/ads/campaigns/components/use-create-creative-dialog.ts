'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useReducer, useRef, type FormEvent } from 'react'
import { useAction } from 'convex/react'

import { toast } from '@/shared/ui/use-toast'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsCreativesApi } from '@/lib/convex-api'
import { getMetaCreativeObjectTypeOptions } from '@/lib/meta-campaign-ui'
import { normalizeMetaCampaignObjective } from '@/lib/meta-ad-set-objective'

import type {
  CreativeObjectType,
  CreativeStatus,
  MetaPageActorOption,
} from './create-creative-dialog-sections'
import type {
  CreateCreativeDialogProps,
  MetaCreativeObjectType,
} from './create-creative-dialog-types'


import {
  createCreativeDialogReducer,
  createInitialCreateCreativeDialogState,
  generateCreativeIdempotencyKey,
  revokeBlobPreview,
  toMetaCreativeObjectType,
} from './create-creative-dialog-state'
import { useCreateCreativeDialogMedia } from './use-create-creative-dialog-media'

export function useCreateCreativeDialog({
  workspaceId,
  providerId,
  campaignId,
  campaignObjective,
  clientId,
  adSetId: propAdSetId,
  availableAdSets: _availableAdSets,
  onSuccess,
}: CreateCreativeDialogProps) {
  const isLeadsCampaign = normalizeMetaCampaignObjective(campaignObjective) === 'OUTCOME_LEADS'
  const isMeta = providerId === 'facebook'

  const allowedObjectTypes = useMemo((): CreativeObjectType[] => {
    if (!isMeta) return ['IMAGE', 'VIDEO', 'CAROUSEL']
    return getMetaCreativeObjectTypeOptions(campaignObjective) as CreativeObjectType[]
  }, [campaignObjective, isMeta])

  const [state, dispatch] = useReducer(
    createCreativeDialogReducer,
    propAdSetId,
    createInitialCreateCreativeDialogState,
  )
  const {
    open,
    loading,
    uploadingImage,
    uploadingVideo,
    videoPreviewUrl,
    loadingPageActors,
    metaPageActors,
    selectedAdSetId,
    name,
    objectType,
    title,
    body,
    description,
    callToActionType,
    linkUrl,
    imageUrl,
    imageHash,
    imagePreviewUrl,
    videoId,
    pageId,
    instagramActorId,
    leadFormId,
    status,
  } = state

  useEffect(() => {
    if (objectType === 'DYNAMIC' && !allowedObjectTypes.includes('DYNAMIC')) {
      dispatch({ type: 'setObjectType', value: 'IMAGE' })
    }
  }, [allowedObjectTypes, objectType])

  const videoPreviewRef = useRef<string | null>(null)
  const previousPropAdSetIdRef = useRef(propAdSetId)
  if (previousPropAdSetIdRef.current !== propAdSetId) {
    previousPropAdSetIdRef.current = propAdSetId
    dispatch({ type: 'setSelectedAdSetId', value: propAdSetId })
  }

  const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors)
  const createCreative = useAction(adsCreativesApi.createCreative)

  const imagePreviewRef = useRef<string | null>(null)
  const submissionRef = useRef<{ fingerprint: string; key: string } | null>(null)

  const resetForm = useCallback(() => {
    revokeBlobPreview(imagePreviewRef.current)
    imagePreviewRef.current = null
    revokeBlobPreview(videoPreviewRef.current)
    videoPreviewRef.current = null
    dispatch({ type: 'reset', selectedAdSetId: propAdSetId })
    submissionRef.current = null
  }, [propAdSetId])

  const formFingerprint = useMemo(
    () => JSON.stringify({
      name,
      objectType,
      title,
      body,
      description,
      callToActionType,
      linkUrl,
      imageUrl,
      imageHash,
      videoId,
      pageId,
      instagramActorId,
      leadFormId,
      status,
      selectedAdSetId: selectedAdSetId ?? null,
    }),
    [
    name,
    objectType,
    title,
    body,
    description,
    callToActionType,
    linkUrl,
    imageUrl,
    imageHash,
    videoId,
    pageId,
    instagramActorId,
    leadFormId,
    status,
    selectedAdSetId,
  ])

  const selectedPage = useMemo(
    () => metaPageActors.find((actor) => actor.id === pageId) ?? null,
    [metaPageActors, pageId]
  )

  const instagramActorOptions = useMemo(() => {
    const seen = new Set<string>()
    const options: Array<{ id: string; label: string }> = []

    for (const actor of metaPageActors) {
      const instagramId = actor.instagramBusinessAccountId
      if (!instagramId || seen.has(instagramId)) continue
      seen.add(instagramId)

      const accountLabel = actor.instagramBusinessAccountName || actor.instagramUsername || instagramId
      options.push({
        id: instagramId,
        label: accountLabel,
      })
    }

    return options
  }, [metaPageActors])

  const handleSelectPage = useCallback(
    (nextPageId: string) => {
      const actor = metaPageActors.find((row) => row.id === nextPageId)
      dispatch({
        type: 'selectPage',
        pageId: nextPageId,
        instagramActorId: actor?.instagramBusinessAccountId ?? '',
      })
    },
    [metaPageActors]
  )

  const handleOpenChange = useCallback((value: boolean) => {
    dispatch({ type: 'setOpen', value })
  }, [])

  const setBody = useCallback((value: string) => dispatch({ type: 'setBody', value }), [])
  const setCallToActionType = useCallback((value: string) => dispatch({ type: 'setCallToActionType', value }), [])
  const setDescription = useCallback((value: string) => dispatch({ type: 'setDescription', value }), [])
  const setImageUrl = useCallback((value: string) => dispatch({ type: 'setImageUrl', value }), [])
  const setInstagramActorId = useCallback((value: string) => dispatch({ type: 'setInstagramActorId', value }), [])
  const setLeadFormId = useCallback((value: string) => dispatch({ type: 'setLeadFormId', value }), [])
  const setLinkUrl = useCallback((value: string) => dispatch({ type: 'setLinkUrl', value }), [])
  const setName = useCallback((value: string) => dispatch({ type: 'setName', value }), [])
  const setObjectType = useCallback((value: CreativeObjectType) => dispatch({ type: 'setObjectType', value }), [])
  const setSelectedAdSetId = useCallback((value: string | undefined) => dispatch({ type: 'setSelectedAdSetId', value }), [])
  const setStatus = useCallback((value: CreativeStatus) => dispatch({ type: 'setStatus', value }), [])
  const setTitle = useCallback((value: string) => dispatch({ type: 'setTitle', value }), [])
  const setVideoId = useCallback((value: string) => dispatch({ type: 'setVideoId', value }), [])

  useEffect(() => {
    if (!open || !isMeta || !workspaceId) return

    let cancelled = false
    dispatch({ type: 'setLoadingPageActors', value: true })

    void listMetaPageActors({
      workspaceId,
      providerId: 'facebook',
      clientId: clientId ?? null,
    })
      .then((actors) => {
        if (cancelled) return

        const normalizedActors = Array.isArray(actors)
          ? (actors as MetaPageActorOption[])
          : []

        dispatch({
          type: 'applyMetaPageActors',
          actors: normalizedActors,
        })
      })
      .catch((error) => {
        if (cancelled) return
        logError(error, 'CreateCreativeDialog:loadMetaPageActors')
        dispatch({ type: 'clearMetaPageActorsOnError' })
        reportConvexFailure({
        error: error,
        context: 'create-creative-dialog.tsx:catch',
        title: 'Failed to load Meta pages',
        fallbackMessage: 'Failed to load Meta pages',
        })
      })
      .finally(() => {
        if (!cancelled) {
          dispatch({ type: 'setLoadingPageActors', value: false })
        }
      })

    return () => {
      cancelled = true
    }
  }, [clientId, isMeta, listMetaPageActors, open, workspaceId])

  const { handleClearImage, handleClearVideo, handleImageUpload, handleVideoUpload } =
    useCreateCreativeDialogMedia({
      dispatch,
      workspaceId: workspaceId ?? undefined,
      clientId,
      isMeta,
      imagePreviewRef,
      videoPreviewRef,
    })

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()

      if (!workspaceId) {
        toast({
          title: 'Error',
          description: 'Sign in required',
          variant: 'destructive',
        })
        return
      }

      if (!name.trim()) {
        toast({
          title: 'Validation error',
          description: 'Creative name is required',
          variant: 'destructive',
        })
        return
      }

      if (!isMeta) {
        toast({
          title: 'Platform not supported',
          description: 'Creating creatives is currently only supported for Meta (Facebook/Instagram) ads.',
          variant: 'destructive',
        })
        return
      }

      if (!selectedAdSetId) {
        toast({
          title: 'Ad Set required',
          description: 'Please select an ad set to create the ad.',
          variant: 'destructive',
        })
        return
      }

      if (!pageId) {
        toast({
          title: 'Facebook Page required',
          description: 'Select a Facebook Page before creating a Meta creative.',
          variant: 'destructive',
        })
        return
      }

      if (!metaPageActors.some((actor) => actor.id === pageId)) {
        toast({
          title: 'Invalid Facebook Page',
          description: 'The selected page is no longer available. Reload the page list and try again.',
          variant: 'destructive',
        })
        return
      }

      if (isLeadsCampaign && !leadFormId) {
        toast({
          title: 'Lead form required',
          description: 'Select an instant lead form for this leads campaign creative.',
          variant: 'destructive',
        })
        return
      }

      const currentSubmission = submissionRef.current
      const effectiveIdempotencyKey =
        currentSubmission && currentSubmission.fingerprint === formFingerprint
          ? currentSubmission.key
          : generateCreativeIdempotencyKey()
      submissionRef.current = {
        fingerprint: formFingerprint,
        key: effectiveIdempotencyKey,
      }

      dispatch({ type: 'setLoading', value: true })

      try {
        await createCreative({
          workspaceId,
          providerId: 'facebook',
          clientId: clientId ?? null,
          idempotencyKey: effectiveIdempotencyKey,
          campaignId,
          adSetId: selectedAdSetId,
          name: name.trim(),
          objectType: toMetaCreativeObjectType(objectType),
          title: title.trim() || undefined,
          body: body.trim() || undefined,
          description: description.trim() || undefined,
          callToActionType: callToActionType || undefined,
          linkUrl: linkUrl.trim() || undefined,
          imageUrl: imageUrl.trim() || undefined,
          imageHash: imageHash || undefined,
          videoId: videoId || undefined,
          pageId,
          instagramActorId: instagramActorId || undefined,
          leadgenFormId: leadFormId || undefined,
          status,
        })

        toast({
          title: 'Creative created',
          description: `Your ad creative "${name}" has been created successfully.`,
        })

        dispatch({ type: 'setOpen', value: false })
        resetForm()
        onSuccess?.()
      } catch (error) {
        logError(error, 'CreateCreativeDialog:handleSubmit')
        toast({
          title: 'Creation failed',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      } finally {
        dispatch({ type: 'setLoading', value: false })
      }
    },
    [
      body,
      callToActionType,
      campaignId,
      clientId,
      createCreative,
      isLeadsCampaign,
      leadFormId,
      description,
      formFingerprint,
      imageHash,
      imageUrl,
      instagramActorId,
      isMeta,
      linkUrl,
      metaPageActors,
      name,
      objectType,
      onSuccess,
      pageId,
      resetForm,
      selectedAdSetId,
      status,
      title,
      videoId,
      workspaceId,
    ],
  )

  const handleClose = useCallback(() => {
    dispatch({ type: 'setOpen', value: false })
  }, [])

  return {
    open,
    loading,
    uploadingImage,
    uploadingVideo,
    videoPreviewSrc: videoPreviewUrl,
    imagePreviewSrc: imagePreviewUrl,
    loadingPageActors,
    metaPageActors,
    selectedAdSetId,
    name,
    objectType,
    title,
    body,
    description,
    callToActionType,
    linkUrl,
    imageUrl,
    imageHash,
    videoId,
    pageId,
    instagramActorId,
    leadFormId,
    campaignObjective,
    status,
    isMeta,
    isLeadsCampaign,
    selectedPage,
    instagramActorOptions,
    handleOpenChange,
    setBody,
    setCallToActionType,
    setDescription,
    setImageUrl,
    setInstagramActorId,
    setLeadFormId,
    setLinkUrl,
    setName,
    setObjectType,
    setSelectedAdSetId,
    setStatus,
    setTitle,
    setVideoId,
    handleSelectPage,
    handleClearImage,
    handleClearVideo,
    handleImageUpload,
    handleVideoUpload,
    handleSubmit,
    handleClose,
  }
}
