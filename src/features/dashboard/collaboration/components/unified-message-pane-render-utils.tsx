'use client'

import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import { MessageAttachments } from './message-attachments'
import { MessageContent } from './message-content'
import { DeletedMessageInfo, MessageEditForm } from './message-item-parts'
import type { UnifiedMessage } from './message-list-types'

export function getSharePlatformLabel(platform: 'email'): string {
  if (platform === 'email') return 'Email'
  return platform
}

export function renderMessageAttachmentsContent(message: UnifiedMessage) {
  if (!message.attachments || message.attachments.length === 0) return null

  const attachments: CollaborationAttachment[] = message.attachments.map((attachment) => ({
    name: attachment.name ?? 'File',
    url: attachment.url,
    type: attachment.mimeType ?? null,
    size: attachment.size ? String(attachment.size) : null,
  }))

  return <MessageAttachments attachments={attachments} />
}

export function renderMessageContentBlock(
  message: UnifiedMessage,
  originalMessage: CollaborationMessage | undefined,
  highlightTerms?: string[],
) {
  return (
    <MessageContent
      content={originalMessage?.content ?? message.content ?? ''}
      mentions={originalMessage?.mentions ?? message.mentions}
      highlightTerms={highlightTerms}
    />
  )
}

export function renderDeletedMessageInfo(
  message: UnifiedMessage,
  deletedInfoByMessage?: Record<string, { deletedBy: string | null; deletedAt: string | null }>,
) {
  const info = deletedInfoByMessage?.[message.id] ?? {
    deletedBy: message.deletedBy ?? null,
    deletedAt: message.deletedAt ?? null,
  }

  if (!info.deletedBy && !info.deletedAt) {
    return <p className="text-sm italic text-muted-foreground">Message removed</p>
  }

  return <DeletedMessageInfo deletedBy={info.deletedBy} deletedAt={info.deletedAt} />
}

export function renderMessageEditForm(
  message: UnifiedMessage,
  editingMessageId: string | null,
  editingValue: string,
  onChange: (value: string) => void,
  onConfirm: () => void,
  onCancel: () => void,
  isUpdating: boolean,
  editingPreview: string,
) {
  if (editingMessageId !== message.id) {
    return null
  }

  return (
    <MessageEditForm
      value={editingValue}
      onChange={onChange}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isUpdating={isUpdating}
      editingPreview={editingPreview}
    />
  )
}
