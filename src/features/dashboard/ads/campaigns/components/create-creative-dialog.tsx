'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const videoPreviewRef = useRef<string | null>(null)
  const [loadingPageActors, setLoadingPageActors] = useState(false)
  const [metaPageActors, setMetaPageActors] = useState<MetaPageActorOption[]>([])
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | undefined>(() => propAdSetId)
  const previousPropAdSetIdRef = useRef(propAdSetId)
  if (previousPropAdSetIdRef.current !== propAdSetId) {
    previousPropAdSetIdRef.current = propAdSetId
    setSelectedAdSetId(propAdSetId)
  }

  const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors)
  const createCreative = useAction(adsCreativesApi.createCreative)
  const uploadMedia = useAction(adsCreativesApi.uploadMedia)

  // Form state
  const [name, setName] = useState('')
  const [objectType, setObjectType] = useState<CreativeObjectType>('IMAGE')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [description, setDescription] = useState('')
  const [callToActionType, setCallToActionType] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageHash, setImageHash] = useState('')
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const imagePreviewRef = useRef<string | null>(null)
  const [videoId, setVideoId] = useState('')
  const [pageId, setPageId] = useState('')
  const [instagramActorId, setInstagramActorId] = useState('')
  const [status, setStatus] = useState<CreativeStatus>('PAUSED')
  const submissionRef = useRef<{ fingerprint: string; key: string } | null>(null)

  const resetForm = useCallback(() => {
    setName('')
    setObjectType('IMAGE')
    setTitle('')
    setBody('')
    setDescription('')
    setCallToActionType('')
    setLinkUrl('')
    setImageUrl('')
    setImageHash('')
    revokeBlobPreview(imagePreviewRef.current)
    imagePreviewRef.current = null
    setImagePreviewUrl(null)
    revokeBlobPreview(videoPreviewRef.current)
    videoPreviewRef.current = null
    setVideoPreviewUrl(null)
    setVideoId('')
    setPageId('')
    setInstagramActorId('')
    setStatus('PAUSED')
    setSelectedAdSetId(propAdSetId)
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
      setPageId(nextPageId)
      const actor = metaPageActors.find((row) => row.id === nextPageId)
      setInstagramActorId(actor?.instagramBusinessAccountId ?? '')
    },
    [metaPageActors]
  )

  useEffect(() => {
    if (!open || !isMeta || !workspaceId) return

    let cancelled = false
    const loadingFrame = window.requestAnimationFrame(() => {
      if (!cancelled) {
        setLoadingPageActors(true)
      }
    })

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

        setMetaPageActors(normalizedActors)
        setPageId((currentPageId) => {
          const nextPageId =
            currentPageId && normalizedActors.some((actor) => actor.id === currentPageId)
              ? currentPageId
              : (normalizedActors[0]?.id ?? '')

          if (!nextPageId) {
            setInstagramActorId('')
            return ''
          }

          const pageActor = normalizedActors.find((actor) => actor.id === nextPageId)
          setInstagramActorId(pageActor?.instagramBusinessAccountId ?? '')
          return nextPageId
        })
      })
      .catch((error) => {
        if (cancelled) return
        logError(error, 'CreateCreativeDialog:loadMetaPageActors')
        setMetaPageActors([])
        setPageId('')
        setInstagramActorId('')
        reportConvexFailure({
        error: error,
        context: 'create-creative-dialog.tsx:catch',
        title: 'Failed to load Meta pages',
        fallbackMessage: 'Failed to load Meta pages',
        })
      })
      .finally(() => {
        if (!cancelled) {
          setLoadingPageActors(false)
        }
      })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(loadingFrame)
    }
  }, [open, isMeta, workspaceId, clientId, listMetaPageActors])

  const handleClearImage = useCallback(() => {
    revokeBlobPreview(imagePreviewRef.current)
    imagePreviewRef.current = null
    setImagePreviewUrl(null)
    setImageUrl('')
    setImageHash('')
  }, [])

  const handleClearVideo = useCallback(() => {
    revokeBlobPreview(videoPreviewRef.current)
    videoPreviewRef.current = null
    setVideoPreviewUrl(null)
    setVideoId('')
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
      setImagePreviewUrl(blobUrl)

      setUploadingImage(true)

      if (!workspaceId) {
        notifyFailure({
        title: 'Upload failed',
        message: 'Sign in required',
      })
        setUploadingImage(false)
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
              setImageHash(hash)
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
          setUploadingImage(false)
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
      setVideoPreviewUrl(blobUrl)
      setUploadingVideo(true)

      if (!workspaceId) {
        notifyFailure({ title: 'Upload failed', message: 'Sign in required' })
        setUploadingVideo(false)
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
            setVideoId(result.videoId)
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
          setUploadingVideo(false)
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

      setLoading(true)

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

          setOpen(false)
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
          setLoading(false)
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
    setOpen(false)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!isMeta || !selectedAdSetId}>
          <Plus className="mr-2 h-4 w-4" />
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
