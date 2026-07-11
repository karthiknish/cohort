/**
 * Pexels image fetcher for PPTX generation.
 *
 * Searches Pexels for relevant stock photos and returns base64-encoded images
 * suitable for embedding directly into pptxgenjs slides via `slide.addImage({ data })`.
 *
 * Images are fetched at "large2x" size (940px wide) which is a good balance of
 * quality and file size for 13.333" wide slides.
 */

import { asErrorMessage } from '@/lib/convex-errors';
import { logger } from '@/lib/logger';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY ?? '';
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
    company: ['modern office building architecture exterior', 'corporate business team meeting boardroom', 'professional business handshake deal'],
    marketing: ['digital marketing strategy laptop analytics', 'social media marketing smartphone campaign', 'online advertising digital screen'],
    goals: ['business growth chart arrow upward success', 'target bullseye dartboard achievement goal', 'mountain peak summit sunrise ambition'],
    scope: ['creative agency team brainstorming whiteboard', 'marketing project planning sticky notes', 'design studio workspace creative process'],
    timeline: ['calendar schedule planning desk organizer', 'project roadmap timeline milestones chart', 'business timeline gantt chart planning'],
    budget: ['financial charts graphs money investment', 'budget planning calculator coins jar', 'investment growth pie chart allocation'],
    roi: ['data analytics dashboard laptop performance', 'profit growth revenue chart upward trend', 'business performance metrics kpi screen'],
    strategy: ['business strategy chess pieces board', 'marketing plan presentation flipchart', 'strategy meeting discussion whiteboard'],
    challenges: ['problem solving puzzle pieces solution', 'business obstacle road barrier challenge', 'mountain climbing rope adventure difficulty'],
    audience: ['diverse customers shopping retail store', 'target audience demographic research survey', 'audience conference presentation crowd'],
    creative: ['creative design colorful desk workspace', 'graphic designer working screen studio', 'brand identity logo design sketch'],
    next: ['business partnership handshake agreement deal', 'team celebration success high five office', 'signing contract agreement pen document'],
    market: ['stock market analysis screen trading', 'competitive business race track strategy', 'industry trend graph data analysis report'],
    campaign: ['advertising billboard city marketing outdoor', 'social media app phone marketing campaign', 'digital campaign creative design studio'],
    measurement: ['analytics dashboard data visualization charts', 'kpi metrics dashboard screen performance', 'business report charts graph analysis'],
    default: ['modern business presentation meeting room', 'professional office workspace desk laptop', 'corporate meeting conference room team'],
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
    if (!PEXELS_API_KEY) {
        logger.warn('[Pexels] No PEXELS_API_KEY set — skipping Pexels search');
        return [];
    }
    if (searchCache.has(query)) {
        return searchCache.get(query)!;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    try {
        const url = `${PEXELS_SEARCH_URL}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&size=large`;
        const resp = await fetch(url, {
            headers: { Authorization: PEXELS_API_KEY },
            signal: controller.signal,
        });

        if (!resp.ok) {
            logger.warn(`[Pexels] Search failed for "${query}"`, { status: resp.status });
            return [];
        }

        const data = (await resp.json()) as PexelsSearchResponse;
        if (!data.photos?.length) return [];

        // Sort by resolution (highest first) for best quality on slides
        const sorted = data.photos.sort((a, b) => (b.width * b.height) - (a.width * a.height));

        const images: PexelsImage[] = [];
        for (const photo of sorted.slice(0, perPage)) {
            const imgController = new AbortController();
            const imgTimeoutId = setTimeout(() => imgController.abort(), 30000);
            try {
                // Use large2x for best quality (1880px wide)
                const imgUrl = photo.src.large2x || photo.src.large || photo.src.landscape;
                const imgResp = await fetch(imgUrl, { signal: imgController.signal });
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
                logger.warn(`[Pexels] Failed to fetch image ${photo.id}`, { error: asErrorMessage(err) });
            } finally {
                clearTimeout(imgTimeoutId);
            }
        }

        if (searchCache.size > 50) {
            // Evict oldest entry
            const firstKey = searchCache.keys().next().value;
            if (firstKey) searchCache.delete(firstKey);
        }
        searchCache.set(query, images);
        return images;
    } catch (err) {
        logger.warn(`[Pexels] Search error for "${query}"`, { error: asErrorMessage(err) });
        return [];
    } finally {
        clearTimeout(timeoutId);
    }
}

