import { describe, expect, it, vi, beforeEach } from 'vitest';
const { isCollaborationEmailEnabledForRecipient } = vi.hoisted(() => ({
    isCollaborationEmailEnabledForRecipient: vi.fn(),
}));
vi.mock('@/lib/notifications/collaboration-email-server', () => ({
    isCollaborationEmailEnabledForRecipient,
}));
vi.mock('@/lib/api-handler', () => ({
    createApiHandler: (_options: unknown, handler: unknown) => handler,
}));
import { POST } from './route';
describe('POST /api/integrations/email/send', () => {
    beforeEach(() => {
        isCollaborationEmailEnabledForRecipient.mockReset();
        vi.stubGlobal('fetch', vi.fn());
    });
    it('skips collaboration email when notification prefs disallow it', async () => {
        isCollaborationEmailEnabledForRecipient.mockResolvedValue(false);
        const result = await (POST as Function)(null, {
            auth: { uid: 'u1', email: 'user@example.com', name: null, claims: {}, isCron: false },
            body: {
                messageType: 'collaboration',
                text: 'Hello team',
                metadata: { senderName: 'Alex' },
            },
        });
        expect(result).toEqual({
            success: true,
            data: { sent: false, skipped: 'notification_preferences' },
        });
        expect(fetch).not.toHaveBeenCalled();
    });
});
