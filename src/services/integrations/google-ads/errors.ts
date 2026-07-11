// =============================================================================
// GOOGLE ADS API ERROR CLASS
// =============================================================================
import type { GoogleAdsErrorDetail } from './types';
import { classifyGoogleAdsError } from './error-parser';
import { IntegrationApiErrorBase } from '../shared/api-error-base';
export class GoogleAdsApiError extends IntegrationApiErrorBase {
    readonly httpStatus: number;
    readonly grpcStatus?: string;
    readonly errorCode?: string;
    readonly requestId?: string;
    readonly details?: GoogleAdsErrorDetail[];
    constructor(options: {
        message: string;
        httpStatus: number;
        grpcStatus?: string;
        errorCode?: string;
        requestId?: string;
        details?: GoogleAdsErrorDetail[];
        retryAfterMs?: number;
    }) {
        const classification = classifyGoogleAdsError(options.errorCode, options.grpcStatus, options.httpStatus);
        super({
            name: 'GoogleAdsApiError',
            message: options.message,
            isRetryable: classification.isAuthError ? false : classification.isRetryable,
            isAuthError: classification.isAuthError,
            isRateLimitError: classification.isRateLimitError,
            retryAfterMs: options.retryAfterMs,
        });
        this.httpStatus = options.httpStatus;
        this.grpcStatus = options.grpcStatus;
        this.errorCode = options.errorCode;
        this.requestId = options.requestId;
        this.details = options.details;
    }
    toJSON() {
        return this.toJSONBase({
            httpStatus: this.httpStatus,
            grpcStatus: this.grpcStatus,
            errorCode: this.errorCode,
            requestId: this.requestId,
        });
    }
}
