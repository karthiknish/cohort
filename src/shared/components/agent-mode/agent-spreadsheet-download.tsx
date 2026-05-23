'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useConvex, useMutation } from 'convex/react'
import { Download, LoaderCircle } from 'lucide-react'

import type { AgentAttachmentContext } from '@/lib/agent-attachments'
import {
  downloadAgentSpreadsheetExport,
  parseAgentSpreadsheetExport,
  parseStoredSpreadsheetExport,
  persistAgentSpreadsheetExport,
} from '@/lib/agent/spreadsheet-export'
import { agentApi, filesApi } from '@/lib/convex-api'
import { isPreviewModeEnabled } from '@/lib/preview-data'
import { notifyFailure } from '@/lib/notifications'
import { Button } from '@/shared/ui/button'

type AgentSpreadsheetDownloadProps = {
  messageId: string
  conversationId: string | null
  workspaceId: string | null
  data?: Record<string, unknown>
  attachments?: AgentAttachmentContext[]
  onStored?: (messageId: string, attachment: AgentAttachmentContext) => void
}

export function AgentSpreadsheetDownload({
  messageId,
  conversationId,
  workspaceId,
  data,
  attachments,
  onStored,
}: AgentSpreadsheetDownloadProps) {
  const convex = useConvex()
  const attachSpreadsheetExport = useMutation(agentApi.attachSpreadsheetExport)
  const generateUploadUrl = useMutation(filesApi.generateUploadUrl)
  const syncMetadata = useMutation(filesApi.syncMetadata)

  const payload = parseAgentSpreadsheetExport(data)
  const storedExport = parseStoredSpreadsheetExport(data)
  const alreadyStored =
    storedExport !== null ||
    (attachments?.some((attachment) => attachment.storageId && attachment.name.endsWith('.xlsx')) ?? false)

  const [isDownloading, setIsDownloading] = useState(false)
  const [isStoring, setIsStoring] = useState(false)
  const persistAttemptedRef = useRef(false)

  const getPublicUrl = useCallback(
    (args: { storageId: string }) => convex.query(filesApi.getPublicUrl, args),
    [convex],
  )

  const storeExport = useCallback(async () => {
    if (!payload || !conversationId || !workspaceId || isPreviewModeEnabled() || alreadyStored) {
      return null
    }

    setIsStoring(true)
    try {
      const attachment = await persistAgentSpreadsheetExport({
        payload,
        generateUploadUrl: () => generateUploadUrl({}),
        syncMetadata: (args) => syncMetadata(args),
        getPublicUrl,
      })

      await attachSpreadsheetExport({
        workspaceId,
        conversationLegacyId: conversationId,
        legacyId: messageId,
        attachment: {
          id: attachment.id,
          name: attachment.name,
          mimeType: attachment.mimeType,
          sizeLabel: attachment.sizeLabel,
          excerpt: attachment.excerpt,
          extractionStatus: attachment.extractionStatus,
          storageId: attachment.storageId,
          url: attachment.url,
        },
      })

      onStored?.(messageId, attachment)
      return attachment
    } catch (error) {
      notifyFailure({
        title: 'Could not save Excel file',
        message: error instanceof Error ? error.message : 'Upload to storage failed.',
      })
      return null
    } finally {
      setIsStoring(false)
    }
  }, [
    alreadyStored,
    attachSpreadsheetExport,
    conversationId,
    generateUploadUrl,
    getPublicUrl,
    messageId,
    onStored,
    payload,
    syncMetadata,
    workspaceId,
  ])

  useEffect(() => {
    if (!payload || alreadyStored || persistAttemptedRef.current) return
    persistAttemptedRef.current = true
    void storeExport()
  }, [alreadyStored, payload, storeExport])

  const handleDownload = useCallback(async () => {
    if (!payload || isDownloading) return
    setIsDownloading(true)
    try {
      if (!alreadyStored) {
        await storeExport()
      }
      await downloadAgentSpreadsheetExport(payload)
    } catch (error) {
      notifyFailure({
        title: 'Excel export failed',
        message: error instanceof Error ? error.message : 'Could not build the spreadsheet.',
      })
    } finally {
      setIsDownloading(false)
    }
  }, [alreadyStored, isDownloading, payload, storeExport])

  if (!payload) return null

  const busy = isDownloading || isStoring

  return (
    <div className="mt-3 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5">
      <p className="text-xs font-medium text-foreground">{payload.title}</p>
      {payload.subtitle ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{payload.subtitle}</p>
      ) : null}
      <p className="mt-1 text-xs text-muted-foreground">
        {isStoring
          ? 'Saving workbook to your workspace…'
          : alreadyStored
            ? 'Saved in chat — download anytime.'
            : 'Download now or wait while it saves to chat.'}
      </p>
      <Button
        type="button"
        size="sm"
        variant="default"
        className="mt-2 gap-2"
        disabled={busy}
        onClick={() => void handleDownload()}
      >
        {busy ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Download className="size-3.5" aria-hidden />
        )}
        {isDownloading ? 'Building Excel…' : isStoring ? 'Saving…' : `Download ${payload.filename}`}
      </Button>
    </div>
  )
}
