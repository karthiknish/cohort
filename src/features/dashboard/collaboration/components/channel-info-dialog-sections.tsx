'use client';
import { useState } from 'react';
import { Link } from '@/shared/ui/link';
import { Bell, Camera, FileStack, Hash, Info, LoaderCircle, Lock, Settings2, Trash2, Users, Pin } from 'lucide-react';
import { ChatMediaGallery } from '@/shared/ui/chat-media-gallery';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { MotionTabsContent } from '@/shared/ui/motion-tabs-content';
import { MotionList, MotionListItem } from '@/shared/ui/motion-primitives';
import { cn } from '@/lib/utils';
import type { ClientTeamMember } from '@/types/clients';
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration';
import type { Channel } from '../types';
import { PinnedMessages } from './pinned-messages';
import { getInitials } from '../utils';
import { ChannelAvatar } from './channel-avatar';
import { CHANNEL_INFO_THEME } from './channel-info-theme';

export function ChannelInfoHero({
    channel,
    displayName,
    memberCount,
    isAdmin,
    uploading,
    removing,
    onPickPhoto,
    onRemovePhoto,
}: {
    channel: Channel;
    displayName: string;
    memberCount: number;
    isAdmin: boolean;
    uploading: boolean;
    removing: boolean;
    onPickPhoto: () => void;
    onRemovePhoto: () => void;
}) {
    const plainName = channel.name.replace(/^#/, '');
    return (
        <div className={CHANNEL_INFO_THEME.hero}>
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative shrink-0">
                    <ChannelAvatar
                        channel={channel}
                        className="size-20 ring-1 ring-border/60 shadow-sm"
                        fallbackClassName="bg-primary/10 text-primary"
                    />
                    {isAdmin ? (
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="absolute -bottom-0.5 -right-0.5 size-9 rounded-full border border-border/60 shadow-sm"
                            onClick={onPickPhoto}
                            disabled={uploading || removing}
                            aria-label="Change channel photo"
                        >
                            {uploading ? (
                                <LoaderCircle className="size-4 animate-spin" aria-hidden />
                            ) : (
                                <Camera className="size-4" aria-hidden />
                            )}
                        </Button>
                    ) : null}
                </div>

                <div className="min-w-0 flex-1 space-y-3">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground/70">
                            Channel
                        </p>
                        <h2 className={cn(CHANNEL_INFO_THEME.heroTitle, 'mt-1 truncate')}>{plainName}</h2>
                        <p className={cn(CHANNEL_INFO_THEME.heroSubtitle, 'mt-1 truncate')}>{displayName}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className={CHANNEL_INFO_THEME.statChip}>
                            <Users className="size-3.5 text-muted-foreground/60" aria-hidden />
                            {memberCount} {memberCount === 1 ? 'member' : 'members'}
                        </span>
                        {channel.isCustom ? (
                            <span className={CHANNEL_INFO_THEME.statChip}>
                                {channel.visibility === 'private' ? (
                                    <Lock className="size-3.5 text-muted-foreground/60" aria-hidden />
                                ) : (
                                    <Users className="size-3.5 text-muted-foreground/60" aria-hidden />
                                )}
                                {channel.visibility === 'private' ? 'Private' : 'Public'}
                            </span>
                        ) : (
                            <span className={CHANNEL_INFO_THEME.statChip}>
                                <Hash className="size-3.5 text-muted-foreground/60" aria-hidden />
                                {channel.type} channel
                            </span>
                        )}
                    </div>

                    {isAdmin ? (
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                                {channel.avatarUrl
                                    ? 'Replace or remove this channel photo.'
                                    : 'Add a photo so teammates recognize this channel.'}
                            </p>
                            {channel.avatarUrl ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 gap-1.5 px-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={onRemovePhoto}
                                    disabled={uploading || removing}
                                >
                                    {removing ? (
                                        <LoaderCircle className="size-3.5 animate-spin" aria-hidden />
                                    ) : (
                                        <Trash2 className="size-3.5" aria-hidden />
                                    )}
                                    Remove photo
                                </Button>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export function ChannelInfoMembersPanel({
    channelParticipants,
    canManageMembers,
    onManageMembers,
}: {
    channelParticipants: ClientTeamMember[];
    canManageMembers?: boolean;
    onManageMembers?: () => void;
}) {
    return (
        <div className="space-y-4 px-1">
            {canManageMembers && onManageMembers ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 rounded-lg"
                    onClick={onManageMembers}
                >
                    <Settings2 className="size-4" aria-hidden />
                    Manage members
                </Button>
            ) : null}

            {channelParticipants.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No members yet"
                    description="Invite teammates to this channel to collaborate here."
                    variant="inline"
                    className="border-0 bg-transparent p-0 py-8"
                />
            ) : (
                <MotionList className="space-y-0.5" aria-label="Channel members">
                    {channelParticipants.map((participant) => (
                        <MotionListItem key={participant.name} className={CHANNEL_INFO_THEME.memberRow}>
                            <Avatar className="size-10 shrink-0 ring-1 ring-border/50">
                                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                                    {getInitials(participant.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-foreground">{participant.name}</p>
                                <p className="truncate text-xs text-muted-foreground">{participant.role || 'Teammate'}</p>
                            </div>
                        </MotionListItem>
                    ))}
                </MotionList>
            )}
        </div>
    );
}

export function ChannelInfoFilesPanel({ sharedFiles }: { sharedFiles: CollaborationAttachment[] }) {
    if (sharedFiles.length === 0) {
        return (
            <EmptyState
                icon={FileStack}
                title="No shared files yet"
                description="Images, PDFs, and documents posted in this channel appear here."
                variant="inline"
                className="border-0 bg-transparent p-0 py-10"
            />
        );
    }
    return (
        <ChatMediaGallery
            attachments={sharedFiles.map((file) => ({
                name: file.name,
                url: file.url,
                type: file.type,
                size: file.size,
            }))}
            flat
        />
    );
}

export function ChannelInfoAboutPanel({ channel }: { channel: Channel }) {
    return (
        <div className="space-y-5 px-1">
            <div className="border-t border-border/30 pt-5 first:border-t-0 first:pt-0">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                        <Info className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                        <p className={CHANNEL_INFO_THEME.sectionEyebrow}>About</p>
                        {channel.description ? (
                            <p className="text-sm leading-relaxed text-foreground">{channel.description}</p>
                        ) : (
                            <p className="text-sm italic text-muted-foreground">No description for this channel.</p>
                        )}
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide">
                                {channel.isCustom ? 'Custom channel' : `${channel.type} channel`}
                            </Badge>
                            {channel.isCustom && channel.visibility ? (
                                <Badge
                                    variant="outline"
                                    className="gap-1 text-[10px] font-semibold uppercase tracking-wide"
                                >
                                    {channel.visibility === 'private' ? (
                                        <Lock className="size-3" aria-hidden />
                                    ) : (
                                        <Users className="size-3" aria-hidden />
                                    )}
                                    {channel.visibility}
                                </Badge>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border/30 pt-5">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-primary">
                        <Bell className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className={CHANNEL_INFO_THEME.sectionEyebrow}>Notifications</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Control collaboration alerts alongside tasks, ads, and meetings in workspace settings.
                        </p>
                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                            <Button asChild size="sm" className="rounded-lg">
                                <Link href="/settings?tab=notifications">Notification settings</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="rounded-lg">
                                <Link href="/dashboard/notifications">Notification center</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ChannelInfoTabs({
    channel,
    channelMessages,
    channelParticipants,
    currentUserId,
    onPinnedMessageClick,
    sharedFiles,
    workspaceId,
    canManageMembers,
    onManageMembers,
}: {
    channel: Channel;
    channelMessages: CollaborationMessage[];
    channelParticipants: ClientTeamMember[];
    currentUserId: string | null;
    onPinnedMessageClick?: (messageId: string) => void;
    sharedFiles: CollaborationAttachment[];
    workspaceId: string;
    canManageMembers?: boolean;
    onManageMembers?: () => void;
}) {
    const [activeTab, setActiveTab] = useState('members');
    const fileCount = sharedFiles.length;
    const memberCount = channelParticipants.length;
    const pinnedCount = channelMessages.filter((message) => message.isPinned && !message.isDeleted).length;

    return (
        <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as string)}
            className="flex min-h-0 flex-1 flex-col"
        >
            <div className="px-4 pt-4">
                <TabsList className={CHANNEL_INFO_THEME.tabList} aria-label="Channel info sections">
                    <TabsTrigger value="members" className={CHANNEL_INFO_THEME.tabTrigger} aria-label="Members">
                        <Users className="size-3.5 sm:size-4" aria-hidden />
                        <span>Members</span>
                        <span className="text-[10px] opacity-70">({memberCount})</span>
                    </TabsTrigger>
                    <TabsTrigger value="pinned" className={CHANNEL_INFO_THEME.tabTrigger} aria-label="Pinned">
                        <Pin className="size-3.5 sm:size-4" aria-hidden />
                        <span>Pinned</span>
                        <span className="text-[10px] opacity-70">({pinnedCount})</span>
                    </TabsTrigger>
                    <TabsTrigger value="files" className={CHANNEL_INFO_THEME.tabTrigger} aria-label="Files">
                        <FileStack className="size-3.5 sm:size-4" aria-hidden />
                        <span>Files</span>
                        <span className="text-[10px] opacity-70">({fileCount})</span>
                    </TabsTrigger>
                    <TabsTrigger value="about" className={CHANNEL_INFO_THEME.tabTrigger} aria-label="About">
                        <Info className="size-3.5 sm:size-4" aria-hidden />
                        <span>About</span>
                    </TabsTrigger>
                </TabsList>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
                <MotionTabsContent
                    activeTab={activeTab}
                    tabValue="members"
                    className="mt-0 focus-visible:outline-none"
                >
                    <ChannelInfoMembersPanel
                        channelParticipants={channelParticipants}
                        canManageMembers={canManageMembers}
                        onManageMembers={onManageMembers}
                    />
                </MotionTabsContent>
                <MotionTabsContent
                    activeTab={activeTab}
                    tabValue="pinned"
                    className="mt-0 focus-visible:outline-none"
                >
                    <PinnedMessages
                        messages={channelMessages}
                        workspaceId={workspaceId}
                        userId={currentUserId}
                        onMessageClick={onPinnedMessageClick}
                        showEmptyState
                        variant="flat"
                    />
                </MotionTabsContent>
                <MotionTabsContent
                    activeTab={activeTab}
                    tabValue="files"
                    className="mt-0 focus-visible:outline-none"
                >
                    <ChannelInfoFilesPanel sharedFiles={sharedFiles} />
                </MotionTabsContent>
                <MotionTabsContent
                    activeTab={activeTab}
                    tabValue="about"
                    className="mt-0 focus-visible:outline-none"
                >
                    <ChannelInfoAboutPanel channel={channel} />
                </MotionTabsContent>
            </div>
        </Tabs>
    );
}
