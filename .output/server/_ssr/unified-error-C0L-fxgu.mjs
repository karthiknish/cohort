//#region node_modules/.nitro/vite/services/ssr/assets/retry-utils-RaSGcWNo.js
var DEFAULT_RETRY_CONFIG = {
	maxRetries: 3,
	baseDelayMs: 1e3,
	maxDelayMs: 3e4,
	jitterFactor: .3
};
function isRetryableStatus$1(status) {
	return status === 429 || status >= 500 && status < 600;
}
function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function createAbortError(message = "Aborted") {
	try {
		return new DOMException(message, "AbortError");
	} catch {
		const error = new Error(message);
		error.name = "AbortError";
		return error;
	}
}
function createTimeoutError(ms, message) {
	const timeoutMessage = message ?? `Request timed out after ${Math.ceil(ms / 1e3)}s.`;
	try {
		return new DOMException(timeoutMessage, "TimeoutError");
	} catch {
		const error = new Error(timeoutMessage);
		error.name = "TimeoutError";
		return error;
	}
}
function isAbortError(error) {
	return error instanceof Error && error.name === "AbortError";
}
function isTimeoutError(error) {
	return error instanceof Error && error.name === "TimeoutError";
}
function composeAbortSignal(options = {}) {
	const { signal, timeoutMs, timeoutMessage } = options;
	const hasTimeout = Number.isFinite(timeoutMs) && typeof timeoutMs === "number" && timeoutMs > 0;
	if (!signal && !hasTimeout) return {
		signal: void 0,
		cleanup: () => {}
	};
	if (signal && !hasTimeout) return {
		signal,
		cleanup: () => {}
	};
	const controller = new AbortController();
	let timeoutId;
	const abortFromSource = () => {
		controller.abort(signal?.reason ?? createAbortError());
	};
	if (signal?.aborted) abortFromSource();
	else if (signal) signal.addEventListener("abort", abortFromSource, { once: true });
	if (hasTimeout && !controller.signal.aborted) timeoutId = setTimeout(() => {
		controller.abort(createTimeoutError(timeoutMs, timeoutMessage));
	}, timeoutMs);
	return {
		signal: controller.signal,
		cleanup: () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (signal) signal.removeEventListener("abort", abortFromSource);
		}
	};
}
function sleepWithSignal(ms, signal) {
	if (!signal) return sleep(ms);
	return new Promise((resolve, reject) => {
		if (signal.aborted) {
			reject(createAbortError());
			return;
		}
		const timeoutId = setTimeout(resolve, ms);
		signal.addEventListener("abort", () => {
			clearTimeout(timeoutId);
			reject(createAbortError());
		}, { once: true });
	});
}
function parseRetryAfterMs(headers) {
	const retryAfterHeader = headers.get("Retry-After");
	if (!retryAfterHeader) return void 0;
	const seconds = parseInt(retryAfterHeader, 10);
	if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1e3;
	const dateMs = Date.parse(retryAfterHeader);
	if (Number.isFinite(dateMs)) return Math.max(0, dateMs - Date.now());
}
function calculateBackoffDelay(attempt, config = DEFAULT_RETRY_CONFIG, rateLimitRetryAfter) {
	if (rateLimitRetryAfter && rateLimitRetryAfter > 0) return Math.min(rateLimitRetryAfter, config.maxDelayMs);
	const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
	const jitter = exponentialDelay * config.jitterFactor * Math.random();
	return Math.min(exponentialDelay + jitter, config.maxDelayMs);
}
//#endregion
//#region node_modules/.nitro/vite/services/ssr/assets/unified-error-C0L-fxgu.js
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
export { isAbortError as a, parseRetryAfterMs as c, composeAbortSignal as i, sleep as l, DEFAULT_RETRY_CONFIG as n, isRetryableStatus$1 as o, calculateBackoffDelay as r, isTimeoutError as s, UnifiedError as t, sleepWithSignal as u };
