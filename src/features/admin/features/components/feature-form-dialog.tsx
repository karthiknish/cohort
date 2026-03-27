'use client'

import { useCallback, useEffect, useState } from 'react'
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
import { useToast } from '@/shared/ui/use-toast'
import { filesApi } from '@/lib/convex-api'
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
        className="h-6 w-6 shrink-0"
        onClick={handleRemove}
        disabled={loading}
      >
        <X className="h-3 w-3" />
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

export function FeatureFormDialog({
  open,
  onOpenChange,
  feature,
  defaultStatus = 'backlog',
  onSubmit,
}: FeatureFormDialogProps) {
  const { toast } = useToast()
  useAuth()
  const convex = useConvex()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<FeatureStatus>('backlog')
  const [priority, setPriority] = useState<FeaturePriority>('medium')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [references, setReferences] = useState<FeatureReference[]>([])

  // Reference input state
  const [newRefUrl, setNewRefUrl] = useState('')
  const [newRefLabel, setNewRefLabel] = useState('')

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
      if (feature) {
        setTitle(feature.title)
        setDescription(feature.description)
        setStatus(feature.status)
        setPriority(feature.priority)
        setImageUrl(feature.imageUrl ?? null)
        setReferences(feature.references ?? [])
      } else {
        setTitle('')
        setDescription('')
        setStatus(defaultStatus)
        setPriority('medium')
        setImageUrl(null)
        setReferences([])
      }
      setNewRefUrl('')
      setNewRefLabel('')
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

    const { url: uploadUrl } = await generateUploadUrl()

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
  }, [generateUploadUrl, getPublicUrl])

  const handleGenerateAI = useCallback((field: 'title' | 'description') => {
    if (field === 'title') {
      setIsGeneratingTitle(true)
    } else {
      setIsGeneratingDescription(true)
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
          setTitle(data.title)
          toast({ title: 'Title generated', description: 'AI has suggested a title for your feature.' })
        } else if (field === 'description' && data.description) {
          setDescription(data.description)
          toast({ title: 'Description generated', description: 'AI has suggested a description for your feature.' })
        }
      })
      .catch((error) => {
        console.error('AI generation failed:', error)
        toast({
          title: 'Generation failed',
          description: 'Unable to generate content. Please try again.',
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsGeneratingTitle(false)
        setIsGeneratingDescription(false)
      })
  }, [title, description, status, priority, toast, generateFeatureAi])

  const handleAddReference = useCallback(() => {
    const trimmedUrl = newRefUrl.trim()
    if (!trimmedUrl) return

    if (!URL.canParse(trimmedUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      })
      return
    }

    const parsedUrl = new URL(trimmedUrl)
    const label = newRefLabel.trim() || parsedUrl.hostname

    setReferences((prev) => [...prev, { url: trimmedUrl, label }])
    setNewRefUrl('')
    setNewRefLabel('')
  }, [newRefUrl, newRefLabel, toast])

  const handleRemoveReference = useCallback((index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleTitleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }, [])

  const handleDescriptionChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value as FeatureStatus)
  }, [])

  const handlePriorityChange = useCallback((value: string) => {
    setPriority(value as FeaturePriority)
  }, [])

  const handleNewRefUrlChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNewRefUrl(event.target.value)
  }, [])

  const handleNewRefLabelChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setNewRefLabel(event.target.value)
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
        toast({
          title: 'Title required',
          description: 'Please enter a feature title',
          variant: 'destructive',
        })
        return
      }

      setIsSubmitting(true)

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
          console.error('Failed to save feature:', error)
          toast({
            title: 'Save failed',
            description: 'Unable to save the feature. Please try again.',
            variant: 'destructive',
          })
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [title, description, status, priority, imageUrl, references, onSubmit, onOpenChange, toast]
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
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
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
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
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
              onChange={setImageUrl}
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
                <Plus className="h-4 w-4" />
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
              {isSubmitting && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Feature'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
