/**
 * Adapter: `createApiHandler` → TanStack Start `server.handlers` on file
 * routes under `src/routes/api/**`.
 */
import type { z } from 'zod'
import {
  createApiHandler,
  type ApiHandlerContext,
  type ApiHandlerOptions,
} from '@/lib/api-handler'

type RouteHandlerCtx = {
  request: Request
  params: Record<string, string>
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

async function runHandler(
  handler: ReturnType<typeof createApiHandler>,
  ctx: RouteHandlerCtx,
): Promise<Response> {
  const response = await handler(ctx.request, { params: Promise.resolve(ctx.params) })
  return response instanceof Response ? response : Response.json(response)
}

/**
 * Wrap a `createApiHandler` definition for TanStack Start `server.handlers`.
 *
 * @example
 * ```ts
 * export const Route = createFileRoute('/api/health')({
 *   server: {
 *     handlers: adaptApiHandler({ auth: 'none', rateLimit: 'standard' }, async () => ({
 *       status: 'ok',
 *       timestamp: new Date().toISOString(),
 *     })),
 *   },
 * })
 * ```
 */
export function adaptApiHandler<
  TBody extends z.ZodTypeAny = z.ZodTypeAny,
  TQuery extends z.ZodTypeAny = z.ZodTypeAny,
>(
  options: ApiHandlerOptions<TBody, TQuery>,
  handler: (
    req: Request,
    context: ApiHandlerContext<z.infer<TBody>, z.infer<TQuery>>,
  ) => Promise<unknown>,
): Partial<Record<HttpMethod, (ctx: RouteHandlerCtx) => Promise<Response>>> {
  const nextHandler = createApiHandler(options, handler)
  const invoke = (ctx: RouteHandlerCtx) => runHandler(nextHandler, ctx)

  return {
    GET: invoke,
    POST: invoke,
    PUT: invoke,
    PATCH: invoke,
    DELETE: invoke,
    HEAD: invoke,
    OPTIONS: invoke,
  }
}
