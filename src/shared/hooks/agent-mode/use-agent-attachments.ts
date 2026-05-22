'use client'

import { useCallback, useState } from 'react'
import { useAction } from 'convex/react'

import { agentApi } from '@/lib/convex-api'
import {
  buildAgentAttachmentContext,
  createPendingAttachmentPlaceholder,
  getPdfUploadSizeError,
  readFileAsBase64,
  type AgentAttachmentContext,
  type ServerPdfExtractionResult,
} from '@/lib/agent-attachments'
import { isPreviewModeEnabled } from '@/lib/preview-data'

export function useAgentAttachments(workspaceId: string | null) {
  const extractPdfTextAction = useAction(agentApi.extractPdfText)

  const [pendingAttachments, setPendingAttachments] = useState<AgentAttachmentContext[]>([])
  const [isExtractingAttachments, setIsExtractingAttachments] = useState(false)

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
            setPendingAttachments((prev) =>
              prev.map((attachment) => (attachment.id === placeholderId ? extracted : attachment)),
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
  }, [extractPdfOnServer])

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
