'use client'

import { notifyFailure } from '@/lib/notifications'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { useCallback, useRef, useState } from 'react'
import { Camera, LoaderCircle, Trash2 } from 'lucide-react'
import { useMutation } from 'convex/react'

import { collaborationApi, collaborationChannelAvatarsApi } from '@/lib/convex-api'
import { asErrorMessage } from '@/lib/convex-errors'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { ScrollArea } from '@/shared/ui/scroll-area'
import { useToast } from '@/shared/ui/use-toast'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment } from '@/types/collaboration'

import type { Channel } from '../types'
import { ChannelAvatar } from './channel-avatar'
import { CollaborationSidebarContent } from './sidebar-sections'
import { NotificationSettings } from './notification-settings'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export type ChannelInfoDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  channel: Channel
  channelParticipants: ClientTeamMember[]
  sharedFiles: CollaborationAttachment[]
  workspaceId: string
  isAdmin: boolean
  canManageMembers?: boolean
  onManageMembers?: () => void
}

export function ChannelInfoDialog({
  open,
  onOpenChange,
  channel,
  channelParticipants,
  sharedFiles,
  workspaceId,
  isAdmin,
  canManageMembers,
  onManageMembers,
}: ChannelInfoDialogProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [removing, setRemoving] = useState(false)

  const generateUploadUrl = useMutation(collaborationApi.generateUploadUrl)
  const setChannelAvatar = useMutation(collaborationChannelAvatarsApi.setAvatar)

  const displayName = channel.name.startsWith('#') ? channel.name : `#${channel.name}`

  const handlePickPhoto = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file || !isAdmin) return

      if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
        notifyFailure({
        title: 'Unsupported image',
        message: 'Use a JPEG, PNG, or WebP file.',
      })
        return
      }

      if (file.size > MAX_AVATAR_BYTES) {
        notifyFailure({
        title: 'Image too large',
        message: 'Channel photos must be 2 MB or smaller.',
      })
        return
      }

      setUploading(true)
      try {
        const uploadUrlPayload = (await generateUploadUrl({})) as { url?: string }
        const uploadUrl = uploadUrlPayload?.url
        if (!uploadUrl) {
          throw new Error('Unable to create upload URL')
        }

        const uploadResponse = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })

        const uploadResult = (await uploadResponse.json().catch(() => null)) as { storageId?: string } | null
        const storageId = uploadResult?.storageId
        if (!uploadResponse.ok || !storageId) {
          throw new Error('Upload failed')
        }

        await setChannelAvatar({
          workspaceId,
          channelKey: channel.id,
          storageId,
        })

        toast({
          title: 'Channel photo updated',
          description: `${displayName} now has a new photo.`,
        })
      } catch (error) {
        reportConvexFailure({
        error: error,
        context: 'channel-info-dialog.tsx:catch',
        title: 'Could not update photo',
        fallbackMessage: 'Could not update photo',
        })
      } finally {
        setUploading(false)
      }
    },
    [channel.id, displayName, generateUploadUrl, isAdmin, setChannelAvatar, toast, workspaceId],
  )

  const handleRemovePhoto = useCallback(async () => {
    if (!isAdmin || !channel.avatarUrl) return

    setRemoving(true)
    try {
      await setChannelAvatar({
        workspaceId,
        channelKey: channel.id,
        storageId: null,
      })
      toast({
        title: 'Channel photo removed',
        description: `${displayName} is using the default icon again.`,
      })
    } catch (error) {
      reportConvexFailure({
        error: error,
        context: 'channel-info-dialog.tsx:catch',
        title: 'Could not remove photo',
        fallbackMessage: 'Could not remove photo',
        })
    } finally {
      setRemoving(false)
    }
  }, [channel.avatarUrl, channel.id, displayName, isAdmin, setChannelAvatar, toast, workspaceId])

  const handleRemovePhotoClick = useCallback(() => {
    void handleRemovePhoto()
  }, [handleRemovePhoto])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90dvh,40rem)] w-[min(100vw-1.5rem,28rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
        <DialogHeader className="space-y-0 border-b border-muted/40 px-5 pb-4 pt-5 text-left">
          <DialogTitle className="text-base font-semibold tracking-tight">{displayName}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Roster, shared files, and channel settings
          </DialogDescription>

          <div className="flex items-center gap-4 pt-4">
            <div className="relative shrink-0">
              <ChannelAvatar channel={channel} className="h-16 w-16 ring-2 ring-border/60" />
              {isAdmin ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full shadow-md"
                  onClick={handlePickPhoto}
                  disabled={uploading || removing}
                  aria-label="Change channel photo"
                >
                  {uploading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </Button>
              ) : null}
            </div>

            <div className="min-w-0 flex-1 space-y-2">
              {isAdmin ? (
                <p className="text-xs text-muted-foreground">
                  {channel.avatarUrl ? 'Admins can replace or remove this channel photo.' : 'Admins can add a photo for this channel.'}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Channel details and shared workspace files.</p>
              )}
              {isAdmin && channel.avatarUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-destructive hover:text-destructive"
                  onClick={handleRemovePhotoClick}
                  disabled={uploading || removing}
                >
                  {removing ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Remove photo
                </Button>
              ) : null}
            </div>
          </div>

          {isAdmin ? (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleFileChange}
            />
          ) : null}
          <div className="flex justify-end border-t border-border/60 pt-3">
            <NotificationSettings />
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1">
          <CollaborationSidebarContent
            compact
            skipChannelCard
            channel={channel}
            channelParticipants={channelParticipants}
            sharedFiles={sharedFiles}
            canManageMembers={canManageMembers}
            onManageMembers={onManageMembers}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
