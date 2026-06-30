import { describe, expect, it } from 'vitest';
import { buildAgentConversationShareLink, formatAgentConversationMarkdown, type AgentExportConversation, } from './agent-conversation-export';
describe('agent-conversation-export', () => {
    const sample: AgentExportConversation = {
        id: 'conv-1',
        title: 'Weekly planning',
        startedAt: '2026-05-01T10:00:00.000Z',
        lastMessageAt: '2026-05-01T10:05:00.000Z',
        messages: [
            {
                id: 'm1',
                type: 'user',
                content: 'List active projects',
                timestamp: '2026-05-01T10:00:00.000Z',
            },
            {
                id: 'm2',
                type: 'agent',
                content: 'Found 2 active projects.',
                timestamp: '2026-05-01T10:05:00.000Z',
                route: '/dashboard/projects',
            },
        ],
    };
    it('formats markdown transcripts', () => {
        const markdown = formatAgentConversationMarkdown(sample);
        expect(markdown).toContain('# Weekly planning');
        expect(markdown).toContain('## You ·');
        expect(markdown).toContain('Route: /dashboard/projects');
    });
    it('builds share links with conversation id', () => {
        expect(buildAgentConversationShareLink('conv-abc')).toContain('agentConversation=conv-abc');
    });
});
