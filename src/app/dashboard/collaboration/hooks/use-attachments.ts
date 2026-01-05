'use client'

import { useCallback, useState } from 'react'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { useToast } from '@/components/ui/use-toast'
import type { CollaborationAttachment } from '@/types/collaboration'
import type { PendingAttachment } from './types'
import { MAX_ATTACHMENTS } from './constants'
import { validateAttachments, formatFileSize } from './utils'

interface UseAttachmentsOptions {
  userId: string | null
}

export function useAttachments({ userId }: UseAttachmentsOptions) {
  const { toast } = useToast()
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
    if (!userId || attachments.length === 0) {
      return []
    }

    setUploading(true)

    try {
      const uploadPromises = attachments.map(async (attachment) => {
        const timestamp = Date.now()
        const fileName = `${timestamp}-${attachment.file.name}`
        const storagePath = `users/${userId}/collaboration/${fileName}`
        const fileRef = ref(storage, storagePath)

        await uploadBytes(fileRef, attachment.file, {
          contentType: attachment.mimeType,
        })

        const downloadUrl = await getDownloadURL(fileRef)

        return {
          name: attachment.name,
          url: downloadUrl,
          type: attachment.mimeType,
          size: attachment.sizeLabel,
        }
      })

      return await Promise.all(uploadPromises)
    } finally {
      setUploading(false)
    }
  }, [userId])

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
