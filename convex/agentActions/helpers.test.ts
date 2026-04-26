import { afterEach, describe, expect, it } from 'vitest'

import { extractCampaignQueryFromIntent, getPeriodWindow, resolveDeterministicAgentIntent, resolveReportWindow, resolveWeakCommandClarification } from './helpers'

describe('resolveDeterministicAgentIntent', () => {
  it('maps date-range ad metric requests to summarizeAdsPerformance', () => {
    const intent = resolveDeterministicAgentIntent('Give me metrics from 2026-01-01 to 2026-01-15', {
      activeClientId: 'client_1',
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'summarizeAdsPerformance',
      params: {
        period: 'weekly',
        clientId: 'client_1',
        startDate: '2026-01-01',
        endDate: '2026-01-15',
      },
      message: undefined,
    })
  })

  it('maps active ads requests to focused snapshots', () => {
    const intent = resolveDeterministicAgentIntent('What are the active Google ads currently?', {
      activeClientId: 'client_1',
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'summarizeAdsPerformance',
      params: {
        period: 'weekly',
        providerId: 'google',
        providerIds: ['google'],
        clientId: 'client_1',
        focus: 'active',
      },
      message: 'Pulling the currently active ads and campaign snapshot now.',
    })
  })

  it('captures campaign-name filters in ads metric requests', () => {
    const intent = resolveDeterministicAgentIntent('give me ad metrics for the active leicester ad campaign in meta', {
      activeClientId: 'client_1',
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'summarizeAdsPerformance',
      params: {
        period: 'weekly',
        providerId: 'facebook',
        providerIds: ['facebook'],
        clientId: 'client_1',
        focus: 'active',
        campaignQuery: 'leicester',
      },
      message: 'Checking the leicester campaign on Meta Ads now.',
    })
  })

  it('treats direct message prompts as executable sends instead of navigation', () => {
    const intent = resolveDeterministicAgentIntent('send a chat to @Deepak saying hi to him')

    expect(intent).toEqual({
      action: 'execute',
      operation: 'sendDirectMessage',
      params: {
        recipientQuery: 'Deepak',
        content: 'hi to him',
      },
      message: 'Sending that message to Deepak now.',
    })
  })

  it('asks for missing DM content before sending', () => {
    const intent = resolveDeterministicAgentIntent('send a chat to @Deepak')

    expect(intent).toEqual({
      action: 'clarify',
      message: 'Sure — what would you like me to send to Deepak?',
    })
  })

  it('executes client task list requests instead of navigating to tasks', () => {
    const intent = resolveDeterministicAgentIntent('list all the tasks in @abc client')

    expect(intent).toEqual({
      action: 'execute',
      operation: 'summarizeClientTasks',
      params: {
        clientReference: 'abc',
        mode: 'list',
      },
      message: 'Listing the tasks for abc now.',
    })
  })

  it('executes client task summary requests instead of navigating to tasks', () => {
    const intent = resolveDeterministicAgentIntent('give me client @abc summary for tasks')

    expect(intent).toEqual({
      action: 'execute',
      operation: 'summarizeClientTasks',
      params: {
        clientReference: 'abc',
        mode: 'summary',
      },
      message: 'Pulling the task summary for abc now.',
    })
  })

  it('executes workspace-scoped my-task list without active client', () => {
    const intent = resolveDeterministicAgentIntent('list my tasks')

    expect(intent).toEqual({
      action: 'execute',
      operation: 'summarizeMyTasks',
      params: { mode: 'list' },
      message: 'Listing your tasks now.',
    })
  })

  it('executes mark-all-notifications-read phrasing', () => {
    const intent = resolveDeterministicAgentIntent('mark all notifications read')

    expect(intent).toEqual({
      action: 'execute',
      operation: 'markAllNotificationsRead',
      params: {},
      message: 'Marking your unread notifications as read now.',
    })
  })

  it('executes list workspace clients phrasing', () => {
    const intent = resolveDeterministicAgentIntent('list clients')

    expect(intent).toEqual({
      action: 'execute',
      operation: 'listWorkspaceClients',
      params: {},
      message: 'Pulling the workspace client list now.',
    })
  })

  it('maps broader campaign status phrases to updateAdsCampaignStatus', () => {
    const intent = resolveDeterministicAgentIntent('Set Google campaign cmp_123 status to paused', {
      activeClientId: 'client_1',
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'updateAdsCampaignStatus',
      params: {
        providerId: 'google',
        campaignId: 'cmp_123',
        action: 'pause',
        clientId: 'client_1',
      },
      message: 'Updating campaign cmp_123 on google.',
    })
  })

  it('routes project collaboration prompts using active project context', () => {
    const intent = resolveDeterministicAgentIntent('Open collaboration for this project', {
      activeProjectId: 'project_42',
    })

    expect(intent).toEqual({
      action: 'navigate',
      route: '/dashboard/collaboration?channelType=project&projectId=project_42',
      message: 'Opening project collaboration.',
    })
  })

  it('creates projects against the active client context', () => {
    const intent = resolveDeterministicAgentIntent('Create project Website Refresh', {
      activeClientId: 'client_123',
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'createProject',
      params: {
        name: 'Website Refresh',
        clientId: 'client_123',
      },
      message: 'Creating project Website Refresh.',
    })
  })

  it('derives a project draft label from the attached document when the message omits the name', () => {
    const intent = resolveDeterministicAgentIntent('Create project from this document', {
      activeClientId: 'client_123',
      attachmentContext: [
        {
          name: 'website-refresh.odt',
          mimeType: 'application/vnd.oasis.opendocument.text',
          sizeLabel: '24 KB',
          excerpt: 'Website Refresh kickoff brief',
          extractedText: 'Website Refresh kickoff brief with scope, timeline, and deliverables.',
          extractionStatus: 'ready',
        },
      ],
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'createProject',
      params: {
        name: 'Website Refresh',
        description: 'Website Refresh kickoff brief',
        clientId: 'client_123',
      },
      message: 'Creating project Website Refresh.',
    })
  })

  it('derives a task draft label from the attached document when the message omits the title', () => {
    const intent = resolveDeterministicAgentIntent('Create task from the attached brief', {
      attachmentContext: [
        {
          name: 'launch-plan.docx',
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          sizeLabel: '48 KB',
          excerpt: 'Launch plan with required pre-launch QA checks.',
          extractedText: 'Launch plan with required pre-launch QA checks.',
          extractionStatus: 'ready',
        },
      ],
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'createTask',
      params: {
        title: 'Launch Plan',
        description: 'Launch plan with required pre-launch QA checks.',
      },
      message: 'Creating that task now.',
    })
  })

  it('asks for the exact project change before executing a vague update', () => {
    const intent = resolveDeterministicAgentIntent('Update this project', {
      activeProjectId: 'project_42',
    })

    expect(intent).toEqual({
      action: 'clarify',
      message: 'I can update that project — what should I change: status, name, dates, client, description, or tags?',
    })
  })

  it('maps weekly analytics report requests to report execution', () => {
    const intent = resolveDeterministicAgentIntent('Generate a weekly Meta performance report', {
      activeClientId: 'client_1',
    })

    expect(intent).toEqual({
      action: 'execute',
      operation: 'generatePerformanceReport',
      params: {
        period: 'weekly',
        providerIds: ['facebook'],
        clientId: 'client_1',
      },
      message: 'Generating your weekly performance report...',
    })
  })

  it('asks conversationally for missing task details on weak task commands', () => {
    const intent = resolveDeterministicAgentIntent('create task')

    expect(intent).toEqual({
      action: 'clarify',
      message: 'Happy to do that — what should I put in the task, and should I tie it to the client, project, or proposal?',
    })
  })

  it('asks for missing campaign context instead of acting on vague ads commands', () => {
    const intent = resolveDeterministicAgentIntent('pause this campaign', {
      activeClientId: 'client_1',
    })

    expect(intent).toEqual({
      action: 'clarify',
      message: 'I can update that campaign — which campaign is it, and what platform is it on?',
    })
  })
})

