import { describe, expect, it } from 'vitest';
import { formatMetaCallToActionLabel, normalizeMetaCallToActionType, resolveMetaCallToActionType, } from './meta-call-to-action';
describe('meta-call-to-action', () => {
    it('normalizes BOOK_NOW from type and ignores localized name', () => {
        expect(resolveMetaCallToActionType({ type: 'BOOK_NOW', name: 'Book Travel' }, undefined)).toBe('BOOK_NOW');
    });
    it('parses legacy stored strings with enum suffix', () => {
        expect(normalizeMetaCallToActionType('Book Travel (BOOK_NOW)')).toBe('BOOK_NOW');
    });
    it('labels BOOK_NOW as Book Now, not Book Travel', () => {
        expect(formatMetaCallToActionLabel('BOOK_NOW')).toBe('Book Now');
        expect(formatMetaCallToActionLabel('Book Travel (BOOK_NOW)')).toBe('Book Now');
    });
    it('keeps BOOK_TRAVEL distinct from BOOK_NOW', () => {
        expect(formatMetaCallToActionLabel('BOOK_TRAVEL')).toBe('Book Travel');
    });
});
