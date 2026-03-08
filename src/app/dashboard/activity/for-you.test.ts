import { describe, expect, it } from 'vitest'

import { createDefaultProposalForm } from '@/lib/proposals'
import type { MetricRecord } from '@/types/dashboard'
import type { ProjectRecord } from '@/types/projects'
import type { ProposalDraft } from '@/types/proposals'
import type { TaskRecord } from '@/types/tasks'

import type { MeetingRecord } from '../meetings/types'
import { buildActivityHubModel } from './for-you'
import type { EnhancedActivity } from './types'

const nowMs = Date.parse('2026-03-08T12:00:00.000Z')

function makeActivity(overrides: Partial<EnhancedActivity> = {}): EnhancedActivity {
  return {
    id: 'activity-1',
    type: 'task_activity',
    timestamp: '2026-03-08T11:00:00.000Z',
    clientId: 'client-1',
    entityId: 'entity-1',
    entityName: 'Q2 campaign brief',
    description: 'Campaign brief updated',
    navigationUrl: '/dashboard/tasks?taskId=1',
    isRead: false,
    ...overrides,
  }
}

function makeTask(overrides: Partial<TaskRecord> = {}): TaskRecord {
  return {
    id: 'task-1',
    title: 'Fix attribution tracking',
    status: 'in-progress',
    priority: 'high',
    assignedTo: [],
    clientId: 'client-1',
    client: 'Acme',
    projectId: 'project-1',
    projectName: 'Launch sprint',
    dueDate: '2026-03-07T10:00:00.000Z',
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-07T10:00:00.000Z',
    ...overrides,
  }
}

function makeProject(overrides: Partial<ProjectRecord> = {}): ProjectRecord {
  return {
    id: 'project-1',
    name: 'Launch sprint',
    description: null,
    status: 'active',
    clientId: 'client-1',
    clientName: 'Acme',
    startDate: null,
    endDate: null,
    tags: [],
    ownerId: null,
    createdAt: null,
    updatedAt: null,
    taskCount: 0,
    openTaskCount: 0,
    recentActivityAt: null,
    ...overrides,
  }
}

function makeProposal(overrides: Partial<ProposalDraft> = {}): ProposalDraft {
  const formData = createDefaultProposalForm()
  formData.company.name = 'Board deck'

  return {
    id: 'proposal-1',
    status: 'ready',
    stepProgress: 100,
    formData,
    aiInsights: null,
    aiSuggestions: null,
    createdAt: null,
    updatedAt: null,
    lastAutosaveAt: null,
    clientId: 'client-1',
    clientName: 'Acme',
    presentationDeck: null,
    ...overrides,
  }
}

function makeMeeting(overrides: Partial<MeetingRecord> = {}): MeetingRecord {
  return {
    legacyId: 'meeting-1',
    providerId: 'livekit',
    title: 'Weekly sync',
    description: 'Review pacing',
    startTimeMs: Date.parse('2026-03-08T14:00:00.000Z'),
    endTimeMs: Date.parse('2026-03-08T14:30:00.000Z'),
    timezone: 'UTC',
    calendarEventId: 'gcal-1',
    status: 'scheduled',
    meetLink: null,
    roomName: 'weekly-sync',
    attendeeEmails: ['one@example.com', 'two@example.com'],
    notesSummary: null,
    transcriptText: null,
    ...overrides,
  }
}

function makeMetric(overrides: Partial<MetricRecord> = {}): MetricRecord {
  return {
    id: 'metric-1',
    providerId: 'google',
    date: '2026-03-08',
    spend: 1200,
    impressions: 1000,
    clicks: 100,
    conversions: 10,
    revenue: 3600,
    ...overrides,
  }
}

