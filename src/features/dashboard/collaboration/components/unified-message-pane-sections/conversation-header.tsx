'use client';
import { ClientFormattedDate } from '@/shared/components/client-formatted-date';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
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
type UnifiedConversationHeaderProps = {
    header: MessagePaneHeaderInfo;
    canSearchMessages?: boolean;
    messageSearchOpen?: boolean;
    onToggleMessageSearch?: () => void;
};
export function UnifiedConversationHeader({ header, canSearchMessages = false, messageSearchOpen = false, onToggleMessageSearch, }: UnifiedConversationHeaderProps) {
    const [linkCopied, setLinkCopied] = useState(false);
    const [channelInfoOpen, setChannelInfoOpen] = useState(false);
    const copyResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleOpenChannelInfo = () => {
        setChannelInfoOpen(true);
    };
    const handleArchiveToggle = () => {
        header.onArchive?.(!header.isArchived);
    };
    const handleMuteToggle = () => {
        header.onMute?.(!header.isMuted);
    };
    const handleCopyShareLink = () => {
        if (!header.buildShareableUrl)
            return;
        const url = header.buildShareableUrl();
        void navigator.clipboard.writeText(url).then(() => {
            if (copyResetTimerRef.current) {
                clearTimeout(copyResetTimerRef.current);
            }
            setLinkCopied(true);
            notifySuccess({
                title: 'Link copied',
                message: header.type === 'channel' ? 'Recipients can open this channel from the link.' : 'Page link copied to clipboard.',
            });
            copyResetTimerRef.current = setTimeout(() => {
                setLinkCopied(false);
                copyResetTimerRef.current = null;
            }, 2000);
        }, () => {
            notifyFailure({
                title: 'Could not copy',
                message: 'Allow clipboard access or copy the URL from the address bar.',
            });
        });
    };
    const handleMarkChannelReadClick = () => {
        void header.onMarkChannelRead?.();
    };
    useEffect(() => {
        const resetTimerRef = copyResetTimerRef;
        return () => {
            if (resetTimerRef.current) {
                clearTimeout(resetTimerRef.current);
            }
        };
    }, []);
    const subtitleParts: string[] = [];
    if (header.type === 'channel' && header.participantCount !== undefined) {
        subtitleParts.push(`${header.participantCount} member${header.participantCount === 1 ? '' : 's'}`);
    }
    if (header.type === 'channel' && header.messageCount !== undefined) {
        subtitleParts.push(`${header.messageCount} message${header.messageCount === 1 ? '' : 's'}`);
    }
    return (<div className="shrink-0 border-b border-muted/40 bg-background/80 p-3 shadow-sm backdrop-blur-md supports-backdrop-filter:bg-background/70 sm:p-4">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
          {header.onBack ? (<Button type="button" variant="ghost" size="icon" className="mt-0.5 size-9 shrink-0 lg:hidden" onClick={header.onBack} aria-label="Back to inbox">
              <ArrowLeft className="size-4"/>
            </Button>) : null}
          {header.type === 'channel' && header.channelInfo ? (<ChannelAvatar channel={header.channelInfo.channel} className="mt-0.5 size-9 ring-1 ring-border/60"/>) : (<Avatar className="mt-0.5 ring-1 ring-border/60">
              <AvatarFallback className={cn(header.type === 'channel' ? 'bg-muted' : 'bg-accent/10 text-primary')}>
                {header.type === 'channel' ? <Hash className="size-4"/> : getInitials(header.name)}
              </AvatarFallback>
            </Avatar>)}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold tracking-tight text-foreground">
                {header.type === 'channel'
            ? header.name.startsWith('#')
                ? header.name
                : `#${header.name}`
            : header.name}
              </h3>
              {header.type === 'channel' && header.channelKind ? (<Badge variant="outline" className={cn('h-5 shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide', CHANNEL_TYPE_COLORS[header.channelKind])}>
                  {header.channelKind}
                </Badge>) : null}
              {header.type === 'dm' && header.role ? (<Badge variant="outline" className="h-5 shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide">
                  {header.role}
                </Badge>) : null}
            </div>
            {subtitleParts.length > 0 ? (<p className="text-xs text-muted-foreground">{subtitleParts.join(' · ')}</p>) : header.type === 'dm' ? (<p className="text-xs text-muted-foreground">Direct message</p>) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1">
          {canSearchMessages && onToggleMessageSearch ? (<Button type="button" variant={messageSearchOpen ? 'secondary' : 'outline'} size="icon" className="size-8" onClick={onToggleMessageSearch} aria-label={messageSearchOpen ? 'Hide message search' : 'Search messages'} aria-pressed={messageSearchOpen}>
              {messageSearchOpen ? <X className="size-3.5"/> : <Search className="size-3.5"/>}
            </Button>) : null}
          {header.channelInfo ? (<>
              <Button type="button" variant="outline" size="icon" className="size-8" aria-label="Channel details" onClick={handleOpenChannelInfo}>
                <Info className="size-3.5"/>
              </Button>
              <ChannelInfoDialog open={channelInfoOpen} onOpenChange={setChannelInfoOpen} channel={header.channelInfo.channel} channelMessages={header.channelInfo.channelMessages} channelParticipants={header.channelInfo.channelParticipants} currentUserId={header.channelInfo.currentUserId} onPinnedMessageClick={header.channelInfo.onPinnedMessageClick} sharedFiles={header.channelInfo.sharedFiles} workspaceId={header.channelInfo.workspaceId} isAdmin={header.channelInfo.isAdmin} canManageMembers={header.channelInfo.canManageMembers} onManageMembers={header.channelInfo.onManageMembers}/>
            </>) : null}
          {header.buildShareableUrl ? (<TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" onClick={handleCopyShareLink} aria-label="Copy conversation link">
                    {linkCopied ? <Check className="size-3.5"/> : <Link2 className="size-3.5"/>}
                    <span className="hidden sm:inline">{linkCopied ? 'Copied' : 'Copy link'}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Copy a link to this {header.type === 'channel' ? 'channel' : 'page'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>) : null}
          {header.type === 'channel' &&
            header.onMarkChannelRead &&
            typeof header.channelUnreadCount === 'number' &&
            header.channelUnreadCount > 0 ? (<TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="h-8 gap-1.5" disabled={header.markChannelReadPending} onClick={handleMarkChannelReadClick} aria-label="Mark channel as read">
                    {header.markChannelReadPending ? (<LoaderCircle className="size-3.5 animate-spin"/>) : (<CheckCheck className="size-3.5"/>)}
                    <span className="hidden sm:inline">Mark read</span>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] tabular-nums">
                      {header.channelUnreadCount}
                    </Badge>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p>Clear your unread count for this channel.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>) : null}
          {header.primaryActionLabel && header.onPrimaryAction ? (<Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={header.onPrimaryAction} aria-label={header.primaryActionLabel}>
              <Plus className="size-3.5"/>
              <span className="hidden sm:inline">{header.primaryActionLabel}</span>
            </Button>) : null}
          {header.isArchived ? (<Badge variant="secondary" className="text-xs">
              <Archive className="mr-1 size-3"/>
              Archived
            </Badge>) : null}
          {header.isMuted ? (<Badge variant="secondary" className="text-xs">
              <BellOff className="mr-1 size-3"/>
              Muted
            </Badge>) : null}

          {header.onArchive || header.onMute || header.onExport ? (<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8" aria-label="Conversation actions">
                  <MoreVertical className="size-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {header.onArchive ? (<DropdownMenuItem onClick={handleArchiveToggle}>
                    {header.isArchived ? (<>
                        <ArchiveRestore className="mr-2 size-4"/>
                        Unarchive
                      </>) : (<>
                        <Archive className="mr-2 size-4"/>
                        Archive
                      </>)}
                  </DropdownMenuItem>) : null}
                {header.onMute ? (<DropdownMenuItem onClick={handleMuteToggle}>
                    {header.isMuted ? (<>
                        <Bell className="mr-2 size-4"/>
                        Unmute
                      </>) : (<>
                        <BellOff className="mr-2 size-4"/>
                        Mute
                      </>)}
                  </DropdownMenuItem>) : null}
                {header.onExport ? (<DropdownMenuItem onClick={header.onExport}>
                    <Share2 className="mr-2 size-4"/>
                    Export messages
                  </DropdownMenuItem>) : null}
              </DropdownMenuContent>
            </DropdownMenu>) : null}
        </div>
      </div>
    </div>);
}
