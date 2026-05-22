import { describe, expect, it } from 'vitest'

import { asErrorMessage } from '@/lib/convex-errors'

import {
  buildTaskAssigneeMemberPool,
  findWorkspaceMemberMatches,
  normalizeAssigneeLookup,
  normalizeTaskAssignees,
} from './taskAssignees'

describe('taskAssignees', () => {
  it('accepts roster-linked assignee ids when clientId is provided', async () => {
    const workspaceId = 'ws_agency'
    const clientId = 'client_abc'
    const deepakId = 'LS2TwLxh4eMbVOE7YrAXLdvExJ22'
    const archanaId = 'archana-user-id'

    const db = {
      query(table: string) {
        const users = [
          { legacyId: deepakId, name: 'Deepak Karnan', email: 'deepak@agency.com', status: 'active', role: 'admin' },
          { legacyId: archanaId, name: 'Archana Ravi Kumar', email: 'archana@agency.com', status: 'active', role: 'admin' },
          { legacyId: 'karthik-id', name: 'Karthik User', email: 'k@x.com', status: 'active', role: 'admin' },
        ]

        return {
          withIndex(_index: string, builder: (q: { eq: (field: string, value: string) => unknown }) => unknown) {
            const filters: Record<string, string> = {}
            const proxy = {
              eq(field: string, value: string) {
                filters[field] = value
                return proxy
              },
            }
            builder(proxy)

            if (table === 'users' && filters.agencyId === workspaceId) {
              return { take: async () => [users[2]] }
            }
            if (table === 'users' && filters.legacyId === workspaceId) {
              return { unique: async () => null }
            }
            if (table === 'users' && filters.legacyId === deepakId) {
              return { unique: async () => users[0] }
            }
            if (table === 'clients' && filters.workspaceId === workspaceId && filters.legacyId === clientId) {
              return {
                unique: async () => ({
                  deletedAtMs: null,
                  accountManager: 'Karthik User',
                  teamMembers: [
                    { name: 'Deepak Karnan', role: 'Paid' },
                    { name: 'Archana Ravi Kumar', role: 'Contributor' },
                  ],
                }),
              }
            }
            return table === 'users'
              ? { take: async () => [], unique: async () => null }
              : { unique: async () => null, collect: async () => [] }
          },
          take: async () => (table === 'users' ? users : []),
        }
      },
    }

    const members = await buildTaskAssigneeMemberPool({ db } as never, workspaceId, clientId)
    expect(members.map((member) => member.legacyId)).toEqual(
      expect.arrayContaining([deepakId, archanaId]),
    )

    const assignedTo = await normalizeTaskAssignees({ db } as never, workspaceId, [deepakId, archanaId], clientId)
    expect(assignedTo).toEqual(expect.arrayContaining([deepakId, archanaId]))
  })

  it('uses readable names in validation errors for unknown ids', async () => {
    const workspaceId = 'ws_agency'
    const clientId = 'client_abc'
    const unknownId = 'unknown-user-id'

    const db = {
      query(table: string) {
        const users = [
          { legacyId: unknownId, name: 'Deepak Karnan', email: 'deepak@agency.com', status: 'active' },
          { legacyId: 'karthik-id', name: 'Karthik User', email: 'k@x.com', status: 'active' },
        ]

        return {
          withIndex(_index: string, builder: (q: { eq: (field: string, value: string) => unknown }) => unknown) {
            const filters: Record<string, string> = {}
            const proxy = {
              eq(field: string, value: string) {
                filters[field] = value
                return proxy
              },
            }
            builder(proxy)

            if (table === 'users' && filters.legacyId === unknownId) {
              return { unique: async () => users[0] }
            }
            if (table === 'clients' && filters.workspaceId === workspaceId && filters.legacyId === clientId) {
              return {
                unique: async () => ({
                  deletedAtMs: null,
                  accountManager: 'Karthik User',
                  teamMembers: [{ name: 'Karthik User', role: 'Admin' }],
                }),
              }
            }
            return table === 'users'
              ? { take: async () => [], unique: async () => null }
              : { unique: async () => null }
          },
          take: async () => (table === 'users' ? users : []),
        }
      },
    }

    await expect(
      normalizeTaskAssignees({ db } as never, workspaceId, [unknownId], clientId),
    ).rejects.toSatisfy((error: unknown) => {
      const message = asErrorMessage(error)
      return (
        message.includes('Deepak Karnan') &&
        message.includes("this client's team")
      )
    })
  })
})

describe('normalizeAssigneeLookup', () => {
  it('normalizes punctuation and casing', () => {
    expect(normalizeAssigneeLookup('Deepak Karnan')).toBe('deepak karnan')
    expect(findWorkspaceMemberMatches('deepak', [{ legacyId: '1', name: 'Deepak Karnan', email: null }])).toHaveLength(1)
  })
})
