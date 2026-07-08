/**
 * Unsplash image fetcher for PPTX generation.
 *
 * Searches Unsplash for relevant stock photos and returns base64-encoded images
 * suitable for embedding directly into pptxgenjs slides via `slide.addImage({ data })`.
 *
 * Unsplash is used as the primary image source due to its larger library of
 * illustrations and photo variety. Pexels is used as a fallback.
 *
 * API docs: https://unsplash.com/documentation
 * Auth: `Authorization: Client-ID YOUR_ACCESS_KEY` header
 * Search endpoint: GET /search/photos
 * Rate limit: 50 requests/hour (demo), 1000/hour (production)
 */

import type { PexelsImage } from './pexels-images';
import { asErrorMessage } from '@/lib/convex-errors';
import { logger } from '@/lib/logger';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY ?? '';
const UNSPLASH_SECRET_KEY = process.env.UNSPLASH_SECRET_KEY ?? '';
const UNSPLASH_SEARCH_URL = 'https://api.unsplash.com/search/photos';

interface UnsplashPhoto {
    id: string;
    width: number;
    height: number;
    color: string;
    description: string | null;
    alt_description: string | null;
    urls: {
        raw: string;
        full: string;
        regular: string;
        small: string;
        thumb: string;
    };
    links: {
        html: string;
    };
    user: {
        name: string;
        username: string;
    };
}

interface UnsplashSearchResponse {
    results: UnsplashPhoto[];
    total: number;
    total_pages: number;
}

/** In-process cache: query → image results */
const searchCache = new Map<string, PexelsImage[]>();

/**
 * Search Unsplash for images matching a query and return base64-encoded results.
 * Caches results per query to avoid duplicate API calls.
 * Requests landscape orientation for best slide fit.
 */
export async function searchUnsplashImages(query: string, perPage = 8): Promise<PexelsImage[]> {
    if (!UNSPLASH_ACCESS_KEY) {
        logger.warn('[Unsplash] No UNSPLASH_ACCESS_KEY set — skipping Unsplash search');
        return [];
    }
    if (searchCache.has(query)) {
        return searchCache.get(query)!;
    }

    try {
        const params = new URLSearchParams({
            query,
            per_page: String(Math.min(perPage, 30)),
            orientation: 'landscape',
            content_filter: 'low',
        });
        const resp = await fetch(`${UNSPLASH_SEARCH_URL}?${params}`, {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                'Accept-Version': 'v1',
            },
        });

        if (!resp.ok) {
            logger.warn(`[Unsplash] Search failed for "${query}"`, { status: resp.status });
            return [];
        }

        const data = (await resp.json()) as UnsplashSearchResponse;
        if (!data.results?.length) return [];

        // Sort by resolution (highest first) for best quality on slides
        const sorted = data.results.sort((a, b) => (b.width * b.height) - (a.width * a.height));

        const images: PexelsImage[] = [];
        for (const photo of sorted.slice(0, perPage)) {
            try {
                // Use "full" URL with custom params for high quality at reasonable size.
                // raw URL allows custom params: w, h, q, fm, fit, crop.
                const imgUrl = `${photo.urls.raw}&w=1600&q=80&fm=jpg&fit=crop`;
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
                    sourceUrl: photo.links.html,
                    photographer: photo.user.name,
                });
            } catch (err) {
                logger.warn(`[Unsplash] Failed to fetch image ${photo.id}`, { error: asErrorMessage(err) });
            }
        }

        searchCache.set(query, images);
        return images;
    } catch (err) {
        logger.warn(`[Unsplash] Search error for "${query}"`, { error: asErrorMessage(err) });
        return [];
    }
}

/** Fetch a single image from Unsplash for a given query. */
export async function getUnsplashImageForQuery(query: string): Promise<PexelsImage | null> {
    const images = await searchUnsplashImages(query, 3);
    return images[0] ?? null;
}

/**
 * Fetch a single image from Unsplash for a slide topic, trying multiple query variations.
 * Returns the first successful result or null.
 */
export async function getUnsplashImageForTopic(queries: string[]): Promise<PexelsImage | null> {
    for (const query of queries) {
        const image = await getUnsplashImageForQuery(query);
        if (image) return image;
    }
    return null;
}

/** Clear the in-process Unsplash image cache */
export function clearUnsplashCache(): void {
    searchCache.clear();
}
