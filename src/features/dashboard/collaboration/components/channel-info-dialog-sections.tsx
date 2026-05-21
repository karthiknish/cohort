'use client'

import Link from 'next/link'
import {
  Bell,
  Camera,
  FileStack,
  Hash,
  Info,
  LoaderCircle,
  Lock,
  Settings2,
  Trash2,
  Users,
} from 'lucide-react'

import { ChatMediaGallery } from '@/shared/ui/chat-media-gallery'
import { Avatar, AvatarFallback } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { EmptyState } from '@/shared/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { cn } from '@/lib/utils'
import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment } from '@/types/collaboration'

import type { Channel } from '../types'
import { getInitials } from '../utils'
import { ChannelAvatar } from './channel-avatar'
import { CHANNEL_INFO_THEME } from './channel-info-theme'

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
  channel: Channel
  displayName: string
  memberCount: number
  isAdmin: boolean
  uploading: boolean
  removing: boolean
  onPickPhoto: () => void
  onRemovePhoto: () => void
}) {
  const plainName = channel.name.replace(/^#/, '')

  return (
    <div className={CHANNEL_INFO_THEME.hero}>
      <div className={CHANNEL_INFO_THEME.heroGlow} aria-hidden />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative shrink-0">
          <ChannelAvatar
            channel={channel}
            className="h-20 w-20 ring-2 ring-background/80 shadow-md"
            fallbackClassName="bg-primary/10 text-primary"
          />
          {isAdmin ? (
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute -bottom-0.5 -right-0.5 h-9 w-9 rounded-full border border-border/60 shadow-md"
              onClick={onPickPhoto}
              disabled={uploading || removing}
              aria-label="Change channel photo"
            >
              {uploading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Camera className="h-4 w-4" aria-hidden />
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

          <div className="flex flex-wrap gap-2">
            <span className={CHANNEL_INFO_THEME.statChip}>
              <Users className="h-3 w-3 text-primary/80" aria-hidden />
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
            {channel.isCustom ? (
              <span className={CHANNEL_INFO_THEME.statChip}>
                {channel.visibility === 'private' ? (
                  <Lock className="h-3 w-3" aria-hidden />
                ) : (
                  <Users className="h-3 w-3" aria-hidden />
                )}
                {channel.visibility === 'private' ? 'Private' : 'Public'}
              </span>
            ) : (
              <span className={CHANNEL_INFO_THEME.statChip}>
                <Hash className="h-3 w-3" aria-hidden />
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
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  )}
                  Remove photo
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ChannelInfoMembersPanel({
  channelParticipants,
  canManageMembers,
  onManageMembers,
}: {
  channelParticipants: ClientTeamMember[]
  canManageMembers?: boolean
  onManageMembers?: () => void
}) {
  return (
    <div className="space-y-4 px-1">
      {canManageMembers && onManageMembers ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-2 rounded-xl border-dashed"
          onClick={onManageMembers}
        >
          <Settings2 className="h-4 w-4" aria-hidden />
          Manage members
        </Button>
      ) : null}

      {channelParticipants.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Invite teammates to this channel to collaborate here."
          variant="inline"
          className="rounded-2xl border-dashed bg-muted/10 py-8"
        />
      ) : (
        <ul className="space-y-0.5" aria-label="Channel members">
          {channelParticipants.map((participant) => (
            <li key={participant.name} className={CHANNEL_INFO_THEME.memberRow}>
              <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/50">
                <AvatarFallback className="bg-primary/8 text-xs font-bold text-primary">
                  {getInitials(participant.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{participant.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {participant.role || 'Teammate'}
                </p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px] font-medium capitalize">
                {participant.role || 'member'}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export function ChannelInfoFilesPanel({ sharedFiles }: { sharedFiles: CollaborationAttachment[] }) {
  if (sharedFiles.length === 0) {
    return (
      <EmptyState
        icon={FileStack}
        title="No shared files yet"
        description="Images, PDFs, and documents posted in this channel appear here."
        variant="inline"
        className="rounded-2xl border-dashed bg-muted/10 py-10"
      />
    )
  }

  return (
    <ChatMediaGallery
      attachments={sharedFiles.map((file) => ({
        name: file.name,
        url: file.url,
        type: file.type,
        size: file.size,
      }))}
      compact={false}
      className="px-0.5"
    />
  )
}

export function ChannelInfoAboutPanel({
  channel,
  canManageMembers,
  onManageMembers,
}: {
  channel: Channel
  canManageMembers?: boolean
  onManageMembers?: () => void
}) {
  return (
    <div className="space-y-4 px-1">
      <div className={CHANNEL_INFO_THEME.settingsCard}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Info className="h-5 w-5" aria-hidden />
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
                <Badge variant="outline" className="gap-1 text-[10px] font-semibold uppercase tracking-wide">
                  {channel.visibility === 'private' ? (
                    <Lock className="h-3 w-3" aria-hidden />
                  ) : (
                    <Users className="h-3 w-3" aria-hidden />
                  )}
                  {channel.visibility}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {channel.isCustom && canManageMembers && onManageMembers ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4 w-full gap-2 rounded-xl"
            onClick={onManageMembers}
          >
            <Settings2 className="h-4 w-4" aria-hidden />
            Manage channel members
          </Button>
        ) : null}
      </div>

      <div className={CHANNEL_INFO_THEME.settingsCard}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-primary ring-1 ring-accent/20">
            <Bell className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className={CHANNEL_INFO_THEME.sectionEyebrow}>Notifications</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Control collaboration alerts alongside tasks, ads, and meetings in workspace settings.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button asChild size="sm" className="rounded-xl">
                <Link href="/settings?tab=notifications">Notification settings</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link href="/dashboard/notifications">Notification center</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChannelInfoTabs({
  channel,
  channelParticipants,
  sharedFiles,
  canManageMembers,
  onManageMembers,
}: {
  channel: Channel
  channelParticipants: ClientTeamMember[]
  sharedFiles: CollaborationAttachment[]
  canManageMembers?: boolean
  onManageMembers?: () => void
}) {
  const fileCount = sharedFiles.length
  const memberCount = channelParticipants.length

  return (
    <Tabs defaultValue="members" className="flex min-h-0 flex-1 flex-col">
      <TabsList className={CHANNEL_INFO_THEME.tabList}>
        <TabsTrigger value="members" className={CHANNEL_INFO_THEME.tabTrigger}>
          Members
          {memberCount > 0 ? (
            <span className="ml-1.5 tabular-nums text-muted-foreground">({memberCount})</span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="files" className={CHANNEL_INFO_THEME.tabTrigger}>
          Files
          {fileCount > 0 ? (
            <span className="ml-1.5 tabular-nums text-muted-foreground">({fileCount})</span>
          ) : null}
        </TabsTrigger>
        <TabsTrigger value="about" className={CHANNEL_INFO_THEME.tabTrigger}>
          About
        </TabsTrigger>
      </TabsList>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4">
        <TabsContent value="members" className="mt-0 focus-visible:outline-none">
          <ChannelInfoMembersPanel
            channelParticipants={channelParticipants}
            canManageMembers={canManageMembers}
            onManageMembers={onManageMembers}
          />
        </TabsContent>
        <TabsContent value="files" className="mt-0 focus-visible:outline-none">
          <ChannelInfoFilesPanel sharedFiles={sharedFiles} />
        </TabsContent>
        <TabsContent value="about" className="mt-0 focus-visible:outline-none">
          <ChannelInfoAboutPanel
            channel={channel}
            canManageMembers={canManageMembers}
            onManageMembers={onManageMembers}
          />
        </TabsContent>
      </div>
    </Tabs>
  )
}
