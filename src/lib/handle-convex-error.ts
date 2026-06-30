'use client';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { notifyFailure } from '@/lib/notifications';
export type ReportConvexFailureOptions = {
    error: unknown;
    context: string;
    title?: string;
    fallbackMessage?: string;
    message?: string;
};
/**
 * Log a Convex/client error and show a normalized failure toast.
 * Preferred catch helper for mutations and actions.
 */
export function reportConvexFailure(options: ReportConvexFailureOptions): string | number {
    logError(options.error, options.context);
    return notifyFailure({
        title: options.title,
        error: options.error,
        message: options.message,
        fallbackMessage: options.fallbackMessage,
    });
}
/**
 * Extract a user-facing message without showing a toast (e.g. inline Alert state).
 */
export function convexErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
    const message = asErrorMessage(error).trim();
    if (message && message !== 'An unexpected error occurred') {
        return message;
    }
    return fallback;
}
