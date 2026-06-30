import { describe, expect, it } from 'vitest';
import { buildMetaTargetingFromNormalized, mergeMetaTargetingWithExisting, normalizeMetaGeoLocationType, } from './meta-targeting-serialize';
describe('mergeMetaTargetingWithExisting', () => {
    it('preserves custom audiences when patch only updates interests', () => {
        const existing = {
            geo_locations: { countries: ['US'] },
            custom_audiences: [{ id: '123', name: 'VIP' }],
            publisher_platforms: ['facebook', 'instagram'],
            interests: [{ id: '1', name: 'Old interest' }],
        };
        const patch = {
            interests: [{ id: '2', name: 'New interest' }],
            age_min: 25,
        };
        const merged = mergeMetaTargetingWithExisting(existing, patch);
        expect(merged.interests).toEqual(patch.interests);
        expect(merged.custom_audiences).toEqual(existing.custom_audiences);
        expect(merged.publisher_platforms).toEqual(existing.publisher_platforms);
    });
});
describe('buildMetaTargetingFromNormalized', () => {
    it('includes publisher_platforms when provided in source', () => {
        const built = buildMetaTargetingFromNormalized({
            demographics: { ageRanges: [], genders: [] },
            locations: { included: [], excluded: [] },
            interests: [],
            publisherPlatforms: ['facebook', 'instagram'],
        });
        expect(built.publisher_platforms).toEqual(['facebook', 'instagram']);
    });
    it('includes position and device fields when placementDetail is set', () => {
        const built = buildMetaTargetingFromNormalized({
            demographics: { ageRanges: [], genders: [] },
            locations: { included: [], excluded: [] },
            interests: [],
            placementDetail: {
                facebookPositions: ['feed'],
                instagramPositions: ['story'],
                audienceNetworkPositions: [],
                messengerPositions: [],
                devicePlatforms: ['mobile'],
            },
        });
        expect(built.facebook_positions).toEqual(['feed']);
        expect(built.instagram_positions).toEqual(['story']);
        expect(built.device_platforms).toEqual(['mobile']);
    });
    it('maps zip geo types to zips array', () => {
        const targeting = buildMetaTargetingFromNormalized({
            demographics: { ageRanges: [], genders: [] },
            locations: {
                included: [{ id: 'US:90210', name: 'Beverly Hills', type: 'zip' }],
                excluded: [],
            },
            interests: [],
        });
        expect(targeting.geo_locations).toEqual({
            zips: [{ key: 'US:90210' }],
        });
    });
});
describe('normalizeMetaGeoLocationType', () => {
    it('normalizes adgeolocation types', () => {
        expect(normalizeMetaGeoLocationType('country')).toBe('country');
        expect(normalizeMetaGeoLocationType('region')).toBe('region');
        expect(normalizeMetaGeoLocationType('zip')).toBe('zip');
    });
});
