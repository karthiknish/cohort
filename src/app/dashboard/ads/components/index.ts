export { AdsSkeleton } from './ads-skeleton'

// Types
export type {
  IntegrationStatus,
  IntegrationStatusResponse,
  MetricRecord,
  MetricsResponse,
  ProviderSummary,
  Totals,
  ProviderAutomationFormState,
  AdPlatform,
  SummaryCard,
} from './types'

// Utils and constants
export {
  METRICS_PAGE_SIZE,
  DEFAULT_SYNC_FREQUENCY_MINUTES,
  DEFAULT_TIMEFRAME_DAYS,
  ADS_WORKFLOW_STEPS,
  FREQUENCY_OPTIONS,
  TIMEFRAME_OPTIONS,
  PROVIDER_ICON_MAP,
  DISPLAY_DATE_FORMATTER,
  fetchIntegrationStatuses,
  fetchMetrics,
  normalizeFrequency,
  normalizeTimeframe,
  getErrorMessage,
  formatRelativeTimestamp,
  getStatusBadgeVariant,
  getStatusLabel,
  formatProviderName,
  describeFrequency,
  describeTimeframe,
  formatDisplayDate,
  exportMetricsToCsv,
} from './utils'

// Components
export { AutomationControlsCard } from './automation-controls-card'
export { CrossChannelOverviewCard } from './cross-channel-overview-card'
export { PerformanceSummaryCard } from './performance-summary-card'
export { MetricsTableCard } from './metrics-table-card'
export { WorkflowCard } from './workflow-card'
export { SetupAlerts } from './setup-alerts'
