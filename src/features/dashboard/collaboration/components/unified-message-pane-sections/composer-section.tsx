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
type UnifiedComposerSectionProps = {
    pendingAttachments: PendingAttachment[];
    uploadingAttachments: boolean;
    isSending: boolean;
    onRemoveAttachment?: (attachmentId: string) => void;
    isComposerFocused: boolean;
    hasPendingAttachments: boolean;
    messageInput: string;
    onMessageInputChange: (value: string) => void;
    onSend: () => void;
    replyingToMessage?: CollaborationMessage | null;
    onCancelReply?: () => void;
    placeholder: string;
    participants: ClientTeamMember[];
    onFocus: () => void;
    onBlur: () => void;
    onDrop: (event: DragEvent<HTMLTextAreaElement>) => void;
    onDragOver: (event: DragEvent<HTMLTextAreaElement>) => void;
    onPaste: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
    onAttachClick?: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onAttachmentInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
    typingIndicator?: string;
    composerToolbar?: ReactNode;
};
export function UnifiedComposerSection({ pendingAttachments, uploadingAttachments, isSending, onRemoveAttachment, isComposerFocused, hasPendingAttachments, messageInput, onMessageInputChange, onSend, replyingToMessage, onCancelReply, placeholder, participants, onFocus, onBlur, onDrop, onDragOver, onPaste, onAttachClick, fileInputRef, onAttachmentInputChange, typingIndicator, composerToolbar, }: UnifiedComposerSectionProps) {
    const handleRemoveAttachment = (attachmentId: string) => {
        onRemoveAttachment?.(attachmentId);
    };
    const handleSend = () => {
        onSend();
    };
    return (<div className="shrink-0 border-t border-muted/40 bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:p-4">
      <PendingAttachmentsList attachments={pendingAttachments} uploading={uploadingAttachments} disabled={isSending} onRemove={handleRemoveAttachment}/>
      <div className={cn('w-full rounded-lg border border-muted/40 bg-background shadow-sm focus-within:border-accent/40 focus-within:ring-1 focus-within:ring-primary/20', chromaticTransitionClass, (isComposerFocused || hasPendingAttachments) && 'border-accent/30 shadow-md shadow-primary/5')}>
        {replyingToMessage && onCancelReply ? (<ReplyIndicator message={replyingToMessage} onCancel={onCancelReply}/>) : null}
        <RichComposer value={messageInput} onChange={onMessageInputChange} onSend={onSend} disabled={isSending || uploadingAttachments} placeholder={placeholder} participants={participants} onFocus={onFocus} onBlur={onBlur} onDrop={onDrop} onDragOver={onDragOver} onPaste={onPaste} onAttachClick={onAttachClick} hasAttachments={hasPendingAttachments}/>
      </div>
      <input ref={fileInputRef} type="file" multiple aria-label="Attach files to message" className="hidden" onChange={onAttachmentInputChange}/>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {composerToolbar}
          {typingIndicator ? (<ChatTypingIndicator label={typingIndicator} variant="composer"/>) : (<span className="min-h-[1rem] text-[11px] leading-snug text-muted-foreground/90">
              Enter to send · Shift+Enter for a new line
            </span>)}
        </div>
        <Button onClick={handleSend} disabled={(!messageInput.trim() && !hasPendingAttachments) || isSending || uploadingAttachments} size="sm" className={cn(chromaticTransitionClass, 'hover:-translate-y-0.5 active:translate-y-0')}>
          {isSending || uploadingAttachments ? (<LoaderCircle className="size-4 animate-spin"/>) : (<Send className="size-4"/>)}
          <span className="ml-2">{uploadingAttachments ? 'Uploading…' : isSending ? 'Sending…' : 'Send'}</span>
        </Button>
      </div>
    </div>);
}
