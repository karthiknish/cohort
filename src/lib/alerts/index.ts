// =============================================================================
// ALERTS MODULE - Barrel Exports
// =============================================================================

// Types
export * from './types'

// Rules Engine
export {
    evaluateRule,
    evaluateThresholdRule,
    evaluateAnomalyRule,
    evaluateTrendRule,
    getMetricValue,
    compareValues,
    calculateAverage,
} from './rules-engine'

// Evaluator
export {
    evaluateAlerts,
    getTriggeredAlerts,
    toNotificationPayload,
    groupAlertsBySeverity,
    formatAlertsForSlack,
    formatAlertsForEmail,
} from './evaluator'
