/**
 * Native Web API response helpers for TanStack Start server handlers.
 *
 * Replaces the former `next/server` shim (`NextResponse`/`NextRequest`/`after`)
 * with plain `Request`/`Response` utilities — no framework coupling.
 */

/**
 * Create a JSON `Response` with optional status and headers.
 */
export function jsonResponse(
  data: unknown,
  init?: ResponseInit & { status?: number; headers?: HeadersInit },
): Response {
  const headers = new Headers(init?.headers);
  if (!headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

/**
 * Create a redirect `Response` (307 by default, matching NextResponse.redirect).
 */
export function redirectResponse(
  url: string | URL,
  status: number = 307,
  headers?: HeadersInit,
): Response {
  const h = new Headers(headers);
  h.set('location', String(url));
  return new Response(null, { status, headers: h });
}

/**
 * Fire-and-forget async work after the response is sent.
 *
 * In TanStack Start (and any modern server runtime with streaming responses),
 * simply not awaiting the promise achieves fire-and-forget semantics. We wrap
 * it in a `void` call to make intent explicit and suppress unhandled rejection
 * warnings by attaching a `.catch(() => {})` sink.
 */
import { logError } from '@/lib/convex-errors';

export function after(callback: () => void | Promise<void>): void {
  void Promise.resolve()
    .then(callback)
    .catch((error) => {
      // Swallow — this is best-effort background work, but still log to Sentry.
      logError(error, '[after] background task failed');
    });
}
