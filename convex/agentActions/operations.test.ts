import { describe, expect, it, vi } from 'vitest'

import { safeExecuteOperation } from './operations'

describe('safeExecuteOperation', () => {
  it('sends a direct message when the recipient resolves cleanly', async () => {
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({ role: 'admin' })
      .mockResolvedValueOnce([
        { id: 'user_deepak', name: 'Deepak', email: 'deepak@example.com', role: 'member' },
      ])

    const runMutation = vi
      .fn()
      .mockResolvedValueOnce({ legacyId: 'dm_conv_1' })
      .mockResolvedValueOnce({ legacyId: 'dm_msg_1' })

    const result = await safeExecuteOperation(
      { runQuery, runMutation } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'sendDirectMessage',
        params: {
          recipientQuery: 'Deepak',
          content: 'hi to him',
        },
        rawMessage: 'send a chat to @Deepak saying hi to him',
      },
    )

    expect(result).toMatchObject({
      success: true,
      route: '/dashboard/collaboration',
      userMessage: 'Sent your message to Deepak: “hi to him”',
      data: {
        recipientName: 'Deepak',
        recipientId: 'user_deepak',
        conversationLegacyId: 'dm_conv_1',
        messageLegacyId: 'dm_msg_1',
        preview: 'hi to him',
      },
    })

    expect(runQuery).toHaveBeenCalledTimes(2)
    expect(runMutation).toHaveBeenCalledTimes(2)
  })

  it('builds a client task summary from a client reference', async () => {
    const nowMs = Date.now()
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({
        legacyId: 'abc',
        name: 'ABC Client',
      })
      .mockResolvedValueOnce({
        items: [
          {
            legacyId: 'task_1',
            title: 'Review homepage copy',
            status: 'todo',
            priority: 'high',
            assignedTo: ['Deepak'],
            client: 'ABC Client',
            clientId: 'abc',
            projectId: null,
            projectName: null,
            dueDateMs: nowMs + 86_400_000,
            attachments: [],
            createdAtMs: nowMs,
            updatedAtMs: nowMs,
            deletedAtMs: null,
          },
          {
            legacyId: 'task_2',
            title: 'Ship landing page tweaks',
            status: 'completed',
            priority: 'medium',
            assignedTo: [],
            client: 'ABC Client',
            clientId: 'abc',
            projectId: null,
            projectName: null,
            dueDateMs: null,
            attachments: [],
            createdAtMs: nowMs,
            updatedAtMs: nowMs,
            deletedAtMs: null,
          },
        ],
      })

    const result = await safeExecuteOperation(
      { runQuery, runMutation: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'summarizeClientTasks',
        params: {
          clientReference: 'abc',
          mode: 'summary',
        },
        rawMessage: 'give me client @abc summary for tasks',
      },
    )

    expect(result).toMatchObject({
      success: true,
      userMessage: 'Here’s the task summary for ABC Client: 1 open, 1 completed, 0 overdue.',
      data: {
        clientId: 'abc',
        clientName: 'ABC Client',
        totalTasks: 2,
        openTasks: 1,
        completedTasks: 1,
        overdueTasks: 0,
        dueSoonTasks: 1,
        highPriorityTasks: 1,
      },
    })

    expect(runQuery).toHaveBeenNthCalledWith(1, expect.anything(), {
      workspaceId: 'ws_1',
      legacyId: 'abc',
    })
    expect(runQuery).toHaveBeenNthCalledWith(2, expect.anything(), {
      workspaceId: 'ws_1',
      clientId: 'abc',
      limit: 200,
    })
  })

  it('uses the matched client workspace when the visible client belongs to another workspace', async () => {
    const runQuery = vi
      .fn()
      .mockRejectedValueOnce(new Error('not found in current workspace'))
      .mockResolvedValueOnce({
        items: [{ legacyId: 'abc', name: 'ABC Client', workspaceId: 'ws_2' }],
      })
      .mockResolvedValueOnce({ items: [] })

    const result = await safeExecuteOperation(
      { runQuery, runMutation: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'summarizeClientTasks',
        params: {
          clientReference: 'abc',
          mode: 'list',
        },
        rawMessage: 'list all the tasks in @abc client',
      },
    )

    expect(result).toMatchObject({
      success: true,
      userMessage: 'I couldn’t find any tasks for ABC Client.',
      data: {
        clientId: 'abc',
        clientName: 'ABC Client',
        totalTasks: 0,
      },
    })

    expect(runQuery).toHaveBeenNthCalledWith(2, expect.anything(), {
      workspaceId: 'ws_1',
      limit: 500,
      includeAllWorkspaces: true,
    })
    expect(runQuery).toHaveBeenNthCalledWith(3, expect.anything(), {
      workspaceId: 'ws_2',
      clientId: 'abc',
      limit: 200,
    })
  })

  it('uses active client context ids without requiring client list lookup', async () => {
    const runQuery = vi
      .fn()
      .mockResolvedValueOnce({ legacyId: 'client_42', name: 'Client Forty Two' })
      .mockResolvedValueOnce({ items: [] })

    const result = await safeExecuteOperation(
      { runQuery, runMutation: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'summarizeClientTasks',
        params: {
          mode: 'list',
        },
        context: {
          activeClientId: 'client_42',
        },
        rawMessage: 'show my tasks',
      },
    )

    expect(result).toMatchObject({
      success: true,
      userMessage: 'I couldn’t find any tasks for Client Forty Two.',
      data: {
        clientId: 'client_42',
        clientName: 'Client Forty Two',
        totalTasks: 0,
      },
    })

    expect(runQuery).toHaveBeenCalledTimes(2)
    expect(runQuery).toHaveBeenNthCalledWith(1, expect.anything(), {
      workspaceId: 'ws_1',
      legacyId: 'client_42',
    })
  })

  it('creates projects from active client context and returns a project route', async () => {
    const runQuery = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({ legacyId: 'client_42', name: 'Client Forty Two' })
    const runMutation = vi.fn().mockResolvedValueOnce('project_42')

    const result = await safeExecuteOperation(
      { runQuery, runMutation } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'createProject',
        params: {
          name: 'Website Refresh',
          tags: ['seo', 'launch'],
        },
        context: {
          activeClientId: 'client_42',
        },
      },
    )

    expect(result).toMatchObject({
      success: true,
      route: '/dashboard/projects?projectId=project_42&projectName=Website+Refresh',
      data: {
        projectId: 'project_42',
        name: 'Website Refresh',
        clientId: 'client_42',
        clientName: 'Client Forty Two',
        status: 'planning',
        tags: ['seo', 'launch'],
      },
      userMessage: 'Created project Website Refresh.',
    })
  })

  it('assigns a created project to a mentioned workspace member', async () => {
    const runQuery = vi.fn()
      .mockResolvedValueOnce([
        { id: 'user_deepak', name: 'Deepak', email: 'deepak@example.com', role: 'member' },
      ])
      .mockResolvedValueOnce({ legacyId: 'client_42', name: 'Client Forty Two' })
    const runMutation = vi.fn().mockResolvedValueOnce('project_99')

    const result = await safeExecuteOperation(
      { runQuery, runMutation } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'createProject',
        params: {
          name: 'Website Refresh',
          description: 'Owner: Deepak',
        },
        context: {
          activeClientId: 'client_42',
        },
        rawMessage: 'create project Website Refresh and assign to Deepak',
      },
    )

    expect(runMutation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      ownerId: 'user_deepak',
    }))

    expect(result).toMatchObject({
      success: true,
      data: {
        ownerId: 'user_deepak',
        ownerName: 'Deepak',
      },
    })
  })

  it('asks for a client before creating a project when client context is missing', async () => {
    const result = await safeExecuteOperation(
      { runQuery: vi.fn(), runMutation: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'createProject',
        params: {
          name: 'Website Refresh',
        },
      },
    )

    expect(result).toMatchObject({
      success: false,
      retryable: false,
      userMessage: 'Which client should I attach this project to?',
      data: {
        error: 'Client context is unclear.',
      },
    })
  })

  it('asks for a clearer client before creating a task when the client name is ambiguous', async () => {
    const runQuery = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        items: [
          { legacyId: 'client_1', name: 'Acme Labs' },
          { legacyId: 'client_2', name: 'Acme Ventures' },
        ],
      })

    const result = await safeExecuteOperation(
      { runQuery, runMutation: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'createTask',
        params: {
          title: 'Review launch brief',
          clientName: 'Acme',
        },
      },
    )

    expect(result).toMatchObject({
      success: false,
      retryable: false,
      userMessage: 'I’m not sure which client you mean for this task. I found: Acme Labs, Acme Ventures. Which client should I use?',
      data: {
        error: 'Client context is unclear.',
        suggestions: ['Acme Labs', 'Acme Ventures'],
      },
    })
  })

  it('creates tasks from active project context and returns a project task route', async () => {
    const runQuery = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce({
        legacyId: 'project_42',
        name: 'Website Refresh',
        clientId: 'client_42',
        clientName: 'Client Forty Two',
      })
    const runMutation = vi.fn().mockResolvedValueOnce('task_42')

    const result = await safeExecuteOperation(
      { runQuery, runMutation } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'createTask',
        params: {
          title: 'Review homepage revisions',
        },
        context: {
          activeProjectId: 'project_42',
        },
      },
    )

    expect(runMutation).toHaveBeenCalledWith(expect.anything(), {
      workspaceId: 'ws_1',
      title: 'Review homepage revisions',
      description: null,
      status: 'todo',
      priority: 'medium',
      assignedTo: [],
      clientId: 'client_42',
      client: 'Client Forty Two',
      projectId: 'project_42',
      projectName: 'Website Refresh',
      dueDateMs: null,
    })

    expect(result).toMatchObject({
      success: true,
      route: '/dashboard/tasks?projectId=project_42&projectName=Website+Refresh&clientId=client_42&clientName=Client+Forty+Two',
      data: {
        taskId: 'task_42',
        title: 'Review homepage revisions',
        clientId: 'client_42',
        clientName: 'Client Forty Two',
        projectId: 'project_42',
        projectName: 'Website Refresh',
      },
      userMessage: 'Created task “Review homepage revisions” (task_42).',
    })
  })

  it('assigns a created task to a mentioned workspace member', async () => {
    const runQuery = vi.fn()
      .mockResolvedValueOnce([
        { id: 'user_deepak', name: 'Deepak', email: 'deepak@example.com', role: 'member' },
      ])
      .mockResolvedValueOnce({
        legacyId: 'project_42',
        name: 'Website Refresh',
        clientId: 'client_42',
        clientName: 'Client Forty Two',
      })
    const runMutation = vi.fn().mockResolvedValueOnce('task_77')

    const result = await safeExecuteOperation(
      { runQuery, runMutation } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'createTask',
        params: {
          title: 'Review homepage revisions',
          description: 'Assigned to Deepak',
        },
        context: {
          activeProjectId: 'project_42',
        },
        rawMessage: 'create task Review homepage revisions and assign it to Deepak',
      },
    )

    expect(runMutation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      assignedTo: ['Deepak'],
    }))

    expect(result).toMatchObject({
      success: true,
      data: {
        taskId: 'task_77',
      },
    })
  })

  it('asks for a clearer assignee when the mentioned user is ambiguous', async () => {
    const runQuery = vi.fn().mockResolvedValueOnce([
      { id: 'user_sam_1', name: 'Sam Chen' },
      { id: 'user_sam_2', name: 'Samir Patel' },
    ])

    const result = await safeExecuteOperation(
      { runQuery, runMutation: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'createTask',
        params: {
          title: 'Review launch brief',
        },
        rawMessage: 'create task Review launch brief and assign to Sam',
      },
    )

    expect(result).toMatchObject({
      success: false,
      retryable: false,
      userMessage: 'I found multiple workspace members matching “Sam”: Sam Chen, Samir Patel. Who should I assign this task to?',
      data: {
        error: 'Assignee is unclear.',
        suggestions: ['Sam Chen', 'Samir Patel'],
      },
    })
  })

  it('updates the active project context when no project id param is provided', async () => {
    const runQuery = vi.fn().mockResolvedValueOnce({
      legacyId: 'project_42',
      name: 'Website Refresh',
      clientName: 'Client Forty Two',
      status: 'active',
      tags: ['seo'],
    })
    const runMutation = vi.fn().mockResolvedValueOnce('project_42')

    const result = await safeExecuteOperation(
      { runQuery, runMutation } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'updateProject',
        params: {
          status: 'active',
        },
        context: {
          activeProjectId: 'project_42',
        },
      },
    )

    expect(result).toMatchObject({
      success: true,
      route: '/dashboard/projects?projectId=project_42&projectName=Website+Refresh',
      data: {
        projectId: 'project_42',
        name: 'Website Refresh',
        clientName: 'Client Forty Two',
        status: 'active',
        updatedFields: ['status'],
      },
      userMessage: 'Project updated successfully.',
    })
  })

  it('returns analytics routes for report execution', async () => {
    const runQuery = vi.fn()
      .mockResolvedValueOnce({
        summary: { count: 1, totals: { spend: 100, revenue: 300, roas: 3, impressions: 1000, clicks: 25, ctr: 2.5, conversions: 4 }, providers: {} },
      })
      .mockResolvedValueOnce({
        summary: { totals: { spend: 80, revenue: 200, roas: 2.5, impressions: 900, clicks: 20, ctr: 2.2, conversions: 3 }, providers: {} },
      })
      .mockResolvedValueOnce({ totalSubmitted: 2, aiSuccessRate: 50 })

    const result = await safeExecuteOperation(
      { runQuery, runMutation: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'generatePerformanceReport',
        params: {
          period: 'weekly',
          clientId: 'client_42',
        },
      },
    )

    expect(result.success).toBe(true)
    expect(result.route).toBe('/dashboard/analytics')
  })

  it('starts a conversational proposal draft and asks for the next field', async () => {
    const runQuery = vi.fn().mockResolvedValueOnce({ items: [] })
    const runMutation = vi.fn().mockResolvedValueOnce({ legacyId: 'proposal_42' })

    const result = await safeExecuteOperation(
      { runQuery, runMutation, runAction: vi.fn() } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'advanceProposalConversation',
        params: {},
        rawMessage: 'make a proposal for Acme Health',
      },
    )

    expect(result).toMatchObject({
      success: true,
      data: {
        proposalId: 'proposal_42',
        clientName: 'Acme Health',
        stage: 'collecting',
        nextPromptId: 'industry',
      },
      userMessage: 'Let’s build it. Great — what industry or sector should I use?',
    })
  })

  it('finishes the conversational proposal flow and returns a deck route', async () => {
    const runQuery = vi.fn().mockResolvedValueOnce({
      items: [
        {
          legacyId: 'proposal_42',
          agentConversationId: 'agent_conv_1',
          clientName: 'Acme Health',
          formData: {
            company: { name: 'Acme Health', industry: 'Healthcare' },
            marketing: { budget: '£5,000/month' },
            goals: { objectives: ['Lead Generation'] },
            scope: { services: ['SEO'] },
            timelines: { startTime: 'ASAP' },
            value: {
              proposalSize: '£5,000 – £10,000',
              engagementType: 'Ongoing monthly support',
            },
          },
          lastAgentInteractionAtMs: 10,
        },
      ],
    })
    const runMutation = vi.fn().mockResolvedValueOnce('proposal_42').mockResolvedValueOnce('proposal_42')
    const runAction = vi.fn().mockResolvedValueOnce({ status: 'ready' })

    const result = await safeExecuteOperation(
      { runQuery, runMutation, runAction } as never,
      {
        workspaceId: 'ws_1',
        userId: 'user_1',
        conversationId: 'agent_conv_1',
        operation: 'advanceProposalConversation',
        params: { promptId: 'additionalNotes' },
        rawMessage: 'skip',
      },
    )

    expect(result).toMatchObject({
      success: true,
      route: '/dashboard/proposals/proposal_42/deck',
      data: {
        proposalId: 'proposal_42',
        status: 'ready',
        route: '/dashboard/proposals/proposal_42/deck',
      },
      userMessage: 'Your proposal proposal_42 is ready. You can open it here.',
    })
  })
})
