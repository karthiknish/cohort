import { describe, expect, it } from 'vitest';
import { accessDeniedContentForPath, canAccessPath } from '@/lib/access-control/dashboard-access';
describe('role access gate paths', () => {
    it('allows clients on proposals and analytics', () => {
        expect(canAccessPath('client', '/dashboard/proposals')).toBe(true);
        expect(canAccessPath('client', '/dashboard/proposals/deck-1')).toBe(true);
        expect(canAccessPath('client', '/dashboard/analytics')).toBe(true);
    });
    it('blocks clients on agency ads and socials', () => {
        expect(canAccessPath('client', '/dashboard/ads')).toBe(false);
        expect(canAccessPath('client', '/dashboard/socials')).toBe(false);
        expect(accessDeniedContentForPath('/dashboard/ads', 'client')?.title).toContain('Agency');
    });
});
