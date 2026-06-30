import { describe, expect, it } from 'vitest';
import { buildMetaLookalikeSpec } from './meta-lookalike-spec';
describe('buildMetaLookalikeSpec', () => {
    it('builds custom_ratio spec for valid country and ratio', () => {
        expect(buildMetaLookalikeSpec('us', 0.01)).toEqual({
            type: 'custom_ratio',
            country: 'US',
            ratio: 0.01,
        });
    });
    it('rejects invalid country codes', () => {
        expect(() => buildMetaLookalikeSpec('USA', 0.01)).toThrow(/2-letter/);
    });
    it('rejects ratios outside Meta bounds', () => {
        expect(() => buildMetaLookalikeSpec('US', 0.005)).toThrow(/between/);
        expect(() => buildMetaLookalikeSpec('US', 0.25)).toThrow(/between/);
    });
});
