'use client'

import { useCallback, useState } from 'react'
import { useAction, useConvex, useMutation } from 'convex/react'

import { agentApi, filesApi } from '@/lib/convex-api'
import {
  buildAgentAttachmentContext,
  createPendingAttachmentPlaceholder,
  getPdfUploadSizeError,
  readFileAsBase64,
  type AgentAttachmentContext,
  type ServerPdfExtractionResult,
} from '@/lib/agent-attachments'
import { isPreviewModeEnabled } from '@/lib/preview-data'
import { uploadStorageFileWithPublicUrl } from '@/lib/upload-storage-file'

export function useAgentAttachments(workspaceId: string | null) {
  const convex = useConvex()
  const extractPdfTextAction = useAction(agentApi.extractPdfText)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const syncMetadata = useMutation(filesApi.syncMetadata)

  const [pendingAttachments, setPendingAttachments] = useState<AgentAttachmentContext[]>([])
  const [isExtractingAttachments, setIsExtractingAttachments] = useState(false)

  const getPublicUrl = useCallback(
    (args: { storageId: string }) => {
      if (!workspaceId) {
        throw new Error('Workspace context missing')
      }
      return convex.query(filesApi.getPublicUrl, {
        workspaceId,
        storageId: args.storageId,
      })
    },
    [convex, workspaceId],
  )

  const extractPdfOnServer = useCallback(
    async (file: File): Promise<ServerPdfExtractionResult | null> => {
      if (!workspaceId || isPreviewModeEnabled()) return null
      const sizeError = getPdfUploadSizeError(file)
      if (sizeError) {
        return { extractionStatus: 'failed', errorMessage: sizeError }
      }
      try {
        const dataBase64 = await readFileAsBase64(file)
        const result = (await extractPdfTextAction({
          workspaceId,
          fileName: file.name,
          dataBase64,
        })) as ServerPdfExtractionResult
        return result
      } catch (err) {
        console.error('[useAgentMode] Server PDF extraction failed:', err)
        return null
      }
    },
    [extractPdfTextAction, workspaceId],
  )

  const persistAttachmentFile = useCallback(
    async (file: File, attachment: AgentAttachmentContext): Promise<AgentAttachmentContext> => {
      if (isPreviewModeEnabled() || !workspaceId) {
        return attachment
      }

      try {
        const { storageId, url } = await uploadStorageFileWithPublicUrl({
          file,
          contentType: file.type || 'application/octet-stream',
          generateUploadUrl: () => generateUploadUrl({}),
          syncMetadata: (args) => syncMetadata(args),
          getPublicUrl,
        })
        return { ...attachment, storageId, url }
      } catch (err) {
        console.error('[useAgentMode] Attachment upload failed:', err, file.name)
        return {
          ...attachment,
          errorMessage: attachment.errorMessage ?? 'File was read but could not be saved to storage.',
        }
      }
    },
    [generateUploadUrl, getPublicUrl, syncMetadata, workspaceId],
  )

  const addAttachments = useCallback(async (files: FileList | File[]) => {
    const nextFiles = Array.from(files)
    if (nextFiles.length === 0) return

    const placeholders = nextFiles.map((file) => createPendingAttachmentPlaceholder(file))
    setPendingAttachments((prev) => [...prev, ...placeholders])
    setIsExtractingAttachments(true)

    try {
      await Promise.all(
        nextFiles.map(async (file, index) => {
          const placeholderId = placeholders[index]?.id
          if (!file || !placeholderId) return

          try {
            const extracted = await buildAgentAttachmentContext(file, { extractPdfOnServer })
            const withStorage = await persistAttachmentFile(file, extracted)
            setPendingAttachments((prev) =>
              prev.map((attachment) => (attachment.id === placeholderId ? withStorage : attachment)),
            )
          } catch (err) {
            console.error('[useAgentMode] Attachment processing failed:', err, file.name)
            setPendingAttachments((prev) =>
              prev.map((attachment) =>
                attachment.id === placeholderId
                  ? {
                      ...attachment,
                      extractionStatus: 'failed',
                      excerpt: 'Could not read this file.',
                      errorMessage:
                        err instanceof Error ? err.message : 'Could not process this attachment.',
                    }
                  : attachment,
              ),
            )
          }
        }),
      )
    } finally {
      setIsExtractingAttachments(false)
    }
  }, [extractPdfOnServer, persistAttachmentFile])

  const removeAttachment = useCallback((attachmentId: string) => {
    setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId))
  }, [])

  const clearAttachments = useCallback(() => {
    setPendingAttachments([])
  }, [])

  return {
    pendingAttachments,
    setPendingAttachments,
    isExtractingAttachments,
    addAttachments,
    removeAttachment,
    clearAttachments,
  }
}
