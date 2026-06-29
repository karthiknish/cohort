import { headers } from './server-headers';
import { getToken as getBetterAuthUtilsToken } from '@convex-dev/better-auth/utils';
import { getToken as getNextJsToken } from '@/lib/auth-server';
import { getConvexSiteUrl } from '@/lib/convex-env';
/**
 * Resolves a Convex JWT for API route handlers.
 * Prefers the app proxy so session cookies on the app origin stay valid.
 */
export async function resolveConvexTokenFromRequest(req: Request): Promise<string | null> {
    try {
        const fromNext = await getNextJsToken();
        if (typeof fromNext === 'string' && fromNext.length > 0) {
            return fromNext;
        }
    }
    catch {
        // Fall through.
    }
    try {
        const origin = new URL(req.url).origin;
        const response = await fetch(`${origin}/api/auth/convex/token`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                cookie: req.headers.get('cookie') ?? '',
                accept: 'application/json',
                'accept-encoding': 'identity',
            },
        });
        if (response.ok) {
            const data = (await response.json().catch(() => null)) as {
                token?: unknown;
            } | null;
            if (typeof data?.token === 'string' && data.token.length > 0) {
                return data.token;
            }
        }
    }
    catch {
        // Fall through.
    }
    try {
        const headerList = await headers();
        const mutable = new Headers(headerList);
        mutable.delete('content-length');
        mutable.delete('transfer-encoding');
        mutable.set('accept-encoding', 'identity');
        const result = await getBetterAuthUtilsToken(getConvexSiteUrl(), mutable, { forceRefresh: true });
        if (typeof result?.token === 'string' && result.token.length > 0) {
            return result.token;
        }
    }
    catch {
        // Fall through.
    }
    return null;
}
