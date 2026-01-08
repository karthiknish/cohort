// =============================================================================
// ALERT SYSTEM - Type Definitions
// =============================================================================

/**
 * Type of alert rule
 */
export type AlertRuleType = 'threshold' | 'anomaly' | 'trend' | 'algorithmic'

/**
 * Alert severity levels
 */
export type AlertSeverity = 'info' | 'warning' | 'critical'

/**
 * Supported metrics for alerts
 */
export type AlertMetric = 'spend' | 'cpc' | 'ctr' | 'roas' | 'conversions' | 'cpa' | 'revenue' | 'impressions' | 'clicks' | 'custom_formula'

/**
 * Comparison operators for threshold rules
 */
export type ThresholdOperator = 'gt' | 'lt' | 'gte' | 'lte' | 'eq'

/**
 * Trend directions
 */
export type TrendDirection = 'increasing' | 'decreasing'

// =============================================================================
// CONDITION TYPES
// =============================================================================

/**
 * Threshold condition: fires when metric crosses a value
 */
export interface ThresholdCondition {
    type: 'threshold'
    operator: ThresholdOperator
    value: number
}

/**
 * Anomaly condition: fires when metric deviates from average
 */
export interface AnomalyCondition {
    type: 'anomaly'
    /** Multiplier for deviation (e.g., 2 = 2x average) */
    deviationMultiplier: number
    /** Number of days to calculate baseline average */
    baselineDays: number
    /** Direction of deviation to alert on */
    direction: 'above' | 'below' | 'both'
}

/**
 * Trend condition: fires when metric shows consecutive pattern
 */
export interface TrendCondition {
    type: 'trend'
    /** Direction of trend */
    direction: TrendDirection
    /** Number of consecutive periods */
    consecutivePeriods: number
    /** Minimum percentage change to count as a change */
    minChangePercent?: number
}

/**
 * Union type for all conditions
 */
export type AlertCondition = ThresholdCondition | AnomalyCondition | TrendCondition

// =============================================================================
// ALERT RULE
// =============================================================================

/**
 * Complete alert rule definition
 */
export interface AlertRule {
    id: string
    name: string
    description?: string
    type: AlertRuleType
    metric: AlertMetric
    condition: AlertCondition
    severity: AlertSeverity
    enabled: boolean
    /** Provider filter (optional) */
    providerId?: string
    /** Campaign filter (optional) */
    campaignId?: string
    /** Custom formula ID (required if metric is custom_formula) */
    formulaId?: string
    /** Algorithmic insight type (optional for algorithmic alerts) */
    insightType?: 'efficiency' | 'budget' | 'creative' | 'audience' | 'all'
    /** Notification channels */
    channels: AlertChannel[]
    /** Created timestamp */
    createdAt: string
    /** Last updated timestamp */
    updatedAt: string
}

/**
 * Notification channel for alerts
 */
export type AlertChannel = 'email' | 'slack' | 'in-app'

// =============================================================================
// ALERT RESULT
// =============================================================================

/**
 * Result of evaluating a single rule
 */
export interface AlertResult {
    ruleId: string
    ruleName: string
    triggered: boolean
    severity: AlertSeverity
    metric: AlertMetric
    message: string
    currentValue: number
    threshold?: number
    average?: number
    deviationPercent?: number
    trendDays?: number
    /** For custom formulas */
    formulaId?: string
    /** For algorithmic alerts */
    insightType?: string
    suggestion?: string
    timestamp: string
}

/**
 * Complete evaluation result for all rules
 */
export interface AlertEvaluationResult {
    evaluated: number
    triggered: number
    results: AlertResult[]
    evaluatedAt: string
}

// =============================================================================
// METRIC DATA FOR EVALUATION
// =============================================================================

/**
 * Daily metric data point for alert evaluation
 */
export interface DailyMetricData {
    date: string
    spend: number
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    cpc: number
    ctr: number
    roas: number
    cpa: number
}

/**
 * Input data for alert evaluation
 */
export interface AlertEvaluationInput {
    /** Current period metrics */
    current: DailyMetricData
    /** Historical data for trend/anomaly detection */
    history: DailyMetricData[]
    /** Provider ID */
    providerId?: string
    /** Campaign ID */
    campaignId?: string
}

// =============================================================================
// API REQUEST/RESPONSE TYPES
// =============================================================================

/**
 * Request body for creating/updating alert rules
 */
export interface CreateAlertRuleRequest {
    name: string
    description?: string
    type: AlertRuleType
    metric: AlertMetric
    condition: AlertCondition
    severity: AlertSeverity
    enabled?: boolean
    providerId?: string
    campaignId?: string
    channels: AlertChannel[]
}

/**
 * Request body for evaluating alerts
 */
export interface EvaluateAlertsRequest {
    /** User's metrics data */
    metrics: AlertEvaluationInput
    /** Optional: specific rule IDs to evaluate */
    ruleIds?: string[]
}

/**
 * Alert notification payload
 */
export interface AlertNotificationPayload {
    ruleId: string
    ruleName: string
    severity: AlertSeverity
    metric: AlertMetric
    message: string
    currentValue: number
    threshold?: number
    providerId?: string
    triggeredAt: string
}
