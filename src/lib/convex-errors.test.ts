import { ConvexError } from 'convex/values';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { asErrorMessage, extractErrorCode, logError, resolveConvexApiErrorResponse, } from './convex-errors';
describe('convex-errors', () => {
    beforeEach(() => {
        vi.spyOn(console, 'group').mockImplementation(() => { });
        vi.spyOn(console, 'groupEnd').mockImplementation(() => { });
        vi.spyOn(console, 'error').mockImplementation(() => { });
    });
    it('asErrorMessage reads ConvexError message', () => {
        const error = new ConvexError({
            code: 'READ_LIMIT',
            message: 'Too many records requested',
        });
        expect(asErrorMessage(error)).toBe('Too many records requested');
        expect(extractErrorCode(error)).toBe('READ_LIMIT');
    });
    it('asErrorMessage falls back for plain Error and unknown values', () => {
        expect(asErrorMessage(new Error('boom'))).toBe('boom');
        expect(asErrorMessage('plain string')).toBe('plain string');
        expect(asErrorMessage({})).toBe('An unexpected error occurred');
    });
    it('resolveConvexApiErrorResponse maps known codes to HTTP status', () => {
        expect(resolveConvexApiErrorResponse(new ConvexError({ code: 'READ_LIMIT', message: 'Limit hit' }))).toEqual({
            status: 429,
            code: 'READ_LIMIT',
            message: 'Limit hit',
        });
        expect(resolveConvexApiErrorResponse(new ConvexError({ code: 'FORBIDDEN', message: 'Denied' }))).toEqual({
            status: 403,
            code: 'FORBIDDEN',
            message: 'Denied',
        });
    });
    it('resolveConvexApiErrorResponse returns null for non-Convex errors', () => {
        expect(resolveConvexApiErrorResponse(new Error('nope'))).toBeNull();
    });
    it('logError includes context in console group label', () => {
        logError(new Error('fail'), 'MyContext');
        expect(console.group).toHaveBeenCalledWith('[Error] MyContext');
    });
});