describe('buildActivityHubModel', () => {
  it('prioritizes overdue work and analytics setup issues', () => {
    const model = buildActivityHubModel({
      selectedClientName: 'Acme',
      activities: [makeActivity({ type: 'message_posted', entityName: 'Client thread' })],
      taskSummary: { total: 3, overdue: 1, dueSoon: 1, highPriority: 2 },
      tasks: [makeTask()],
      proposals: [],
      projects: [],
      meetings: [],
      metrics: [],
      integrationSummary: { failedCount: 0, pendingCount: 0, neverCount: 0, totalIntegrations: 0 },
      googleAnalyticsStatus: null,
      googleWorkspaceConnected: false,
      nowMs,
    })

    expect(model.heroSummary).toContain('1 overdue task')
    expect(model.priorityItems.map((item) => item.title)).toEqual(
      expect.arrayContaining(['Overdue tasks need attention', 'Connect Google Analytics'])
    )
  })

  it('builds feature spaces for tasks, meetings, and analytics from live data', () => {
    const model = buildActivityHubModel({
      selectedClientName: 'Acme',
      activities: [makeActivity({ isRead: true })],
      taskSummary: { total: 4, overdue: 0, dueSoon: 2, highPriority: 1 },
      tasks: [makeTask({ dueDate: '2026-03-09T09:00:00.000Z' })],
      proposals: [makeProposal()],
      projects: [makeProject(), makeProject({ id: 'project-2', status: 'on_hold' })],
      meetings: [makeMeeting({ status: 'in_progress' })],
      metrics: [makeMetric(), makeMetric({ id: 'ga-1', providerId: 'google-analytics', spend: 0, revenue: 0 })],
      integrationSummary: { failedCount: 0, pendingCount: 2, neverCount: 0, totalIntegrations: 3 },
      googleAnalyticsStatus: {
        accountId: 'property-1',
        accountName: 'GA Property',
        linkedAtMs: nowMs - 1000,
        lastSyncStatus: 'success',
        lastSyncMessage: null,
        lastSyncedAtMs: nowMs - 1000,
        lastSyncRequestedAtMs: nowMs - 1000,
      },
      googleWorkspaceConnected: true,
      nowMs,
    })

    const meetingsSpace = model.featureSpaces.find((space) => space.id === 'meetings')
    const analyticsSpace = model.featureSpaces.find((space) => space.id === 'analytics')
    const proposalsSpace = model.featureSpaces.find((space) => space.id === 'proposals')

    expect(meetingsSpace?.badge).toBe('Live')
    expect(analyticsSpace?.metric).toBe('Connected')
    expect(proposalsSpace?.secondary).toContain('0 drafting')
    expect(model.pinnedMeetingItems[0]?.badge).toBe('Live')
  })

  it('pins upcoming meetings and high-priority tasks to the top buckets', () => {
    const model = buildActivityHubModel({
      selectedClientName: 'Acme',
      activities: [],
      taskSummary: { total: 5, overdue: 0, dueSoon: 2, highPriority: 3 },
      tasks: [
        makeTask({ id: 'task-urgent', title: 'Fix launch blocker', priority: 'urgent', dueDate: '2026-03-08T15:00:00.000Z' }),
        makeTask({ id: 'task-high', title: 'Review paid search copy', priority: 'high', dueDate: '2026-03-09T15:00:00.000Z' }),
        makeTask({ id: 'task-medium', title: 'Cleanup notes', priority: 'medium', dueDate: '2026-03-08T16:00:00.000Z' }),
      ],
      proposals: [],
      projects: [],
      meetings: [
        makeMeeting({ legacyId: 'meeting-live', title: 'War room', status: 'in_progress', startTimeMs: Date.parse('2026-03-08T11:00:00.000Z') }),
        makeMeeting({ legacyId: 'meeting-next', title: 'Client catchup', status: 'scheduled', startTimeMs: Date.parse('2026-03-08T13:00:00.000Z') }),
        makeMeeting({ legacyId: 'meeting-complete', title: 'Old recap', status: 'completed', startTimeMs: Date.parse('2026-03-07T10:00:00.000Z') }),
      ],
      metrics: [],
      integrationSummary: { failedCount: 0, pendingCount: 0, neverCount: 0, totalIntegrations: 0 },
      googleAnalyticsStatus: null,
      googleWorkspaceConnected: true,
      nowMs,
    })

    expect(model.pinnedMeetingItems.map((item) => item.title)).toEqual(['War room', 'Client catchup'])
    expect(model.pinnedTaskItems.map((item) => item.title)).toEqual(['Fix launch blocker', 'Review paid search copy'])
    expect(model.spotlightTabs.find((tab) => tab.id === 'meetings')?.items.map((item) => item.title)).not.toContain('Old recap')
  })

  it('creates spotlight tabs for worked on, deadlines, and performance', () => {
    const model = buildActivityHubModel({
      selectedClientName: 'Acme',
      activities: [
        makeActivity({ id: 'a-1', entityName: 'Project Alpha', description: 'Project updated', isRead: true }),
        makeActivity({ id: 'a-2', entityName: 'Strategy thread', type: 'message_posted', description: 'New message', timestamp: '2026-03-08T11:30:00.000Z' }),
      ],
      taskSummary: { total: 1, overdue: 0, dueSoon: 1, highPriority: 1 },
      tasks: [makeTask({ dueDate: '2026-03-09T10:00:00.000Z' })],
      proposals: [makeProposal()],
      projects: [makeProject()],
      meetings: [makeMeeting()],
      metrics: [makeMetric({ providerId: 'google-analytics', spend: 0, revenue: 0 })],
      integrationSummary: { failedCount: 1, pendingCount: 0, neverCount: 0, totalIntegrations: 1 },
      googleAnalyticsStatus: {
        accountId: 'property-1',
        accountName: 'GA Property',
        linkedAtMs: nowMs - 1000,
        lastSyncStatus: 'error',
        lastSyncMessage: 'Token expired',
        lastSyncedAtMs: nowMs - 5000,
        lastSyncRequestedAtMs: nowMs - 1000,
      },
      googleWorkspaceConnected: true,
      nowMs,
    })

    const tabIds = model.spotlightTabs.map((tab) => tab.id)
    const performanceItems = model.spotlightTabs.find((tab) => tab.id === 'performance')?.items ?? []

    expect(tabIds).toEqual(['worked-on', 'unread', 'deadlines', 'meetings', 'performance'])
    expect(performanceItems.map((item) => item.title)).toEqual(
      expect.arrayContaining(['Google Analytics linked'])
    )
    expect(model.spotlightTabs.find((tab) => tab.id === 'deadlines')?.items[0]?.meta).toContain('Due tomorrow')
  })
})