import { describe, expect, it } from 'vitest';
import { getPreviewSocialConnectionStatus, getPreviewSocialOverview } from './socials';

describe('preview social data', () => {
    it('returns connected sample status with page bindings', () => {
        const status = getPreviewSocialConnectionStatus();
        expect(status.connected).toBe(true);
        expect(status.setupComplete).toBe(true);
        expect(status.facebookPageId).toBeTruthy();
        expect(status.instagramBusinessId).toBeTruthy();
    });

    it('returns non-empty overview metrics for each surface', () => {
        for (const surface of ['facebook', 'instagram'] as const) {
            const overview = getPreviewSocialOverview(surface);
            expect(overview.surface).toBe(surface);
            expect(overview.rowCount).toBeGreaterThan(0);
            expect(overview.reach).toBeGreaterThan(0);
            expect(overview.impressions).toBeGreaterThan(0);
            expect(overview.engagedUsers).toBeGreaterThan(0);
        }
    });
});
