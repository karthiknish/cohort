export type GoogleApiErrorPayload = {
    error?: {
        code?: number;
        message?: string;
        status?: string;
        details?: Array<{
            reason?: string;
            domain?: string;
            '@type'?: string;
        }>;
    };
};
export function parseGoogleApiErrorBody(text: string): GoogleApiErrorPayload | null {
    if (!text || text.trim().length === 0)
        return null;
    try {
        return JSON.parse(text) as GoogleApiErrorPayload;
    }
    catch {
        return null;
    }
}
export function getGoogleApiErrorReasons(payload: GoogleApiErrorPayload | null): string[] {
    const reasons: string[] = [];
    if (!payload?.error)
        return reasons;
    const status = payload.error.status;
    if (typeof status === 'string')
        reasons.push(status);
    for (const detail of payload.error.details ?? []) {
        if (typeof detail.reason === 'string')
            reasons.push(detail.reason);
    }
    return reasons;
}
export function isGoogleInsufficientScopeError(payload: GoogleApiErrorPayload | null, message?: string): boolean {
    const combined = [
        ...getGoogleApiErrorReasons(payload),
        payload?.error?.message ?? '',
        message ?? '',
    ]
        .join(' ')
        .toLowerCase();
    return (combined.includes('access_token_scope_insufficient') ||
        combined.includes('insufficient authentication scopes') ||
        combined.includes('insufficient permission'));
}
export function isGoogleRateLimitError(payload: GoogleApiErrorPayload | null, httpStatus?: number): boolean {
    if (httpStatus === 429)
        return true;
    const reasons = getGoogleApiErrorReasons(payload);
    return reasons.some((reason) => reason === 'RATE_LIMIT_EXCEEDED' ||
        reason === 'RESOURCE_EXHAUSTED' ||
        reason.includes('QUOTA'));
}
export async function readGoogleApiError(response: Response): Promise<{
    payload: GoogleApiErrorPayload | null;
    text: string;
}> {
    const text = await response.text().catch(() => '');
    return { payload: parseGoogleApiErrorBody(text), text };
}
export function formatGoogleApiErrorMessage(context: string, httpStatus: number, payload: GoogleApiErrorPayload | null, fallbackText: string): string {
    const apiMessage = payload?.error?.message;
    if (typeof apiMessage === 'string' && apiMessage.length > 0) {
        return `${context} (${httpStatus}): ${apiMessage}`;
    }
    if (fallbackText.length > 0) {
        return `${context} (${httpStatus}): ${fallbackText}`;
    }
    return `${context} (${httpStatus})`;
}
export async function assertGoogleApiOk(response: Response, context: string): Promise<void> {
    if (response.ok)
        return;
    const { payload, text } = await readGoogleApiError(response);
    if (isGoogleInsufficientScopeError(payload, text)) {
        const err = new Error(formatGoogleApiErrorMessage(context, response.status, payload, text));
        (err as Error & {
            code: string;
        }).code = 'ACCESS_TOKEN_SCOPE_INSUFFICIENT';
        throw err;
    }
    if (isGoogleRateLimitError(payload, response.status)) {
        const err = new Error(formatGoogleApiErrorMessage(context, response.status, payload, text));
        (err as Error & {
            code: string;
        }).code = 'RESOURCE_EXHAUSTED';
        throw err;
    }
    throw new Error(formatGoogleApiErrorMessage(context, response.status, payload, text));
}
