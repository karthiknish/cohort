import { describe, expect, it } from 'vitest'

import { buildAdsSpreadsheetExport, buildTasksSpreadsheetExport } from './builders'

describe('spreadsheet export builders', () => {
  it('builds ads export tables from summarize payload', () => {
    const payload = buildAdsSpreadsheetExport({
      periodLabel: 'Last month',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      currencyCode: 'GBP',
      providerLabel: 'Meta Ads',
      totals: {
        spend: 1200,
        impressions: 50000,
        clicks: 900,
        conversions: 40,
        revenue: 3600,
        roas: 3,
        ctr: 1.8,
        cpc: 1.33,
        cpa: 30,
      },
      providerBreakdown: [
        {
          providerId: 'facebook',
          spend: 1200,
          impressions: 50000,
          clicks: 900,
          conversions: 40,
          revenue: 3600,
          roas: 3,
        },
      ],
    })

    expect(payload).not.toBeNull()
    expect(payload?.headers).toContain('Platform')
    expect(payload?.rows[0]?.[0]).toBe('Meta Ads')
    expect(payload?.filename.endsWith('.xlsx')).toBe(true)
  })

  it('builds task export rows from task digest payload', () => {
    const payload = buildTasksSpreadsheetExport({
      scopeLabel: 'Your tasks',
      timeWindowLabel: 'All open tasks',
      openTasks: 1,
      completedTasks: 0,
      overdueTasks: 0,
      tasks: [
        {
          title: 'Review Q2 plan',
          status: 'todo',
          priority: 'high',
          clientName: 'Acme',
          projectName: 'Growth',
          dueDate: null,
        },
      ],
    })

    expect(payload?.rows[0]).toEqual([
      'Review Q2 plan',
      'Todo',
      'High',
      'Acme',
      'Growth',
      'No due date',
    ])
  })
})
