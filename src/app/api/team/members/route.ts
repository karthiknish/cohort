import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { adminDb } from '@/lib/firebase-admin'

function normalizeString(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    rateLimit: 'standard',
    querySchema: z.object({
      pageSize: z.string().optional(),
    }),
  },
  async (req, { workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const pageSize = Math.min(Math.max(Number(query.pageSize) || 200, 1), 500)

    // Query users by agencyId matching workspace
    const agencySnapshot = await adminDb
      .collection('users')
      .where('agencyId', '==', workspace.workspaceId)
      .limit(pageSize)
      .get()

    // Also try to get workspace members from a members subcollection if it exists
    // This handles cases where users are added via team invite but agencyId wasn't updated
    let memberIds: string[] = []
    try {
      const membersSnapshot = await adminDb
        .collection('workspaces')
        .doc(workspace.workspaceId)
        .collection('members')
        .limit(pageSize)
        .get()
      memberIds = membersSnapshot.docs.map(doc => doc.id)
    } catch {
      // Members collection may not exist, that's okay
    }

    // Collect all user docs from agency query
    const userMap = new Map<string, { id: string; name: string; email?: string; role?: string }>()

    agencySnapshot.docs.forEach((doc) => {
      const data = (doc.data() ?? {}) as Record<string, unknown>
      const name = normalizeString(data.name) || normalizeString(data.email) || 'Unnamed user'
      const email = normalizeString(data.email) || undefined
      const role = normalizeString(data.role) || undefined
      const status = normalizeString(data.status)

      // Only include active users
      if (status === 'disabled' || status === 'suspended') return

      userMap.set(doc.id, { id: doc.id, name, email, role })
    })

    // If we found member IDs not in the agency query, fetch those users too
    const missingMemberIds = memberIds.filter(id => !userMap.has(id))
    if (missingMemberIds.length > 0) {
      // Fetch in batches of 10 (Firestore 'in' query limit)
      for (let i = 0; i < missingMemberIds.length; i += 10) {
        const batch = missingMemberIds.slice(i, i + 10)
        const batchSnapshot = await adminDb
          .collection('users')
          .where('__name__', 'in', batch)
          .get()

        batchSnapshot.docs.forEach((doc) => {
          const data = (doc.data() ?? {}) as Record<string, unknown>
          const name = normalizeString(data.name) || normalizeString(data.email) || 'Unnamed user'
          const email = normalizeString(data.email) || undefined
          const role = normalizeString(data.role) || undefined
          const status = normalizeString(data.status)

          if (status === 'disabled' || status === 'suspended') return

          userMap.set(doc.id, { id: doc.id, name, email, role })
        })
      }
    }

    // Fallback: if we have fewer than 3 users, query all active team/admin users
    // This handles setups where agencyId isn't consistently set
    if (userMap.size < 3) {
      try {
        const fallbackSnapshot = await adminDb
          .collection('users')
          .where('role', 'in', ['admin', 'team'])
          .limit(pageSize)
          .get()

        fallbackSnapshot.docs.forEach((doc) => {
          if (userMap.has(doc.id)) return // Skip duplicates

          const data = (doc.data() ?? {}) as Record<string, unknown>
          const name = normalizeString(data.name) || normalizeString(data.email) || 'Unnamed user'
          const email = normalizeString(data.email) || undefined
          const role = normalizeString(data.role) || undefined
          const status = normalizeString(data.status)

          if (status === 'disabled' || status === 'suspended') return

          userMap.set(doc.id, { id: doc.id, name, email, role })
        })
      } catch (error) {
        console.warn('[team/members] Fallback query failed:', error)
      }
    }

    const members = Array.from(userMap.values())

    // Return a raw (non-enveloped) payload because the mention hook expects `{ members: [] }`.
    // `createApiHandler` will pass through Response instances unchanged.
    return Response.json({ members })
  }
)
