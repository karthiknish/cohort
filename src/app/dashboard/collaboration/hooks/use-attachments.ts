'use client'

import { useCallback, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
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

  const generateUploadUrl = useMutation((collaborationApi as any).generateUploadUrl)

  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [uploading, setUploading] = useState(false)

  const handleAddAttachments = useCallback((files: FileList | File[]) => {
    const result = validateAttachments(files, pendingAttachments.length, MAX_ATTACHMENTS)

    if (result.errors.length > 0) {
      toast({
        title: 'Some files couldn\'t be attached',
        description: result.errors.join('. '),
        variant: 'destructive',
      })
    }

    if (result.valid.length > 0) {
      setPendingAttachments((prev) => [...prev, ...result.valid])
    }
  }, [pendingAttachments.length, toast])

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
      console.warn('[collaboration] failed to upload attachments', error)
      toast({
        title: 'Upload failed',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
      return []
    } finally {
      setUploading(false)
    }
  }, [generateUploadUrl, toast, userId, workspaceId])

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
