'use client'

import { useCallback } from 'react'
import { LoaderCircle, Plus, Sparkles, X } from 'lucide-react'

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
import type { FeatureReference } from '@/types/features'
import {
  FEATURE_STATUSES,
  FEATURE_STATUS_LABELS,
  FEATURE_PRIORITIES,
  FEATURE_PRIORITY_LABELS,
} from '@/types/features'
import type { useFeatureFormDialog } from './hooks/use-feature-form-dialog'

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

type FeatureFormDialogBodyProps = ReturnType<typeof useFeatureFormDialog>

export function FeatureFormDialogBody(props: FeatureFormDialogBodyProps) {
  const {
    isEditing,
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
    handleUploadImage,
    handleAddReference,
    handleRemoveReference,
    handleTitleChange,
    handleDescriptionChange,
    handleStatusChange,
    handlePriorityChange,
    handleNewRefUrlChange,
    handleNewRefLabelChange,
    handleImageUrlChange,
    handleGenerateTitleClick,
    handleGenerateDescriptionClick,
    handleClose,
    handleSubmit,
  } = props

  return (
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

        <div className="space-y-3">
          <Label>Reference Links</Label>
          <p className="text-xs text-muted-foreground">
            Add links to inspiration, documentation, or requirements.
          </p>

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
  )
}

export function FeatureFormDialogShell({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}
