import { describe, expect, it } from 'vitest';
import { hashMetaCustomerEmail, parseEmailLines } from './meta-audience-user-hash';
describe('meta-audience-user-hash', () => {
    it('normalizes and hashes emails', () => {
        const a = hashMetaCustomerEmail('  User@Example.COM ');
        const b = hashMetaCustomerEmail('user@example.com');
        expect(a).toBe(b);
        expect(a).toHaveLength(64);
    });
    it('parses unique email lines', () => {
        expect(parseEmailLines('a@b.com\nA@b.com\nnot-an-email\n')).toEqual(['a@b.com']);
    });
});
