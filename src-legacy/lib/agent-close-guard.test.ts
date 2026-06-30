import { describe, expect, it } from 'vitest';
import type { AgentMessage } from '@/shared/hooks/use-agent-mode';
import { agentCloseBlockerMessage, getAgentCloseBlockers, shouldBlockAgentClose, } from './agent-close-guard';
const baseState = {
    composerText: '',
    pendingAttachments: [],
    isProcessing: false,
    isExtractingAttachments: false,
    messages: [] as AgentMessage[],
};
describe('agent close guard', () => {
    it('blocks when composer has unsent text', () => {
        const blockers = getAgentCloseBlockers({ ...baseState, composerText: 'draft' });
        expect(blockers).toContain('unsent-message');
        expect(shouldBlockAgentClose({ ...baseState, composerText: 'draft' })).toBe(true);
    });
    it('blocks when a confirmation is pending', () => {
        const messages = [
            {
                id: '1',
                clientId: '1',
                content: 'Confirm?',
                type: 'agent',
                timestamp: new Date(),
                metadata: { pendingConfirmation: { actionId: 'a1', label: 'Create task' } },
            },
        ] as AgentMessage[];
        expect(getAgentCloseBlockers({ ...baseState, messages })).toContain('pending-confirmation');
    });
    it('returns a processing-first message when busy', () => {
        const message = agentCloseBlockerMessage(['processing', 'unsent-message']);
        expect(message).toContain('still working');
    });
});
