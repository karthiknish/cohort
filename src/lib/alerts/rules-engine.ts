// =============================================================================
// ALERT RULES ENGINE - Detection Logic
// =============================================================================

import type {
    AlertRule,
    AlertResult,
    AlertMetric,
    DailyMetricData,
    ThresholdCondition,
    AnomalyCondition,
    TrendCondition,
    ThresholdOperator,
} from './types'
import { safeEvaluateFormula } from '../metrics'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get metric value from daily data
 */
export function getMetricValue(data: DailyMetricData, metric: AlertMetric): number {
    switch (metric) {
        case 'spend':
            return data.spend
        case 'impressions':
            return data.impressions
        case 'clicks':
            return data.clicks
        case 'conversions':
            return data.conversions
        case 'revenue':
            return data.revenue
        case 'cpc':
            return data.cpc
        case 'ctr':
            return data.ctr
        case 'roas':
            return data.roas
        case 'cpa':
            return data.cpa
        default:
            return 0
    }
}

/**
 * Compare two values using an operator
 */
export function compareValues(value: number, operator: ThresholdOperator, threshold: number): boolean {
    switch (operator) {
        case 'gt':
            return value > threshold
        case 'lt':
            return value < threshold
        case 'gte':
            return value >= threshold
        case 'lte':
            return value <= threshold
        case 'eq':
            return value === threshold
        default:
            return false
    }
}

/**
 * Get human-readable operator text
 */
function getOperatorText(operator: ThresholdOperator): string {
    switch (operator) {
        case 'gt':
            return 'greater than'
        case 'lt':
            return 'less than'
        case 'gte':
            return 'greater than or equal to'
        case 'lte':
            return 'less than or equal to'
        case 'eq':
            return 'equal to'
        default:
            return operator
    }
}

/**
 * Calculate average of metric values
 */
export function calculateAverage(history: DailyMetricData[], metric: AlertMetric): number {
    if (history.length === 0) return 0
    const sum = history.reduce((acc, data) => acc + getMetricValue(data, metric), 0)
    return sum / history.length
}

/**
 * Format metric value for display
 */
function formatMetricValue(metric: AlertMetric, value: number): string {
    switch (metric) {
        case 'spend':
        case 'revenue':
        case 'cpc':
        case 'cpa':
            return `$${value.toFixed(2)}`
        case 'ctr':
        case 'roas':
            return value.toFixed(2)
        default:
            return Math.round(value).toString()
    }
}

// =============================================================================
// THRESHOLD DETECTION
// =============================================================================

/**
 * Evaluate a threshold rule
 */
export function evaluateThresholdRule(
    rule: AlertRule,
    current: DailyMetricData,
    formula?: { formula: string; inputs: string[] }
): AlertResult {
    const condition = rule.condition as ThresholdCondition
    let currentValue = getMetricValue(current, rule.metric)

    // Handle custom formula
    if (rule.metric === 'custom_formula' && formula) {
        const inputValues: Record<string, number> = {}
        formula.inputs.forEach(input => {
            inputValues[input] = getMetricValue(current, input as AlertMetric)
        })
        currentValue = safeEvaluateFormula(formula.formula, inputValues) ?? 0
    }

    const triggered = compareValues(currentValue, condition.operator, condition.value)

    return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered,
        severity: rule.severity,
        metric: rule.metric,
        message: triggered
            ? `${rule.metric === 'custom_formula' ? rule.name : rule.metric.toUpperCase()} (${formatMetricValue(rule.metric, currentValue)}) is ${getOperatorText(condition.operator)} ${formatMetricValue(rule.metric, condition.value)}`
            : `${rule.metric === 'custom_formula' ? rule.name : rule.metric.toUpperCase()} is within threshold`,
        currentValue,
        threshold: condition.value,
        formulaId: rule.formulaId,
        timestamp: new Date().toISOString(),
    }
}

// =============================================================================
// ANOMALY DETECTION
// =============================================================================

/**
 * Evaluate an anomaly rule
 */
