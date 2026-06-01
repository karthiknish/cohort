import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ConvexHttpClient } from 'convex/browser';
import { createApiHandler } from '@/lib/api-handler';
import { NotFoundError, ServiceUnavailableError, UnauthorizedError } from '@/lib/api-errors';
import { appendSessionCookies } from '@/lib/session-cookies';
import { api } from '/_generated/api';
const bodySchema = z.strictObject({});
function getAppProxySecret(): string {
    const secret = process.env.COHORTS_API_IDEMPOTENCY_SECRET;
    if (!secret) {
        throw new ServiceUnavailableError('Sign-in setup is incomplete on the server. Ensure COHORTS_API_IDEMPOTENCY_SECRET is set in .env.local and in the Convex dashboard (same value).');
    }
    return secret;
}
export const POST = createApiHandler({
    auth: 'required',
    bodySchema,
    rateLimit: 'standard',
    skipIdempotency: true,
}, async (_req, { auth }) => {
    if (!auth.uid) {
        throw new UnauthorizedError('Not authenticated');
    }
    const email = auth.email?.toLowerCase();
    const name = auth.name ?? auth.email ?? 'User';
    const legacyId = auth.uid;
    if (!email) {
        throw new NotFoundError('User email is required to bootstrap profile');
    }
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
        throw new Error('Data backend URL not configured');
    }
    const convex = new ConvexHttpClient(convexUrl);
    const profileResult = await convex.mutation(api.users.ensureProfileOnSignInFromApp, {
        serverSecret: getAppProxySecret(),
        legacyId,
        email,
        name,
    });
    const response = NextResponse.json({
        success: true,
        ok: true,
        legacyId: profileResult.legacyId,
        role: profileResult.role,
        status: profileResult.status,
        agencyId: profileResult.agencyId,
        created: profileResult.created,
    }, { headers: { 'Cache-Control': 'no-store, max-age=0' } });
    appendSessionCookies(response, {
        role: String(profileResult.role),
        status: String(profileResult.status),
        agencyId: String(profileResult.agencyId),
    });
    return response;
});
