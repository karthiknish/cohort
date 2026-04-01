import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

let mockContext: Record<string, unknown>

vi.mock('./analytics-page-provider', () => ({
  useAnalyticsPageContext: () => mockContext,
}))

vi.mock('./analytics-date-range-picker', () => ({
  AnalyticsDateRangePicker: () => <div>Analytics Date Range Picker</div>,
}))

vi.mock('./google-analytics-setup-dialog', () => ({
  GoogleAnalyticsSetupDialog: () => <div>Google Analytics Setup Dialog</div>,
}))

vi.mock('../../ads/components/connection-dialog', () => ({
  DisconnectDialog: () => <div>Disconnect Dialog</div>,
}))

vi.mock('./analytics-summary-cards', () => ({
  AnalyticsSummaryCards: () => <div>Analytics Summary Cards</div>,
}))

vi.mock('./analytics-metric-cards', () => ({
  AnalyticsMetricCards: () => <div>Analytics Metric Cards</div>,
}))

vi.mock('./analytics-deep-dive-section', () => ({
  AnalyticsDeepDiveSection: () => <div>Analytics Deep Dive</div>,
}))

vi.mock('./analytics-charts', () => ({
  AnalyticsCharts: () => <div>Analytics Charts</div>,
}))

vi.mock('./analytics-insights-section', () => ({
  AnalyticsInsightsSection: () => <div>Analytics Insights</div>,
}))

vi.mock('./analytics-export-button', () => ({
  AnalyticsExportButton: () => <div>Analytics Export Button</div>,
}))

vi.mock('@/shared/ui/auto-refresh-controls', () => ({
  AutoRefreshControls: () => <div>Auto Refresh Controls</div>,
}))

import { AnalyticsPageShell } from './analytics-page-shell'

describe('AnalyticsPageShell', () => {
  beforeEach(() => {
    mockContext = {
      algorithmic: [],
      avgSessionsPerDay: 24,
      avgUsersPerDay: 18,
      chartData: [{ date: '2026-03-31', users: 180, sessions: 240, conversions: 12, revenue: 6400, conversionRate: 5 }],
      conversionRate: 5,
      dateRange: {
        start: new Date('2026-03-01T00:00:00.000Z'),
        end: new Date('2026-03-31T00:00:00.000Z'),
      },
      filteredMetrics: [{ id: 'preview-ga-1', providerId: 'google-analytics', date: '2026-03-31', impressions: 180, clicks: 240, conversions: 12, revenue: 6400 }],
      gaAccountLabel: 'Preview Google Analytics',
      gaConnected: true,
      gaDisconnectDialogOpen: false,
      gaDisconnecting: false,
      gaInitializingProperty: false,
      gaLastRequestedLabel: '1h ago',
      gaLastSyncMessage: null,
      gaLastSyncStatus: 'success',
      gaLastSyncedLabel: '1h ago',
      gaLoading: false,
      gaLoadingProperties: false,
      gaNeedsPropertySelection: false,
      gaProperties: [],
      gaSelectedPropertyId: 'preview-google-analytics-property',
      gaSetupDialogOpen: false,
      gaSetupMessage: null,
      gaStatusLabel: 'Preview dataset',
      handleConnectGoogleAnalytics: async () => {},
      handleDateRangeChange: () => {},
      handleDisconnectGoogleAnalytics: async () => {},
      handleFinalizeGoogleAnalyticsSetup: () => {},
      handleLoadMoreMetrics: async () => {},
      handleOpenGoogleAnalyticsSetup: () => {},
      handleRefreshInsights: () => {},
      handleRefreshMetrics: () => {},
      handleSyncGoogleAnalytics: () => {},
      initialInsightsLoading: false,
      initialMetricsLoading: false,
      insights: [{ providerId: 'google-analytics', summary: 'Preview insight' }],
      insightsError: undefined,
      insightsLoading: false,
      insightsRefreshing: false,
      isGaSelectedWithoutData: false,
      isPreviewMode: true,
      isSyncPending: false,
      loadGoogleAnalyticsPropertyOptions: async () => [],
      metricsError: undefined,
      metricsLoading: false,
      metricsLoadingMore: false,
      metricsNextCursor: null,
      metricsRefreshing: false,
      revenuePerSession: 26.6,
      sessionsPerUser: 1.3,
      setGaDisconnectDialogOpen: () => {},
      setGaSelectedPropertyId: () => {},
      setGaSetupDialogOpen: () => {},
      story: {
        headline: 'Preview story',
        summary: 'Preview summary',
        strongestDay: null,
        weakestDay: null,
        comparison: null,
      },
      totals: { users: 180, sessions: 240, conversions: 12, revenue: 6400 },
    }
  })

  it('renders preview analytics data without connect actions', () => {
    const markup = renderToStaticMarkup(<AnalyticsPageShell />)

    expect(markup).toContain('Preview dataset')
    expect(markup).toContain('Read-only sample data')
    expect(markup).toContain('Showing read-only Google Analytics preview metrics and insights for demos and screen recordings.')
    expect(markup).toContain('Analytics Summary Cards')
    expect(markup).toContain('Analytics Charts')
    expect(markup).toContain('Analytics Insights')
    expect(markup).not.toContain('Connect Google')
    expect(markup).not.toContain('Sync data')
  })
})