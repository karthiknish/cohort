import { v } from 'convex/values'

import { internalMutation } from './_generated/server'

const changeValidator = v.object({
  field: v.union(v.string(), v.null()),
  value: v.any(),
  verb: v.union(v.string(), v.null()),
})

const entryValidator = v.object({
  id: v.union(v.string(), v.null()),
  time: v.union(v.number(), v.null()),
  changes: v.array(changeValidator),
})

export const ingestMetaWebhookPayload = internalMutation({
  args: {
    entries: v.array(entryValidator),
    rawPayload: v.any(),
  },
  handler: async (ctx, args) => {
    const receivedAtMs = Date.now()
    let inserted = 0

    for (const entry of args.entries) {
      if (entry.changes.length === 0) {
        await ctx.db.insert('metaWebhookEvents', {
          entryId: entry.id,
          objectId: null,
          objectType: null,
          changeField: null,
          verb: null,
          payload: args.rawPayload,
          receivedAtMs,
        })
        inserted += 1
        continue
      }

      for (const change of entry.changes) {
        const value =
          change.value && typeof change.value === 'object' && !Array.isArray(change.value)
            ? (change.value as Record<string, unknown>)
            : null
        await ctx.db.insert('metaWebhookEvents', {
          entryId: entry.id,
          objectId: typeof value?.id === 'string' ? value.id : null,
          objectType: typeof value?.object_type === 'string' ? value.object_type : null,
          changeField: change.field,
          verb: change.verb,
          payload: {
            entry,
            change,
          },
          receivedAtMs,
        })
        inserted += 1
      }
    }

    return { inserted, receivedAtMs }
  },
})
