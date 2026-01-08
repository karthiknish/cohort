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

// =============================================================================
// BATCH EVALUATION
// =============================================================================

/**
 * Evaluate multiple rules against metric data
 */
export function evaluateAlerts(
    rules: AlertRule[],
    input: AlertEvaluationInput
): AlertEvaluationResult {
    const activeRules = rules.filter((rule) => {
        if (!rule.enabled) return false
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
        evaluateRule(rule, input.current, input.history)
    )

    const triggered = results.filter((r) => r.triggered)

    return {
        evaluated: activeRules.length,
        triggered: triggered.length,
        results,
        evaluatedAt: new Date().toISOString(),
    }
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

    const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <h2 style="color: ${criticalCount > 0 ? '#dc2626' : '#f59e0b'};">
        Ad Metrics Alert${providerId ? ` - ${providerId}` : ''}
      </h2>
      <p>${alerts.length} alert(s) triggered:</p>
      <ul style="list-style: none; padding: 0;">
        ${alerts.map((alert) => `
          <li style="padding: 10px; margin: 5px 0; background: ${alert.severity === 'critical' ? '#fef2f2' :
            alert.severity === 'warning' ? '#fffbeb' : '#eff6ff'
        }; border-left: 4px solid ${alert.severity === 'critical' ? '#dc2626' :
            alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'
        }; border-radius: 4px;">
            <strong>${alert.ruleName}</strong><br>
            ${alert.message}
          </li>
        `).join('')}
      </ul>
      <p style="color: #6b7280; font-size: 12px;">
        Triggered at: ${new Date().toISOString()}
      </p>
    </div>
  `

    return { subject, htmlContent }
}
