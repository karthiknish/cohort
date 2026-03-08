import { wrapEmailTemplate } from './utils'
import { EMAIL_COLORS, SEMANTIC_COLORS } from '@/lib/colors'
import type { AlertResult } from '../../alerts/types'

export interface AdAlertsTemplateParams {
    alerts: AlertResult[]
    providerId?: string
}

export function adAlertsTemplate(params: AdAlertsTemplateParams): string {
    const { alerts, providerId } = params

    const criticalCount = alerts.filter((a) => a.severity === 'critical').length

    const alertItems = alerts.map((alert) => {
        const severityColor = alert.severity === 'critical' ? EMAIL_COLORS.error.text : alert.severity === 'warning' ? EMAIL_COLORS.warning.text : EMAIL_COLORS.info.text
        const severityBg = alert.severity === 'critical' ? EMAIL_COLORS.error.bg : alert.severity === 'warning' ? EMAIL_COLORS.warning.bg : EMAIL_COLORS.info.bg
        const severityBorder = alert.severity === 'critical' ? EMAIL_COLORS.error.border : alert.severity === 'warning' ? EMAIL_COLORS.warning.border : EMAIL_COLORS.info.border

        return `
            <div style="padding: 20px; margin: 16px 0; background: ${severityBg}; border-left: 4px solid ${severityBorder}; border-radius: 8px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="font-weight: 700; color: ${severityColor}; text-transform: uppercase; font-size: 12px; letter-spacing: 0.05em;">
                        ${alert.severity} ${alert.metric !== 'spend' ? `• ${alert.metric.toUpperCase()}` : ''}
                    </span>
                </div>
                <div style="font-size: 18px; font-weight: 600; color: ${EMAIL_COLORS.heading}; margin-bottom: 4px;">
                    ${alert.ruleName}
                </div>
                <div style="font-size: 15px; color: ${EMAIL_COLORS.body}; line-height: 1.5;">
                    ${alert.message}
                </div>
                ${alert.suggestion ? `
                    <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.05);">
                        <div style="display: flex; align-items: start;">
                            <span style="margin-right: 8px;">💡</span>
                            <div style="font-size: 14px; color: ${EMAIL_COLORS.body}; font-style: italic;">
                                <strong>Suggestion:</strong> ${alert.suggestion}
                            </div>
                        </div>
                    </div>
                ` : ''}
            </div>
        `
    }).join('')

    const headerTitle = criticalCount > 0
        ? `<span style="color: ${EMAIL_COLORS.error.text};">🚨 Critical Ad Alert</span>`
        : `<span style="color: ${EMAIL_COLORS.warning.text};">⚠️ Ad Metrics Alert</span>`

    return wrapEmailTemplate(`
        <div style="margin-bottom: 24px;">
            <div style="font-size: 28px; font-weight: 800; color: ${EMAIL_COLORS.heading}; margin-bottom: 8px;">
                ${headerTitle}
            </div>
            <div style="font-size: 16px; color: ${EMAIL_COLORS.subtle};">
                ${providerId ? `Source: <strong>${providerId}</strong> • ` : ''}Detected ${alerts.length} issue${alerts.length === 1 ? '' : 's'} requiring your attention.
            </div>
        </div>

        <div class="content">
            ${alertItems}
        </div>

        <div style="margin-top: 32px; padding: 20px; background: ${EMAIL_COLORS.muted}; border-radius: 12px; text-align: center;">
            <div style="font-size: 14px; color: ${EMAIL_COLORS.body}; margin-bottom: 16px;">
                View your performance dashboard for detailed analysis and real-time metrics.
            </div>
            <a href="https://cohorts.app/dashboard/ads" class="button" style="margin-top: 0;">
                View Dashboard
            </a>
        </div>

        <div class="meta" style="text-align: center; margin-top: 24px;">
            Triggered at ${new Date().toLocaleString()} (UTC)
        </div>
    `)
}