/** Fetch a single image for a slide topic, trying multiple query variations. */
export async function getImageForTopic(topic: string): Promise<PexelsImage | null> {
    const queries = getQueriesForTopic(topic);
    // Try Unsplash first (larger library, more illustration variety)
    const { getUnsplashImageForTopic } = await import('./unsplash-images');
    const unsplashResult = await getUnsplashImageForTopic(queries);
    if (unsplashResult) return unsplashResult;
    // Fall back to Pexels
    for (const query of queries) {
        const images = await searchImages(query, 3);
        if (images.length > 0) return images[0] ?? null;
    }
    return null;
}

/**
 * Fetch multiple images for a topic, trying all query variations.
 * Returns up to `count` unique images.
 */
export async function getImagesForTopic(topic: string, count: number): Promise<PexelsImage[]> {
    const queries = getQueriesForTopic(topic);
    const results: PexelsImage[] = [];
    const seenUrls = new Set<string>();

    // Try Unsplash first — fetch from all query variations
    const { searchUnsplashImages } = await import('./unsplash-images');
    for (const query of queries) {
        if (results.length >= count) break;
        const images = await searchUnsplashImages(query, 5);
        for (const img of images) {
            if (results.length >= count) break;
            if (!seenUrls.has(img.sourceUrl)) {
                seenUrls.add(img.sourceUrl);
                results.push(img);
            }
        }
    }

    // Fall back to Pexels for remaining slots
    if (results.length < count) {
        for (const query of queries) {
            if (results.length >= count) break;
            const images = await searchImages(query, 5);
            for (const img of images) {
                if (results.length >= count) break;
                if (!seenUrls.has(img.sourceUrl)) {
                    seenUrls.add(img.sourceUrl);
                    results.push(img);
                }
            }
        }
    }

    return results;
}

/**
 * Pre-fetch images for all slide topics, ensuring no duplicates across slides.
 *
 * Each topic fetches multiple images. When the same topic appears multiple times
 * (e.g. two "strategy" slides), each slide gets a different image from the pool.
 * Cross-topic deduplication ensures the same photo is never used on two different
 * slides, even when different topics return overlapping search results.
 * Returns an array of PexelsImage (or null) in the same order as the input topics.
 */
export async function prefetchSlideImages(topics: string[]): Promise<(PexelsImage | null)[]> {
    // Count how many times each topic appears
    const topicCounts = new Map<string, number>();
    for (const topic of topics) {
        topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
    }

    // Fetch enough unique images per topic — request extra to allow for cross-topic dedup
    const uniqueTopics = [...new Set(topics)];
    const topicImagePools = new Map<string, PexelsImage[]>();
    await Promise.all(
        uniqueTopics.map(async (topic) => {
            const needed = topicCounts.get(topic) ?? 1;
            // Over-fetch by 50% so we have spares after cross-topic dedup removes duplicates
            const images = await getImagesForTopic(topic, Math.max(needed + 2, Math.ceil(needed * 1.5)));
            topicImagePools.set(topic, images);
        }),
    );

    // Assign images to each topic occurrence in order, skipping any image already used
    // by a different topic. This guarantees no photo appears on more than one slide.
    const usedSourceUrls = new Set<string>();
    const topicCursors = new Map<string, number>();
    return topics.map((topic) => {
        const pool = topicImagePools.get(topic) ?? [];
        let cursor = topicCursors.get(topic) ?? 0;
        // Advance past any images already claimed by another topic
        while (cursor < pool.length && usedSourceUrls.has(pool[cursor]!.sourceUrl)) {
            cursor++;
        }
        const image = cursor < pool.length ? pool[cursor]! : null;
        if (image) {
            usedSourceUrls.add(image.sourceUrl);
        }
        topicCursors.set(topic, cursor + 1);
        return image;
    });
}

/** Clear the in-process image cache */
export function clearImageCache(): void {
    searchCache.clear();
}
