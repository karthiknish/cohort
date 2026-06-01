import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { ClientTeamMember } from '@/types/clients';
import type { CollaborationAttachment } from '@/types/collaboration';
import type { Channel } from '../types';
import { ChannelInfoAboutPanel, ChannelInfoFilesPanel, ChannelInfoHero, ChannelInfoMembersPanel, ChannelInfoTabs, } from './channel-info-dialog-sections';
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
};
const participants: ClientTeamMember[] = [
    { name: 'Alex Kim', role: 'manager' },
    { name: 'Sam Lee', role: 'designer' },
];
const sharedFiles: CollaborationAttachment[] = [
    { name: 'brief.pdf', url: 'https://example.com/brief.pdf', size: '2 MB', type: 'application/pdf' },
];
describe('channel info dialog sections', () => {
    it('renders hero with channel name and member count', () => {
        const markup = renderToStaticMarkup(<ChannelInfoHero channel={channel} displayName="#team-agency" memberCount={2} isAdmin={false} uploading={false} removing={false} onPickPhoto={vi.fn()} onRemovePhoto={vi.fn()}/>);
        expect(markup).toContain('team-agency');
        expect(markup).toContain('2 members');
        expect(markup).toContain('Private');
    });
    it('renders members panel with roster', () => {
        const markup = renderToStaticMarkup(<ChannelInfoMembersPanel channelParticipants={participants} canManageMembers={true} onManageMembers={vi.fn()}/>);
        expect(markup).toContain('Manage members');
        expect(markup).toContain('Alex Kim');
        expect(markup).toContain('Sam Lee');
    });
    it('renders files panel with shared asset', () => {
        const markup = renderToStaticMarkup(<ChannelInfoFilesPanel sharedFiles={sharedFiles}/>);
        expect(markup).toContain('brief.pdf');
    });
    it('renders about panel with description and notification links', () => {
        const markup = renderToStaticMarkup(<ChannelInfoAboutPanel channel={channel}/>);
        expect(markup).toContain('Internal coordination channel');
        expect(markup).toContain('/settings?tab=notifications');
    });
    it('renders tabbed shell with counts', () => {
        const markup = renderToStaticMarkup(<ChannelInfoTabs channel={channel} channelMessages={[]} channelParticipants={participants} currentUserId="user-1" sharedFiles={sharedFiles} workspaceId="workspace-1"/>);
        expect(markup).toContain('Members');
        expect(markup).toContain('Pinned');
        expect(markup).toContain('Files');
        expect(markup).toContain('About');
        expect(markup).toContain('(2)');
        expect(markup).toContain('(1)');
    });
});
