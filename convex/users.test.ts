import { describe, expect, it, vi } from 'vitest'

type UserRow = {
  _id: string
  legacyId: string
  email: string | null
  emailLower: string | null
  name: string | null
  role: string | null
  status: string | null
  agencyId: string | null
  phoneNumber: string | null
  photoUrl: string | null
  notificationPreferences: null
  regionalPreferences: null
  createdAtMs: number | null
  updatedAtMs: number | null
}

function createUserRow(overrides: Partial<UserRow> & Pick<UserRow, 'legacyId'>): UserRow {
  const email = overrides.email ?? `${overrides.legacyId}@example.com`

  return {
    _id: overrides._id ?? `doc_${overrides.legacyId}`,
    legacyId: overrides.legacyId,
    email,
    emailLower: email?.toLowerCase() ?? null,
    name: overrides.name ?? overrides.legacyId,
    role: overrides.role ?? 'client',
    status: overrides.status ?? 'active',
    agencyId: overrides.agencyId ?? overrides.legacyId,
    phoneNumber: overrides.phoneNumber ?? null,
    photoUrl: overrides.photoUrl ?? null,
    notificationPreferences: null,
    regionalPreferences: null,
    createdAtMs: overrides.createdAtMs ?? 1,
    updatedAtMs: overrides.updatedAtMs ?? 1,
  }
}

function createDbStub(users: UserRow[]) {
  const patch = vi.fn(async () => undefined)
  const insert = vi.fn(async () => 'inserted_user')

  return {
    db: {
      query: (table: string) => {
        if (table === 'users') {
          return {
            withIndex: (
              indexName: string,
              selector: (builder: { eq: (field: string, value: string) => { field: string; value: string } }) => {
                field: string
                value: string
              },
            ) => {
              const constraint = selector({
                eq: (field: string, value: string) => ({ field, value }),
              })

              if (indexName === 'by_legacyId') {
                return {
                  unique: async () => users.find((user) => user.legacyId === constraint.value) ?? null,
                }
              }

              if (indexName === 'by_emailLower') {
                return {
                  collect: async () => users.filter((user) => user.emailLower === constraint.value),
                }
              }

              if (indexName === 'by_agencyId') {
                return {
                  take: async (limit: number) => users.filter((user) => user.agencyId === constraint.value).slice(0, limit),
                }
              }

              throw new Error(`Unexpected users index: ${indexName}`)
            },
            take: async (limit: number) => users.slice(0, limit),
          }
        }

        if (table === 'apiIdempotency') {
          return {
            withIndex: () => ({
              unique: async () => null,
            }),
          }
        }

        throw new Error(`Unexpected table: ${table}`)
      },
      patch,
      insert,
    },
    patch,
    insert,
  }
}

function createContext(options: { currentUserId?: string | null; users: UserRow[] }) {
  const { db, patch, insert } = createDbStub(options.users)

  return {
    ctx: {
      auth: {
        getUserIdentity: async () => (
          options.currentUserId
            ? { subject: options.currentUserId }
            : null
        ),
      },
      db,
    },
    patch,
    insert,
  }
}

async function loadUsersModule() {
  return await import('./users')
}

function callRegisteredHandler<TArgs, TResult = unknown>(
  registration: unknown,
  ctx: unknown,
  args: TArgs,
) {
  return (registration as {
    _handler: (handlerCtx: unknown, handlerArgs: TArgs) => Promise<TResult> | TResult
  })._handler(ctx, args)
}

