import { internalQuery } from './_generated/server'
import { v } from 'convex/values'

import {
  dedupeClientRosterNames,
  resolveProfilesForRosterNames,
} from './taskDocumentImportParsing'

export const resolveUserProfilesForNamesInternal = internalQuery({
  args: {
    names: v.array(v.string()),
  },
  returns: v.array(
    v.object({
      id: v.string(),
      name: v.string(),
      email: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const rosterNames = dedupeClientRosterNames(args.names).slice(0, 100)
    if (rosterNames.length === 0) return []

    const rows = await ctx.db.query('users').take(1000)
    const directory = rows.flatMap((row) => {
      if (row.status === 'disabled' || row.status === 'suspended') return []

      const name = typeof row.name === 'string' ? row.name.trim() : ''
      if (!name) return []

      return [
        {
          id: row.legacyId,
          name,
          email: row.email?.trim() || undefined,
        },
      ]
    })

    return resolveProfilesForRosterNames(rosterNames, directory)
  },
})
