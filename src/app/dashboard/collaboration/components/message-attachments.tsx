'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Download, FileText, FileVideo, MonitorPlay, Play, Video } from 'lucide-react'
import type { CollaborationAttachment } from '@/types/collaboration'
import { isLikelyImageUrl } from '../utils'
import { ImageGallery } from './image-gallery'
import { highlightText, hasHighlightTerms } from './search-highlighter'

export interface MessageAttachmentsProps {
  attachments: CollaborationAttachment[]
  highlightTerms?: string[]
}

export function MessageAttachments({ attachments, highlightTerms }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null

  const [activePdf, setActivePdf] = useState<CollaborationAttachment | null>(null)

  const { imageAttachments, videoAttachments, pdfAttachments, otherAttachments } = useMemo(() => {
    const images: CollaborationAttachment[] = []
    const videos: CollaborationAttachment[] = []
    const pdfs: CollaborationAttachment[] = []
    const other: CollaborationAttachment[] = []

    attachments.forEach((a) => {
      const type = (a.type || '').toLowerCase()
      const url = a.url || ''
      if (isLikelyImageUrl(url) || type.startsWith('image/')) {
        images.push(a)
      } else if (type.startsWith('video/') || url.match(/\.(mp4|mov|webm|ogg)(\?.*)?$/i)) {
        videos.push(a)
      } else if (type.includes('pdf') || url.toLowerCase().endsWith('.pdf')) {
        pdfs.push(a)
      } else {
        other.push(a)
      }
    })

    return { imageAttachments: images, videoAttachments: videos, pdfAttachments: pdfs, otherAttachments: other }
  }, [attachments])

  const handleDownloadAll = () => {
    attachments.forEach((attachment, index) => {
      if (!attachment.url) return
      const anchor = document.createElement('a')
      anchor.href = attachment.url
      anchor.download = attachment.name || `attachment-${index + 1}`
      anchor.target = '_blank'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{attachments.length} attachment{attachments.length === 1 ? '' : 's'}</span>
        <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={handleDownloadAll}>
          <Download className="h-3.5 w-3.5" />
          Download all
        </Button>
      </div>

      {/* Image Gallery for all images */}
      {imageAttachments.length > 0 && (
        <ImageGallery
          images={imageAttachments.map((a) => ({
            url: a.url,
            name: a.name,
            size: a.size ?? undefined,
          }))}
        />
      )}

      {/* Video previews */}
      {videoAttachments.length > 0 && (
        <div className="space-y-2">
          {videoAttachments.map((attachment) => (
            <Card key={`${attachment.url}-${attachment.name}-video`} className="border-muted/60 bg-muted/10">
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <Video className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate" title={attachment.name}>
                      {hasHighlightTerms(highlightTerms) ? highlightText(attachment.name, highlightTerms) : attachment.name}
                    </span>
                    {attachment.size && <Badge variant="secondary" className="text-[11px]">{attachment.size}</Badge>}
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-8 gap-1">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
                <div className="overflow-hidden rounded-md border border-muted/50">
                  <video src={attachment.url} controls className="h-52 w-full bg-black" preload="metadata">
                    Sorry, your browser does not support embedded videos.
                  </video>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* PDF previews */}
      {pdfAttachments.length > 0 && (
        <div className="space-y-2">
          {pdfAttachments.map((attachment) => (
            <Card key={`${attachment.url}-${attachment.name}-pdf`} className="border-muted/60 bg-muted/10">
              <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate" title={attachment.name}>
                    {hasHighlightTerms(highlightTerms) ? highlightText(attachment.name, highlightTerms) : attachment.name}
                  </span>
                  {attachment.size && <Badge variant="secondary" className="text-[11px]">{attachment.size}</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 gap-1" onClick={() => setActivePdf(attachment)}>
                    <MonitorPlay className="h-4 w-4" />
                    Preview
                  </Button>
                  <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download {attachment.name}</span>
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* File attachments */}
      {otherAttachments.map((attachment) => {
        const key = `${attachment.url}-${attachment.name}`
        return (
          <Card key={key} className="border-muted/60 bg-muted/20">
            <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">
                  {hasHighlightTerms(highlightTerms) ? highlightText(attachment.name, highlightTerms) : attachment.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {attachment.size && <span>{attachment.size}</span>}
                <Button asChild variant="ghost" size="icon" className="h-7 w-7">
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Download {attachment.name}</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      <Dialog open={Boolean(activePdf)} onOpenChange={() => setActivePdf(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{activePdf?.name || 'PDF preview'}</DialogTitle>
            <DialogDescription>
              Preview of the attached PDF document.
            </DialogDescription>
          </DialogHeader>
          {activePdf && (
            <div className="h-[70vh] overflow-hidden rounded-md border">
              <iframe src={activePdf.url} title={activePdf.name} className="h-full w-full" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
