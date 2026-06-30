/** Meta ad set placement position and device options for the targeting editor. */
export type MetaPlacementOption = {
    id: string;
    label: string;
};
export const META_FACEBOOK_POSITIONS: MetaPlacementOption[] = [
    { id: 'feed', label: 'Feed' },
    { id: 'right_hand_column', label: 'Right column' },
    { id: 'marketplace', label: 'Marketplace' },
    { id: 'video_feeds', label: 'Video feeds' },
    { id: 'story', label: 'Stories' },
    { id: 'search', label: 'Search' },
    { id: 'instream_video', label: 'In-stream video' },
];
export const META_INSTAGRAM_POSITIONS: MetaPlacementOption[] = [
    { id: 'stream', label: 'Feed' },
    { id: 'story', label: 'Stories' },
    { id: 'explore', label: 'Explore' },
    { id: 'reels', label: 'Reels' },
    { id: 'profile_feed', label: 'Profile feed' },
];
export const META_AUDIENCE_NETWORK_POSITIONS: MetaPlacementOption[] = [
    { id: 'classic', label: 'Native / banner' },
    { id: 'rewarded_video', label: 'Rewarded video' },
    { id: 'instream_video', label: 'In-stream video' },
];
export const META_MESSENGER_POSITIONS: MetaPlacementOption[] = [
    { id: 'messenger_home', label: 'Inbox' },
    { id: 'story', label: 'Stories' },
    { id: 'sponsored_messages', label: 'Sponsored messages' },
];
export const META_DEVICE_PLATFORMS: MetaPlacementOption[] = [
    { id: 'mobile', label: 'Mobile' },
    { id: 'desktop', label: 'Desktop' },
];
export type MetaPlacementDetailDraft = {
    facebookPositions: string[];
    instagramPositions: string[];
    audienceNetworkPositions: string[];
    messengerPositions: string[];
    devicePlatforms: string[];
};
export type MetaPlacementDetailSource = {
    metaPlacements: {
        facebook: string[];
        instagram: string[];
        audienceNetwork: string[];
        messenger: string[];
    };
    devices: string[];
};
export function buildPlacementDetailDraftFromSource(source: MetaPlacementDetailSource): MetaPlacementDetailDraft {
    return {
        facebookPositions: [...source.metaPlacements.facebook],
        instagramPositions: [...source.metaPlacements.instagram],
        audienceNetworkPositions: [...source.metaPlacements.audienceNetwork],
        messengerPositions: [...source.metaPlacements.messenger],
        devicePlatforms: [...source.devices],
    };
}
export function togglePlacementDraftValue(values: string[], id: string): string[] {
    return values.includes(id) ? values.filter((item) => item !== id) : [...values, id];
}
/** Maps UI draft fields to Meta Graph `targeting` keys (only non-empty arrays). */
export function placementDetailToMetaTargetingFields(detail: MetaPlacementDetailDraft): Record<string, string[]> {
    const fields: Record<string, string[]> = {};
    if (detail.facebookPositions.length > 0) {
        fields.facebook_positions = detail.facebookPositions;
    }
    if (detail.instagramPositions.length > 0) {
        fields.instagram_positions = detail.instagramPositions;
    }
    if (detail.audienceNetworkPositions.length > 0) {
        fields.audience_network_positions = detail.audienceNetworkPositions;
    }
    if (detail.messengerPositions.length > 0) {
        fields.messenger_positions = detail.messengerPositions;
    }
    if (detail.devicePlatforms.length > 0) {
        fields.device_platforms = detail.devicePlatforms;
    }
    return fields;
}
