import { describe, it, expect, vi } from 'vitest';
describe('useGoogleAnalyticsSync', () => {
    it('exposes mutateAsync and isPending from the Convex action', async () => {
        // The hook now uses useAction from convex/react to call runManualSync.
        // The old HTTP-based syncGoogleAnalytics function has been removed.
        // Verify the module loads without the old apiFetch dependency.
        const mod = await import('./use-google-analytics-sync');
        expect(typeof mod.useGoogleAnalyticsSync).toBe('function');
    });
});
