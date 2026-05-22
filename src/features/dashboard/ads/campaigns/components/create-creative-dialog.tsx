'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import { useAction } from 'convex/react'
import { Plus } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/shared/ui/dialog'
import { toast } from '@/shared/ui/use-toast'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { adsCreativesApi } from '@/lib/convex-api'

import {
  CreateCreativeDialogForm,
  CreateCreativeDialogHeader,
  type CreativeObjectType,
  type CreativeStatus,
  type MetaPageActorOption,
} from './create-creative-dialog-sections'

type MetaCreativeObjectType =
  | 'IMAGE'
  | 'VIDEO'
  | 'CAROUSEL_IMAGE'
  | 'CAROUSEL_VIDEO'
  | 'DYNAMIC_CAROUSEL'

function toMetaCreativeObjectType(objectType: CreativeObjectType): MetaCreativeObjectType {
  switch (objectType) {
    case 'CAROUSEL':
      return 'CAROUSEL_IMAGE'
    case 'DYNAMIC':
      return 'DYNAMIC_CAROUSEL'
    default:
      return objectType
  }
}

type Props = {
  workspaceId: string | null
  providerId: string
  campaignId: string
  clientId?: string | null
  adSetId?: string
  availableAdSets?: Array<{ id: string; name: string }>
  onSuccess?: () => void
}

function parseImageHashFromCreativeSpec(spec: string): string | null {
  const trimmed = spec.trim()
  if (!trimmed) return null
  if (!trimmed.startsWith('{')) return trimmed
  try {
    const parsed = JSON.parse(trimmed) as { image_hash?: string }
    return parsed.image_hash ?? null
  } catch {
    return null
  }
}

function revokeBlobPreview(url: string | null) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

function generateCreativeIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `creative_${crypto.randomUUID()}`
  }
  return `creative_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

type CreateCreativeDialogState = {
  open: boolean
  loading: boolean
  uploadingImage: boolean
  uploadingVideo: boolean
  videoPreviewUrl: string | null
  loadingPageActors: boolean
  metaPageActors: MetaPageActorOption[]
  selectedAdSetId: string | undefined
  name: string
  objectType: CreativeObjectType
  title: string
  body: string
  description: string
  callToActionType: string
  linkUrl: string
  imageUrl: string
  imageHash: string
  imagePreviewUrl: string | null
  videoId: string
  pageId: string
  instagramActorId: string
  status: CreativeStatus
}

type CreateCreativeDialogAction =
  | { type: 'setOpen'; value: boolean }
  | { type: 'setLoading'; value: boolean }
  | { type: 'setUploadingImage'; value: boolean }
  | { type: 'setUploadingVideo'; value: boolean }
  | { type: 'setVideoPreviewUrl'; value: string | null }
  | { type: 'setLoadingPageActors'; value: boolean }
  | { type: 'setMetaPageActors'; value: MetaPageActorOption[] }
  | { type: 'setSelectedAdSetId'; value: string | undefined }
  | { type: 'setName'; value: string }
  | { type: 'setObjectType'; value: CreativeObjectType }
  | { type: 'setTitle'; value: string }
  | { type: 'setBody'; value: string }
  | { type: 'setDescription'; value: string }
  | { type: 'setCallToActionType'; value: string }
  | { type: 'setLinkUrl'; value: string }
  | { type: 'setImageUrl'; value: string }
  | { type: 'setImageHash'; value: string }
  | { type: 'setImagePreviewUrl'; value: string | null }
  | { type: 'setVideoId'; value: string }
  | { type: 'setPageId'; value: string }
  | { type: 'setInstagramActorId'; value: string }
  | { type: 'setStatus'; value: CreativeStatus }
  | { type: 'selectPage'; pageId: string; instagramActorId: string }
  | { type: 'clearImage' }
  | { type: 'clearVideo' }
  | { type: 'reset'; selectedAdSetId: string | undefined }
  | { type: 'applyMetaPageActors'; actors: MetaPageActorOption[] }
  | { type: 'clearMetaPageActorsOnError' }

function createInitialCreateCreativeDialogState(
  selectedAdSetId: string | undefined,
): CreateCreativeDialogState {
  return {
    open: false,
    loading: false,
    uploadingImage: false,
    uploadingVideo: false,
    videoPreviewUrl: null,
    loadingPageActors: false,
    metaPageActors: [],
    selectedAdSetId,
    name: '',
    objectType: 'IMAGE',
    title: '',
    body: '',
    description: '',
    callToActionType: '',
    linkUrl: '',
    imageUrl: '',
    imageHash: '',
    imagePreviewUrl: null,
    videoId: '',
    pageId: '',
    instagramActorId: '',
    status: 'PAUSED',
  }
}

function createCreativeDialogReducer(
  state: CreateCreativeDialogState,
  action: CreateCreativeDialogAction,
): CreateCreativeDialogState {
  switch (action.type) {
    case 'setOpen':
      return { ...state, open: action.value }
    case 'setLoading':
      return { ...state, loading: action.value }
    case 'setUploadingImage':
      return { ...state, uploadingImage: action.value }
    case 'setUploadingVideo':
      return { ...state, uploadingVideo: action.value }
    case 'setVideoPreviewUrl':
      return { ...state, videoPreviewUrl: action.value }
    case 'setLoadingPageActors':
      return { ...state, loadingPageActors: action.value }
    case 'setMetaPageActors':
      return { ...state, metaPageActors: action.value }
    case 'setSelectedAdSetId':
      return { ...state, selectedAdSetId: action.value }
    case 'setName':
      return { ...state, name: action.value }
    case 'setObjectType':
      return { ...state, objectType: action.value }
    case 'setTitle':
      return { ...state, title: action.value }
    case 'setBody':
      return { ...state, body: action.value }
    case 'setDescription':
      return { ...state, description: action.value }
    case 'setCallToActionType':
      return { ...state, callToActionType: action.value }
    case 'setLinkUrl':
      return { ...state, linkUrl: action.value }
    case 'setImageUrl':
      return { ...state, imageUrl: action.value }
    case 'setImageHash':
      return { ...state, imageHash: action.value }
    case 'setImagePreviewUrl':
      return { ...state, imagePreviewUrl: action.value }
    case 'setVideoId':
      return { ...state, videoId: action.value }
    case 'setPageId':
      return { ...state, pageId: action.value }
    case 'setInstagramActorId':
      return { ...state, instagramActorId: action.value }
    case 'setStatus':
      return { ...state, status: action.value }
    case 'selectPage':
      return { ...state, pageId: action.pageId, instagramActorId: action.instagramActorId }
    case 'clearImage':
      return { ...state, imagePreviewUrl: null, imageUrl: '', imageHash: '' }
    case 'clearVideo':
      return { ...state, videoPreviewUrl: null, videoId: '' }
    case 'reset':
      return createInitialCreateCreativeDialogState(action.selectedAdSetId)
    case 'applyMetaPageActors': {
      const normalizedActors = action.actors
      const currentPageId = state.pageId
      const nextPageId =
        currentPageId && normalizedActors.some((actor) => actor.id === currentPageId)
          ? currentPageId
          : (normalizedActors[0]?.id ?? '')

      if (!nextPageId) {
        return {
          ...state,
          metaPageActors: normalizedActors,
          pageId: '',
          instagramActorId: '',
        }
      }

      const pageActor = normalizedActors.find((actor) => actor.id === nextPageId)
      return {
        ...state,
        metaPageActors: normalizedActors,
        pageId: nextPageId,
        instagramActorId: pageActor?.instagramBusinessAccountId ?? '',
      }
    }
    case 'clearMetaPageActorsOnError':
      return { ...state, metaPageActors: [], pageId: '', instagramActorId: '' }
    default:
      return state
  }
}

export function CreateCreativeDialog({
  workspaceId,
  providerId,
  campaignId,
  clientId,
  adSetId: propAdSetId,
  availableAdSets,
  onSuccess,
}: Props) {
  const isMeta = providerId === 'facebook'

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
    status,
  } = state

  const videoPreviewRef = useRef<string | null>(null)
  const previousPropAdSetIdRef = useRef(propAdSetId)
  if (previousPropAdSetIdRef.current !== propAdSetId) {
    previousPropAdSetIdRef.current = propAdSetId
    dispatch({ type: 'setSelectedAdSetId', value: propAdSetId })
  }

  const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors)
  const createCreative = useAction(adsCreativesApi.createCreative)
  const uploadMedia = useAction(adsCreativesApi.uploadMedia)

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
  }, [open, isMeta, workspaceId, clientId, listMetaPageActors])

  const handleClearImage = useCallback(() => {
    revokeBlobPreview(imagePreviewRef.current)
    imagePreviewRef.current = null
    dispatch({ type: 'clearImage' })
  }, [])

  const handleClearVideo = useCallback(() => {
    revokeBlobPreview(videoPreviewRef.current)
    videoPreviewRef.current = null
    dispatch({ type: 'clearVideo' })
  }, [])

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      e.target.value = ''

      if (providerId !== 'facebook') {
        notifyFailure({
        title: 'Platform not supported',
        message: 'Image upload is currently only supported for Meta (Facebook/Instagram) ads.',
      })
        return
      }

      revokeBlobPreview(imagePreviewRef.current)
      const blobUrl = URL.createObjectURL(file)
      imagePreviewRef.current = blobUrl
      dispatch({ type: 'setImagePreviewUrl', value: blobUrl })

      dispatch({ type: 'setUploadingImage', value: true })

      if (!workspaceId) {
        notifyFailure({
        title: 'Upload failed',
        message: 'Sign in required',
      })
        dispatch({ type: 'setUploadingImage', value: false })
        return
      }

      const fileData = await file.arrayBuffer()

      await uploadMedia({
        workspaceId,
        providerId: 'facebook',
        clientId: clientId ?? null,
        fileName: file.name,
        fileData,
        mimeType: file.type || undefined,
      })
        .then((result) => {
          if (!result.success) {
            throw new Error('Failed to upload media')
          }

          if (result.creativeSpec) {
            const hash = parseImageHashFromCreativeSpec(String(result.creativeSpec))
            if (hash) {
              dispatch({ type: 'setImageHash', value: hash })
              toast({
                title: 'Image uploaded',
                description: 'Your image is ready to use in this creative.',
              })
              return
            }
          }

          throw new Error('Upload succeeded but no image hash was returned')
        })
        .catch((error) => {
          reportConvexFailure({
        error: error,
        context: 'CreateCreativeDialog:handleImageUpload',
        title: 'Upload failed',
        fallbackMessage: 'Upload failed',
        })
        })
        .finally(() => {
          dispatch({ type: 'setUploadingImage', value: false })
        })
    },
    [clientId, providerId, uploadMedia, workspaceId]
  )

  const handleVideoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      e.target.value = ''

      if (providerId !== 'facebook') {
        notifyFailure({
          title: 'Platform not supported',
          message: 'Video upload is currently only supported for Meta ads.',
        })
        return
      }

      revokeBlobPreview(videoPreviewRef.current)
      const blobUrl = URL.createObjectURL(file)
      videoPreviewRef.current = blobUrl
      dispatch({ type: 'setVideoPreviewUrl', value: blobUrl })
      dispatch({ type: 'setUploadingVideo', value: true })

      if (!workspaceId) {
        notifyFailure({ title: 'Upload failed', message: 'Sign in required' })
        dispatch({ type: 'setUploadingVideo', value: false })
        return
      }

      const fileData = await file.arrayBuffer()

      await uploadMedia({
        workspaceId,
        providerId: 'facebook',
        clientId: clientId ?? null,
        fileName: file.name,
        fileData,
        mimeType: file.type || undefined,
      })
        .then((result) => {
          if (!result.success) throw new Error('Failed to upload media')
          if (result.videoId) {
            dispatch({ type: 'setVideoId', value: result.videoId })
            toast({
              title: 'Video uploaded',
              description: 'Your video is ready to use in this creative.',
            })
            return
          }
          throw new Error('Upload succeeded but no video ID was returned')
        })
        .catch((error) => {
          reportConvexFailure({
            error,
            context: 'CreateCreativeDialog:handleVideoUpload',
            title: 'Upload failed',
            fallbackMessage: 'Upload failed',
          })
        })
        .finally(() => {
          dispatch({ type: 'setUploadingVideo', value: false })
        })
    },
    [clientId, providerId, uploadMedia, workspaceId],
  )

  const imagePreviewSrc = useMemo(() => {
    if (imagePreviewUrl) return imagePreviewUrl
    const url = imageUrl.trim()
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      return url
    }
    return null
  }, [imagePreviewUrl, imageUrl])

  const videoPreviewSrc = useMemo(() => videoPreviewUrl, [videoPreviewUrl])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!workspaceId) {
        notifyFailure({
        title: 'Error',
        message: 'Sign in required',
      })
        return
      }

      if (!name.trim()) {
        notifyFailure({
        title: 'Validation error',
        message: 'Creative name is required',
      })
        return
      }

      if (providerId !== 'facebook') {
        notifyFailure({
        title: 'Platform not supported',
        message: 'Creating creatives is currently only supported for Meta (Facebook/Instagram) ads.',
      })
        return
      }

      if (!selectedAdSetId) {
        notifyFailure({
        title: 'Ad Set required',
        message: 'Please select an ad set to create the ad.',
      })
        return
      }

      if (!pageId) {
        notifyFailure({
        title: 'Facebook Page required',
        message: 'Select a Facebook Page before creating a Meta creative.',
      })
        return
      }

      if (!metaPageActors.some((actor) => actor.id === pageId)) {
        notifyFailure({
        title: 'Invalid Facebook Page',
        message: 'The selected page is no longer available. Reload the page list and try again.',
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
        status,
      })
        .then(() => {
          toast({
            title: 'Creative created',
            description: `Your ad creative "${name}" has been created successfully.`,
          })

          dispatch({ type: 'setOpen', value: false })
          resetForm()
          onSuccess?.()
        })
        .catch((error) => {
          reportConvexFailure({
        error: error,
        context: 'CreateCreativeDialog:handleSubmit',
        title: 'Creation failed',
        fallbackMessage: 'Creation failed',
        })
        })
        .finally(() => {
          dispatch({ type: 'setLoading', value: false })
        })
    },
    [
      clientId,
      createCreative,
      formFingerprint,
      imageHash,
      instagramActorId,
      metaPageActors,
      name,
      objectType,
      pageId,
      providerId,
      resetForm,
      selectedAdSetId,
      status,
      title,
      body,
      description,
      callToActionType,
      linkUrl,
      imageUrl,
      videoId,
      campaignId,
      workspaceId,
      onSuccess,
    ]
  )

  const handleClose = useCallback(() => {
    dispatch({ type: 'setOpen', value: false })
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!isMeta || !selectedAdSetId}>
          <Plus className="mr-2 size-4" />
          Create Ad
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <CreateCreativeDialogHeader providerId={providerId} />
        <CreateCreativeDialogForm
          availableAdSets={availableAdSets}
          body={body}
          callToActionType={callToActionType}
          description={description}
          imageHash={imageHash}
          imagePreviewSrc={imagePreviewSrc}
          imageUrl={imageUrl}
          onClearImage={handleClearImage}
          instagramActorId={instagramActorId}
          instagramActorOptions={instagramActorOptions}
          isMeta={isMeta}
          linkUrl={linkUrl}
          loading={loading}
          loadingPageActors={loadingPageActors}
          metaPageActors={metaPageActors}
          name={name}
          objectType={objectType}
          onBodyChange={setBody}
          onCallToActionTypeChange={setCallToActionType}
          onClose={handleClose}
          onDescriptionChange={setDescription}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          onImageUrlChange={setImageUrl}
          onClearVideo={handleClearVideo}
          videoPreviewSrc={videoPreviewSrc}
          videoId={videoId}
          uploadingVideo={uploadingVideo}
          onInstagramActorIdChange={setInstagramActorId}
          onLinkUrlChange={setLinkUrl}
          onNameChange={setName}
          onObjectTypeChange={setObjectType}
          onPageIdChange={handleSelectPage}
          onSelectedAdSetIdChange={setSelectedAdSetId}
          onStatusChange={setStatus}
          onSubmit={handleSubmit}
          onTitleChange={setTitle}
          onVideoIdChange={setVideoId}
          pageId={pageId}
          selectedAdSetId={selectedAdSetId}
          selectedPage={selectedPage}
          status={status}
          title={title}
          uploadingImage={uploadingImage}
        />
      </DialogContent>
    </Dialog>
  )
}
