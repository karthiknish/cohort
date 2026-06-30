/**
 * Pexels image fetcher for PPTX generation.
 *
 * Searches Pexels for relevant stock photos and returns base64-encoded images
 * suitable for embedding directly into pptxgenjs slides via `slide.addImage({ data })`.
 *
 * Images are fetched at "large2x" size (940px wide) which is a good balance of
 * quality and file size for 13.333" wide slides.
 */

const PEXELS_API_KEY = '563492ad6f917000010000014693fcc8e1ce4d7e99bb3737eeb445e7';
const PEXELS_SEARCH_URL = 'https://api.pexels.com/v1/search';

export interface PexelsImage {
    /** Base64-encoded image data with MIME prefix, ready for pptxgenjs `data` option */
    base64: string;
    /** Original Pexels photo URL (for attribution) */
    sourceUrl: string;
    /** Photographer name (for attribution) */
    photographer: string;
}

/** Search query → Pexels search term mapping for slide topics */
const TOPIC_QUERIES: Record<string, string[]> = {
    company: ['modern office building architecture', 'corporate business team meeting', 'professional business handshake'],
    marketing: ['digital marketing strategy laptop', 'social media marketing smartphone', 'online advertising screen'],
    goals: ['business growth arrow upward', 'target bullseye achievement', 'mountain peak summit sunrise'],
    scope: ['creative agency team brainstorming', 'marketing project whiteboard planning', 'design studio workspace'],
    timeline: ['calendar schedule planning desk', 'project roadmap sticky notes', 'business timeline milestones'],
    budget: ['financial charts graphs money', 'investment growth coins jar', 'calculator budget planning'],
    roi: ['data analytics dashboard laptop', 'profit growth chart upward', 'business performance metrics screen'],
    strategy: ['business strategy chess pieces', 'marketing plan presentation', 'strategy meeting discussion'],
    challenges: ['problem solving jigsaw puzzle', 'business obstacle road barrier', 'mountain climbing rope adventure'],
    audience: ['diverse people crowd market', 'customer target shopping retail', 'audience conference presentation'],
    creative: ['creative design colorful desk', 'graphic designer working screen', 'brand identity logo design'],
    next: ['business partnership handshake', 'team celebration success high five', 'signing contract agreement pen'],
    market: ['stock market analysis screen', 'competitive business race track', 'industry trend graph data'],
    campaign: ['advertising billboard city', 'social media app phone marketing', 'digital campaign creative design'],
    measurement: ['analytics dashboard data visualization', 'kpi metrics dashboard screen', 'business report charts graph'],
    default: ['modern business presentation', 'professional office workspace desk', 'corporate meeting conference room'],
};

export function getQueriesForTopic(topic: string): string[] {
    return TOPIC_QUERIES[topic] ?? TOPIC_QUERIES.default!;
}

/** Determine the best topic keyword from a slide title */
export function topicFromTitle(title: string): string {
    const lower = title.toLowerCase();
    if (lower.includes('executive') || lower.includes('summary')) return 'company';
    if (lower.includes('company') || lower.includes('about') || lower.includes('overview')) return 'company';
    if (lower.includes('market') || lower.includes('competitive') || lower.includes('analysis')) return 'market';
    if (lower.includes('advertis') || lower.includes('channel') || lower.includes('campaign')) return 'campaign';
    if (lower.includes('goal') || lower.includes('objective') || lower.includes('target')) return 'goals';
    if (lower.includes('scope') || lower.includes('service') || lower.includes('deliver')) return 'scope';
    if (lower.includes('timeline') || lower.includes('schedule') || lower.includes('phase')) return 'timeline';
    if (lower.includes('budget') || lower.includes('cost') || lower.includes('invest')) return 'budget';
    if (lower.includes('roi') || lower.includes('return') || lower.includes('projection') || lower.includes('growth')) return 'roi';
    if (lower.includes('strategy') || lower.includes('approach') || lower.includes('plan')) return 'strategy';
    if (lower.includes('challenge') || lower.includes('problem') || lower.includes('barrier')) return 'challenges';
    if (lower.includes('audience') || lower.includes('customer') || lower.includes('persona')) return 'audience';
    if (lower.includes('creative') || lower.includes('design') || lower.includes('content')) return 'creative';
    if (lower.includes('measure') || lower.includes('report') || lower.includes('kpi') || lower.includes('dashboard')) return 'measurement';
    if (lower.includes('next') || lower.includes('step') || lower.includes('action')) return 'next';
    return 'default';
}

