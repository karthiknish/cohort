'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useEffect, useReducer } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAction, useConvex, useMutation } from 'convex/react'
import { api } from '/_generated/api'
import { useAuth } from '@/shared/contexts/auth-context'
import { useToast } from '@/shared/ui/use-toast'
import { filesApi } from '@/lib/convex-api'
import { uploadStorageFile } from '@/lib/upload-storage-file'
import { usePreview } from '@/shared/contexts/preview-context'
import { validateFile } from '@/lib/utils'
import type { FeatureItem, FeaturePriority, FeatureStatus } from '@/types/features'
import {
  FEATURE_PRIORITY_LABELS,
  FEATURE_STATUS_LABELS,
} from '@/types/features'
import {
  createEmptyFeatureFormState,
  featureFormReducer,
  type FeatureFormDialogProps,
} from '../feature-form-dialog-types'

export function useFeatureFormDialog({
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
  const syncMetadata = useMutation(filesApi.syncMetadata)
  const getPublicUrl = useCallback(
    (args: { storageId: string }) => convex.query(filesApi.getPublicUrl, args),
    [convex]
  )

  const isEditing = !!feature

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

    const storageId = await uploadStorageFile({
      file,
      contentType: file.type || 'application/octet-stream',
      generateUploadUrl: () => generateUploadUrl({}),
      syncMetadata: (args) => syncMetadata(args),
    })

    const publicUrl = await getPublicUrl({ storageId })

    if (!publicUrl?.url) {
      throw new Error('Unable to resolve uploaded file URL')
    }

    return publicUrl.url
  }, [generateUploadUrl, getPublicUrl, isPreviewMode, syncMetadata])

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

  return {
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
  }
}
