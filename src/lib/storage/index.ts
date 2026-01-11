// =============================================================================
// STORAGE MODULE - Barrel Exports
// =============================================================================

// Types
export * from './types'

// Derived Metrics
// Deprecated: client-side Firestore storage has been removed.
export {
    writeDerivedMetrics,
    writeDerivedMetric,
    queryDerivedMetrics,
    getDerivedMetricsByDateRange,
    getLatestDerivedMetrics,
    deleteDerivedMetricsBeforeDate,
    deleteDerivedMetric,
} from './derived-metrics'