describe('convex/users authorization hardening', () => {
  it('blocks non-admin users from reading another user profile', async () => {
    const { getByLegacyId } = await loadUsersModule()
    const { ctx } = createContext({
      currentUserId: 'user_self',
      users: [
        createUserRow({ legacyId: 'user_self', role: 'client', agencyId: 'ws_1' }),
        createUserRow({ legacyId: 'user_other', role: 'team', agencyId: 'ws_1' }),
      ],
    })

    await expect(callRegisteredHandler(getByLegacyId, ctx, { legacyId: 'user_other' }))
      .rejects.toHaveProperty('data.code', 'FORBIDDEN')
  })

  it('allows admins to read another user profile', async () => {
    const { getByLegacyId } = await loadUsersModule()
    const { ctx } = createContext({
      currentUserId: 'admin_1',
      users: [
        createUserRow({ legacyId: 'admin_1', role: 'admin', agencyId: 'ws_1' }),
        createUserRow({ legacyId: 'user_other', role: 'team', agencyId: 'ws_2', name: 'Other User' }),
      ],
    })

    await expect(callRegisteredHandler(getByLegacyId, ctx, { legacyId: 'user_other' }))
      .resolves.toMatchObject({
        legacyId: 'user_other',
        name: 'Other User',
        role: 'team',
      })
  })

  it('enforces workspace scope for workspace member queries', async () => {
    const { listWorkspaceMembers } = await loadUsersModule()
    const { ctx } = createContext({
      currentUserId: 'user_self',
      users: [createUserRow({ legacyId: 'user_self', role: 'team', agencyId: 'ws_1' })],
    })

    await expect(callRegisteredHandler(listWorkspaceMembers, ctx, { workspaceId: 'ws_2', limit: 50 }))
      .rejects.toHaveProperty('data.code', 'WORKSPACE_ACCESS_DENIED')
  })

  it('requires admin access for listing all users', async () => {
    const { listAllUsers } = await loadUsersModule()
    const { ctx } = createContext({
      currentUserId: 'user_self',
      users: [createUserRow({ legacyId: 'user_self', role: 'team', agencyId: 'ws_1' })],
    })

    await expect(callRegisteredHandler(listAllUsers, ctx, { limit: 50 }))
      .rejects.toHaveProperty('data.code', 'ADMIN_REQUIRED')
  })

  it('filters DM participants using the authenticated role, not the caller-supplied role', async () => {
    const { listDMParticipants } = await loadUsersModule()
    const { ctx } = createContext({
      currentUserId: 'client_1',
      users: [
        createUserRow({ legacyId: 'client_1', role: 'client', agencyId: 'ws_1', name: 'Current Client' }),
        createUserRow({ legacyId: 'client_2', role: 'client', agencyId: 'ws_1', name: 'Other Client' }),
        createUserRow({ legacyId: 'team_1', role: 'team', agencyId: 'ws_1', name: 'Team Member' }),
        createUserRow({ legacyId: 'ws_1', role: 'admin', agencyId: 'ws_1', name: 'Workspace Owner' }),
      ],
    })

    const result = await callRegisteredHandler(listDMParticipants, ctx, {
      workspaceId: 'ws_1',
      currentUserId: 'client_1',
      currentUserRole: 'admin',
      limit: 50,
    })

    expect(result).toEqual([
      { id: 'ws_1', name: 'Workspace Owner', email: 'ws_1@example.com', role: 'admin' },
      { id: 'team_1', name: 'Team Member', email: 'team_1@example.com', role: 'team' },
    ])
  })

  it('rejects DM participant queries that spoof another current user id', async () => {
    const { listDMParticipants } = await loadUsersModule()
    const { ctx } = createContext({
      currentUserId: 'client_1',
      users: [
        createUserRow({ legacyId: 'client_1', role: 'client', agencyId: 'ws_1' }),
        createUserRow({ legacyId: 'ws_1', role: 'admin', agencyId: 'ws_1' }),
      ],
    })

    await expect(callRegisteredHandler(listDMParticipants, ctx, {
      workspaceId: 'ws_1',
      currentUserId: 'someone_else',
      currentUserRole: 'client',
      limit: 50,
    })).rejects.toHaveProperty('data.code', 'FORBIDDEN')
  })

  it('requires admin access for bulk user upserts', async () => {
    const { bulkUpsert } = await loadUsersModule()
    const { ctx, insert, patch } = createContext({
      currentUserId: 'user_self',
      users: [createUserRow({ legacyId: 'user_self', role: 'team', agencyId: 'ws_1' })],
    })

    await expect(callRegisteredHandler(bulkUpsert, ctx, {
      users: [{ legacyId: 'target_1', email: 'target@example.com', role: 'admin' }],
    })).rejects.toHaveProperty('data.code', 'ADMIN_REQUIRED')

    expect(insert).not.toHaveBeenCalled()
    expect(patch).not.toHaveBeenCalled()
  })

  it('ignores privileged role, status, and agency fields when self-bootstrapping a new user', async () => {
    const { bootstrapUpsert } = await loadUsersModule()
    const { ctx, insert } = createContext({
      currentUserId: 'new_user',
      users: [],
    })

    await expect(callRegisteredHandler(bootstrapUpsert, ctx, {
      legacyId: 'new_user',
      email: 'new_user@example.com',
      name: 'New User',
      role: 'admin',
      status: 'active',
      agencyId: 'evil_workspace',
    })).resolves.toEqual({ ok: true, created: true })

    expect(insert).toHaveBeenCalledWith('users', expect.objectContaining({
      legacyId: 'new_user',
      email: 'new_user@example.com',
      emailLower: 'new_user@example.com',
      role: 'client',
      status: 'pending',
      agencyId: 'new_user',
    }))
  })

  it('preserves existing role, status, and agency fields when self-bootstrapping an existing user', async () => {
    const { bootstrapUpsert } = await loadUsersModule()
    const existingUser = createUserRow({
      legacyId: 'existing_user',
      role: 'team',
      status: 'active',
      agencyId: 'ws_1',
      name: 'Existing User',
    })
    const { ctx, patch } = createContext({
      currentUserId: 'existing_user',
      users: [existingUser],
    })

    await expect(callRegisteredHandler(bootstrapUpsert, ctx, {
      legacyId: 'existing_user',
      email: 'existing_user@example.com',
      name: 'Updated Name',
      role: 'admin',
      status: 'suspended',
      agencyId: 'evil_workspace',
    })).resolves.toEqual({ ok: true, created: false })

    expect(patch).toHaveBeenCalledWith(existingUser._id, expect.objectContaining({
      legacyId: 'existing_user',
      name: 'Updated Name',
      role: 'team',
      status: 'active',
      agencyId: 'ws_1',
    }))
  })
})