import { describe, expect, it } from 'vitest';
import { creativeCopyIsDirty, mergeMetaAssetFeedSpecForSave, normalizeStringList, } from './creative-editing-utils';
import type { Creative } from './types';
const baseCreative: Creative = {
    providerId: 'facebook',
    creativeId: 'cr-1',
    campaignId: 'camp-1',
    type: 'image',
    status: 'PAUSED',
    headlines: ['Headline A'],
    descriptions: ['Body A'],
    callToAction: 'BOOK_NOW',
    landingPageUrl: 'https://example.com/a',
    assetFeedSpec: JSON.stringify({
        titles: [{ text: 'Headline A' }],
        bodies: [{ text: 'Body A' }],
        link_urls: [{ website_url: 'https://example.com/a' }],
        images: [{ url: 'https://cdn.example.com/img.jpg' }],
    }),
};
describe('creative-editing-utils', () => {
    it('normalizes trimmed string lists', () => {
        expect(normalizeStringList(['  one ', '', 'two'])).toEqual(['one', 'two']);
    });
    it('detects dirty copy state', () => {
        expect(creativeCopyIsDirty(baseCreative, {
            headlines: ['Headline A'],
            descriptions: ['Body A'],
            cta: 'BOOK_NOW',
            landingPage: 'https://example.com/a',
        })).toBe(false);
        expect(creativeCopyIsDirty(baseCreative, {
            headlines: ['Headline B'],
            descriptions: ['Body A'],
            cta: 'BOOK_NOW',
            landingPage: 'https://example.com/a',
        })).toBe(true);
    });
    it('merges headlines and descriptions into Meta asset feed spec', () => {
        const merged = mergeMetaAssetFeedSpecForSave(baseCreative.assetFeedSpec, ['New headline', 'Second headline'], ['New body', 'Alt body'], 'https://example.com/new');
        expect(merged).toBeTruthy();
        const parsed = JSON.parse(merged!) as {
            titles: Array<{
                text: string;
            }>;
            bodies: Array<{
                text: string;
            }>;
            link_urls: Array<{
                website_url: string;
            }>;
            images: Array<{
                url: string;
            }>;
        };
        expect(parsed.titles).toEqual([{ text: 'New headline' }, { text: 'Second headline' }]);
        expect(parsed.bodies).toEqual([{ text: 'New body' }, { text: 'Alt body' }]);
        expect(parsed.link_urls[0]?.website_url).toBe('https://example.com/new');
        expect(parsed.images[0]?.url).toBe('https://cdn.example.com/img.jpg');
    });
});
