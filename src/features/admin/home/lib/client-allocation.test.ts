import { describe, expect, it } from 'vitest'

import { buildClientAllocationSummary, dedupeClientTeamMembers, getAssignableWorkspaceUsers } from './client-allocation'

describe('client allocation helpers', () => {
  it('returns only internal assignable users', () => {
    const users = getAssignableWorkspaceUsers([
      { id: '1', name: 'Admin', email: 'a@test.com', role: 'admin', status: 'active' },
      { id: '2', name: 'Client', email: 'c@test.com', role: 'client', status: 'active' },
      { id: '3', name: 'Suspended', email: 's@test.com', role: 'team', status: 'suspended' },
    ])

    expect(users.map((user) => user.id)).toEqual(['1'])
  })

  it('dedupes manager and team members by normalized name', () => {
    expect(
      dedupeClientTeamMembers('Alex Chen', [
        { name: ' Alex   Chen ', role: 'Paid Media Lead' },
        { name: 'Jordan', role: 'Designer' },
      ])
    ).toEqual([
      { name: 'Alex Chen', role: 'Account Manager' },
      { name: 'Jordan', role: 'Designer' },
    ])
  })

  it('builds allocation counts and flags unmatched names', () => {
    const summary = buildClientAllocationSummary(
      [
        { id: 'u1', name: 'Alex Chen', email: 'alex@test.com', role: 'team', status: 'active' },
        { id: 'u2', name: 'Jordan Lee', email: 'jordan@test.com', role: 'admin', status: 'active' },
      ],
      [
        {
          id: 'c1',
          name: 'Northwind',
          accountManager: 'alex@test.com',
          teamMembers: [{ name: 'Jordan Lee', role: 'Designer' }, { name: 'Legacy User', role: 'Analyst' }],
        },
      ]
    )

    expect(summary.byUserId.u1?.managedClientNames).toEqual(['Northwind'])
    expect(summary.byUserId.u2?.supportingClientNames).toEqual(['Northwind'])
    expect(summary.unmatched).toEqual([
      { clientId: 'c1', clientName: 'Northwind', person: 'Legacy User', source: 'teamMember' },
    ])
  })

  it('dedupes the same unmatched legacy name when it appears as manager and teammate', () => {
    const summary = buildClientAllocationSummary(
      [
        { id: 'u1', name: 'Jordan Lee', email: 'jordan@test.com', role: 'admin', status: 'active' },
      ],
      [
        {
          id: 'c1',
          name: 'Northwind',
          accountManager: 'Admin',
          teamMembers: [
            { name: ' Admin ', role: 'Account Manager' },
            { name: 'Jordan Lee', role: 'Designer' },
          ],
        },
      ]
    )

    expect(summary.unmatched).toEqual([
      { clientId: 'c1', clientName: 'Northwind', person: 'Admin', source: 'accountManager' },
    ])
  })
})