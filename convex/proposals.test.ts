import { afterEach, describe, expect, it, vi } from 'vitest'

type UserRow = {
  _id: string
  legacyId: string
  agencyId: string | null
  role: string | null
  status: string | null
}

type ProposalRow = {
  _id: string
  workspaceId: string
  legacyId: string
}

function createUserRow(overrides: Partial<UserRow> & Pick<UserRow, 'legacyId'>): UserRow {
  return {
    _id: overrides._id ?? `doc_${overrides.legacyId}`,
    legacyId: overrides.legacyId,
    agencyId: overrides.agencyId ?? 'ws_1',
    role: overrides.role ?? 'team',
    status: overrides.status ?? 'active',
  }
}

function createProposalRow(
  overrides: Partial<ProposalRow> & Pick<ProposalRow, 'workspaceId' | 'legacyId'>,
): ProposalRow {
  return {
    _id: overrides._id ?? `proposal_${overrides.legacyId}`,
    workspaceId: overrides.workspaceId,
    legacyId: overrides.legacyId,
  }
}

function expectedGeneratedId(nowMs: number, randomValue: number) {
  return `proposal-${nowMs.toString(36)}-${randomValue.toString(36).slice(2, 10)}`
}

function createContext(options: {
  currentUserId: string
  users: UserRow[]
  proposals: ProposalRow[]
}) {
  const proposalLookupKeys: string[] = []
  const insert = vi.fn(async (table: string, value: Record<string, unknown>) => {
    if (table === 'apiIdempotency') {
      return 'idem_1'
    }

    if (table === 'proposals') {
      options.proposals.push({
        _id: `proposal_${String(value.legacyId)}`,
        workspaceId: String(value.workspaceId),
        legacyId: String(value.legacyId),
      })

      return 'proposal_doc_1'
    }

    throw new Error(`Unexpected insert table: ${table}`)
  })
  const patch = vi.fn(async () => undefined)

  return {
    ctx: {
      auth: {
        getUserIdentity: async () => ({ subject: options.currentUserId }),
      },
      db: {
        query: (table: string) => ({
          withIndex: (
            indexName: string,
            selector: (builder: { eq: (field: string, value: string) => unknown }) => unknown,
          ) => {
            const constraints: Record<string, string> = {}
            const builder = {
              eq(field: string, value: string) {
                constraints[field] = value
                return builder
              },
            }

            selector(builder)

            if (table === 'users' && indexName === 'by_legacyId') {
              return {
                unique: async () => options.users.find((user) => user.legacyId === constraints.legacyId) ?? null,
              }
            }

            if (table === 'apiIdempotency' && indexName === 'by_key') {
              return {
                unique: async () => null,
              }
            }

            if (table === 'proposals' && indexName === 'by_workspace_legacyId') {
              return {
                unique: async () => {
                  proposalLookupKeys.push(`${constraints.workspaceId}:${constraints.legacyId}`)
                  return options.proposals.find(
                    (proposal) =>
                      proposal.workspaceId === constraints.workspaceId && proposal.legacyId === constraints.legacyId,
                  ) ?? null
                },
              }
            }

            throw new Error(`Unexpected query path: ${table}.${indexName}`)
          },
        }),
        insert,
        patch,
      },
    },
    insert,
    patch,
    proposalLookupKeys,
  }
}

function callRegisteredHandler<TArgs, TResult = unknown>(registration: unknown, ctx: unknown, args: TArgs) {
  return (
    registration as {
      _handler: (handlerCtx: unknown, handlerArgs: TArgs) => Promise<TResult> | TResult
    }
  )._handler(ctx, args)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('convex/proposals create', () => {
  it('retries generated legacy ids until it finds a free proposal id', async () => {
    const fixedNow = 1_744_000_000_000
    const firstRandom = 0.11111111
    const secondRandom = 0.22222222
    const firstId = expectedGeneratedId(fixedNow, firstRandom)
    const secondId = expectedGeneratedId(fixedNow, secondRandom)

    vi.spyOn(Date, 'now').mockReturnValue(fixedNow)
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(firstRandom)
      .mockReturnValueOnce(secondRandom)

    const { create } = await import('./proposals')
    const { ctx, insert, proposalLookupKeys } = createContext({
      currentUserId: 'user_1',
      users: [createUserRow({ legacyId: 'user_1', agencyId: 'ws_1' })],
      proposals: [createProposalRow({ workspaceId: 'ws_1', legacyId: firstId })],
    })

    await callRegisteredHandler(create, ctx, {
      workspaceId: 'ws_1',
      ownerId: 'owner_1',
      status: 'draft',
      stepProgress: 1,
      formData: {},
      clientId: 'client_1',
      clientName: 'Acme Co',
    })

    expect(proposalLookupKeys).toEqual([
      `ws_1:${firstId}`,
      `ws_1:${secondId}`,
    ])

    expect(insert).toHaveBeenCalledWith(
      'proposals',
      expect.objectContaining({
        workspaceId: 'ws_1',
        legacyId: secondId,
        ownerId: 'owner_1',
        status: 'draft',
        stepProgress: 1,
        clientId: 'client_1',
        clientName: 'Acme Co',
        createdAtMs: fixedNow,
        updatedAtMs: fixedNow,
        lastAutosaveAtMs: fixedNow,
      }),
    )
  })

  it('patches only the explicit update fields plus timestamps', async () => {
    const fixedNow = 1_744_000_000_000
    vi.spyOn(Date, 'now').mockReturnValue(fixedNow)

    const { update } = await import('./proposals')
    const { ctx, patch } = createContext({
      currentUserId: 'user_1',
      users: [createUserRow({ legacyId: 'user_1', agencyId: 'ws_1' })],
      proposals: [createProposalRow({ _id: 'proposal_doc_1', workspaceId: 'ws_1', legacyId: 'proposal_1' })],
    })

    await callRegisteredHandler(update, ctx, {
      workspaceId: 'ws_1',
      legacyId: 'proposal_1',
      status: 'approved',
      pdfUrl: 'https://example.com/proposal.pdf',
      updatedAtMs: fixedNow,
      lastAutosaveAtMs: fixedNow,
    })

    expect(patch).toHaveBeenCalledWith('proposal_doc_1', {
      updatedAtMs: fixedNow,
      lastAutosaveAtMs: fixedNow,
      status: 'approved',
      pdfUrl: 'https://example.com/proposal.pdf',
    })
  })

  it('rejects remove when the proposal does not exist in the workspace', async () => {
    const { remove } = await import('./proposals')
    const { ctx } = createContext({
      currentUserId: 'user_1',
      users: [createUserRow({ legacyId: 'user_1', agencyId: 'ws_1' })],
      proposals: [],
    })

    await expect(callRegisteredHandler(remove, ctx, {
      workspaceId: 'ws_1',
      legacyId: 'missing_proposal',
    })).rejects.toHaveProperty('data.code', 'NOT_FOUND')
  })
})