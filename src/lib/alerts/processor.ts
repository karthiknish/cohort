// =============================================================================
// ALERT PROCESSOR - Orchestration for workspace-level alerts
// =============================================================================

import { cache } from 'react'
import { ConvexHttpClient } from 'convex/browser'
import { api, internal } from '../../../convex/_generated/api'
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
    const deployKey = process.env.CONVEX_DEPLOY_KEY ?? process.env.CONVEX_ADMIN_KEY ?? process.env.CONVEX_ADMIN_TOKEN
    if (!url || !deployKey) {
        console.error('[AlertProcessor] CONVEX_URL or admin key not configured')
        return null
    }
    _convexClient = new ConvexHttpClient(url)
    ;(_convexClient as any).setAdminAuth(deployKey, {
        issuer: 'system',
        subject: 'alert-processor',
    })
    return _convexClient
}

const fetchAlertRules = cache(async (convex: ConvexHttpClient, workspaceId: string) => {
    return await convex.query(api.alertRules.listEnabled, { workspaceId }) as AlertRule[]
})

const fetchCustomFormulas = cache(async (convex: ConvexHttpClient, workspaceId: string) => {
    return await convex.query(api.customFormulas.listActiveForAlerts, { workspaceId })
})

const fetchRecentMetrics = cache(async (convex: ConvexHttpClient, workspaceId: string, limit: number) => {
    return await convex.query(api.adsMetrics.listRecentForAlerts, {
        workspaceId,
        clientId: workspaceId,
        limit,
    }) as DailyMetricData[]
})

const fetchNotificationPreferences = cache(async (convex: ConvexHttpClient, email: string) => {
    return await convex.query(internal.users.getNotificationPreferencesByEmail as any, { email })
})

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
        const rules = await fetchAlertRules(convex, workspaceId)

        if (rules.length === 0) {
            return { evaluated: 0, triggered: 0, results: [] }
        }

        // 2. Fetch Custom Formulas if needed
        const formulaRules = rules.filter(r => r.metric === 'custom_formula')
        let formulas: Record<string, { formula: string; inputs: string[] }> = {}

        if (formulaRules.length > 0) {
            formulas = await fetchCustomFormulas(convex, workspaceId)
        }

        // 3. Fetch Recent Metrics for evaluation
        // We need history for trend/anomaly rules
        const maxBaseline = Math.max(...rules.map(r => {
            if (r.condition.type === 'anomaly') return r.condition.baselineDays
            if (r.condition.type === 'trend') return r.condition.consecutivePeriods
            return 0
        }), 7)

        // Use workspaceId as clientId for metrics lookup (legacy pattern)
        const metricsData = await fetchRecentMetrics(convex, workspaceId, maxBaseline + 1)

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
            const prefResult = await fetchNotificationPreferences(convex, recipientEmail)

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
