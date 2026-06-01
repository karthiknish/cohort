import { describe, expect, it } from 'vitest';
import { resolveSelectedChannelId } from './use-channels-data';
const channels = [
    { id: 'team-agency' },
    { id: 'client-client-1' },
];
describe('resolveSelectedChannelId', () => {
    it('auto-selects the visible client channel on first load', () => {
        expect(resolveSelectedChannelId(channels, undefined, 'client-1')).toBe('client-client-1');
    });
    it('returns null when channel selection is explicitly cleared for a DM', () => {
        expect(resolveSelectedChannelId(channels, null, 'client-1')).toBeNull();
    });
    it('honors an explicit channel pick after clearing', () => {
        expect(resolveSelectedChannelId(channels, 'client-client-1', 'client-1')).toBe('client-client-1');
    });
});
