// =============================================================================
// META GRAPH API — Batch requests (up to 50 per call)
// =============================================================================
import { asErrorMessage } from '@/lib/convex-errors';
import { META_BATCH_MAX_REQUESTS } from '@/lib/meta-capi-events';
import { appendMetaAuthParams, executeMetaApiRequest, META_API_BASE } from './client';
export type MetaBatchRequestItem = {
    method: 'GET' | 'POST' | 'DELETE';
    /** Path after API version, e.g. `act_123/campaigns?fields=id,name`. */
    relativeUrl: string;
    /** URL-encoded form body for POST/DELETE when needed. */
    body?: string;
    name?: string;
};
export type MetaBatchResponseItem = {
    code: number;
    headers?: Array<{
        name: string;
        value: string;
    }>;
    body: unknown;
};
function normalizeRelativeUrl(relativeUrl: string): string {
    const trimmed = relativeUrl.trim();
    if (trimmed.startsWith('/'))
        return trimmed.slice(1);
    return trimmed;
}
export async function executeMetaBatch(options: {
    accessToken: string;
    requests: MetaBatchRequestItem[];
    maxRetries?: number;
}): Promise<{
    success: boolean;
    responses: MetaBatchResponseItem[];
    error?: string;
}> {
    const { accessToken, requests, maxRetries = 3 } = options;
    if (requests.length === 0) {
        return { success: false, responses: [], error: 'No batch requests provided' };
    }
    if (requests.length > META_BATCH_MAX_REQUESTS) {
        return {
            success: false,
            responses: [],
            error: `Batch supports at most ${META_BATCH_MAX_REQUESTS} requests`,
        };
    }
    const batchPayload = requests.map((request) => {
        const item: Record<string, string> = {
            method: request.method,
            relative_url: normalizeRelativeUrl(request.relativeUrl),
        };
        if (request.body)
            item.body = request.body;
        if (request.name)
            item.name = request.name;
        return item;
    });
    const params = new URLSearchParams();
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    params.set('batch', JSON.stringify(batchPayload));
    params.set('include_headers', 'false');
    const url = `${META_API_BASE}?${params.toString()}`;
    try {
        const { payload } = await executeMetaApiRequest<Array<{
            code?: number;
            body?: string;
            headers?: Array<{
                name: string;
                value: string;
            }>;
        }> | {
            error?: {
                message?: string;
            };
        }>({
            url,
            accessToken,
            operation: 'executeMetaBatch',
            method: 'POST',
            maxRetries,
        });
        if (!Array.isArray(payload)) {
            const message = payload && typeof payload === 'object' && 'error' in payload
                ? (payload.error as {
                    message?: string;
                })?.message ?? 'Batch failed'
                : 'Unexpected batch response';
            return { success: false, responses: [], error: message };
        }
        const responses: MetaBatchResponseItem[] = payload.map((item) => {
            let parsedBody: unknown = item.body;
            if (typeof item.body === 'string' && item.body.length > 0) {
                try {
                    parsedBody = JSON.parse(item.body) as unknown;
                }
                catch {
                    parsedBody = item.body;
                }
            }
            return {
                code: item.code ?? 0,
                headers: item.headers,
                body: parsedBody,
            };
        });
        const allOk = responses.every((item) => item.code >= 200 && item.code < 300);
        return { success: allOk, responses };
    }
    catch (error) {
        const message = asErrorMessage(error, 'Batch request failed');
        return { success: false, responses: [], error: message };
    }
}
