'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Plus, X } from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ImageUploader } from '@/components/ui/image-uploader'
import { useToast } from '@/components/ui/use-toast'
import { storage } from '@/lib/firebase'
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
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<FeatureStatus>(defaultStatus)
  const [priority, setPriority] = useState<FeaturePriority>('medium')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [references, setReferences] = useState<FeatureReference[]>([])

  // Reference input state
  const [newRefUrl, setNewRefUrl] = useState('')
  const [newRefLabel, setNewRefLabel] = useState('')

  const isEditing = !!feature

  // Reset form when dialog opens/closes or feature changes
  useEffect(() => {
    if (open) {
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
    }
  }, [open, feature, defaultStatus])

  const handleUploadImage = useCallback(async (file: File): Promise<string> => {
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name}`
    const storagePath = `features/temp/${fileName}`
    const fileRef = ref(storage, storagePath)

    await uploadBytes(fileRef, file, { contentType: file.type })
    const downloadUrl = await getDownloadURL(fileRef)

    return downloadUrl
  }, [])

  const handleAddReference = useCallback(() => {
    if (!newRefUrl.trim()) return

    try {
      new URL(newRefUrl.trim())
    } catch {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      })
      return
    }

    const label = newRefLabel.trim() || new URL(newRefUrl.trim()).hostname

    setReferences((prev) => [...prev, { url: newRefUrl.trim(), label }])
    setNewRefUrl('')
    setNewRefLabel('')
  }, [newRefUrl, newRefLabel, toast])

  const handleRemoveReference = useCallback((index: number) => {
    setReferences((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

      try {
        await onSubmit({
          title: title.trim(),
          description: description.trim(),
          status,
          priority,
          imageUrl,
          references,
        })
        onOpenChange(false)
      } catch (error) {
        console.error('Failed to save feature:', error)
        toast({
          title: 'Save failed',
          description: 'Unable to save the feature. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setIsSubmitting(false)
      }
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
            <Label htmlFor="feature-title">Title *</Label>
            <Input
              id="feature-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., User Authentication System"
              disabled={isSubmitting}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="feature-description">Description</Label>
            <Textarea
              id="feature-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this feature should accomplish..."
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="feature-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as FeatureStatus)} disabled={isSubmitting}>
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
              <Select value={priority} onValueChange={(v) => setPriority(v as FeaturePriority)} disabled={isSubmitting}>
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
                {references.map((ref, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2"
                  >
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 truncate text-sm text-primary hover:underline"
                    >
                      {ref.label}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={() => handleRemoveReference(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Reference */}
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com"
                value={newRefUrl}
                onChange={(e) => setNewRefUrl(e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Input
                placeholder="Label (optional)"
                value={newRefLabel}
                onChange={(e) => setNewRefLabel(e.target.value)}
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Feature'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
