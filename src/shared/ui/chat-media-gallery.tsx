'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  Download,
  ExternalLink,
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  Film,
  ImageIcon,
  Music2,
  MonitorPlay,
} from 'lucide-react'

import { ImageGallery } from '@/features/dashboard/collaboration/components/image-gallery'
import { highlightText, hasHighlightTerms } from '@/features/dashboard/collaboration/components/search-highlighter'
import { isLikelyImageUrl } from '@/features/dashboard/collaboration/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { cn } from '@/lib/utils'

import type { AttachmentKind, ChatMediaAttachment } from './chat-media-gallery-types'
export type { AttachmentKind, ChatMediaAttachment } from './chat-media-gallery-types'
import { getAttachmentKind } from './chat-media-gallery-utils'

export type ChatMediaGalleryProps = {
  attachments: ChatMediaAttachment[]
  highlightTerms?: string[]
  /** Compact mode for inline message bubbles */
  compact?: boolean
  className?: string
}

function hasUsableAttachmentUrl(url: string | null | undefined): boolean {
  if (typeof url !== 'string') return false
  const normalized = url.trim()
  return normalized.length > 0 && normalized !== '#' && normalized !== 'about:blank'
}

export function AttachmentKindIcon({ kind, className }: { kind: AttachmentKind; className?: string }) {
  const iconClass = cn('size-5', className)
  switch (kind) {
    case 'image':
      return <ImageIcon className={iconClass} aria-hidden />
    case 'video':
      return <Film className={iconClass} aria-hidden />
    case 'pdf':
      return <FileText className={iconClass} aria-hidden />
    case 'audio':
      return <Music2 className={iconClass} aria-hidden />
    case 'spreadsheet':
      return <FileSpreadsheet className={iconClass} aria-hidden />
    case 'archive':
      return <FileArchive className={iconClass} aria-hidden />
    default:
      return <File className={iconClass} aria-hidden />
  }
}

const KIND_SURFACE: Record<AttachmentKind, string> = {
  image: 'bg-info/10 text-info ring-info/15',
  video: 'bg-accent/10 text-accent ring-accent/15',
  pdf: 'bg-destructive/10 text-destructive ring-destructive/15',
  audio: 'bg-warning/10 text-warning ring-warning/15',
  spreadsheet: 'bg-success/10 text-success ring-success/15',
  archive: 'bg-muted text-muted-foreground ring-border/50',
  file: 'bg-primary/10 text-primary ring-primary/15',
}

function AttachmentName({
  name,
  highlightTerms,
}: {
  name: string
  highlightTerms?: string[]
}) {
  return (
    <span className="truncate font-medium" title={name}>
      {hasHighlightTerms(highlightTerms) ? highlightText(name, highlightTerms) : name}
    </span>
  )
}

