import { zWorkspaceQueryActive } from '../functions'
import { z } from 'zod/v4'

const OPEN_TASK_STATUSES = new Set(['todo', 'in-progress', 'review'])
const TASK_COUNT_SCAN_MAX = 5000

const projectTaskCountsZ = z.object({
  taskCount: z.number(),
  openTaskCount: z.number(),
})

export const summarizeCountsByProject = zWorkspaceQueryActive({
  args: {
    projectIds: z.array(z.string()).optional(),
    clientId: z.string().optional(),
  },
  returns: z.record(z.string(), projectTaskCountsZ),
  handler: async (ctx, args) => {
    const projectIdSet =
      args.projectIds && args.projectIds.length > 0 ? new Set(args.projectIds) : null

    const rows = args.clientId
      ? await ctx.db
          .query('tasks')
          .withIndex('by_workspace_clientId_updatedAtMs_legacyId', (index) =>
            index.eq('workspaceId', args.workspaceId).eq('clientId', args.clientId!),
          )
          .order('desc')
          .take(TASK_COUNT_SCAN_MAX)
      : await ctx.db
          .query('tasks')
          .withIndex('by_workspace_createdAtMs_legacyId', (index) =>
            index.eq('workspaceId', args.workspaceId),
          )
          .order('desc')
          .take(TASK_COUNT_SCAN_MAX)

    const counts: Record<string, { taskCount: number; openTaskCount: number }> = {}

    for (const row of rows) {
      const projectId = typeof row.projectId === 'string' ? row.projectId : null
      if (!projectId) {
        continue
      }
      if (projectIdSet && !projectIdSet.has(projectId)) {
        continue
      }

      const entry = counts[projectId] ?? { taskCount: 0, openTaskCount: 0 }
      entry.taskCount += 1
      if (OPEN_TASK_STATUSES.has(row.status)) {
        entry.openTaskCount += 1
      }
      counts[projectId] = entry
    }

    return counts
  },
})
