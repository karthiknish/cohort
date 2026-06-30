import { describe, expect, it } from 'vitest';
import { buildCompletedStepsFromResponse, buildProcessingSteps, countUserMessagesByClientId, deriveAgentStatusFromResponse, filterMessagesForAgentContext, operationProcessingLabel, operationRiskLevel, upsertAgentMessage, } from './agent-message-lifecycle';
describe('agent-message-lifecycle', () => {
    it('builds processing steps with operation-aware labels', () => {
        const steps = buildProcessingSteps('createTask');
        expect(steps[0]?.label).toBe('Parsed request');
        expect(steps[2]?.label).toBe('Creating task');
    });
    it('derives execute error status from response', () => {
        const derived = deriveAgentStatusFromResponse({
            action: 'execute',
            operation: 'createTask',
            executeResult: { success: false, retryable: true, userMessage: 'Missing title' },
        });
        expect(derived.status).toBe('error');
        expect(derived.metadata.data?.retryable).toBe(true);
    });
    it('marks completed steps when navigation succeeds', () => {
        const steps = buildCompletedStepsFromResponse({
            action: 'navigate',
            route: '/dashboard/tasks',
            message: 'Opening tasks',
        });
        expect(steps.every((step) => step.status === 'completed')).toBe(true);
    });
    it('classifies write operations as write risk', () => {
        expect(operationRiskLevel('createTask', 'execute')).toBe('write');
        expect(operationRiskLevel(undefined, 'navigate')).toBe('navigate');
    });
    it('uses readable processing labels', () => {
        expect(operationProcessingLabel('summarizeAdsPerformance')).toContain('ads');
    });
    it('upserts by clientId so retries do not duplicate user bubbles', () => {
        const clientId = 'user-1';
        const first = upsertAgentMessage([], {
            id: clientId,
            clientId,
            lifecycle: 'sending',
        });
        const retried = upsertAgentMessage(first, {
            id: clientId,
            clientId,
            lifecycle: 'failed',
        });
        const reconciled = upsertAgentMessage(retried, {
            id: 'convex-user-id',
            clientId,
            lifecycle: 'sent',
        });
        expect(reconciled).toHaveLength(1);
        expect(reconciled[0]?.id).toBe('convex-user-id');
        expect(reconciled[0]?.lifecycle).toBe('sent');
        expect(countUserMessagesByClientId(reconciled.map((m) => ({ type: 'user', clientId: m.clientId }))).get(clientId)).toBe(1);
    });
    it('excludes failed and sending messages from agent context', () => {
        const filtered = filterMessagesForAgentContext([
            { lifecycle: 'sent' as const, content: 'ok' },
            { lifecycle: 'sending' as const, content: 'pending' },
            { lifecycle: 'failed' as const, content: 'bad' },
            { lifecycle: 'sent' as const, content: 'ok2' },
        ], 10);
        expect(filtered).toHaveLength(2);
        expect(filtered.map((m) => m.content)).toEqual(['ok', 'ok2']);
    });
});