describe('resolveWeakCommandClarification', () => {
  it('asks for timeframe and scope on vague metrics requests', () => {
    expect(resolveWeakCommandClarification('check metrics')).toEqual({
      action: 'clarify',
      message: 'I can pull that for you — what date range should I use, and which client or ad platform should I focus on?',
    })
  })

  it('asks for missing target on generic deictic commands', () => {
    expect(resolveWeakCommandClarification('do that')).toEqual({
      action: 'clarify',
      message: 'Happy to help — what would you like me to do, and what client, project, or proposal should I use?',
    })
  })
})

describe('extractCampaignQueryFromIntent', () => {
  it('extracts the campaign name fragment from ads requests', () => {
    expect(extractCampaignQueryFromIntent('give me ad metrics for the active leicester ad campaign in meta')).toBe('leicester')
  })

  it('routes For You, time off, and time tracking to navigate', () => {
    expect(resolveDeterministicAgentIntent('open my for you feed')).toEqual({
      action: 'navigate',
      route: '/dashboard/for-you',
      message: 'Opening For You with your personalized highlights.',
    })

    expect(resolveDeterministicAgentIntent('i need to request pto')).toEqual({
      action: 'navigate',
      route: '/dashboard/time-off',
      message: 'Opening Time off for requests and approvals.',
    })

    expect(resolveDeterministicAgentIntent('open my timesheet')).toEqual({
      action: 'navigate',
      route: '/dashboard/tasks?operations=time',
      message: 'Opening Tasks with the time tracking view.',
    })
  })
})

describe('resolveReportWindow', () => {
  const RealDate = Date
  let mockedDate: DateConstructor | null = null

  afterEach(() => {
    if (mockedDate) {
      globalThis.Date = RealDate
      mockedDate = null
    }
  })

  it('uses inclusive weekly calendar windows', () => {
    const fixedNow = new RealDate('2026-03-07T12:00:00.000Z')
    mockedDate = class extends RealDate {
      constructor(value?: string | number | Date) {
        super(value ?? fixedNow)
      }

      static override now() {
        return fixedNow.valueOf()
      }
    } as unknown as DateConstructor
    globalThis.Date = mockedDate

    expect(getPeriodWindow('weekly')).toMatchObject({
      periodLabel: 'Weekly',
      startDate: '2026-03-01',
      endDate: '2026-03-07',
    })
  })

  it('uses explicit date params over relative periods', () => {
    expect(resolveReportWindow('weekly', { startDate: '2026-02-01', endDate: '2026-02-10' })).toMatchObject({
      periodLabel: 'Custom',
      startDate: '2026-02-01',
      endDate: '2026-02-10',
      startDateMs: Date.parse('2026-02-01T00:00:00.000Z'),
      endDateMs: Date.parse('2026-02-10T23:59:59.999Z'),
    })
  })
})
