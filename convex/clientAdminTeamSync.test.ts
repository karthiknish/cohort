import { describe, expect, it } from 'vitest'

import { mergeTeamMembersWithAdmins } from './clientAdminTeamSync'

describe('mergeTeamMembersWithAdmins', () => {
  it('adds missing admins without duplicating existing names', () => {
    const result = mergeTeamMembersWithAdmins(
      [
        { name: 'Deepak Karnan', role: 'Contributor' },
        { name: 'Alice Admin', role: 'Admin' },
      ],
      [
        { name: 'Alice Admin', role: 'Admin' },
        { name: 'Bob Admin', role: 'Admin' },
      ],
    )

    expect(result).toEqual([
      { name: 'Deepak Karnan', role: 'Contributor' },
      { name: 'Alice Admin', role: 'Admin' },
      { name: 'Bob Admin', role: 'Admin' },
    ])
  })

  it('matches names case-insensitively', () => {
    const result = mergeTeamMembersWithAdmins(
      [{ name: 'alice admin', role: 'Admin' }],
      [{ name: 'Alice Admin', role: 'Admin' }],
    )

    expect(result).toEqual([{ name: 'alice admin', role: 'Admin' }])
  })
})
