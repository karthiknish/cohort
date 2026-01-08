// =============================================================================
// ALERTS API - Webhook endpoints for metric alerts
// =============================================================================

import { z } from 'zod'
import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError, BadRequestError } from '@/lib/api-errors'
import {
    evaluateAlerts,
    formatAlertsForSlack,
    formatAlertsForEmail,
} from '@/lib/alerts'
import type {
    AlertRule,
    AlertEvaluationInput,
    AlertEvaluationResult,
    AlertRuleType,
    AlertSeverity,
    AlertMetric,
    AlertChannel,
    ThresholdCondition,
    AnomalyCondition,
    TrendCondition,
} from '@/lib/alerts'
import { sendTransactionalEmail } from '@/lib/notifications'
import { SLACK_WEBHOOK_URL, fetchWithTimeout } from '@/lib/notifications'

// =============================================================================
// SCHEMAS
// =============================================================================

const dailyMetricSchema = z.object({
    date: z.string(),
    spend: z.number(),
    impressions: z.number(),
    clicks: z.number(),
    conversions: z.number(),
    revenue: z.number(),
    cpc: z.number(),
    ctr: z.number(),
    roas: z.number(),
    cpa: z.number(),
})

const thresholdConditionSchema = z.object({
    type: z.literal('threshold'),
    operator: z.enum(['gt', 'lt', 'gte', 'lte', 'eq']),
    value: z.number(),
})

const anomalyConditionSchema = z.object({
    type: z.literal('anomaly'),
    deviationMultiplier: z.number().min(1),
    baselineDays: z.number().min(1).max(90),
    direction: z.enum(['above', 'below', 'both']),
})

const trendConditionSchema = z.object({
    type: z.literal('trend'),
    direction: z.enum(['increasing', 'decreasing']),
    consecutivePeriods: z.number().min(2).max(30),
    minChangePercent: z.number().optional(),
})

const conditionSchema = z.union([
    thresholdConditionSchema,
    anomalyConditionSchema,
    trendConditionSchema,
])

const alertRuleSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['threshold', 'anomaly', 'trend']),
    metric: z.enum(['spend', 'cpc', 'ctr', 'roas', 'conversions', 'cpa', 'revenue', 'impressions', 'clicks']),
    condition: conditionSchema,
    severity: z.enum(['info', 'warning', 'critical']),
    enabled: z.boolean(),
    providerId: z.string().optional(),
    campaignId: z.string().optional(),
    channels: z.array(z.enum(['email', 'slack', 'in-app'])),
    createdAt: z.string(),
    updatedAt: z.string(),
})

const evaluateRequestSchema = z.object({
    metrics: z.object({
        current: dailyMetricSchema,
        history: z.array(dailyMetricSchema),
        providerId: z.string().optional(),
        campaignId: z.string().optional(),
    }),
    rules: z.array(alertRuleSchema),
    notify: z.boolean().optional().default(true),
    recipientEmail: z.string().email().optional(),
})

// =============================================================================
// POST - Evaluate alerts and send notifications
// =============================================================================

export const POST = createApiHandler(
    {
        bodySchema: evaluateRequestSchema,
        rateLimit: 'standard',
    },
    async (req, { auth, body }) => {
        if (!auth.uid) {
            throw new UnauthorizedError('Authentication required')
        }

        const { metrics, rules, notify, recipientEmail } = body

        // Evaluate all rules
        const result: AlertEvaluationResult = evaluateAlerts(
            rules as AlertRule[],
            metrics as AlertEvaluationInput
        )

        const triggeredAlerts = result.results.filter((r) => r.triggered)

        // Send notifications if enabled and alerts triggered
        if (notify && triggeredAlerts.length > 0) {
            const notificationResults = {
                email: false,
                slack: false,
            }

            // Send Slack notification
            if (SLACK_WEBHOOK_URL) {
                try {
                    const slackMessage = formatAlertsForSlack(triggeredAlerts, metrics.providerId)
                    const slackResponse = await fetchWithTimeout(SLACK_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ text: slackMessage }),
                    })
                    notificationResults.slack = slackResponse.ok
                } catch (error) {
                    console.error('[alerts] Slack notification failed:', error)
                }
            }

            // Send email notification
            if (recipientEmail) {
                try {
                    const { subject, htmlContent } = formatAlertsForEmail(triggeredAlerts, metrics.providerId)
                    const emailResult = await sendTransactionalEmail({
                        to: [{ email: recipientEmail }],
                        subject,
                        htmlContent,
                        tags: ['ad-alerts'],
                    })
                    notificationResults.email = emailResult.success
                } catch (error) {
                    console.error('[alerts] Email notification failed:', error)
                }
            }

            return {
                ...result,
                notifications: notificationResults,
            }
        }

        return result
    }
)

// =============================================================================
// GET - Get sample alert rules (for documentation/testing)
// =============================================================================

export const GET = createApiHandler(
    {
        rateLimit: 'standard',
    },
    async (req, { auth }) => {
        if (!auth.uid) {
            throw new UnauthorizedError('Authentication required')
        }

        // Return sample alert rules for documentation
        const sampleRules: AlertRule[] = [
            {
                id: 'sample-threshold-1',
                name: 'High Spend Alert',
                description: 'Alert when daily spend exceeds $500',
                type: 'threshold' as AlertRuleType,
                metric: 'spend' as AlertMetric,
                condition: {
                    type: 'threshold',
                    operator: 'gt',
                    value: 500,
                } as ThresholdCondition,
                severity: 'warning' as AlertSeverity,
                enabled: true,
                channels: ['email', 'slack'] as AlertChannel[],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'sample-anomaly-1',
                name: 'CPC Spike Detection',
                description: 'Alert when CPC exceeds 2x the 7-day average',
                type: 'anomaly' as AlertRuleType,
                metric: 'cpc' as AlertMetric,
                condition: {
                    type: 'anomaly',
                    deviationMultiplier: 2,
                    baselineDays: 7,
                    direction: 'above',
                } as AnomalyCondition,
                severity: 'critical' as AlertSeverity,
                enabled: true,
                channels: ['email', 'slack'] as AlertChannel[],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: 'sample-trend-1',
                name: 'Revenue Decline Alert',
                description: 'Alert when revenue declines for 3 consecutive days',
                type: 'trend' as AlertRuleType,
                metric: 'revenue' as AlertMetric,
                condition: {
                    type: 'trend',
                    direction: 'decreasing',
                    consecutivePeriods: 3,
                    minChangePercent: 5,
                } as TrendCondition,
                severity: 'warning' as AlertSeverity,
                enabled: true,
                channels: ['email'] as AlertChannel[],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ]

        return {
            sampleRules,
            documentation: {
                evaluateEndpoint: 'POST /api/integrations/metrics/alerts',
                requiredFields: {
                    metrics: 'Current and historical metric data',
                    rules: 'Array of alert rules to evaluate',
                },
                optionalFields: {
                    notify: 'Whether to send notifications (default: true)',
                    recipientEmail: 'Email address for alert notifications',
                },
                supportedConditions: ['threshold', 'anomaly', 'trend'],
                supportedMetrics: ['spend', 'cpc', 'ctr', 'roas', 'conversions', 'cpa', 'revenue', 'impressions', 'clicks'],
            },
        }
    }
)
