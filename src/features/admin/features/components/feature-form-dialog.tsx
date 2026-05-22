'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useReducer } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAction, useConvex, useMutation } from 'convex/react'
import { api } from '/_generated/api'
import { LoaderCircle, Plus, Sparkles, X } from 'lucide-react'

import { useAuth } from '@/shared/contexts/auth-context'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { ImageUploader } from '@/shared/ui/image-uploader'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { useToast } from '@/shared/ui/use-toast'
import { filesApi } from '@/lib/convex-api'
import { usePreview } from '@/shared/contexts/preview-context'
import { validateFile } from '@/lib/utils'
import type {
  FeatureItem,
  FeatureStatus,
  FeaturePriority,
  FeatureReference,
} from '@/types/features'
import {
  FEATURE_STATUSES,
  FEATURE_STATUS_LABELS,
  FEATURE_PRIORITIES,
  FEATURE_PRIORITY_LABELS,
} from '@/types/features'

function FeatureReferenceRow({
  loading,
  onRemove,
  reference,
  index,
}: {
  loading: boolean
  onRemove: (index: number) => void
  reference: FeatureReference
  index: number
}) {
  const handleRemove = useCallback(() => onRemove(index), [onRemove, index])

  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
      <a
        href={reference.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 truncate text-sm text-primary hover:underline"
      >
        {reference.label}
      </a>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-6 shrink-0"
        onClick={handleRemove}
        disabled={loading}
      >
        <X className="size-3" />
      </Button>
    </div>
  )
}

interface FeatureFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature?: FeatureItem | null
  defaultStatus?: FeatureStatus
  onSubmit: (data: {
    title: string
    description: string
    status: FeatureStatus
    priority: FeaturePriority
    imageUrl: string | null
    references: FeatureReference[]
  }) => Promise<void>
}

type FeatureFormState = {
  isSubmitting: boolean
  isGeneratingTitle: boolean
  isGeneratingDescription: boolean
  title: string
  description: string
  status: FeatureStatus
  priority: FeaturePriority
  imageUrl: string | null
  references: FeatureReference[]
  newRefUrl: string
  newRefLabel: string
}

type FeatureFormAction =
  | { type: 'reset'; feature?: FeatureItem | null; defaultStatus: FeatureStatus }
  | { type: 'setIsSubmitting'; value: boolean }
  | { type: 'setGeneratingTitle'; value: boolean }
  | { type: 'setGeneratingDescription'; value: boolean }
  | { type: 'setTitle'; value: string }
  | { type: 'setDescription'; value: string }
  | { type: 'setStatus'; value: FeatureStatus }
  | { type: 'setPriority'; value: FeaturePriority }
  | { type: 'setImageUrl'; value: string | null }
  | { type: 'setReferences'; value: FeatureReference[] }
  | { type: 'addReference'; reference: FeatureReference }
  | { type: 'removeReference'; index: number }
  | { type: 'setNewRefUrl'; value: string }
  | { type: 'setNewRefLabel'; value: string }
  | { type: 'clearNewReferenceInputs' }

function createEmptyFeatureFormState(defaultStatus: FeatureStatus): FeatureFormState {
  return {
    isSubmitting: false,
    isGeneratingTitle: false,
    isGeneratingDescription: false,
    title: '',
    description: '',
    status: defaultStatus,
    priority: 'medium',
    imageUrl: null,
    references: [],
    newRefUrl: '',
    newRefLabel: '',
  }
}

function featureFormReducer(state: FeatureFormState, action: FeatureFormAction): FeatureFormState {
  switch (action.type) {
    case 'reset':
      if (action.feature) {
        return {
          ...createEmptyFeatureFormState(action.defaultStatus),
          title: action.feature.title,
          description: action.feature.description,
          status: action.feature.status,
          priority: action.feature.priority,
          imageUrl: action.feature.imageUrl ?? null,
          references: action.feature.references ?? [],
        }
      }
      return createEmptyFeatureFormState(action.defaultStatus)
    case 'setIsSubmitting':
      return { ...state, isSubmitting: action.value }
    case 'setGeneratingTitle':
      return { ...state, isGeneratingTitle: action.value }
    case 'setGeneratingDescription':
      return { ...state, isGeneratingDescription: action.value }
    case 'setTitle':
      return { ...state, title: action.value }
    case 'setDescription':
      return { ...state, description: action.value }
    case 'setStatus':
      return { ...state, status: action.value }
    case 'setPriority':
      return { ...state, priority: action.value }
    case 'setImageUrl':
      return { ...state, imageUrl: action.value }
    case 'setReferences':
      return { ...state, references: action.value }
    case 'addReference':
      return {
        ...state,
        references: [...state.references, action.reference],
        newRefUrl: '',
        newRefLabel: '',
      }
    case 'removeReference':
      return { ...state, references: state.references.filter((_, i) => i !== action.index) }
    case 'setNewRefUrl':
      return { ...state, newRefUrl: action.value }
    case 'setNewRefLabel':
      return { ...state, newRefLabel: action.value }
    case 'clearNewReferenceInputs':
      return { ...state, newRefUrl: '', newRefLabel: '' }
    default:
      return state
  }
}

