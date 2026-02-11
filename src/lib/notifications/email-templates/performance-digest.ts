import { wrapEmailTemplate } from './utils'
import { EMAIL_COLORS } from '@/lib/colors'

export interface PerformanceDigestTemplateParams {
    workspaceName: string
    period: string // e.g., "Weekly Summary (Jan 1 - Jan 7)"
    metrics: {
        spend: string
        revenue: string
        roas: string
        conversions: string
        cpa: string
    }
    topPlatforms: Array<{
        name: string
        roas: string
        spend: string
    }>
    suggestionsCount: number
}

export function performanceDigestTemplate(params: PerformanceDigestTemplateParams): string {
    const { workspaceName, period, metrics, topPlatforms, suggestionsCount } = params

    const platformItems = topPlatforms.map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid ${EMAIL_COLORS.lightBorder};">
            <div style="font-weight: 600; color: ${EMAIL_COLORS.heading};">${p.name}</div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: ${EMAIL_COLORS.success.text};">${p.roas}x ROAS</div>
                <div style="font-size: 13px; color: ${EMAIL_COLORS.subtle};">${p.spend} spend</div>
            </div>
        </div>
    `).join('')

    return wrapEmailTemplate(`
        <div style="margin-bottom: 32px;">
            <div style="font-size: 14px; font-weight: 600; color: ${EMAIL_COLORS.button.primary}; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                ${workspaceName}
            </div>
            <div style="font-size: 28px; font-weight: 800; color: ${EMAIL_COLORS.heading};">
                ${period}
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
            <div style="padding: 16px; background: ${EMAIL_COLORS.muted}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.lightBorder};">
                <div style="font-size: 13px; color: ${EMAIL_COLORS.subtle}; margin-bottom: 4px;">Total Spend</div>
                <div style="font-size: 20px; font-weight: 700; color: ${EMAIL_COLORS.heading};">${metrics.spend}</div>
            </div>
            <div style="padding: 16px; background: ${EMAIL_COLORS.success.bg}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.success.border};">
                <div style="font-size: 13px; color: ${EMAIL_COLORS.success.text}; margin-bottom: 4px;">Total Revenue</div>
                <div style="font-size: 20px; font-weight: 700; color: ${EMAIL_COLORS.success.darkText};">${metrics.revenue}</div>
            </div>
            <div style="padding: 16px; background: ${EMAIL_COLORS.info.bg}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.info.border};">
                <div style="font-size: 13px; color: ${EMAIL_COLORS.info.text}; margin-bottom: 4px;">Total ROAS</div>
                <div style="font-size: 24px; font-weight: 800; color: ${EMAIL_COLORS.info.darkText};">${metrics.roas}x</div>
            </div>
            <div style="padding: 16px; background: ${EMAIL_COLORS.muted}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.lightBorder};">
                <div style="font-size: 13px; color: ${EMAIL_COLORS.subtle}; margin-bottom: 4px;">Conversions</div>
                <div style="font-size: 20px; font-weight: 700; color: ${EMAIL_COLORS.heading};">${metrics.conversions}</div>
            </div>
        </div>

        <div style="margin-bottom: 32px;">
            <h3 style="font-size: 18px; font-weight: 700; color: ${EMAIL_COLORS.heading}; margin-bottom: 16px; border-bottom: 2px solid ${EMAIL_COLORS.lightBorder}; padding-bottom: 8px;">Top Performing Platforms</h3>
            ${platformItems}
        </div>

        ${suggestionsCount > 0 ? `
            <div style="padding: 20px; background: ${EMAIL_COLORS.warning.bg}; border-radius: 12px; border: 1px solid ${EMAIL_COLORS.warning.border}; margin-bottom: 32px; display: flex; align-items: start;">
                <span style="font-size: 24px; margin-right: 12px;">📈</span>
                <div>
                    <div style="font-weight: 700; color: ${EMAIL_COLORS.warning.darkText}; margin-bottom: 4px;">Optimization Available</div>
                    <div style="font-size: 14px; color: ${EMAIL_COLORS.warning.text};">
                        We've identified <strong>${suggestionsCount} new suggestions</strong> to improve your ad efficiency.
                    </div>
                </div>
            </div>
        ` : ''}

        <div style="text-align: center;">
            <a href="https://cohorts.app/dashboard/ads" class="button" style="background: ${EMAIL_COLORS.button.dark}; padding: 14px 40px; border-radius: 9999px;">
                Open Performance Lab
            </a>
        </div>
    `)
}
