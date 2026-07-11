/**
 * LinkedIn token refresh without importing `@/services/linkedin-oauth`
 * (which pulls in `@/lib/crypto`). Used from Convex "use node" actions.
 */
import { getAdIntegration, updateIntegrationCredentials } from '@/lib/ads-admin';
import { asErrorMessage } from '@/lib/convex-errors';
import { logger } from '@/lib/logger';
import { calculateBackoffDelay as calculateBackoffDelayLib, sleep } from '@/lib/retry-utils';
import { IntegrationTokenError, type RefreshParams } from './integration-token-refresh-shared';
const LINKEDIN_TOKEN_ENDPOINT = process.env.LINKEDIN_TOKEN_ENDPOINT ?? 'https://www.linkedin.com/oauth/v2/accessToken';
const TOKEN_REFRESH_CONFIG = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
};
function computeExpiry(expiresInSeconds?: number): Date | null {
    if (!expiresInSeconds || !Number.isFinite(expiresInSeconds)) {
        return null;
    }
    return new Date(Date.now() + expiresInSeconds * 1000 - 30 * 1000);
}
function calculateBackoffDelay(attempt: number): number {
    return calculateBackoffDelayLib(attempt, {
        maxRetries: TOKEN_REFRESH_CONFIG.maxRetries,
        baseDelayMs: TOKEN_REFRESH_CONFIG.baseDelayMs,
        maxDelayMs: TOKEN_REFRESH_CONFIG.maxDelayMs,
        jitterFactor: 0.3,
    });
}
export async function refreshLinkedInAccessToken({ userId, clientId }: RefreshParams): Promise<string> {
    const integration = await getAdIntegration({ userId, providerId: 'linkedin', clientId });
    if (!integration?.accessToken) {
        throw new IntegrationTokenError('No LinkedIn access token available', 'linkedin', userId);
    }
    if (!integration?.refreshToken) {
        throw new IntegrationTokenError('No LinkedIn refresh token available', 'linkedin', userId);
    }
    const linkedInClientId = process.env.LINKEDIN_CLIENT_ID;
    const linkedInClientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    if (!linkedInClientId || !linkedInClientSecret) {
        throw new IntegrationTokenError('LinkedIn OAuth credentials are not configured', 'linkedin', userId);
    }
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refreshToken,
        client_id: linkedInClientId,
        client_secret: linkedInClientSecret,
    });
    let lastError: Error | null = null;
    const attemptRefresh = async (attempt: number): Promise<string> => {
        try {
            const response = await fetch(LINKEDIN_TOKEN_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            });
            if (!response.ok) {
                const errorPayload = await response.text();
                let parsedError: {
                    error?: string;
                    error_description?: string;
                } = {};
                try {
                    parsedError = JSON.parse(errorPayload);
                }
                catch {
                    // Not JSON
                }
                const errorMessage = parsedError.error_description ?? parsedError.error ?? errorPayload;
                const isRetryable = response.status >= 500 || response.status === 429;
                if (isRetryable && attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
                    logger.warn(`[LinkedIn Token Refresh] Attempt ${attempt + 1} failed (${response.status}), retrying...`, { userId });
                    lastError = new IntegrationTokenError(`Failed to refresh LinkedIn token (${response.status}): ${errorMessage}`, 'linkedin', userId, { isRetryable: true, httpStatus: response.status });
                    await sleep(calculateBackoffDelay(attempt));
                    return attemptRefresh(attempt + 1);
                }
                if (parsedError.error === 'invalid_grant' || parsedError.error === 'invalid_request') {
                    throw new IntegrationTokenError('LinkedIn refresh token has been revoked or expired. Please reconnect your account.', 'linkedin', userId, { isRetryable: false, httpStatus: response.status });
                }
                throw new IntegrationTokenError(`Failed to refresh LinkedIn token (${response.status}): ${errorMessage}`, 'linkedin', userId, { isRetryable: false, httpStatus: response.status });
            }
            const tokenPayload = (await response.json()) as {
                access_token?: string;
                expires_in?: number;
                refresh_token?: string;
            };
            if (!tokenPayload.access_token) {
                throw new IntegrationTokenError('LinkedIn token response missing access_token', 'linkedin', userId);
            }
            const expiresAt = computeExpiry(tokenPayload.expires_in);
            await updateIntegrationCredentials({
                userId,
                providerId: 'linkedin',
                clientId,
                accessToken: tokenPayload.access_token,
                accessTokenExpiresAt: expiresAt ?? undefined,
                refreshToken: tokenPayload.refresh_token ?? undefined,
            });
            logger.info(`[LinkedIn Token Refresh] Successfully refreshed token for user ${userId}`, {
                expiresIn: tokenPayload.expires_in,
            });
            return tokenPayload.access_token;
        }
        catch (error) {
            if (error instanceof IntegrationTokenError) {
                throw error;
            }
            lastError = error instanceof Error ? error : new Error(asErrorMessage(error));
            if (attempt < TOKEN_REFRESH_CONFIG.maxRetries - 1) {
                logger.warn(`[LinkedIn Token Refresh] Network error on attempt ${attempt + 1}, retrying...`, { message: lastError.message });
                await sleep(calculateBackoffDelay(attempt));
                return attemptRefresh(attempt + 1);
            }
        }
        throw lastError ?? new IntegrationTokenError('LinkedIn token refresh failed after all retries', 'linkedin', userId);
    };
    return attemptRefresh(0);
}
