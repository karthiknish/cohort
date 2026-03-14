import { describe, expect, it } from 'vitest'

import { buildAgentDataSections } from './agent-message-data'

describe('buildAgentDataSections', () => {
  it('extracts snapshot metrics and campaign lists', () => {
    const sections = buildAgentDataSections('summarizeAdsPerformance', {
      periodLabel: 'Custom',
      startDate: '2026-01-01',
      endDate: '2026-01-15',
      comparison: {
        previousWindow: { startDate: '2025-12-17', endDate: '2025-12-31' },
        deltaPercent: { spend: -12.5, revenue: 8.2, roas: 5.1, impressions: 2.3, clicks: 4.4, ctr: 1.1, conversions: 15 },
      },
      providerLabel: 'Google Ads',
      campaignCounts: { total: 8, active: 5, paused: 3 },
      totals: { spend: 1234.5, revenue: 4567.89, roas: 3.7, impressions: 12000, clicks: 543, ctr: 4.52, conversions: 23 },
      providerBreakdown: [{ providerId: 'google', label: 'Google Ads', totals: { spend: 1234.5, roas: 3.7, conversions: 23 }, deltaPercent: { roas: 5.1 } }],
      activeCampaigns: [{ name: 'Prospecting', providerId: 'google', route: '/dashboard/ads/campaigns/google/cmp_1?startDate=2026-01-01&endDate=2026-01-15' }],
      topCampaigns: [{ name: 'Brand Search', spend: 345.67, roas: 5.2, conversions: 9, route: '/dashboard/ads/campaigns/google/cmp_2?startDate=2026-01-01&endDate=2026-01-15' }],
    })

    expect(sections.map((section) => section.title)).toEqual(['Overview', 'Performance', 'Platform Breakdown', 'Active Campaigns', 'Top Campaigns'])
  })

  it('extracts report highlights from report payloads', () => {
    const sections = buildAgentDataSections('generatePerformanceReport', {
      periodLabel: 'Weekly',
      startDate: '2026-02-01',
      endDate: '2026-02-07',
      comparison: { deltaPercent: { spend: -3.4, revenue: 10.2, roas: 14.7, impressions: 6.3, clicks: 5.1, ctr: -1.2, conversions: 8.3 } },
      providerBreakdown: [{ providerId: 'facebook', label: 'Meta Ads', totals: { spend: 500, roas: 3, conversions: 12 }, deltaPercent: { revenue: 12.5 } }],
      metricsSummary: { totals: { spend: 500, revenue: 1500, roas: 3, impressions: 10000, clicks: 250, ctr: 2.5, conversions: 12 } },
      proposalSummary: { totalSubmitted: 4, aiSuccessRate: 87.5 },
      delivery: { inApp: true },
    })

    expect(sections.map((section) => section.title)).toEqual(['Overview', 'Performance', 'Platform Breakdown', 'Report Highlights'])
  })

  it('marks no-data reports accurately', () => {
    const sections = buildAgentDataSections('generatePerformanceReport', {
      periodLabel: 'Weekly',
      startDate: '2026-02-01',
      endDate: '2026-02-07',
      metricsAvailable: false,
      metricsSummary: { count: 0, totals: { spend: 0, revenue: 0, roas: 0, impressions: 0, clicks: 0, ctr: 0, conversions: 0 } },
      proposalSummary: { totalSubmitted: 1, aiSuccessRate: 100 },
      delivery: { inApp: true },
    })

    expect(sections.map((section) => section.title)).toEqual(['Overview', 'Report Highlights'])
    expect(sections[0]).toMatchObject({
      title: 'Overview',
      items: expect.arrayContaining([{ label: 'Ads Data', value: 'No synced metrics in this window' }]),
    })
    expect(sections[1]).toMatchObject({
      title: 'Report Highlights',
      items: expect.arrayContaining([{ label: 'Ads Data', value: 'Awaiting synced metrics' }]),
    })
  })

  it('falls back to useful entity details for task creation payloads', () => {
    const sections = buildAgentDataSections('createTask', {
      title: 'Review Q1 metrics',
      taskId: 'task_123',
      route: '/dashboard/tasks',
    })

    expect(sections).toEqual([
      {
        type: 'metrics',
        title: 'Details',
        items: [
          { label: 'Title', value: 'Review Q1 metrics' },
          { label: 'Task ID', value: 'task_123' },
        ],
      },
    ])
  })

  it('shows campaign-specific filters and matching campaign titles', () => {
    const sections = buildAgentDataSections('summarizeAdsPerformance', {
      periodLabel: 'Weekly',
      startDate: '2026-02-28',
      endDate: '2026-03-07',
      providerLabel: 'Meta Ads',
      campaignQuery: 'leicester',
      matchedCampaignCount: 1,
      activeCampaigns: [{ name: 'Leicester traffic light – Copy', providerId: 'facebook', route: '/dashboard/ads/campaigns/facebook/1?startDate=2026-02-28&endDate=2026-03-07' }],
    })

    expect(sections.map((section) => section.title)).toEqual(['Overview', 'Matching Campaigns'])
    expect(sections[0]).toMatchObject({
      type: 'metrics',
      title: 'Overview',
      items: expect.arrayContaining([
        { label: 'Campaign Filter', value: 'leicester' },
        { label: 'Matches', value: '1' },
      ]),
    })
  })

  it('shows recipient details for direct message sends', () => {
    const sections = buildAgentDataSections('sendDirectMessage', {
      recipientName: 'Deepak',
      preview: 'hi to him',
      route: '/dashboard/collaboration',
    })

    expect(sections).toEqual([
      {
        type: 'metrics',
        title: 'Details',
        items: [
          { label: 'Recipient', value: 'Deepak' },
          { label: 'Message', value: 'hi to him' },
        ],
      },
    ])
  })

  it('shows project details and updated fields for project actions', () => {
    const sections = buildAgentDataSections('updateProject', {
      projectId: 'project_42',
      name: 'Website Refresh',
      clientName: 'Client Forty Two',
      status: 'active',
      tags: ['seo', 'launch'],
      updatedFields: ['status', 'tags'],
    })

    expect(sections.map((section) => section.title)).toEqual(['Project Details', 'Updated Fields'])
    expect(sections[0]).toMatchObject({
      type: 'metrics',
      title: 'Project Details',
      items: expect.arrayContaining([
        { label: 'Project', value: 'Website Refresh' },
        { label: 'Client', value: 'Client Forty Two' },
        { label: 'Status', value: 'Active' },
      ]),
    })
    expect(sections[1]).toMatchObject({
      type: 'list',
      title: 'Updated Fields',
      items: [{ primary: 'Status' }, { primary: 'Tags' }],
    })
  })

  it('shows task summary sections for client task summaries', () => {
    const sections = buildAgentDataSections('summarizeClientTasks', {
      clientName: 'ABC Client',
      totalTasks: 4,
      openTasks: 3,
      completedTasks: 1,
      overdueTasks: 1,
      dueSoonTasks: 2,
      highPriorityTasks: 1,
      statusBreakdown: [
        { status: 'todo', count: 2 },
        { status: 'completed', count: 1 },
      ],
      tasks: [
        { title: 'Review homepage copy', status: 'To Do', priority: 'High', dueDate: '2026-03-08', assignedTo: ['Deepak'] },
      ],
    })

    expect(sections.map((section) => section.title)).toEqual(['Task Summary', 'Status Breakdown', 'Tasks'])
    expect(sections[0]).toMatchObject({
      type: 'metrics',
      title: 'Task Summary',
      items: expect.arrayContaining([
        { label: 'Client', value: 'ABC Client' },
        { label: 'Total Tasks', value: '4' },
      ]),
    })
  })
})