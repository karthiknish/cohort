import { describe, expect, it } from 'vitest';
import { buildMetaBusinessLoginUrl, SOCIAL_META_SCOPES } from '@/services/facebook-oauth';
describe('Meta OAuth scopes for socials', () => {
    it('uses organic social scopes when passed explicitly', () => {
        const url = buildMetaBusinessLoginUrl({
            businessConfigId: 'cfg',
            appId: 'app',
            redirectUri: 'https://example.com/callback',
            scopes: SOCIAL_META_SCOPES,
        });
        const parsed = new URL(url);
        const scope = parsed.searchParams.get('scope') ?? '';
        expect(scope).toContain('pages_show_list');
        expect(scope).toContain('read_insights');
        expect(scope).toContain('instagram_manage_insights');
        expect(scope).not.toContain('ads_management');
        expect(scope).not.toContain('ads_read');
    });
});
