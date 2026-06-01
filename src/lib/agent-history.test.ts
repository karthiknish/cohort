import { describe, expect, it } from 'vitest';
import { groupAgentHistory } from './agent-history';
import type { AgentConversationSummary } from '@/shared/hooks/use-agent-mode';
describe('agent-history', () => {
    it('groups conversations into pinned and date buckets', () => {
        const now = new Date();
        const today = now.toISOString();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        const grouped = groupAgentHistory([
            { id: '1', title: 'Pinned', lastMessageAt: today, messageCount: 1, pinnedAt: today },
            { id: '2', title: 'Today', lastMessageAt: today, messageCount: 1 },
            { id: '3', title: 'Yesterday', lastMessageAt: yesterday, messageCount: 1 },
        ] as AgentConversationSummary[]);
        expect(grouped.map((entry) => entry.group)).toEqual(['pinned', 'today', 'yesterday']);
    });
});
