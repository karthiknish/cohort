'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'

import type { Creative } from './types'
import { getTypeIcon, isDirectVideoUrl } from './helpers'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export function CreativeFullPreviewDialog(props: {
  open: boolean
  onOpenChange: (open: boolean) => void
  creative: Creative
  displayName: string
}) {
  const { open, onOpenChange, creative, displayName } = props
  const [imageLoadFailed, setImageLoadFailed] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(creative.type)}
            {displayName}
          </DialogTitle>
          <DialogDescription>Full preview of your creative</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {creative.videoUrl && isDirectVideoUrl(creative.videoUrl) ? (
            <video
              src={creative.videoUrl}
              controls
              className="w-full rounded-lg"
              poster={creative.imageUrl || creative.thumbnailUrl}
            />
          ) : creative.imageUrl && !imageLoadFailed ? (
            <img
              src={creative.imageUrl}
              alt={displayName}
              className="w-full rounded-lg object-contain max-h-[60vh]"
              loading="lazy"
              decoding="async"
              onError={() => setImageLoadFailed(true)}
            />
          ) : creative.videoUrl ? (
            <div className="rounded-lg border p-6">
              <p className="text-sm text-muted-foreground">This video can’t be embedded here. Open it directly:</p>
              <a
                className="mt-2 block text-sm text-primary break-all"
                href={creative.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {creative.videoUrl}
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <FileText className="h-16 w-16 mb-2" />
              <p className="text-sm">No preview available</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