export function evaluateAnomalyRule(
    rule: AlertRule,
    current: DailyMetricData,
    history: DailyMetricData[]
): AlertResult {
    const condition = rule.condition as AnomalyCondition
    const currentValue = getMetricValue(current, rule.metric)

    // Get baseline data (last N days)
    const baselineData = history.slice(-condition.baselineDays)
    const average = calculateAverage(baselineData, rule.metric)

    if (average === 0) {
        return {
            ruleId: rule.id,
            ruleName: rule.name,
            triggered: false,
            severity: rule.severity,
            metric: rule.metric,
            message: `Insufficient baseline data for anomaly detection`,
            currentValue,
            average: 0,
            timestamp: new Date().toISOString(),
        }
    }

    const deviationThreshold = average * condition.deviationMultiplier
    const deviationPercent = ((currentValue - average) / average) * 100

    let triggered = false
    if (condition.direction === 'above') {
        triggered = currentValue > deviationThreshold
    } else if (condition.direction === 'below') {
        triggered = currentValue < average / condition.deviationMultiplier
    } else {
        triggered = currentValue > deviationThreshold || currentValue < average / condition.deviationMultiplier
    }

    return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered,
        severity: rule.severity,
        metric: rule.metric,
        message: triggered
            ? `${rule.metric.toUpperCase()} (${formatMetricValue(rule.metric, currentValue)}) is ${Math.abs(deviationPercent).toFixed(1)}% ${deviationPercent > 0 ? 'above' : 'below'} the ${condition.baselineDays}-day average (${formatMetricValue(rule.metric, average)})`
            : `${rule.metric.toUpperCase()} is within normal range`,
        currentValue,
        average,
        deviationPercent,
        timestamp: new Date().toISOString(),
    }
}

// =============================================================================
// TREND DETECTION
// =============================================================================

/**
 * Evaluate a trend rule
 */
export function evaluateTrendRule(
    rule: AlertRule,
    history: DailyMetricData[]
): AlertResult {
    const condition = rule.condition as TrendCondition
    const metric = rule.metric

    // Need at least consecutivePeriods + 1 data points
    if (history.length < condition.consecutivePeriods + 1) {
        return {
            ruleId: rule.id,
            ruleName: rule.name,
            triggered: false,
            severity: rule.severity,
            metric: rule.metric,
            message: `Insufficient data for trend detection (need ${condition.consecutivePeriods + 1} days)`,
            currentValue: history.length > 0 ? getMetricValue(history[history.length - 1]!, metric) : 0,
            timestamp: new Date().toISOString(),
        }
    }

    // Get the most recent days for trend analysis
    const recentData = history.slice(-(condition.consecutivePeriods + 1))
    const minChangePercent = condition.minChangePercent ?? 0

    let consecutiveCount = 0

    for (let i = 1; i < recentData.length; i++) {
        const prevValue = getMetricValue(recentData[i - 1]!, metric)
        const currValue = getMetricValue(recentData[i]!, metric)

        if (prevValue === 0) continue

        const changePercent = ((currValue - prevValue) / prevValue) * 100

        if (condition.direction === 'increasing') {
            if (changePercent >= minChangePercent) {
                consecutiveCount++
            } else {
                consecutiveCount = 0
            }
        } else {
            if (changePercent <= -minChangePercent) {
                consecutiveCount++
            } else {
                consecutiveCount = 0
            }
        }
    }

    const triggered = consecutiveCount >= condition.consecutivePeriods
    const currentValue = getMetricValue(recentData[recentData.length - 1]!, metric)

    return {
        ruleId: rule.id,
        ruleName: rule.name,
        triggered,
        severity: rule.severity,
        metric: rule.metric,
        message: triggered
            ? `${rule.metric.toUpperCase()} has been ${condition.direction} for ${consecutiveCount} consecutive days`
            : `No significant ${condition.direction} trend detected`,
        currentValue,
        trendDays: consecutiveCount,
        timestamp: new Date().toISOString(),
    }
}

// =============================================================================
// MAIN EVALUATOR
// =============================================================================

/**
 * Evaluate a single rule against metric data
 */
export function evaluateRule(
    rule: AlertRule,
    current: DailyMetricData,
    history: DailyMetricData[],
    formula?: { formula: string; inputs: string[] }
): AlertResult {
    if (rule.type === 'algorithmic') {
        // Algorithmic rules are handled in the evaluator usually, but we'll return a placeholder here
        // to maintain type safety if called through this path
        return {
            ruleId: rule.id,
            ruleName: rule.name,
            triggered: false,
            severity: rule.severity,
            metric: rule.metric,
            message: 'Algorithmic rule evaluation not supported in single-rule mode',
            currentValue: 0,
            timestamp: new Date().toISOString(),
        }
    }

    switch (rule.condition.type) {
        case 'threshold':
            return evaluateThresholdRule(rule, current, formula)
        case 'anomaly':
            return evaluateAnomalyRule(rule, current, history)
        case 'trend':
            return evaluateTrendRule(rule, history)
        default:
            return {
                ruleId: rule.id,
                ruleName: rule.name,
                triggered: false,
                severity: 'info',
                metric: rule.metric,
                message: 'Unknown rule type',
                currentValue: 0,
                timestamp: new Date().toISOString(),
            }
    }
}
