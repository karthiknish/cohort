import { describe, expect, it } from 'vitest';
import { computeFunnelVisualWidths } from './insights-proportional-funnel-utils';
describe('computeFunnelVisualWidths', () => {
    it('keeps bottom stage readable when top >> bottom (ad funnel)', () => {
        const widths = computeFunnelVisualWidths([19417, 561, 11]);
        expect(widths[0]).toBe(100);
        expect(widths[1]).toBeGreaterThan(20);
        expect(widths[2]).toBeGreaterThan(20);
        expect(widths[1]).toBeGreaterThan(widths[2]);
    });
    it('returns zeros when top is zero', () => {
        expect(computeFunnelVisualWidths([0, 0, 0])).toEqual([0, 0, 0]);
    });
});
