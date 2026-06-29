import { describe, expect, it } from 'vitest';
import { getEmailProviderLink } from './auth-utils';

describe('getEmailProviderLink', () => {
    it('resolves Gmail for gmail.com addresses', () => {
        expect(getEmailProviderLink('user@gmail.com')).toEqual({
            url: 'https://mail.google.com',
            label: 'Open Gmail',
        });
    });
    it('resolves Outlook for outlook.com / hotmail.com addresses', () => {
        expect(getEmailProviderLink('user@outlook.com')?.label).toBe('Open Outlook');
        expect(getEmailProviderLink('user@hotmail.com')?.label).toBe('Open Outlook');
    });
    it('resolves Yahoo and iCloud providers', () => {
        expect(getEmailProviderLink('user@yahoo.com')?.label).toBe('Open Yahoo Mail');
        expect(getEmailProviderLink('user@icloud.com')?.label).toBe('Open iCloud Mail');
    });
    it('is case-insensitive and trims surrounding whitespace', () => {
        expect(getEmailProviderLink('  User@GMAIL.com  ')?.url).toBe('https://mail.google.com');
    });
    it('returns null for unknown / custom business domains', () => {
        expect(getEmailProviderLink('user@acme.studio')).toBeNull();
        expect(getEmailProviderLink('user@company.co.in')).toBeNull();
    });
    it('returns null for malformed input without a domain', () => {
        expect(getEmailProviderLink('not-an-email')).toBeNull();
        expect(getEmailProviderLink('')).toBeNull();
    });
});
