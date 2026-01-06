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
  ApiErrorResponse,
} from './types'

// Type utilities
export { parseApiError, extractApiError } from './types'

// Constants
export {
  HTTP_NO_CONTENT,
  DEFAULT_DATE_RANGE_DAYS,
  PROVIDER_IDS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TOAST_TITLES,
} from './constants'
export type { ProviderId } from './constants'

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
  ApiError,
  NetworkError,
} from './utils'

// Retry utilities
export { retryFetch, getRetryableErrorMessage } from './retry-fetch'

// Components
export { AutomationControlsCard } from './automation-controls-card'
export { CrossChannelOverviewCard } from './cross-channel-overview-card'
export { PerformanceSummaryCard } from './performance-summary-card'
export { MetricsTableCard } from './metrics-table-card'
export { WorkflowCard } from './workflow-card'
export { SetupAlerts } from './setup-alerts'
export { CampaignManagementCard } from './campaign-management-card'
export { CreativesCard } from './creatives-card'
export { AudienceTargetingCard } from './audience-targeting-card'
export { DateRangePicker, type DateRange } from './date-range-picker'
