import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { AgentMessage } from '@/shared/hooks/use-agent-mode';
import { AgentMessageCard } from './agent-message-card';
vi.mock('next/link', () => ({
    default: ({ children, href }: {
        children: ReactNode;
        href: string;
    }) => (<a href={href}>{children}</a>),
}));
vi.mock('convex/react', () => ({
    useConvex: () => ({}),
    useMutation: () => vi.fn(async () => null),
}));
vi.mock('@/shared/ui/motion', async () => {
    const { motionTestMock } = await import('@/test/motion-mock');
    return motionTestMock;
});
function agentMessage(partial: Partial<AgentMessage> & Pick<AgentMessage, 'content'>): AgentMessage {
    return {
        id: 'm1',
        type: 'agent',
        timestamp: new Date('2026-01-01T00:00:00.000Z'),
        clientId: 'client-1',
        ...partial,
    };
}
describe('AgentMessageCard', () => {
    it('renders structured warning card for attachment wait state', () => {
        const markup = renderToStaticMarkup(<AgentMessageCard message={agentMessage({
                content: 'Still reading files.',
                status: 'warning',
                metadata: { action: 'response', success: false },
            })}/>);
        expect(markup).toContain('Heads up');
        expect(markup).toContain('Warning');
        expect(markup).toContain('Still reading files.');
    });
    it('renders clarification as warning-styled structured card', () => {
        const markup = renderToStaticMarkup(<AgentMessageCard message={agentMessage({
                content: 'Which project should I use?',
                status: 'info',
                metadata: { action: 'clarify' },
            })}/>);
        expect(markup).toContain('Need a bit more detail');
        expect(markup).toContain('Clarification');
    });
    it('renders execute error with try again when retryable', () => {
        const onRetry = vi.fn();
        const markup = renderToStaticMarkup(<AgentMessageCard message={agentMessage({
                content: 'Could not complete that.',
                status: 'error',
                metadata: {
                    action: 'execute',
                    operation: 'createProject',
                    success: false,
                    data: { retryable: true },
                },
            })} onRetryLastUserTurn={onRetry}/>);
        expect(markup).toContain('Project action failed');
        expect(markup).toContain('Try again');
    });
    it('renders ads snapshot with performance chart sections', () => {
        const markup = renderToStaticMarkup(<AgentMessageCard message={agentMessage({
                content: 'Meta is pacing ahead this week.',
                status: 'success',
                metadata: {
                    action: 'execute',
                    operation: 'summarizeAdsPerformance',
                    success: true,
                    data: {
                        totals: { spend: 1200, revenue: 3600, impressions: 50000, clicks: 900, conversions: 40 },
                        providerBreakdown: [{ providerId: 'facebook', label: 'Meta Ads', totals: { spend: 1200 } }],
                        topCampaigns: [
                            { name: 'Brand', spend: 400 },
                            { name: 'Prospecting', spend: 250 },
                        ],
                    },
                },
            })}/>);
        expect(markup).toContain('Snapshot ready');
        expect(markup).toContain('Spend vs revenue');
        expect(markup).toContain('Performance');
    });
    it('renders analytics snapshot with traffic chart sections', () => {
        const markup = renderToStaticMarkup(<AgentMessageCard message={agentMessage({
                content: 'Traffic is up this month.',
                status: 'success',
                metadata: {
                    action: 'execute',
                    operation: 'summarizeAnalyticsPerformance',
                    success: true,
                    data: {
                        dataKind: 'analytics',
                        currentSituation: 'Traffic is up this month.',
                        totals: { users: 1200, sessions: 2400, conversions: 48, revenue: 9600 },
                        comparison: { deltaPercent: { users: 8, sessions: 12, conversions: -4, revenue: 15 } },
                        metricsAvailable: true,
                    },
                },
            })}/>);
        expect(markup).toContain('Analytics ready');
        expect(markup).toContain('Traffic volume');
        expect(markup).toMatch(/Traffic (&amp;|&) Conversions/);
    });
    it('renders social snapshot with surface chart sections', () => {
        const markup = renderToStaticMarkup(<AgentMessageCard message={agentMessage({
                content: 'Instagram is leading engagement.',
                status: 'success',
                metadata: {
                    action: 'execute',
                    operation: 'summarizeSocialPerformance',
                    success: true,
                    data: {
                        dataKind: 'social',
                        facebook: { reach: 5000, impressions: 8000, engagedUsers: 420 },
                        instagram: { reach: 3200, impressions: 5100, engagedUsers: 280 },
                        metricsAvailable: true,
                    },
                },
            })}/>);
        expect(markup).toContain('Social insights ready');
        expect(markup).toContain('Facebook reach &amp; engagement');
        expect(markup).toContain('Instagram reach &amp; engagement');
    });
    it('renders neutral info card for conversational response', () => {
        const markup = renderToStaticMarkup(<AgentMessageCard message={agentMessage({
                content: 'Here is a general answer.',
                status: 'info',
                metadata: { action: 'response', success: true },
            })}/>);
        expect(markup).toContain('Reply');
        expect(markup).toContain('Information');
        expect(markup).toContain('Here is a general answer.');
    });
});
