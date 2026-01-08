/**
 * Performance Digest Email Template
 */

import { wrapEmailTemplate } from './utils'

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
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
            <div style="font-weight: 600; color: #111827;">${p.name}</div>
            <div style="text-align: right;">
                <div style="font-weight: 700; color: #059669;">${p.roas}x ROAS</div>
                <div style="font-size: 13px; color: #6b7280;">${p.spend} spend</div>
            </div>
        </div>
    `).join('')

    return wrapEmailTemplate(`
        <div style="margin-bottom: 32px;">
            <div style="font-size: 14px; font-weight: 600; color: #0ea5e9; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px;">
                ${workspaceName}
            </div>
            <div style="font-size: 28px; font-weight: 800; color: #111827;">
                ${period}
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px;">
            <div style="padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #f3f4f6;">
                <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Total Spend</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${metrics.spend}</div>
            </div>
            <div style="padding: 16px; background: #ecfdf5; border-radius: 12px; border: 1px solid #d1fae5;">
                <div style="font-size: 13px; color: #059669; margin-bottom: 4px;">Total Revenue</div>
                <div style="font-size: 20px; font-weight: 700; color: #065f46;">${metrics.revenue}</div>
            </div>
            <div style="padding: 16px; background: #eff6ff; border-radius: 12px; border: 1px solid #dbeafe;">
                <div style="font-size: 13px; color: #2563eb; margin-bottom: 4px;">Total ROAS</div>
                <div style="font-size: 24px; font-weight: 800; color: #1e40af;">${metrics.roas}x</div>
            </div>
            <div style="padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #f3f4f6;">
                <div style="font-size: 13px; color: #6b7280; margin-bottom: 4px;">Conversions</div>
                <div style="font-size: 20px; font-weight: 700; color: #111827;">${metrics.conversions}</div>
            </div>
        </div>

        <div style="margin-bottom: 32px;">
            <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin-bottom: 16px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">Top Performing Platforms</h3>
            ${platformItems}
        </div>

        ${suggestionsCount > 0 ? `
            <div style="padding: 20px; background: #fffbeb; border-radius: 12px; border: 1px solid #fef3c7; margin-bottom: 32px; display: flex; align-items: start;">
                <span style="font-size: 24px; margin-right: 12px;">📈</span>
                <div>
                    <div style="font-weight: 700; color: #92400e; margin-bottom: 4px;">Optimization Available</div>
                    <div style="font-size: 14px; color: #b45309;">
                        We've identified <strong>${suggestionsCount} new suggestions</strong> to improve your ad efficiency.
                    </div>
                </div>
            </div>
        ` : ''}

        <div style="text-align: center;">
            <a href="https://cohorts.app/dashboard/ads" class="button" style="background: #111827; padding: 14px 40px; border-radius: 9999px;">
                Open Performance Lab
            </a>
        </div>
    `)
}
