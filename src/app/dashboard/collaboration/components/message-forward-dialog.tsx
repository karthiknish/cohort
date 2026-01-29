'use client'

import { useState, useCallback } from 'react'
import { Forward, LoaderCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { useMutation } from 'convex/react'
import { collaborationApi } from '@/lib/convex-api'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import type { CollaborationMessage, CollaborationChannelType } from '@/types/collaboration'
import { cn } from '@/lib/utils'

interface ChannelOption {
  id: string
  name: string
  type: CollaborationChannelType
}

interface MessageForwardDialogProps {
  message: CollaborationMessage | null
  channels: ChannelOption[]
  workspaceId: string | null
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onForward?: () => void
}

/**
 * Dialog for forwarding a message to another channel
 */
export function MessageForwardDialog({
  message,
  channels,
  workspaceId,
  userId,
  open,
  onOpenChange,
  onForward,
}: MessageForwardDialogProps) {
  const { toast } = useToast()
  const createMessage = useMutation((collaborationApi as any).create)

  const [selectedChannelId, setSelectedChannelId] = useState<string>('')
  const [forwardMessage, setForwardMessage] = useState('')
  const [includeAttachments, setIncludeAttachments] = useState(true)
  const [isForwarding, setIsForwarding] = useState(false)

  const selectedChannel = channels.find((c) => c.id === selectedChannelId)

  const handleForward = useCallback(async () => {
    if (!message || !workspaceId || !userId || !selectedChannel) {
      toast({
        title: 'Cannot forward message',
        description: 'Please select a channel to forward to.',
        variant: 'destructive',
      })
      return
    }

    setIsForwarding(true)

    try {
      // Generate a unique ID for the forwarded message
      const newMessageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

      // Prepare the forwarded content
      const forwardedContent = forwardMessage.trim()
        ? `${forwardMessage.trim()}\n\n---\n\n*Forwarded message from ${message.senderName}:*\n\n${message.content}`
        : `*Forwarded message from ${message.senderName}:*\n\n${message.content}`

      // Prepare attachments if included
      const attachments = includeAttachments && message.attachments ? message.attachments : undefined

      // Create the forwarded message
      await createMessage({
        workspaceId: String(workspaceId),
        legacyId: newMessageId,
        channelType: selectedChannel.type,
        clientId: selectedChannel.type === 'client' ? selectedChannel.id : null,
        projectId: selectedChannel.type === 'project' ? selectedChannel.id : null,
        senderId: String(userId),
        senderName: 'You', // Would be populated from user context
        senderRole: null,
        content: forwardedContent,
        format: 'markdown',
        attachments,
        mentions: [],
        isThreadRoot: true,
      })

      toast({
        title: 'Message forwarded',
        description: `Message has been forwarded to ${selectedChannel.name}.`,
      })

      onForward?.()
      onOpenChange(false)

      // Reset form
      setSelectedChannelId('')
      setForwardMessage('')
      setIncludeAttachments(true)
    } catch (error) {
      logError(error, 'MessageForwardDialog:handleForward')
      toast({
        title: 'Failed to forward message',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    } finally {
      setIsForwarding(false)
    }
  }, [
    message,
    workspaceId,
    userId,
    selectedChannel,
    forwardMessage,
    includeAttachments,
    createMessage,
    toast,
    onForward,
    onOpenChange,
  ])

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Reset form when closing
        setSelectedChannelId('')
        setForwardMessage('')
        setIncludeAttachments(true)
      }
      onOpenChange(newOpen)
    },
    [onOpenChange]
  )

  if (!message) return null

  // Filter out current channel from options
  const availableChannels = channels.filter(
    (c) => c.id !== `${message.channelType}-${message.clientId || message.projectId || 'general'}`
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="h-5 w-5" />
            Forward Message
          </DialogTitle>
          <DialogDescription>
            Send this message to another channel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Original message preview */}
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Original message:</p>
            <p className="text-sm line-clamp-3">{message.content}</p>
            {message.attachments && message.attachments.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                📎 {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Channel selection */}
          <div className="space-y-2">
            <Label htmlFor="channel">Forward to</Label>
            <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
              <SelectTrigger id="channel">
                <SelectValue placeholder="Select a channel" />
              </SelectTrigger>
              <SelectContent>
                {availableChannels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase text-muted-foreground">
                        {channel.type}
                      </span>
                      <span>{channel.name}</span>
                    </div>
                  </SelectItem>
                ))}
                {availableChannels.length === 0 && (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No other channels available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Optional message */}
          <div className="space-y-2">
            <Label htmlFor="message">Add a message (optional)</Label>
            <Textarea
              id="message"
              placeholder="Add context or comments before the forwarded message..."
              value={forwardMessage}
              onChange={(e) => setForwardMessage(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {forwardMessage.length}/500
            </p>
          </div>

          {/* Include attachments checkbox */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attachments"
                checked={includeAttachments}
                onCheckedChange={(checked) => setIncludeAttachments(checked as boolean)}
              />
              <Label
                htmlFor="attachments"
                className="text-sm font-normal cursor-pointer"
              >
                Include attachments ({message.attachments.length})
              </Label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isForwarding}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleForward}
            disabled={!selectedChannelId || isForwarding}
          >
            {isForwarding ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Forwarding...
              </>
            ) : (
              <>
                <Forward className="mr-2 h-4 w-4" />
                Forward
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Forward button for message actions
 */
export function ForwardMessageButton({
  onClick,
  disabled,
  className,
}: {
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-7 w-7', className)}
      onClick={onClick}
      disabled={disabled}
    >
      <Forward className="h-4 w-4" />
      <span className="sr-only">Forward message</span>
    </Button>
  )
}
