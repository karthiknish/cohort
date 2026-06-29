//#region src/lib/retry-utils.ts
var DEFAULT_RETRY_CONFIG = {
	maxRetries: 3,
	baseDelayMs: 1e3,
	maxDelayMs: 3e4,
	jitterFactor: .3
};
function isRetryableStatus(status) {
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
export { isRetryableStatus as a, sleep as c, isAbortError as i, sleepWithSignal as l, calculateBackoffDelay as n, isTimeoutError as o, composeAbortSignal as r, parseRetryAfterMs as s, DEFAULT_RETRY_CONFIG as t };
