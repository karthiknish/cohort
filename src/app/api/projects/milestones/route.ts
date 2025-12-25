import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { mapMilestoneDoc } from '@/lib/milestones'
import type { StoredMilestone } from '@/lib/milestones'
import { ValidationError } from '@/lib/api-errors'

const querySchema = z.object({
  projectIds: z.string().trim().optional(),
})

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema,
    rateLimit: 'standard',
  },
  async (req, { workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const projectIdsRaw = query.projectIds?.split(',').map((v) => v.trim()).filter(Boolean) ?? []
    if (projectIdsRaw.length === 0) {
      throw new ValidationError('projectIds is required')
    }

    const byProject: Record<string, ReturnType<typeof mapMilestoneDoc>[]> = {}

    const chunks = chunk(projectIdsRaw, 10) // Firestore "in" supports up to 10
    for (const group of chunks) {
      const snapshot = await workspace.projectsCollection
        .where('__name__', 'in', group)
        .get()

      const tasks: Promise<void>[] = []
      snapshot.forEach((projectDoc) => {
        tasks.push(
          projectDoc.ref
            .collection('milestones')
            .orderBy('startDate', 'asc')
            .orderBy('createdAt', 'asc')
            .get()
            .then((milestonesSnap) => {
              byProject[projectDoc.id] = milestonesSnap.docs.map((doc) =>
                mapMilestoneDoc(doc.id, doc.data() as StoredMilestone)
              )
            })
        )
      })

      await Promise.all(tasks)
    }

    return { milestones: byProject }
  }
)
