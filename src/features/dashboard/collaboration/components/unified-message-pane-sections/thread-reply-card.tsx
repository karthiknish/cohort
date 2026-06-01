'use client';
import { ClientFormattedDate } from '@/shared/components/client-formatted-date';
import { notifyFailure } from '@/lib/notifications';
import { createElement, useCallback, useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type DragEvent, type ReactNode, type RefObject, } from 'react';
import { Archive, ArchiveRestore, Bell, BellOff, ArrowLeft, Check, CheckCheck, Hash, Info, Link2, Forward, ListTodo, Search, X, LoaderCircle, Mail, MoreVertical, Pencil, Plus, Reply, Send, Share2, Trash2, } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from '@/shared/ui/tooltip';
import { useToast } from '@/shared/ui/use-toast';
import { chromaticTransitionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import type { ClientTeamMember } from '@/types/clients';
import type { PendingAttachment } from '../../hooks/types';
import { CHANNEL_TYPE_COLORS } from '../../utils';
import { MessageAttachments } from '../message-attachments';
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator';
import { PendingAttachmentsList, ReplyIndicator } from '../message-composer';
import { MessageContent } from '../message-content';
import { DeletedMessageInfo, DeletingOverlay, MessageEditForm } from '../message-item-parts';
import { collaborationToUnifiedMessage } from '../message-list-utils';
import { getSharePlatformLabel } from '../unified-message-pane-render-utils';
import type { UnifiedMessage } from '../message-list-types';
import { useMessageListRenderContext } from '../message-list-render-context';
import { MessageReactions } from '../message-reactions';
import { RichComposer } from '../rich-composer';
import { ChannelAvatar } from '../channel-avatar';
import { ChannelInfoDialog } from '../channel-info-dialog';
import { PinMessageButton } from '../pinned-messages';
import type { MessagePaneHeaderInfo } from '../unified-message-pane-types';
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
type UnifiedThreadReplyCardProps = {
    reply: CollaborationMessage;
    currentUserId: string | null;
    editingMessageId: string | null;
    activeDeletingMessageId: string | null;
    messageUpdatingId: string | null;
    reactionPendingEmoji: string | null;
    onToggleReaction: (messageId: string, emoji: string) => void;
    onStartEdit?: (message: UnifiedMessage) => void;
    onRequestDelete?: (messageId: string) => void;
    renderEditForm?: (message: UnifiedMessage) => ReactNode;
    renderDeletedInfo?: (message: UnifiedMessage) => ReactNode;
    renderMessageContent?: (message: UnifiedMessage) => ReactNode;
    renderMessageAttachments?: (message: UnifiedMessage) => ReactNode;
};
export function UnifiedThreadReplyCard({ reply, currentUserId, editingMessageId, activeDeletingMessageId, messageUpdatingId, reactionPendingEmoji, onToggleReaction, onStartEdit, onRequestDelete, renderEditForm, renderDeletedInfo, renderMessageContent, renderMessageAttachments, }: UnifiedThreadReplyCardProps) {
    const renderContext = useMessageListRenderContext();
    const message = collaborationToUnifiedMessage(reply);
    const canManageMessage = Boolean(currentUserId && message.senderId === currentUserId);
    const isEditing = editingMessageId === message.id;
    const isDeleting = activeDeletingMessageId === message.id;
    const isUpdating = messageUpdatingId === message.id;
    const effectiveRenderEditForm = renderEditForm ?? renderContext?.renderEditForm;
    const effectiveRenderDeletedInfo = renderDeletedInfo ?? renderContext?.renderDeletedInfo;
    const effectiveRenderMessageContent = renderMessageContent ?? renderContext?.renderMessageContent;
    const effectiveRenderMessageAttachments = renderMessageAttachments ?? renderContext?.renderMessageAttachments;
    const handleToggleReaction = (emoji: string) => {
        onToggleReaction(message.id, emoji);
    };
    const handleEditReply = () => {
        onStartEdit?.(message);
    };
    const handleDeleteReply = () => {
        onRequestDelete?.(message.id);
    };
    return (<div key={reply.id} className={cn('group relative rounded-md border border-muted/40 bg-muted/15 px-3 py-2', chromaticTransitionClass, !message.deleted && 'hover:border-accent/20 hover:bg-muted/25')}>
      <div className="min-w-0 space-y-2 pr-14">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{reply.senderName}</span>
          {reply.senderRole ? <span>{reply.senderRole}</span> : null}
          {reply.createdAt ? (<ClientFormattedDate value={reply.createdAt} formatStr="h:mm a"/>) : null}
          {message.edited && !message.deleted ? <span>edited</span> : null}
        </div>

        {isEditing ? (effectiveRenderEditForm?.(message) ?? null) : message.deleted ? (effectiveRenderDeletedInfo?.(message) ?? <p className="text-sm italic text-muted-foreground">Message removed</p>) : (<>
            {effectiveRenderMessageContent ? (createElement(effectiveRenderMessageContent as React.ComponentType<{
                message: UnifiedMessage;
            }>, { message })) : (<p className="max-w-full min-w-0 overflow-hidden break-words whitespace-pre-wrap text-sm [overflow-wrap:anywhere]">
                {message.content}
              </p>)}
            {effectiveRenderMessageAttachments?.(message)}
          </>)}

          {!isEditing && !message.deleted ? (<MessageReactions reactions={reply.reactions ?? []} currentUserId={currentUserId} pendingEmoji={reactionPendingEmoji} disabled={isDeleting || isUpdating} onToggle={handleToggleReaction}/>) : null}
        </div>

      {!isEditing && !message.deleted && canManageMessage ? (<div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 transition-opacity duration-[var(--motion-duration-fast)] group-hover:opacity-100 motion-reduce:transition-none">
          {onStartEdit ? (<TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-6 transition-transform hover:scale-105" disabled={isDeleting || isUpdating} onClick={handleEditReply} aria-label="Edit reply">
                    <Pencil className="size-3.5" aria-hidden/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit reply</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>) : null}

          {onRequestDelete ? (<TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-6 text-destructive transition-transform hover:scale-105 hover:text-destructive" disabled={isDeleting || isUpdating} onClick={handleDeleteReply} aria-label="Delete reply">
                    <Trash2 className="size-3.5" aria-hidden/>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete reply</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>) : null}
        </div>) : null}

      <DeletingOverlay isDeleting={isDeleting}/>
    </div>);
}