function MediaTile({
  attachment,
  kind,
  highlightTerms,
  onOpenPdf,
  compact,
}: {
  attachment: ChatMediaAttachment
  kind: AttachmentKind
  highlightTerms?: string[]
  onOpenPdf?: (attachment: ChatMediaAttachment) => void
  compact?: boolean
}) {
  const handleOpenPdf = useCallback(() => {
    onOpenPdf?.(attachment)
  }, [attachment, onOpenPdf])

  if (kind === 'video') {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-border/60 bg-card/80 shadow-sm',
          compact && 'max-w-md',
        )}
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-xl ring-1', KIND_SURFACE.video)}>
              <AttachmentKindIcon kind="video" className="size-4" />
            </span>
            <AttachmentName name={attachment.name} highlightTerms={highlightTerms} />
            {attachment.size ? (
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                {attachment.size}
              </Badge>
            ) : null}
          </div>
          <Button asChild variant="ghost" size="sm" className="h-8 shrink-0 gap-1 rounded-lg">
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" download>
              <Download className="size-3.5" aria-hidden />
              <span className="sr-only">Download</span>
            </a>
          </Button>
        </div>
        <div className="bg-muted/20 p-1">
          <video
            src={attachment.url}
            controls
            aria-label={attachment.name || 'Video attachment'}
            className="max-h-72 w-full rounded-xl bg-foreground"
            preload="metadata"
          >
            <track kind="captions" label={`${attachment.name} captions`} />
          </video>
        </div>
      </div>
    )
  }

  if (kind === 'pdf') {
    return (
      <div
        className={cn(
          'group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-sm transition hover:border-primary/25 hover:shadow-md motion-reduce:transition-none',
          compact && 'max-w-md',
        )}
      >
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl ring-1',
            KIND_SURFACE.pdf,
          )}
        >
          <AttachmentKindIcon kind="pdf" />
        </span>
        <div className="min-w-0 flex-1">
          <AttachmentName name={attachment.name} highlightTerms={highlightTerms} />
          <p className="text-xs text-muted-foreground">
            {attachment.size ? `${attachment.size} · ` : ''}PDF document
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {onOpenPdf ? (
            <Button type="button" variant="outline" size="sm" className="h-8 gap-1 rounded-lg" onClick={handleOpenPdf}>
              <MonitorPlay className="size-3.5" aria-hidden />
              Preview
            </Button>
          ) : null}
          <Button asChild variant="ghost" size="icon" className="size-8 rounded-lg">
            <a href={attachment.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${attachment.name}`}>
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 p-3 shadow-sm transition hover:border-primary/25 hover:shadow-md motion-reduce:transition-none',
        compact && 'max-w-md',
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl ring-1',
          KIND_SURFACE[kind],
        )}
      >
        <AttachmentKindIcon kind={kind} />
      </span>
      <div className="min-w-0 flex-1">
        <AttachmentName name={attachment.name} highlightTerms={highlightTerms} />
        {attachment.size ? <p className="text-xs text-muted-foreground">{attachment.size}</p> : null}
      </div>
      <Download className="size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" aria-hidden />
    </a>
  )
}

export function ChatMediaGallery({
  attachments,
  highlightTerms,
  compact = false,
  className,
}: ChatMediaGalleryProps) {
  const [activePdf, setActivePdf] = useState<ChatMediaAttachment | null>(null)

  const grouped = useMemo(() => {
    const images: ChatMediaAttachment[] = []
    const videos: ChatMediaAttachment[] = []
    const pdfs: ChatMediaAttachment[] = []
    const other: ChatMediaAttachment[] = []
    const unavailable: ChatMediaAttachment[] = []

    for (const attachment of attachments) {
      if (!hasUsableAttachmentUrl(attachment.url)) {
        unavailable.push(attachment)
        continue
      }
      const kind = getAttachmentKind(attachment)
      if (kind === 'image') images.push(attachment)
      else if (kind === 'video') videos.push(attachment)
      else if (kind === 'pdf') pdfs.push(attachment)
      else other.push(attachment)
    }

    return { images, videos, pdfs, other, unavailable }
  }, [attachments])

  const downloadable = attachments.filter((a) => hasUsableAttachmentUrl(a.url))

  const handleDownloadAll = useCallback(() => {
    downloadable.forEach((attachment, index) => {
      const anchor = document.createElement('a')
      anchor.href = attachment.url
      anchor.download = attachment.name || `attachment-${index + 1}`
      anchor.target = '_blank'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    })
  }, [downloadable])

  const handlePdfDialogOpenChange = useCallback(
    (open: boolean) => {
      if (!open) setActivePdf(null)
    },
    [],
  )

  if (!attachments.length) return null

  return (
    <div className={cn('space-y-3', className)}>
      {!compact && attachments.length > 1 ? (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            {attachments.length} attachment{attachments.length === 1 ? '' : 's'}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 rounded-lg px-2"
            onClick={handleDownloadAll}
            disabled={downloadable.length === 0}
          >
            <Download className="size-3.5" aria-hidden />
            Download all
          </Button>
        </div>
      ) : null}

      {grouped.images.length > 0 ? (
        <ImageGallery
          images={grouped.images.map((a) => ({
            url: a.url,
            name: a.name,
            size: a.size ?? undefined,
          }))}
        />
      ) : null}

      {grouped.videos.map((attachment) => (
        <MediaTile
          key={`${attachment.url}-video`}
          attachment={attachment}
          kind="video"
          highlightTerms={highlightTerms}
          compact={compact}
        />
      ))}

      {grouped.pdfs.map((attachment) => (
        <MediaTile
          key={`${attachment.url}-pdf`}
          attachment={attachment}
          kind="pdf"
          highlightTerms={highlightTerms}
          onOpenPdf={setActivePdf}
          compact={compact}
        />
      ))}

      {grouped.other.map((attachment) => (
        <MediaTile
          key={`${attachment.url}-${attachment.name}`}
          attachment={attachment}
          kind={getAttachmentKind(attachment)}
          highlightTerms={highlightTerms}
          compact={compact}
        />
      ))}

      {grouped.unavailable.map((attachment) => (
        <div
          key={`${attachment.name}-pending`}
          className="flex items-center gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/15 p-3 text-sm"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/50 ring-1 ring-border/50">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <AttachmentName name={attachment.name} highlightTerms={highlightTerms} />
            <p className="text-xs text-muted-foreground">Syncing - preview available when ready.</p>
          </div>
          {attachment.size ? (
            <Badge variant="secondary" className="shrink-0 text-[10px]">
              {attachment.size}
            </Badge>
          ) : null}
          <Badge variant="outline" className="shrink-0 text-[10px]">
            Preparing
          </Badge>
        </div>
      ))}

      <Dialog open={Boolean(activePdf)} onOpenChange={handlePdfDialogOpenChange}>
        <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="border-b border-border/50 px-5 py-4">
            <DialogTitle className="truncate pr-8">{activePdf?.name ?? 'PDF preview'}</DialogTitle>
            <DialogDescription>Inline preview · open in a new tab for full controls.</DialogDescription>
          </DialogHeader>
          {activePdf ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <iframe
                src={activePdf.url}
                title={activePdf.name}
                sandbox=""
                className="min-h-[60vh] w-full flex-1 bg-muted/20"
              />
              <div className="flex justify-end gap-2 border-t border-border/50 px-4 py-3">
                <Button asChild variant="outline" size="sm" className="rounded-lg">
                  <a href={activePdf.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
                    Open in tab
                  </a>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
