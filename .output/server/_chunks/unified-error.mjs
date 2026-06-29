//#region src/lib/errors/messages.ts
/**
* Centralized Status Messages
* Single source of truth for HTTP status code messages
*/
/**
* Technical error messages (for server-side / API responses)
*/
var API_STATUS_MESSAGES = {
	400: "Bad request",
	401: "Authentication required",
	403: "Permission denied",
	404: "Resource not found",
	408: "Request timeout",
	409: "Conflict occurred",
	413: "File too large",
	415: "Unsupported file type",
	422: "Validation failed",
	429: "Too many requests",
	500: "Internal server error",
	502: "Bad gateway",
	503: "Service temporarily unavailable",
	504: "Gateway timeout"
};
/**
* Get API/technical status message
*/
function getStatusMessage(status) {
	return API_STATUS_MESSAGES[status] ?? "An error occurred";
}
/**
* Check if status code is retryable
*/
function isRetryableStatus(status) {
	return status === 429 || status === 502 || status === 503 || status === 504;
}
/**
* Check if status indicates auth error
*/
function isAuthStatus(status) {
	return status === 401 || status === 403;
}
//#endregion
//#region src/lib/errors/unified-error.ts
/**
* Unified Error Class
* Base error class that consolidates all error handling patterns
*/
/**
* UnifiedError - Consolidated error class for all error scenarios
*
* Combines features from:
* - ApiError (server-side status, code, details)
* - ApiClientError (client-side formatting)
* - IntegrationApiErrorBase (retryable, auth error detection)
*/
var UnifiedError = class UnifiedError extends Error {
	constructor(options) {
		super(options.message || getStatusMessage(options.status ?? 500));
		this.name = "UnifiedError";
		this.status = options.status ?? 500;
		this.code = options.code ?? "INTERNAL_ERROR";
		this.details = options.details;
		this.platform = options.platform;
		this.retryAfterMs = options.retryAfterMs;
		this.isRetryable = options.isRetryable ?? isRetryableStatus(this.status);
		this.isAuthError = options.isAuthError ?? isAuthStatus(this.status);
		this.isRateLimitError = options.isRateLimitError ?? this.status === 429;
		if (options.cause) this.cause = options.cause;
		Error.captureStackTrace?.(this, this.constructor);
	}
	/**
	* Create from an existing error
	*/
	static from(error, defaults) {
		if (error instanceof UnifiedError) return error;
		if (error instanceof Error) {
			const anyError = error;
			return new UnifiedError({
				message: error.message,
				status: anyError.status ?? defaults?.status,
				code: anyError.code ?? defaults?.code,
				details: anyError.details ?? defaults?.details,
				isRetryable: anyError.isRetryable ?? defaults?.isRetryable,
				isAuthError: anyError.isAuthError ?? defaults?.isAuthError,
				isRateLimitError: anyError.isRateLimitError ?? defaults?.isRateLimitError,
				retryAfterMs: anyError.retryAfterMs ?? defaults?.retryAfterMs,
				platform: defaults?.platform,
				cause: error
			});
		}
		return new UnifiedError({
			message: typeof error === "string" ? error : "An error occurred",
			...defaults,
			cause: error
		});
	}
	/**
	* Serialize for API response
	*/
	toJSON() {
		return {
			error: this.message,
			code: this.code,
			status: this.status,
			details: this.details,
			...this.platform && { platform: this.platform },
			...this.isRetryable && { isRetryable: this.isRetryable },
			...this.retryAfterMs && { retryAfterMs: this.retryAfterMs }
		};
	}
};
//#endregion
export { UnifiedError as t };
