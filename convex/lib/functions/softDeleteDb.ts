import type { QueryCtx } from '../../_generated/server'
import type { FilterExpressionBuilder } from './types'

const SOFT_DELETE_TABLES = ['tasks', 'taskComments', 'collaborationMessages', 'clients', 'projects']

type ProxyableQuery = {
  filter: (predicate: (q: FilterExpressionBuilder) => unknown) => ProxyableQuery
  [key: string]: unknown
}

export function wrapDatabaseActive(db: QueryCtx['db']): QueryCtx['db'] {
  const proxyQuery = (q: ProxyableQuery): ProxyableQuery => {
    return new Proxy(q, {
      get(target, prop, receiver) {
        if (['collect', 'first', 'unique', 'paginate', 'take'].includes(prop as string)) {
          return (...args: unknown[]) => {
            // Filter: deletedAtMs is null OR deletedAtMs is undefined (missing)
            const filtered = target.filter((q) =>
              q.or(
                q.eq(q.field('deletedAtMs'), null),
                q.eq(q.field('deletedAtMs'), undefined)
              )
            ) as Record<string, unknown>
            const method = filtered[prop as keyof typeof filtered]
            if (typeof method !== 'function') {
              return method
            }
            return (method as (...methodArgs: unknown[]) => unknown).apply(filtered, args)
          }
        }
        const value = Reflect.get(target, prop, receiver)
        if (typeof value === 'function') {
          return (...args: unknown[]) => {
            const result = (value as (...fnArgs: unknown[]) => unknown).apply(target, args)
            if (result && typeof result === 'object' && 'filter' in result && 'collect' in result) {
              return proxyQuery(result as ProxyableQuery)
            }
            return result
          }
        }
        return value
      },
    })
  }

  return new Proxy(db, {
    get(target, prop, receiver) {
      if (prop === 'query') {
        return (table: string) => {
          const q = target.query(table as Parameters<QueryCtx['db']['query']>[0])
          if (SOFT_DELETE_TABLES.includes(table)) {
            return proxyQuery(q as unknown as ProxyableQuery) as unknown as typeof q
          }
          return q
        }
      }
      return Reflect.get(target, prop, receiver)
    },
  })
}
