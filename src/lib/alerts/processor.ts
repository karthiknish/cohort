// =============================================================================
// ALERT PROCESSOR - Orchestration for workspace-level alerts
// =============================================================================

import { adminDb } from '@/lib/firebase-admin'
import { evaluateAlerts, formatAlertsForEmail } from './evaluator'
import { sendTransactionalEmail } from '../notifications'
import type { AlertRule, AlertEvaluationInput, DailyMetricData } from './types'

/**
 * Process all alert rules for a specific workspace/client and send notifications
 */
export async function processWorkspaceAlerts(options: {
    userId: string
    workspaceId: string
    recipientEmail?: string
}) {
    const { userId, workspaceId, recipientEmail } = options

    try {
        // 1. Fetch Alert Rules for this workspace
        const rulesSnapshot = await adminDb
            .collection('workspaces')
            .doc(workspaceId)
            .collection('alertRules')
            .where('enabled', '==', true)
            .get()

        const rules = rulesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as AlertRule))

        if (rules.length === 0) {
            return { evaluated: 0, triggered: 0, results: [] }
        }

        // 2. Fetch Custom Formulas if needed
        const formulaRules = rules.filter(r => r.metric === 'custom_formula')
        const formulas: Record<string, { formula: string; inputs: string[] }> = {}

        if (formulaRules.length > 0) {
            const formulasSnapshot = await adminDb
                .collection('workspaces')
                .doc(workspaceId)
                .collection('customFormulas')
                .where('isActive', '==', true)
                .get()

            formulasSnapshot.docs.forEach(doc => {
                const data = doc.data()
                formulas[doc.id] = {
                    formula: data.formula,
                    inputs: data.inputs || []
                }
            })
        }

        // 3. Fetch Recent Metrics for evaluation
        // We need history for trend/anomaly rules
        const maxBaseline = Math.max(...rules.map(r => {
            if (r.condition.type === 'anomaly') return r.condition.baselineDays
            if (r.condition.type === 'trend') return r.condition.consecutivePeriods
            return 0
        }), 7)

        const metricsSnapshot = await adminDb
            .collection('users')
            .doc(userId)
            .collection('adMetrics')
            .where('clientId', '==', workspaceId)
            .orderBy('date', 'desc')
            .limit(maxBaseline + 1)
            .get()

        if (metricsSnapshot.empty) {
            return { evaluated: rules.length, triggered: 0, results: [] }
        }

        const metricsData: DailyMetricData[] = metricsSnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                date: data.date,
                spend: Number(data.spend || 0),
                impressions: Number(data.impressions || 0),
                clicks: Number(data.clicks || 0),
                conversions: Number(data.conversions || 0),
                revenue: Number(data.revenue || 0),
                cpc: Number(data.cpc || 0),
                ctr: Number(data.ctr || 0),
                roas: Number(data.roas || 0),
                cpa: Number(data.cpa || 0)
            }
        }).reverse() // Chronological order

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
            // Check preference
            const userDoc = await adminDb.collection('users').doc(userId).get()
            const userData = userDoc.data()
            const emailPref = userData?.notificationPreferences?.email?.adAlerts !== false

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
