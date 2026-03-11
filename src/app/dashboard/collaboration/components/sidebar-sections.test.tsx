import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('convex/react', () => ({
  useMutation: () => vi.fn(),
}))

vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}))

import type { ClientTeamMember } from '@/types/clients'
import type { CollaborationAttachment, CollaborationMessage } from '@/types/collaboration'

import type { Channel } from '../types'

import {
  CollaborationSidebarAssetLibrarySection,
  CollaborationSidebarChannelCard,
  CollaborationSidebarContent,
  CollaborationSidebarMobileHeader,
  CollaborationSidebarPinnedSection,
  CollaborationSidebarRosterSection,
} from './sidebar-sections'

const channel: Channel = {
  id: 'team-agency',
  name: 'team-agency',
  type: 'team',
  clientId: null,
  projectId: null,
  description: 'Internal coordination channel',
  isCustom: true,
  visibility: 'private',
  teamMembers: [],
}

const participants: ClientTeamMember[] = [
  { name: 'Alex Kim', role: 'manager', email: 'alex@example.com' } as ClientTeamMember,
  { name: 'Sam Lee', role: 'designer', email: 'sam@example.com' } as ClientTeamMember,
]

const sharedFiles: CollaborationAttachment[] = [{ name: 'brief.pdf', url: 'https://example.com/brief.pdf', size: '2 MB', type: 'application/pdf' }]

const pinnedMessages: CollaborationMessage[] = [
  {
    id: 'message-1',
    senderId: 'user-1',
    senderName: 'Alex Kim',
    senderRole: 'manager',
    createdAt: '2026-03-11T12:00:00.000Z',
    updatedAt: null,
    content: 'Pin this update',
    attachments: [],
    reactions: [],
    mentions: [],
    readBy: [],
    deliveredTo: [],
    sharedTo: [],
    channelType: 'team',
    clientId: null,
    projectId: null,
    deletedAt: null,
    deletedBy: null,
    isDeleted: false,
    isEdited: false,
    isPinned: true,
    pinnedAt: '2026-03-11T12:10:00.000Z',
    parentMessageId: null,
    threadRootId: null,
    threadReplyCount: 0,
    threadLastReplyAt: null,
  },
]

describe('collaboration sidebar sections', () => {
  it('renders the header, channel card, and roster', () => {
    const markup = renderToStaticMarkup(
      <>
        <CollaborationSidebarMobileHeader collapseId="sidebar" onToggle={vi.fn()} open={true} />
        <CollaborationSidebarChannelCard channel={channel} canManageMembers={true} onManageMembers={vi.fn()} />
        <CollaborationSidebarRosterSection channel={channel} channelParticipants={participants} />
      </>,
    )

    expect(markup).toContain('Workspace info')
    expect(markup).toContain('#team-agency')
    expect(markup).toContain('Private')
    expect(markup).toContain('Manage')
    expect(markup).toContain('Alex Kim')
    expect(markup).toContain('Sam Lee')
  })

  it('renders assets and the full sidebar content shell', () => {
    const markup = renderToStaticMarkup(
      <>
        <CollaborationSidebarAssetLibrarySection sharedFiles={sharedFiles} />
        <CollaborationSidebarPinnedSection messages={pinnedMessages} workspaceId="workspace-1" onMessageClick={vi.fn()} />
        <CollaborationSidebarContent channel={channel} channelParticipants={participants} channelMessages={pinnedMessages} workspaceId="workspace-1" sharedFiles={sharedFiles} canManageMembers={true} onManageMembers={vi.fn()} />
      </>,
    )

    expect(markup).toContain('Asset Library')
    expect(markup).toContain('Pinned Messages (1)')
    expect(markup).toContain('Pin this update')
    expect(markup).toContain('brief.pdf')
    expect(markup).toContain('Workspace Roster')
    expect(markup).toContain('Internal coordination channel')
  })

  it('renders a deterministic empty state for the asset library', () => {
    const markup = renderToStaticMarkup(<CollaborationSidebarAssetLibrarySection sharedFiles={[]} />)

    expect(markup).toContain('No shared files yet')
    expect(markup).toContain('Files shared in messages will appear here automatically.')
  })
})