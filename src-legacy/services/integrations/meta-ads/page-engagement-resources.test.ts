import { describe, expect, it, vi, beforeEach } from 'vitest';
const { executeRequest } = vi.hoisted(() => ({
    executeRequest: vi.fn(),
}));
vi.mock('@/services/integrations/shared/base-client', () => ({
    metaAdsClient: { executeRequest },
}));
vi.mock('./client', () => ({
    META_API_BASE: 'https://graph.facebook.com/v25.0',
    appendMetaAuthParams: vi.fn(async ({ params }: {
        params: URLSearchParams;
    }) => {
        params.set('access_token', 'token');
    }),
}));
import { listMetaPageEvents, listMetaPagePosts } from './page-engagement-resources';
describe('page-engagement-resources', () => {
    beforeEach(() => {
        executeRequest.mockReset();
    });
    it('lists published posts for a page', async () => {
        executeRequest.mockResolvedValueOnce({
            payload: {
                data: [
                    {
                        id: '111_222',
                        message: 'Hello world',
                        created_time: '2026-01-01T12:00:00+0000',
                        permalink_url: 'https://facebook.com/111/posts/222',
                        is_published: true,
                    },
                ],
            },
        });
        const posts = await listMetaPagePosts({ accessToken: 'token', pageId: '111' });
        expect(posts).toEqual([
            {
                id: '111_222',
                message: 'Hello world',
                createdTime: '2026-01-01T12:00:00+0000',
                permalinkUrl: 'https://facebook.com/111/posts/222',
                isPublished: true,
            },
        ]);
        expect(executeRequest.mock.calls[0]?.[0]?.url).toContain('/111/published_posts');
    });
    it('lists page events', async () => {
        executeRequest.mockResolvedValueOnce({
            payload: {
                data: [
                    {
                        id: 'evt_1',
                        name: 'Launch party',
                        start_time: '2026-02-01T18:00:00+0000',
                    },
                ],
            },
        });
        const events = await listMetaPageEvents({ accessToken: 'token', pageId: '111' });
        expect(events).toEqual([
            {
                id: 'evt_1',
                name: 'Launch party',
                startTime: '2026-02-01T18:00:00+0000',
                endTime: undefined,
                coverUrl: undefined,
            },
        ]);
        expect(executeRequest.mock.calls[0]?.[0]?.url).toContain('/111/events');
    });
});
