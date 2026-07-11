// =============================================================================
// META ADS API ERRORS
// =============================================================================
import { META_AUTH_CODE_VALUES, META_RATE_LIMIT_CODE_VALUES, META_RETRYABLE_CODE_VALUES } from './types';
import { IntegrationApiErrorBase } from '../shared/api-error-base';
// =============================================================================
// CUSTOM ERROR CLASS
// =============================================================================
export class MetaApiError extends IntegrationApiErrorBase {
    readonly code: number;
    readonly subcode?: number;
    readonly type?: string;
    readonly fbTraceId?: string;
    constructor(options: {
        message: string;
        code: number;
        subcode?: number;
        type?: string;
        fbTraceId?: string;
        retryAfterMs?: number;
    }) {
        const authCodes: number[] = META_AUTH_CODE_VALUES;
        const rateLimitCodes: number[] = META_RATE_LIMIT_CODE_VALUES;
        const retryableCodes: number[] = META_RETRYABLE_CODE_VALUES;
        const isAuthError = authCodes.includes(options.code);
        const isRateLimitError = rateLimitCodes.includes(options.code);
        const isRetryable = isRateLimitError || (!isAuthError && retryableCodes.includes(options.code));
        super({
            name: 'MetaApiError',
            message: options.message,
            isRetryable,
            isAuthError,
            isRateLimitError,
            retryAfterMs: options.retryAfterMs,
        });
        this.code = options.code;
        this.subcode = options.subcode;
        this.type = options.type;
        this.fbTraceId = options.fbTraceId;
    }
    toJSON() {
        return this.toJSONBase({
            code: this.code,
            subcode: this.subcode,
            type: this.type,
            fbTraceId: this.fbTraceId,
        });
    }
}
