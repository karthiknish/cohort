'use client'

import { useCallback, useMemo, useState } from 'react'

import { useToast } from '@/shared/ui/use-toast'
import { TaskCreationModal } from '@/features/dashboard/tasks/task-creation-modal'
import type { CollaborationMessage } from '@/types/collaboration'
import type { TaskRecord } from '@/types/tasks'

import { encodePollMessage } from '../lib/collaboration-poll-message'
import { exportChannelMessages } from '../lib/export-channel-messages'
import type { Channel } from '../types'
import type { MessagePoll } from './message-polls'
import { MessageForwardDialog } from './message-forward-dialog'
import type { UnifiedMessage } from './message-list-types'

type UseCollaborationChannelExtrasOptions = {
  channel: Channel | null
  channelMessages: CollaborationMessage[]
  channels: Channel[]
  currentUserId: string | null
  workspaceId: string | null
  onSendPollMessage?: (content: string) => Promise<void>
}

export function useCollaborationChannelExtras({
  channel,
  channelMessages,
  channels,
  currentUserId,
  workspaceId,
  onSendPollMessage,
}: UseCollaborationChannelExtrasOptions) {
  const { toast } = useToast()
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskSourceMessage, setTaskSourceMessage] = useState<CollaborationMessage | null>(null)
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false)
  const [forwardSourceMessage, setForwardSourceMessage] = useState<CollaborationMessage | null>(null)

  const forwardChannelOptions = useMemo(
    () =>
      channels.map((entry) => ({
        id: entry.id,
        name: entry.name,
        type: entry.type,
      })),
    [channels],
  )

  const handleExportChannel = useCallback(() => {
    if (!channel || channelMessages.length === 0) {
      return
    }

    exportChannelMessages({
      channelName: channel.name,
      messages: channelMessages,
    })
  }, [channel, channelMessages])

  const handleCreateTask = useCallback(
    (message: UnifiedMessage) => {
      const original =
        channelMessages.find((entry) => entry.id === message.id) ??
        ({
          id: message.id,
          channelType: channel?.type ?? 'team',
          clientId: channel?.clientId ?? null,
          projectId: channel?.projectId ?? null,
          content: message.content,
          senderId: message.senderId,
          senderName: message.senderName,
          senderRole: message.senderRole ?? null,
          createdAt: new Date(message.createdAtMs).toISOString(),
          updatedAt: null,
          isEdited: Boolean(message.edited),
          deletedAt: message.deletedAt ?? null,
          deletedBy: message.deletedBy ?? null,
          isDeleted: Boolean(message.deleted),
        } satisfies CollaborationMessage)

      setTaskSourceMessage(original)
      setTaskModalOpen(true)
    },
    [channel, channelMessages],
  )

  const handleForwardMessage = useCallback(
    (message: UnifiedMessage) => {
      const original = channelMessages.find((entry) => entry.id === message.id)
      if (!original) {
        return
      }

      setForwardSourceMessage(original)
      setForwardDialogOpen(true)
    },
    [channelMessages],
  )

  const handleCreatePoll = useCallback(
    async (poll: Omit<MessagePoll, 'id' | 'createdAt'>) => {
      if (!onSendPollMessage) {
        return
      }

      await onSendPollMessage(encodePollMessage(poll))
    },
    [onSendPollMessage],
  )

  const handleTaskCreated = useCallback(
    (task: TaskRecord) => {
      toast({
        title: 'Task created',
        description: task.title
          ? `"${task.title}" was added from this message.`
          : 'The task was added from this message.',
      })
      setTaskModalOpen(false)
      setTaskSourceMessage(null)
    },
    [toast],
  )

  const handleTaskModalClose = useCallback(() => {
    setTaskModalOpen(false)
    setTaskSourceMessage(null)
  }, [])

  const handleForwardComplete = useCallback(() => {
    setForwardDialogOpen(false)
    setForwardSourceMessage(null)
  }, [])

  const taskCreationInitialData = useMemo(
    () => ({
      title: taskSourceMessage ? `Task from: ${taskSourceMessage.content?.slice(0, 50)}...` : '',
      description: taskSourceMessage?.content || '',
      projectId: channel?.projectId || channel?.id || '',
      projectName: channel?.name || '',
    }),
    [channel?.id, channel?.name, channel?.projectId, taskSourceMessage],
  )

  const taskModal = (
    <TaskCreationModal
      isOpen={taskModalOpen}
      onClose={handleTaskModalClose}
      onTaskCreated={handleTaskCreated}
      initialData={taskCreationInitialData}
    />
  )

  const forwardDialog = (
    <MessageForwardDialog
      open={forwardDialogOpen}
      onOpenChange={setForwardDialogOpen}
      message={forwardSourceMessage}
      channels={forwardChannelOptions}
      workspaceId={workspaceId}
      userId={currentUserId}
      onForward={handleForwardComplete}
    />
  )

  return {
    handleCreateTask,
    handleExportChannel,
    handleForwardMessage,
    handleCreatePoll,
    taskModal,
    forwardDialog,
  }
}
