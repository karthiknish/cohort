'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, FileText } from 'lucide-react'
import type { CollaborationAttachment } from '@/types/collaboration'
import { isLikelyImageUrl } from '../utils'
import { ImageGallery } from './image-gallery'

export interface MessageAttachmentsProps {
  attachments: CollaborationAttachment[]
}

export function MessageAttachments({ attachments }: MessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null

  const imageAttachments = attachments.filter((a) => a.url && isLikelyImageUrl(a.url))
  const fileAttachments = attachments.filter((a) => !a.url || !isLikelyImageUrl(a.url))

  return (
    <div className="space-y-3">
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

      {/* File attachments */}
      {fileAttachments.map((attachment) => {
        const key = `${attachment.url}-${attachment.name}`
        return (
          <Card key={key} className="border-muted/60 bg-muted/20">
            <CardContent className="flex items-center justify-between gap-3 p-3 text-sm">
              <div className="flex items-center gap-2 truncate">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{attachment.name}</span>
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
    </div>
  )
}
