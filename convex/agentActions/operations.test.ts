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
            tags: [],
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
            tags: [],
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
})