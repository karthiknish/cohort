'use client'

import { useCallback, useState } from 'react'
import { Download, LoaderCircle } from 'lucide-react'

import {
  downloadAgentSpreadsheetExport,
  parseAgentSpreadsheetExport,
} from '@/lib/agent/spreadsheet-export'
import { notifyFailure } from '@/lib/notifications'
import { Button } from '@/shared/ui/button'

type AgentSpreadsheetDownloadProps = {
  data?: Record<string, unknown>
}

export function AgentSpreadsheetDownload({ data }: AgentSpreadsheetDownloadProps) {
  const payload = parseAgentSpreadsheetExport(data)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!payload || isDownloading) return
    setIsDownloading(true)
    try {
      await downloadAgentSpreadsheetExport(payload)
    } catch (error) {
      notifyFailure({
        title: 'Excel export failed',
        message: error instanceof Error ? error.message : 'Could not build the spreadsheet.',
      })
    } finally {
      setIsDownloading(false)
    }
  }, [isDownloading, payload])

  if (!payload) return null

  return (
    <div className="mt-3 rounded-lg border border-border/60 bg-background/70 px-3 py-2.5">
      <p className="text-xs font-medium text-foreground">{payload.title}</p>
      {payload.subtitle ? (
        <p className="mt-0.5 text-xs text-muted-foreground">{payload.subtitle}</p>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="default"
        className="mt-2 gap-2"
        disabled={isDownloading}
        onClick={() => void handleDownload()}
      >
        {isDownloading ? (
          <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Download className="size-3.5" aria-hidden />
        )}
        {isDownloading ? 'Building Excel…' : `Download ${payload.filename}`}
      </Button>
    </div>
  )
}
