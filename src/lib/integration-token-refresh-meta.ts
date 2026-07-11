/**
 * Meta-only token refresh — kept separate from integration-token-refresh.ts so
 * Convex node actions do not bundle google-oauth → @/lib/crypto (node:crypto).
 */
import { getAdIntegration, updateIntegrationCredentials } from '@/lib/ads-admin';
import { logger } from '@/lib/logger';
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils';
import { META_API_VERSION, META_OAUTH_TOKEN_ENDPOINT } from '@/services/integrations/meta-ads/constants';
import { IntegrationTokenError, type RefreshParams } from './integration-token-refresh-shared';
const TOKEN_REFRESH_CONFIG = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    jitterFactor: 0.3,
};
function computeExpiry(expiresInSeconds?: number): Date | null {
    if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) {
        return null;
    }
    return new Date(Date.now() + expiresInSeconds * 1000 - 30 * 1000);
}
export async function refreshMetaAccessToken({ userId, clientId }: RefreshParams): Promise<string> {
    logger.info('[Meta Token Refresh] Starting token refresh', { userId, clientId, apiVersion: META_API_VERSION });
    const integration = await getAdIntegration({ userId, providerId: 'facebook', clientId });
    if (!integration?.accessToken) {
        logger.error('[Meta Token Refresh] No access token available', { userId, clientId });
        throw new IntegrationTokenError('No Meta Ads access token available', 'facebook', userId);
    }
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    if (!appId || !appSecret) {
        logger.error('[Meta Token Refresh] App credentials not configured');
        throw new IntegrationTokenError('Meta app credentials are not configured', 'facebook', userId);
    }
    const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: integration.accessToken,
    });
    let lastError: Error | null = null;
    const attemptRefresh = async (attempt: number): Promise<string> => {
        try {
            const response = await fetch(`${META_OAUTH_TOKEN_ENDPOINT}?${params.toString()}`);
            if (!response.ok) {
                const errorPayload = await response.text();
                let parsedError: {
                    error?: {
                        message?: string;
                        code?: number;
                    };
                } = {};
                try {
                    parsedError = JSON.parse(errorPayload);
                }
                catch {
                    // Not JSON
                }
                const errorMessage = parsedError?.error?.message ?? errorPayload;
                const isRetryable = response.status >= 500 || response.status === 429;
                if (isRetryable && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
                    lastError = new IntegrationTokenError(`Failed to refresh Meta Ads token (${response.status}): ${errorMessage}`, 'facebook', userId, { isRetryable: true, httpStatus: response.status });
                    await sleep(calculateBackoffDelayLib(attempt, TOKEN_REFRESH_CONFIG));
                    return attemptRefresh(attempt + 1);
                }
                throw new IntegrationTokenError(`Failed to refresh Meta Ads token (${response.status}): ${errorMessage}`, 'facebook', userId, { isRetryable: false, httpStatus: response.status });
            }
            const tokenPayload = (await response.json()) as {
                access_token?: string;
                expires_in?: number;
            };
            if (!tokenPayload.access_token) {
                throw new IntegrationTokenError('Meta token response missing access_token', 'facebook', userId);
            }
            const expiresAt = computeExpiry(tokenPayload.expires_in);
            await updateIntegrationCredentials({
                userId,
                providerId: 'facebook',
                clientId,
                accessToken: tokenPayload.access_token,
                accessTokenExpiresAt: expiresAt ?? undefined,
            });
            return tokenPayload.access_token;
        }
        catch (error) {
            if (error instanceof IntegrationTokenError) {
                throw error;
            }
            lastError = error instanceof Error ? error : new Error('Unknown error');
            if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
                await sleep(calculateBackoffDelayLib(attempt, TOKEN_REFRESH_CONFIG));
                return attemptRefresh(attempt + 1);
            }
        }
        throw lastError ?? new IntegrationTokenError('Meta token refresh failed after all retries', 'facebook', userId);
    };
    return attemptRefresh(0);
}
