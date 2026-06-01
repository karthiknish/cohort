import { describe, expect, it } from 'vitest';
import { navItemsForRole } from '@/lib/access-control/dashboard-access';
import { DASHBOARD_NAVIGATION_GROUPS } from './dashboard-navigation';
describe('dashboard-navigation', () => {
    it('uses Workspace and Agency tools groups', () => {
        expect(DASHBOARD_NAVIGATION_GROUPS.some((group) => group.id === 'team-ops')).toBe(false);
        const agency = DASHBOARD_NAVIGATION_GROUPS.find((group) => group.id === 'agency-tools');
        expect(agency?.label).toBe('Agency tools');
        expect(agency?.items.some((item) => item.href === '/dashboard/analytics')).toBe(true);
        expect(agency?.items.some((item) => item.href === '/dashboard/proposals')).toBe(true);
    });
    it('includes Workspace core links for all roles', () => {
        const navByRole = new Map((['admin', 'team', 'client'] as const).map((role) => [role, navItemsForRole(role)]));
        for (const [, nav] of navByRole) {
            const core = nav.find((group) => group.id === 'core');
            expect(core?.items.some((item) => item.href === '/dashboard/projects')).toBe(true);
            expect(core?.items.some((item) => item.href === '/dashboard/tasks')).toBe(true);
        }
    });
    it('shows Analytics and Proposals but not Ads/Socials for clients', () => {
        const nav = navItemsForRole('client');
        const agency = nav.find((group) => group.id === 'agency-tools');
        const hrefs = agency?.items.map((item) => item.href) ?? [];
        expect(hrefs).toContain('/dashboard/analytics');
        expect(hrefs).toContain('/dashboard/proposals');
        expect(hrefs).not.toContain('/dashboard/ads');
        expect(hrefs).not.toContain('/dashboard/socials');
    });
});
