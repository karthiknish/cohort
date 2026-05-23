import type { QueryCtx, MutationCtx, ActionCtx } from '../../_generated/server'
import type { Doc } from '/_generated/dataModel'

export type FilterExpressionBuilder = {
  field: (name: string) => unknown
  eq: (left: unknown, right: unknown) => unknown
  lt: (left: unknown, right: unknown) => unknown
  gt: (left: unknown, right: unknown) => unknown
  and: (...conditions: unknown[]) => unknown
  or: (...conditions: unknown[]) => unknown
}

export type PaginationCursor = {
  fieldValue: number | string
  legacyId: string
}

type JsonScalar = string | number | boolean | null
type JsonLayer1 = JsonScalar | JsonScalar[] | Record<string, JsonScalar>
type JsonLayer2 = JsonLayer1 | JsonLayer1[] | Record<string, JsonLayer1>
type JsonLayer3 = JsonLayer2 | JsonLayer2[] | Record<string, JsonLayer2>
type JsonRecord = Record<string, JsonLayer3>
type JsonArray = JsonLayer3[]

export type IdempotencyResponse =
  | JsonScalar
  | JsonArray
  | JsonRecord
  | undefined

export type AuthenticatedQueryCtx = QueryCtx & {
  user: Doc<'users'>
  legacyId: string
  agencyId: string
}

export type AuthenticatedMutationCtx = MutationCtx & {
  user: Doc<'users'>
  legacyId: string
  agencyId: string
  now: number
  cachedResponse?: IdempotencyResponse
}

export type AuthenticatedActionCtx = ActionCtx & {
  user: Doc<'users'>
  legacyId: string
  agencyId: string
  now: number
  cachedResponse?: IdempotencyResponse
}

export type MutationHandler<Ctx, Args, Out> = (ctx: Ctx, args: Args) => Promise<Out>
