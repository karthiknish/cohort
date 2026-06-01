import { beforeEach, describe, expect, it, vi } from 'vitest';
const apiFetchMock = vi.hoisted(() => vi.fn());
const MockApiClientError = vi.hoisted(() => {
    return class ApiClientError extends Error {
        status?: number;
        constructor(message: string, options: {
            status?: number;
        } = {}) {
            super(message);
            this.name = 'ApiClientError';
            this.status = options.status;
        }
    };
});
vi.mock('@/lib/api-client', () => {
    return {
        apiFetch: apiFetchMock,
        ApiClientError: MockApiClientError,
    };
});
describe('bootstrapAndSyncSession', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('calls bootstrap once and sets session via Set-Cookie on that response', async () => {
        apiFetchMock.mockResolvedValueOnce({
            legacyId: 'user_1',
            role: 'admin',
            status: 'active',
            agencyId: 'user_1',
        });
        const { bootstrapAndSyncSession } = await import('./auth-utils');
        await expect(bootstrapAndSyncSession()).resolves.toEqual({
            legacyId: 'user_1',
            role: 'admin',
            status: 'active',
            agencyId: 'user_1',
        });
        expect(apiFetchMock).toHaveBeenCalledTimes(1);
        expect(apiFetchMock).toHaveBeenCalledWith('/api/auth/bootstrap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
            credentials: 'include',
        });
    });
    it('unwraps success envelope payloads from bootstrap', async () => {
        apiFetchMock.mockResolvedValueOnce({
            success: true,
            data: {
                legacyId: 'user_2',
                role: 'client',
                status: 'pending',
                agencyId: 'user_2',
            },
        });
        const { bootstrapAndSyncSession } = await import('./auth-utils');
        await expect(bootstrapAndSyncSession()).resolves.toEqual({
            legacyId: 'user_2',
            role: 'client',
            status: 'pending',
            agencyId: 'user_2',
        });
    });
    it('surfaces bootstrap failures', async () => {
        apiFetchMock.mockRejectedValueOnce(new MockApiClientError('bootstrap failed', { status: 503 }));
        const { bootstrapAndSyncSession } = await import('./auth-utils');
        await expect(bootstrapAndSyncSession()).rejects.toThrow('bootstrap failed');
    });
});
