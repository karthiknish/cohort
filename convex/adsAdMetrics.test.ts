import { ConvexError } from 'convex/values'
import { describe, expect, it, vi } from 'vitest'

import { listAdMetrics, resolveRequestedMetricsLevel } from './adsAdMetrics'

function callRegisteredHandler<TArgs, TResult = unknown>(registration: unknown, ctx: unknown, args: TArgs) {
  const handler = (registration as { _handler?: (ctx: unknown, args: TArgs) => Promise<TResult> })._handler
  if (typeof handler !== 'function') {
    throw new Error('Expected registered Convex function to expose _handler in test environment')
  }
  return handler(ctx, args)
}

function createActionContext() {
  return {
    auth: {
      getUserIdentity: vi.fn(async () => ({ subject: 'user_1' })),
    },
    runQuery: vi.fn(async () => ({
      accessToken: 'token',
      accessTokenExpiresAtMs: Date.now() + 60 * 60 * 1000,
      accountId: 'acct_1',
      developerToken: 'developer-token',
      loginCustomerId: null,
    })),
  }
}

describe('convex/adsAdMetrics listAdMetrics support matrix', () => {
  it('defaults linkedin requests to creative metrics to preserve existing creative views', () => {
    expect(resolveRequestedMetricsLevel('linkedin')).toBe('creative')
    expect(resolveRequestedMetricsLevel('google')).toBe('ad')
  })

  it('rejects creative metrics for google instead of falling back to ad metrics', async () => {
    const ctx = createActionContext()

    await expect(callRegisteredHandler(listAdMetrics, ctx, {
      workspaceId: 'ws_1',
      providerId: 'google',
      clientId: null,
      campaignId: 'campaign_1',
      adGroupId: 'ad_group_1',
      level: 'creative',
      days: '7',
    })).rejects.toMatchObject({
      data: {
        code: 'NOT_IMPLEMENTED',
        message: 'google creative metrics is not implemented',
      },
    } satisfies Partial<ConvexError<unknown>>)

    expect(ctx.runQuery).not.toHaveBeenCalled()
  })

  it('rejects ad group metrics for facebook instead of returning ad metrics', async () => {
    const ctx = createActionContext()

    await expect(callRegisteredHandler(listAdMetrics, ctx, {
      workspaceId: 'ws_1',
      providerId: 'facebook',
      clientId: null,
      campaignId: 'campaign_1',
      adGroupId: null,
      level: 'adGroup',
      days: '7',
    })).rejects.toMatchObject({
      data: {
        code: 'NOT_IMPLEMENTED',
        message: 'facebook adGroup metrics is not implemented',
      },
    } satisfies Partial<ConvexError<unknown>>)

    expect(ctx.runQuery).not.toHaveBeenCalled()
  })
})