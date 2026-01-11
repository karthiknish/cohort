// =============================================================================
// ALERT PROCESSOR - Orchestration for workspace-level alerts
// =============================================================================

import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../convex/_generated/api'
import { evaluateAlerts, formatAlertsForEmail } from './evaluator'
import { sendTransactionalEmail } from '../notifications'
import type { AlertRule, AlertEvaluationInput, DailyMetricData } from './types'

// -----------------------------------------------------------------------------
// Convex client (lazy singleton for server-side use)
// -----------------------------------------------------------------------------
let _convexClient: ConvexHttpClient | null = null

function getConvexClient(): ConvexHttpClient | null {
    if (_convexClient) return _convexClient
    const url = process.env.CONVEX_URL ?? process.env.NEXT_PUBLIC_CONVEX_URL
    if (!url) {
        console.error('[AlertProcessor] CONVEX_URL not configured')
        return null
    }
    _convexClient = new ConvexHttpClient(url)
    return _convexClient
}

/**
 * Process all alert rules for a specific workspace/client and send notifications
 */
export async function processWorkspaceAlerts(options: {
    userId: string
    workspaceId: string
    recipientEmail?: string
}) {
    const { userId, workspaceId, recipientEmail } = options

    const convex = getConvexClient()
    if (!convex) {
        console.error('[AlertProcessor] Convex client not available')
        return { evaluated: 0, triggered: 0, results: [] }
    }

    try {
        // 1. Fetch Alert Rules for this workspace from Convex
        const rules = await convex.query(api.alertRules.listEnabled, { workspaceId }) as AlertRule[]

        if (rules.length === 0) {
            return { evaluated: 0, triggered: 0, results: [] }
        }

        // 2. Fetch Custom Formulas if needed
        const formulaRules = rules.filter(r => r.metric === 'custom_formula')
        let formulas: Record<string, { formula: string; inputs: string[] }> = {}

        if (formulaRules.length > 0) {
            formulas = await convex.query(api.customFormulas.listActiveForAlerts, { workspaceId })
        }

        // 3. Fetch Recent Metrics for evaluation
        // We need history for trend/anomaly rules
        const maxBaseline = Math.max(...rules.map(r => {
            if (r.condition.type === 'anomaly') return r.condition.baselineDays
            if (r.condition.type === 'trend') return r.condition.consecutivePeriods
            return 0
        }), 7)

        // Use workspaceId as clientId for metrics lookup (legacy pattern)
        const metricsData: DailyMetricData[] = await convex.query(api.adsMetrics.listRecentForAlerts, {
            workspaceId,
            clientId: workspaceId,
            limit: maxBaseline + 1,
        })

        if (metricsData.length === 0) {
            return { evaluated: rules.length, triggered: 0, results: [] }
        }

        const current = metricsData[metricsData.length - 1]
        const history = metricsData.slice(0, -1)

        // 4. Evaluate everything
        const input: AlertEvaluationInput = {
            current,
            history,
            providerId: 'blended'
        }

        const evaluation = evaluateAlerts(rules, input, formulas)
        const triggeredAlerts = evaluation.results.filter(r => r.triggered)

        // 5. Send Notification if triggers exist
        if (triggeredAlerts.length > 0 && recipientEmail) {
            // Check preference from Convex
            const prefResult = await convex.query(api.users.getNotificationPreferencesByEmail, {
                email: recipientEmail
            })

            const prefs = prefResult?.notificationPreferences
            const emailPref = prefs?.emailAdAlerts !== false

            if (emailPref) {
                const { subject, htmlContent } = formatAlertsForEmail(triggeredAlerts, workspaceId)

                await sendTransactionalEmail({
                    to: [{ email: recipientEmail }],
                    subject,
                    htmlContent,
                    tags: ['ad-alerts'],
                })
            } else {
                console.log(`[AlertProcessor] Skipping email notification for user ${userId} due to preference.`)
            }
        }

        return evaluation
    } catch (error) {
        console.error(`[AlertProcessor] Failed to process alerts for workspace ${workspaceId}:`, error)
        throw error
    }
}
