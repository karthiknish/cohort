import { describe, expect, it } from 'vitest'

import { buildAdminUserPage } from './admin-user-list'

describe('buildAdminUserPage', () => {
  it('prepends the workspace owner and dedupes repeated users', () => {
    const result = buildAdminUserPage({
      owner: { legacyId: 'owner', updatedAtMs: 5 },
      members: [
        { legacyId: 'owner', updatedAtMs: 5 },
        { legacyId: 'member-1', updatedAtMs: 4 },
        { legacyId: 'member-2', updatedAtMs: 3 },
      ],
      numItems: 10,
      cursor: null,
    })

    expect(result).toEqual({
      page: [
        { legacyId: 'owner', updatedAtMs: 5 },
        { legacyId: 'member-1', updatedAtMs: 4 },
        { legacyId: 'member-2', updatedAtMs: 3 },
      ],
      continueCursor: null,
      isDone: true,
    })
  })

  it('supports manual cursor pagination', () => {
    const result = buildAdminUserPage({
      members: [
        { legacyId: 'a', updatedAtMs: 4 },
        { legacyId: 'b', updatedAtMs: 3 },
        { legacyId: 'c', updatedAtMs: 2 },
      ],
      numItems: 2,
      cursor: '2',
    })

    expect(result).toEqual({
      page: [{ legacyId: 'c', updatedAtMs: 2 }],
      continueCursor: null,
      isDone: true,
    })
  })

  it('can paginate all-workspace listings', () => {
    const result = buildAdminUserPage({
      includeAllWorkspaces: true,
      allUsers: [
        { legacyId: 'a', updatedAtMs: 3 },
        { legacyId: 'b', updatedAtMs: 2 },
        { legacyId: 'c', updatedAtMs: 1 },
      ],
      numItems: 2,
      cursor: null,
    })

    expect(result).toEqual({
      page: [
        { legacyId: 'a', updatedAtMs: 3 },
        { legacyId: 'b', updatedAtMs: 2 },
      ],
      continueCursor: '2',
      isDone: false,
    })
  })
})