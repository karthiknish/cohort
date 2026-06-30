import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/shared/ui/select', () => ({
    Select: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    SelectContent: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    SelectItem: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    SelectTrigger: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    SelectValue: ({ placeholder }: {
        placeholder?: string;
    }) => <div>{placeholder}</div>,
}));
import { InsightsChartsEmptyState, InsightsChartsHeader, InsightsChartsLoadingState, InsightsChartsTabs, } from './insights-charts-card-sections';
const tabAvailability = {
    comparison: true,
    efficiency: true,
    trends: false,
    funnel: true,
    benchmarks: false,
};
describe('insights charts card sections', () => {
    it('renders the loading and empty shells', () => {
        const loadingMarkup = renderToStaticMarkup(<InsightsChartsLoadingState />);
        const emptyMarkup = renderToStaticMarkup(<InsightsChartsEmptyState />);
        const connectedEmpty = renderToStaticMarkup(<InsightsChartsEmptyState hasConnections/>);
        expect(loadingMarkup).toContain('skeleton-shimmer');
        expect(emptyMarkup).toContain('Performance insights');
        expect(emptyMarkup).toContain('Connect ad platforms first');
        expect(connectedEmpty).toContain('Waiting for synced metrics');
    });
    it('renders the header and controlled tabs', () => {
        const headerMarkup = renderToStaticMarkup(<InsightsChartsHeader onSelectedProviderChange={vi.fn()} providers={[
                { id: 'google', name: 'Google Ads' },
                { id: 'meta', name: 'Meta Ads' },
            ]} providersCount={2} selectedProvider="all"/>);
        const tabsMarkup = renderToStaticMarkup(<InsightsChartsTabs activeTab="funnel" onTabChange={vi.fn()} tabAvailability={tabAvailability}>
        <div>Funnel panel</div>
      </InsightsChartsTabs>);
        expect(headerMarkup).toContain('Charts across 2 platforms');
        expect(headerMarkup).toContain('All platforms');
        expect(tabsMarkup).toContain('Funnel');
        expect(tabsMarkup).toContain('Funnel panel');
    });
});