export function FeatureFormDialog({
  open,
  onOpenChange,
  feature,
  defaultStatus = 'backlog',
  onSubmit,
}: FeatureFormDialogProps) {
  const { toast } = useToast()
  const { isPreviewMode } = usePreview()
  useAuth()
  const convex = useConvex()
  const [state, dispatch] = useReducer(featureFormReducer, createEmptyFeatureFormState(defaultStatus))
  const {
    isSubmitting,
    isGeneratingTitle,
    isGeneratingDescription,
    title,
    description,
    status,
    priority,
    imageUrl,
    references,
    newRefUrl,
    newRefLabel,
  } = state

  const generateFeatureAi = useAction(api.adminFeaturesAi.generate)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const getPublicUrl = useCallback(
    (args: { storageId: string }) => convex.query(filesApi.getPublicUrl, args),
    [convex]
  )

  const isEditing = !!feature

  // Reset form when dialog opens/closes or feature changes
  useEffect(() => {
    if (!open) {
      return
    }

    const frame = requestAnimationFrame(() => {
      dispatch({ type: 'reset', feature, defaultStatus })
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [open, feature, defaultStatus])

  const handleUploadImage = useCallback(async (file: File): Promise<string> => {
    const validation = validateFile(file, {
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      maxSizeMb: 2,
    })

    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid image file')
    }

    if (isPreviewMode) {
      return URL.createObjectURL(file)
    }

    const { url: uploadUrl } = await generateUploadUrl({})

    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    })

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload file (${uploadResponse.status})`)
    }

    const json = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
    if (!json?.storageId) {
      throw new Error('Upload did not return storageId')
    }

    const publicUrl = await getPublicUrl({ storageId: json.storageId })

    if (!publicUrl?.url) {
      throw new Error('Unable to resolve uploaded file URL')
    }

    return publicUrl.url
  }, [generateUploadUrl, getPublicUrl, isPreviewMode])

  const handleGenerateAI = useCallback((field: 'title' | 'description') => {
    if (field === 'title') {
      dispatch({ type: 'setGeneratingTitle', value: true })
    } else {
      dispatch({ type: 'setGeneratingDescription', value: true })
    }

    if (isPreviewMode) {
      const previewTitle = title.trim() || `${FEATURE_STATUS_LABELS[status]} ${FEATURE_PRIORITY_LABELS[priority]} initiative`
      const previewDescription = description.trim() || `Sample feature brief: tighten the ${status.replace('_', ' ')} workflow, improve stakeholder clarity, and keep the next release visible in the admin roadmap.`

      if (field === 'title') {
        dispatch({ type: 'setTitle', value: previewTitle })
      } else {
        dispatch({ type: 'setDescription', value: previewDescription })
      }

      toast({
        title: 'Preview mode',
        description: `Sample ${field} generated locally for this feature.`,
      })

      dispatch({ type: 'setGeneratingTitle', value: false })
      dispatch({ type: 'setGeneratingDescription', value: false })
      return
    }

    void generateFeatureAi({
        field,
        context: {
          currentTitle: title,
          currentDescription: description,
          status,
          priority,
        },
      })

      .then((data) => {
        if (field === 'title' && data.title) {
          dispatch({ type: 'setTitle', value: data.title })
          toast({ title: 'Title generated', description: 'AI has suggested a title for your feature.' })
        } else if (field === 'description' && data.description) {
          dispatch({ type: 'setDescription', value: data.description })
          toast({ title: 'Description generated', description: 'AI has suggested a description for your feature.' })
        }
      })
      .catch((error) => {
        reportConvexFailure({
        error: error,
        context: 'FeatureFormDialog:generateFeatureAi',
        title: 'Generation failed',
        fallbackMessage: 'Generation failed',
        })
      })
      .finally(() => {
        dispatch({ type: 'setGeneratingTitle', value: false })
        dispatch({ type: 'setGeneratingDescription', value: false })
      })
  }, [description, generateFeatureAi, isPreviewMode, priority, status, title, toast])

  const handleAddReference = useCallback(() => {
    const trimmedUrl = newRefUrl.trim()
    if (!trimmedUrl) return

    if (!URL.canParse(trimmedUrl)) {
      notifyFailure({
        title: 'Invalid URL',
        message: 'Please enter a valid URL',
      })
      return
    }

    const parsedUrl = new URL(trimmedUrl)
    const label = newRefLabel.trim() || parsedUrl.hostname

    dispatch({ type: 'addReference', reference: { url: trimmedUrl, label } })
  }, [newRefUrl, newRefLabel])

  const handleRemoveReference = useCallback((index: number) => {
    dispatch({ type: 'removeReference', index })
  }, [])

  const handleTitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setTitle', value: event.target.value })
  }, [])

  const handleDescriptionChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: 'setDescription', value: event.target.value })
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    dispatch({ type: 'setStatus', value: value as FeatureStatus })
  }, [])

  const handlePriorityChange = useCallback((value: string) => {
    dispatch({ type: 'setPriority', value: value as FeaturePriority })
  }, [])

  const handleNewRefUrlChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setNewRefUrl', value: event.target.value })
  }, [])

  const handleNewRefLabelChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: 'setNewRefLabel', value: event.target.value })
  }, [])

  const handleImageUrlChange = useCallback((value: string | null) => {
    dispatch({ type: 'setImageUrl', value })
  }, [])

  const handleGenerateTitleClick = useCallback(() => {
    handleGenerateAI('title')
  }, [handleGenerateAI])

  const handleGenerateDescriptionClick = useCallback(() => {
    handleGenerateAI('description')
  }, [handleGenerateAI])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault()

      if (!title.trim()) {
        notifyFailure({
        title: 'Title required',
        message: 'Please enter a feature title',
      })
        return
      }

      dispatch({ type: 'setIsSubmitting', value: true })

      void onSubmit({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          imageUrl,
          references,
        })

        .then(() => {
          onOpenChange(false)
        })
        .catch((error) => {
          reportConvexFailure({
        error: error,
        context: 'FeatureFormDialog:handleSubmit',
        title: 'Save failed',
        fallbackMessage: 'Save failed',
        })
        })
        .finally(() => {
          dispatch({ type: 'setIsSubmitting', value: false })
        })
    },
    [title, description, status, priority, imageUrl, references, onSubmit, onOpenChange]
  )
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the feature details below.'
              : 'Add a new feature to your planning board.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="feature-title">Title *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                onClick={handleGenerateTitleClick}
                disabled={isSubmitting || isGeneratingTitle}
              >
                {isGeneratingTitle ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                AI Generate
              </Button>
            </div>
            <Input
              id="feature-title"
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g., User Authentication System"
              disabled={isSubmitting || isGeneratingTitle}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="feature-description">Description</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary"
                onClick={handleGenerateDescriptionClick}
                disabled={isSubmitting || isGeneratingDescription}
              >
                {isGeneratingDescription ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                AI Generate
              </Button>
            </div>
            <Textarea
              id="feature-description"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Describe what this feature should accomplish…"
              rows={3}
              disabled={isSubmitting || isGeneratingDescription}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feature-status">Status</Label>
              <Select value={status} onValueChange={handleStatusChange} disabled={isSubmitting}>
                <SelectTrigger id="feature-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {FEATURE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feature-priority">Priority</Label>
              <Select value={priority} onValueChange={handlePriorityChange} disabled={isSubmitting}>
                <SelectTrigger id="feature-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEATURE_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {FEATURE_PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Feature Image / Mockup</Label>
            <ImageUploader
              value={imageUrl}
              onChange={handleImageUrlChange}
              onUpload={handleUploadImage}
              placeholder="Upload a mockup or screenshot"
              disabled={isSubmitting}
            />
          </div>

          {/* References */}
          <div className="space-y-3">
            <Label>Reference Links</Label>
            <p className="text-xs text-muted-foreground">
              Add links to inspiration, documentation, or requirements.
            </p>

            {/* Existing References */}
            {references.length > 0 && (
              <div className="space-y-2">
                {references.map((reference, index) => (
                  <FeatureReferenceRow
                    key={`${reference.url}-${reference.label}`}
                    loading={isSubmitting}
                    onRemove={handleRemoveReference}
                    reference={reference}
                    index={index}
                  />
                ))}
              </div>
            )}

            {/* Add Reference */}
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={newRefUrl}
                onChange={handleNewRefUrlChange}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Input
                placeholder="Label (optional)"
                value={newRefLabel}
                onChange={handleNewRefLabelChange}
                disabled={isSubmitting}
                className="w-32"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddReference}
                disabled={isSubmitting || !newRefUrl.trim()}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircle className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Feature'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
