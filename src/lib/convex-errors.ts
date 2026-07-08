import { ConvexError } from 'convex/values';
import { captureError, captureMessage } from '@/lib/sentry-capture';

const isProduction = typeof process !== 'undefined' && process.env.NODE_ENV === 'production';

/**
 * Standardized error data passed to ConvexError.
 * Must match the definition in convex/errors.ts
 */
export type AppErrorData = {
    code: string;
    message: string;
    details?: Record<string, unknown>;
};
/**
 * Logs an error to the console with rich context in non-production environments.
 * Always forwards to Sentry. Use this in catch blocks before displaying a toast.
 */
export function logError(error: unknown, context?: string | Record<string, unknown>): void {
    const code = extractErrorCode(error);
    const details = extractErrorDetails(error);
    const message = asErrorMessage(error);
    const contextString = typeof context === 'string' ? context : undefined;
    const extraContext = typeof context === 'object' && context !== null ? context : undefined;
    // Console logging for debugging only
    if (!isProduction) {
        console.group(`[Error]${contextString ? ` ${contextString}` : ''}`);
        console.error('Message:', message);
        if (code)
            console.error('Code:', code);
        if (details)
            console.error('Details:', details);
        if (extraContext)
            console.error('Context:', extraContext);
        console.error('Raw Error:', error);
        console.groupEnd();
    }
    // Forward to Sentry (no-op if SDK is not initialized)
    captureError(error, {
        tags: code ? { error_code: code } : undefined,
        extra: { context: contextString, details, ...extraContext },
    });
}
/**
 * Logs a warning to Sentry and the console in non-production environments.
 * Use this for recoverable issues that should not surface a user-facing error.
 */
export function logWarning(message: string, context?: string | Record<string, unknown>, extra?: Record<string, unknown>): void {
    const contextString = typeof context === 'string' ? context : undefined;
    const contextExtra = typeof context === 'object' && context !== null ? context : undefined;
    if (!isProduction) {
        console.warn(`[Warning]${contextString ? ` ${contextString}` : ''}`, message, contextExtra ?? '', extra ?? '');
    }
    captureMessage(message, 'warning', {
        extra: { context: contextString, ...contextExtra, ...extra },
    });
}
/**
 * Extract a user-friendly error message from unknown error values,
 * including standardized ConvexError objects.
 */
export function asErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
    if (error instanceof ConvexError) {
        const data = error.data as AppErrorData;
        return data?.message?.trim() || fallback;
    }
    if (error instanceof Error) {
        return error.message.trim() || fallback;
    }
    if (typeof error === 'string') {
        return error.trim() || fallback;
    }
    return fallback;
}
/**
 * Extract the standardized error code from a ConvexError.
 */
export function extractErrorCode(error: unknown): string | null {
    if (error instanceof ConvexError) {
        const data = error.data as AppErrorData;
        return data?.code ?? null;
    }
    return null;
}
/**
 * Extract the details from a ConvexError.
 */
export function extractErrorDetails(error: unknown): Record<string, unknown> | null {
    if (error instanceof ConvexError) {
        const data = error.data as AppErrorData;
        return data?.details ?? null;
    }
    return null;
}
/** Matches `ErrorCode.BASE.READ_LIMIT` from convex/errors.ts */
export function isReadLimitAppError(error: unknown): boolean {
    return extractErrorCode(error) === 'READ_LIMIT';
}
/** Matches `ErrorCode.BASE.CONFLICT` from convex/errors.ts */
export function isConflictAppError(error: unknown): boolean {
    return extractErrorCode(error) === 'CONFLICT';
}
/** Matches `ErrorCode.RESOURCE.NOT_FOUND` from convex/errors.ts */
export function isNotFoundAppError(error: unknown): boolean {
    return extractErrorCode(error) === 'NOT_FOUND';
}
/** Matches `ErrorCode.INTEGRATION.INSUFFICIENT_SCOPE` from convex/errors.ts */
export function isIntegrationScopeAppError(error: unknown): boolean {
    return extractErrorCode(error) === 'INTEGRATION_INSUFFICIENT_SCOPE';
}
/** Map ConvexError to HTTP status for API routes (createApiHandler). */
export function resolveConvexApiErrorResponse(error: unknown): {
    status: number;
    code: string;
    message: string;
} | null {
    if (!(error instanceof ConvexError)) {
        return null;
    }
    const data = error.data as AppErrorData;
    const code = data?.code ?? 'INTERNAL_ERROR';
    const message = data?.message ?? 'An error occurred';
    const statusByCode: Record<string, number> = {
        TOO_MANY_REQUESTS: 429,
        READ_LIMIT: 429,
        CONFLICT: 409,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        BAD_REQUEST: 400,
        INVALID_INPUT: 400,
        VALIDATION_ERROR: 400,
        INVALID_STATE: 400,
        WORKSPACE_ACCESS_DENIED: 403,
        ADMIN_REQUIRED: 403,
    };
    return {
        status: statusByCode[code] ?? 500,
        code,
        message,
    };
}
export function mapGoogleAnalyticsIntegrationError(error: unknown): string {
    if (isIntegrationScopeAppError(error)) {
        return 'Google Analytics needs updated permissions. Disconnect the integration, then connect again and approve all requested access.';
    }
    const code = extractErrorCode(error);
    switch (code) {
        case 'INTEGRATION_NOT_FOUND':
        case 'MISSING_TOKEN':
            return 'Google Analytics is not connected. Please reconnect your account and try again.';
        case 'INTEGRATION_NOT_CONFIGURED':
            return 'Google Analytics setup is incomplete. Select a property in the setup dialog before syncing.';
        case 'INTEGRATION_EXPIRED':
            return 'Your Google Analytics connection has expired. Disconnect and reconnect to continue.';
        case 'INTERNAL_ERROR':
            return 'Something went wrong while setting up Google Analytics. The property was saved, and sync will retry automatically. If the problem persists, please reconnect your account.';
        case 'UNAUTHORIZED':
            return 'You must be signed in to manage Google Analytics.';
        case 'WORKSPACE_ACCESS_DENIED':
            return 'You do not have access to this workspace.';
        default:
            return asErrorMessage(error);
    }
}
