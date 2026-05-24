import { describe, expect, it, vi } from 'vitest'

import { requireWorkspaceAccess } from '../../../functions'
import { deleteAdIntegration, writeMetricsBatch } from './metricsDeletion'

vi.mock('../../../functions', () => ({
  requireWorkspaceAccess: vi.fn(async () => undefined),
}))

function callRegisteredHandler<TArgs, TResult = unknown>(registration: unknown, ctx: unknown, args: TArgs) {
  const handler = (registration as { _handler?: (ctx: unknown, args: TArgs) => Promise<TResult> })._handler
  if (typeof handler !== 'function') {
    throw new Error('Expected registered Convex function to expose _handler in test environment')
  }
  return handler(ctx, args)
}

describe('metricsDeletion workspace access', () => {
  it('deleteAdIntegration requires workspace membership', async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({ subject: 'user_1' })),
      },
      db: {
        query: () => ({
          withIndex: () => ({
            unique: async () => null,
          }),
        }),
      },
    }

    await callRegisteredHandler(deleteAdIntegration, ctx, {
      workspaceId: 'ws_other',
      providerId: 'google',
      clientId: null,
    })

    expect(requireWorkspaceAccess).toHaveBeenCalledWith(ctx, 'ws_other')
  })

  it('writeMetricsBatch requires workspace membership for authenticated callers', async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => ({ subject: 'user_1' })),
      },
      runMutation: vi.fn(async () => ({ ok: true, inserted: 0 })),
    }

    await callRegisteredHandler(writeMetricsBatch, ctx, {
      workspaceId: 'ws_other',
      metrics: [],
    })

    expect(requireWorkspaceAccess).toHaveBeenCalledWith(ctx, 'ws_other')
  })

  it('writeMetricsBatch rejects unauthenticated callers without cron key', async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => null),
      },
      runMutation: vi.fn(),
    }

    await expect(
      callRegisteredHandler(writeMetricsBatch, ctx, {
        workspaceId: 'ws_1',
        metrics: [],
      }),
    ).rejects.toThrow()
  })

  it('deleteAdIntegration rejects unauthenticated callers', async () => {
    const ctx = {
      auth: {
        getUserIdentity: vi.fn(async () => null),
      },
      db: {},
    }

    await expect(
      callRegisteredHandler(deleteAdIntegration, ctx, {
        workspaceId: 'ws_1',
        providerId: 'google',
        clientId: null,
      }),
    ).rejects.toThrow()
  })
})
