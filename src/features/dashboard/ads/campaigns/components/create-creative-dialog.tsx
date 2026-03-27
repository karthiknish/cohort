'use client'

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

type Props = {
  workspaceId: string | null
  providerId: string
  campaignId: string
  clientId?: string | null
  adSetId?: string
  availableAdSets?: Array<{ id: string; name: string }>
  onSuccess?: () => void
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
  const [loadingPageActors, setLoadingPageActors] = useState(false)
  const [metaPageActors, setMetaPageActors] = useState<MetaPageActorOption[]>([])
  const [selectedAdSetId, setSelectedAdSetId] = useState<string | undefined>(propAdSetId)

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
        toast({
          title: 'Failed to load Meta pages',
          description: asErrorMessage(error),
          variant: 'destructive',
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

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      if (providerId !== 'facebook') {
        toast({
          title: 'Platform not supported',
          description: 'Image upload is currently only supported for Meta (Facebook/Instagram) ads.',
          variant: 'destructive',
        })
        return
      }

      setUploadingImage(true)

      if (!workspaceId) {
        toast({
          title: 'Upload failed',
          description: 'Sign in required',
          variant: 'destructive',
        })
        setUploadingImage(false)
        return
      }

      // Convert file to bytes
      const arrayBuffer = await file.arrayBuffer()
      const fileData = new Uint8Array(arrayBuffer)

      await uploadMedia({
        workspaceId,
        providerId: 'facebook',
        clientId: clientId ?? null,
        fileName: file.name,
        fileData: Array.from(fileData),
      })
        .then((result) => {
          if (!result.success) {
            throw new Error(result.error || 'Failed to upload media')
          }

          // Extract creative spec which contains the image_hash
          if (result.creativeSpec) {
            const spec = JSON.parse(result.creativeSpec as string) as { image_hash?: string; video_id?: string }
            if (spec.image_hash) {
              setImageHash(spec.image_hash)
              toast({
                title: 'Image uploaded',
                description: 'Your image has been uploaded successfully.',
              })
            }
          }
        })
        .catch((error) => {
          logError(error, 'CreateCreativeDialog:handleImageUpload')
          toast({
            title: 'Upload failed',
            description: asErrorMessage(error),
            variant: 'destructive',
          })
        })
        .finally(() => {
          setUploadingImage(false)
        })
    },
    [clientId, providerId, uploadMedia, workspaceId]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

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

      if (providerId !== 'facebook') {
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
        objectType,
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
          logError(error, 'CreateCreativeDialog:handleSubmit')
          toast({
            title: 'Creation failed',
            description: asErrorMessage(error),
            variant: 'destructive',
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
          imageUrl={imageUrl}
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
          onImageUrlChange={setImageUrl}
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
          videoId={videoId}
        />
      </DialogContent>
    </Dialog>
  )
}
