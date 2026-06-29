import { s as logError } from "./convex-errors.mjs";
//#region src/lib/response-json.ts
var ResponseBodyParseError = class extends Error {
	constructor(context, reason, cause) {
		super(getResponseBodyParseErrorMessage(context, reason));
		this.name = "ResponseBodyParseError";
		this.context = context;
		this.reason = reason;
		if (cause !== void 0) this.cause = cause;
	}
};
function getResponseBodyParseErrorMessage(context, reason) {
	if (reason === "empty") return `${context} returned an empty response body.`;
	if (reason === "unreadable") return `${context} response body could not be read.`;
	return `${context} returned invalid JSON.`;
}
async function parseJsonBody(response, options) {
	const { context, allowEmpty = false } = options;
	let rawBody;
	try {
		if (typeof response.text === "function") rawBody = await response.text();
		else if (typeof response.json === "function") {
			const jsonPayload = await response.json();
			rawBody = JSON.stringify(jsonPayload);
		} else throw new TypeError("Response body readers are unavailable.");
	} catch (error) {
		logError(error, `${context}:readResponseBody`);
		throw new ResponseBodyParseError(context, "unreadable", error);
	}
	if (rawBody.trim().length === 0) {
		if (allowEmpty) return null;
		throw new ResponseBodyParseError(context, "empty");
	}
	try {
		return JSON.parse(rawBody);
	} catch (error) {
		logError(error, `${context}:parseJsonBody`);
		throw new ResponseBodyParseError(context, "invalid-json", error);
	}
}
async function parseJsonBodySafely(response, options) {
	try {
		return await parseJsonBody(response, options);
	} catch (error) {
		if (error instanceof ResponseBodyParseError) return null;
		throw error;
	}
}
//#endregion
export { parseJsonBody as n, parseJsonBodySafely as r, ResponseBodyParseError as t };
