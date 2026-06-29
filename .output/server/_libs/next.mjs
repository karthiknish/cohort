import { t as __commonJSMin } from "../_runtime.mjs";
import { x as require_react } from "./@convex-dev/better-auth+[...].mjs";
//#region node_modules/next/dist/compiled/@edge-runtime/cookies/index.js
var require_cookies$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var src_exports = {};
	__export(src_exports, {
		RequestCookies: () => RequestCookies,
		ResponseCookies: () => ResponseCookies,
		parseCookie: () => parseCookie,
		parseSetCookie: () => parseSetCookie,
		stringifyCookie: () => stringifyCookie
	});
	module.exports = __toCommonJS(src_exports);
	function stringifyCookie(c) {
		var _a;
		const attrs = [
			"path" in c && c.path && `Path=${c.path}`,
			"expires" in c && (c.expires || c.expires === 0) && `Expires=${(typeof c.expires === "number" ? new Date(c.expires) : c.expires).toUTCString()}`,
			"maxAge" in c && typeof c.maxAge === "number" && `Max-Age=${c.maxAge}`,
			"domain" in c && c.domain && `Domain=${c.domain}`,
			"secure" in c && c.secure && "Secure",
			"httpOnly" in c && c.httpOnly && "HttpOnly",
			"sameSite" in c && c.sameSite && `SameSite=${c.sameSite}`,
			"partitioned" in c && c.partitioned && "Partitioned",
			"priority" in c && c.priority && `Priority=${c.priority}`
		].filter(Boolean);
		const stringified = `${c.name}=${encodeURIComponent((_a = c.value) != null ? _a : "")}`;
		return attrs.length === 0 ? stringified : `${stringified}; ${attrs.join("; ")}`;
	}
	function parseCookie(cookie) {
		const map = /* @__PURE__ */ new Map();
		for (const pair of cookie.split(/; */)) {
			if (!pair) continue;
			const splitAt = pair.indexOf("=");
			if (splitAt === -1) {
				map.set(pair, "true");
				continue;
			}
			const [key, value] = [pair.slice(0, splitAt), pair.slice(splitAt + 1)];
			try {
				map.set(key, decodeURIComponent(value != null ? value : "true"));
			} catch {}
		}
		return map;
	}
	function parseSetCookie(setCookie) {
		if (!setCookie) return;
		const [[name, value], ...attributes] = parseCookie(setCookie);
		const { domain, expires, httponly, maxage, path, samesite, secure, partitioned, priority } = Object.fromEntries(attributes.map(([key, value2]) => [key.toLowerCase().replace(/-/g, ""), value2]));
		return compact({
			name,
			value: decodeURIComponent(value),
			domain,
			...expires && { expires: new Date(expires) },
			...httponly && { httpOnly: true },
			...typeof maxage === "string" && { maxAge: Number(maxage) },
			path,
			...samesite && { sameSite: parseSameSite(samesite) },
			...secure && { secure: true },
			...priority && { priority: parsePriority(priority) },
			...partitioned && { partitioned: true }
		});
	}
	function compact(t) {
		const newT = {};
		for (const key in t) if (t[key]) newT[key] = t[key];
		return newT;
	}
	var SAME_SITE = [
		"strict",
		"lax",
		"none"
	];
	function parseSameSite(string) {
		string = string.toLowerCase();
		return SAME_SITE.includes(string) ? string : void 0;
	}
	var PRIORITY = [
		"low",
		"medium",
		"high"
	];
	function parsePriority(string) {
		string = string.toLowerCase();
		return PRIORITY.includes(string) ? string : void 0;
	}
	function splitCookiesString(cookiesString) {
		if (!cookiesString) return [];
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	var RequestCookies = class {
		constructor(requestHeaders) {
			/** @internal */
			this._parsed = /* @__PURE__ */ new Map();
			this._headers = requestHeaders;
			const header = requestHeaders.get("cookie");
			if (header) {
				const parsed = parseCookie(header);
				for (const [name, value] of parsed) this._parsed.set(name, {
					name,
					value
				});
			}
		}
		[Symbol.iterator]() {
			return this._parsed[Symbol.iterator]();
		}
		/**
		* The amount of cookies received from the client
		*/
		get size() {
			return this._parsed.size;
		}
		get(...args) {
			const name = typeof args[0] === "string" ? args[0] : args[0].name;
			return this._parsed.get(name);
		}
		getAll(...args) {
			var _a;
			const all = Array.from(this._parsed);
			if (!args.length) return all.map(([_, value]) => value);
			const name = typeof args[0] === "string" ? args[0] : (_a = args[0]) == null ? void 0 : _a.name;
			return all.filter(([n]) => n === name).map(([_, value]) => value);
		}
		has(name) {
			return this._parsed.has(name);
		}
		set(...args) {
			const [name, value] = args.length === 1 ? [args[0].name, args[0].value] : args;
			const map = this._parsed;
			map.set(name, {
				name,
				value
			});
			this._headers.set("cookie", Array.from(map).map(([_, value2]) => stringifyCookie(value2)).join("; "));
			return this;
		}
		/**
		* Delete the cookies matching the passed name or names in the request.
		*/
		delete(names) {
			const map = this._parsed;
			const result = !Array.isArray(names) ? map.delete(names) : names.map((name) => map.delete(name));
			this._headers.set("cookie", Array.from(map).map(([_, value]) => stringifyCookie(value)).join("; "));
			return result;
		}
		/**
		* Delete all the cookies in the cookies in the request.
		*/
		clear() {
			this.delete(Array.from(this._parsed.keys()));
			return this;
		}
		/**
		* Format the cookies in the request as a string for logging
		*/
		[Symbol.for("edge-runtime.inspect.custom")]() {
			return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
		}
		toString() {
			return [...this._parsed.values()].map((v) => `${v.name}=${encodeURIComponent(v.value)}`).join("; ");
		}
	};
	var ResponseCookies = class {
		constructor(responseHeaders) {
			/** @internal */
			this._parsed = /* @__PURE__ */ new Map();
			var _a, _b, _c;
			this._headers = responseHeaders;
			const setCookie = (_c = (_b = (_a = responseHeaders.getSetCookie) == null ? void 0 : _a.call(responseHeaders)) != null ? _b : responseHeaders.get("set-cookie")) != null ? _c : [];
			const cookieStrings = Array.isArray(setCookie) ? setCookie : splitCookiesString(setCookie);
			for (const cookieString of cookieStrings) {
				const parsed = parseSetCookie(cookieString);
				if (parsed) this._parsed.set(parsed.name, parsed);
			}
		}
		/**
		* {@link https://wicg.github.io/cookie-store/#CookieStore-get CookieStore#get} without the Promise.
		*/
		get(...args) {
			const key = typeof args[0] === "string" ? args[0] : args[0].name;
			return this._parsed.get(key);
		}
		/**
		* {@link https://wicg.github.io/cookie-store/#CookieStore-getAll CookieStore#getAll} without the Promise.
		*/
		getAll(...args) {
			var _a;
			const all = Array.from(this._parsed.values());
			if (!args.length) return all;
			const key = typeof args[0] === "string" ? args[0] : (_a = args[0]) == null ? void 0 : _a.name;
			return all.filter((c) => c.name === key);
		}
		has(name) {
			return this._parsed.has(name);
		}
		/**
		* {@link https://wicg.github.io/cookie-store/#CookieStore-set CookieStore#set} without the Promise.
		*/
		set(...args) {
			const [name, value, cookie] = args.length === 1 ? [
				args[0].name,
				args[0].value,
				args[0]
			] : args;
			const map = this._parsed;
			map.set(name, normalizeCookie({
				name,
				value,
				...cookie
			}));
			replace(map, this._headers);
			return this;
		}
		/**
		* {@link https://wicg.github.io/cookie-store/#CookieStore-delete CookieStore#delete} without the Promise.
		*/
		delete(...args) {
			const [name, options] = typeof args[0] === "string" ? [args[0]] : [args[0].name, args[0]];
			return this.set({
				...options,
				name,
				value: "",
				expires: /* @__PURE__ */ new Date(0)
			});
		}
		[Symbol.for("edge-runtime.inspect.custom")]() {
			return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
		}
		toString() {
			return [...this._parsed.values()].map(stringifyCookie).join("; ");
		}
	};
	function replace(bag, headers) {
		headers.delete("set-cookie");
		for (const [, value] of bag) {
			const serialized = stringifyCookie(value);
			headers.append("set-cookie", serialized);
		}
	}
	function normalizeCookie(cookie = {
		name: "",
		value: ""
	}) {
		if (typeof cookie.expires === "number") cookie.expires = new Date(cookie.expires);
		if (cookie.maxAge) cookie.expires = new Date(Date.now() + cookie.maxAge * 1e3);
		if (cookie.path === null || cookie.path === void 0) cookie.path = "/";
		return cookie;
	}
	0 && (module.exports = {
		RequestCookies,
		ResponseCookies,
		parseCookie,
		parseSetCookie,
		stringifyCookie
	});
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/cookies.js
var require_cookies$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		RequestCookies: null,
		ResponseCookies: null,
		stringifyCookie: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		RequestCookies: function() {
			return _cookies.RequestCookies;
		},
		ResponseCookies: function() {
			return _cookies.ResponseCookies;
		},
		stringifyCookie: function() {
			return _cookies.stringifyCookie;
		}
	});
	var _cookies = require_cookies$2();
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/adapters/reflect.js
var require_reflect = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "ReflectAdapter", {
		enumerable: true,
		get: function() {
			return ReflectAdapter;
		}
	});
	var ReflectAdapter = class {
		static get(target, prop, receiver) {
			const value = Reflect.get(target, prop, receiver);
			if (typeof value === "function") return value.bind(target);
			return value;
		}
		static set(target, prop, value, receiver) {
			return Reflect.set(target, prop, value, receiver);
		}
		static has(target, prop) {
			return Reflect.has(target, prop);
		}
		static deleteProperty(target, prop) {
			return Reflect.deleteProperty(target, prop);
		}
	};
}));
//#endregion
//#region node_modules/next/dist/server/app-render/async-local-storage.js
var require_async_local_storage = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		bindSnapshot: null,
		createAsyncLocalStorage: null,
		createSnapshot: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		bindSnapshot: function() {
			return bindSnapshot;
		},
		createAsyncLocalStorage: function() {
			return createAsyncLocalStorage;
		},
		createSnapshot: function() {
			return createSnapshot;
		}
	});
	var sharedAsyncLocalStorageNotAvailableError = Object.defineProperty(/* @__PURE__ */ new Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", {
		value: "E504",
		enumerable: false,
		configurable: true
	});
	var FakeAsyncLocalStorage = class {
		disable() {
			throw sharedAsyncLocalStorageNotAvailableError;
		}
		getStore() {}
		run() {
			throw sharedAsyncLocalStorageNotAvailableError;
		}
		exit() {
			throw sharedAsyncLocalStorageNotAvailableError;
		}
		enterWith() {
			throw sharedAsyncLocalStorageNotAvailableError;
		}
		static bind(fn) {
			return fn;
		}
	};
	var maybeGlobalAsyncLocalStorage = typeof globalThis !== "undefined" && globalThis.AsyncLocalStorage;
	function createAsyncLocalStorage() {
		if (maybeGlobalAsyncLocalStorage) return new maybeGlobalAsyncLocalStorage();
		return new FakeAsyncLocalStorage();
	}
	function bindSnapshot(fn) {
		if (maybeGlobalAsyncLocalStorage) return maybeGlobalAsyncLocalStorage.bind(fn);
		return FakeAsyncLocalStorage.bind(fn);
	}
	function createSnapshot() {
		if (maybeGlobalAsyncLocalStorage) return maybeGlobalAsyncLocalStorage.snapshot();
		return function(fn, ...args) {
			return fn(...args);
		};
	}
}));
//#endregion
//#region node_modules/next/dist/server/app-render/work-async-storage-instance.js
var require_work_async_storage_instance = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "workAsyncStorageInstance", {
		enumerable: true,
		get: function() {
			return workAsyncStorageInstance;
		}
	});
	var workAsyncStorageInstance = (0, require_async_local_storage().createAsyncLocalStorage)();
}));
//#endregion
//#region node_modules/next/dist/server/app-render/work-async-storage.external.js
var require_work_async_storage_external = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "workAsyncStorage", {
		enumerable: true,
		get: function() {
			return _workasyncstorageinstance.workAsyncStorageInstance;
		}
	});
	var _workasyncstorageinstance = require_work_async_storage_instance();
}));
//#endregion
//#region node_modules/next/dist/shared/lib/action-revalidation-kind.js
var require_action_revalidation_kind = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		ActionDidNotRevalidate: null,
		ActionDidRevalidateDynamicOnly: null,
		ActionDidRevalidateStaticAndDynamic: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		ActionDidNotRevalidate: function() {
			return ActionDidNotRevalidate;
		},
		ActionDidRevalidateDynamicOnly: function() {
			return ActionDidRevalidateDynamicOnly;
		},
		ActionDidRevalidateStaticAndDynamic: function() {
			return ActionDidRevalidateStaticAndDynamic;
		}
	});
	var ActionDidNotRevalidate = 0;
	var ActionDidRevalidateStaticAndDynamic = 1;
	var ActionDidRevalidateDynamicOnly = 2;
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/adapters/request-cookies.js
var require_request_cookies = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		MutableRequestCookiesAdapter: null,
		ReadonlyRequestCookiesError: null,
		RequestCookiesAdapter: null,
		appendMutableCookies: null,
		areCookiesMutableInCurrentPhase: null,
		createCookiesWithMutableAccessCheck: null,
		getModifiedCookieValues: null,
		responseCookiesToRequestCookies: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		MutableRequestCookiesAdapter: function() {
			return MutableRequestCookiesAdapter;
		},
		ReadonlyRequestCookiesError: function() {
			return ReadonlyRequestCookiesError;
		},
		RequestCookiesAdapter: function() {
			return RequestCookiesAdapter;
		},
		appendMutableCookies: function() {
			return appendMutableCookies;
		},
		areCookiesMutableInCurrentPhase: function() {
			return areCookiesMutableInCurrentPhase;
		},
		createCookiesWithMutableAccessCheck: function() {
			return createCookiesWithMutableAccessCheck;
		},
		getModifiedCookieValues: function() {
			return getModifiedCookieValues;
		},
		responseCookiesToRequestCookies: function() {
			return responseCookiesToRequestCookies;
		}
	});
	var _cookies = require_cookies$1();
	var _reflect = require_reflect();
	var _workasyncstorageexternal = require_work_async_storage_external();
	var _actionrevalidationkind = require_action_revalidation_kind();
	var ReadonlyRequestCookiesError = class ReadonlyRequestCookiesError extends Error {
		constructor() {
			super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
		}
		static callable() {
			throw new ReadonlyRequestCookiesError();
		}
	};
	var RequestCookiesAdapter = class {
		static seal(cookies) {
			return new Proxy(cookies, { get(target, prop, receiver) {
				switch (prop) {
					case "clear":
					case "delete":
					case "set": return ReadonlyRequestCookiesError.callable;
					default: return _reflect.ReflectAdapter.get(target, prop, receiver);
				}
			} });
		}
	};
	var SYMBOL_MODIFY_COOKIE_VALUES = Symbol.for("next.mutated.cookies");
	function getModifiedCookieValues(cookies) {
		const modified = cookies[SYMBOL_MODIFY_COOKIE_VALUES];
		if (!modified || !Array.isArray(modified) || modified.length === 0) return [];
		return modified;
	}
	function appendMutableCookies(headers, mutableCookies) {
		const modifiedCookieValues = getModifiedCookieValues(mutableCookies);
		if (modifiedCookieValues.length === 0) return false;
		const resCookies = new _cookies.ResponseCookies(headers);
		const returnedCookies = resCookies.getAll();
		for (const cookie of modifiedCookieValues) resCookies.set(cookie);
		for (const cookie of returnedCookies) resCookies.set(cookie);
		return true;
	}
	var MutableRequestCookiesAdapter = class {
		static wrap(cookies, onUpdateCookies) {
			const responseCookies = new _cookies.ResponseCookies(new Headers());
			for (const cookie of cookies.getAll()) responseCookies.set(cookie);
			let modifiedValues = [];
			const modifiedCookies = /* @__PURE__ */ new Set();
			const updateResponseCookies = () => {
				const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
				if (workStore) workStore.pathWasRevalidated = _actionrevalidationkind.ActionDidRevalidateStaticAndDynamic;
				modifiedValues = responseCookies.getAll().filter((c) => modifiedCookies.has(c.name));
				if (onUpdateCookies) {
					const serializedCookies = [];
					for (const cookie of modifiedValues) {
						const tempCookies = new _cookies.ResponseCookies(new Headers());
						tempCookies.set(cookie);
						serializedCookies.push(tempCookies.toString());
					}
					onUpdateCookies(serializedCookies);
				}
			};
			const wrappedCookies = new Proxy(responseCookies, { get(target, prop, receiver) {
				switch (prop) {
					case SYMBOL_MODIFY_COOKIE_VALUES: return modifiedValues;
					case "delete": return function(...args) {
						modifiedCookies.add(typeof args[0] === "string" ? args[0] : args[0].name);
						try {
							target.delete(...args);
							return wrappedCookies;
						} finally {
							updateResponseCookies();
						}
					};
					case "set": return function(...args) {
						modifiedCookies.add(typeof args[0] === "string" ? args[0] : args[0].name);
						try {
							target.set(...args);
							return wrappedCookies;
						} finally {
							updateResponseCookies();
						}
					};
					default: return _reflect.ReflectAdapter.get(target, prop, receiver);
				}
			} });
			return wrappedCookies;
		}
	};
	function createCookiesWithMutableAccessCheck(requestStore) {
		const wrappedCookies = new Proxy(requestStore.mutableCookies, { get(target, prop, receiver) {
			switch (prop) {
				case "delete": return function(...args) {
					ensureCookiesAreStillMutable(requestStore, "cookies().delete");
					target.delete(...args);
					return wrappedCookies;
				};
				case "set": return function(...args) {
					ensureCookiesAreStillMutable(requestStore, "cookies().set");
					target.set(...args);
					return wrappedCookies;
				};
				default: return _reflect.ReflectAdapter.get(target, prop, receiver);
			}
		} });
		return wrappedCookies;
	}
	function areCookiesMutableInCurrentPhase(requestStore) {
		return requestStore.phase === "action";
	}
	/** Ensure that cookies() starts throwing on mutation
	* if we changed phases and can no longer mutate.
	*
	* This can happen when going:
	*   'render' -> 'after'
	*   'action' -> 'render'
	* */ function ensureCookiesAreStillMutable(requestStore, _callingExpression) {
		if (!areCookiesMutableInCurrentPhase(requestStore)) throw new ReadonlyRequestCookiesError();
	}
	function responseCookiesToRequestCookies(responseCookies) {
		const requestCookies = new _cookies.RequestCookies(new Headers());
		for (const cookie of responseCookies.getAll()) requestCookies.set(cookie);
		return requestCookies;
	}
}));
//#endregion
//#region node_modules/next/dist/server/app-render/work-unit-async-storage-instance.js
var require_work_unit_async_storage_instance = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "workUnitAsyncStorageInstance", {
		enumerable: true,
		get: function() {
			return workUnitAsyncStorageInstance;
		}
	});
	var workUnitAsyncStorageInstance = (0, require_async_local_storage().createAsyncLocalStorage)();
}));
//#endregion
//#region node_modules/next/dist/client/components/app-router-headers.js
var require_app_router_headers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		ACTION_HEADER: null,
		FLIGHT_HEADERS: null,
		NEXT_ACTION_NOT_FOUND_HEADER: null,
		NEXT_ACTION_REVALIDATED_HEADER: null,
		NEXT_DID_POSTPONE_HEADER: null,
		NEXT_HMR_REFRESH_HASH_COOKIE: null,
		NEXT_HMR_REFRESH_HEADER: null,
		NEXT_HTML_REQUEST_ID_HEADER: null,
		NEXT_INSTANT_PREFETCH_HEADER: null,
		NEXT_INSTANT_TEST_COOKIE: null,
		NEXT_IS_PRERENDER_HEADER: null,
		NEXT_REQUEST_ID_HEADER: null,
		NEXT_REWRITTEN_PATH_HEADER: null,
		NEXT_REWRITTEN_QUERY_HEADER: null,
		NEXT_ROUTER_PREFETCH_HEADER: null,
		NEXT_ROUTER_SEGMENT_PREFETCH_HEADER: null,
		NEXT_ROUTER_STALE_TIME_HEADER: null,
		NEXT_ROUTER_STATE_TREE_HEADER: null,
		NEXT_RSC_UNION_QUERY: null,
		NEXT_URL: null,
		RSC_CONTENT_TYPE_HEADER: null,
		RSC_HEADER: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		ACTION_HEADER: function() {
			return ACTION_HEADER;
		},
		FLIGHT_HEADERS: function() {
			return FLIGHT_HEADERS;
		},
		NEXT_ACTION_NOT_FOUND_HEADER: function() {
			return NEXT_ACTION_NOT_FOUND_HEADER;
		},
		NEXT_ACTION_REVALIDATED_HEADER: function() {
			return NEXT_ACTION_REVALIDATED_HEADER;
		},
		NEXT_DID_POSTPONE_HEADER: function() {
			return NEXT_DID_POSTPONE_HEADER;
		},
		NEXT_HMR_REFRESH_HASH_COOKIE: function() {
			return NEXT_HMR_REFRESH_HASH_COOKIE;
		},
		NEXT_HMR_REFRESH_HEADER: function() {
			return NEXT_HMR_REFRESH_HEADER;
		},
		NEXT_HTML_REQUEST_ID_HEADER: function() {
			return NEXT_HTML_REQUEST_ID_HEADER;
		},
		NEXT_INSTANT_PREFETCH_HEADER: function() {
			return NEXT_INSTANT_PREFETCH_HEADER;
		},
		NEXT_INSTANT_TEST_COOKIE: function() {
			return NEXT_INSTANT_TEST_COOKIE;
		},
		NEXT_IS_PRERENDER_HEADER: function() {
			return NEXT_IS_PRERENDER_HEADER;
		},
		NEXT_REQUEST_ID_HEADER: function() {
			return NEXT_REQUEST_ID_HEADER;
		},
		NEXT_REWRITTEN_PATH_HEADER: function() {
			return NEXT_REWRITTEN_PATH_HEADER;
		},
		NEXT_REWRITTEN_QUERY_HEADER: function() {
			return NEXT_REWRITTEN_QUERY_HEADER;
		},
		NEXT_ROUTER_PREFETCH_HEADER: function() {
			return NEXT_ROUTER_PREFETCH_HEADER;
		},
		NEXT_ROUTER_SEGMENT_PREFETCH_HEADER: function() {
			return NEXT_ROUTER_SEGMENT_PREFETCH_HEADER;
		},
		NEXT_ROUTER_STALE_TIME_HEADER: function() {
			return NEXT_ROUTER_STALE_TIME_HEADER;
		},
		NEXT_ROUTER_STATE_TREE_HEADER: function() {
			return NEXT_ROUTER_STATE_TREE_HEADER;
		},
		NEXT_RSC_UNION_QUERY: function() {
			return NEXT_RSC_UNION_QUERY;
		},
		NEXT_URL: function() {
			return NEXT_URL;
		},
		RSC_CONTENT_TYPE_HEADER: function() {
			return RSC_CONTENT_TYPE_HEADER;
		},
		RSC_HEADER: function() {
			return RSC_HEADER;
		}
	});
	var RSC_HEADER = "rsc";
	var ACTION_HEADER = "next-action";
	var NEXT_ROUTER_STATE_TREE_HEADER = "next-router-state-tree";
	var NEXT_ROUTER_PREFETCH_HEADER = "next-router-prefetch";
	var NEXT_ROUTER_SEGMENT_PREFETCH_HEADER = "next-router-segment-prefetch";
	var NEXT_HMR_REFRESH_HEADER = "next-hmr-refresh";
	var NEXT_HMR_REFRESH_HASH_COOKIE = "__next_hmr_refresh_hash__";
	var NEXT_URL = "next-url";
	var RSC_CONTENT_TYPE_HEADER = "text/x-component";
	var NEXT_INSTANT_PREFETCH_HEADER = "next-instant-navigation-testing-prefetch";
	var NEXT_INSTANT_TEST_COOKIE = "next-instant-navigation-testing";
	var FLIGHT_HEADERS = [
		RSC_HEADER,
		NEXT_ROUTER_STATE_TREE_HEADER,
		NEXT_ROUTER_PREFETCH_HEADER,
		NEXT_HMR_REFRESH_HEADER,
		NEXT_ROUTER_SEGMENT_PREFETCH_HEADER
	];
	var NEXT_RSC_UNION_QUERY = "_rsc";
	var NEXT_ROUTER_STALE_TIME_HEADER = "x-nextjs-stale-time";
	var NEXT_DID_POSTPONE_HEADER = "x-nextjs-postponed";
	var NEXT_REWRITTEN_PATH_HEADER = "x-nextjs-rewritten-path";
	var NEXT_REWRITTEN_QUERY_HEADER = "x-nextjs-rewritten-query";
	var NEXT_IS_PRERENDER_HEADER = "x-nextjs-prerender";
	var NEXT_ACTION_NOT_FOUND_HEADER = "x-nextjs-action-not-found";
	var NEXT_REQUEST_ID_HEADER = "x-nextjs-request-id";
	var NEXT_HTML_REQUEST_ID_HEADER = "x-nextjs-html-request-id";
	var NEXT_ACTION_REVALIDATED_HEADER = "x-action-revalidated";
	if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
		Object.defineProperty(exports.default, "__esModule", { value: true });
		Object.assign(exports.default, exports);
		module.exports = exports.default;
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/invariant-error.js
var require_invariant_error = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "InvariantError", {
		enumerable: true,
		get: function() {
			return InvariantError;
		}
	});
	var InvariantError = class extends Error {
		constructor(message, options) {
			super(`Invariant: ${message.endsWith(".") ? message : message + "."} This is a bug in Next.js.`, options);
			this.name = "InvariantError";
		}
	};
}));
//#endregion
//#region node_modules/next/dist/shared/lib/promise-with-resolvers.js
var require_promise_with_resolvers = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "createPromiseWithResolvers", {
		enumerable: true,
		get: function() {
			return createPromiseWithResolvers;
		}
	});
	function createPromiseWithResolvers() {
		let resolve;
		let reject;
		const promise = new Promise((res, rej) => {
			resolve = res;
			reject = rej;
		});
		return {
			resolve,
			reject,
			promise
		};
	}
}));
//#endregion
//#region node_modules/next/dist/server/app-render/staged-rendering.js
var require_staged_rendering = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		RenderStage: null,
		StagedRenderingController: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		RenderStage: function() {
			return RenderStage;
		},
		StagedRenderingController: function() {
			return StagedRenderingController;
		}
	});
	var _invarianterror = require_invariant_error();
	var _promisewithresolvers = require_promise_with_resolvers();
	var RenderStage = /*#__PURE__*/ function(RenderStage) {
		RenderStage[RenderStage["Before"] = 1] = "Before";
		RenderStage[RenderStage["EarlyStatic"] = 2] = "EarlyStatic";
		RenderStage[RenderStage["Static"] = 3] = "Static";
		RenderStage[RenderStage["EarlyRuntime"] = 4] = "EarlyRuntime";
		RenderStage[RenderStage["Runtime"] = 5] = "Runtime";
		RenderStage[RenderStage["Dynamic"] = 6] = "Dynamic";
		RenderStage[RenderStage["Abandoned"] = 7] = "Abandoned";
		return RenderStage;
	}({});
	var StagedRenderingController = class {
		constructor(abortSignal, abandonController, shouldTrackSyncIO) {
			this.abortSignal = abortSignal;
			this.abandonController = abandonController;
			this.shouldTrackSyncIO = shouldTrackSyncIO;
			this.currentStage = 1;
			this.syncInterruptReason = null;
			this.staticStageEndTime = Infinity;
			this.runtimeStageEndTime = Infinity;
			this.staticStageListeners = [];
			this.earlyRuntimeStageListeners = [];
			this.runtimeStageListeners = [];
			this.dynamicStageListeners = [];
			this.staticStagePromise = (0, _promisewithresolvers.createPromiseWithResolvers)();
			this.earlyRuntimeStagePromise = (0, _promisewithresolvers.createPromiseWithResolvers)();
			this.runtimeStagePromise = (0, _promisewithresolvers.createPromiseWithResolvers)();
			this.dynamicStagePromise = (0, _promisewithresolvers.createPromiseWithResolvers)();
			if (abortSignal) abortSignal.addEventListener("abort", () => {
				const { reason } = abortSignal;
				this.staticStagePromise.promise.catch(ignoreReject);
				this.staticStagePromise.reject(reason);
				this.earlyRuntimeStagePromise.promise.catch(ignoreReject);
				this.earlyRuntimeStagePromise.reject(reason);
				this.runtimeStagePromise.promise.catch(ignoreReject);
				this.runtimeStagePromise.reject(reason);
				this.dynamicStagePromise.promise.catch(ignoreReject);
				this.dynamicStagePromise.reject(reason);
			}, { once: true });
			if (abandonController) abandonController.signal.addEventListener("abort", () => {
				this.abandonRender();
			}, { once: true });
		}
		onStage(stage, callback) {
			if (this.currentStage >= stage) callback();
			else if (stage === 3) this.staticStageListeners.push(callback);
			else if (stage === 4) this.earlyRuntimeStageListeners.push(callback);
			else if (stage === 5) this.runtimeStageListeners.push(callback);
			else if (stage === 6) this.dynamicStageListeners.push(callback);
			else throw Object.defineProperty(new _invarianterror.InvariantError(`Invalid render stage: ${stage}`), "__NEXT_ERROR_CODE", {
				value: "E881",
				enumerable: false,
				configurable: true
			});
		}
		shouldTrackSyncInterrupt() {
			if (!this.shouldTrackSyncIO) return false;
			switch (this.currentStage) {
				case 1: return false;
				case 2:
				case 3: return true;
				case 4: return true;
				case 5: return false;
				case 6:
				case 7: return false;
				default: return false;
			}
		}
		syncInterruptCurrentStageWithReason(reason) {
			if (this.currentStage === 1) return;
			if (this.currentStage === 7) return;
			if (this.abandonController) {
				this.abandonController.abort();
				return;
			}
			if (this.abortSignal) {
				this.syncInterruptReason = reason;
				this.currentStage = 7;
				return;
			}
			switch (this.currentStage) {
				case 2:
				case 3:
				case 4:
					this.syncInterruptReason = reason;
					this.advanceStage(6);
					return;
				case 5: return;
				default:
			}
		}
		getSyncInterruptReason() {
			return this.syncInterruptReason;
		}
		getStaticStageEndTime() {
			return this.staticStageEndTime;
		}
		getRuntimeStageEndTime() {
			return this.runtimeStageEndTime;
		}
		abandonRender() {
			const { currentStage } = this;
			switch (currentStage) {
				case 2: this.resolveStaticStage();
				case 3: this.resolveEarlyRuntimeStage();
				case 4: this.resolveRuntimeStage();
				case 5:
					this.currentStage = 7;
					return;
				case 6:
				case 1:
				case 7: break;
				default:
			}
		}
		advanceStage(stage) {
			if (stage <= this.currentStage) return;
			let currentStage = this.currentStage;
			this.currentStage = stage;
			if (currentStage < 3 && stage >= 3) this.resolveStaticStage();
			if (currentStage < 4 && stage >= 4) this.resolveEarlyRuntimeStage();
			if (currentStage < 5 && stage >= 5) {
				this.staticStageEndTime = performance.now() + performance.timeOrigin;
				this.resolveRuntimeStage();
			}
			if (currentStage < 6 && stage >= 6) {
				this.runtimeStageEndTime = performance.now() + performance.timeOrigin;
				this.resolveDynamicStage();
				return;
			}
		}
		/** Fire the `onStage` listeners for the static stage and unblock any promises waiting for it. */ resolveStaticStage() {
			const staticListeners = this.staticStageListeners;
			for (let i = 0; i < staticListeners.length; i++) staticListeners[i]();
			staticListeners.length = 0;
			this.staticStagePromise.resolve();
		}
		/** Fire the `onStage` listeners for the early runtime stage and unblock any promises waiting for it. */ resolveEarlyRuntimeStage() {
			const earlyRuntimeListeners = this.earlyRuntimeStageListeners;
			for (let i = 0; i < earlyRuntimeListeners.length; i++) earlyRuntimeListeners[i]();
			earlyRuntimeListeners.length = 0;
			this.earlyRuntimeStagePromise.resolve();
		}
		/** Fire the `onStage` listeners for the runtime stage and unblock any promises waiting for it. */ resolveRuntimeStage() {
			const runtimeListeners = this.runtimeStageListeners;
			for (let i = 0; i < runtimeListeners.length; i++) runtimeListeners[i]();
			runtimeListeners.length = 0;
			this.runtimeStagePromise.resolve();
		}
		/** Fire the `onStage` listeners for the dynamic stage and unblock any promises waiting for it. */ resolveDynamicStage() {
			const dynamicListeners = this.dynamicStageListeners;
			for (let i = 0; i < dynamicListeners.length; i++) dynamicListeners[i]();
			dynamicListeners.length = 0;
			this.dynamicStagePromise.resolve();
		}
		getStagePromise(stage) {
			switch (stage) {
				case 3: return this.staticStagePromise.promise;
				case 4: return this.earlyRuntimeStagePromise.promise;
				case 5: return this.runtimeStagePromise.promise;
				case 6: return this.dynamicStagePromise.promise;
				default: throw Object.defineProperty(new _invarianterror.InvariantError(`Invalid render stage: ${stage}`), "__NEXT_ERROR_CODE", {
					value: "E881",
					enumerable: false,
					configurable: true
				});
			}
		}
		waitForStage(stage) {
			return this.getStagePromise(stage);
		}
		delayUntilStage(stage, displayName, resolvedValue) {
			const promise = makeDevtoolsIOPromiseFromIOTrigger(this.getStagePromise(stage), displayName, resolvedValue);
			if (this.abortSignal) promise.catch(ignoreReject);
			return promise;
		}
	};
	function ignoreReject() {}
	function makeDevtoolsIOPromiseFromIOTrigger(ioTrigger, displayName, resolvedValue) {
		const promise = new Promise((resolve, reject) => {
			ioTrigger.then(resolve.bind(null, resolvedValue), reject);
		});
		if (displayName !== void 0) promise.displayName = displayName;
		return promise;
	}
}));
//#endregion
//#region node_modules/next/dist/server/app-render/work-unit-async-storage.external.js
var require_work_unit_async_storage_external = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		getCacheSignal: null,
		getDraftModeProviderForCacheScope: null,
		getHmrRefreshHash: null,
		getPrerenderResumeDataCache: null,
		getRenderResumeDataCache: null,
		getServerComponentsHmrCache: null,
		getStagedRenderingController: null,
		isHmrRefresh: null,
		isInEarlyRenderStage: null,
		throwForMissingRequestStore: null,
		throwInvariantForMissingStore: null,
		workUnitAsyncStorage: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		getCacheSignal: function() {
			return getCacheSignal;
		},
		getDraftModeProviderForCacheScope: function() {
			return getDraftModeProviderForCacheScope;
		},
		getHmrRefreshHash: function() {
			return getHmrRefreshHash;
		},
		getPrerenderResumeDataCache: function() {
			return getPrerenderResumeDataCache;
		},
		getRenderResumeDataCache: function() {
			return getRenderResumeDataCache;
		},
		getServerComponentsHmrCache: function() {
			return getServerComponentsHmrCache;
		},
		getStagedRenderingController: function() {
			return getStagedRenderingController;
		},
		isHmrRefresh: function() {
			return isHmrRefresh;
		},
		isInEarlyRenderStage: function() {
			return isInEarlyRenderStage;
		},
		throwForMissingRequestStore: function() {
			return throwForMissingRequestStore;
		},
		throwInvariantForMissingStore: function() {
			return throwInvariantForMissingStore;
		},
		workUnitAsyncStorage: function() {
			return _workunitasyncstorageinstance.workUnitAsyncStorageInstance;
		}
	});
	var _workunitasyncstorageinstance = require_work_unit_async_storage_instance();
	var _approuterheaders = require_app_router_headers();
	var _invarianterror = require_invariant_error();
	var _stagedrendering = require_staged_rendering();
	function isInEarlyRenderStage(requestStore) {
		const stagedRendering = requestStore.stagedRendering;
		if (stagedRendering) return stagedRendering.currentStage === _stagedrendering.RenderStage.EarlyStatic || stagedRendering.currentStage === _stagedrendering.RenderStage.EarlyRuntime;
		return false;
	}
	function throwForMissingRequestStore(callingExpression) {
		throw Object.defineProperty(/* @__PURE__ */ new Error(`\`${callingExpression}\` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", {
			value: "E251",
			enumerable: false,
			configurable: true
		});
	}
	function throwInvariantForMissingStore() {
		throw Object.defineProperty(new _invarianterror.InvariantError("Expected workUnitAsyncStorage to have a store."), "__NEXT_ERROR_CODE", {
			value: "E696",
			enumerable: false,
			configurable: true
		});
	}
	function getPrerenderResumeDataCache(workUnitStore) {
		switch (workUnitStore.type) {
			case "prerender":
			case "prerender-runtime":
			case "prerender-ppr": return workUnitStore.prerenderResumeDataCache;
			case "prerender-client":
			case "validation-client": return workUnitStore.prerenderResumeDataCache;
			case "request": if (workUnitStore.prerenderResumeDataCache) return workUnitStore.prerenderResumeDataCache;
			case "prerender-legacy":
			case "cache":
			case "private-cache":
			case "unstable-cache":
			case "generate-static-params": return null;
			default: return workUnitStore;
		}
	}
	function getRenderResumeDataCache(workUnitStore) {
		switch (workUnitStore.type) {
			case "request":
			case "prerender":
			case "prerender-runtime":
			case "prerender-client":
			case "validation-client": if (workUnitStore.renderResumeDataCache) return workUnitStore.renderResumeDataCache;
			case "prerender-ppr": return workUnitStore.prerenderResumeDataCache ?? null;
			case "cache":
			case "private-cache":
			case "unstable-cache":
			case "prerender-legacy":
			case "generate-static-params": return null;
			default: return workUnitStore;
		}
	}
	function getHmrRefreshHash(workUnitStore) {
		if (process.env.__NEXT_DEV_SERVER) switch (workUnitStore.type) {
			case "cache":
			case "private-cache":
			case "prerender":
			case "prerender-runtime": return workUnitStore.hmrRefreshHash;
			case "request":
				var _workUnitStore_cookies_get;
				return (_workUnitStore_cookies_get = workUnitStore.cookies.get(_approuterheaders.NEXT_HMR_REFRESH_HASH_COOKIE)) == null ? void 0 : _workUnitStore_cookies_get.value;
			case "prerender-client":
			case "validation-client":
			case "prerender-ppr":
			case "prerender-legacy":
			case "unstable-cache":
			case "generate-static-params": break;
			default:
		}
	}
	function isHmrRefresh(workUnitStore) {
		if (process.env.__NEXT_DEV_SERVER) switch (workUnitStore.type) {
			case "cache":
			case "private-cache":
			case "request": return workUnitStore.isHmrRefresh ?? false;
			case "prerender":
			case "prerender-client":
			case "validation-client":
			case "prerender-runtime":
			case "prerender-ppr":
			case "prerender-legacy":
			case "unstable-cache":
			case "generate-static-params": break;
			default:
		}
		return false;
	}
	function getServerComponentsHmrCache(workUnitStore) {
		if (process.env.__NEXT_DEV_SERVER) switch (workUnitStore.type) {
			case "cache":
			case "private-cache":
			case "request": return workUnitStore.serverComponentsHmrCache;
			case "prerender":
			case "prerender-client":
			case "validation-client":
			case "prerender-runtime":
			case "prerender-ppr":
			case "prerender-legacy":
			case "unstable-cache":
			case "generate-static-params": break;
			default:
		}
	}
	function getDraftModeProviderForCacheScope(workStore, workUnitStore) {
		if (workStore.isDraftMode) switch (workUnitStore.type) {
			case "cache":
			case "private-cache":
			case "unstable-cache":
			case "prerender-runtime":
			case "request": return workUnitStore.draftMode;
			case "prerender":
			case "prerender-client":
			case "validation-client":
			case "prerender-ppr":
			case "prerender-legacy":
			case "generate-static-params": break;
			default:
		}
	}
	function getStagedRenderingController(workUnitStore) {
		switch (workUnitStore.type) {
			case "request":
			case "prerender-runtime": return workUnitStore.stagedRendering ?? null;
			case "prerender":
			case "prerender-client":
			case "validation-client":
			case "prerender-ppr":
			case "prerender-legacy":
			case "cache":
			case "private-cache":
			case "unstable-cache":
			case "generate-static-params": return null;
			default: return workUnitStore;
		}
	}
	function getCacheSignal(workUnitStore) {
		switch (workUnitStore.type) {
			case "prerender":
			case "prerender-client":
			case "validation-client":
			case "prerender-runtime": return workUnitStore.cacheSignal;
			case "request": if (workUnitStore.cacheSignal) return workUnitStore.cacheSignal;
			case "prerender-ppr":
			case "prerender-legacy":
			case "cache":
			case "private-cache":
			case "unstable-cache":
			case "generate-static-params": return null;
			default: return workUnitStore;
		}
	}
}));
//#endregion
//#region node_modules/next/dist/client/components/hooks-server-context.js
var require_hooks_server_context = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		DynamicServerError: null,
		isDynamicServerError: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		DynamicServerError: function() {
			return DynamicServerError;
		},
		isDynamicServerError: function() {
			return isDynamicServerError;
		}
	});
	var DYNAMIC_ERROR_CODE = "DYNAMIC_SERVER_USAGE";
	var DynamicServerError = class extends Error {
		constructor(description) {
			super(`Dynamic server usage: ${description}`), this.description = description, this.digest = DYNAMIC_ERROR_CODE;
		}
	};
	function isDynamicServerError(err) {
		if (typeof err !== "object" || err === null || !("digest" in err) || typeof err.digest !== "string") return false;
		return err.digest === DYNAMIC_ERROR_CODE;
	}
	if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
		Object.defineProperty(exports.default, "__esModule", { value: true });
		Object.assign(exports.default, exports);
		module.exports = exports.default;
	}
}));
//#endregion
//#region node_modules/next/dist/client/components/static-generation-bailout.js
var require_static_generation_bailout = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		StaticGenBailoutError: null,
		isStaticGenBailoutError: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		StaticGenBailoutError: function() {
			return StaticGenBailoutError;
		},
		isStaticGenBailoutError: function() {
			return isStaticGenBailoutError;
		}
	});
	var NEXT_STATIC_GEN_BAILOUT = "NEXT_STATIC_GEN_BAILOUT";
	var StaticGenBailoutError = class extends Error {
		constructor(...args) {
			super(...args), this.code = NEXT_STATIC_GEN_BAILOUT;
		}
	};
	function isStaticGenBailoutError(error) {
		if (typeof error !== "object" || error === null || !("code" in error)) return false;
		return error.code === NEXT_STATIC_GEN_BAILOUT;
	}
	if ((typeof exports.default === "function" || typeof exports.default === "object" && exports.default !== null) && typeof exports.default.__esModule === "undefined") {
		Object.defineProperty(exports.default, "__esModule", { value: true });
		Object.assign(exports.default, exports);
		module.exports = exports.default;
	}
}));
//#endregion
//#region node_modules/next/dist/server/dynamic-rendering-utils.js
var require_dynamic_rendering_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		delayUntilRuntimeStage: null,
		getRuntimeStage: null,
		isHangingPromiseRejectionError: null,
		makeDevtoolsIOAwarePromise: null,
		makeHangingPromise: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		delayUntilRuntimeStage: function() {
			return delayUntilRuntimeStage;
		},
		getRuntimeStage: function() {
			return getRuntimeStage;
		},
		isHangingPromiseRejectionError: function() {
			return isHangingPromiseRejectionError;
		},
		makeDevtoolsIOAwarePromise: function() {
			return makeDevtoolsIOAwarePromise;
		},
		makeHangingPromise: function() {
			return makeHangingPromise;
		}
	});
	var _stagedrendering = require_staged_rendering();
	function isHangingPromiseRejectionError(err) {
		if (typeof err !== "object" || err === null || !("digest" in err)) return false;
		return err.digest === HANGING_PROMISE_REJECTION;
	}
	var HANGING_PROMISE_REJECTION = "HANGING_PROMISE_REJECTION";
	var HangingPromiseRejectionError = class extends Error {
		constructor(route, expression) {
			super(`During prerendering, ${expression} rejects when the prerender is complete. Typically these errors are handled by React but if you move ${expression} to a different context by using \`setTimeout\`, \`after\`, or similar functions you may observe this error and you should handle it in that context. This occurred at route "${route}".`), this.route = route, this.expression = expression, this.digest = HANGING_PROMISE_REJECTION;
		}
	};
	var abortListenersBySignal = /* @__PURE__ */ new WeakMap();
	function makeHangingPromise(signal, route, expression) {
		if (signal.aborted) return Promise.reject(new HangingPromiseRejectionError(route, expression));
		else {
			const hangingPromise = new Promise((_, reject) => {
				const boundRejection = reject.bind(null, new HangingPromiseRejectionError(route, expression));
				let currentListeners = abortListenersBySignal.get(signal);
				if (currentListeners) currentListeners.push(boundRejection);
				else {
					const listeners = [boundRejection];
					abortListenersBySignal.set(signal, listeners);
					signal.addEventListener("abort", () => {
						for (let i = 0; i < listeners.length; i++) listeners[i]();
					}, { once: true });
				}
			});
			hangingPromise.catch(ignoreReject);
			return hangingPromise;
		}
	}
	function ignoreReject() {}
	function makeDevtoolsIOAwarePromise(underlying, requestStore, stage) {
		if (requestStore.stagedRendering) return requestStore.stagedRendering.delayUntilStage(stage, void 0, underlying);
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve(underlying);
			}, 0);
		});
	}
	function getRuntimeStage(stagedRendering) {
		if (stagedRendering.currentStage === _stagedrendering.RenderStage.EarlyStatic || stagedRendering.currentStage === _stagedrendering.RenderStage.EarlyRuntime) return _stagedrendering.RenderStage.EarlyRuntime;
		return _stagedrendering.RenderStage.Runtime;
	}
	function delayUntilRuntimeStage(prerenderStore, result) {
		const { stagedRendering } = prerenderStore;
		if (!stagedRendering) return result;
		return stagedRendering.waitForStage(getRuntimeStage(stagedRendering)).then(() => result);
	}
}));
//#endregion
//#region node_modules/next/dist/lib/framework/boundary-constants.js
var require_boundary_constants$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		METADATA_BOUNDARY_NAME: null,
		OUTLET_BOUNDARY_NAME: null,
		ROOT_LAYOUT_BOUNDARY_NAME: null,
		VIEWPORT_BOUNDARY_NAME: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		METADATA_BOUNDARY_NAME: function() {
			return METADATA_BOUNDARY_NAME;
		},
		OUTLET_BOUNDARY_NAME: function() {
			return OUTLET_BOUNDARY_NAME;
		},
		ROOT_LAYOUT_BOUNDARY_NAME: function() {
			return ROOT_LAYOUT_BOUNDARY_NAME;
		},
		VIEWPORT_BOUNDARY_NAME: function() {
			return VIEWPORT_BOUNDARY_NAME;
		}
	});
	var METADATA_BOUNDARY_NAME = "__next_metadata_boundary__";
	var VIEWPORT_BOUNDARY_NAME = "__next_viewport_boundary__";
	var OUTLET_BOUNDARY_NAME = "__next_outlet_boundary__";
	var ROOT_LAYOUT_BOUNDARY_NAME = "__next_root_layout_boundary__";
}));
//#endregion
//#region node_modules/next/dist/lib/scheduler.js
var require_scheduler = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		atLeastOneTask: null,
		scheduleImmediate: null,
		scheduleOnNextTick: null,
		waitAtLeastOneReactRenderTask: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		atLeastOneTask: function() {
			return atLeastOneTask;
		},
		scheduleImmediate: function() {
			return scheduleImmediate;
		},
		scheduleOnNextTick: function() {
			return scheduleOnNextTick;
		},
		waitAtLeastOneReactRenderTask: function() {
			return waitAtLeastOneReactRenderTask;
		}
	});
	var scheduleOnNextTick = (cb) => {
		Promise.resolve().then(() => {
			if (process.env.NEXT_RUNTIME === "edge") setTimeout(cb, 0);
			else process.nextTick(cb);
		});
	};
	var scheduleImmediate = (cb) => {
		if (process.env.NEXT_RUNTIME === "edge") setTimeout(cb, 0);
		else setImmediate(cb);
	};
	function atLeastOneTask() {
		return new Promise((resolve) => scheduleImmediate(resolve));
	}
	function waitAtLeastOneReactRenderTask() {
		if (process.env.NEXT_RUNTIME === "edge") return new Promise((r) => setTimeout(r, 0));
		else return new Promise((r) => setImmediate(r));
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/lazy-dynamic/bailout-to-csr.js
var require_bailout_to_csr = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		BailoutToCSRError: null,
		isBailoutToCSRError: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		BailoutToCSRError: function() {
			return BailoutToCSRError;
		},
		isBailoutToCSRError: function() {
			return isBailoutToCSRError;
		}
	});
	var BAILOUT_TO_CSR = "BAILOUT_TO_CLIENT_SIDE_RENDERING";
	var BailoutToCSRError = class extends Error {
		constructor(reason) {
			super(`Bail out to client-side rendering: ${reason}`), this.reason = reason, this.digest = BAILOUT_TO_CSR;
		}
	};
	function isBailoutToCSRError(err) {
		if (typeof err !== "object" || err === null || !("digest" in err)) return false;
		return err.digest === BAILOUT_TO_CSR;
	}
}));
//#endregion
//#region node_modules/next/dist/server/app-render/instant-validation/boundary-constants.js
var require_boundary_constants = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "INSTANT_VALIDATION_BOUNDARY_NAME", {
		enumerable: true,
		get: function() {
			return INSTANT_VALIDATION_BOUNDARY_NAME;
		}
	});
	var INSTANT_VALIDATION_BOUNDARY_NAME = "__next_instant_validation_boundary__";
}));
//#endregion
//#region node_modules/next/dist/server/app-render/dynamic-rendering.js
/**
* The functions provided by this module are used to communicate certain properties
* about the currently running code so that Next.js can make decisions on how to handle
* the current execution in different rendering modes such as pre-rendering, resuming, and SSR.
*
* Today Next.js treats all code as potentially static. Certain APIs may only make sense when dynamically rendering.
* Traditionally this meant deopting the entire render to dynamic however with PPR we can now deopt parts
* of a React tree as dynamic while still keeping other parts static. There are really two different kinds of
* Dynamic indications.
*
* The first is simply an intention to be dynamic. unstable_noStore is an example of this where
* the currently executing code simply declares that the current scope is dynamic but if you use it
* inside unstable_cache it can still be cached. This type of indication can be removed if we ever
* make the default dynamic to begin with because the only way you would ever be static is inside
* a cache scope which this indication does not affect.
*
* The second is an indication that a dynamic data source was read. This is a stronger form of dynamic
* because it means that it is inappropriate to cache this at all. using a dynamic data source inside
* unstable_cache should error. If you want to use some dynamic data inside unstable_cache you should
* read that data outside the cache and pass it in as an argument to the cached function.
*/ var require_dynamic_rendering = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		DynamicHoleKind: null,
		Postpone: null,
		PreludeState: null,
		abortAndThrowOnSynchronousRequestDataAccess: null,
		abortOnSynchronousPlatformIOAccess: null,
		accessedDynamicData: null,
		annotateDynamicAccess: null,
		consumeDynamicAccess: null,
		createDynamicTrackingState: null,
		createDynamicValidationState: null,
		createHangingInputAbortSignal: null,
		createInstantValidationState: null,
		createRenderInBrowserAbortSignal: null,
		formatDynamicAPIAccesses: null,
		getFirstDynamicReason: null,
		getNavigationDisallowedDynamicReasons: null,
		getStaticShellDisallowedDynamicReasons: null,
		isDynamicPostpone: null,
		isPrerenderInterruptedError: null,
		logDisallowedDynamicError: null,
		markCurrentScopeAsDynamic: null,
		postponeWithTracking: null,
		throwIfDisallowedDynamic: null,
		throwToInterruptStaticGeneration: null,
		trackAllowedDynamicAccess: null,
		trackDynamicDataInDynamicRender: null,
		trackDynamicHoleInNavigation: null,
		trackDynamicHoleInRuntimeShell: null,
		trackDynamicHoleInStaticShell: null,
		trackThrownErrorInNavigation: null,
		useDynamicRouteParams: null,
		useDynamicSearchParams: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		DynamicHoleKind: function() {
			return DynamicHoleKind;
		},
		Postpone: function() {
			return Postpone;
		},
		PreludeState: function() {
			return PreludeState;
		},
		abortAndThrowOnSynchronousRequestDataAccess: function() {
			return abortAndThrowOnSynchronousRequestDataAccess;
		},
		abortOnSynchronousPlatformIOAccess: function() {
			return abortOnSynchronousPlatformIOAccess;
		},
		accessedDynamicData: function() {
			return accessedDynamicData;
		},
		annotateDynamicAccess: function() {
			return annotateDynamicAccess;
		},
		consumeDynamicAccess: function() {
			return consumeDynamicAccess;
		},
		createDynamicTrackingState: function() {
			return createDynamicTrackingState;
		},
		createDynamicValidationState: function() {
			return createDynamicValidationState;
		},
		createHangingInputAbortSignal: function() {
			return createHangingInputAbortSignal;
		},
		createInstantValidationState: function() {
			return createInstantValidationState;
		},
		createRenderInBrowserAbortSignal: function() {
			return createRenderInBrowserAbortSignal;
		},
		formatDynamicAPIAccesses: function() {
			return formatDynamicAPIAccesses;
		},
		getFirstDynamicReason: function() {
			return getFirstDynamicReason;
		},
		getNavigationDisallowedDynamicReasons: function() {
			return getNavigationDisallowedDynamicReasons;
		},
		getStaticShellDisallowedDynamicReasons: function() {
			return getStaticShellDisallowedDynamicReasons;
		},
		isDynamicPostpone: function() {
			return isDynamicPostpone;
		},
		isPrerenderInterruptedError: function() {
			return isPrerenderInterruptedError;
		},
		logDisallowedDynamicError: function() {
			return logDisallowedDynamicError;
		},
		markCurrentScopeAsDynamic: function() {
			return markCurrentScopeAsDynamic;
		},
		postponeWithTracking: function() {
			return postponeWithTracking;
		},
		throwIfDisallowedDynamic: function() {
			return throwIfDisallowedDynamic;
		},
		throwToInterruptStaticGeneration: function() {
			return throwToInterruptStaticGeneration;
		},
		trackAllowedDynamicAccess: function() {
			return trackAllowedDynamicAccess;
		},
		trackDynamicDataInDynamicRender: function() {
			return trackDynamicDataInDynamicRender;
		},
		trackDynamicHoleInNavigation: function() {
			return trackDynamicHoleInNavigation;
		},
		trackDynamicHoleInRuntimeShell: function() {
			return trackDynamicHoleInRuntimeShell;
		},
		trackDynamicHoleInStaticShell: function() {
			return trackDynamicHoleInStaticShell;
		},
		trackThrownErrorInNavigation: function() {
			return trackThrownErrorInNavigation;
		},
		useDynamicRouteParams: function() {
			return useDynamicRouteParams;
		},
		useDynamicSearchParams: function() {
			return useDynamicSearchParams;
		}
	});
	var _react = /*#__PURE__*/ _interop_require_default(require_react());
	var _hooksservercontext = require_hooks_server_context();
	var _staticgenerationbailout = require_static_generation_bailout();
	var _workunitasyncstorageexternal = require_work_unit_async_storage_external();
	var _workasyncstorageexternal = require_work_async_storage_external();
	var _dynamicrenderingutils = require_dynamic_rendering_utils();
	var _boundaryconstants = require_boundary_constants$1();
	var _scheduler = require_scheduler();
	var _bailouttocsr = require_bailout_to_csr();
	var _invarianterror = require_invariant_error();
	var _boundaryconstants1 = require_boundary_constants();
	function _interop_require_default(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	var hasPostpone = typeof _react.default.unstable_postpone === "function";
	function createDynamicTrackingState(isDebugDynamicAccesses) {
		return {
			isDebugDynamicAccesses,
			dynamicAccesses: [],
			syncDynamicErrorWithStack: null
		};
	}
	function createDynamicValidationState() {
		return {
			hasSuspenseAboveBody: false,
			hasDynamicMetadata: false,
			dynamicMetadata: null,
			hasDynamicViewport: false,
			hasAllowedDynamic: false,
			dynamicErrors: []
		};
	}
	function getFirstDynamicReason(trackingState) {
		var _trackingState_dynamicAccesses_;
		return (_trackingState_dynamicAccesses_ = trackingState.dynamicAccesses[0]) == null ? void 0 : _trackingState_dynamicAccesses_.expression;
	}
	function markCurrentScopeAsDynamic(store, workUnitStore, expression) {
		if (workUnitStore) switch (workUnitStore.type) {
			case "cache":
			case "unstable-cache": return;
			case "private-cache": return;
			case "prerender-legacy":
			case "prerender-ppr":
			case "request":
			case "generate-static-params": break;
			default:
		}
		if (store.forceDynamic || store.forceStatic) return;
		if (store.dynamicShouldError) throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${store.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${expression}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", {
			value: "E553",
			enumerable: false,
			configurable: true
		});
		if (workUnitStore) switch (workUnitStore.type) {
			case "prerender-ppr": return postponeWithTracking(store.route, expression, workUnitStore.dynamicTracking);
			case "prerender-legacy":
				workUnitStore.revalidate = 0;
				const err = Object.defineProperty(new _hooksservercontext.DynamicServerError(`Route ${store.route} couldn't be rendered statically because it used ${expression}. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", {
					value: "E550",
					enumerable: false,
					configurable: true
				});
				store.dynamicUsageDescription = expression;
				store.dynamicUsageStack = err.stack;
				throw err;
			case "request": break;
			case "generate-static-params": break;
			default:
		}
	}
	function throwToInterruptStaticGeneration(expression, store, prerenderStore) {
		const err = Object.defineProperty(new _hooksservercontext.DynamicServerError(`Route ${store.route} couldn't be rendered statically because it used \`${expression}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", {
			value: "E558",
			enumerable: false,
			configurable: true
		});
		prerenderStore.revalidate = 0;
		store.dynamicUsageDescription = expression;
		store.dynamicUsageStack = err.stack;
		throw err;
	}
	function trackDynamicDataInDynamicRender(workUnitStore) {
		switch (workUnitStore.type) {
			case "cache":
			case "unstable-cache": return;
			case "private-cache": return;
			case "prerender":
			case "prerender-runtime":
			case "prerender-legacy":
			case "prerender-ppr":
			case "prerender-client":
			case "validation-client":
			case "generate-static-params": break;
			case "request": break;
			default:
		}
	}
	function abortOnSynchronousDynamicDataAccess(route, expression, prerenderStore) {
		const error = createPrerenderInterruptedError(`Route ${route} needs to bail out of prerendering at this point because it used ${expression}.`);
		prerenderStore.controller.abort(error);
		const dynamicTracking = prerenderStore.dynamicTracking;
		if (dynamicTracking) dynamicTracking.dynamicAccesses.push({
			stack: dynamicTracking.isDebugDynamicAccesses ? (/* @__PURE__ */ new Error()).stack : void 0,
			expression
		});
	}
	function abortOnSynchronousPlatformIOAccess(route, expression, errorWithStack, prerenderStore) {
		const dynamicTracking = prerenderStore.dynamicTracking;
		abortOnSynchronousDynamicDataAccess(route, expression, prerenderStore);
		if (dynamicTracking) {
			if (dynamicTracking.syncDynamicErrorWithStack === null) dynamicTracking.syncDynamicErrorWithStack = errorWithStack;
		}
	}
	function abortAndThrowOnSynchronousRequestDataAccess(route, expression, errorWithStack, prerenderStore) {
		if (prerenderStore.controller.signal.aborted === false) {
			abortOnSynchronousDynamicDataAccess(route, expression, prerenderStore);
			const dynamicTracking = prerenderStore.dynamicTracking;
			if (dynamicTracking) {
				if (dynamicTracking.syncDynamicErrorWithStack === null) dynamicTracking.syncDynamicErrorWithStack = errorWithStack;
			}
		}
		throw createPrerenderInterruptedError(`Route ${route} needs to bail out of prerendering at this point because it used ${expression}.`);
	}
	function Postpone({ reason, route }) {
		const prerenderStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		postponeWithTracking(route, reason, prerenderStore && prerenderStore.type === "prerender-ppr" ? prerenderStore.dynamicTracking : null);
	}
	function postponeWithTracking(route, expression, dynamicTracking) {
		assertPostpone();
		if (dynamicTracking) dynamicTracking.dynamicAccesses.push({
			stack: dynamicTracking.isDebugDynamicAccesses ? (/* @__PURE__ */ new Error()).stack : void 0,
			expression
		});
		_react.default.unstable_postpone(createPostponeReason(route, expression));
	}
	function createPostponeReason(route, expression) {
		return `Route ${route} needs to bail out of prerendering at this point because it used ${expression}. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error`;
	}
	function isDynamicPostpone(err) {
		if (typeof err === "object" && err !== null && typeof err.message === "string") return isDynamicPostponeReason(err.message);
		return false;
	}
	function isDynamicPostponeReason(reason) {
		return reason.includes("needs to bail out of prerendering at this point because it used") && reason.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
	}
	if (isDynamicPostponeReason(createPostponeReason("%%%", "^^^")) === false) throw Object.defineProperty(/* @__PURE__ */ new Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", {
		value: "E296",
		enumerable: false,
		configurable: true
	});
	var NEXT_PRERENDER_INTERRUPTED = "NEXT_PRERENDER_INTERRUPTED";
	function createPrerenderInterruptedError(message) {
		const error = Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
			value: "E394",
			enumerable: false,
			configurable: true
		});
		error.digest = NEXT_PRERENDER_INTERRUPTED;
		return error;
	}
	function isPrerenderInterruptedError(error) {
		return typeof error === "object" && error !== null && error.digest === NEXT_PRERENDER_INTERRUPTED && "name" in error && "message" in error && error instanceof Error;
	}
	function accessedDynamicData(dynamicAccesses) {
		return dynamicAccesses.length > 0;
	}
	function consumeDynamicAccess(serverDynamic, clientDynamic) {
		serverDynamic.dynamicAccesses.push(...clientDynamic.dynamicAccesses);
		return serverDynamic.dynamicAccesses;
	}
	function formatDynamicAPIAccesses(dynamicAccesses) {
		return dynamicAccesses.filter((access) => typeof access.stack === "string" && access.stack.length > 0).map(({ expression, stack }) => {
			stack = stack.split("\n").slice(4).filter((line) => {
				if (line.includes("node_modules/next/")) return false;
				if (line.includes(" (<anonymous>)")) return false;
				if (line.includes(" (node:")) return false;
				return true;
			}).join("\n");
			return `Dynamic API Usage Debug - ${expression}:\n${stack}`;
		});
	}
	function assertPostpone() {
		if (!hasPostpone) throw Object.defineProperty(/* @__PURE__ */ new Error(`Invariant: React.unstable_postpone is not defined. This suggests the wrong version of React was loaded. This is a bug in Next.js`), "__NEXT_ERROR_CODE", {
			value: "E224",
			enumerable: false,
			configurable: true
		});
	}
	function createRenderInBrowserAbortSignal() {
		const controller = new AbortController();
		controller.abort(Object.defineProperty(new _bailouttocsr.BailoutToCSRError("Render in Browser"), "__NEXT_ERROR_CODE", {
			value: "E721",
			enumerable: false,
			configurable: true
		}));
		return controller.signal;
	}
	function createHangingInputAbortSignal(workUnitStore) {
		switch (workUnitStore.type) {
			case "prerender":
			case "prerender-runtime":
				const controller = new AbortController();
				if (workUnitStore.cacheSignal) workUnitStore.cacheSignal.inputReady().then(() => {
					controller.abort();
				});
				else if (workUnitStore.type === "prerender-runtime" && workUnitStore.stagedRendering) {
					const { stagedRendering } = workUnitStore;
					stagedRendering.waitForStage((0, _dynamicrenderingutils.getRuntimeStage)(stagedRendering)).then(() => (0, _scheduler.scheduleOnNextTick)(() => controller.abort()));
				} else (0, _scheduler.scheduleOnNextTick)(() => controller.abort());
				return controller.signal;
			case "prerender-client":
			case "validation-client":
			case "prerender-ppr":
			case "prerender-legacy":
			case "request":
			case "cache":
			case "private-cache":
			case "unstable-cache":
			case "generate-static-params": return;
			default:
		}
	}
	function annotateDynamicAccess(expression, prerenderStore) {
		const dynamicTracking = prerenderStore.dynamicTracking;
		if (dynamicTracking) dynamicTracking.dynamicAccesses.push({
			stack: dynamicTracking.isDebugDynamicAccesses ? (/* @__PURE__ */ new Error()).stack : void 0,
			expression
		});
	}
	function useDynamicRouteParams(expression) {
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		if (workStore && workUnitStore) switch (workUnitStore.type) {
			case "prerender-client":
			case "prerender": {
				const fallbackParams = workUnitStore.fallbackRouteParams;
				if (fallbackParams && fallbackParams.size > 0) _react.default.use((0, _dynamicrenderingutils.makeHangingPromise)(workUnitStore.renderSignal, workStore.route, expression));
				break;
			}
			case "prerender-ppr": {
				const fallbackParams = workUnitStore.fallbackRouteParams;
				if (fallbackParams && fallbackParams.size > 0) return postponeWithTracking(workStore.route, expression, workUnitStore.dynamicTracking);
				break;
			}
			case "validation-client": break;
			case "prerender-runtime": throw Object.defineProperty(new _invarianterror.InvariantError(`\`${expression}\` was called during a runtime prerender. Next.js should be preventing ${expression} from being included in server components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
				value: "E771",
				enumerable: false,
				configurable: true
			});
			case "cache":
			case "private-cache": throw Object.defineProperty(new _invarianterror.InvariantError(`\`${expression}\` was called inside a cache scope. Next.js should be preventing ${expression} from being included in server components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
				value: "E745",
				enumerable: false,
				configurable: true
			});
			case "generate-static-params": throw Object.defineProperty(new _invarianterror.InvariantError(`\`${expression}\` was called in \`generateStaticParams\`. Next.js should be preventing ${expression} from being included in server component files statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
				value: "E1130",
				enumerable: false,
				configurable: true
			});
			case "prerender-legacy":
			case "request":
			case "unstable-cache": break;
			default:
		}
	}
	function useDynamicSearchParams(expression) {
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		if (!workStore) return;
		if (!workUnitStore) (0, _workunitasyncstorageexternal.throwForMissingRequestStore)(expression);
		switch (workUnitStore.type) {
			case "validation-client": return;
			case "prerender-client":
				_react.default.use((0, _dynamicrenderingutils.makeHangingPromise)(workUnitStore.renderSignal, workStore.route, expression));
				break;
			case "prerender-legacy":
			case "prerender-ppr":
				if (workStore.forceStatic) return;
				throw Object.defineProperty(new _bailouttocsr.BailoutToCSRError(expression), "__NEXT_ERROR_CODE", {
					value: "E394",
					enumerable: false,
					configurable: true
				});
			case "prerender":
			case "prerender-runtime": throw Object.defineProperty(new _invarianterror.InvariantError(`\`${expression}\` was called from a Server Component. Next.js should be preventing ${expression} from being included in server components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
				value: "E795",
				enumerable: false,
				configurable: true
			});
			case "cache":
			case "unstable-cache":
			case "private-cache": throw Object.defineProperty(new _invarianterror.InvariantError(`\`${expression}\` was called inside a cache scope. Next.js should be preventing ${expression} from being included in server components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
				value: "E745",
				enumerable: false,
				configurable: true
			});
			case "generate-static-params": throw Object.defineProperty(new _invarianterror.InvariantError(`\`${expression}\` was called in \`generateStaticParams\`. Next.js should be preventing ${expression} from being included in server component files statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
				value: "E1130",
				enumerable: false,
				configurable: true
			});
			case "request": return;
			default:
		}
	}
	var hasSuspenseRegex = /\n\s+at Suspense \(<anonymous>\)/;
	var hasSuspenseBeforeRootLayoutWithoutBodyOrImplicitBodyRegex = new RegExp(`\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at ${_boundaryconstants.ROOT_LAYOUT_BOUNDARY_NAME} \\([^\\n]*\\)`);
	var hasMetadataRegex = new RegExp(`\\n\\s+at ${_boundaryconstants.METADATA_BOUNDARY_NAME}[\\n\\s]`);
	var hasViewportRegex = new RegExp(`\\n\\s+at ${_boundaryconstants.VIEWPORT_BOUNDARY_NAME}[\\n\\s]`);
	var hasOutletRegex = new RegExp(`\\n\\s+at ${_boundaryconstants.OUTLET_BOUNDARY_NAME}[\\n\\s]`);
	var hasInstantValidationBoundaryRegex = new RegExp(`\\n\\s+at ${_boundaryconstants1.INSTANT_VALIDATION_BOUNDARY_NAME}[\\n\\s]`);
	function trackAllowedDynamicAccess(workStore, componentStack, dynamicValidation, clientDynamic) {
		if (hasOutletRegex.test(componentStack)) return;
		else if (hasMetadataRegex.test(componentStack)) {
			dynamicValidation.hasDynamicMetadata = true;
			return;
		} else if (hasViewportRegex.test(componentStack)) {
			dynamicValidation.hasDynamicViewport = true;
			return;
		} else if (hasSuspenseBeforeRootLayoutWithoutBodyOrImplicitBodyRegex.test(componentStack)) {
			dynamicValidation.hasAllowedDynamic = true;
			dynamicValidation.hasSuspenseAboveBody = true;
			return;
		} else if (hasSuspenseRegex.test(componentStack)) {
			dynamicValidation.hasAllowedDynamic = true;
			return;
		} else if (clientDynamic.syncDynamicErrorWithStack) {
			dynamicValidation.dynamicErrors.push(clientDynamic.syncDynamicErrorWithStack);
			return;
		} else {
			const message = `Route "${workStore.route}": Uncached data was accessed outside of <Suspense>. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`;
			const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1079",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			dynamicValidation.dynamicErrors.push(error);
			return;
		}
	}
	var DynamicHoleKind = /*#__PURE__*/ function(DynamicHoleKind) {
		/** We know that this hole is caused by runtime data. */ DynamicHoleKind[DynamicHoleKind["Runtime"] = 1] = "Runtime";
		/** We know that this hole is caused by dynamic data. */ DynamicHoleKind[DynamicHoleKind["Dynamic"] = 2] = "Dynamic";
		return DynamicHoleKind;
	}({});
	function createInstantValidationState(createInstantStack) {
		return {
			hasDynamicMetadata: false,
			hasAllowedClientDynamicAboveBoundary: false,
			dynamicMetadata: null,
			hasDynamicViewport: false,
			hasAllowedDynamic: false,
			dynamicErrors: [],
			validationPreventingErrors: [],
			thrownErrorsOutsideBoundary: [],
			createInstantStack
		};
	}
	function trackDynamicHoleInNavigation(workStore, componentStack, dynamicValidation, clientDynamic, kind, boundaryState) {
		if (hasOutletRegex.test(componentStack)) return;
		if (hasMetadataRegex.test(componentStack)) {
			const usageDescription = kind === 1 ? `Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed inside \`generateMetadata\` or you have file-based metadata such as icons that depend on dynamic params segments.` : `Uncached data or \`connection()\` was accessed inside \`generateMetadata\`.`;
			const message = `Route "${workStore.route}": ${usageDescription} Except for this instance, the page would have been entirely prerenderable which may have been the intended behavior. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`;
			dynamicValidation.dynamicMetadata = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1076",
				enumerable: false,
				configurable: true
			}), componentStack, dynamicValidation.createInstantStack);
			return;
		}
		if (hasViewportRegex.test(componentStack)) {
			const usageDescription = kind === 1 ? `Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed inside \`generateViewport\`.` : `Uncached data or \`connection()\` was accessed inside \`generateViewport\`.`;
			const message = `Route "${workStore.route}": ${usageDescription} This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`;
			const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1086",
				enumerable: false,
				configurable: true
			}), componentStack, dynamicValidation.createInstantStack);
			dynamicValidation.dynamicErrors.push(error);
			return;
		}
		const boundaryLocation = hasInstantValidationBoundaryRegex.exec(componentStack);
		if (!boundaryLocation) if (boundaryState.expectedIds.size === boundaryState.renderedIds.size) {
			dynamicValidation.hasAllowedClientDynamicAboveBoundary = true;
			dynamicValidation.hasAllowedDynamic = true;
			return;
		} else {
			const message = `Route "${workStore.route}": Could not validate \`unstable_instant\` because a Client Component in a parent segment prevented the page from rendering.`;
			const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1082",
				enumerable: false,
				configurable: true
			}), componentStack, dynamicValidation.createInstantStack);
			dynamicValidation.validationPreventingErrors.push(error);
			return;
		}
		else {
			const suspenseLocation = hasSuspenseRegex.exec(componentStack);
			if (suspenseLocation) {
				if (suspenseLocation.index < boundaryLocation.index) {
					dynamicValidation.hasAllowedDynamic = true;
					return;
				}
			}
		}
		if (clientDynamic.syncDynamicErrorWithStack) {
			const syncError = clientDynamic.syncDynamicErrorWithStack;
			if (dynamicValidation.createInstantStack !== null && syncError.cause === void 0) syncError.cause = dynamicValidation.createInstantStack();
			dynamicValidation.dynamicErrors.push(syncError);
			return;
		}
		const usageDescription = kind === 1 ? `Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed outside of \`<Suspense>\`.` : `Uncached data or \`connection()\` was accessed outside of \`<Suspense>\`.`;
		const message = `Route "${workStore.route}": ${usageDescription} This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`;
		const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
			value: "E1078",
			enumerable: false,
			configurable: true
		}), componentStack, dynamicValidation.createInstantStack);
		dynamicValidation.dynamicErrors.push(error);
	}
	function trackThrownErrorInNavigation(workStore, dynamicValidation, thrownValue, componentStack) {
		const boundaryLocation = hasInstantValidationBoundaryRegex.exec(componentStack);
		if (!boundaryLocation) {
			const error = addErrorContext(Object.defineProperty(new Error("An error occurred while attempting to validate instant UI. This error may be preventing the validation from completing.", { cause: thrownValue }), "__NEXT_ERROR_CODE", {
				value: "E1118",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			dynamicValidation.thrownErrorsOutsideBoundary.push(error);
		} else {
			const suspenseLocation = hasSuspenseRegex.exec(componentStack);
			if (suspenseLocation) {
				if (suspenseLocation.index < boundaryLocation.index) return;
			}
			const message = `Route "${workStore.route}": Could not validate \`unstable_instant\` because an error prevented the target segment from rendering.`;
			const error = addErrorContext(Object.defineProperty(new Error(message, { cause: thrownValue }), "__NEXT_ERROR_CODE", {
				value: "E1112",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			dynamicValidation.validationPreventingErrors.push(error);
		}
	}
	function trackDynamicHoleInRuntimeShell(workStore, componentStack, dynamicValidation, clientDynamic) {
		if (hasOutletRegex.test(componentStack)) return;
		else if (hasMetadataRegex.test(componentStack)) {
			const message = `Route "${workStore.route}": Uncached data or \`connection()\` was accessed inside \`generateMetadata\`. Except for this instance, the page would have been entirely prerenderable which may have been the intended behavior. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`;
			dynamicValidation.dynamicMetadata = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1080",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			return;
		} else if (hasViewportRegex.test(componentStack)) {
			const message = `Route "${workStore.route}": Uncached data or \`connection()\` was accessed inside \`generateViewport\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`;
			const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1077",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			dynamicValidation.dynamicErrors.push(error);
			return;
		} else if (hasSuspenseBeforeRootLayoutWithoutBodyOrImplicitBodyRegex.test(componentStack)) {
			dynamicValidation.hasAllowedDynamic = true;
			dynamicValidation.hasSuspenseAboveBody = true;
			return;
		} else if (hasSuspenseRegex.test(componentStack)) {
			dynamicValidation.hasAllowedDynamic = true;
			return;
		} else if (clientDynamic.syncDynamicErrorWithStack) {
			dynamicValidation.dynamicErrors.push(clientDynamic.syncDynamicErrorWithStack);
			return;
		}
		const message = `Route "${workStore.route}": Uncached data or \`connection()\` was accessed outside of \`<Suspense>\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`;
		const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
			value: "E1084",
			enumerable: false,
			configurable: true
		}), componentStack, null);
		dynamicValidation.dynamicErrors.push(error);
	}
	function trackDynamicHoleInStaticShell(workStore, componentStack, dynamicValidation, clientDynamic) {
		if (hasOutletRegex.test(componentStack)) return;
		else if (hasMetadataRegex.test(componentStack)) {
			const message = `Route "${workStore.route}": Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed inside \`generateMetadata\` or you have file-based metadata such as icons that depend on dynamic params segments. Except for this instance, the page would have been entirely prerenderable which may have been the intended behavior. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`;
			dynamicValidation.dynamicMetadata = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1085",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			return;
		} else if (hasViewportRegex.test(componentStack)) {
			const message = `Route "${workStore.route}": Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed inside \`generateViewport\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`;
			const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1081",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			dynamicValidation.dynamicErrors.push(error);
			return;
		} else if (hasSuspenseBeforeRootLayoutWithoutBodyOrImplicitBodyRegex.test(componentStack)) {
			dynamicValidation.hasAllowedDynamic = true;
			dynamicValidation.hasSuspenseAboveBody = true;
			return;
		} else if (hasSuspenseRegex.test(componentStack)) {
			dynamicValidation.hasAllowedDynamic = true;
			return;
		} else if (clientDynamic.syncDynamicErrorWithStack) {
			dynamicValidation.dynamicErrors.push(clientDynamic.syncDynamicErrorWithStack);
			return;
		} else {
			const message = `Route "${workStore.route}": Runtime data such as \`cookies()\`, \`headers()\`, \`params\`, or \`searchParams\` was accessed outside of \`<Suspense>\`. This delays the entire page from rendering, resulting in a slow user experience. Learn more: https://nextjs.org/docs/messages/blocking-route`;
			const error = addErrorContext(Object.defineProperty(new Error(message), "__NEXT_ERROR_CODE", {
				value: "E1083",
				enumerable: false,
				configurable: true
			}), componentStack, null);
			dynamicValidation.dynamicErrors.push(error);
			return;
		}
	}
	/**
	* In dev mode, we prefer using the owner stack, otherwise the provided
	* component stack is used.
	*
	* Accepts an already-created Error so the SWC error-code plugin can see the
	* `new Error(...)` call at each call site and auto-assign error codes.
	*/ function addErrorContext(error, componentStack, createInstantStack) {
		if (createInstantStack !== null) error.cause = createInstantStack();
		error.stack = error.name + ": " + error.message + componentStack;
		return error;
	}
	var PreludeState = /*#__PURE__*/ function(PreludeState) {
		PreludeState[PreludeState["Full"] = 0] = "Full";
		PreludeState[PreludeState["Empty"] = 1] = "Empty";
		PreludeState[PreludeState["Errored"] = 2] = "Errored";
		return PreludeState;
	}({});
	function logDisallowedDynamicError(workStore, error) {
		console.error(error);
		console.error(`To get a more detailed stack trace and pinpoint the issue, try one of the following:
  - Start the app in development mode by running \`next dev\`, then open "${workStore.route}" in your browser to investigate the error.
  - Rerun the production build with \`next build --debug-prerender\` to generate better stack traces.`);
	}
	function throwIfDisallowedDynamic(workStore, prelude, dynamicValidation, serverDynamic) {
		if (serverDynamic.syncDynamicErrorWithStack) {
			logDisallowedDynamicError(workStore, serverDynamic.syncDynamicErrorWithStack);
			throw new _staticgenerationbailout.StaticGenBailoutError();
		}
		if (prelude !== 0) {
			if (dynamicValidation.hasSuspenseAboveBody) return;
			const dynamicErrors = dynamicValidation.dynamicErrors;
			if (dynamicErrors.length > 0) {
				for (let i = 0; i < dynamicErrors.length; i++) logDisallowedDynamicError(workStore, dynamicErrors[i]);
				throw new _staticgenerationbailout.StaticGenBailoutError();
			}
			if (dynamicValidation.hasDynamicViewport) {
				console.error(`Route "${workStore.route}" has a \`generateViewport\` that depends on Request data (\`cookies()\`, etc...) or uncached external data (\`fetch(...)\`, etc...) without explicitly allowing fully dynamic rendering. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-viewport`);
				throw new _staticgenerationbailout.StaticGenBailoutError();
			}
			if (prelude === 1) {
				console.error(`Route "${workStore.route}" did not produce a static shell and Next.js was unable to determine a reason. This is a bug in Next.js.`);
				throw new _staticgenerationbailout.StaticGenBailoutError();
			}
		} else if (dynamicValidation.hasAllowedDynamic === false && dynamicValidation.hasDynamicMetadata) {
			console.error(`Route "${workStore.route}" has a \`generateMetadata\` that depends on Request data (\`cookies()\`, etc...) or uncached external data (\`fetch(...)\`, etc...) when the rest of the route does not. See more info here: https://nextjs.org/docs/messages/next-prerender-dynamic-metadata`);
			throw new _staticgenerationbailout.StaticGenBailoutError();
		}
	}
	function getStaticShellDisallowedDynamicReasons(workStore, prelude, dynamicValidation, configAllowsBlocking) {
		if (configAllowsBlocking || dynamicValidation.hasSuspenseAboveBody) return [];
		if (prelude !== 0) {
			const dynamicErrors = dynamicValidation.dynamicErrors;
			if (dynamicErrors.length > 0) return dynamicErrors;
			if (prelude === 1) return [Object.defineProperty(new _invarianterror.InvariantError(`Route "${workStore.route}" did not produce a static shell and Next.js was unable to determine a reason.`), "__NEXT_ERROR_CODE", {
				value: "E936",
				enumerable: false,
				configurable: true
			})];
		} else if (dynamicValidation.hasAllowedDynamic === false && dynamicValidation.dynamicErrors.length === 0 && dynamicValidation.dynamicMetadata) return [dynamicValidation.dynamicMetadata];
		return [];
	}
	function getNavigationDisallowedDynamicReasons(workStore, prelude, dynamicValidation, validationSampleTracking, boundaryState) {
		if (validationSampleTracking) {
			const { missingSampleErrors } = validationSampleTracking;
			if (missingSampleErrors.length > 0) return missingSampleErrors;
		}
		const { validationPreventingErrors } = dynamicValidation;
		if (validationPreventingErrors.length > 0) return validationPreventingErrors;
		if (boundaryState.renderedIds.size < boundaryState.expectedIds.size) {
			const { thrownErrorsOutsideBoundary, createInstantStack } = dynamicValidation;
			if (thrownErrorsOutsideBoundary.length === 0) {
				const message = `Route "${workStore.route}": Could not validate \`unstable_instant\` because the target segment was prevented from rendering for an unknown reason.`;
				const error = createInstantStack !== null ? createInstantStack() : /* @__PURE__ */ new Error();
				error.name = "Error";
				error.message = message;
				return [error];
			} else if (thrownErrorsOutsideBoundary.length === 1) {
				const message = `Route "${workStore.route}": Could not validate \`unstable_instant\` because the target segment was prevented from rendering, likely due to the following error.`;
				const error = createInstantStack !== null ? createInstantStack() : /* @__PURE__ */ new Error();
				error.name = "Error";
				error.message = message;
				return [error, thrownErrorsOutsideBoundary[0]];
			} else {
				const message = `Route "${workStore.route}": Could not validate \`unstable_instant\` because the target segment was prevented from rendering, likely due to one of the following errors.`;
				const error = createInstantStack !== null ? createInstantStack() : /* @__PURE__ */ new Error();
				error.name = "Error";
				error.message = message;
				return [error, ...thrownErrorsOutsideBoundary];
			}
		}
		if (prelude !== 0) {
			const dynamicErrors = dynamicValidation.dynamicErrors;
			if (dynamicErrors.length > 0) return dynamicErrors;
			if (prelude === 1) {
				if (dynamicValidation.hasAllowedClientDynamicAboveBoundary) return [];
				return [Object.defineProperty(new _invarianterror.InvariantError(`Route "${workStore.route}" failed to render during instant validation and Next.js was unable to determine a reason.`), "__NEXT_ERROR_CODE", {
					value: "E1055",
					enumerable: false,
					configurable: true
				})];
			}
		} else {
			const dynamicErrors = dynamicValidation.dynamicErrors;
			if (dynamicErrors.length > 0) return dynamicErrors;
			if (dynamicValidation.hasAllowedDynamic === false && dynamicValidation.dynamicMetadata) return [dynamicValidation.dynamicMetadata];
		}
		return [];
	}
}));
//#endregion
//#region node_modules/next/dist/server/create-deduped-by-callsite-server-error-logger.js
var require_create_deduped_by_callsite_server_error_logger = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "createDedupedByCallsiteServerErrorLoggerDev", {
		enumerable: true,
		get: function() {
			return createDedupedByCallsiteServerErrorLoggerDev;
		}
	});
	var _react = /*#__PURE__*/ _interop_require_wildcard(require_react());
	function _getRequireWildcardCache(nodeInterop) {
		if (typeof WeakMap !== "function") return null;
		var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
		var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
		return (_getRequireWildcardCache = function(nodeInterop) {
			return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
		})(nodeInterop);
	}
	function _interop_require_wildcard(obj, nodeInterop) {
		if (!nodeInterop && obj && obj.__esModule) return obj;
		if (obj === null || typeof obj !== "object" && typeof obj !== "function") return { default: obj };
		var cache = _getRequireWildcardCache(nodeInterop);
		if (cache && cache.has(obj)) return cache.get(obj);
		var newObj = { __proto__: null };
		var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
		for (var key in obj) if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
			var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
			if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
			else newObj[key] = obj[key];
		}
		newObj.default = obj;
		if (cache) cache.set(obj, newObj);
		return newObj;
	}
	var errorRef = { current: null };
	var cache = typeof _react.cache === "function" ? _react.cache : (fn) => fn;
	var logErrorOrWarn = process.env.__NEXT_CACHE_COMPONENTS ? console.error : console.warn;
	cache((key) => {
		try {
			logErrorOrWarn(errorRef.current);
		} finally {
			errorRef.current = null;
		}
	});
	function createDedupedByCallsiteServerErrorLoggerDev(getMessage) {
		return function logDedupedError(...args) {
			logErrorOrWarn(getMessage(...args));
		};
	}
}));
//#endregion
//#region node_modules/next/dist/server/app-render/after-task-async-storage-instance.js
var require_after_task_async_storage_instance = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "afterTaskAsyncStorageInstance", {
		enumerable: true,
		get: function() {
			return afterTaskAsyncStorageInstance;
		}
	});
	var afterTaskAsyncStorageInstance = (0, require_async_local_storage().createAsyncLocalStorage)();
}));
//#endregion
//#region node_modules/next/dist/server/app-render/after-task-async-storage.external.js
var require_after_task_async_storage_external = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "afterTaskAsyncStorage", {
		enumerable: true,
		get: function() {
			return _aftertaskasyncstorageinstance.afterTaskAsyncStorageInstance;
		}
	});
	var _aftertaskasyncstorageinstance = require_after_task_async_storage_instance();
}));
//#endregion
//#region node_modules/next/dist/server/request/utils.js
var require_utils$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		isRequestAPICallableInsideAfter: null,
		throwForSearchParamsAccessInUseCache: null,
		throwWithStaticGenerationBailoutErrorWithDynamicError: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		isRequestAPICallableInsideAfter: function() {
			return isRequestAPICallableInsideAfter;
		},
		throwForSearchParamsAccessInUseCache: function() {
			return throwForSearchParamsAccessInUseCache;
		},
		throwWithStaticGenerationBailoutErrorWithDynamicError: function() {
			return throwWithStaticGenerationBailoutErrorWithDynamicError;
		}
	});
	var _staticgenerationbailout = require_static_generation_bailout();
	var _aftertaskasyncstorageexternal = require_after_task_async_storage_external();
	function throwWithStaticGenerationBailoutErrorWithDynamicError(route, expression) {
		throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${route} with \`dynamic = "error"\` couldn't be rendered statically because it used ${expression}. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", {
			value: "E543",
			enumerable: false,
			configurable: true
		});
	}
	function throwForSearchParamsAccessInUseCache(workStore, constructorOpt) {
		const error = Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`searchParams\` inside "use cache". Accessing dynamic request data inside a cache scope is not supported. If you need some search params inside a cached function await \`searchParams\` outside of the cached function and pass only the required search params as arguments to the cached function. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
			value: "E842",
			enumerable: false,
			configurable: true
		});
		Error.captureStackTrace(error, constructorOpt);
		workStore.invalidDynamicUsageError ??= error;
		throw error;
	}
	function isRequestAPICallableInsideAfter() {
		const afterTaskStore = _aftertaskasyncstorageexternal.afterTaskAsyncStorage.getStore();
		return (afterTaskStore == null ? void 0 : afterTaskStore.rootTaskSpawnPhase) === "action";
	}
}));
//#endregion
//#region node_modules/next/dist/server/request/cookies.js
var require_cookies = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "cookies", {
		enumerable: true,
		get: function() {
			return cookies;
		}
	});
	var _requestcookies = require_request_cookies();
	var _cookies = require_cookies$1();
	var _workasyncstorageexternal = require_work_async_storage_external();
	var _workunitasyncstorageexternal = require_work_unit_async_storage_external();
	var _dynamicrendering = require_dynamic_rendering();
	var _staticgenerationbailout = require_static_generation_bailout();
	var _dynamicrenderingutils = require_dynamic_rendering_utils();
	var _creatededupedbycallsiteservererrorlogger = require_create_deduped_by_callsite_server_error_logger();
	var _utils = require_utils$1();
	var _invarianterror = require_invariant_error();
	require_staged_rendering();
	function cookies() {
		const callingExpression = "cookies";
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		if (workStore) {
			if (workUnitStore && workUnitStore.phase === "after" && !(0, _utils.isRequestAPICallableInsideAfter)()) throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`cookies()\` inside \`after()\`. This is not supported. If you need this data inside an \`after()\` callback, use \`cookies()\` outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", {
				value: "E843",
				enumerable: false,
				configurable: true
			});
			if (workStore.forceStatic) return makeUntrackedCookies(createEmptyCookies());
			if (workStore.dynamicShouldError) throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${workStore.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`cookies()\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", {
				value: "E849",
				enumerable: false,
				configurable: true
			});
			if (workUnitStore) switch (workUnitStore.type) {
				case "cache":
					const error = Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`cookies()\` inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`cookies()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
						value: "E831",
						enumerable: false,
						configurable: true
					});
					Error.captureStackTrace(error, cookies);
					workStore.invalidDynamicUsageError ??= error;
					throw error;
				case "unstable-cache": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`cookies()\` inside a function cached with \`unstable_cache()\`. Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`cookies()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", {
					value: "E846",
					enumerable: false,
					configurable: true
				});
				case "generate-static-params": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`cookies()\` inside \`generateStaticParams\`. This is not supported because \`generateStaticParams\` runs at build time without an HTTP request. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", {
					value: "E1123",
					enumerable: false,
					configurable: true
				});
				case "prerender": return makeHangingCookies(workStore, workUnitStore);
				case "prerender-client":
				case "validation-client":
					const exportName = "`cookies`";
					throw Object.defineProperty(new _invarianterror.InvariantError(`${exportName} must not be used within a Client Component. Next.js should be preventing ${exportName} from being included in Client Components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
						value: "E1037",
						enumerable: false,
						configurable: true
					});
				case "prerender-ppr": return (0, _dynamicrendering.postponeWithTracking)(workStore.route, callingExpression, workUnitStore.dynamicTracking);
				case "prerender-legacy": return (0, _dynamicrendering.throwToInterruptStaticGeneration)(callingExpression, workStore, workUnitStore);
				case "prerender-runtime": return (0, _dynamicrenderingutils.delayUntilRuntimeStage)(workUnitStore, makeUntrackedCookies(workUnitStore.cookies));
				case "private-cache": return makeUntrackedCookies(workUnitStore.cookies);
				case "request":
					(0, _dynamicrendering.trackDynamicDataInDynamicRender)(workUnitStore);
					let underlyingCookies;
					if ((0, _requestcookies.areCookiesMutableInCurrentPhase)(workUnitStore)) underlyingCookies = workUnitStore.userspaceMutableCookies;
					else underlyingCookies = workUnitStore.cookies;
					if (workUnitStore.asyncApiPromises) {
						const early = (0, _workunitasyncstorageexternal.isInEarlyRenderStage)(workUnitStore);
						if (underlyingCookies === workUnitStore.mutableCookies) return early ? workUnitStore.asyncApiPromises.earlyMutableCookies : workUnitStore.asyncApiPromises.mutableCookies;
						else return early ? workUnitStore.asyncApiPromises.earlyCookies : workUnitStore.asyncApiPromises.cookies;
					} else return makeUntrackedCookies(underlyingCookies);
				default:
			}
		}
		(0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
	}
	function createEmptyCookies() {
		return _requestcookies.RequestCookiesAdapter.seal(new _cookies.RequestCookies(new Headers({})));
	}
	var CachedCookies = /* @__PURE__ */ new WeakMap();
	function makeHangingCookies(workStore, prerenderStore) {
		const cachedPromise = CachedCookies.get(prerenderStore);
		if (cachedPromise) return cachedPromise;
		const promise = (0, _dynamicrenderingutils.makeHangingPromise)(prerenderStore.renderSignal, workStore.route, "`cookies()`");
		CachedCookies.set(prerenderStore, promise);
		return promise;
	}
	function makeUntrackedCookies(underlyingCookies) {
		const cachedCookies = CachedCookies.get(underlyingCookies);
		if (cachedCookies) return cachedCookies;
		const promise = Promise.resolve(underlyingCookies);
		CachedCookies.set(underlyingCookies, promise);
		return promise;
	}
	(0, _creatededupedbycallsiteservererrorlogger.createDedupedByCallsiteServerErrorLoggerDev)(createCookiesAccessError);
	function createCookiesAccessError(route, expression) {
		const prefix = route ? `Route "${route}" ` : "This route ";
		return Object.defineProperty(/* @__PURE__ */ new Error(`${prefix}used ${expression}. \`cookies()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", {
			value: "E830",
			enumerable: false,
			configurable: true
		});
	}
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/adapters/headers.js
var require_headers$2 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		HeadersAdapter: null,
		ReadonlyHeadersError: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		HeadersAdapter: function() {
			return HeadersAdapter;
		},
		ReadonlyHeadersError: function() {
			return ReadonlyHeadersError;
		}
	});
	var _reflect = require_reflect();
	var ReadonlyHeadersError = class ReadonlyHeadersError extends Error {
		constructor() {
			super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
		}
		static callable() {
			throw new ReadonlyHeadersError();
		}
	};
	var HeadersAdapter = class HeadersAdapter extends Headers {
		constructor(headers) {
			super();
			this.headers = new Proxy(headers, {
				get(target, prop, receiver) {
					if (typeof prop === "symbol") return _reflect.ReflectAdapter.get(target, prop, receiver);
					const lowercased = prop.toLowerCase();
					const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
					if (typeof original === "undefined") return;
					return _reflect.ReflectAdapter.get(target, original, receiver);
				},
				set(target, prop, value, receiver) {
					if (typeof prop === "symbol") return _reflect.ReflectAdapter.set(target, prop, value, receiver);
					const lowercased = prop.toLowerCase();
					const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
					return _reflect.ReflectAdapter.set(target, original ?? prop, value, receiver);
				},
				has(target, prop) {
					if (typeof prop === "symbol") return _reflect.ReflectAdapter.has(target, prop);
					const lowercased = prop.toLowerCase();
					const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
					if (typeof original === "undefined") return false;
					return _reflect.ReflectAdapter.has(target, original);
				},
				deleteProperty(target, prop) {
					if (typeof prop === "symbol") return _reflect.ReflectAdapter.deleteProperty(target, prop);
					const lowercased = prop.toLowerCase();
					const original = Object.keys(headers).find((o) => o.toLowerCase() === lowercased);
					if (typeof original === "undefined") return true;
					return _reflect.ReflectAdapter.deleteProperty(target, original);
				}
			});
		}
		/**
		* Seals a Headers instance to prevent modification by throwing an error when
		* any mutating method is called.
		*/ static seal(headers) {
			return new Proxy(headers, { get(target, prop, receiver) {
				switch (prop) {
					case "append":
					case "delete":
					case "set": return ReadonlyHeadersError.callable;
					default: return _reflect.ReflectAdapter.get(target, prop, receiver);
				}
			} });
		}
		/**
		* Merges a header value into a string. This stores multiple values as an
		* array, so we need to merge them into a string.
		*
		* @param value a header value
		* @returns a merged header value (a string)
		*/ merge(value) {
			if (Array.isArray(value)) return value.join(", ");
			return value;
		}
		/**
		* Creates a Headers instance from a plain object or a Headers instance.
		*
		* @param headers a plain object or a Headers instance
		* @returns a headers instance
		*/ static from(headers) {
			if (headers instanceof Headers) return headers;
			return new HeadersAdapter(headers);
		}
		append(name, value) {
			const existing = this.headers[name];
			if (typeof existing === "string") this.headers[name] = [existing, value];
			else if (Array.isArray(existing)) existing.push(value);
			else this.headers[name] = value;
		}
		delete(name) {
			delete this.headers[name];
		}
		get(name) {
			const value = this.headers[name];
			if (typeof value !== "undefined") return this.merge(value);
			return null;
		}
		has(name) {
			return typeof this.headers[name] !== "undefined";
		}
		set(name, value) {
			this.headers[name] = value;
		}
		forEach(callbackfn, thisArg) {
			for (const [name, value] of this.entries()) callbackfn.call(thisArg, value, name, this);
		}
		*entries() {
			for (const key of Object.keys(this.headers)) {
				const name = key.toLowerCase();
				yield [name, this.get(name)];
			}
		}
		*keys() {
			for (const key of Object.keys(this.headers)) yield key.toLowerCase();
		}
		*values() {
			for (const key of Object.keys(this.headers)) yield this.get(key);
		}
		[Symbol.iterator]() {
			return this.entries();
		}
	};
}));
//#endregion
//#region node_modules/next/dist/server/request/headers.js
var require_headers$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "headers", {
		enumerable: true,
		get: function() {
			return headers;
		}
	});
	var _headers = require_headers$2();
	var _workasyncstorageexternal = require_work_async_storage_external();
	var _workunitasyncstorageexternal = require_work_unit_async_storage_external();
	var _dynamicrendering = require_dynamic_rendering();
	var _staticgenerationbailout = require_static_generation_bailout();
	var _dynamicrenderingutils = require_dynamic_rendering_utils();
	var _creatededupedbycallsiteservererrorlogger = require_create_deduped_by_callsite_server_error_logger();
	var _utils = require_utils$1();
	var _invarianterror = require_invariant_error();
	require_staged_rendering();
	function headers() {
		const callingExpression = "headers";
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		if (workStore) {
			if (workUnitStore && workUnitStore.phase === "after" && !(0, _utils.isRequestAPICallableInsideAfter)()) throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`headers()\` inside \`after()\`. This is not supported. If you need this data inside an \`after()\` callback, use \`headers()\` outside of the callback. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", {
				value: "E839",
				enumerable: false,
				configurable: true
			});
			if (workStore.forceStatic) return makeUntrackedHeaders(_headers.HeadersAdapter.seal(new Headers({})));
			if (workUnitStore) switch (workUnitStore.type) {
				case "cache": {
					const error = Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`headers()\` inside "use cache". Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`headers()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
						value: "E833",
						enumerable: false,
						configurable: true
					});
					Error.captureStackTrace(error, headers);
					workStore.invalidDynamicUsageError ??= error;
					throw error;
				}
				case "unstable-cache": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`headers()\` inside a function cached with \`unstable_cache()\`. Accessing Dynamic data sources inside a cache scope is not supported. If you need this data inside a cached function use \`headers()\` outside of the cached function and pass the required dynamic data in as an argument. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", {
					value: "E838",
					enumerable: false,
					configurable: true
				});
				case "generate-static-params": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`headers()\` inside \`generateStaticParams\`. This is not supported because \`generateStaticParams\` runs at build time without an HTTP request. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", {
					value: "E1134",
					enumerable: false,
					configurable: true
				});
				case "prerender":
				case "prerender-client":
				case "validation-client":
				case "private-cache":
				case "prerender-runtime":
				case "prerender-ppr":
				case "prerender-legacy":
				case "request": break;
				default:
			}
			if (workStore.dynamicShouldError) throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${workStore.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`headers()\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", {
				value: "E828",
				enumerable: false,
				configurable: true
			});
			if (workUnitStore) switch (workUnitStore.type) {
				case "prerender": return makeHangingHeaders(workStore, workUnitStore);
				case "prerender-client":
				case "validation-client":
					const exportName = "`headers`";
					throw Object.defineProperty(new _invarianterror.InvariantError(`${exportName} must not be used within a client component. Next.js should be preventing ${exportName} from being included in client components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
						value: "E1017",
						enumerable: false,
						configurable: true
					});
				case "prerender-ppr": return (0, _dynamicrendering.postponeWithTracking)(workStore.route, callingExpression, workUnitStore.dynamicTracking);
				case "prerender-legacy": return (0, _dynamicrendering.throwToInterruptStaticGeneration)(callingExpression, workStore, workUnitStore);
				case "prerender-runtime": return (0, _dynamicrenderingutils.delayUntilRuntimeStage)(workUnitStore, makeUntrackedHeaders(workUnitStore.headers));
				case "private-cache": return makeUntrackedHeaders(workUnitStore.headers);
				case "request":
					(0, _dynamicrendering.trackDynamicDataInDynamicRender)(workUnitStore);
					if (workUnitStore.asyncApiPromises) return (0, _workunitasyncstorageexternal.isInEarlyRenderStage)(workUnitStore) ? workUnitStore.asyncApiPromises.earlyHeaders : workUnitStore.asyncApiPromises.headers;
					else return makeUntrackedHeaders(workUnitStore.headers);
					break;
				default:
			}
		}
		(0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
	}
	var CachedHeaders = /* @__PURE__ */ new WeakMap();
	function makeHangingHeaders(workStore, prerenderStore) {
		const cachedHeaders = CachedHeaders.get(prerenderStore);
		if (cachedHeaders) return cachedHeaders;
		const promise = (0, _dynamicrenderingutils.makeHangingPromise)(prerenderStore.renderSignal, workStore.route, "`headers()`");
		CachedHeaders.set(prerenderStore, promise);
		return promise;
	}
	function makeUntrackedHeaders(underlyingHeaders) {
		const cachedHeaders = CachedHeaders.get(underlyingHeaders);
		if (cachedHeaders) return cachedHeaders;
		const promise = Promise.resolve(underlyingHeaders);
		CachedHeaders.set(underlyingHeaders, promise);
		return promise;
	}
	(0, _creatededupedbycallsiteservererrorlogger.createDedupedByCallsiteServerErrorLoggerDev)(createHeadersAccessError);
	function createHeadersAccessError(route, expression) {
		const prefix = route ? `Route "${route}" ` : "This route ";
		return Object.defineProperty(/* @__PURE__ */ new Error(`${prefix}used ${expression}. \`headers()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", {
			value: "E836",
			enumerable: false,
			configurable: true
		});
	}
}));
//#endregion
//#region node_modules/next/dist/server/request/draft-mode.js
var require_draft_mode = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "draftMode", {
		enumerable: true,
		get: function() {
			return draftMode;
		}
	});
	var _workunitasyncstorageexternal = require_work_unit_async_storage_external();
	var _workasyncstorageexternal = require_work_async_storage_external();
	var _dynamicrendering = require_dynamic_rendering();
	var _creatededupedbycallsiteservererrorlogger = require_create_deduped_by_callsite_server_error_logger();
	var _staticgenerationbailout = require_static_generation_bailout();
	var _hooksservercontext = require_hooks_server_context();
	var _invarianterror = require_invariant_error();
	var _dynamicrenderingutils = require_dynamic_rendering_utils();
	require_reflect();
	function draftMode() {
		const callingExpression = "draftMode";
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		if (!workStore || !workUnitStore) (0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
		switch (workUnitStore.type) {
			case "prerender-runtime": return (0, _dynamicrenderingutils.delayUntilRuntimeStage)(workUnitStore, createOrGetCachedDraftMode(workUnitStore.draftMode, workStore));
			case "request": return createOrGetCachedDraftMode(workUnitStore.draftMode, workStore);
			case "cache":
			case "private-cache":
			case "unstable-cache":
				const draftModeProvider = (0, _workunitasyncstorageexternal.getDraftModeProviderForCacheScope)(workStore, workUnitStore);
				if (draftModeProvider) return createOrGetCachedDraftMode(draftModeProvider, workStore);
			case "prerender":
			case "prerender-ppr":
			case "prerender-legacy": return createOrGetCachedDraftMode(null, workStore);
			case "prerender-client":
			case "validation-client": {
				const exportName = "`draftMode`";
				throw Object.defineProperty(new _invarianterror.InvariantError(`${exportName} must not be used within a Client Component. Next.js should be preventing ${exportName} from being included in Client Components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
					value: "E1046",
					enumerable: false,
					configurable: true
				});
			}
			case "generate-static-params": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`${callingExpression}()\` inside \`generateStaticParams\`. This is not supported because \`generateStaticParams\` runs at build time without an HTTP request. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", {
				value: "E1132",
				enumerable: false,
				configurable: true
			});
			default: return workUnitStore;
		}
	}
	function createOrGetCachedDraftMode(draftModeProvider, workStore) {
		const cacheKey = draftModeProvider ?? NullDraftMode;
		const cachedDraftMode = CachedDraftModes.get(cacheKey);
		if (cachedDraftMode) return cachedDraftMode;
		return Promise.resolve(new DraftMode(draftModeProvider));
	}
	var NullDraftMode = {};
	var CachedDraftModes = /* @__PURE__ */ new WeakMap();
	var DraftMode = class {
		constructor(provider) {
			this._provider = provider;
		}
		get isEnabled() {
			if (this._provider !== null) return this._provider.isEnabled;
			return false;
		}
		enable() {
			trackDynamicDraftMode("draftMode().enable()", this.enable);
			if (this._provider !== null) this._provider.enable();
		}
		disable() {
			trackDynamicDraftMode("draftMode().disable()", this.disable);
			if (this._provider !== null) this._provider.disable();
		}
	};
	(0, _creatededupedbycallsiteservererrorlogger.createDedupedByCallsiteServerErrorLoggerDev)(createDraftModeAccessError);
	function createDraftModeAccessError(route, expression) {
		const prefix = route ? `Route "${route}" ` : "This route ";
		return Object.defineProperty(/* @__PURE__ */ new Error(`${prefix}used ${expression}. \`draftMode()\` returns a Promise and must be unwrapped with \`await\` or \`React.use()\` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`), "__NEXT_ERROR_CODE", {
			value: "E835",
			enumerable: false,
			configurable: true
		});
	}
	function trackDynamicDraftMode(expression, constructorOpt) {
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		if (workStore) {
			if ((workUnitStore == null ? void 0 : workUnitStore.phase) === "after") throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used "${expression}" inside \`after()\`. The enabled status of \`draftMode()\` can be read inside \`after()\` but you cannot enable or disable \`draftMode()\`. See more info here: https://nextjs.org/docs/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", {
				value: "E845",
				enumerable: false,
				configurable: true
			});
			if (workStore.dynamicShouldError) throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${workStore.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`${expression}\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", {
				value: "E553",
				enumerable: false,
				configurable: true
			});
			if (workUnitStore) switch (workUnitStore.type) {
				case "cache":
				case "private-cache": {
					const error = Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used "${expression}" inside "use cache". The enabled status of \`draftMode()\` can be read in caches but you must not enable or disable \`draftMode()\` inside a cache. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
						value: "E829",
						enumerable: false,
						configurable: true
					});
					Error.captureStackTrace(error, constructorOpt);
					workStore.invalidDynamicUsageError ??= error;
					throw error;
				}
				case "unstable-cache": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used "${expression}" inside a function cached with \`unstable_cache()\`. The enabled status of \`draftMode()\` can be read in caches but you must not enable or disable \`draftMode()\` inside a cache. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", {
					value: "E844",
					enumerable: false,
					configurable: true
				});
				case "prerender":
				case "prerender-runtime": {
					const error = Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used ${expression} without first calling \`await connection()\`. See more info here: https://nextjs.org/docs/messages/next-prerender-sync-headers`), "__NEXT_ERROR_CODE", {
						value: "E126",
						enumerable: false,
						configurable: true
					});
					return (0, _dynamicrendering.abortAndThrowOnSynchronousRequestDataAccess)(workStore.route, expression, error, workUnitStore);
				}
				case "prerender-client":
				case "validation-client":
					const exportName = "`draftMode`";
					throw Object.defineProperty(new _invarianterror.InvariantError(`${exportName} must not be used within a Client Component. Next.js should be preventing ${exportName} from being included in Client Components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
						value: "E1046",
						enumerable: false,
						configurable: true
					});
				case "prerender-ppr": return (0, _dynamicrendering.postponeWithTracking)(workStore.route, expression, workUnitStore.dynamicTracking);
				case "prerender-legacy":
					workUnitStore.revalidate = 0;
					const err = Object.defineProperty(new _hooksservercontext.DynamicServerError(`Route ${workStore.route} couldn't be rendered statically because it used \`${expression}\`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error`), "__NEXT_ERROR_CODE", {
						value: "E558",
						enumerable: false,
						configurable: true
					});
					workStore.dynamicUsageDescription = expression;
					workStore.dynamicUsageStack = err.stack;
					throw err;
				case "request":
					(0, _dynamicrendering.trackDynamicDataInDynamicRender)(workUnitStore);
					break;
				case "generate-static-params": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`${expression}\` inside \`generateStaticParams\`. This is not supported because \`generateStaticParams\` runs at build time without an HTTP request. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", {
					value: "E1121",
					enumerable: false,
					configurable: true
				});
				default:
			}
		}
	}
}));
//#endregion
//#region node_modules/next/headers.js
var require_headers = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports.cookies = require_cookies().cookies;
	module.exports.headers = require_headers$1().headers;
	module.exports.draftMode = require_draft_mode().draftMode;
}));
//#endregion
//#region node_modules/next/dist/shared/lib/i18n/detect-domain-locale.js
var require_detect_domain_locale = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "detectDomainLocale", {
		enumerable: true,
		get: function() {
			return detectDomainLocale;
		}
	});
	function detectDomainLocale(domainItems, hostname, detectedLocale) {
		if (!domainItems) return;
		if (detectedLocale) detectedLocale = detectedLocale.toLowerCase();
		for (const item of domainItems) if (hostname === item.domain?.split(":", 1)[0].toLowerCase() || detectedLocale === item.defaultLocale.toLowerCase() || item.locales?.some((locale) => locale.toLowerCase() === detectedLocale)) return item;
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/remove-trailing-slash.js
/**
* Removes the trailing slash for a given route or page path. Preserves the
* root page. Examples:
*   - `/foo/bar/` -> `/foo/bar`
*   - `/foo/bar` -> `/foo/bar`
*   - `/` -> `/`
*/ var require_remove_trailing_slash = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "removeTrailingSlash", {
		enumerable: true,
		get: function() {
			return removeTrailingSlash;
		}
	});
	function removeTrailingSlash(route) {
		return route.replace(/\/$/, "") || "/";
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/parse-path.js
/**
* Given a path this function will find the pathname, query and hash and return
* them. This is useful to parse full paths on the client side.
* @param path A path to parse e.g. /foo/bar?id=1#hash
*/ var require_parse_path = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "parsePath", {
		enumerable: true,
		get: function() {
			return parsePath;
		}
	});
	function parsePath(path) {
		const hashIndex = path.indexOf("#");
		const queryIndex = path.indexOf("?");
		const hasQuery = queryIndex > -1 && (hashIndex < 0 || queryIndex < hashIndex);
		if (hasQuery || hashIndex > -1) return {
			pathname: path.substring(0, hasQuery ? queryIndex : hashIndex),
			query: hasQuery ? path.substring(queryIndex, hashIndex > -1 ? hashIndex : void 0) : "",
			hash: hashIndex > -1 ? path.slice(hashIndex) : ""
		};
		return {
			pathname: path,
			query: "",
			hash: ""
		};
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/add-path-prefix.js
var require_add_path_prefix = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "addPathPrefix", {
		enumerable: true,
		get: function() {
			return addPathPrefix;
		}
	});
	var _parsepath = require_parse_path();
	function addPathPrefix(path, prefix) {
		if (!path.startsWith("/") || !prefix) return path;
		const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
		return `${prefix}${pathname}${query}${hash}`;
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/add-path-suffix.js
var require_add_path_suffix = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "addPathSuffix", {
		enumerable: true,
		get: function() {
			return addPathSuffix;
		}
	});
	var _parsepath = require_parse_path();
	function addPathSuffix(path, suffix) {
		if (!path.startsWith("/") || !suffix) return path;
		const { pathname, query, hash } = (0, _parsepath.parsePath)(path);
		return `${pathname}${suffix}${query}${hash}`;
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/path-has-prefix.js
var require_path_has_prefix = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "pathHasPrefix", {
		enumerable: true,
		get: function() {
			return pathHasPrefix;
		}
	});
	var _parsepath = require_parse_path();
	function pathHasPrefix(path, prefix) {
		if (typeof path !== "string") return false;
		const { pathname } = (0, _parsepath.parsePath)(path);
		return pathname === prefix || pathname.startsWith(prefix + "/");
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/add-locale.js
var require_add_locale = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "addLocale", {
		enumerable: true,
		get: function() {
			return addLocale;
		}
	});
	var _addpathprefix = require_add_path_prefix();
	var _pathhasprefix = require_path_has_prefix();
	function addLocale(path, locale, defaultLocale, ignorePrefix) {
		if (!locale || locale === defaultLocale) return path;
		const lower = path.toLowerCase();
		if (!ignorePrefix) {
			if ((0, _pathhasprefix.pathHasPrefix)(lower, "/api")) return path;
			if ((0, _pathhasprefix.pathHasPrefix)(lower, `/${locale.toLowerCase()}`)) return path;
		}
		return (0, _addpathprefix.addPathPrefix)(path, `/${locale}`);
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/format-next-pathname-info.js
var require_format_next_pathname_info = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "formatNextPathnameInfo", {
		enumerable: true,
		get: function() {
			return formatNextPathnameInfo;
		}
	});
	var _removetrailingslash = require_remove_trailing_slash();
	var _addpathprefix = require_add_path_prefix();
	var _addpathsuffix = require_add_path_suffix();
	var _addlocale = require_add_locale();
	function formatNextPathnameInfo(info) {
		let pathname = (0, _addlocale.addLocale)(info.pathname, info.locale, info.buildId ? void 0 : info.defaultLocale, info.ignorePrefix);
		if (info.buildId || !info.trailingSlash) pathname = (0, _removetrailingslash.removeTrailingSlash)(pathname);
		if (info.buildId) pathname = (0, _addpathsuffix.addPathSuffix)((0, _addpathprefix.addPathPrefix)(pathname, `/_next/data/${info.buildId}`), info.pathname === "/" ? "index.json" : ".json");
		pathname = (0, _addpathprefix.addPathPrefix)(pathname, info.basePath);
		return !info.buildId && info.trailingSlash ? !pathname.endsWith("/") ? (0, _addpathsuffix.addPathSuffix)(pathname, "/") : pathname : (0, _removetrailingslash.removeTrailingSlash)(pathname);
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/get-hostname.js
var require_get_hostname = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "getHostname", {
		enumerable: true,
		get: function() {
			return getHostname;
		}
	});
	function getHostname(parsed, headers) {
		let hostname;
		if (headers?.host && !Array.isArray(headers.host)) hostname = headers.host.toString().split(":", 1)[0];
		else if (parsed.hostname) hostname = parsed.hostname;
		else return;
		return hostname.toLowerCase();
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/i18n/normalize-locale-path.js
var require_normalize_locale_path = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "normalizeLocalePath", {
		enumerable: true,
		get: function() {
			return normalizeLocalePath;
		}
	});
	/**
	* A cache of lowercased locales for each list of locales. This is stored as a
	* WeakMap so if the locales are garbage collected, the cache entry will be
	* removed as well.
	*/ var cache = /* @__PURE__ */ new WeakMap();
	function normalizeLocalePath(pathname, locales) {
		if (!locales) return { pathname };
		let lowercasedLocales = cache.get(locales);
		if (!lowercasedLocales) {
			lowercasedLocales = locales.map((locale) => locale.toLowerCase());
			cache.set(locales, lowercasedLocales);
		}
		let detectedLocale;
		const segments = pathname.split("/", 2);
		if (!segments[1]) return { pathname };
		const segment = segments[1].toLowerCase();
		const index = lowercasedLocales.indexOf(segment);
		if (index < 0) return { pathname };
		detectedLocale = locales[index];
		pathname = pathname.slice(detectedLocale.length + 1) || "/";
		return {
			pathname,
			detectedLocale
		};
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/remove-path-prefix.js
var require_remove_path_prefix = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "removePathPrefix", {
		enumerable: true,
		get: function() {
			return removePathPrefix;
		}
	});
	var _pathhasprefix = require_path_has_prefix();
	function removePathPrefix(path, prefix) {
		if (!(0, _pathhasprefix.pathHasPrefix)(path, prefix)) return path;
		const withoutPrefix = path.slice(prefix.length);
		if (withoutPrefix.startsWith("/")) return withoutPrefix;
		return `/${withoutPrefix}`;
	}
}));
//#endregion
//#region node_modules/next/dist/shared/lib/router/utils/get-next-pathname-info.js
var require_get_next_pathname_info = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "getNextPathnameInfo", {
		enumerable: true,
		get: function() {
			return getNextPathnameInfo;
		}
	});
	var _normalizelocalepath = require_normalize_locale_path();
	var _removepathprefix = require_remove_path_prefix();
	var _pathhasprefix = require_path_has_prefix();
	function getNextPathnameInfo(pathname, options) {
		const { basePath, i18n, trailingSlash } = options.nextConfig ?? {};
		const info = {
			pathname,
			trailingSlash: pathname !== "/" ? pathname.endsWith("/") : trailingSlash
		};
		if (basePath && (0, _pathhasprefix.pathHasPrefix)(info.pathname, basePath)) {
			info.pathname = (0, _removepathprefix.removePathPrefix)(info.pathname, basePath);
			info.basePath = basePath;
		}
		let pathnameNoDataPrefix = info.pathname;
		if (info.pathname.startsWith("/_next/data/") && info.pathname.endsWith(".json")) {
			const paths = info.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
			info.buildId = paths[0];
			pathnameNoDataPrefix = paths[1] !== "index" ? `/${paths.slice(1).join("/")}` : "/";
			if (options.parseData === true) info.pathname = pathnameNoDataPrefix;
		}
		if (i18n) {
			let result = options.i18nProvider ? options.i18nProvider.analyze(info.pathname) : (0, _normalizelocalepath.normalizeLocalePath)(info.pathname, i18n.locales);
			info.locale = result.detectedLocale;
			info.pathname = result.pathname ?? info.pathname;
			if (!result.detectedLocale && info.buildId) {
				result = options.i18nProvider ? options.i18nProvider.analyze(pathnameNoDataPrefix) : (0, _normalizelocalepath.normalizeLocalePath)(pathnameNoDataPrefix, i18n.locales);
				if (result.detectedLocale) info.locale = result.detectedLocale;
			}
		}
		return info;
	}
}));
//#endregion
//#region node_modules/next/dist/server/web/next-url.js
var require_next_url = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "NextURL", {
		enumerable: true,
		get: function() {
			return NextURL;
		}
	});
	var _detectdomainlocale = require_detect_domain_locale();
	var _formatnextpathnameinfo = require_format_next_pathname_info();
	var _gethostname = require_get_hostname();
	var _getnextpathnameinfo = require_get_next_pathname_info();
	var REGEX_LOCALHOST_HOSTNAME = /^(?:127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)$/;
	function parseURL(url, base) {
		const parsed = new URL(String(url), base && String(base));
		if (REGEX_LOCALHOST_HOSTNAME.test(parsed.hostname)) parsed.hostname = "localhost";
		return parsed;
	}
	var Internal = Symbol("NextURLInternal");
	var NextURL = class NextURL {
		constructor(input, baseOrOpts, opts) {
			let base;
			let options;
			if (typeof baseOrOpts === "object" && "pathname" in baseOrOpts || typeof baseOrOpts === "string") {
				base = baseOrOpts;
				options = opts || {};
			} else options = opts || baseOrOpts || {};
			this[Internal] = {
				url: parseURL(input, base ?? options.base),
				options,
				basePath: ""
			};
			this.analyze();
		}
		analyze() {
			var _this_Internal_options_nextConfig_i18n, _this_Internal_options_nextConfig, _this_Internal_domainLocale, _this_Internal_options_nextConfig_i18n1, _this_Internal_options_nextConfig1;
			const info = (0, _getnextpathnameinfo.getNextPathnameInfo)(this[Internal].url.pathname, {
				nextConfig: this[Internal].options.nextConfig,
				parseData: !process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE,
				i18nProvider: this[Internal].options.i18nProvider
			});
			const hostname = (0, _gethostname.getHostname)(this[Internal].url, this[Internal].options.headers);
			this[Internal].domainLocale = this[Internal].options.i18nProvider ? this[Internal].options.i18nProvider.detectDomainLocale(hostname) : (0, _detectdomainlocale.detectDomainLocale)((_this_Internal_options_nextConfig = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n = _this_Internal_options_nextConfig.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n.domains, hostname);
			const defaultLocale = ((_this_Internal_domainLocale = this[Internal].domainLocale) == null ? void 0 : _this_Internal_domainLocale.defaultLocale) || ((_this_Internal_options_nextConfig1 = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n1 = _this_Internal_options_nextConfig1.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n1.defaultLocale);
			this[Internal].url.pathname = info.pathname;
			this[Internal].defaultLocale = defaultLocale;
			this[Internal].basePath = info.basePath ?? "";
			this[Internal].buildId = info.buildId;
			this[Internal].locale = info.locale ?? defaultLocale;
			this[Internal].trailingSlash = info.trailingSlash;
		}
		formatPathname() {
			return (0, _formatnextpathnameinfo.formatNextPathnameInfo)({
				basePath: this[Internal].basePath,
				buildId: this[Internal].buildId,
				defaultLocale: !this[Internal].options.forceLocale ? this[Internal].defaultLocale : void 0,
				locale: this[Internal].locale,
				pathname: this[Internal].url.pathname,
				trailingSlash: this[Internal].trailingSlash
			});
		}
		formatSearch() {
			return this[Internal].url.search;
		}
		get buildId() {
			return this[Internal].buildId;
		}
		set buildId(buildId) {
			this[Internal].buildId = buildId;
		}
		get locale() {
			return this[Internal].locale ?? "";
		}
		set locale(locale) {
			var _this_Internal_options_nextConfig_i18n, _this_Internal_options_nextConfig;
			if (!this[Internal].locale || !((_this_Internal_options_nextConfig = this[Internal].options.nextConfig) == null ? void 0 : (_this_Internal_options_nextConfig_i18n = _this_Internal_options_nextConfig.i18n) == null ? void 0 : _this_Internal_options_nextConfig_i18n.locales.includes(locale))) throw Object.defineProperty(/* @__PURE__ */ new TypeError(`The NextURL configuration includes no locale "${locale}"`), "__NEXT_ERROR_CODE", {
				value: "E597",
				enumerable: false,
				configurable: true
			});
			this[Internal].locale = locale;
		}
		get defaultLocale() {
			return this[Internal].defaultLocale;
		}
		get domainLocale() {
			return this[Internal].domainLocale;
		}
		get searchParams() {
			return this[Internal].url.searchParams;
		}
		get host() {
			return this[Internal].url.host;
		}
		set host(value) {
			this[Internal].url.host = value;
		}
		get hostname() {
			return this[Internal].url.hostname;
		}
		set hostname(value) {
			this[Internal].url.hostname = value;
		}
		get port() {
			return this[Internal].url.port;
		}
		set port(value) {
			this[Internal].url.port = value;
		}
		get protocol() {
			return this[Internal].url.protocol;
		}
		set protocol(value) {
			this[Internal].url.protocol = value;
		}
		get href() {
			const pathname = this.formatPathname();
			const search = this.formatSearch();
			return `${this.protocol}//${this.host}${pathname}${search}${this.hash}`;
		}
		set href(url) {
			this[Internal].url = parseURL(url);
			this.analyze();
		}
		get origin() {
			return this[Internal].url.origin;
		}
		get pathname() {
			return this[Internal].url.pathname;
		}
		set pathname(value) {
			this[Internal].url.pathname = value;
		}
		get hash() {
			return this[Internal].url.hash;
		}
		set hash(value) {
			this[Internal].url.hash = value;
		}
		get search() {
			return this[Internal].url.search;
		}
		set search(value) {
			this[Internal].url.search = value;
		}
		get password() {
			return this[Internal].url.password;
		}
		set password(value) {
			this[Internal].url.password = value;
		}
		get username() {
			return this[Internal].url.username;
		}
		set username(value) {
			this[Internal].url.username = value;
		}
		get basePath() {
			return this[Internal].basePath;
		}
		set basePath(value) {
			this[Internal].basePath = value.startsWith("/") ? value : `/${value}`;
		}
		toString() {
			return this.href;
		}
		toJSON() {
			return this.href;
		}
		[Symbol.for("edge-runtime.inspect.custom")]() {
			return {
				href: this.href,
				origin: this.origin,
				protocol: this.protocol,
				username: this.username,
				password: this.password,
				host: this.host,
				hostname: this.hostname,
				port: this.port,
				pathname: this.pathname,
				search: this.search,
				searchParams: this.searchParams,
				hash: this.hash
			};
		}
		clone() {
			return new NextURL(String(this), this[Internal].options);
		}
	};
}));
//#endregion
//#region node_modules/next/dist/lib/constants.js
var require_constants = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		ACTION_SUFFIX: null,
		APP_DIR_ALIAS: null,
		CACHE_ONE_YEAR_SECONDS: null,
		DOT_NEXT_ALIAS: null,
		ESLINT_DEFAULT_DIRS: null,
		GSP_NO_RETURNED_VALUE: null,
		GSSP_COMPONENT_MEMBER_ERROR: null,
		GSSP_NO_RETURNED_VALUE: null,
		HTML_CONTENT_TYPE_HEADER: null,
		INFINITE_CACHE: null,
		INSTRUMENTATION_HOOK_FILENAME: null,
		JSON_CONTENT_TYPE_HEADER: null,
		MATCHED_PATH_HEADER: null,
		MIDDLEWARE_FILENAME: null,
		MIDDLEWARE_LOCATION_REGEXP: null,
		NEXT_BODY_SUFFIX: null,
		NEXT_CACHE_IMPLICIT_TAG_ID: null,
		NEXT_CACHE_REVALIDATED_TAGS_HEADER: null,
		NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER: null,
		NEXT_CACHE_ROOT_PARAM_TAG_ID: null,
		NEXT_CACHE_SOFT_TAG_MAX_LENGTH: null,
		NEXT_CACHE_TAGS_HEADER: null,
		NEXT_CACHE_TAG_MAX_ITEMS: null,
		NEXT_CACHE_TAG_MAX_LENGTH: null,
		NEXT_DATA_SUFFIX: null,
		NEXT_INTERCEPTION_MARKER_PREFIX: null,
		NEXT_META_SUFFIX: null,
		NEXT_NAV_DEPLOYMENT_ID_HEADER: null,
		NEXT_QUERY_PARAM_PREFIX: null,
		NEXT_RESUME_HEADER: null,
		NEXT_RESUME_STATE_LENGTH_HEADER: null,
		NON_STANDARD_NODE_ENV: null,
		PAGES_DIR_ALIAS: null,
		PRERENDER_REVALIDATE_HEADER: null,
		PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER: null,
		PROXY_FILENAME: null,
		PROXY_LOCATION_REGEXP: null,
		PUBLIC_DIR_MIDDLEWARE_CONFLICT: null,
		ROOT_DIR_ALIAS: null,
		RSC_ACTION_CLIENT_WRAPPER_ALIAS: null,
		RSC_ACTION_ENCRYPTION_ALIAS: null,
		RSC_ACTION_PROXY_ALIAS: null,
		RSC_ACTION_VALIDATE_ALIAS: null,
		RSC_CACHE_WRAPPER_ALIAS: null,
		RSC_DYNAMIC_IMPORT_WRAPPER_ALIAS: null,
		RSC_MOD_REF_PROXY_ALIAS: null,
		RSC_SEGMENTS_DIR_SUFFIX: null,
		RSC_SEGMENT_SUFFIX: null,
		RSC_SUFFIX: null,
		SERVER_PROPS_EXPORT_ERROR: null,
		SERVER_PROPS_GET_INIT_PROPS_CONFLICT: null,
		SERVER_PROPS_SSG_CONFLICT: null,
		SERVER_RUNTIME: null,
		SSG_FALLBACK_EXPORT_ERROR: null,
		SSG_GET_INITIAL_PROPS_CONFLICT: null,
		STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR: null,
		TEXT_PLAIN_CONTENT_TYPE_HEADER: null,
		UNSTABLE_REVALIDATE_RENAME_ERROR: null,
		WEBPACK_LAYERS: null,
		WEBPACK_RESOURCE_QUERIES: null,
		WEB_SOCKET_MAX_RECONNECTIONS: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		ACTION_SUFFIX: function() {
			return ACTION_SUFFIX;
		},
		APP_DIR_ALIAS: function() {
			return APP_DIR_ALIAS;
		},
		CACHE_ONE_YEAR_SECONDS: function() {
			return CACHE_ONE_YEAR_SECONDS;
		},
		DOT_NEXT_ALIAS: function() {
			return DOT_NEXT_ALIAS;
		},
		ESLINT_DEFAULT_DIRS: function() {
			return ESLINT_DEFAULT_DIRS;
		},
		GSP_NO_RETURNED_VALUE: function() {
			return GSP_NO_RETURNED_VALUE;
		},
		GSSP_COMPONENT_MEMBER_ERROR: function() {
			return GSSP_COMPONENT_MEMBER_ERROR;
		},
		GSSP_NO_RETURNED_VALUE: function() {
			return GSSP_NO_RETURNED_VALUE;
		},
		HTML_CONTENT_TYPE_HEADER: function() {
			return HTML_CONTENT_TYPE_HEADER;
		},
		INFINITE_CACHE: function() {
			return INFINITE_CACHE;
		},
		INSTRUMENTATION_HOOK_FILENAME: function() {
			return INSTRUMENTATION_HOOK_FILENAME;
		},
		JSON_CONTENT_TYPE_HEADER: function() {
			return JSON_CONTENT_TYPE_HEADER;
		},
		MATCHED_PATH_HEADER: function() {
			return MATCHED_PATH_HEADER;
		},
		MIDDLEWARE_FILENAME: function() {
			return MIDDLEWARE_FILENAME;
		},
		MIDDLEWARE_LOCATION_REGEXP: function() {
			return MIDDLEWARE_LOCATION_REGEXP;
		},
		NEXT_BODY_SUFFIX: function() {
			return NEXT_BODY_SUFFIX;
		},
		NEXT_CACHE_IMPLICIT_TAG_ID: function() {
			return NEXT_CACHE_IMPLICIT_TAG_ID;
		},
		NEXT_CACHE_REVALIDATED_TAGS_HEADER: function() {
			return NEXT_CACHE_REVALIDATED_TAGS_HEADER;
		},
		NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER: function() {
			return NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER;
		},
		NEXT_CACHE_ROOT_PARAM_TAG_ID: function() {
			return NEXT_CACHE_ROOT_PARAM_TAG_ID;
		},
		NEXT_CACHE_SOFT_TAG_MAX_LENGTH: function() {
			return NEXT_CACHE_SOFT_TAG_MAX_LENGTH;
		},
		NEXT_CACHE_TAGS_HEADER: function() {
			return NEXT_CACHE_TAGS_HEADER;
		},
		NEXT_CACHE_TAG_MAX_ITEMS: function() {
			return NEXT_CACHE_TAG_MAX_ITEMS;
		},
		NEXT_CACHE_TAG_MAX_LENGTH: function() {
			return NEXT_CACHE_TAG_MAX_LENGTH;
		},
		NEXT_DATA_SUFFIX: function() {
			return NEXT_DATA_SUFFIX;
		},
		NEXT_INTERCEPTION_MARKER_PREFIX: function() {
			return NEXT_INTERCEPTION_MARKER_PREFIX;
		},
		NEXT_META_SUFFIX: function() {
			return NEXT_META_SUFFIX;
		},
		NEXT_NAV_DEPLOYMENT_ID_HEADER: function() {
			return NEXT_NAV_DEPLOYMENT_ID_HEADER;
		},
		NEXT_QUERY_PARAM_PREFIX: function() {
			return NEXT_QUERY_PARAM_PREFIX;
		},
		NEXT_RESUME_HEADER: function() {
			return NEXT_RESUME_HEADER;
		},
		NEXT_RESUME_STATE_LENGTH_HEADER: function() {
			return NEXT_RESUME_STATE_LENGTH_HEADER;
		},
		NON_STANDARD_NODE_ENV: function() {
			return NON_STANDARD_NODE_ENV;
		},
		PAGES_DIR_ALIAS: function() {
			return PAGES_DIR_ALIAS;
		},
		PRERENDER_REVALIDATE_HEADER: function() {
			return PRERENDER_REVALIDATE_HEADER;
		},
		PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER: function() {
			return PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER;
		},
		PROXY_FILENAME: function() {
			return PROXY_FILENAME;
		},
		PROXY_LOCATION_REGEXP: function() {
			return PROXY_LOCATION_REGEXP;
		},
		PUBLIC_DIR_MIDDLEWARE_CONFLICT: function() {
			return PUBLIC_DIR_MIDDLEWARE_CONFLICT;
		},
		ROOT_DIR_ALIAS: function() {
			return ROOT_DIR_ALIAS;
		},
		RSC_ACTION_CLIENT_WRAPPER_ALIAS: function() {
			return RSC_ACTION_CLIENT_WRAPPER_ALIAS;
		},
		RSC_ACTION_ENCRYPTION_ALIAS: function() {
			return RSC_ACTION_ENCRYPTION_ALIAS;
		},
		RSC_ACTION_PROXY_ALIAS: function() {
			return RSC_ACTION_PROXY_ALIAS;
		},
		RSC_ACTION_VALIDATE_ALIAS: function() {
			return RSC_ACTION_VALIDATE_ALIAS;
		},
		RSC_CACHE_WRAPPER_ALIAS: function() {
			return RSC_CACHE_WRAPPER_ALIAS;
		},
		RSC_DYNAMIC_IMPORT_WRAPPER_ALIAS: function() {
			return RSC_DYNAMIC_IMPORT_WRAPPER_ALIAS;
		},
		RSC_MOD_REF_PROXY_ALIAS: function() {
			return RSC_MOD_REF_PROXY_ALIAS;
		},
		RSC_SEGMENTS_DIR_SUFFIX: function() {
			return RSC_SEGMENTS_DIR_SUFFIX;
		},
		RSC_SEGMENT_SUFFIX: function() {
			return RSC_SEGMENT_SUFFIX;
		},
		RSC_SUFFIX: function() {
			return RSC_SUFFIX;
		},
		SERVER_PROPS_EXPORT_ERROR: function() {
			return SERVER_PROPS_EXPORT_ERROR;
		},
		SERVER_PROPS_GET_INIT_PROPS_CONFLICT: function() {
			return SERVER_PROPS_GET_INIT_PROPS_CONFLICT;
		},
		SERVER_PROPS_SSG_CONFLICT: function() {
			return SERVER_PROPS_SSG_CONFLICT;
		},
		SERVER_RUNTIME: function() {
			return SERVER_RUNTIME;
		},
		SSG_FALLBACK_EXPORT_ERROR: function() {
			return SSG_FALLBACK_EXPORT_ERROR;
		},
		SSG_GET_INITIAL_PROPS_CONFLICT: function() {
			return SSG_GET_INITIAL_PROPS_CONFLICT;
		},
		STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR: function() {
			return STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR;
		},
		TEXT_PLAIN_CONTENT_TYPE_HEADER: function() {
			return TEXT_PLAIN_CONTENT_TYPE_HEADER;
		},
		UNSTABLE_REVALIDATE_RENAME_ERROR: function() {
			return UNSTABLE_REVALIDATE_RENAME_ERROR;
		},
		WEBPACK_LAYERS: function() {
			return WEBPACK_LAYERS;
		},
		WEBPACK_RESOURCE_QUERIES: function() {
			return WEBPACK_RESOURCE_QUERIES;
		},
		WEB_SOCKET_MAX_RECONNECTIONS: function() {
			return WEB_SOCKET_MAX_RECONNECTIONS;
		}
	});
	var TEXT_PLAIN_CONTENT_TYPE_HEADER = "text/plain";
	var HTML_CONTENT_TYPE_HEADER = "text/html; charset=utf-8";
	var JSON_CONTENT_TYPE_HEADER = "application/json; charset=utf-8";
	var NEXT_QUERY_PARAM_PREFIX = "nxtP";
	var NEXT_INTERCEPTION_MARKER_PREFIX = "nxtI";
	var MATCHED_PATH_HEADER = "x-matched-path";
	var PRERENDER_REVALIDATE_HEADER = "x-prerender-revalidate";
	var PRERENDER_REVALIDATE_ONLY_GENERATED_HEADER = "x-prerender-revalidate-if-generated";
	var RSC_SEGMENTS_DIR_SUFFIX = ".segments";
	var RSC_SEGMENT_SUFFIX = ".segment.rsc";
	var RSC_SUFFIX = ".rsc";
	var ACTION_SUFFIX = ".action";
	var NEXT_DATA_SUFFIX = ".json";
	var NEXT_META_SUFFIX = ".meta";
	var NEXT_BODY_SUFFIX = ".body";
	var NEXT_NAV_DEPLOYMENT_ID_HEADER = "x-nextjs-deployment-id";
	var NEXT_CACHE_TAGS_HEADER = "x-next-cache-tags";
	var NEXT_CACHE_REVALIDATED_TAGS_HEADER = "x-next-revalidated-tags";
	var NEXT_CACHE_REVALIDATE_TAG_TOKEN_HEADER = "x-next-revalidate-tag-token";
	var NEXT_RESUME_HEADER = "next-resume";
	var NEXT_RESUME_STATE_LENGTH_HEADER = "x-next-resume-state-length";
	var NEXT_CACHE_TAG_MAX_ITEMS = 128;
	var NEXT_CACHE_TAG_MAX_LENGTH = 256;
	var NEXT_CACHE_SOFT_TAG_MAX_LENGTH = 1024;
	var NEXT_CACHE_IMPLICIT_TAG_ID = "_N_T_";
	var NEXT_CACHE_ROOT_PARAM_TAG_ID = "_N_RP_";
	var CACHE_ONE_YEAR_SECONDS = 31536e3;
	var INFINITE_CACHE = 4294967294;
	var MIDDLEWARE_FILENAME = "middleware";
	var MIDDLEWARE_LOCATION_REGEXP = `(?:src/)?${MIDDLEWARE_FILENAME}`;
	var PROXY_FILENAME = "proxy";
	var PROXY_LOCATION_REGEXP = `(?:src/)?${PROXY_FILENAME}`;
	var INSTRUMENTATION_HOOK_FILENAME = "instrumentation";
	var PAGES_DIR_ALIAS = "private-next-pages";
	var DOT_NEXT_ALIAS = "private-dot-next";
	var ROOT_DIR_ALIAS = "private-next-root-dir";
	var APP_DIR_ALIAS = "private-next-app-dir";
	var RSC_MOD_REF_PROXY_ALIAS = "private-next-rsc-mod-ref-proxy";
	var RSC_ACTION_VALIDATE_ALIAS = "private-next-rsc-action-validate";
	var RSC_ACTION_PROXY_ALIAS = "private-next-rsc-server-reference";
	var RSC_CACHE_WRAPPER_ALIAS = "private-next-rsc-cache-wrapper";
	var RSC_DYNAMIC_IMPORT_WRAPPER_ALIAS = "private-next-rsc-track-dynamic-import";
	var RSC_ACTION_ENCRYPTION_ALIAS = "private-next-rsc-action-encryption";
	var RSC_ACTION_CLIENT_WRAPPER_ALIAS = "private-next-rsc-action-client-wrapper";
	var PUBLIC_DIR_MIDDLEWARE_CONFLICT = `You can not have a '_next' folder inside of your public folder. This conflicts with the internal '/_next' route. https://nextjs.org/docs/messages/public-next-folder-conflict`;
	var SSG_GET_INITIAL_PROPS_CONFLICT = `You can not use getInitialProps with getStaticProps. To use SSG, please remove your getInitialProps`;
	var SERVER_PROPS_GET_INIT_PROPS_CONFLICT = `You can not use getInitialProps with getServerSideProps. Please remove getInitialProps.`;
	var SERVER_PROPS_SSG_CONFLICT = `You can not use getStaticProps or getStaticPaths with getServerSideProps. To use SSG, please remove getServerSideProps`;
	var STATIC_STATUS_PAGE_GET_INITIAL_PROPS_ERROR = `can not have getInitialProps/getServerSideProps, https://nextjs.org/docs/messages/404-get-initial-props`;
	var SERVER_PROPS_EXPORT_ERROR = `pages with \`getServerSideProps\` can not be exported. See more info here: https://nextjs.org/docs/messages/gssp-export`;
	var GSP_NO_RETURNED_VALUE = "Your `getStaticProps` function did not return an object. Did you forget to add a `return`?";
	var GSSP_NO_RETURNED_VALUE = "Your `getServerSideProps` function did not return an object. Did you forget to add a `return`?";
	var UNSTABLE_REVALIDATE_RENAME_ERROR = "The `unstable_revalidate` property is available for general use.\nPlease use `revalidate` instead.";
	var GSSP_COMPONENT_MEMBER_ERROR = `can not be attached to a page's component and must be exported from the page. See more info here: https://nextjs.org/docs/messages/gssp-component-member`;
	var NON_STANDARD_NODE_ENV = `You are using a non-standard "NODE_ENV" value in your environment. This creates inconsistencies in the project and is strongly advised against. Read more: https://nextjs.org/docs/messages/non-standard-node-env`;
	var SSG_FALLBACK_EXPORT_ERROR = `Pages with \`fallback\` enabled in \`getStaticPaths\` can not be exported. See more info here: https://nextjs.org/docs/messages/ssg-fallback-true-export`;
	var ESLINT_DEFAULT_DIRS = [
		"app",
		"pages",
		"components",
		"lib",
		"src"
	];
	var SERVER_RUNTIME = {
		edge: "edge",
		experimentalEdge: "experimental-edge",
		nodejs: "nodejs"
	};
	var WEB_SOCKET_MAX_RECONNECTIONS = 12;
	/**
	* The names of the webpack layers. These layers are the primitives for the
	* webpack chunks.
	*/ var WEBPACK_LAYERS_NAMES = {
		/**
		* The layer for the shared code between the client and server bundles.
		*/ shared: "shared",
		/**
		* The layer for server-only runtime and picking up `react-server` export conditions.
		* Including app router RSC pages and app router custom routes and metadata routes.
		*/ reactServerComponents: "rsc",
		/**
		* Server Side Rendering layer for app (ssr).
		*/ serverSideRendering: "ssr",
		/**
		* The browser client bundle layer for actions.
		*/ actionBrowser: "action-browser",
		/**
		* The Node.js bundle layer for the API routes.
		*/ apiNode: "api-node",
		/**
		* The Edge Lite bundle layer for the API routes.
		*/ apiEdge: "api-edge",
		/**
		* The layer for the middleware code.
		*/ middleware: "middleware",
		/**
		* The layer for the instrumentation hooks.
		*/ instrument: "instrument",
		/**
		* The layer for assets on the edge.
		*/ edgeAsset: "edge-asset",
		/**
		* The browser client bundle layer for App directory.
		*/ appPagesBrowser: "app-pages-browser",
		/**
		* The browser client bundle layer for Pages directory.
		*/ pagesDirBrowser: "pages-dir-browser",
		/**
		* The Edge Lite bundle layer for Pages directory.
		*/ pagesDirEdge: "pages-dir-edge",
		/**
		* The Node.js bundle layer for Pages directory.
		*/ pagesDirNode: "pages-dir-node"
	};
	var WEBPACK_LAYERS = {
		...WEBPACK_LAYERS_NAMES,
		GROUP: {
			builtinReact: [WEBPACK_LAYERS_NAMES.reactServerComponents, WEBPACK_LAYERS_NAMES.actionBrowser],
			serverOnly: [
				WEBPACK_LAYERS_NAMES.reactServerComponents,
				WEBPACK_LAYERS_NAMES.actionBrowser,
				WEBPACK_LAYERS_NAMES.instrument,
				WEBPACK_LAYERS_NAMES.middleware
			],
			neutralTarget: [WEBPACK_LAYERS_NAMES.apiNode, WEBPACK_LAYERS_NAMES.apiEdge],
			clientOnly: [WEBPACK_LAYERS_NAMES.serverSideRendering, WEBPACK_LAYERS_NAMES.appPagesBrowser],
			bundled: [
				WEBPACK_LAYERS_NAMES.reactServerComponents,
				WEBPACK_LAYERS_NAMES.actionBrowser,
				WEBPACK_LAYERS_NAMES.serverSideRendering,
				WEBPACK_LAYERS_NAMES.appPagesBrowser,
				WEBPACK_LAYERS_NAMES.shared,
				WEBPACK_LAYERS_NAMES.instrument,
				WEBPACK_LAYERS_NAMES.middleware
			],
			appPages: [
				WEBPACK_LAYERS_NAMES.reactServerComponents,
				WEBPACK_LAYERS_NAMES.serverSideRendering,
				WEBPACK_LAYERS_NAMES.appPagesBrowser,
				WEBPACK_LAYERS_NAMES.actionBrowser
			]
		}
	};
	var WEBPACK_RESOURCE_QUERIES = {
		edgeSSREntry: "__next_edge_ssr_entry__",
		metadata: "__next_metadata__",
		metadataRoute: "__next_metadata_route__",
		metadataImageMeta: "__next_metadata_image_meta__"
	};
}));
//#endregion
//#region node_modules/next/dist/server/web/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		fromNodeOutgoingHttpHeaders: null,
		normalizeNextQueryParam: null,
		splitCookiesString: null,
		toNodeOutgoingHttpHeaders: null,
		validateURL: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		fromNodeOutgoingHttpHeaders: function() {
			return fromNodeOutgoingHttpHeaders;
		},
		normalizeNextQueryParam: function() {
			return normalizeNextQueryParam;
		},
		splitCookiesString: function() {
			return splitCookiesString;
		},
		toNodeOutgoingHttpHeaders: function() {
			return toNodeOutgoingHttpHeaders;
		},
		validateURL: function() {
			return validateURL;
		}
	});
	var _constants = require_constants();
	function fromNodeOutgoingHttpHeaders(nodeHeaders) {
		const headers = new Headers();
		for (let [key, value] of Object.entries(nodeHeaders)) {
			const values = Array.isArray(value) ? value : [value];
			for (let v of values) {
				if (typeof v === "undefined") continue;
				if (typeof v === "number") v = v.toString();
				headers.append(key, v);
			}
		}
		return headers;
	}
	function splitCookiesString(cookiesString) {
		var cookiesStrings = [];
		var pos = 0;
		var start;
		var ch;
		var lastComma;
		var nextStart;
		var cookiesSeparatorFound;
		function skipWhitespace() {
			while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) pos += 1;
			return pos < cookiesString.length;
		}
		function notSpecialChar() {
			ch = cookiesString.charAt(pos);
			return ch !== "=" && ch !== ";" && ch !== ",";
		}
		while (pos < cookiesString.length) {
			start = pos;
			cookiesSeparatorFound = false;
			while (skipWhitespace()) {
				ch = cookiesString.charAt(pos);
				if (ch === ",") {
					lastComma = pos;
					pos += 1;
					skipWhitespace();
					nextStart = pos;
					while (pos < cookiesString.length && notSpecialChar()) pos += 1;
					if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
						cookiesSeparatorFound = true;
						pos = nextStart;
						cookiesStrings.push(cookiesString.substring(start, lastComma));
						start = pos;
					} else pos = lastComma + 1;
				} else pos += 1;
			}
			if (!cookiesSeparatorFound || pos >= cookiesString.length) cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
		}
		return cookiesStrings;
	}
	function toNodeOutgoingHttpHeaders(headers) {
		const nodeHeaders = {};
		const cookies = [];
		if (headers) for (const [key, value] of headers.entries()) if (key.toLowerCase() === "set-cookie") {
			cookies.push(...splitCookiesString(value));
			nodeHeaders[key] = cookies.length === 1 ? cookies[0] : cookies;
		} else nodeHeaders[key] = value;
		return nodeHeaders;
	}
	function validateURL(url) {
		try {
			return String(new URL(String(url)));
		} catch (error) {
			throw Object.defineProperty(new Error(`URL is malformed "${String(url)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: error }), "__NEXT_ERROR_CODE", {
				value: "E61",
				enumerable: false,
				configurable: true
			});
		}
	}
	function normalizeNextQueryParam(key) {
		const prefixes = [_constants.NEXT_QUERY_PARAM_PREFIX, _constants.NEXT_INTERCEPTION_MARKER_PREFIX];
		for (const prefix of prefixes) if (key !== prefix && key.startsWith(prefix)) return key.substring(prefix.length);
		return null;
	}
}));
//#endregion
//#region node_modules/next/dist/server/web/error.js
var require_error = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		PageSignatureError: null,
		RemovedPageError: null,
		RemovedUAError: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		PageSignatureError: function() {
			return PageSignatureError;
		},
		RemovedPageError: function() {
			return RemovedPageError;
		},
		RemovedUAError: function() {
			return RemovedUAError;
		}
	});
	var PageSignatureError = class extends Error {
		constructor({ page }) {
			super(`The middleware "${page}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
		}
	};
	var RemovedPageError = class extends Error {
		constructor() {
			super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
		}
	};
	var RemovedUAError = class extends Error {
		constructor() {
			super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
		}
	};
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/request.js
var require_request = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		INTERNALS: null,
		NextRequest: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		INTERNALS: function() {
			return INTERNALS;
		},
		NextRequest: function() {
			return NextRequest;
		}
	});
	var _nexturl = require_next_url();
	var _utils = require_utils();
	var _error = require_error();
	var _cookies = require_cookies$1();
	var INTERNALS = Symbol("internal request");
	var NextRequest = class extends Request {
		constructor(input, init = {}) {
			const url = typeof input !== "string" && "url" in input ? input.url : String(input);
			(0, _utils.validateURL)(url);
			if (process.env.NEXT_RUNTIME !== "edge") {
				if (init.body && init.duplex !== "half") init.duplex = "half";
			}
			if (input instanceof Request) super(input, init);
			else super(url, init);
			const nextUrl = new _nexturl.NextURL(url, {
				headers: (0, _utils.toNodeOutgoingHttpHeaders)(this.headers),
				nextConfig: init.nextConfig
			});
			this[INTERNALS] = {
				cookies: new _cookies.RequestCookies(this.headers),
				nextUrl,
				url: process.env.__NEXT_NO_MIDDLEWARE_URL_NORMALIZE ? url : nextUrl.toString()
			};
		}
		[Symbol.for("edge-runtime.inspect.custom")]() {
			return {
				cookies: this.cookies,
				nextUrl: this.nextUrl,
				url: this.url,
				bodyUsed: this.bodyUsed,
				cache: this.cache,
				credentials: this.credentials,
				destination: this.destination,
				headers: Object.fromEntries(this.headers),
				integrity: this.integrity,
				keepalive: this.keepalive,
				method: this.method,
				mode: this.mode,
				redirect: this.redirect,
				referrer: this.referrer,
				referrerPolicy: this.referrerPolicy,
				signal: this.signal
			};
		}
		get cookies() {
			return this[INTERNALS].cookies;
		}
		get nextUrl() {
			return this[INTERNALS].nextUrl;
		}
		/**
		* @deprecated
		* `page` has been deprecated in favour of `URLPattern`.
		* Read more: https://nextjs.org/docs/messages/middleware-request-page
		*/ get page() {
			throw new _error.RemovedPageError();
		}
		/**
		* @deprecated
		* `ua` has been removed in favour of \`userAgent\` function.
		* Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
		*/ get ua() {
			throw new _error.RemovedUAError();
		}
		get url() {
			return this[INTERNALS].url;
		}
	};
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/response.js
var require_response = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "NextResponse", {
		enumerable: true,
		get: function() {
			return NextResponse;
		}
	});
	var _cookies = require_cookies$1();
	var _nexturl = require_next_url();
	var _utils = require_utils();
	var _reflect = require_reflect();
	var _cookies1 = require_cookies$1();
	var INTERNALS = Symbol("internal response");
	var REDIRECTS = new Set([
		301,
		302,
		303,
		307,
		308
	]);
	function handleMiddlewareField(init, headers) {
		var _init_request;
		if (init == null ? void 0 : (_init_request = init.request) == null ? void 0 : _init_request.headers) {
			if (!(init.request.headers instanceof Headers)) throw Object.defineProperty(/* @__PURE__ */ new Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", {
				value: "E119",
				enumerable: false,
				configurable: true
			});
			const keys = [];
			for (const [key, value] of init.request.headers) {
				headers.set("x-middleware-request-" + key, value);
				keys.push(key);
			}
			headers.set("x-middleware-override-headers", keys.join(","));
		}
	}
	var NextResponse = class NextResponse extends Response {
		constructor(body, init = {}) {
			super(body, init);
			const headers = this.headers;
			const cookies = new _cookies1.ResponseCookies(headers);
			const cookiesProxy = new Proxy(cookies, { get(target, prop, receiver) {
				switch (prop) {
					case "delete":
					case "set": return (...args) => {
						const result = Reflect.apply(target[prop], target, args);
						const newHeaders = new Headers(headers);
						if (result instanceof _cookies1.ResponseCookies) headers.set("x-middleware-set-cookie", result.getAll().map((cookie) => (0, _cookies.stringifyCookie)(cookie)).join(","));
						handleMiddlewareField(init, newHeaders);
						return result;
					};
					default: return _reflect.ReflectAdapter.get(target, prop, receiver);
				}
			} });
			this[INTERNALS] = {
				cookies: cookiesProxy,
				url: init.url ? new _nexturl.NextURL(init.url, {
					headers: (0, _utils.toNodeOutgoingHttpHeaders)(headers),
					nextConfig: init.nextConfig
				}) : void 0
			};
		}
		[Symbol.for("edge-runtime.inspect.custom")]() {
			return {
				cookies: this.cookies,
				url: this.url,
				body: this.body,
				bodyUsed: this.bodyUsed,
				headers: Object.fromEntries(this.headers),
				ok: this.ok,
				redirected: this.redirected,
				status: this.status,
				statusText: this.statusText,
				type: this.type
			};
		}
		get cookies() {
			return this[INTERNALS].cookies;
		}
		static json(body, init) {
			const response = Response.json(body, init);
			return new NextResponse(response.body, response);
		}
		static redirect(url, init) {
			const status = typeof init === "number" ? init : (init == null ? void 0 : init.status) ?? 307;
			if (!REDIRECTS.has(status)) throw Object.defineProperty(/* @__PURE__ */ new RangeError("Failed to execute \"redirect\" on \"response\": Invalid status code"), "__NEXT_ERROR_CODE", {
				value: "E529",
				enumerable: false,
				configurable: true
			});
			const initObj = typeof init === "object" ? init : {};
			const headers = new Headers(initObj == null ? void 0 : initObj.headers);
			headers.set("Location", (0, _utils.validateURL)(url));
			return new NextResponse(null, {
				...initObj,
				headers,
				status
			});
		}
		static rewrite(destination, init) {
			const headers = new Headers(init == null ? void 0 : init.headers);
			headers.set("x-middleware-rewrite", (0, _utils.validateURL)(destination));
			handleMiddlewareField(init, headers);
			return new NextResponse(null, {
				...init,
				headers
			});
		}
		static next(init) {
			const headers = new Headers(init == null ? void 0 : init.headers);
			headers.set("x-middleware-next", "1");
			handleMiddlewareField(init, headers);
			return new NextResponse(null, {
				...init,
				headers
			});
		}
	};
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/image-response.js
/**
* @deprecated ImageResponse moved from "next/server" to "next/og" since Next.js 14, please import from "next/og" instead.
* Migration with codemods: https://nextjs.org/docs/app/building-your-application/upgrading/codemods#next-og-import
*/ var require_image_response = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "ImageResponse", {
		enumerable: true,
		get: function() {
			return ImageResponse;
		}
	});
	function ImageResponse() {
		throw Object.defineProperty(/* @__PURE__ */ new Error("ImageResponse moved from \"next/server\" to \"next/og\" since Next.js 14, please import from \"next/og\" instead"), "__NEXT_ERROR_CODE", {
			value: "E183",
			enumerable: false,
			configurable: true
		});
	}
}));
//#endregion
//#region node_modules/next/dist/compiled/ua-parser-js/ua-parser.js
var require_ua_parser = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	(() => {
		var i = { 226: function(i, e) {
			(function(o, a) {
				"use strict";
				var r = "1.0.35", t = "", n = "?", s = "function", b = "undefined", w = "object", l = "string", d = "major", c = "model", u = "name", p = "type", m = "vendor", f = "version", h = "architecture", v = "console", g = "mobile", k = "tablet", x = "smarttv", _ = "wearable", y = "embedded", q = 350, T = "Amazon", S = "Apple", z = "ASUS", N = "BlackBerry", A = "Browser", C = "Chrome", E = "Edge", O = "Firefox", U = "Google", j = "Huawei", P = "LG", R = "Microsoft", M = "Motorola", B = "Opera", V = "Samsung", D = "Sharp", I = "Sony", F = "Xiaomi", G = "Zebra", H = "Facebook", L = "Chromium OS", Z = "Mac OS";
				var extend = function(i, e) {
					var o = {};
					for (var a in i) if (e[a] && e[a].length % 2 === 0) o[a] = e[a].concat(i[a]);
					else o[a] = i[a];
					return o;
				}, enumerize = function(i) {
					var e = {};
					for (var o = 0; o < i.length; o++) e[i[o].toUpperCase()] = i[o];
					return e;
				}, has = function(i, e) {
					return typeof i === l ? lowerize(e).indexOf(lowerize(i)) !== -1 : false;
				}, lowerize = function(i) {
					return i.toLowerCase();
				}, majorize = function(i) {
					return typeof i === l ? i.replace(/[^\d\.]/g, t).split(".")[0] : a;
				}, trim = function(i, e) {
					if (typeof i === l) {
						i = i.replace(/^\s\s*/, t);
						return typeof e === b ? i : i.substring(0, q);
					}
				};
				var rgxMapper = function(i, e) {
					var o = 0, r, t, n, b, l, d;
					while (o < e.length && !l) {
						var c = e[o], u = e[o + 1];
						r = t = 0;
						while (r < c.length && !l) {
							if (!c[r]) break;
							l = c[r++].exec(i);
							if (!!l) for (n = 0; n < u.length; n++) {
								d = l[++t];
								b = u[n];
								if (typeof b === w && b.length > 0) {
									if (b.length === 2) if (typeof b[1] == s) this[b[0]] = b[1].call(this, d);
									else this[b[0]] = b[1];
									else if (b.length === 3) if (typeof b[1] === s && !(b[1].exec && b[1].test)) this[b[0]] = d ? b[1].call(this, d, b[2]) : a;
									else this[b[0]] = d ? d.replace(b[1], b[2]) : a;
									else if (b.length === 4) this[b[0]] = d ? b[3].call(this, d.replace(b[1], b[2])) : a;
								} else this[b] = d ? d : a;
							}
						}
						o += 2;
					}
				}, strMapper = function(i, e) {
					for (var o in e) if (typeof e[o] === w && e[o].length > 0) {
						for (var r = 0; r < e[o].length; r++) if (has(e[o][r], i)) return o === n ? a : o;
					} else if (has(e[o], i)) return o === n ? a : o;
					return i;
				};
				var $ = {
					"1.0": "/8",
					1.2: "/1",
					1.3: "/3",
					"2.0": "/412",
					"2.0.2": "/416",
					"2.0.3": "/417",
					"2.0.4": "/419",
					"?": "/"
				}, X = {
					ME: "4.90",
					"NT 3.11": "NT3.51",
					"NT 4.0": "NT4.0",
					2e3: "NT 5.0",
					XP: ["NT 5.1", "NT 5.2"],
					Vista: "NT 6.0",
					7: "NT 6.1",
					8: "NT 6.2",
					8.1: "NT 6.3",
					10: ["NT 6.4", "NT 10.0"],
					RT: "ARM"
				};
				var K = {
					browser: [
						[/\b(?:crmo|crios)\/([\w\.]+)/i],
						[f, [u, "Chrome"]],
						[/edg(?:e|ios|a)?\/([\w\.]+)/i],
						[f, [u, "Edge"]],
						[
							/(opera mini)\/([-\w\.]+)/i,
							/(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,
							/(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i
						],
						[u, f],
						[/opios[\/ ]+([\w\.]+)/i],
						[f, [u, B + " Mini"]],
						[/\bopr\/([\w\.]+)/i],
						[f, [u, B]],
						[
							/(kindle)\/([\w\.]+)/i,
							/(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,
							/(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,
							/(ba?idubrowser)[\/ ]?([\w\.]+)/i,
							/(?:ms|\()(ie) ([\w\.]+)/i,
							/(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,
							/(heytap|ovi)browser\/([\d\.]+)/i,
							/(weibo)__([\d\.]+)/i
						],
						[u, f],
						[/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],
						[f, [u, "UC" + A]],
						[/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i],
						[f, [u, "WeChat(Win) Desktop"]],
						[/micromessenger\/([\w\.]+)/i],
						[f, [u, "WeChat"]],
						[/konqueror\/([\w\.]+)/i],
						[f, [u, "Konqueror"]],
						[/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],
						[f, [u, "IE"]],
						[/ya(?:search)?browser\/([\w\.]+)/i],
						[f, [u, "Yandex"]],
						[/(avast|avg)\/([\w\.]+)/i],
						[[
							u,
							/(.+)/,
							"$1 Secure " + A
						], f],
						[/\bfocus\/([\w\.]+)/i],
						[f, [u, O + " Focus"]],
						[/\bopt\/([\w\.]+)/i],
						[f, [u, B + " Touch"]],
						[/coc_coc\w+\/([\w\.]+)/i],
						[f, [u, "Coc Coc"]],
						[/dolfin\/([\w\.]+)/i],
						[f, [u, "Dolphin"]],
						[/coast\/([\w\.]+)/i],
						[f, [u, B + " Coast"]],
						[/miuibrowser\/([\w\.]+)/i],
						[f, [u, "MIUI " + A]],
						[/fxios\/([-\w\.]+)/i],
						[f, [u, O]],
						[/\bqihu|(qi?ho?o?|360)browser/i],
						[[u, "360 " + A]],
						[/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i],
						[[
							u,
							/(.+)/,
							"$1 " + A
						], f],
						[/(comodo_dragon)\/([\w\.]+)/i],
						[[
							u,
							/_/g,
							" "
						], f],
						[
							/(electron)\/([\w\.]+) safari/i,
							/(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,
							/m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i
						],
						[u, f],
						[
							/(metasr)[\/ ]?([\w\.]+)/i,
							/(lbbrowser)/i,
							/\[(linkedin)app\]/i
						],
						[u],
						[/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],
						[[u, H], f],
						[
							/(kakao(?:talk|story))[\/ ]([\w\.]+)/i,
							/(naver)\(.*?(\d+\.[\w\.]+).*\)/i,
							/safari (line)\/([\w\.]+)/i,
							/\b(line)\/([\w\.]+)\/iab/i,
							/(chromium|instagram)[\/ ]([-\w\.]+)/i
						],
						[u, f],
						[/\bgsa\/([\w\.]+) .*safari\//i],
						[f, [u, "GSA"]],
						[/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],
						[f, [u, "TikTok"]],
						[/headlesschrome(?:\/([\w\.]+)| )/i],
						[f, [u, C + " Headless"]],
						[/ wv\).+(chrome)\/([\w\.]+)/i],
						[[u, C + " WebView"], f],
						[/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],
						[f, [u, "Android " + A]],
						[/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],
						[u, f],
						[/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],
						[f, [u, "Mobile Safari"]],
						[/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],
						[f, u],
						[/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],
						[u, [
							f,
							strMapper,
							$
						]],
						[/(webkit|khtml)\/([\w\.]+)/i],
						[u, f],
						[/(navigator|netscape\d?)\/([-\w\.]+)/i],
						[[u, "Netscape"], f],
						[/mobile vr; rv:([\w\.]+)\).+firefox/i],
						[f, [u, O + " Reality"]],
						[
							/ekiohf.+(flow)\/([\w\.]+)/i,
							/(swiftfox)/i,
							/(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,
							/(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,
							/(firefox)\/([\w\.]+)/i,
							/(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,
							/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,
							/(links) \(([\w\.]+)/i,
							/panasonic;(viera)/i
						],
						[u, f],
						[/(cobalt)\/([\w\.]+)/i],
						[u, [
							f,
							/master.|lts./,
							""
						]]
					],
					cpu: [
						[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],
						[[h, "amd64"]],
						[/(ia32(?=;))/i],
						[[h, lowerize]],
						[/((?:i[346]|x)86)[;\)]/i],
						[[h, "ia32"]],
						[/\b(aarch64|arm(v?8e?l?|_?64))\b/i],
						[[h, "arm64"]],
						[/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],
						[[h, "armhf"]],
						[/windows (ce|mobile); ppc;/i],
						[[h, "arm"]],
						[/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],
						[[
							h,
							/ower/,
							t,
							lowerize
						]],
						[/(sun4\w)[;\)]/i],
						[[h, "sparc"]],
						[/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i],
						[[h, lowerize]]
					],
					device: [
						[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],
						[
							c,
							[m, V],
							[p, k]
						],
						[
							/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,
							/samsung[- ]([-\w]+)/i,
							/sec-(sgh\w+)/i
						],
						[
							c,
							[m, V],
							[p, g]
						],
						[/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],
						[
							c,
							[m, S],
							[p, g]
						],
						[
							/\((ipad);[-\w\),; ]+apple/i,
							/applecoremedia\/[\w\.]+ \((ipad)/i,
							/\b(ipad)\d\d?,\d\d?[;\]].+ios/i
						],
						[
							c,
							[m, S],
							[p, k]
						],
						[/(macintosh);/i],
						[c, [m, S]],
						[/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],
						[
							c,
							[m, D],
							[p, g]
						],
						[/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],
						[
							c,
							[m, j],
							[p, k]
						],
						[/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i],
						[
							c,
							[m, j],
							[p, g]
						],
						[
							/\b(poco[\w ]+)(?: bui|\))/i,
							/\b; (\w+) build\/hm\1/i,
							/\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,
							/\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,
							/\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i
						],
						[
							[
								c,
								/_/g,
								" "
							],
							[m, F],
							[p, g]
						],
						[/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i],
						[
							[
								c,
								/_/g,
								" "
							],
							[m, F],
							[p, k]
						],
						[/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i],
						[
							c,
							[m, "OPPO"],
							[p, g]
						],
						[/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i],
						[
							c,
							[m, "Vivo"],
							[p, g]
						],
						[/\b(rmx[12]\d{3})(?: bui|;|\))/i],
						[
							c,
							[m, "Realme"],
							[p, g]
						],
						[
							/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,
							/\bmot(?:orola)?[- ](\w*)/i,
							/((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i
						],
						[
							c,
							[m, M],
							[p, g]
						],
						[/\b(mz60\d|xoom[2 ]{0,2}) build\//i],
						[
							c,
							[m, M],
							[p, k]
						],
						[/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],
						[
							c,
							[m, P],
							[p, k]
						],
						[
							/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,
							/\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,
							/\blg-?([\d\w]+) bui/i
						],
						[
							c,
							[m, P],
							[p, g]
						],
						[/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i],
						[
							c,
							[m, "Lenovo"],
							[p, k]
						],
						[/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i],
						[
							[
								c,
								/_/g,
								" "
							],
							[m, "Nokia"],
							[p, g]
						],
						[/(pixel c)\b/i],
						[
							c,
							[m, U],
							[p, k]
						],
						[/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],
						[
							c,
							[m, U],
							[p, g]
						],
						[/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i],
						[
							c,
							[m, I],
							[p, g]
						],
						[/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i],
						[
							[c, "Xperia Tablet"],
							[m, I],
							[p, k]
						],
						[/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],
						[
							c,
							[m, "OnePlus"],
							[p, g]
						],
						[
							/(alexa)webm/i,
							/(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,
							/(kf[a-z]+)( bui|\)).+silk\//i
						],
						[
							c,
							[m, T],
							[p, k]
						],
						[/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],
						[
							[
								c,
								/(.+)/g,
								"Fire Phone $1"
							],
							[m, T],
							[p, g]
						],
						[/(playbook);[-\w\),; ]+(rim)/i],
						[
							c,
							m,
							[p, k]
						],
						[/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i],
						[
							c,
							[m, N],
							[p, g]
						],
						[/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],
						[
							c,
							[m, z],
							[p, k]
						],
						[/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],
						[
							c,
							[m, z],
							[p, g]
						],
						[/(nexus 9)/i],
						[
							c,
							[m, "HTC"],
							[p, k]
						],
						[
							/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,
							/(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,
							/(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i
						],
						[
							m,
							[
								c,
								/_/g,
								" "
							],
							[p, g]
						],
						[/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],
						[
							c,
							[m, "Acer"],
							[p, k]
						],
						[/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i],
						[
							c,
							[m, "Meizu"],
							[p, g]
						],
						[
							/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i,
							/(hp) ([\w ]+\w)/i,
							/(asus)-?(\w+)/i,
							/(microsoft); (lumia[\w ]+)/i,
							/(lenovo)[-_ ]?([-\w]+)/i,
							/(jolla)/i,
							/(oppo) ?([\w ]+) bui/i
						],
						[
							m,
							c,
							[p, g]
						],
						[
							/(kobo)\s(ereader|touch)/i,
							/(archos) (gamepad2?)/i,
							/(hp).+(touchpad(?!.+tablet)|tablet)/i,
							/(kindle)\/([\w\.]+)/i,
							/(nook)[\w ]+build\/(\w+)/i,
							/(dell) (strea[kpr\d ]*[\dko])/i,
							/(le[- ]+pan)[- ]+(\w{1,9}) bui/i,
							/(trinity)[- ]*(t\d{3}) bui/i,
							/(gigaset)[- ]+(q\w{1,9}) bui/i,
							/(vodafone) ([\w ]+)(?:\)| bui)/i
						],
						[
							m,
							c,
							[p, k]
						],
						[/(surface duo)/i],
						[
							c,
							[m, R],
							[p, k]
						],
						[/droid [\d\.]+; (fp\du?)(?: b|\))/i],
						[
							c,
							[m, "Fairphone"],
							[p, g]
						],
						[/(u304aa)/i],
						[
							c,
							[m, "AT&T"],
							[p, g]
						],
						[/\bsie-(\w*)/i],
						[
							c,
							[m, "Siemens"],
							[p, g]
						],
						[/\b(rct\w+) b/i],
						[
							c,
							[m, "RCA"],
							[p, k]
						],
						[/\b(venue[\d ]{2,7}) b/i],
						[
							c,
							[m, "Dell"],
							[p, k]
						],
						[/\b(q(?:mv|ta)\w+) b/i],
						[
							c,
							[m, "Verizon"],
							[p, k]
						],
						[/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],
						[
							c,
							[m, "Barnes & Noble"],
							[p, k]
						],
						[/\b(tm\d{3}\w+) b/i],
						[
							c,
							[m, "NuVision"],
							[p, k]
						],
						[/\b(k88) b/i],
						[
							c,
							[m, "ZTE"],
							[p, k]
						],
						[/\b(nx\d{3}j) b/i],
						[
							c,
							[m, "ZTE"],
							[p, g]
						],
						[/\b(gen\d{3}) b.+49h/i],
						[
							c,
							[m, "Swiss"],
							[p, g]
						],
						[/\b(zur\d{3}) b/i],
						[
							c,
							[m, "Swiss"],
							[p, k]
						],
						[/\b((zeki)?tb.*\b) b/i],
						[
							c,
							[m, "Zeki"],
							[p, k]
						],
						[/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i],
						[
							[m, "Dragon Touch"],
							c,
							[p, k]
						],
						[/\b(ns-?\w{0,9}) b/i],
						[
							c,
							[m, "Insignia"],
							[p, k]
						],
						[/\b((nxa|next)-?\w{0,9}) b/i],
						[
							c,
							[m, "NextBook"],
							[p, k]
						],
						[/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],
						[
							[m, "Voice"],
							c,
							[p, g]
						],
						[/\b(lvtel\-)?(v1[12]) b/i],
						[
							[m, "LvTel"],
							c,
							[p, g]
						],
						[/\b(ph-1) /i],
						[
							c,
							[m, "Essential"],
							[p, g]
						],
						[/\b(v(100md|700na|7011|917g).*\b) b/i],
						[
							c,
							[m, "Envizen"],
							[p, k]
						],
						[/\b(trio[-\w\. ]+) b/i],
						[
							c,
							[m, "MachSpeed"],
							[p, k]
						],
						[/\btu_(1491) b/i],
						[
							c,
							[m, "Rotor"],
							[p, k]
						],
						[/(shield[\w ]+) b/i],
						[
							c,
							[m, "Nvidia"],
							[p, k]
						],
						[/(sprint) (\w+)/i],
						[
							m,
							c,
							[p, g]
						],
						[/(kin\.[onetw]{3})/i],
						[
							[
								c,
								/\./g,
								" "
							],
							[m, R],
							[p, g]
						],
						[/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],
						[
							c,
							[m, G],
							[p, k]
						],
						[/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],
						[
							c,
							[m, G],
							[p, g]
						],
						[/smart-tv.+(samsung)/i],
						[m, [p, x]],
						[/hbbtv.+maple;(\d+)/i],
						[
							[
								c,
								/^/,
								"SmartTV"
							],
							[m, V],
							[p, x]
						],
						[/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],
						[[m, P], [p, x]],
						[/(apple) ?tv/i],
						[
							m,
							[c, S + " TV"],
							[p, x]
						],
						[/crkey/i],
						[
							[c, C + "cast"],
							[m, U],
							[p, x]
						],
						[/droid.+aft(\w)( bui|\))/i],
						[
							c,
							[m, T],
							[p, x]
						],
						[/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i],
						[
							c,
							[m, D],
							[p, x]
						],
						[/(bravia[\w ]+)( bui|\))/i],
						[
							c,
							[m, I],
							[p, x]
						],
						[/(mitv-\w{5}) bui/i],
						[
							c,
							[m, F],
							[p, x]
						],
						[/Hbbtv.*(technisat) (.*);/i],
						[
							m,
							c,
							[p, x]
						],
						[/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i],
						[
							[m, trim],
							[c, trim],
							[p, x]
						],
						[/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],
						[[p, x]],
						[/(ouya)/i, /(nintendo) ([wids3utch]+)/i],
						[
							m,
							c,
							[p, v]
						],
						[/droid.+; (shield) bui/i],
						[
							c,
							[m, "Nvidia"],
							[p, v]
						],
						[/(playstation [345portablevi]+)/i],
						[
							c,
							[m, I],
							[p, v]
						],
						[/\b(xbox(?: one)?(?!; xbox))[\); ]/i],
						[
							c,
							[m, R],
							[p, v]
						],
						[/((pebble))app/i],
						[
							m,
							c,
							[p, _]
						],
						[/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],
						[
							c,
							[m, S],
							[p, _]
						],
						[/droid.+; (glass) \d/i],
						[
							c,
							[m, U],
							[p, _]
						],
						[/droid.+; (wt63?0{2,3})\)/i],
						[
							c,
							[m, G],
							[p, _]
						],
						[/(quest( 2| pro)?)/i],
						[
							c,
							[m, H],
							[p, _]
						],
						[/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],
						[m, [p, y]],
						[/(aeobc)\b/i],
						[
							c,
							[m, T],
							[p, y]
						],
						[/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i],
						[c, [p, g]],
						[/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],
						[c, [p, k]],
						[/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],
						[[p, k]],
						[/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],
						[[p, g]],
						[/(android[-\w\. ]{0,9});.+buil/i],
						[c, [m, "Generic"]]
					],
					engine: [
						[/windows.+ edge\/([\w\.]+)/i],
						[f, [u, E + "HTML"]],
						[/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],
						[f, [u, "Blink"]],
						[
							/(presto)\/([\w\.]+)/i,
							/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,
							/ekioh(flow)\/([\w\.]+)/i,
							/(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,
							/(icab)[\/ ]([23]\.[\d\.]+)/i,
							/\b(libweb)/i
						],
						[u, f],
						[/rv\:([\w\.]{1,9})\b.+(gecko)/i],
						[f, u]
					],
					os: [
						[/microsoft (windows) (vista|xp)/i],
						[u, f],
						[
							/(windows) nt 6\.2; (arm)/i,
							/(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,
							/(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i
						],
						[u, [
							f,
							strMapper,
							X
						]],
						[/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i],
						[[u, "Windows"], [
							f,
							strMapper,
							X
						]],
						[
							/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,
							/ios;fbsv\/([\d\.]+)/i,
							/cfnetwork\/.+darwin/i
						],
						[[
							f,
							/_/g,
							"."
						], [u, "iOS"]],
						[/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i],
						[[u, Z], [
							f,
							/_/g,
							"."
						]],
						[/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],
						[f, u],
						[
							/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,
							/(blackberry)\w*\/([\w\.]*)/i,
							/(tizen|kaios)[\/ ]([\w\.]+)/i,
							/\((series40);/i
						],
						[u, f],
						[/\(bb(10);/i],
						[f, [u, N]],
						[/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],
						[f, [u, "Symbian"]],
						[/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],
						[f, [u, O + " OS"]],
						[/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],
						[f, [u, "webOS"]],
						[/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],
						[f, [u, "watchOS"]],
						[/crkey\/([\d\.]+)/i],
						[f, [u, C + "cast"]],
						[/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],
						[[u, L], f],
						[
							/panasonic;(viera)/i,
							/(netrange)mmh/i,
							/(nettv)\/(\d+\.[\w\.]+)/i,
							/(nintendo|playstation) ([wids345portablevuch]+)/i,
							/(xbox); +xbox ([^\);]+)/i,
							/\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,
							/(mint)[\/\(\) ]?(\w*)/i,
							/(mageia|vectorlinux)[; ]/i,
							/([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,
							/(hurd|linux) ?([\w\.]*)/i,
							/(gnu) ?([\w\.]*)/i,
							/\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,
							/(haiku) (\w+)/i
						],
						[u, f],
						[/(sunos) ?([\w\.\d]*)/i],
						[[u, "Solaris"], f],
						[
							/((?:open)?solaris)[-\/ ]?([\w\.]*)/i,
							/(aix) ((\d)(?=\.|\)| )[\w\.])*/i,
							/\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,
							/(unix) ?([\w\.]*)/i
						],
						[u, f]
					]
				};
				var UAParser = function(i, e) {
					if (typeof i === w) {
						e = i;
						i = a;
					}
					if (!(this instanceof UAParser)) return new UAParser(i, e).getResult();
					var r = typeof o !== b && o.navigator ? o.navigator : a;
					var n = i || (r && r.userAgent ? r.userAgent : t);
					var v = r && r.userAgentData ? r.userAgentData : a;
					var x = e ? extend(K, e) : K;
					var _ = r && r.userAgent == n;
					this.getBrowser = function() {
						var i = {};
						i[u] = a;
						i[f] = a;
						rgxMapper.call(i, n, x.browser);
						i[d] = majorize(i[f]);
						if (_ && r && r.brave && typeof r.brave.isBrave == s) i[u] = "Brave";
						return i;
					};
					this.getCPU = function() {
						var i = {};
						i[h] = a;
						rgxMapper.call(i, n, x.cpu);
						return i;
					};
					this.getDevice = function() {
						var i = {};
						i[m] = a;
						i[c] = a;
						i[p] = a;
						rgxMapper.call(i, n, x.device);
						if (_ && !i[p] && v && v.mobile) i[p] = g;
						if (_ && i[c] == "Macintosh" && r && typeof r.standalone !== b && r.maxTouchPoints && r.maxTouchPoints > 2) {
							i[c] = "iPad";
							i[p] = k;
						}
						return i;
					};
					this.getEngine = function() {
						var i = {};
						i[u] = a;
						i[f] = a;
						rgxMapper.call(i, n, x.engine);
						return i;
					};
					this.getOS = function() {
						var i = {};
						i[u] = a;
						i[f] = a;
						rgxMapper.call(i, n, x.os);
						if (_ && !i[u] && v && v.platform != "Unknown") i[u] = v.platform.replace(/chrome os/i, L).replace(/macos/i, Z);
						return i;
					};
					this.getResult = function() {
						return {
							ua: this.getUA(),
							browser: this.getBrowser(),
							engine: this.getEngine(),
							os: this.getOS(),
							device: this.getDevice(),
							cpu: this.getCPU()
						};
					};
					this.getUA = function() {
						return n;
					};
					this.setUA = function(i) {
						n = typeof i === l && i.length > q ? trim(i, q) : i;
						return this;
					};
					this.setUA(n);
					return this;
				};
				UAParser.VERSION = r;
				UAParser.BROWSER = enumerize([
					u,
					f,
					d
				]);
				UAParser.CPU = enumerize([h]);
				UAParser.DEVICE = enumerize([
					c,
					m,
					p,
					v,
					g,
					x,
					k,
					_,
					y
				]);
				UAParser.ENGINE = UAParser.OS = enumerize([u, f]);
				if (typeof e !== b) {
					if ("object" !== b && i.exports) e = i.exports = UAParser;
					e.UAParser = UAParser;
				} else if (typeof define === s && define.amd) define((function() {
					return UAParser;
				}));
				else if (typeof o !== b) o.UAParser = UAParser;
				var Q = typeof o !== b && (o.jQuery || o.Zepto);
				if (Q && !Q.ua) {
					var Y = new UAParser();
					Q.ua = Y.getResult();
					Q.ua.get = function() {
						return Y.getUA();
					};
					Q.ua.set = function(i) {
						Y.setUA(i);
						var e = Y.getResult();
						for (var o in e) Q.ua[o] = e[o];
					};
				}
			})(typeof window === "object" ? window : this);
		} };
		var e = {};
		function __nccwpck_require__(o) {
			var a = e[o];
			if (a !== void 0) return a.exports;
			var r = e[o] = { exports: {} };
			var t = true;
			try {
				i[o].call(r.exports, r, r.exports, __nccwpck_require__);
				t = false;
			} finally {
				if (t) delete e[o];
			}
			return r.exports;
		}
		if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = __dirname + "/";
		module.exports = __nccwpck_require__(226);
	})();
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/user-agent.js
var require_user_agent = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	0 && (module.exports = {
		isBot: null,
		userAgent: null,
		userAgentFromString: null
	});
	function _export(target, all) {
		for (var name in all) Object.defineProperty(target, name, {
			enumerable: true,
			get: all[name]
		});
	}
	_export(exports, {
		isBot: function() {
			return isBot;
		},
		userAgent: function() {
			return userAgent;
		},
		userAgentFromString: function() {
			return userAgentFromString;
		}
	});
	var _uaparserjs = /*#__PURE__*/ _interop_require_default(require_ua_parser());
	function _interop_require_default(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	function isBot(input) {
		return /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Google-InspectionTool|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver|GPTBot/i.test(input);
	}
	function userAgentFromString(input) {
		return {
			...(0, _uaparserjs.default)(input),
			isBot: input === void 0 ? false : isBot(input)
		};
	}
	function userAgent({ headers }) {
		return userAgentFromString(headers.get("user-agent") || void 0);
	}
}));
//#endregion
//#region node_modules/next/dist/server/web/spec-extension/url-pattern.js
var require_url_pattern = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "URLPattern", {
		enumerable: true,
		get: function() {
			return GlobalURLPattern;
		}
	});
	var GlobalURLPattern = typeof URLPattern === "undefined" ? void 0 : URLPattern;
}));
//#endregion
//#region node_modules/next/dist/server/after/after.js
var require_after$1 = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "after", {
		enumerable: true,
		get: function() {
			return after;
		}
	});
	var _workasyncstorageexternal = require_work_async_storage_external();
	function after(task) {
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		if (!workStore) throw Object.defineProperty(/* @__PURE__ */ new Error("`after` was called outside a request scope. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context"), "__NEXT_ERROR_CODE", {
			value: "E468",
			enumerable: false,
			configurable: true
		});
		const { afterContext } = workStore;
		return afterContext.after(task);
	}
}));
//#endregion
//#region node_modules/next/dist/server/after/index.js
var require_after = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	_export_star(require_after$1(), exports);
	function _export_star(from, to) {
		Object.keys(from).forEach(function(k) {
			if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) Object.defineProperty(to, k, {
				enumerable: true,
				get: function() {
					return from[k];
				}
			});
		});
		return from;
	}
}));
//#endregion
//#region node_modules/next/dist/server/request/connection.js
var require_connection = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	Object.defineProperty(exports, "connection", {
		enumerable: true,
		get: function() {
			return connection;
		}
	});
	var _workasyncstorageexternal = require_work_async_storage_external();
	var _workunitasyncstorageexternal = require_work_unit_async_storage_external();
	var _dynamicrendering = require_dynamic_rendering();
	var _staticgenerationbailout = require_static_generation_bailout();
	var _dynamicrenderingutils = require_dynamic_rendering_utils();
	var _utils = require_utils$1();
	require_staged_rendering();
	var _invarianterror = require_invariant_error();
	function connection() {
		const callingExpression = "connection";
		const workStore = _workasyncstorageexternal.workAsyncStorage.getStore();
		const workUnitStore = _workunitasyncstorageexternal.workUnitAsyncStorage.getStore();
		if (workStore) {
			if (workUnitStore && workUnitStore.phase === "after" && !(0, _utils.isRequestAPICallableInsideAfter)()) throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`connection()\` inside \`after()\`. The \`connection()\` function is used to indicate the subsequent code must only run when there is an actual Request, but \`after()\` executes after the request, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/canary/app/api-reference/functions/after`), "__NEXT_ERROR_CODE", {
				value: "E827",
				enumerable: false,
				configurable: true
			});
			if (workStore.forceStatic) return Promise.resolve(void 0);
			if (workStore.dynamicShouldError) throw Object.defineProperty(new _staticgenerationbailout.StaticGenBailoutError(`Route ${workStore.route} with \`dynamic = "error"\` couldn't be rendered statically because it used \`connection()\`. See more info here: https://nextjs.org/docs/app/building-your-application/rendering/static-and-dynamic#dynamic-rendering`), "__NEXT_ERROR_CODE", {
				value: "E847",
				enumerable: false,
				configurable: true
			});
			if (workUnitStore) switch (workUnitStore.type) {
				case "cache": {
					const error = Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`connection()\` inside "use cache". The \`connection()\` function is used to indicate the subsequent code must only run when there is an actual request, but caches must be able to be produced before a request, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
						value: "E841",
						enumerable: false,
						configurable: true
					});
					Error.captureStackTrace(error, connection);
					workStore.invalidDynamicUsageError ??= error;
					throw error;
				}
				case "private-cache": {
					const error = Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`connection()\` inside "use cache: private". The \`connection()\` function is used to indicate the subsequent code must only run when there is an actual navigation request, but caches must be able to be produced before a navigation request, so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/messages/next-request-in-use-cache`), "__NEXT_ERROR_CODE", {
						value: "E837",
						enumerable: false,
						configurable: true
					});
					Error.captureStackTrace(error, connection);
					workStore.invalidDynamicUsageError ??= error;
					throw error;
				}
				case "unstable-cache": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`connection()\` inside a function cached with \`unstable_cache()\`. The \`connection()\` function is used to indicate the subsequent code must only run when there is an actual Request, but caches must be able to be produced before a Request so this function is not allowed in this scope. See more info here: https://nextjs.org/docs/app/api-reference/functions/unstable_cache`), "__NEXT_ERROR_CODE", {
					value: "E840",
					enumerable: false,
					configurable: true
				});
				case "generate-static-params": throw Object.defineProperty(/* @__PURE__ */ new Error(`Route ${workStore.route} used \`connection()\` inside \`generateStaticParams\`. This is not supported because \`generateStaticParams\` runs at build time without an HTTP request. Read more: https://nextjs.org/docs/messages/next-dynamic-api-wrong-context`), "__NEXT_ERROR_CODE", {
					value: "E1125",
					enumerable: false,
					configurable: true
				});
				case "prerender":
				case "prerender-client":
				case "prerender-runtime": return (0, _dynamicrenderingutils.makeHangingPromise)(workUnitStore.renderSignal, workStore.route, "`connection()`");
				case "validation-client": {
					const exportName = "`connection`";
					throw Object.defineProperty(new _invarianterror.InvariantError(`${exportName} must not be used within a Client Component. Next.js should be preventing ${exportName} from being included in Client Components statically, but did not in this case.`), "__NEXT_ERROR_CODE", {
						value: "E1063",
						enumerable: false,
						configurable: true
					});
				}
				case "prerender-ppr": return (0, _dynamicrendering.postponeWithTracking)(workStore.route, "connection", workUnitStore.dynamicTracking);
				case "prerender-legacy": return (0, _dynamicrendering.throwToInterruptStaticGeneration)("connection", workStore, workUnitStore);
				case "request":
					(0, _dynamicrendering.trackDynamicDataInDynamicRender)(workUnitStore);
					if (workUnitStore.asyncApiPromises) return workUnitStore.asyncApiPromises.connection;
					else return Promise.resolve(void 0);
				default:
			}
		}
		(0, _workunitasyncstorageexternal.throwForMissingRequestStore)(callingExpression);
	}
}));
//#endregion
//#region node_modules/next/server.js
var require_server = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var serverExports = {
		NextRequest: require_request().NextRequest,
		NextResponse: require_response().NextResponse,
		ImageResponse: require_image_response().ImageResponse,
		userAgentFromString: require_user_agent().userAgentFromString,
		userAgent: require_user_agent().userAgent,
		URLPattern: require_url_pattern().URLPattern,
		after: require_after().after,
		connection: require_connection().connection
	};
	module.exports = serverExports;
	exports.NextRequest = serverExports.NextRequest;
	exports.NextResponse = serverExports.NextResponse;
	exports.ImageResponse = serverExports.ImageResponse;
	exports.userAgentFromString = serverExports.userAgentFromString;
	exports.userAgent = serverExports.userAgent;
	exports.URLPattern = serverExports.URLPattern;
	exports.after = serverExports.after;
	exports.connection = serverExports.connection;
}));
//#endregion
export { require_headers as n, require_server as t };
