const DM_TYPING_CHANNEL_PREFIX = 'dm:';
export function buildDmTypingChannelId(conversationLegacyId: string): string {
    return `${DM_TYPING_CHANNEL_PREFIX}${conversationLegacyId}`;
}
export function isDmTypingChannelId(channelId: string): boolean {
    return channelId.startsWith(DM_TYPING_CHANNEL_PREFIX);
}
export function parseDmTypingChannelId(channelId: string): string | null {
    if (!isDmTypingChannelId(channelId)) {
        return null;
    }
    const legacyId = channelId.slice(DM_TYPING_CHANNEL_PREFIX.length).trim();
    return legacyId.length > 0 ? legacyId : null;
}
