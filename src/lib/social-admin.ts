import type { ConvexHttpClient } from 'convex/browser';
import { createConvexAdminClient } from '@/lib/convex-admin';
import type { AuthResult } from '@/lib/server-auth';
import { resolveWorkspaceIdForUser } from '@/lib/workspace';
import { logger } from '@/lib/logger';
import { SOCIAL_META_SCOPES } from '@/services/facebook-oauth';
import { normalizeClientId } from '@/lib/normalizeClientId';
type TimestampInput = Date | string | number | unknown | null | undefined;
function toMillis(value: TimestampInput): number | null {
    if (value === null || value === undefined)
        return null;
    if (value instanceof Date) {
        const ms = value.getTime();
        return Number.isNaN(ms) ? null : ms;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'string') {
        const parsed = Date.parse(value);
        return Number.isNaN(parsed) ? null : parsed;
    }
    return null;
}
function getConvexClientForUser(userId: string): ConvexHttpClient | null {
    const auth: AuthResult = {
        uid: userId,
        email: null,
        name: null,
        claims: { provider: 'convex' },
        isCron: false,
    };
    return createConvexAdminClient({ auth });
}
async function executeMutation(convex: ConvexHttpClient, name: string, args: Record<string, unknown>): Promise<unknown> {
    try {
        return await convex.mutation(name as never, args as never);
    }
    catch (error) {
        logger.error(`Convex Mutation Error: ${name}`, error, { type: 'convex_error', method: 'mutation', name });
        throw error;
    }
}
export async function persistSocialIntegrationTokens(options: {
    userId: string;
    clientId?: string | null;
    accessToken: string | null;
    refreshToken?: string | null;
    scopes?: string[];
    status?: 'pending' | 'success' | 'error' | 'never';
    metaUserId?: string | null;
    metaUserName?: string | null;
    accessTokenExpiresAt?: TimestampInput;
    refreshTokenExpiresAt?: TimestampInput;
}): Promise<void> {
    const workspaceId = await resolveWorkspaceIdForUser(options.userId);
    const convex = getConvexClientForUser(options.userId);
    if (!convex) {
        throw new Error('Convex admin client is not configured');
    }
    await executeMutation(convex, 'socialIntegrations:persistIntegrationTokens', {
        workspaceId,
        clientId: normalizeClientId(options.clientId),
        accessToken: options.accessToken,
        refreshToken: options.refreshToken,
        scopes: options.scopes ?? SOCIAL_META_SCOPES,
        status: options.status,
        metaUserId: options.metaUserId,
        metaUserName: options.metaUserName,
        accessTokenExpiresAtMs: options.accessTokenExpiresAt === undefined ? undefined : toMillis(options.accessTokenExpiresAt),
        refreshTokenExpiresAtMs: options.refreshTokenExpiresAt === undefined ? undefined : toMillis(options.refreshTokenExpiresAt),
    });
}
export async function disconnectSocialIntegration(options: {
    userId: string;
    clientId?: string | null;
}): Promise<void> {
    const workspaceId = await resolveWorkspaceIdForUser(options.userId);
    const convex = getConvexClientForUser(options.userId);
    if (!convex) {
        throw new Error('Convex admin client is not configured');
    }
    await executeMutation(convex, 'socialIntegrations:disconnectIntegration', {
        workspaceId,
        clientId: normalizeClientId(options.clientId),
    });
}
