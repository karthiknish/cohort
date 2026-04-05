import { describe, expect, it } from 'vitest'

import {
  buildClientAllocationSummary,
  countUnmatchedClientAllocations,
  dedupeClientTeamMembers,
  filterAllocationClients,
  getAssignableWorkspaceUsers,
  normalizeAllocationUsers,
} from './client-allocation'

describe('client allocation helpers', () => {
  it('returns only internal assignable users', () => {
    const users = getAssignableWorkspaceUsers([
      { id: '1', name: 'Admin', email: 'a@test.com', role: 'admin', status: 'active' },
      { id: '2', name: 'Client', email: 'c@test.com', role: 'client', status: 'active' },
      { id: '3', name: 'Suspended', email: 's@test.com', role: 'team', status: 'suspended' },
    ])

    expect(users.map((user) => user.id)).toEqual(['1'])
  })

  it('normalizes raw admin user rows before allocation matching', () => {
    expect(normalizeAllocationUsers([
      { _id: 'doc_1', legacyId: 'user-1', name: ' Alex Chen ', email: ' alex@test.com ', role: 'admin', status: 'active' },
      { _id: 'doc_2', legacyId: null, name: null, email: ' teammate@test.com ', role: null, status: null },
    ])).toEqual([
      { id: 'user-1', name: 'Alex Chen', email: 'alex@test.com', role: 'admin', status: 'active' },
      { id: 'doc_2', name: 'teammate@test.com', email: 'teammate@test.com', role: 'team', status: 'pending' },
    ])
  })

  it('dedupes manager and team members by normalized name', () => {
    expect(
      dedupeClientTeamMembers('Alex Chen', [
        { name: ' Alex   Chen ', role: 'Paid Media Lead' },
        { name: 'Jordan', role: 'Designer' },
      ]),
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
      ],
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
      ],
    )

    expect(summary.unmatched).toEqual([
      { clientId: 'c1', clientName: 'Northwind', person: 'Admin', source: 'accountManager' },
    ])
  })

  it('filters clients by client, manager, and team-member text', () => {
    const filtered = filterAllocationClients(
      [
        {
          id: 'c1',
          name: 'Northwind',
          accountManager: 'Alex Chen',
          teamMembers: [{ name: 'Jordan Lee', role: 'Designer' }],
        },
        {
          id: 'c2',
          name: 'Southridge',
          accountManager: 'Taylor Kim',
          teamMembers: [{ name: 'Morgan', role: 'Strategist' }],
        },
      ],
      'designer',
    )

    expect(filtered.map((client) => client.id)).toEqual(['c1'])
  })

  it('counts unmatched allocation rows per client', () => {
    expect(countUnmatchedClientAllocations([
      { clientId: 'c1', clientName: 'Northwind', person: 'Legacy One', source: 'teamMember' },
      { clientId: 'c1', clientName: 'Northwind', person: 'Legacy Two', source: 'accountManager' },
      { clientId: 'c2', clientName: 'Southridge', person: 'Legacy Three', source: 'teamMember' },
    ])).toEqual({ c1: 2, c2: 1 })
  })
})