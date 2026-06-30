import { asRecord } from './shared';
/** Shape Meta accepts on `destination_spec` when creating ad creatives (v25+). */
export type MetaApiDestinationSpec = {
    website?: {
        optimization?: {
            status?: string;
            type?: string;
        };
    };
};
/** Normalized destination spec stored in app state / Convex (display + round-trip). */
export type MetaStoredDestinationSpec = {
    url?: string;
    fallback_url?: string;
    additional_urls?: string[];
    website?: MetaApiDestinationSpec['website'];
};
export function toMetaApiDestinationSpec(destinationSpec?: MetaStoredDestinationSpec | MetaApiDestinationSpec | Record<string, unknown> | null): MetaApiDestinationSpec | undefined {
    if (!destinationSpec || typeof destinationSpec !== 'object') {
        return undefined;
    }
    const websiteRecord = asRecord(destinationSpec.website);
    if (!websiteRecord) {
        return undefined;
    }
    const optimizationRecord = asRecord(websiteRecord.optimization);
    const optimization = optimizationRecord
        ? {
            status: typeof optimizationRecord.status === 'string' ? optimizationRecord.status : undefined,
            type: typeof optimizationRecord.type === 'string' ? optimizationRecord.type : undefined,
        }
        : undefined;
    return {
        website: {
            ...(optimization?.status || optimization?.type ? { optimization } : {}),
        },
    };
}
/** Strip unknown Meta keys; keep UI url fields and `website` for API round-trip. */
export function sanitizeMetaDestinationSpec(destinationSpec?: MetaStoredDestinationSpec | Record<string, unknown> | null): MetaStoredDestinationSpec | undefined {
    if (!destinationSpec || typeof destinationSpec !== 'object') {
        return undefined;
    }
    const url = typeof destinationSpec.url === 'string' ? destinationSpec.url.trim() : undefined;
    const fallbackUrl = typeof destinationSpec.fallback_url === 'string' ? destinationSpec.fallback_url.trim() : undefined;
    const additionalUrls = Array.isArray(destinationSpec.additional_urls)
        ? destinationSpec.additional_urls.flatMap((entry) => {
            if (typeof entry !== 'string')
                return [];
            const trimmed = entry.trim();
            return trimmed ? [trimmed] : [];
        })
        : undefined;
    const website = toMetaApiDestinationSpec(destinationSpec)?.website;
    if (!url && !fallbackUrl && (!additionalUrls || additionalUrls.length === 0) && !website) {
        return undefined;
    }
    const sanitized: MetaStoredDestinationSpec = {};
    if (url)
        sanitized.url = url;
    if (fallbackUrl)
        sanitized.fallback_url = fallbackUrl;
    if (additionalUrls && additionalUrls.length > 0)
        sanitized.additional_urls = additionalUrls;
    if (website)
        sanitized.website = website;
    return sanitized;
}
/** Landing page updates use `linkUrl` on object_story_spec — not `destination_spec.url`. */
export function mergeMetaDestinationSpec(destinationSpec?: MetaStoredDestinationSpec | Record<string, unknown> | null, _linkUrl?: string): MetaApiDestinationSpec | undefined {
    return toMetaApiDestinationSpec(destinationSpec);
}