interface PexelsSearchResponse {
    photos: Array<{
        id: number;
        src: { large: string; large2x: string; landscape: string; original: string };
        url: string;
        photographer: string;
        alt: string;
        width: number;
        height: number;
    }>;
}

/** In-process cache: query → image results */
const searchCache = new Map<string, PexelsImage[]>();

/**
 * Search Pexels for images matching a query and return base64-encoded results.
 * Caches results per query to avoid duplicate API calls.
 * Requests landscape orientation and sorts by relevance for best results.
 */
export async function searchImages(query: string, perPage = 8): Promise<PexelsImage[]> {
    if (searchCache.has(query)) {
        return searchCache.get(query)!;
    }

    try {
        const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=large`;
        const resp = await fetch(url, {
            headers: { Authorization: PEXELS_API_KEY },
        });

        if (!resp.ok) {
            console.warn(`[Pexels] Search failed for "${query}": ${resp.status}`);
            return [];
        }

        const data = (await resp.json()) as PexelsSearchResponse;
        if (!data.photos?.length) return [];

        // Sort by resolution (highest first) for best quality on slides
        const sorted = data.photos.sort((a, b) => (b.width * b.height) - (a.width * a.height));

        const images: PexelsImage[] = [];
        for (const photo of sorted.slice(0, perPage)) {
            try {
                // Use large2x for best quality (1880px wide)
                const imgUrl = photo.src.large2x || photo.src.large || photo.src.landscape;
                const imgResp = await fetch(imgUrl);
                if (!imgResp.ok) continue;

                const arrayBuffer = await imgResp.arrayBuffer();
                const buffer = new Uint8Array(arrayBuffer);
                let binary = '';
                const chunkSize = 0x8000;
                for (let i = 0; i < buffer.length; i += chunkSize) {
                    const chunk = buffer.subarray(i, Math.min(i + chunkSize, buffer.length));
                    binary += String.fromCharCode.apply(null, Array.from(chunk));
                }
                const base64 = `image/jpeg;base64,${btoa(binary)}`;

                images.push({
                    base64,
                    sourceUrl: photo.url,
                    photographer: photo.photographer,
                });
            } catch (err) {
                console.warn(`[Pexels] Failed to fetch image ${photo.id}:`, err);
            }
        }

        searchCache.set(query, images);
        return images;
    } catch (err) {
        console.warn(`[Pexels] Search error for "${query}":`, err);
        return [];
    }
}

/** Fetch a single image for a slide topic, trying multiple query variations. */
export async function getImageForTopic(topic: string): Promise<PexelsImage | null> {
    const queries = getQueriesForTopic(topic);
    for (const query of queries) {
        const images = await searchImages(query, 3);
        if (images.length > 0) return images[0] ?? null;
    }
    return null;
}

/**
 * Pre-fetch images for all slide topics in parallel.
 * Returns a map of topic → PexelsImage (or null if unavailable).
 */
export async function prefetchSlideImages(topics: string[]): Promise<Map<string, PexelsImage | null>> {
    const uniqueTopics = [...new Set(topics)];
    const results = await Promise.all(
        uniqueTopics.map(async (topic) => [topic, await getImageForTopic(topic)] as const),
    );
    return new Map(results);
}

/** Clear the in-process image cache */
export function clearImageCache(): void {
    searchCache.clear();
}
