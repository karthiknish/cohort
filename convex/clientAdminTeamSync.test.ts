import { describe, expect, it } from 'vitest'

import {
  clientTeamMembersChanged,
  isGenericClientTeamRole,
  mergeTeamMembersWithAdmins,
  pickMostCommonClientTeamRole,
  pickPreferredClientTeamRole,
  resolveClientTeamRoleForAdmin,
} from './clientAdminTeamSync'

describe('client admin team role helpers', () => {
  it('treats Admin as generic but Paid as specific', () => {
    expect(isGenericClientTeamRole('Admin')).toBe(true)
    expect(isGenericClientTeamRole('Paid')).toBe(false)
  })

  it('prefers specific roles over generic ones', () => {
    expect(pickPreferredClientTeamRole('Admin', 'Paid')).toBe('Paid')
    expect(pickPreferredClientTeamRole('Paid', 'Admin')).toBe('Paid')
  })

  it('picks the most common non-generic role', () => {
    const role = pickMostCommonClientTeamRole([
      ['Admin', 3],
      ['Paid', 2],
      ['Social', 2],
    ])

    expect(role).toBe('Paid')
  })

  it('resolves explicit clientTeamRole before inferred fallback', () => {
    expect(
      resolveClientTeamRoleForAdmin({ name: 'Deepak Karnan', clientTeamRole: 'Paid Media' }, 'Social'),
    ).toBe('Paid Media')
    expect(resolveClientTeamRoleForAdmin({ name: 'Deepak Karnan' }, 'Paid')).toBe('Paid')
    expect(resolveClientTeamRoleForAdmin({ name: 'Deepak Karnan' }, null)).toBe('Contributor')
  })
})

describe('mergeTeamMembersWithAdmins', () => {
  it('adds missing admins without duplicating existing names', () => {
    const result = mergeTeamMembersWithAdmins(
      [
        { name: 'Deepak Karnan', role: 'Contributor' },
        { name: 'Alice Admin', role: 'Admin' },
      ],
      [
        { name: 'Alice Admin', role: 'Social' },
        { name: 'Bob Admin', role: 'Paid' },
      ],
    )

    expect(result).toEqual([
      { name: 'Deepak Karnan', role: 'Contributor' },
      { name: 'Alice Admin', role: 'Social' },
      { name: 'Bob Admin', role: 'Paid' },
    ])
  })

  it('matches names case-insensitively', () => {
    const result = mergeTeamMembersWithAdmins(
      [{ name: 'alice admin', role: 'Admin' }],
      [{ name: 'Alice Admin', role: 'Paid' }],
    )

    expect(result).toEqual([{ name: 'alice admin', role: 'Paid' }])
  })

  it('preserves manually assigned specific roles', () => {
    const result = mergeTeamMembersWithAdmins(
      [{ name: 'Deepak Karnan', role: 'Paid' }],
      [{ name: 'Deepak Karnan', role: 'Social' }],
    )

    expect(result).toEqual([{ name: 'Deepak Karnan', role: 'Paid' }])
  })
})

describe('clientTeamMembersChanged', () => {
  it('detects role updates even when length is unchanged', () => {
    const before = [{ name: 'Deepak Karnan', role: 'Admin' }]
    const after = [{ name: 'Deepak Karnan', role: 'Paid' }]

    expect(clientTeamMembersChanged(before, after)).toBe(true)
    expect(clientTeamMembersChanged(before, before)).toBe(false)
  })
})
