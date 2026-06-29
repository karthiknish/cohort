import { o as __toESM } from "../_runtime.mjs";
import { S as require_jsx_runtime, n as convexClient, p as defu, r as useConvexAuth, u as useQuery, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { _t as createFetch, ct as BetterAuthError, ft as env, t as capitalizeFirstLetter } from "../_libs/@better-auth/core+[...].mjs";
import { D as getPreviewClients, Q as isPreviewModeEnabled, f as getPreviewActivity, z as getPreviewNotifications } from "./preview-data-CXkRNfsX.mjs";
import { _ as isValidRedirectUrl } from "./utils-hh4sibN0.mjs";
import { s as logError } from "./convex-errors-sHK0JmZ7.mjs";
import { n as api } from "./rate-limiter-convex-Dr72h9nD.mjs";
import { i as getPublicEnv } from "./auth-server-DbIghuG9.mjs";
import { a as isAbortError, i as composeAbortSignal, s as isTimeoutError, t as UnifiedError, u as sleepWithSignal } from "./unified-error-C0L-fxgu.mjs";
import { i as atom, n as listenKeys, r as onMount } from "../_libs/better-auth+nanostores.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/response-json-BbkVj2Q1.js
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
//#region node_modules/.nitro/vite/services/ssr/assets/auth-context-fSvbzOPB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function checkHasPath(url) {
	try {
		return (new URL(url).pathname.replace(/\/+$/, "") || "/") !== "/";
	} catch {
		throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`);
	}
}
function assertHasProtocol(url) {
	try {
		const parsedUrl = new URL(url);
		if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") throw new BetterAuthError(`Invalid base URL: ${url}. URL must include 'http://' or 'https://'`);
	} catch (error) {
		if (error instanceof BetterAuthError) throw error;
		throw new BetterAuthError(`Invalid base URL: ${url}. Please provide a valid base URL.`, { cause: error });
	}
}
function withPath(url, path = "/api/auth") {
	assertHasProtocol(url);
	if (checkHasPath(url)) return url;
	const trimmedUrl = url.replace(/\/+$/, "");
	if (!path || path === "/") return trimmedUrl;
	path = path.startsWith("/") ? path : `/${path}`;
	return `${trimmedUrl}${path}`;
}
function validateProxyHeader(header, type) {
	if (!header || header.trim() === "") return false;
	if (type === "proto") return header === "http" || header === "https";
	if (type === "host") {
		if ([
			/\.\./,
			/\0/,
			/[\s]/,
			/^[.]/,
			/[<>'"]/,
			/javascript:/i,
			/file:/i,
			/data:/i
		].some((pattern) => pattern.test(header))) return false;
		return /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*(:[0-9]{1,5})?$/.test(header) || /^(\d{1,3}\.){3}\d{1,3}(:[0-9]{1,5})?$/.test(header) || /^\[[0-9a-fA-F:]+\](:[0-9]{1,5})?$/.test(header) || /^localhost(:[0-9]{1,5})?$/i.test(header);
	}
	return false;
}
function getBaseURL(url, path, request, loadEnv, trustedProxyHeaders) {
	if (url) return withPath(url, path);
	if (loadEnv !== false) {
		const fromEnv = env.BETTER_AUTH_URL || env.NEXT_PUBLIC_BETTER_AUTH_URL || env.PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_BETTER_AUTH_URL || env.NUXT_PUBLIC_AUTH_URL || (env.BASE_URL !== "/" ? env.BASE_URL : void 0);
		if (fromEnv) return withPath(fromEnv, path);
	}
	const fromRequest = request?.headers.get("x-forwarded-host");
	const fromRequestProto = request?.headers.get("x-forwarded-proto");
	if (fromRequest && fromRequestProto && trustedProxyHeaders) {
		if (validateProxyHeader(fromRequestProto, "proto") && validateProxyHeader(fromRequest, "host")) try {
			return withPath(`${fromRequestProto}://${fromRequest}`, path);
		} catch (_error) {}
	}
	if (request) {
		const url = getOrigin(request.url);
		if (!url) throw new BetterAuthError("Could not get origin from request. Please provide a valid base URL.");
		return withPath(url, path);
	}
	if (typeof window !== "undefined" && window.location) return withPath(window.location.origin, path);
}
function getOrigin(url) {
	try {
		const parsedUrl = new URL(url);
		return parsedUrl.origin === "null" ? null : parsedUrl.origin;
	} catch {
		return null;
	}
}
var PROTO_POLLUTION_PATTERNS = {
	proto: /"(?:_|\\u0{2}5[Ff]){2}(?:p|\\u0{2}70)(?:r|\\u0{2}72)(?:o|\\u0{2}6[Ff])(?:t|\\u0{2}74)(?:o|\\u0{2}6[Ff])(?:_|\\u0{2}5[Ff]){2}"\s*:/,
	constructor: /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/,
	protoShort: /"__proto__"\s*:/,
	constructorShort: /"constructor"\s*:/
};
var JSON_SIGNATURE = /^\s*["[{]|^\s*-?\d{1,16}(\.\d{1,17})?([Ee][+-]?\d+)?\s*$/;
var SPECIAL_VALUES = {
	true: true,
	false: false,
	null: null,
	undefined: void 0,
	nan: NaN,
	infinity: Number.POSITIVE_INFINITY,
	"-infinity": Number.NEGATIVE_INFINITY
};
var ISO_DATE_REGEX = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,7}))?(?:Z|([+-])(\d{2}):(\d{2}))$/;
function isValidDate(date) {
	return date instanceof Date && !isNaN(date.getTime());
}
function parseISODate(value) {
	const match = ISO_DATE_REGEX.exec(value);
	if (!match) return null;
	const [, year, month, day, hour, minute, second, ms, offsetSign, offsetHour, offsetMinute] = match;
	const date = new Date(Date.UTC(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10), parseInt(hour, 10), parseInt(minute, 10), parseInt(second, 10), ms ? parseInt(ms.padEnd(3, "0"), 10) : 0));
	if (offsetSign) {
		const offset = (parseInt(offsetHour, 10) * 60 + parseInt(offsetMinute, 10)) * (offsetSign === "+" ? -1 : 1);
		date.setUTCMinutes(date.getUTCMinutes() + offset);
	}
	return isValidDate(date) ? date : null;
}
function betterJSONParse(value, options = {}) {
	const { strict = false, warnings = false, reviver, parseDates = true } = options;
	if (typeof value !== "string") return value;
	const trimmed = value.trim();
	if (trimmed.length > 0 && trimmed[0] === "\"" && trimmed.endsWith("\"") && !trimmed.slice(1, -1).includes("\"")) return trimmed.slice(1, -1);
	const lowerValue = trimmed.toLowerCase();
	if (lowerValue.length <= 9 && lowerValue in SPECIAL_VALUES) return SPECIAL_VALUES[lowerValue];
	if (!JSON_SIGNATURE.test(trimmed)) {
		if (strict) throw new SyntaxError("[better-json] Invalid JSON");
		return value;
	}
	if (Object.entries(PROTO_POLLUTION_PATTERNS).some(([key, pattern]) => {
		const matches = pattern.test(trimmed);
		if (matches && warnings) console.warn(`[better-json] Detected potential prototype pollution attempt using ${key} pattern`);
		return matches;
	}) && strict) throw new Error("[better-json] Potential prototype pollution attempt detected");
	try {
		const secureReviver = (key, value) => {
			if (key === "__proto__" || key === "constructor" && value && typeof value === "object" && "prototype" in value) {
				if (warnings) console.warn(`[better-json] Dropping "${key}" key to prevent prototype pollution`);
				return;
			}
			if (parseDates && typeof value === "string") {
				const date = parseISODate(value);
				if (date) return date;
			}
			return reviver ? reviver(key, value) : value;
		};
		return JSON.parse(trimmed, secureReviver);
	} catch (error) {
		if (strict) throw error;
		return value;
	}
}
function parseJSON(value, options = { strict: true }) {
	return betterJSONParse(value, options);
}
var redirectPlugin = {
	id: "redirect",
	name: "Redirect",
	hooks: { onSuccess(context) {
		if (context.data?.url && context.data?.redirect) {
			if (typeof window !== "undefined" && window.location) {
				if (window.location) try {
					window.location.href = context.data.url;
				} catch {}
			}
		}
	} }
};
var isServer = () => typeof window === "undefined";
var useAuthQuery = (initializedAtom, path, $fetch, options) => {
	const value = /* @__PURE__ */ atom({
		data: null,
		error: null,
		isPending: true,
		isRefetching: false,
		refetch: (queryParams) => fn(queryParams)
	});
	const fn = async (queryParams) => {
		return new Promise((resolve) => {
			const opts = typeof options === "function" ? options({
				data: value.get().data,
				error: value.get().error,
				isPending: value.get().isPending
			}) : options;
			$fetch(path, {
				...opts,
				query: {
					...opts?.query,
					...queryParams?.query
				},
				async onSuccess(context) {
					value.set({
						data: context.data,
						error: null,
						isPending: false,
						isRefetching: false,
						refetch: value.value.refetch
					});
					await opts?.onSuccess?.(context);
				},
				async onError(context) {
					const { request } = context;
					const retryAttempts = typeof request.retry === "number" ? request.retry : request.retry?.attempts;
					const retryAttempt = request.retryAttempt || 0;
					if (retryAttempts && retryAttempt < retryAttempts) return;
					const isUnauthorized = context.error.status === 401;
					value.set({
						error: context.error,
						data: isUnauthorized ? null : value.get().data,
						isPending: false,
						isRefetching: false,
						refetch: value.value.refetch
					});
					await opts?.onError?.(context);
				},
				async onRequest(context) {
					const currentValue = value.get();
					value.set({
						isPending: currentValue.data === null,
						data: currentValue.data,
						error: null,
						isRefetching: true,
						refetch: value.value.refetch
					});
					await opts?.onRequest?.(context);
				}
			}).catch((error) => {
				value.set({
					error,
					data: value.get().data,
					isPending: false,
					isRefetching: false,
					refetch: value.value.refetch
				});
			}).finally(() => {
				resolve(void 0);
			});
		});
	};
	initializedAtom = Array.isArray(initializedAtom) ? initializedAtom : [initializedAtom];
	let isMounted = false;
	for (const initAtom of initializedAtom) initAtom.subscribe(async () => {
		if (isServer()) return;
		if (isMounted) await fn();
		else onMount(value, () => {
			const timeoutId = setTimeout(async () => {
				if (!isMounted) {
					await fn();
					isMounted = true;
				}
			}, 0);
			return () => {
				value.off();
				initAtom.off();
				clearTimeout(timeoutId);
			};
		});
	});
	return value;
};
var kBroadcastChannel = Symbol.for("better-auth:broadcast-channel");
var now$1 = () => Math.floor(Date.now() / 1e3);
var WindowBroadcastChannel = class {
	listeners = /* @__PURE__ */ new Set();
	name;
	constructor(name = "better-auth.message") {
		this.name = name;
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	post(message) {
		if (typeof window === "undefined") return;
		try {
			localStorage.setItem(this.name, JSON.stringify({
				...message,
				timestamp: now$1()
			}));
		} catch {}
	}
	setup() {
		if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {};
		const handler = (event) => {
			if (event.key !== this.name) return;
			const message = JSON.parse(event.newValue ?? "{}");
			if (message?.event !== "session" || !message?.data) return;
			this.listeners.forEach((listener) => listener(message));
		};
		window.addEventListener("storage", handler);
		return () => {
			window.removeEventListener("storage", handler);
		};
	}
};
function getGlobalBroadcastChannel(name = "better-auth.message") {
	if (!globalThis[kBroadcastChannel]) globalThis[kBroadcastChannel] = new WindowBroadcastChannel(name);
	return globalThis[kBroadcastChannel];
}
var kFocusManager = Symbol.for("better-auth:focus-manager");
var WindowFocusManager = class {
	listeners = /* @__PURE__ */ new Set();
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	setFocused(focused) {
		this.listeners.forEach((listener) => listener(focused));
	}
	setup() {
		if (typeof window === "undefined" || typeof document === "undefined" || typeof window.addEventListener === "undefined") return () => {};
		const visibilityHandler = () => {
			if (document.visibilityState === "visible") this.setFocused(true);
		};
		document.addEventListener("visibilitychange", visibilityHandler, false);
		return () => {
			document.removeEventListener("visibilitychange", visibilityHandler, false);
		};
	}
};
function getGlobalFocusManager() {
	if (!globalThis[kFocusManager]) globalThis[kFocusManager] = new WindowFocusManager();
	return globalThis[kFocusManager];
}
var kOnlineManager = Symbol.for("better-auth:online-manager");
var WindowOnlineManager = class {
	listeners = /* @__PURE__ */ new Set();
	isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	setOnline(online) {
		this.isOnline = online;
		this.listeners.forEach((listener) => listener(online));
	}
	setup() {
		if (typeof window === "undefined" || typeof window.addEventListener === "undefined") return () => {};
		const onOnline = () => this.setOnline(true);
		const onOffline = () => this.setOnline(false);
		window.addEventListener("online", onOnline, false);
		window.addEventListener("offline", onOffline, false);
		return () => {
			window.removeEventListener("online", onOnline, false);
			window.removeEventListener("offline", onOffline, false);
		};
	}
};
function getGlobalOnlineManager() {
	if (!globalThis[kOnlineManager]) globalThis[kOnlineManager] = new WindowOnlineManager();
	return globalThis[kOnlineManager];
}
var now = () => Math.floor(Date.now() / 1e3);
/**
* Rate limit: don't refetch on focus if a session request was made within this many seconds
*/
var FOCUS_REFETCH_RATE_LIMIT_SECONDS = 5;
function createSessionRefreshManager(opts) {
	const { sessionAtom, sessionSignal, $fetch, options = {} } = opts;
	const refetchInterval = options.sessionOptions?.refetchInterval ?? 0;
	const refetchOnWindowFocus = options.sessionOptions?.refetchOnWindowFocus ?? true;
	const refetchWhenOffline = options.sessionOptions?.refetchWhenOffline ?? false;
	const state = {
		lastSync: 0,
		lastSessionRequest: 0,
		cachedSession: void 0
	};
	const shouldRefetch = () => {
		return refetchWhenOffline || getGlobalOnlineManager().isOnline;
	};
	const triggerRefetch = (event) => {
		if (!shouldRefetch()) return;
		if (event?.event === "storage") {
			state.lastSync = now();
			sessionSignal.set(!sessionSignal.get());
			return;
		}
		const currentSession = sessionAtom.get();
		const fetchSessionWithRefresh = () => {
			state.lastSessionRequest = now();
			$fetch("/get-session").then(async (res) => {
				let data = res.data;
				let error = res.error || null;
				if (data?.needsRefresh) try {
					const refreshRes = await $fetch("/get-session", { method: "POST" });
					data = refreshRes.data;
					error = refreshRes.error || null;
				} catch {}
				const sessionData = data?.session && data?.user ? data : null;
				sessionAtom.set({
					...currentSession,
					data: sessionData,
					error
				});
				state.lastSync = now();
				sessionSignal.set(!sessionSignal.get());
			}).catch(() => {});
		};
		if (event?.event === "poll") {
			fetchSessionWithRefresh();
			return;
		}
		if (event?.event === "visibilitychange") {
			if (now() - state.lastSessionRequest < FOCUS_REFETCH_RATE_LIMIT_SECONDS) return;
			state.lastSessionRequest = now();
		}
		if (event?.event === "visibilitychange") {
			fetchSessionWithRefresh();
			return;
		}
		if (currentSession?.data === null || currentSession?.data === void 0) {
			state.lastSync = now();
			sessionSignal.set(!sessionSignal.get());
		}
	};
	const broadcastSessionUpdate = (trigger) => {
		getGlobalBroadcastChannel().post({
			event: "session",
			data: { trigger },
			clientId: Math.random().toString(36).substring(7)
		});
	};
	const setupPolling = () => {
		if (refetchInterval && refetchInterval > 0) state.pollInterval = setInterval(() => {
			if (sessionAtom.get()?.data) triggerRefetch({ event: "poll" });
		}, refetchInterval * 1e3);
	};
	const setupBroadcast = () => {
		state.unsubscribeBroadcast = getGlobalBroadcastChannel().subscribe(() => {
			triggerRefetch({ event: "storage" });
		});
	};
	const setupFocusRefetch = () => {
		if (!refetchOnWindowFocus) return;
		state.unsubscribeFocus = getGlobalFocusManager().subscribe(() => {
			triggerRefetch({ event: "visibilitychange" });
		});
	};
	const setupOnlineRefetch = () => {
		state.unsubscribeOnline = getGlobalOnlineManager().subscribe((online) => {
			if (online) triggerRefetch({ event: "visibilitychange" });
		});
	};
	const init = () => {
		setupPolling();
		setupBroadcast();
		setupFocusRefetch();
		setupOnlineRefetch();
		getGlobalBroadcastChannel().setup();
		getGlobalFocusManager().setup();
		getGlobalOnlineManager().setup();
	};
	const cleanup = () => {
		if (state.pollInterval) {
			clearInterval(state.pollInterval);
			state.pollInterval = void 0;
		}
		if (state.unsubscribeBroadcast) {
			state.unsubscribeBroadcast();
			state.unsubscribeBroadcast = void 0;
		}
		if (state.unsubscribeFocus) {
			state.unsubscribeFocus();
			state.unsubscribeFocus = void 0;
		}
		if (state.unsubscribeOnline) {
			state.unsubscribeOnline();
			state.unsubscribeOnline = void 0;
		}
		state.lastSync = 0;
		state.lastSessionRequest = 0;
		state.cachedSession = void 0;
	};
	return {
		init,
		cleanup,
		triggerRefetch,
		broadcastSessionUpdate
	};
}
function getSessionAtom($fetch, options) {
	const $signal = /* @__PURE__ */ atom(false);
	const session = useAuthQuery($signal, "/get-session", $fetch, { method: "GET" });
	let broadcastSessionUpdate = () => {};
	onMount(session, () => {
		const refreshManager = createSessionRefreshManager({
			sessionAtom: session,
			sessionSignal: $signal,
			$fetch,
			options
		});
		refreshManager.init();
		broadcastSessionUpdate = refreshManager.broadcastSessionUpdate;
		return () => {
			refreshManager.cleanup();
		};
	});
	return {
		session,
		$sessionSignal: $signal,
		broadcastSessionUpdate: (trigger) => broadcastSessionUpdate(trigger)
	};
}
var resolvePublicAuthUrl = (basePath) => {
	if (typeof process === "undefined") return void 0;
	const path = basePath ?? "/api/auth";
	if (process.env.NEXT_PUBLIC_AUTH_URL) return process.env.NEXT_PUBLIC_AUTH_URL;
	if (typeof window === "undefined") {
		if (process.env.NEXTAUTH_URL) try {
			return process.env.NEXTAUTH_URL;
		} catch {}
		if (process.env.VERCEL_URL) try {
			const protocol = process.env.VERCEL_URL.startsWith("http") ? "" : "https://";
			return `${new URL(`${protocol}${process.env.VERCEL_URL}`).origin}${path}`;
		} catch {}
	}
};
var getClientConfig = (options, loadEnv) => {
	const isCredentialsSupported = "credentials" in Request.prototype;
	const baseURL = getBaseURL(options?.baseURL, options?.basePath, void 0, loadEnv) ?? resolvePublicAuthUrl(options?.basePath) ?? "/api/auth";
	const pluginsFetchPlugins = options?.plugins?.flatMap((plugin) => plugin.fetchPlugins).filter((pl) => pl !== void 0) || [];
	const lifeCyclePlugin = {
		id: "lifecycle-hooks",
		name: "lifecycle-hooks",
		hooks: {
			onSuccess: options?.fetchOptions?.onSuccess,
			onError: options?.fetchOptions?.onError,
			onRequest: options?.fetchOptions?.onRequest,
			onResponse: options?.fetchOptions?.onResponse
		}
	};
	const { onSuccess: _onSuccess, onError: _onError, onRequest: _onRequest, onResponse: _onResponse, ...restOfFetchOptions } = options?.fetchOptions || {};
	const $fetch = createFetch({
		baseURL,
		...isCredentialsSupported ? { credentials: "include" } : {},
		method: "GET",
		jsonParser(text) {
			if (!text) return null;
			return parseJSON(text, { strict: false });
		},
		customFetchImpl: fetch,
		...restOfFetchOptions,
		plugins: [
			lifeCyclePlugin,
			...restOfFetchOptions.plugins || [],
			...options?.disableDefaultFetchPlugins ? [] : [redirectPlugin],
			...pluginsFetchPlugins
		]
	});
	const { $sessionSignal, session, broadcastSessionUpdate } = getSessionAtom($fetch, options);
	const plugins = options?.plugins || [];
	let pluginsActions = {};
	const pluginsAtoms = {
		$sessionSignal,
		session
	};
	const pluginPathMethods = {
		"/sign-out": "POST",
		"/revoke-sessions": "POST",
		"/revoke-other-sessions": "POST",
		"/delete-user": "POST"
	};
	const atomListeners = [{
		signal: "$sessionSignal",
		matcher(path) {
			return path === "/sign-out" || path === "/update-user" || path === "/update-session" || path === "/sign-up/email" || path === "/sign-in/email" || path === "/delete-user" || path === "/verify-email" || path === "/revoke-sessions" || path === "/revoke-session" || path === "/change-email";
		},
		callback(path) {
			if (path === "/sign-out") broadcastSessionUpdate("signout");
			else if (path === "/update-user" || path === "/update-session") broadcastSessionUpdate("updateUser");
		}
	}];
	for (const plugin of plugins) {
		if (plugin.getAtoms) Object.assign(pluginsAtoms, plugin.getAtoms?.($fetch));
		if (plugin.pathMethods) Object.assign(pluginPathMethods, plugin.pathMethods);
		if (plugin.atomListeners) atomListeners.push(...plugin.atomListeners);
	}
	const $store = {
		notify: (signal) => {
			pluginsAtoms[signal].set(!pluginsAtoms[signal].get());
		},
		listen: (signal, listener) => {
			pluginsAtoms[signal].subscribe(listener);
		},
		atoms: pluginsAtoms
	};
	for (const plugin of plugins) if (plugin.getActions) pluginsActions = defu(plugin.getActions?.($fetch, $store, options) ?? {}, pluginsActions);
	return {
		get baseURL() {
			return baseURL;
		},
		pluginsActions,
		pluginsAtoms,
		pluginPathMethods,
		atomListeners,
		$fetch,
		$store
	};
};
function isAtom(value) {
	return typeof value === "object" && value !== null && "get" in value && typeof value.get === "function" && "lc" in value && typeof value.lc === "number";
}
function getMethod(path, knownPathMethods, args) {
	const method = knownPathMethods[path];
	const { fetchOptions, query: _query, ...body } = args || {};
	if (method) return method;
	if (fetchOptions?.method) return fetchOptions.method;
	if (body && Object.keys(body).length > 0) return "POST";
	return "GET";
}
function createDynamicPathProxy(routes, client, knownPathMethods, atoms, atomListeners) {
	function createProxy(path = []) {
		return new Proxy(function() {}, {
			get(_, prop) {
				if (typeof prop !== "string") return;
				if (prop === "then" || prop === "catch" || prop === "finally") return;
				const fullPath = [...path, prop];
				let current = routes;
				for (const segment of fullPath) if (current && typeof current === "object" && segment in current) current = current[segment];
				else {
					current = void 0;
					break;
				}
				if (typeof current === "function") return current;
				if (isAtom(current)) return current;
				return createProxy(fullPath);
			},
			apply: async (_, __, args) => {
				const routePath = "/" + path.map((segment) => segment.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)).join("/");
				const arg = args[0] || {};
				const fetchOptions = args[1] || {};
				const { query, fetchOptions: argFetchOptions, ...body } = arg;
				const options = {
					...fetchOptions,
					...argFetchOptions
				};
				const method = getMethod(routePath, knownPathMethods, arg);
				return await client(routePath, {
					...options,
					body: method === "GET" ? void 0 : {
						...body,
						...options?.body || {}
					},
					query: query || options?.query,
					method,
					async onSuccess(context) {
						await options?.onSuccess?.(context);
						if (!atomListeners || options.disableSignal) return;
						/**
						* We trigger listeners
						*/
						const matches = atomListeners.filter((s) => s.matcher(routePath));
						if (!matches.length) return;
						const visited = /* @__PURE__ */ new Set();
						for (const match of matches) {
							const signal = atoms[match.signal];
							if (!signal) return;
							if (visited.has(match.signal)) continue;
							visited.add(match.signal);
							/**
							* To avoid race conditions we set the signal in a setTimeout
							*/
							const val = signal.get();
							setTimeout(() => {
								signal.set(!val);
							}, 10);
							match.callback?.(routePath);
						}
					}
				});
			}
		});
	}
	return createProxy();
}
/**
* Subscribe to store changes and get store's value.
*
* Can be used with store builder too.
*
* ```js
* import { useStore } from 'nanostores/react'
*
* import { router } from '../store/router'
*
* export const Layout = () => {
*   let page = useStore(router)
*   if (page.route === 'home') {
*     return <HomePage />
*   } else {
*     return <Error404 />
*   }
* }
* ```
*
* @param store Store instance.
* @returns Store value.
*/
function useStore(store, options = {}) {
	const snapshotRef = (0, import_react.useRef)(store.get());
	const { keys, deps = [store, keys] } = options;
	const subscribe = (0, import_react.useCallback)((onChange) => {
		const emitChange = (value) => {
			if (snapshotRef.current === value) return;
			snapshotRef.current = value;
			onChange();
		};
		emitChange(store.value);
		if (keys?.length) return listenKeys(store, keys, emitChange);
		return store.listen(emitChange);
	}, deps);
	const get = () => snapshotRef.current;
	return (0, import_react.useSyncExternalStore)(subscribe, get, get);
}
function getAtomKey(str) {
	return `use${capitalizeFirstLetter(str)}`;
}
function createAuthClient(options) {
	const { pluginPathMethods, pluginsActions, pluginsAtoms, $fetch, $store, atomListeners } = getClientConfig(options);
	const resolvedHooks = {};
	for (const [key, value] of Object.entries(pluginsAtoms)) resolvedHooks[getAtomKey(key)] = () => useStore(value);
	return createDynamicPathProxy({
		...pluginsActions,
		...resolvedHooks,
		$fetch,
		$store
	}, $fetch, pluginPathMethods, pluginsAtoms, atomListeners);
}
var authClient = createAuthClient({
	baseURL: getPublicEnv("NEXT_PUBLIC_SITE_URL") ?? getPublicEnv("NEXT_PUBLIC_APP_URL") ?? (typeof window !== "undefined" ? window.location.origin : void 0),
	sessionOptions: {
		refetchInterval: 0,
		refetchOnWindowFocus: true,
		refetchWhenOffline: false
	},
	plugins: [convexClient()]
});
function safeTtlMs(ttlMs) {
	const ttl = Number(ttlMs);
	if (!Number.isFinite(ttl) || ttl <= 0) return 0;
	return Math.floor(ttl);
}
var CacheManager = class {
	constructor(backend, opts = {}) {
		this.backend = backend;
		this.inFlight = /* @__PURE__ */ new Map();
		this.counters = {
			hits: 0,
			misses: 0,
			sets: 0,
			invalidations: 0,
			errors: 0
		};
		this.backendName = opts.backendName ?? "unknown";
		this.onEvent = opts.onEvent;
	}
	async get(key) {
		try {
			const raw = await this.backend.get(key);
			if (raw == null) {
				this.counters.misses += 1;
				this.onEvent?.({
					type: "miss",
					key,
					backend: this.backendName
				});
				return null;
			}
			this.counters.hits += 1;
			this.onEvent?.({
				type: "hit",
				key,
				backend: this.backendName
			});
			return JSON.parse(raw);
		} catch {
			this.counters.errors += 1;
			this.onEvent?.({
				type: "error",
				key,
				backend: this.backendName
			});
			return null;
		}
	}
	async set(key, value, ttlMs) {
		const ttl = safeTtlMs(ttlMs);
		if (ttl <= 0) {
			await this.backend.invalidate(key);
			this.counters.invalidations += 1;
			this.onEvent?.({
				type: "invalidate",
				pattern: key,
				backend: this.backendName
			});
			return;
		}
		const payload = JSON.stringify(value);
		await this.backend.set(key, payload, ttl);
		this.counters.sets += 1;
		this.onEvent?.({
			type: "set",
			key,
			backend: this.backendName
		});
	}
	async getOrFetch(key, fetcher, ttlMs) {
		const cached = await this.get(key);
		if (cached !== null) return cached;
		const existing = this.inFlight.get(key);
		if (existing) return existing;
		const promise = (async () => {
			const value = await fetcher();
			await this.set(key, value, ttlMs);
			return value;
		})().finally(() => {
			this.inFlight.delete(key);
		});
		this.inFlight.set(key, promise);
		return promise;
	}
	async invalidate(pattern) {
		await this.backend.invalidate(pattern);
		this.counters.invalidations += 1;
		this.onEvent?.({
			type: "invalidate",
			pattern,
			backend: this.backendName
		});
	}
	async invalidateWorkspace(workspaceId) {
		const prefix = `w:${encodeURIComponent(workspaceId)}:`;
		await this.invalidate(`${prefix}*`);
	}
	async clearAll() {
		await this.invalidate("*");
	}
	getStats() {
		return { ...this.counters };
	}
};
function safeMaxEntries(value) {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) return 500;
	return Math.min(Math.floor(parsed), 5e3);
}
var MemoryCacheBackend = class {
	constructor(opts = {}) {
		this.store = /* @__PURE__ */ new Map();
		this.maxEntries = safeMaxEntries(opts.maxEntries);
	}
	async get(key) {
		const entry = this.store.get(key);
		if (!entry) return null;
		if (entry.expiresAt <= Date.now()) {
			this.store.delete(key);
			return null;
		}
		entry.touchedAt = Date.now();
		return entry.value;
	}
	async set(key, value, ttlMs) {
		const ttl = Number(ttlMs);
		if (!Number.isFinite(ttl) || ttl <= 0) {
			this.store.delete(key);
			return;
		}
		this.store.set(key, {
			value,
			expiresAt: Date.now() + ttl,
			touchedAt: Date.now()
		});
		this.evictIfNeeded();
	}
	async invalidate(pattern) {
		if (!pattern || pattern === "*") {
			this.store.clear();
			return;
		}
		if (pattern.endsWith("*")) {
			const prefix = pattern.slice(0, -1);
			for (const key of this.store.keys()) if (key.startsWith(prefix)) this.store.delete(key);
			return;
		}
		this.store.delete(pattern);
	}
	evictIfNeeded() {
		if (this.store.size <= this.maxEntries) return;
		const entries = Array.from(this.store.entries());
		entries.sort((a, b) => a[1].touchedAt - b[1].touchedAt);
		const excess = this.store.size - this.maxEntries;
		for (let i = 0; i < excess; i += 1) this.store.delete(entries[i][0]);
	}
};
var ApiClientError = class extends UnifiedError {
	constructor(message, options = {}) {
		super({
			message,
			status: options.status,
			code: options.code,
			details: options.details && typeof options.details === "object" && !Array.isArray(options.details) ? options.details : void 0,
			cause: options.cause
		});
		this.name = "ApiClientError";
	}
};
var inFlightRequests = /* @__PURE__ */ new Map();
var RESPONSE_CACHE_TTL_MS = 2e3;
var responseCache = new CacheManager(new MemoryCacheBackend({ maxEntries: 300 }), { backendName: "memory" });
function mapCodeFromStatus(value) {
	if (value === 401) return "UNAUTHORIZED";
	if (value === 403) return "FORBIDDEN";
	if (value === 404) return "NOT_FOUND";
	if (value === 429) return "RATE_LIMIT_EXCEEDED";
	if (value >= 500) return "INTERNAL_ERROR";
}
async function parseApiResponsePayload(response, context) {
	const status = response.status;
	try {
		return await parseJsonBody(response, {
			context,
			allowEmpty: status === 204 || status === 205
		});
	} catch (error) {
		if (error instanceof ResponseBodyParseError) {
			if (!response.ok) throw new ApiClientError(defaultStatusMessage(status), {
				status,
				code: mapCodeFromStatus(status) ?? "INVALID_RESPONSE",
				cause: error
			});
			throw new ApiClientError("The server returned an invalid response. Please try again.", {
				status,
				code: "INVALID_RESPONSE",
				cause: error
			});
		}
		throw error;
	}
}
function createNetworkApiClientError(error, timeoutMs) {
	if (isTimeoutError(error)) return new ApiClientError(`The request timed out${typeof timeoutMs === "number" && timeoutMs > 0 ? ` after ${Math.ceil(timeoutMs / 1e3)}s` : ""}. Please try again.`, {
		code: "REQUEST_TIMEOUT",
		cause: error
	});
	return new ApiClientError("Network error. Please check your connection and try again.", {
		code: "NETWORK_ERROR",
		cause: error
	});
}
async function apiFetch(input, init = {}) {
	const { timeoutMs, signal: requestSignal, ...requestInit } = init;
	const callerSignal = requestSignal ?? void 0;
	const method = requestInit.method || "GET";
	const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
	if (method.toUpperCase() === "GET" && typeof window !== "undefined" && isPreviewModeEnabled()) try {
		const resolved = new URL(url, window.location.origin);
		const path = resolved.pathname;
		const clientId = resolved.searchParams.get("clientId");
		if (path === "/api/clients") return {
			clients: getPreviewClients(),
			nextCursor: null
		};
		if (path === "/api/activity") {
			const activities = getPreviewActivity(clientId);
			return {
				activities,
				hasMore: false,
				total: activities.length
			};
		}
		if (path === "/api/notifications") return {
			notifications: getPreviewNotifications(),
			nextCursor: null
		};
	} catch {}
	const isDeduplicatable = method.toUpperCase() === "GET" && !callerSignal && !timeoutMs;
	const cacheKey = `${method}:${url}${typeof window !== "undefined" && isPreviewModeEnabled() ? ":preview" : ""}`;
	if (isDeduplicatable) {
		const cached = await responseCache.get(cacheKey);
		if (cached !== null) return cached;
	}
	if (isDeduplicatable && inFlightRequests.has(cacheKey)) return inFlightRequests.get(cacheKey);
	const requestPath = (() => {
		try {
			return url.startsWith("http") ? new URL(url).pathname : url;
		} catch {
			return url;
		}
	})();
	const isAuthSessionRequest = requestPath.startsWith("/api/auth/bootstrap") || requestPath.startsWith("/api/auth/session");
	const executeRequest = async (attempt = 0) => {
		try {
			if (typeof window !== "undefined" && !isAuthSessionRequest) await authService.waitForInitialAuth().catch(() => {});
			const headers = new Headers(requestInit.headers);
			if (!headers.has("Content-Type") && method.toUpperCase() !== "GET") headers.set("Content-Type", "application/json");
			const { signal, cleanup } = composeAbortSignal({
				signal: callerSignal,
				timeoutMs
			});
			let response;
			try {
				response = await fetch(input, {
					...requestInit,
					headers,
					credentials: requestInit.credentials ?? "same-origin",
					signal
				});
			} finally {
				cleanup();
			}
			const status = response.status;
			const payload = await parseApiResponsePayload(response, `apiFetch ${method.toUpperCase()} ${url}`);
			const payloadRecord = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
			const isEnvelope = payloadRecord !== null && "success" in payloadRecord;
			if (!response.ok || isEnvelope && payloadRecord.success === false) {
				const code = typeof payloadRecord?.code === "string" ? payloadRecord.code : mapCodeFromStatus(status);
				throw new ApiClientError(typeof payloadRecord?.error === "string" ? payloadRecord.error : defaultStatusMessage(status), {
					status,
					code,
					details: payloadRecord?.details
				});
			}
			if (isEnvelope && "data" in payloadRecord) {
				const result = payloadRecord.data;
				if (isDeduplicatable) responseCache.set(cacheKey, result, RESPONSE_CACHE_TTL_MS);
				return result;
			}
			if (isDeduplicatable) responseCache.set(cacheKey, payload, RESPONSE_CACHE_TTL_MS);
			return payload;
		} catch (error) {
			if (isAbortError(error)) throw error;
			const normalizedError = error instanceof ApiClientError ? error : createNetworkApiClientError(error, timeoutMs);
			if (attempt < 2 && isDeduplicatable && (normalizedError.code === "NETWORK_ERROR" || normalizedError.code === "REQUEST_TIMEOUT")) {
				await sleepWithSignal((attempt + 1) * 1e3, callerSignal);
				return executeRequest(attempt + 1);
			}
			throw normalizedError;
		}
	};
	const promise = executeRequest().finally(() => {
		if (isDeduplicatable) inFlightRequests.delete(cacheKey);
	});
	if (isDeduplicatable) inFlightRequests.set(cacheKey, promise);
	return promise;
}
function defaultStatusMessage(status) {
	if (status === 401) return "Please sign in and try again.";
	if (status === 403) return "You don't have permission to do that.";
	if (status === 404) return "We could not find what you were looking for.";
	if (status === 429) return "Too many requests. Please wait and try again.";
	if (status >= 500) return "Something went wrong on our side. Please try again.";
	return "Request failed. Please try again.";
}
/**
* Starts Better Auth Google OAuth (proxied to Convex via /api/auth).
* Redirects the browser; does not return on success.
*/
async function startGoogleOAuthSignIn(callbackURL) {
	await authClient.signIn.social({
		provider: "google",
		callbackURL
	});
}
function normalizeBootstrapRole(value) {
	if (value === "admin" || value === "team" || value === "client") return value;
	return "client";
}
function normalizeBootstrapStatus(value) {
	if (value === "active" || value === "pending" || value === "invited" || value === "disabled" || value === "suspended") return value;
	return "pending";
}
function unwrapBootstrapPayload(payload) {
	if (!payload || typeof payload !== "object") return {};
	const record = payload;
	if (record.data && typeof record.data === "object") return record.data;
	return record;
}
/**
* Single sign-in bootstrap: Convex profile upsert + cohorts_* session cookies (7-day TTL).
* No follow-up /api/auth/session round-trip — cookies are set on the bootstrap response.
*/
async function bootstrapAndSyncSession() {
	let bootstrapPayload;
	try {
		bootstrapPayload = await apiFetch("/api/auth/bootstrap", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({}),
			credentials: "include"
		});
	} catch (error) {
		const message = error instanceof ApiClientError ? error.message : "Failed to bootstrap user";
		throw new Error(message);
	}
	const record = unwrapBootstrapPayload(bootstrapPayload);
	const legacyId = typeof record.legacyId === "string" && record.legacyId.length > 0 ? record.legacyId : null;
	const agencyId = typeof record.agencyId === "string" && record.agencyId.length > 0 ? record.agencyId : null;
	if (!legacyId) throw new Error("Bootstrap response missing user id");
	return {
		legacyId,
		role: normalizeBootstrapRole(record.role),
		status: normalizeBootstrapStatus(record.status),
		agencyId: agencyId ?? legacyId
	};
}
var bootstrapCache = null;
var bootstrapPromise = null;
/** Runs bootstrap once per page session (dedupes AuthService + useAuthSync). */
async function bootstrapAndSyncSessionOnce() {
	if (bootstrapCache) return bootstrapCache;
	if (!bootstrapPromise) bootstrapPromise = bootstrapAndSyncSession().then((profile) => {
		bootstrapCache = profile;
		return profile;
	}).catch((error) => {
		bootstrapCache = null;
		throw error;
	}).finally(() => {
		bootstrapPromise = null;
	});
	return bootstrapPromise;
}
function resetBootstrapSessionCache() {
	bootstrapCache = null;
	bootstrapPromise = null;
}
/**
* Base class for all API errors (legacy name)
*
* Backed by UnifiedError to keep one error system.
*/
var ApiError = class extends UnifiedError {
	constructor(message, status, code = "INTERNAL_ERROR", details) {
		super({
			message,
			status,
			code,
			details
		});
		this.name = new.target.name;
	}
};
/**
* 400 Bad Request - Validation or input errors
*/
var ValidationError = class extends ApiError {
	constructor(message = "Validation failed", details) {
		super(message, 400, "VALIDATION_ERROR", details);
	}
};
/**
* 400 Bad Request - Generic invalid request
*/
var BadRequestError = class extends ApiError {
	constructor(message = "Bad request") {
		super(message, 400, "BAD_REQUEST");
	}
};
/**
* 401 Unauthorized - Authentication required
*/
var UnauthorizedError = class extends ApiError {
	constructor(message = "Authentication required") {
		super(message, 401, "UNAUTHORIZED");
	}
};
/**
* 403 Forbidden - Permission denied
*/
var ForbiddenError = class extends ApiError {
	constructor(message = "Permission denied") {
		super(message, 403, "FORBIDDEN");
	}
};
/**
* 404 Not Found - Resource does not exist
*/
var NotFoundError = class extends ApiError {
	constructor(message, resourceType, resourceId) {
		let finalMessage = message || "Resource not found";
		if (!message && resourceType && resourceId) finalMessage = `${resourceType} with ID '${resourceId}' not found`;
		else if (!message && resourceType) finalMessage = `${resourceType} not found`;
		super(finalMessage, 404, "NOT_FOUND");
		this.resourceType = resourceType;
		this.resourceId = resourceId;
	}
};
/**
* 429 Too Many Requests - Rate limit exceeded
*/
var RateLimitError = class extends ApiError {
	constructor(message = "Too many requests") {
		super(message, 429, "RATE_LIMIT_EXCEEDED");
	}
};
/**
* 503 Service Unavailable - Downstream or temporary failure
*/
var ServiceUnavailableError = class extends ApiError {
	constructor(message = "Service temporarily unavailable") {
		super(message, 503, "SERVICE_UNAVAILABLE");
	}
};
/**
* 401 Session Expired - Session has timed out
*/
var SessionExpiredError = class extends ApiError {
	constructor(message = "Your session has expired. Please sign in again.") {
		super(message, 401, "SESSION_EXPIRED");
	}
};
/**
* 403 Account Disabled - User account has been disabled
*/
var AccountDisabledError = class extends ApiError {
	constructor(message = "Your account has been disabled. Please contact support.") {
		super(message, 403, "ACCOUNT_DISABLED");
	}
};
/**
* 403 Account Suspended - User account has been suspended
*/
var AccountSuspendedError = class extends ApiError {
	constructor(message = "Your account has been suspended. Please contact support.") {
		super(message, 403, "ACCOUNT_SUSPENDED");
	}
};
/**
* 403 Account Pending - User account is pending approval
*/
var AccountPendingError = class extends ApiError {
	constructor(message = "Your account is pending approval.") {
		super(message, 403, "ACCOUNT_PENDING");
	}
};
/**
* 400 Invalid Credentials - Wrong email or password
*/
var InvalidCredentialsError = class extends ApiError {
	constructor(message = "Invalid email or password") {
		super(message, 400, "INVALID_CREDENTIALS");
	}
};
/**
* 400 Weak Password - Password does not meet requirements
*/
var WeakPasswordError = class extends ApiError {
	constructor(message = "Password is too weak. Use at least 8 characters with letters and numbers.") {
		super(message, 400, "WEAK_PASSWORD");
	}
};
/**
* 409 Email Already Exists - Account with email already exists
*/
var EmailAlreadyExistsError = class extends ApiError {
	constructor(message = "An account with this email already exists.") {
		super(message, 409, "EMAIL_ALREADY_EXISTS");
	}
};
/**
* 400 Invalid Email - Email format is invalid
*/
var InvalidEmailError = class extends ApiError {
	constructor(message = "Please enter a valid email address.") {
		super(message, 400, "INVALID_EMAIL");
	}
};
/**
* 408 Network Timeout - Request timed out
*/
var NetworkTimeoutError = class extends ApiError {
	constructor(message = "Request timed out. Please check your connection and try again.") {
		super(message, 408, "NETWORK_TIMEOUT");
	}
};
/**
* 503 Network Error - Network connectivity issue
*/
var NetworkError = class extends ApiError {
	constructor(message = "Network error. Please check your internet connection.") {
		super(message, 503, "NETWORK_ERROR");
	}
};
/**
* 400 OAuth Error - OAuth flow failed
*/
var OAuthError = class extends ApiError {
	constructor(message = "OAuth authentication failed. Please try again.") {
		super(message, 400, "OAUTH_ERROR");
	}
};
/**
* 400 OAuth Cancelled - User cancelled OAuth flow
*/
var OAuthCancelledError = class extends ApiError {
	constructor(message = "Sign-in was cancelled.") {
		super(message, 400, "OAUTH_CANCELLED");
	}
};
/**
* 400 OAuth Popup Blocked - Browser blocked OAuth popup
*/
var OAuthPopupBlockedError = class extends ApiError {
	constructor(message = "Sign-in popup was blocked by your browser. Please allow popups for this site.") {
		super(message, 400, "OAUTH_POPUP_BLOCKED");
	}
};
/**
* Maps auth error codes to user-friendly messages.
* Handles Firebase, Better Auth, and generic error codes.
*/
var errorMap = {
	"auth/invalid-email": "Please enter a valid email address.",
	"auth/user-disabled": "This account has been disabled. Please contact support.",
	"auth/user-not-found": "No account found with this email.",
	"auth/wrong-password": "Incorrect password. Please try again.",
	"auth/invalid-credential": "Invalid email or password. Please try again.",
	"auth/too-many-requests": "Too many failed attempts. Please try again later.",
	"auth/operation-not-allowed": "This sign-in method is not enabled. Please contact support.",
	"auth/email-already-in-use": "An account with this email already exists.",
	"auth/weak-password": "Password is too weak. Use at least 8 characters with letters and numbers.",
	"auth/popup-closed-by-user": "Sign-in was cancelled.",
	"auth/popup-blocked": "Sign-in popup was blocked by your browser. Please allow popups for this site.",
	"auth/unauthorized-domain": "This domain is not authorized for sign-in.",
	"auth/account-exists-with-different-credential": "An account already exists using a different sign-in method.",
	"auth/cancelled-popup-request": "Only one sign-in window can be open at a time.",
	"auth/network-request-failed": "Network error. Please check your internet connection.",
	"auth/timeout": "Request timed out. Please try again.",
	"auth/requires-recent-login": "Please sign in again to perform this sensitive action.",
	"auth/session-expired": "Your session has expired. Please sign in again.",
	"auth/token-expired": "Your session has expired. Please sign in again.",
	"auth/internal-error": "An internal error occurred. Please try again later.",
	"auth/invalid-api-key": "Configuration error. Please contact support.",
	"auth/app-not-authorized": "This app is not authorized for authentication.",
	"INVALID_CREDENTIALS": "Invalid email or password.",
	"USER_NOT_FOUND": "No account found with this email.",
	"EMAIL_NOT_VERIFIED": "Please verify your email address to continue.",
	"ACCOUNT_DISABLED": "Your account has been disabled. Please contact support.",
	"ACCOUNT_SUSPENDED": "Your account has been suspended. Please contact support.",
	"account_disabled": "Your account has been disabled. Please contact support.",
	"account_suspended": "Your account has been suspended. Please contact support.",
	"ACCOUNT_PENDING": "Your account is pending approval.",
	"SESSION_EXPIRED": "Your session has expired. Please sign in again.",
	"INVALID_TOKEN": "Invalid authentication token. Please sign in again.",
	"WEAK_PASSWORD": "Password is too weak. Use at least 8 characters with letters and numbers.",
	"EMAIL_ALREADY_EXISTS": "An account with this email already exists.",
	"INVALID_EMAIL": "Please enter a valid email address.",
	"TOO_MANY_REQUESTS": "Too many requests. Please wait a moment and try again.",
	"NETWORK_ERROR": "Network error. Please check your internet connection.",
	"OAUTH_CANCELLED": "Sign-in was cancelled.",
	"OAUTH_POPUP_BLOCKED": "Sign-in popup was blocked by your browser. Please allow popups for this site.",
	"OAUTH_ERROR": "OAuth authentication failed. Please try again.",
	"invalid_code": "Google sign-in could not be completed. Try again, or confirm redirect URI http://localhost:3000/api/auth/callback/google is registered in Google Cloud Console.",
	"state_mismatch": "Sign-in session expired. Please try Google sign-in again.",
	"state_not_found": "Sign-in session expired. Please try Google sign-in again.",
	"unable_to_get_user_info": "Could not read your Google profile. Try again or use email sign-in.",
	"UNKNOWN": "Google sign-in failed. Please try again.",
	"UNAUTHORIZED": "Authentication required. Please sign in.",
	"FORBIDDEN": "You do not have permission to perform this action.",
	"SERVICE_UNAVAILABLE": "Service temporarily unavailable. Please try again later.",
	"AUTH_SERVICE_MISCONFIGURED": "Authentication service is misconfigured. Ensure Convex SITE_URL and BETTER_AUTH_SECRET match this deployment, then check server logs."
};
/** Better Auth generic 500 body when Convex init or CORS/origin checks fail. */
var BETTER_AUTH_GENERIC_500 = "your request couldn't be completed";
var AUTH_MISCONFIGURED_MESSAGE = errorMap.AUTH_SERVICE_MISCONFIGURED ?? "Authentication service is misconfigured. Ensure Convex SITE_URL and BETTER_AUTH_SECRET match this deployment, then check server logs.";
function isBetterAuthGenericFailureMessage(message) {
	const lower = message.toLowerCase();
	return lower.includes(BETTER_AUTH_GENERIC_500) || lower.includes("try again later") || lower.includes("[betterauth]") || lower.includes("better_auth_secret") || lower.includes("site_url");
}
/**
* Maps Firebase/Better Auth auth error codes to user-friendly messages.
* This ensures technical details are not exposed to the user.
*/
function getFriendlyAuthErrorMessage(error) {
	if (!error) return "An unexpected error occurred. Please try again.";
	if (typeof error === "string") {
		if (errorMap[error]) return errorMap[error];
		const normalized = error.toUpperCase().replace(/-/g, "_");
		if (errorMap[normalized]) return errorMap[normalized];
		if (isBetterAuthGenericFailureMessage(error)) return AUTH_MISCONFIGURED_MESSAGE;
		return error;
	}
	const fallbackMessage = "Authentication failed. Please try again.";
	if (typeof error !== "object" || error === null) return fallbackMessage;
	const errorCode = error.code;
	const errorMessage = error.message;
	const errorStatus = error.status;
	if (errorStatus) {
		if (errorStatus === 401) return "Authentication required. Please sign in.";
		if (errorStatus === 403) return "You do not have permission to perform this action.";
		if (errorStatus === 429) return "Too many requests. Please wait a moment and try again.";
		if (errorStatus === 503) return "Service temporarily unavailable. Please try again later.";
		if (errorStatus === 408) return "Request timed out. Please try again.";
		if (errorStatus === 500) return AUTH_MISCONFIGURED_MESSAGE;
	}
	if (errorCode && errorMap[errorCode]) return errorMap[errorCode];
	if (errorMessage && typeof errorMessage === "string") {
		if (isBetterAuthGenericFailureMessage(errorMessage)) return AUTH_MISCONFIGURED_MESSAGE;
		if (errorMessage.includes("redirect_uri_mismatch")) return "Google OAuth redirect URI mismatch. In Google Cloud Console, add http://localhost:3000/api/auth/callback/google (dev) or https://your-domain.com/api/auth/callback/google (prod), and set SITE_URL / BETTER_AUTH_URL to that same origin on your Convex deployment.";
		const clean = errorMessage.replace(/^Firebase:\s*/i, "").replace(/^BetterAuth:\s*/i, "").replace(/\s*\(auth\/[^)]+\)\.?$/i, "").replace(/\s*\([A-Z_]+\)\.?$/i, "").trim();
		if (clean.toLowerCase() === "error" || clean.toLowerCase() === "auth error" || clean.length === 0) return fallbackMessage;
		return clean;
	}
	return fallbackMessage;
}
/**
* Converts an unknown error into a typed API error based on error code/message
*/
function parseAuthError(error) {
	if (!error || typeof error !== "object") return new UnauthorizedError(getFriendlyAuthErrorMessage(error));
	const errorCode = error.code ?? "";
	const errorMessage = error.message ?? "";
	const errorStatus = error.status;
	const lowerMessage = errorMessage.toLowerCase();
	if (errorCode === "auth/network-request-failed" || errorCode === "NETWORK_ERROR" || lowerMessage.includes("network") || lowerMessage.includes("fetch failed") || lowerMessage.includes("failed to fetch")) return new NetworkError();
	if (errorCode === "auth/timeout" || lowerMessage.includes("timeout") || lowerMessage.includes("timed out") || errorStatus === 408) return new NetworkTimeoutError();
	if (errorCode === "auth/too-many-requests" || errorCode === "TOO_MANY_REQUESTS" || errorStatus === 429) return new RateLimitError();
	if (errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password" || errorCode === "auth/user-not-found" || errorCode === "INVALID_CREDENTIALS" || errorCode === "USER_NOT_FOUND" || lowerMessage.includes("invalid credentials") || lowerMessage.includes("invalid email or password")) return new InvalidCredentialsError();
	if (errorCode === "auth/invalid-email" || errorCode === "INVALID_EMAIL") return new InvalidEmailError();
	if (errorCode === "auth/weak-password" || errorCode === "WEAK_PASSWORD") return new WeakPasswordError();
	if (errorCode === "auth/email-already-in-use" || errorCode === "EMAIL_ALREADY_EXISTS") return new EmailAlreadyExistsError();
	if (errorCode === "auth/user-disabled" || errorCode === "ACCOUNT_DISABLED" || lowerMessage.includes("disabled")) return new AccountDisabledError();
	if (errorCode === "ACCOUNT_SUSPENDED" || lowerMessage.includes("suspended")) return new AccountSuspendedError();
	if (errorCode === "ACCOUNT_PENDING" || lowerMessage.includes("pending")) return new AccountPendingError();
	if (errorCode === "auth/session-expired" || errorCode === "auth/token-expired" || errorCode === "SESSION_EXPIRED" || errorCode === "INVALID_TOKEN" || lowerMessage.includes("session expired") || lowerMessage.includes("token expired")) return new SessionExpiredError();
	if (errorCode === "auth/popup-closed-by-user" || errorCode === "auth/cancelled-popup-request" || errorCode === "OAUTH_CANCELLED") return new OAuthCancelledError();
	if (errorCode === "auth/popup-blocked" || errorCode === "OAUTH_POPUP_BLOCKED") return new OAuthPopupBlockedError();
	if (errorCode === "auth/account-exists-with-different-credential" || errorCode === "auth/unauthorized-domain" || errorCode === "OAUTH_ERROR" || lowerMessage.includes("oauth")) return new OAuthError(getFriendlyAuthErrorMessage(error));
	if (errorCode === "auth/internal-error" || errorCode === "SERVICE_UNAVAILABLE" || errorStatus === 503) return new ServiceUnavailableError();
	if (errorStatus === 500 || errorMessage && isBetterAuthGenericFailureMessage(errorMessage)) return new ServiceUnavailableError(AUTH_MISCONFIGURED_MESSAGE);
	return new UnauthorizedError(getFriendlyAuthErrorMessage(error));
}
/**
* Checks if an error is a network-related error
*/
function isNetworkError(error) {
	if (!error || typeof error !== "object") return false;
	const errorCode = error.code ?? "";
	const lowerMessage = (error.message ?? "").toLowerCase();
	return errorCode === "auth/network-request-failed" || errorCode === "NETWORK_ERROR" || lowerMessage.includes("network") || lowerMessage.includes("fetch failed") || lowerMessage.includes("failed to fetch") || error instanceof NetworkError;
}
var OAUTH_START_TIMEOUT_MS = 15e3;
function normalizeRole(value) {
	return value === "admin" || value === "team" || value === "client" ? value : "client";
}
function normalizeStatus(value) {
	return value === "active" || value === "pending" || value === "invited" || value === "disabled" || value === "suspended" ? value : "pending";
}
function createOauthStartError(response, message) {
	if (response.status === 401) return new SessionExpiredError(message);
	if (response.status >= 500 || response.ok) return new ServiceUnavailableError(message);
	return new BadRequestError(message);
}
async function parseOauthStartPayload(response, context, message) {
	try {
		const payload = await parseJsonBody(response, { context });
		if (payload === null) throw new ResponseBodyParseError(context, "empty");
		return payload;
	} catch (error) {
		if (error instanceof ResponseBodyParseError) throw createOauthStartError(response, message);
		throw error;
	}
}
async function fetchWithTimeout(input, init) {
	const { signal, cleanup } = composeAbortSignal({
		signal: init.signal ?? void 0,
		timeoutMs: OAUTH_START_TIMEOUT_MS,
		timeoutMessage: "The authentication service took too long to respond."
	});
	try {
		return await fetch(input, {
			...init,
			signal
		});
	} catch (error) {
		if (isTimeoutError(error)) throw new NetworkTimeoutError("The authentication service took too long to respond. Please try again.");
		if (isNetworkError(error)) throw new NetworkError("Unable to reach the authentication service. Please check your connection and try again.");
		throw error;
	} finally {
		cleanup();
	}
}
var authService = class AuthService {
	extractSessionPayload(result) {
		if (!result || typeof result !== "object" || !("data" in result)) return null;
		const data = result.data;
		if (!data || typeof data !== "object") return null;
		return data;
	}
	setResolvedUser(user) {
		this.currentUser = user;
		this.notifyListeners(user);
	}
	async resolveSessionUser(options) {
		const sessionResult = await authClient.getSession({ query: options?.disableCookieCache ? { disableCookieCache: true } : void 0 }).catch((err) => {
			console.error("[AuthService] getSession error:", err);
			return null;
		});
		const session = this.extractSessionPayload(sessionResult);
		return session?.user ? this.mapBetterAuthUser(session.user) : null;
	}
	async ensureFreshSession() {
		const freshUser = await this.resolveSessionUser({ disableCookieCache: true });
		if (!freshUser) {
			this.setResolvedUser(null);
			throw new SessionExpiredError("Your session has expired. Please sign in again.");
		}
		this.setResolvedUser(freshUser);
		return freshUser;
	}
	readCsrfCookie() {
		if (typeof document === "undefined") return null;
		const csrfCookie = document.cookie.split("; ").find((row) => row.startsWith("cohorts_csrf="));
		if (!csrfCookie) return null;
		const [, value = ""] = csrfCookie.split("=", 2);
		const csrfToken = decodeURIComponent(value);
		return csrfToken.length > 0 ? csrfToken : null;
	}
	async resolveCsrfToken() {
		const existingToken = this.readCsrfCookie();
		if (existingToken) return existingToken;
		try {
			const response = await fetchWithTimeout("/api/auth/session", {
				method: "GET",
				headers: { Accept: "application/json" },
				credentials: "include"
			});
			if (!response.ok) return null;
			const payload = await parseJsonBody(response, { context: "AuthService resolveCsrfToken" });
			return typeof payload?.csrfToken === "string" && payload.csrfToken.length > 0 ? payload.csrfToken : this.readCsrfCookie();
		} catch (error) {
			console.warn("[AuthService] Failed to refresh CSRF token:", error);
			return null;
		}
	}
	async fetchGoogleWorkspaceOauthUrl(search) {
		return await fetchWithTimeout(`/api/integrations/google-workspace/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
	}
	async fetchGoogleOauthUrl(search) {
		return await fetchWithTimeout(`/api/integrations/google/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
	}
	constructor() {
		this.currentUser = null;
		this.authStateListeners = [];
		this.initialAuthResolved = false;
		this.initialAuthPromise = new Promise((resolve) => {
			this.resolveInitialAuth = resolve;
		});
		if (typeof window !== "undefined") this.initSession();
		else {
			this.initialAuthResolved = true;
			this.resolveInitialAuth();
		}
	}
	static getInstance() {
		if (!AuthService.instance) AuthService.instance = new AuthService();
		return AuthService.instance;
	}
	async initSession() {
		let nextUser = null;
		try {
			nextUser = await this.resolveSessionUser({ disableCookieCache: true });
			this.setResolvedUser(nextUser);
		} finally {
			if (!this.initialAuthResolved) {
				this.initialAuthResolved = true;
				this.resolveInitialAuth();
			}
		}
	}
	mapBetterAuthUser(user) {
		const id = typeof user.id === "string" ? user.id : "";
		const email = typeof user.email === "string" ? user.email : "";
		return {
			id,
			email,
			name: typeof user.name === "string" ? user.name : email,
			phoneNumber: null,
			photoURL: typeof user.image === "string" ? user.image : null,
			role: normalizeRole(user.role),
			status: normalizeStatus(user.status),
			agencyId: typeof user.agencyId === "string" ? String(user.agencyId) : "",
			createdAt: (/* @__PURE__ */ new Date()).toISOString(),
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	getCurrentUser() {
		return this.currentUser;
	}
	onAuthStateChanged(callback) {
		this.authStateListeners.push(callback);
		if (this.initialAuthResolved) callback(this.currentUser);
		return () => {
			const index = this.authStateListeners.indexOf(callback);
			if (index > -1) this.authStateListeners.splice(index, 1);
		};
	}
	async waitForInitialAuth() {
		await this.initialAuthPromise;
	}
	notifyListeners(user) {
		this.authStateListeners.forEach((listener) => {
			listener(user);
		});
	}
	validateEmail(email) {
		if (!email || !email.trim()) throw new InvalidEmailError("Email is required");
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new InvalidEmailError("Please enter a valid email address");
	}
	validatePassword(password, isSignUp = false) {
		if (!password) throw new InvalidCredentialsError("Password is required");
		if (isSignUp && password.length < 8) throw new WeakPasswordError("Password must be at least 8 characters");
	}
	mergeBootstrapProfile(baseUser, profile) {
		return {
			...baseUser,
			role: profile.role,
			status: profile.status,
			agencyId: profile.agencyId
		};
	}
	/** Blocks disabled/suspended only — pending users are routed after sign-in. */
	assertSignInAllowed(user) {
		if (user.status === "disabled") throw new AccountDisabledError();
		if (user.status === "suspended") throw new AccountSuspendedError();
	}
	async completeSignInProfile(baseUser) {
		resetBootstrapSessionCache();
		const profile = await bootstrapAndSyncSessionOnce();
		const merged = this.mergeBootstrapProfile(baseUser, profile);
		this.assertSignInAllowed(merged);
		this.setResolvedUser(merged);
		return merged;
	}
	async signIn(email, password) {
		this.validateEmail(email);
		this.validatePassword(password);
		try {
			const result = await authClient.signIn.email({
				email: email.trim(),
				password
			});
			const data = result && typeof result === "object" && "data" in result ? result.data ?? null : null;
			const errorInResult = result && typeof result === "object" && "error" in result ? result.error ?? null : null;
			if (errorInResult) throw parseAuthError(errorInResult);
			if (!data?.user) throw new InvalidCredentialsError();
			const user = this.mapBetterAuthUser(data.user);
			return await this.completeSignInProfile(user);
		} catch (error) {
			if (error instanceof InvalidCredentialsError || error instanceof InvalidEmailError || error instanceof AccountDisabledError || error instanceof AccountSuspendedError || error instanceof AccountPendingError || error instanceof RateLimitError || error instanceof NetworkError || error instanceof NetworkTimeoutError || error instanceof SessionExpiredError) throw error;
			if (isNetworkError(error)) throw new NetworkError();
			throw parseAuthError(error);
		}
	}
	async signUp(signUpData) {
		this.validateEmail(signUpData.email);
		this.validatePassword(signUpData.password, true);
		try {
			const result = await authClient.signUp.email({
				email: signUpData.email.trim(),
				password: signUpData.password,
				name: signUpData.displayName ?? signUpData.email
			});
			const payload = result && typeof result === "object" && "data" in result ? result.data ?? null : null;
			const errorInResult = result && typeof result === "object" && "error" in result ? result.error ?? null : null;
			if (errorInResult) throw parseAuthError(errorInResult);
			if (!payload?.user) throw new BadRequestError("Sign-up failed. Please try again.");
			const user = this.mapBetterAuthUser(payload.user);
			return await this.completeSignInProfile(user);
		} catch (error) {
			if (error instanceof InvalidCredentialsError || error instanceof InvalidEmailError || error instanceof WeakPasswordError || error instanceof EmailAlreadyExistsError || error instanceof RateLimitError || error instanceof NetworkError || error instanceof NetworkTimeoutError || error instanceof BadRequestError) throw error;
			if (isNetworkError(error)) throw new NetworkError();
			throw parseAuthError(error);
		}
	}
	async signOut() {
		resetBootstrapSessionCache();
		try {
			await this.clearSessionCookies();
			await authClient.signOut();
			this.currentUser = null;
			this.notifyListeners(null);
		} catch (error) {
			if (isNetworkError(error)) throw new NetworkError("Failed to sign out. Please check your connection.");
			throw new ServiceUnavailableError("Failed to sign out. Please try again.");
		}
	}
	async clearSessionCookies() {
		try {
			const csrfToken = await this.resolveCsrfToken();
			const response = await fetch("/api/auth/session", {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					"x-csrf-token": csrfToken ?? ""
				},
				credentials: "include"
			});
			if (!response.ok && response.status !== 401) console.warn("[AuthService] Session cookie clear failed:", response.status);
		} catch (error) {
			console.warn("[AuthService] Failed to clear session cookies:", error);
		}
	}
	async signInWithGoogle(callbackURL = "/dashboard") {
		await startGoogleOAuthSignIn(callbackURL);
	}
	async connectGoogleAdsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async connectGoogleAnalyticsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async connectFacebookAdsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async connectLinkedInAdsAccount() {
		throw new ServiceUnavailableError("Popup integrations require Better Auth OAuth setup");
	}
	async startGoogleOauth(redirect, clientId) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		await this.ensureFreshSession();
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		const search = params.toString() ? `?${params.toString()}` : "";
		let response = await this.fetchGoogleOauthUrl(search);
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await this.fetchGoogleOauthUrl(search);
		}
		const payload = await parseOauthStartPayload(response, "Google OAuth start", "Failed to start Google OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start Google OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("Google OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start Google OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("Google OAuth did not return a URL");
	}
	async startGoogleWorkspaceOauth(redirect) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		const search = params.toString() ? `?${params.toString()}` : "";
		await this.ensureFreshSession();
		let response = await this.fetchGoogleWorkspaceOauthUrl(search);
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await this.fetchGoogleWorkspaceOauthUrl(search);
		}
		const payload = await parseOauthStartPayload(response, "Google Workspace OAuth start", "Failed to start Google Workspace OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start Google Workspace OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("Google Workspace OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start Google Workspace OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("Google Workspace OAuth did not return a URL");
	}
	async startMetaOauth(redirect, clientId, surface, entryPoint) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		await this.ensureFreshSession();
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		if (surface) params.set("surface", surface);
		if (entryPoint) params.set("entryPoint", entryPoint);
		const search = params.toString() ? `?${params.toString()}` : "";
		const fetchMetaOauthUrl = async () => await fetchWithTimeout(`/api/integrations/meta/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
		let response = await fetchMetaOauthUrl();
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await fetchMetaOauthUrl();
		}
		const payload = await parseOauthStartPayload(response, "Meta OAuth start", "Failed to start Meta OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start Meta OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("Meta OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start Meta OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("Meta OAuth did not return a URL");
	}
	async startTikTokOauth(redirect, clientId) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		const response = await fetchWithTimeout(`/api/integrations/tiktok/oauth/url${params.toString() ? `?${params.toString()}` : ""}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "same-origin"
		});
		const payload = await parseOauthStartPayload(response, "TikTok OAuth start", "Failed to start TikTok OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) throw new BadRequestError(typeof record.error === "string" ? record.error : "Failed to start TikTok OAuth");
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("TikTok OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			throw new BadRequestError(typeof record?.error === "string" ? record.error : "Failed to start TikTok OAuth");
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("TikTok OAuth did not return a URL");
	}
	async startLinkedInOauth(redirect, clientId) {
		if (redirect && !isValidRedirectUrl(redirect)) throw new ValidationError("Invalid redirect URL");
		await this.ensureFreshSession();
		const params = new URLSearchParams();
		if (redirect) params.set("redirect", redirect);
		if (clientId) params.set("clientId", clientId);
		const search = params.toString() ? `?${params.toString()}` : "";
		const fetchLinkedInOauthUrl = async () => await fetchWithTimeout(`/api/integrations/linkedin/oauth/url${search}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include"
		});
		let response = await fetchLinkedInOauthUrl();
		if (response.status === 401) {
			await this.ensureFreshSession().catch(() => null);
			response = await fetchLinkedInOauthUrl();
		}
		const payload = await parseOauthStartPayload(response, "LinkedIn OAuth start", "Failed to start LinkedIn OAuth");
		if (payload && typeof payload === "object" && "success" in payload) {
			const record = payload;
			if (!record.success) {
				const message = typeof record.error === "string" ? record.error : "Failed to start LinkedIn OAuth";
				if (response.status === 401) throw new SessionExpiredError(message);
				throw new BadRequestError(message);
			}
			const data = record.data;
			if (typeof data?.url === "string" && data.url.length > 0) return { url: data.url };
			throw new ServiceUnavailableError("LinkedIn OAuth did not return a URL");
		}
		if (!response.ok) {
			const record = payload;
			const message = typeof record?.error === "string" ? record.error : "Failed to start LinkedIn OAuth";
			if (response.status === 401) throw new SessionExpiredError(message);
			throw new BadRequestError(message);
		}
		const legacy = payload;
		if (typeof legacy?.url === "string" && legacy.url.length > 0) return { url: legacy.url };
		throw new ServiceUnavailableError("LinkedIn OAuth did not return a URL");
	}
	async resetPassword() {
		throw new ServiceUnavailableError("Password reset must be implemented with Better Auth");
	}
	async verifyPasswordResetCode() {
		throw new ServiceUnavailableError("Password reset must be implemented with Better Auth");
	}
	async confirmPasswordReset() {
		throw new ServiceUnavailableError("Password reset must be implemented with Better Auth");
	}
	async updateProfile(data) {
		if (!this.currentUser) throw new UnauthorizedError("No authenticated user");
		return {
			...this.currentUser,
			...data,
			updatedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	async changePassword() {
		throw new ServiceUnavailableError("Password change must be implemented with Better Auth");
	}
	async deleteAccount() {
		throw new ServiceUnavailableError("Account deletion must be implemented with Better Auth");
	}
	async disconnectProvider() {
		throw new ServiceUnavailableError("Provider disconnect must be implemented with Better Auth");
	}
}.getInstance();
/** Decode JWT `sub` without verifying signature (token already obtained from trusted auth route). */
function decodeJwtSubject(token) {
	const payloadPart = token.split(".")[1];
	if (!payloadPart) return null;
	try {
		const base64 = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
		const payload = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
		return typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : null;
	} catch {
		return null;
	}
}
function isLoadingPhase(phase) {
	return phase === "initializing" || phase === "syncing" || phase === "profile_loading";
}
function deriveAuthPhase(input) {
	if (input.sessionPending && !input.hasSession) return "initializing";
	if (!input.hasSession) return "unauthenticated";
	if (input.syncState === "failed") return "sync_failed";
	if (input.syncState === "idle" || input.syncState === "running") return "syncing";
	if (!input.user) return "syncing";
	if (!input.isAuthenticated || input.convexAuthLoading) return "syncing";
	if (input.syncState === "success") {
		if (input.user.status === "active") return "ready_active";
		return "ready_pending";
	}
	if (input.profilePending) return "profile_loading";
	if (input.user.status === "active") return "ready_active";
	return "ready_pending";
}
function mergeConvexProfile(baseUser, convexUser) {
	if (!convexUser) return baseUser;
	return {
		...baseUser,
		id: convexUser.legacyId,
		role: convexUser.role || baseUser.role,
		status: convexUser.status || baseUser.status,
		agencyId: convexUser.agencyId || baseUser.agencyId || convexUser.legacyId
	};
}
function createAuthError(code, message, details, retryable = false) {
	return {
		code,
		message,
		details,
		retryable
	};
}
var StaleSyncError = class extends Error {
	constructor() {
		super("Auth sync superseded by a newer run");
		this.name = "StaleSyncError";
	}
};
var SYNC_TIMEOUT_MS = 8e3;
var TOKEN_RETRY_DELAYS_MS = [
	0,
	400,
	900,
	1800
];
function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}
function extractConvexToken(result) {
	if (typeof result === "string") {
		const trimmed = result.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (typeof result !== "object" || result === null) return null;
	if ("token" in result) {
		const direct = result.token;
		if (typeof direct === "string" && direct.trim().length > 0) return direct.trim();
	}
	if ("data" in result) return extractConvexToken(result.data);
	return null;
}
async function fetchConvexTokenOnce() {
	return extractConvexToken(await authClient.convex.token({ fetchOptions: { throw: false } }).catch(() => null));
}
async function fetchConvexTokenWithRetry(assertActive) {
	const token = await fetchConvexTokenOnce();
	if (token) return token;
	const retryWithDelays = async (delayIndex) => {
		const delay = TOKEN_RETRY_DELAYS_MS[delayIndex];
		if (delay === void 0) return null;
		if (delay > 0) await sleep(delay);
		assertActive();
		const nextToken = await fetchConvexTokenOnce();
		if (nextToken) return nextToken;
		return retryWithDelays(delayIndex + 1);
	};
	return retryWithDelays(0);
}
async function runAuthSyncPipeline(assertActive) {
	assertActive();
	const profile = await Promise.race([bootstrapAndSyncSessionOnce(), sleep(SYNC_TIMEOUT_MS).then(() => {
		throw new Error("Timed out while setting up your workspace. Please retry.");
	})]);
	assertActive();
	let resolvedToken = await fetchConvexTokenWithRetry(assertActive);
	if (!resolvedToken) resolvedToken = await fetchConvexTokenOnce();
	const subject = (resolvedToken ? decodeJwtSubject(resolvedToken) : null) ?? profile.legacyId;
	if (!subject) throw new Error("We could not finish securing your session. Try again or sign in once more.");
	return {
		subject,
		profile
	};
}
function applyBootstrapProfile(baseUser, profile) {
	if (!profile) return baseUser;
	return {
		...baseUser,
		role: profile.role,
		status: profile.status,
		agencyId: profile.agencyId
	};
}
function useAuthSync() {
	const [syncGeneration, setSyncGeneration] = (0, import_react.useState)(0);
	const syncGenerationRef = (0, import_react.useRef)(syncGeneration);
	(0, import_react.useEffect)(() => {
		syncGenerationRef.current = syncGeneration;
	}, [syncGeneration]);
	const [sessionSync, setSessionSync] = (0, import_react.useState)({
		syncState: "idle",
		authError: null,
		sessionUser: null,
		convexLegacyId: null,
		bootstrapProfile: null
	});
	const { syncState, authError, sessionUser, convexLegacyId, bootstrapProfile } = sessionSync;
	const { data: betterAuthSession, isPending: sessionPending } = authClient.useSession();
	const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
	const profileLegacyId = convexLegacyId ?? sessionUser?.id ?? null;
	const convexUser = useQuery(api.users.getByLegacyIdSafe, profileLegacyId && isAuthenticated ? { legacyId: profileLegacyId } : "skip");
	const profilePending = false;
	const profileMissing = Boolean(profileLegacyId) && isAuthenticated && !convexAuthLoading && convexUser === null && syncState === "success" && !bootstrapProfile;
	const user = (() => {
		if (!sessionUser) return null;
		let merged = applyBootstrapProfile(sessionUser, bootstrapProfile);
		if (convexUser) merged = mergeConvexProfile(merged, convexUser);
		if (convexLegacyId && merged.id !== convexLegacyId) merged = {
			...merged,
			id: convexLegacyId
		};
		return merged;
	})();
	const hasSession = Boolean(betterAuthSession?.user ?? sessionUser);
	const awaitingSession = sessionPending && !betterAuthSession?.user && !sessionUser;
	if (profileMissing && syncState === "success") setSessionSync((prev) => ({
		...prev,
		syncState: "failed",
		authError: createAuthError("SESSION_SYNC_FAILED", "Workspace profile not found. Your sign-in succeeded but the profile could not be loaded.", void 0, true)
	}));
	const mappedBetterAuthUser = (() => {
		const rawUser = betterAuthSession?.user;
		if (!rawUser) return null;
		return authService.mapBetterAuthUser(rawUser);
	})();
	if (mappedBetterAuthUser) {
		if (sessionUser?.id !== mappedBetterAuthUser.id) setSessionSync((prev) => ({
			...prev,
			sessionUser: mappedBetterAuthUser
		}));
	} else if (!awaitingSession && (sessionUser !== null || syncState !== "idle" || authError !== null || convexLegacyId !== null || bootstrapProfile !== null)) setSessionSync({
		syncState: "idle",
		authError: null,
		sessionUser: null,
		convexLegacyId: null,
		bootstrapProfile: null
	});
	const initialAuthHydratedRef = (0, import_react.useRef)(false);
	(0, import_react.useEffect)(() => {
		if (!hasSession || initialAuthHydratedRef.current) return;
		initialAuthHydratedRef.current = true;
		authService.waitForInitialAuth().then(() => {
			const cachedUser = authService.getCurrentUser();
			if (cachedUser) setSessionSync((prev) => ({
				...prev,
				sessionUser: prev.sessionUser ?? cachedUser
			}));
		});
	}, [hasSession]);
	const runSessionSync = (0, import_react.useEffectEvent)(async (runId) => {
		setSessionSync((prev) => ({
			...prev,
			syncState: "running",
			authError: null
		}));
		const assertActive = () => {
			if (syncGenerationRef.current !== runId) throw new StaleSyncError();
		};
		try {
			if (syncGenerationRef.current !== runId) return;
			const resultPromise = runAuthSyncPipeline(assertActive);
			if (syncGenerationRef.current !== runId) return;
			const result = await resultPromise;
			if (syncGenerationRef.current === runId) setSessionSync((prev) => ({
				...prev,
				convexLegacyId: result.subject,
				bootstrapProfile: result.profile,
				syncState: "success"
			}));
		} catch (error) {
			if (error instanceof StaleSyncError) return;
			if (syncGenerationRef.current !== runId) return;
			const message = error instanceof Error ? error.message : "Failed to sync your session";
			setSessionSync((prev) => ({
				...prev,
				syncState: "failed",
				authError: createAuthError("SESSION_SYNC_FAILED", message, void 0, true)
			}));
		}
	});
	(0, import_react.useEffect)(() => {
		if (awaitingSession || !hasSession) return;
		if (syncState === "failed") return;
		if (syncState === "running") return;
		if (syncState === "success" && bootstrapProfile && convexLegacyId) return;
		runSessionSync(syncGeneration);
	}, [
		awaitingSession,
		bootstrapProfile,
		convexLegacyId,
		hasSession,
		syncGeneration,
		syncState
	]);
	const phase = deriveAuthPhase({
		sessionPending: awaitingSession,
		hasSession,
		syncState,
		convexAuthLoading,
		isAuthenticated,
		profilePending,
		user
	});
	const retrySync = async () => {
		setSessionSync((prev) => ({
			...prev,
			authError: null,
			syncState: "idle"
		}));
		setSyncGeneration((value) => value + 1);
	};
	const clearAuthError = () => {
		setSessionSync((prev) => ({
			...prev,
			authError: null
		}));
	};
	const resetSession = () => {
		resetBootstrapSessionCache();
		setSessionSync({
			syncState: "idle",
			authError: null,
			sessionUser: null,
			convexLegacyId: null,
			bootstrapProfile: null
		});
	};
	const applySessionUser = (nextUser) => {
		if (nextUser) {
			if (nextUser.agencyId && nextUser.role && nextUser.status) {
				setSessionSync({
					syncState: "success",
					authError: null,
					sessionUser: nextUser,
					convexLegacyId: nextUser.id,
					bootstrapProfile: {
						legacyId: nextUser.id,
						role: nextUser.role,
						status: nextUser.status,
						agencyId: nextUser.agencyId
					}
				});
				return;
			}
			setSessionSync((prev) => ({
				...prev,
				sessionUser: nextUser
			}));
			setSyncGeneration((value) => value + 1);
		} else resetSession();
	};
	return {
		phase,
		user,
		authError,
		clearAuthError,
		retrySync,
		resetSession,
		applySessionUser,
		loading: isLoadingPhase(phase),
		isSyncing: syncState === "running"
	};
}
var AuthContext = (0, import_react.createContext)(void 0);
function useAuth() {
	const context = (0, import_react.use)(AuthContext);
	if (context === void 0) throw new Error("useAuth must be used within an AuthProvider");
	return context;
}
function AuthProvider({ children }) {
	const { phase: authPhase, user, authError, clearAuthError, retrySync, resetSession, applySessionUser, loading, isSyncing } = useAuthSync();
	const signIn = (email, password) => {
		return authService.signIn(email, password).then((authUser) => {
			applySessionUser(authUser);
			return authUser;
		});
	};
	const signUp = (data) => {
		return authService.signUp(data).then((authUser) => {
			applySessionUser(authUser);
			return authUser;
		});
	};
	const signInWithGoogle = (callbackURL) => {
		return authService.signInWithGoogle(callbackURL);
	};
	const signOut = () => {
		return authService.signOut().then(() => {
			resetSession();
		}).catch((error) => {
			resetSession();
			throw error;
		});
	};
	const resetPassword = async (email) => {
		await authService.resetPassword();
	};
	const verifyPasswordResetCode = async (oobCode) => {
		return await authService.verifyPasswordResetCode();
	};
	const confirmPasswordReset = async (oobCode, newPassword) => {
		await authService.confirmPasswordReset();
	};
	const updateProfile = async (data) => {
		const authUser = await authService.updateProfile(data);
		applySessionUser(authUser);
		return authUser;
	};
	const changePassword = async (currentPassword, newPassword) => {
		await authService.changePassword();
	};
	const deleteAccount = () => {
		return authService.deleteAccount().then(() => {
			resetSession();
		});
	};
	const connectGoogleAdsAccount = async () => {
		await authService.connectGoogleAdsAccount();
	};
	const connectGoogleAnalyticsAccount = async () => {
		await authService.connectGoogleAnalyticsAccount();
	};
	const connectFacebookAdsAccount = async () => {
		await authService.connectFacebookAdsAccount();
	};
	const connectLinkedInAdsAccount = async () => {
		await authService.connectLinkedInAdsAccount();
	};
	const startGoogleOauth = async (redirect, clientId) => {
		return await authService.startGoogleOauth(redirect, clientId);
	};
	const startGoogleWorkspaceOauth = async (redirect) => {
		return await authService.startGoogleWorkspaceOauth(redirect);
	};
	const startMetaOauth = async (redirect, clientId, surface, entryPoint) => {
		return await authService.startMetaOauth(redirect, clientId, surface, entryPoint);
	};
	const startTikTokOauth = async (redirect, clientId) => {
		return await authService.startTikTokOauth(redirect, clientId);
	};
	const startLinkedInOauth = async (redirect, clientId) => {
		return await authService.startLinkedInOauth(redirect, clientId);
	};
	const disconnectProvider = async (providerId, clientId) => {
		await authService.disconnectProvider();
	};
	const getIdToken = async () => {
		if (typeof window === "undefined") return null;
		const result = await authClient.convex.token().catch(() => null);
		if (!result) return null;
		let payload = result;
		if (typeof result === "object" && result !== null && "data" in result) payload = result.data;
		if (typeof payload !== "object" || payload === null || !("token" in payload)) return null;
		const token = payload.token;
		return typeof token === "string" && token.trim().length > 0 ? token.trim() : null;
	};
	const value = {
		user,
		authPhase,
		loading,
		isSyncing,
		authError,
		clearAuthError,
		retrySync,
		signIn,
		signInWithGoogle,
		connectGoogleAdsAccount,
		connectGoogleAnalyticsAccount,
		connectFacebookAdsAccount,
		connectLinkedInAdsAccount,
		startGoogleOauth,
		startGoogleWorkspaceOauth,
		startMetaOauth,
		startTikTokOauth,
		startLinkedInOauth,
		disconnectProvider,
		getIdToken,
		signUp,
		signOut,
		resetPassword,
		verifyPasswordResetCode,
		confirmPasswordReset,
		updateProfile,
		changePassword,
		deleteAccount
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthContext.Provider, {
		value,
		children
	});
}
//#endregion
export { parseJsonBodySafely as _, ForbiddenError as a, ServiceUnavailableError as c, apiFetch as d, authClient as f, useAuth as g, isLoadingPhase as h, BadRequestError as i, UnauthorizedError as l, getFriendlyAuthErrorMessage as m, ApiError as n, NotFoundError as o, decodeJwtSubject as p, AuthProvider as r, RateLimitError as s, ApiClientError as t, ValidationError as u };
