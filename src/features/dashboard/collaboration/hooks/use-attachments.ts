'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import type { CollaborationAttachment } from '@/types/collaboration'
import type { PendingAttachment } from './types'
import { MAX_ATTACHMENTS } from './constants'
import { validateAttachments } from './utils'
import { uploadStorageFile } from '@/lib/upload-storage-file'

interface UseAttachmentsOptions {
  userId: string | null
  workspaceId: string | null
}

export function useAttachments({ userId, workspaceId }: UseAttachmentsOptions) {
  const generateUploadUrl = useMutation(collaborationApi.generateUploadUrl)
  const syncMetadata = useMutation(collaborationApi.syncMetadata)

  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [uploading, setUploading] = useState(false)

  const handleAddAttachments = useCallback((files: FileList | File[]) => {
    const result = validateAttachments(files, pendingAttachments.length, MAX_ATTACHMENTS)

    if (result.errors.length > 0) {
      notifyFailure({
        title: "Some files couldn't be attached",
        message: result.errors.join('. '),
      })
    }

    if (result.valid.length > 0) {
      setPendingAttachments((prev) => [...prev, ...result.valid])
    }
  }, [pendingAttachments.length])

  const handleRemoveAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId))
  }, [])

  const clearAttachments = useCallback(() => {
    setPendingAttachments([])
  }, [])

  const uploadAttachments = useCallback(async (attachments: PendingAttachment[]): Promise<CollaborationAttachment[]> => {
    if (!userId || !workspaceId || attachments.length === 0) {
      return []
    }

    setUploading(true)

    try {
      const results = await Promise.all(
        attachments.map(async (attachment) => {
          const storageId = await uploadStorageFile({
            file: attachment.file,
            contentType: attachment.mimeType || 'application/octet-stream',
            generateUploadUrl: () => generateUploadUrl({}),
            syncMetadata: (args) => syncMetadata(args),
          })

          return {
            name: attachment.name,
            url: 'about:blank',
            storageId,
            type: attachment.mimeType,
            size: attachment.sizeLabel,
          } satisfies CollaborationAttachment
        }),
      )

      return results
    } catch (error) {
      reportConvexFailure({
        error: error,
        context: 'useAttachments:uploadAttachments',
        title: 'Upload failed',
        fallbackMessage: 'Upload failed',
        })
      return []
    } finally {
      setUploading(false)
    }
  }, [generateUploadUrl, syncMetadata, userId, workspaceId])

  return {
    pendingAttachments,
    uploading,
    handleAddAttachments,
    handleRemoveAttachment,
    clearAttachments,
    uploadAttachments,
    setUploading,
  }
}
