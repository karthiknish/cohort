import { v } from 'convex/values'
import type { FilterExpressionBuilder, PaginationCursor } from './types'

export const PaginationValidators = {
  limit: v.optional(v.number()),
  cursor: v.optional(
    v.union(
      v.null(),
      v.object({
        fieldValue: v.union(v.number(), v.string()),
        legacyId: v.string(),
      }),
    ),
  ),
}

/**
 * Helper to apply standardized manual pagination to a Convex query.
 * Support both descending (default) and ascending orders, and custom field names.
 */
export function applyManualPagination<TQuery>(
  q: TQuery,
  cursor: PaginationCursor | null | undefined,
  fieldName: string = 'createdAtMs',
  order: 'asc' | 'desc' = 'desc',
): TQuery {
  if (!cursor) return q

  const query = q as unknown as {
    filter: (predicate: (row: FilterExpressionBuilder) => unknown) => TQuery
  }

  if (order === 'desc') {
    return query.filter((row) =>
      row.or(
        row.lt(row.field(fieldName), cursor.fieldValue),
        row.and(
          row.eq(row.field(fieldName), cursor.fieldValue),
          row.lt(row.field('legacyId'), cursor.legacyId),
        ),
      ),
    )
  } else {
    return query.filter((row) =>
      row.or(
        row.gt(row.field(fieldName), cursor.fieldValue),
        row.and(
          row.eq(row.field(fieldName), cursor.fieldValue),
          row.gt(row.field('legacyId'), cursor.legacyId),
        ),
      ),
    )
  }
}

/**
 * Helper to wrap a result set in a standardized paginated response.
 */
export function getPaginatedResponse<T extends { legacyId: string }, K extends keyof T>(
  items: T[],
  limit: number,
  fieldName: K,
) {
  const hasMore = items.length > limit
  const results = hasMore ? items.slice(0, limit) : items
  const lastItem = results[results.length - 1]
  const rawFieldValue = lastItem ? lastItem[fieldName] : null
  const fieldValue =
    typeof rawFieldValue === 'number' || typeof rawFieldValue === 'string'
      ? rawFieldValue
      : (0 as Extract<T[K], string | number>)

  return {
    items: results,
    nextCursor:
      hasMore && lastItem
        ? { fieldValue: fieldValue as Extract<T[K], string | number>, legacyId: lastItem.legacyId }
        : null,
  }
}
