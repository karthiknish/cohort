import { describe, expect, it } from 'vitest';
import { NOTIFICATIONS_FOR_YOU_PAGE_SIZE, NOTIFICATIONS_INBOX_PAGE_SIZE, NOTIFICATIONS_PAGE_PAGE_SIZE, } from './pagination';
describe('notification pagination constants', () => {
    it('uses a consistent page size across surfaces', () => {
        expect(NOTIFICATIONS_INBOX_PAGE_SIZE).toBe(20);
        expect(NOTIFICATIONS_PAGE_PAGE_SIZE).toBe(20);
        expect(NOTIFICATIONS_FOR_YOU_PAGE_SIZE).toBe(20);
    });
});
