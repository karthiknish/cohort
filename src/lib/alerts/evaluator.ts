// =============================================================================
// ALERT EVALUATOR - Batch evaluation of alerts
// =============================================================================

import type {
    AlertRule,
    AlertResult,
    AlertEvaluationResult,
    AlertEvaluationInput,
    AlertNotificationPayload,
} from './types'
import { evaluateRule } from './rules-engine'
import { calculateAlgorithmicInsights, enrichSummaryWithMetrics } from '../ad-algorithms'
import { adAlertsTemplate } from '../notifications/email-templates'

// =============================================================================
// BATCH EVALUATION
// =============================================================================

/**
 * Evaluate multiple rules against metric data
 */
export function evaluateAlerts(
    rules: AlertRule[],
    input: AlertEvaluationInput,
    formulas?: Record<string, { formula: string; inputs: string[] }>
): AlertEvaluationResult {
    const activeRules = rules.filter((rule) => {
        if (!rule.enabled) return false
        if (rule.type === 'algorithmic') return false // Handled separately
        // Filter by provider if specified
        if (rule.providerId && input.providerId && rule.providerId !== input.providerId) {
            return false
        }
        // Filter by campaign if specified
        if (rule.campaignId && input.campaignId && rule.campaignId !== input.campaignId) {
            return false
        }
        return true
    })

    const results: AlertResult[] = activeRules.map((rule) =>
        evaluateRule(
            rule,
            input.current,
            input.history,
            rule.formulaId && formulas ? formulas[rule.formulaId] : undefined
        )
    )

    // Add algorithmic alerts if any
    const algorithmicResults = evaluateAlgorithmicAlerts(input, rules)
    results.push(...algorithmicResults)

    const triggered = results.filter((r) => r.triggered)

    return {
        evaluated: activeRules.length + rules.filter(r => r.type === 'algorithmic' && r.enabled).length,
        triggered: triggered.length,
        results,
        evaluatedAt: new Date().toISOString(),
    }
}

/**
 * Evaluate algorithmic rules against current summary
 */
export function evaluateAlgorithmicAlerts(
    input: AlertEvaluationInput,
    rules: AlertRule[]
): AlertResult[] {
    const algorithmicRules = rules.filter(r => r.type === 'algorithmic' && r.enabled)
    if (algorithmicRules.length === 0) return []

    // Convert input to AdMetricsSummary format expected by algorithm engine
    const summary = {
        providerId: input.providerId || 'unknown',
        totalSpend: input.current.spend,
        totalRevenue: input.current.revenue,
        totalClicks: input.current.clicks,
        totalConversions: input.current.conversions,
        totalImpressions: input.current.impressions,
        averageRoaS: input.current.roas,
        averageCpc: input.current.cpc,
        period: '1d'
    }

    const enriched = enrichSummaryWithMetrics(summary)
    const insights = calculateAlgorithmicInsights(enriched)

    const results: AlertResult[] = []

    for (const rule of algorithmicRules) {
        // Find insights that match this rule's insightType configuration
        const matchingInsights = insights.filter(i =>
            (rule.insightType === 'all' || !rule.insightType || i.type === rule.insightType) &&
            (i.level === 'critical' || i.level === 'warning')
        )

        for (const insight of matchingInsights) {
            results.push({
                ruleId: rule.id,
                ruleName: rule.name,
                triggered: true,
                severity: insight.level === 'critical' ? 'critical' : 'warning',
                metric: 'spend', // Metric is less relevant for algorithmic alerts
                message: `${insight.title}: ${insight.message}`,
                currentValue: 0,
                insightType: insight.type,
                suggestion: insight.suggestion,
                timestamp: new Date().toISOString()
            })
        }
    }

    return results
}

/**
 * Get only triggered alerts from evaluation
 */
export function getTriggeredAlerts(
    rules: AlertRule[],
    input: AlertEvaluationInput
): AlertResult[] {
    const result = evaluateAlerts(rules, input)
    return result.results.filter((r) => r.triggered)
}

// =============================================================================
// NOTIFICATION HELPERS
// =============================================================================

/**
 * Convert an alert result to a notification payload
 */
export function toNotificationPayload(
    result: AlertResult,
    providerId?: string
): AlertNotificationPayload {
    return {
        ruleId: result.ruleId,
        ruleName: result.ruleName,
        severity: result.severity,
        metric: result.metric,
        message: result.message,
        currentValue: result.currentValue,
        threshold: result.threshold,
        providerId,
        triggeredAt: result.timestamp,
    }
}

/**
 * Group triggered alerts by severity for prioritized handling
 */
export function groupAlertsBySeverity(alerts: AlertResult[]): {
    critical: AlertResult[]
    warning: AlertResult[]
    info: AlertResult[]
} {
    return {
        critical: alerts.filter((a) => a.severity === 'critical'),
        warning: alerts.filter((a) => a.severity === 'warning'),
        info: alerts.filter((a) => a.severity === 'info'),
    }
}

/**
 * Format alerts for Slack notification
 */
export function formatAlertsForSlack(alerts: AlertResult[], providerId?: string): string {
    if (alerts.length === 0) return ''

    const header = `:rotating_light: *Ad Metrics Alert${providerId ? ` (${providerId})` : ''}*\n`

    const alertLines = alerts.map((alert) => {
        const emoji =
            alert.severity === 'critical' ? ':red_circle:' :
                alert.severity === 'warning' ? ':warning:' : ':information_source:'
        return `${emoji} *${alert.ruleName}*: ${alert.message}`
    })

    return header + alertLines.join('\n')
}

/**
 * Format alerts for email notification
 */
export function formatAlertsForEmail(alerts: AlertResult[], providerId?: string): {
    subject: string
    htmlContent: string
} {
    const criticalCount = alerts.filter((a) => a.severity === 'critical').length
    const warningCount = alerts.filter((a) => a.severity === 'warning').length

    const subject = criticalCount > 0
        ? `🚨 Critical Ad Alert: ${criticalCount} issue(s) detected`
        : `⚠️ Ad Metrics Alert: ${warningCount} warning(s)`

    const htmlContent = adAlertsTemplate({ alerts, providerId })

    return { subject, htmlContent }
}
