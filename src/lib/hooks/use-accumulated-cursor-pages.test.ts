import { describe, expect, it } from 'vitest';
import { areCursorsEqual } from './use-accumulated-cursor-pages';
describe('areCursorsEqual', () => {
    it('treats matching cursor objects as equal', () => {
        expect(areCursorsEqual({ fieldValue: '2024-01-01', legacyId: 'a|1' }, { fieldValue: '2024-01-01', legacyId: 'a|1' })).toBe(true);
    });
    it('treats null and object cursors as different', () => {
        expect(areCursorsEqual(null, { fieldValue: 'x', legacyId: 'y' })).toBe(false);
    });
});
