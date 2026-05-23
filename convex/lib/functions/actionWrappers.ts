import { customAction } from 'convex-helpers/server/customFunctions'
import { action } from '../../_generated/server'
import { Errors } from '../../errors'
import { getAuthenticatedActionContext } from './auth'

export const authenticatedAction = customAction(action, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedActionContext(ctx)
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args: {},
      returnValue: async (result: unknown) => {
        return { ok: true, data: result }
      },
    }
  },
})
export const adminAction = customAction(action, {
  args: {},
  input: async (ctx) => {
    const auth = await getAuthenticatedActionContext(ctx)
    if (auth.user.role !== 'admin') {
      throw Errors.auth.adminRequired()
    }
    return {
      ctx: { ...ctx, ...auth, now: Date.now() },
      args: {},
      returnValue: async (result: unknown) => {
        return { ok: true, data: result }
      },
    }
  },
})
