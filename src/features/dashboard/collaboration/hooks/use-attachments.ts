'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useState } from 'react'
import { useToast } from '@/shared/ui/use-toast'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import type { CollaborationAttachment } from '@/types/collaboration'
import type { PendingAttachment } from './types'
import { MAX_ATTACHMENTS } from './constants'
import { validateAttachments } from './utils'

interface UseAttachmentsOptions {
  userId: string | null
  workspaceId: string | null
}

export function useAttachments({ userId, workspaceId }: UseAttachmentsOptions) {
  const { toast } = useToast()

  const generateUploadUrl = useMutation(collaborationApi.generateUploadUrl)

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
      const results: CollaborationAttachment[] = []


      for (const attachment of attachments) {
        const uploadUrlPayload = (await generateUploadUrl({})) as { url?: string }
        const uploadUrl = uploadUrlPayload?.url
        if (!uploadUrl) throw new Error('Unable to create upload URL')

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': attachment.mimeType || 'application/octet-stream',
          },
          body: attachment.file,
        })

        const uploadResult = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
        const storageId = uploadResult?.storageId
        if (!uploadResponse.ok || !storageId) {
          throw new Error('Upload failed')
        }

        results.push({
          name: attachment.name,
          url: 'about:blank',
          storageId,
          type: attachment.mimeType,
          size: attachment.sizeLabel,
        })

      }

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
  }, [generateUploadUrl,  userId, workspaceId])

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
