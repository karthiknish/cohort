import { o as __toESM, t as __commonJSMin } from "../../_runtime.mjs";
import { $ as concat, A as validateAlgorithms, At as object, B as invalidKeyInput, C as JWTClaimsBuilder, Ct as array, D as checkKeyType, Dt as json, E as subtleAlgorithm$1, Et as email, F as isDisjoint, G as JWEInvalid, H as JOSEAlgNotAllowed, I as assertCryptoKey, J as JWTClaimValidationFailed, K as JWKInvalid, L as isCryptoKey, M as importJWK, Mt as record, N as checkKeyLength, O as normalizeKey, Ot as looseObject, P as isObject, Pt as string, Q as encode$1, R as isKeyLike, S as jwtVerify, St as any, T as getSigKey, Tt as date, U as JOSENotSupported, V as checkEncCryptoKey, W as JWEDecryptionFailed, X as JWTInvalid, Y as JWTExpired, Z as decode, a as normalizeIP, at as db_exports$1, b as decodeJwt, bt as string$1, c as createAuthMiddleware, ct as BetterAuthError, d as runWithTransaction, dt as logger, et as decoder, f as defineRequestState, ft as env, gt as betterFetch, h as safeJSONParse, ht as isTest, i as isValidIP, it as filterOutputFields, j as validateCrit, jt as optional, k as isJWK, kt as number, l as getCurrentAdapter, lt as APIError$1, m as normalizePathname, mt as isProduction, n as SocialProviderListEnum, nt as uint32be, o as deprecate, ot as getAuthTables, p as getCurrentAuthContext, pt as isDevelopment, q as JWSInvalid, r as generateId, rt as uint64be, s as createAuthEndpoint, st as APIError, tt as encode, u as queueAfterTransactionHook, ut as BASE_ERROR_CODES, v as base64Url, vt as zod_exports, w as validateClaimsSet, wt as boolean$1, x as decodeProtectedHeader, xt as _enum, y as createRandomStringGenerator, yt as boolean, z as isKeyObject } from "../@better-auth/core+[...].mjs";
import { n as binary, r as createHash, t as createHMAC } from "../better-auth__utils.mjs";
//#region node_modules/react/cjs/react-jsx-runtime.production.js
/**
* @license React
* react-jsx-runtime.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_jsx_runtime_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
	function jsxProd(type, config, maybeKey) {
		var key = null;
		void 0 !== maybeKey && (key = "" + maybeKey);
		void 0 !== config.key && (key = "" + config.key);
		if ("key" in config) {
			maybeKey = {};
			for (var propName in config) "key" !== propName && (maybeKey[propName] = config[propName]);
		} else maybeKey = config;
		config = maybeKey.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== config ? config : null,
			props: maybeKey
		};
	}
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.jsx = jsxProd;
	exports.jsxs = jsxProd;
}));
//#endregion
//#region node_modules/react/jsx-runtime.js
var require_jsx_runtime = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_jsx_runtime_production();
}));
//#endregion
//#region node_modules/react/cjs/react.production.js
/**
* @license React
* react.production.js
*
* Copyright (c) Meta Platforms, Inc. and affiliates.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.
*/
var require_react_production = /* @__PURE__ */ __commonJSMin(((exports) => {
	var REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
	function getIteratorFn(maybeIterable) {
		if (null === maybeIterable || "object" !== typeof maybeIterable) return null;
		maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		return "function" === typeof maybeIterable ? maybeIterable : null;
	}
	var ReactNoopUpdateQueue = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, assign = Object.assign, emptyObject = {};
	function Component(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	Component.prototype.isReactComponent = {};
	Component.prototype.setState = function(partialState, callback) {
		if ("object" !== typeof partialState && "function" !== typeof partialState && null != partialState) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, partialState, callback, "setState");
	};
	Component.prototype.forceUpdate = function(callback) {
		this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
	};
	function ComponentDummy() {}
	ComponentDummy.prototype = Component.prototype;
	function PureComponent(props, context, updater) {
		this.props = props;
		this.context = context;
		this.refs = emptyObject;
		this.updater = updater || ReactNoopUpdateQueue;
	}
	var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
	pureComponentPrototype.constructor = PureComponent;
	assign(pureComponentPrototype, Component.prototype);
	pureComponentPrototype.isPureReactComponent = !0;
	var isArrayImpl = Array.isArray;
	function noop() {}
	var ReactSharedInternals = {
		H: null,
		A: null,
		T: null,
		S: null
	}, hasOwnProperty = Object.prototype.hasOwnProperty;
	function ReactElement(type, key, props) {
		var refProp = props.ref;
		return {
			$$typeof: REACT_ELEMENT_TYPE,
			type,
			key,
			ref: void 0 !== refProp ? refProp : null,
			props
		};
	}
	function cloneAndReplaceKey(oldElement, newKey) {
		return ReactElement(oldElement.type, newKey, oldElement.props);
	}
	function isValidElement(object) {
		return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
	}
	function escape(key) {
		var escaperLookup = {
			"=": "=0",
			":": "=2"
		};
		return "$" + key.replace(/[=:]/g, function(match) {
			return escaperLookup[match];
		});
	}
	var userProvidedKeyEscapeRegex = /\/+/g;
	function getElementKey(element, index) {
		return "object" === typeof element && null !== element && null != element.key ? escape("" + element.key) : index.toString(36);
	}
	function resolveThenable(thenable) {
		switch (thenable.status) {
			case "fulfilled": return thenable.value;
			case "rejected": throw thenable.reason;
			default: switch ("string" === typeof thenable.status ? thenable.then(noop, noop) : (thenable.status = "pending", thenable.then(function(fulfilledValue) {
				"pending" === thenable.status && (thenable.status = "fulfilled", thenable.value = fulfilledValue);
			}, function(error) {
				"pending" === thenable.status && (thenable.status = "rejected", thenable.reason = error);
			})), thenable.status) {
				case "fulfilled": return thenable.value;
				case "rejected": throw thenable.reason;
			}
		}
		throw thenable;
	}
	function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
		var type = typeof children;
		if ("undefined" === type || "boolean" === type) children = null;
		var invokeCallback = !1;
		if (null === children) invokeCallback = !0;
		else switch (type) {
			case "bigint":
			case "string":
			case "number":
				invokeCallback = !0;
				break;
			case "object": switch (children.$$typeof) {
				case REACT_ELEMENT_TYPE:
				case REACT_PORTAL_TYPE:
					invokeCallback = !0;
					break;
				case REACT_LAZY_TYPE: return invokeCallback = children._init, mapIntoArray(invokeCallback(children._payload), array, escapedPrefix, nameSoFar, callback);
			}
		}
		if (invokeCallback) return callback = callback(children), invokeCallback = "" === nameSoFar ? "." + getElementKey(children, 0) : nameSoFar, isArrayImpl(callback) ? (escapedPrefix = "", null != invokeCallback && (escapedPrefix = invokeCallback.replace(userProvidedKeyEscapeRegex, "$&/") + "/"), mapIntoArray(callback, array, escapedPrefix, "", function(c) {
			return c;
		})) : null != callback && (isValidElement(callback) && (callback = cloneAndReplaceKey(callback, escapedPrefix + (null == callback.key || children && children.key === callback.key ? "" : ("" + callback.key).replace(userProvidedKeyEscapeRegex, "$&/") + "/") + invokeCallback)), array.push(callback)), 1;
		invokeCallback = 0;
		var nextNamePrefix = "" === nameSoFar ? "." : nameSoFar + ":";
		if (isArrayImpl(children)) for (var i = 0; i < children.length; i++) nameSoFar = children[i], type = nextNamePrefix + getElementKey(nameSoFar, i), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if (i = getIteratorFn(children), "function" === typeof i) for (children = i.call(children), i = 0; !(nameSoFar = children.next()).done;) nameSoFar = nameSoFar.value, type = nextNamePrefix + getElementKey(nameSoFar, i++), invokeCallback += mapIntoArray(nameSoFar, array, escapedPrefix, type, callback);
		else if ("object" === type) {
			if ("function" === typeof children.then) return mapIntoArray(resolveThenable(children), array, escapedPrefix, nameSoFar, callback);
			array = String(children);
			throw Error("Objects are not valid as a React child (found: " + ("[object Object]" === array ? "object with keys {" + Object.keys(children).join(", ") + "}" : array) + "). If you meant to render a collection of children, use an array instead.");
		}
		return invokeCallback;
	}
	function mapChildren(children, func, context) {
		if (null == children) return children;
		var result = [], count = 0;
		mapIntoArray(children, result, "", "", function(child) {
			return func.call(context, child, count++);
		});
		return result;
	}
	function lazyInitializer(payload) {
		if (-1 === payload._status) {
			var ctor = payload._result;
			ctor = ctor();
			ctor.then(function(moduleObject) {
				if (0 === payload._status || -1 === payload._status) payload._status = 1, payload._result = moduleObject;
			}, function(error) {
				if (0 === payload._status || -1 === payload._status) payload._status = 2, payload._result = error;
			});
			-1 === payload._status && (payload._status = 0, payload._result = ctor);
		}
		if (1 === payload._status) return payload._result.default;
		throw payload._result;
	}
	var reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
			var event = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
				error
			});
			if (!window.dispatchEvent(event)) return;
		} else if ("object" === typeof process && "function" === typeof process.emit) {
			process.emit("uncaughtException", error);
			return;
		}
		console.error(error);
	}, Children = {
		map: mapChildren,
		forEach: function(children, forEachFunc, forEachContext) {
			mapChildren(children, function() {
				forEachFunc.apply(this, arguments);
			}, forEachContext);
		},
		count: function(children) {
			var n = 0;
			mapChildren(children, function() {
				n++;
			});
			return n;
		},
		toArray: function(children) {
			return mapChildren(children, function(child) {
				return child;
			}) || [];
		},
		only: function(children) {
			if (!isValidElement(children)) throw Error("React.Children.only expected to receive a single React element child.");
			return children;
		}
	};
	exports.Activity = REACT_ACTIVITY_TYPE;
	exports.Children = Children;
	exports.Component = Component;
	exports.Fragment = REACT_FRAGMENT_TYPE;
	exports.Profiler = REACT_PROFILER_TYPE;
	exports.PureComponent = PureComponent;
	exports.StrictMode = REACT_STRICT_MODE_TYPE;
	exports.Suspense = REACT_SUSPENSE_TYPE;
	exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = ReactSharedInternals;
	exports.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(size) {
			return ReactSharedInternals.H.useMemoCache(size);
		}
	};
	exports.cache = function(fn) {
		return function() {
			return fn.apply(null, arguments);
		};
	};
	exports.cacheSignal = function() {
		return null;
	};
	exports.cloneElement = function(element, config, children) {
		if (null === element || void 0 === element) throw Error("The argument must be a React element, but you passed " + element + ".");
		var props = assign({}, element.props), key = element.key;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) !hasOwnProperty.call(config, propName) || "key" === propName || "__self" === propName || "__source" === propName || "ref" === propName && void 0 === config.ref || (props[propName] = config[propName]);
		var propName = arguments.length - 2;
		if (1 === propName) props.children = children;
		else if (1 < propName) {
			for (var childArray = Array(propName), i = 0; i < propName; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		return ReactElement(element.type, key, props);
	};
	exports.createContext = function(defaultValue) {
		defaultValue = {
			$$typeof: REACT_CONTEXT_TYPE,
			_currentValue: defaultValue,
			_currentValue2: defaultValue,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		};
		defaultValue.Provider = defaultValue;
		defaultValue.Consumer = {
			$$typeof: REACT_CONSUMER_TYPE,
			_context: defaultValue
		};
		return defaultValue;
	};
	exports.createElement = function(type, config, children) {
		var propName, props = {}, key = null;
		if (null != config) for (propName in void 0 !== config.key && (key = "" + config.key), config) hasOwnProperty.call(config, propName) && "key" !== propName && "__self" !== propName && "__source" !== propName && (props[propName] = config[propName]);
		var childrenLength = arguments.length - 2;
		if (1 === childrenLength) props.children = children;
		else if (1 < childrenLength) {
			for (var childArray = Array(childrenLength), i = 0; i < childrenLength; i++) childArray[i] = arguments[i + 2];
			props.children = childArray;
		}
		if (type && type.defaultProps) for (propName in childrenLength = type.defaultProps, childrenLength) void 0 === props[propName] && (props[propName] = childrenLength[propName]);
		return ReactElement(type, key, props);
	};
	exports.createRef = function() {
		return { current: null };
	};
	exports.forwardRef = function(render) {
		return {
			$$typeof: REACT_FORWARD_REF_TYPE,
			render
		};
	};
	exports.isValidElement = isValidElement;
	exports.lazy = function(ctor) {
		return {
			$$typeof: REACT_LAZY_TYPE,
			_payload: {
				_status: -1,
				_result: ctor
			},
			_init: lazyInitializer
		};
	};
	exports.memo = function(type, compare) {
		return {
			$$typeof: REACT_MEMO_TYPE,
			type,
			compare: void 0 === compare ? null : compare
		};
	};
	exports.startTransition = function(scope) {
		var prevTransition = ReactSharedInternals.T, currentTransition = {};
		ReactSharedInternals.T = currentTransition;
		try {
			var returnValue = scope(), onStartTransitionFinish = ReactSharedInternals.S;
			null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
			"object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && returnValue.then(noop, reportGlobalError);
		} catch (error) {
			reportGlobalError(error);
		} finally {
			null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		}
	};
	exports.unstable_useCacheRefresh = function() {
		return ReactSharedInternals.H.useCacheRefresh();
	};
	exports.use = function(usable) {
		return ReactSharedInternals.H.use(usable);
	};
	exports.useActionState = function(action, initialState, permalink) {
		return ReactSharedInternals.H.useActionState(action, initialState, permalink);
	};
	exports.useCallback = function(callback, deps) {
		return ReactSharedInternals.H.useCallback(callback, deps);
	};
	exports.useContext = function(Context) {
		return ReactSharedInternals.H.useContext(Context);
	};
	exports.useDebugValue = function() {};
	exports.useDeferredValue = function(value, initialValue) {
		return ReactSharedInternals.H.useDeferredValue(value, initialValue);
	};
	exports.useEffect = function(create, deps) {
		return ReactSharedInternals.H.useEffect(create, deps);
	};
	exports.useEffectEvent = function(callback) {
		return ReactSharedInternals.H.useEffectEvent(callback);
	};
	exports.useId = function() {
		return ReactSharedInternals.H.useId();
	};
	exports.useImperativeHandle = function(ref, create, deps) {
		return ReactSharedInternals.H.useImperativeHandle(ref, create, deps);
	};
	exports.useInsertionEffect = function(create, deps) {
		return ReactSharedInternals.H.useInsertionEffect(create, deps);
	};
	exports.useLayoutEffect = function(create, deps) {
		return ReactSharedInternals.H.useLayoutEffect(create, deps);
	};
	exports.useMemo = function(create, deps) {
		return ReactSharedInternals.H.useMemo(create, deps);
	};
	exports.useOptimistic = function(passthrough, reducer) {
		return ReactSharedInternals.H.useOptimistic(passthrough, reducer);
	};
	exports.useReducer = function(reducer, initialArg, init) {
		return ReactSharedInternals.H.useReducer(reducer, initialArg, init);
	};
	exports.useRef = function(initialValue) {
		return ReactSharedInternals.H.useRef(initialValue);
	};
	exports.useState = function(initialState) {
		return ReactSharedInternals.H.useState(initialState);
	};
	exports.useSyncExternalStore = function(subscribe, getSnapshot, getServerSnapshot) {
		return ReactSharedInternals.H.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	};
	exports.useTransition = function() {
		return ReactSharedInternals.H.useTransition();
	};
	exports.version = "19.2.4";
}));
//#endregion
//#region node_modules/react/index.js
var require_react = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_react_production();
}));
//#endregion
//#region node_modules/convex/dist/esm/values/base64.js
var lookup = [];
var revLookup = [];
var Arr = Uint8Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (var i = 0, len = code.length; i < len; ++i) {
	lookup[i] = code[i];
	revLookup[code.charCodeAt(i)] = i;
}
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
	var len = b64.length;
	if (len % 4 > 0) throw new Error("Invalid string. Length must be a multiple of 4");
	var validLen = b64.indexOf("=");
	if (validLen === -1) validLen = len;
	var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
	return [validLen, placeHoldersLen];
}
function _byteLength(_b64, validLen, placeHoldersLen) {
	return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
	var tmp;
	var lens = getLens(b64);
	var validLen = lens[0];
	var placeHoldersLen = lens[1];
	var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));
	var curByte = 0;
	var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
	var i;
	for (i = 0; i < len; i += 4) {
		tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
		arr[curByte++] = tmp >> 16 & 255;
		arr[curByte++] = tmp >> 8 & 255;
		arr[curByte++] = tmp & 255;
	}
	if (placeHoldersLen === 2) {
		tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
		arr[curByte++] = tmp & 255;
	}
	if (placeHoldersLen === 1) {
		tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
		arr[curByte++] = tmp >> 8 & 255;
		arr[curByte++] = tmp & 255;
	}
	return arr;
}
function tripletToBase64(num) {
	return lookup[num >> 18 & 63] + lookup[num >> 12 & 63] + lookup[num >> 6 & 63] + lookup[num & 63];
}
function encodeChunk(uint8, start, end) {
	var tmp;
	var output = [];
	for (var i = start; i < end; i += 3) {
		tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
		output.push(tripletToBase64(tmp));
	}
	return output.join("");
}
function fromByteArray(uint8) {
	var tmp;
	var len = uint8.length;
	var extraBytes = len % 3;
	var parts = [];
	var maxChunkLength = 16383;
	for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
	if (extraBytes === 1) {
		tmp = uint8[len - 1];
		parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
	} else if (extraBytes === 2) {
		tmp = (uint8[len - 2] << 8) + uint8[len - 1];
		parts.push(lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "=");
	}
	return parts.join("");
}
//#endregion
//#region node_modules/convex/dist/esm/common/index.js
function parseArgs(args) {
	if (args === void 0) return {};
	if (!isSimpleObject(args)) throw new Error(`The arguments to a Convex function must be an object. Received: ${args}`);
	return args;
}
function validateDeploymentUrl(deploymentUrl) {
	if (typeof deploymentUrl === "undefined") throw new Error(`Client created with undefined deployment address. If you used an environment variable, check that it's set.`);
	if (typeof deploymentUrl !== "string") throw new Error(`Invalid deployment address: found ${deploymentUrl}".`);
	if (!(deploymentUrl.startsWith("http:") || deploymentUrl.startsWith("https:"))) throw new Error(`Invalid deployment address: Must start with "https://" or "http://". Found "${deploymentUrl}".`);
	try {
		new URL(deploymentUrl);
	} catch {
		throw new Error(`Invalid deployment address: "${deploymentUrl}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`);
	}
	if (deploymentUrl.endsWith(".convex.site")) throw new Error(`Invalid deployment address: "${deploymentUrl}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`);
}
function isSimpleObject(value) {
	const isObject = typeof value === "object";
	const prototype = Object.getPrototypeOf(value);
	const isSimple = prototype === null || prototype === Object.prototype || prototype?.constructor?.name === "Object";
	return isObject && isSimple;
}
//#endregion
//#region node_modules/convex/dist/esm/values/value.js
var LITTLE_ENDIAN = true;
var MIN_INT64 = BigInt("-9223372036854775808");
var MAX_INT64 = BigInt("9223372036854775807");
var ZERO = BigInt("0");
var EIGHT = BigInt("8");
var TWOFIFTYSIX = BigInt("256");
function isSpecial(n) {
	return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
}
function slowBigIntToBase64(value) {
	if (value < ZERO) value -= MIN_INT64 + MIN_INT64;
	let hex = value.toString(16);
	if (hex.length % 2 === 1) hex = "0" + hex;
	const bytes = new Uint8Array(/* @__PURE__ */ new ArrayBuffer(8));
	let i = 0;
	for (const hexByte of hex.match(/.{2}/g).reverse()) {
		bytes.set([parseInt(hexByte, 16)], i++);
		value >>= EIGHT;
	}
	return fromByteArray(bytes);
}
function slowBase64ToBigInt(encoded) {
	const integerBytes = toByteArray(encoded);
	if (integerBytes.byteLength !== 8) throw new Error(`Received ${integerBytes.byteLength} bytes, expected 8 for $integer`);
	let value = ZERO;
	let power = ZERO;
	for (const byte of integerBytes) {
		value += BigInt(byte) * TWOFIFTYSIX ** power;
		power++;
	}
	if (value > MAX_INT64) value += MIN_INT64 + MIN_INT64;
	return value;
}
function modernBigIntToBase64(value) {
	if (value < MIN_INT64 || MAX_INT64 < value) throw new Error(`BigInt ${value} does not fit into a 64-bit signed integer.`);
	const buffer = /* @__PURE__ */ new ArrayBuffer(8);
	new DataView(buffer).setBigInt64(0, value, true);
	return fromByteArray(new Uint8Array(buffer));
}
function modernBase64ToBigInt(encoded) {
	const integerBytes = toByteArray(encoded);
	if (integerBytes.byteLength !== 8) throw new Error(`Received ${integerBytes.byteLength} bytes, expected 8 for $integer`);
	return new DataView(integerBytes.buffer).getBigInt64(0, true);
}
var bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
var base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
var MAX_IDENTIFIER_LEN = 1024;
function validateObjectField(k) {
	if (k.length > MAX_IDENTIFIER_LEN) throw new Error(`Field name ${k} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`);
	if (k.startsWith("$")) throw new Error(`Field name ${k} starts with a '$', which is reserved.`);
	for (let i = 0; i < k.length; i += 1) {
		const charCode = k.charCodeAt(i);
		if (charCode < 32 || charCode >= 127) throw new Error(`Field name ${k} has invalid character '${k[i]}': Field names can only contain non-control ASCII characters`);
	}
}
function jsonToConvex(value) {
	if (value === null) return value;
	if (typeof value === "boolean") return value;
	if (typeof value === "number") return value;
	if (typeof value === "string") return value;
	if (Array.isArray(value)) return value.map((value2) => jsonToConvex(value2));
	if (typeof value !== "object") throw new Error(`Unexpected type of ${value}`);
	const entries = Object.entries(value);
	if (entries.length === 1) {
		const key = entries[0][0];
		if (key === "$bytes") {
			if (typeof value.$bytes !== "string") throw new Error(`Malformed $bytes field on ${value}`);
			return toByteArray(value.$bytes).buffer;
		}
		if (key === "$integer") {
			if (typeof value.$integer !== "string") throw new Error(`Malformed $integer field on ${value}`);
			return base64ToBigInt(value.$integer);
		}
		if (key === "$float") {
			if (typeof value.$float !== "string") throw new Error(`Malformed $float field on ${value}`);
			const floatBytes = toByteArray(value.$float);
			if (floatBytes.byteLength !== 8) throw new Error(`Received ${floatBytes.byteLength} bytes, expected 8 for $float`);
			const float = new DataView(floatBytes.buffer).getFloat64(0, LITTLE_ENDIAN);
			if (!isSpecial(float)) throw new Error(`Float ${float} should be encoded as a number`);
			return float;
		}
		if (key === "$set") throw new Error(`Received a Set which is no longer supported as a Convex type.`);
		if (key === "$map") throw new Error(`Received a Map which is no longer supported as a Convex type.`);
	}
	const out = {};
	for (const [k, v] of Object.entries(value)) {
		validateObjectField(k);
		out[k] = jsonToConvex(v);
	}
	return out;
}
var MAX_VALUE_FOR_ERROR_LEN = 16384;
function stringifyValueForError(value) {
	const str = JSON.stringify(value, (_key, value2) => {
		if (value2 === void 0) return "undefined";
		if (typeof value2 === "bigint") return `${value2.toString()}n`;
		return value2;
	});
	if (str.length > MAX_VALUE_FOR_ERROR_LEN) {
		const rest = "[...truncated]";
		let truncateAt = MAX_VALUE_FOR_ERROR_LEN - 14;
		const codePoint = str.codePointAt(truncateAt - 1);
		if (codePoint !== void 0 && codePoint > 65535) truncateAt -= 1;
		return str.substring(0, truncateAt) + rest;
	}
	return str;
}
function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
	if (value === void 0) {
		const contextText = context && ` (present at path ${context} in original object ${stringifyValueForError(originalValue)})`;
		throw new Error(`undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`);
	}
	if (value === null) return value;
	if (typeof value === "bigint") {
		if (value < MIN_INT64 || MAX_INT64 < value) throw new Error(`BigInt ${value} does not fit into a 64-bit signed integer.`);
		return { $integer: bigIntToBase64(value) };
	}
	if (typeof value === "number") if (isSpecial(value)) {
		const buffer = /* @__PURE__ */ new ArrayBuffer(8);
		new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
		return { $float: fromByteArray(new Uint8Array(buffer)) };
	} else return value;
	if (typeof value === "boolean") return value;
	if (typeof value === "string") return value;
	if (value instanceof ArrayBuffer) return { $bytes: fromByteArray(new Uint8Array(value)) };
	if (Array.isArray(value)) return value.map((value2, i) => convexToJsonInternal(value2, originalValue, context + `[${i}]`, false));
	if (value instanceof Set) throw new Error(errorMessageForUnsupportedType(context, "Set", [...value], originalValue));
	if (value instanceof Map) throw new Error(errorMessageForUnsupportedType(context, "Map", [...value], originalValue));
	if (!isSimpleObject(value)) {
		const theType = value?.constructor?.name;
		const typeName = theType ? `${theType} ` : "";
		throw new Error(errorMessageForUnsupportedType(context, typeName, value, originalValue));
	}
	const out = {};
	const entries = Object.entries(value);
	entries.sort(([k1, _v1], [k2, _v2]) => k1 === k2 ? 0 : k1 < k2 ? -1 : 1);
	for (const [k, v] of entries) if (v !== void 0) {
		validateObjectField(k);
		out[k] = convexToJsonInternal(v, originalValue, context + `.${k}`, false);
	} else if (includeTopLevelUndefined) {
		validateObjectField(k);
		out[k] = convexOrUndefinedToJsonInternal(v, originalValue, context + `.${k}`);
	}
	return out;
}
function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
	if (context) return `${typeName}${stringifyValueForError(value)} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(originalValue)}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
	else return `${typeName}${stringifyValueForError(value)} is not a supported Convex type.`;
}
function convexOrUndefinedToJsonInternal(value, originalValue, context) {
	if (value === void 0) return { $undefined: null };
	else {
		if (originalValue === void 0) throw new Error(`Programming error. Current value is ${stringifyValueForError(value)} but original value is undefined`);
		return convexToJsonInternal(value, originalValue, context, false);
	}
}
function convexToJson(value) {
	return convexToJsonInternal(value, value, "", false);
}
//#endregion
//#region node_modules/convex/dist/esm/values/errors.js
var __defProp$14 = Object.defineProperty;
var __defNormalProp$13 = (obj, key, value) => key in obj ? __defProp$14(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$13 = (obj, key, value) => __defNormalProp$13(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a, _b;
var IDENTIFYING_FIELD = Symbol.for("ConvexError");
var ConvexError = class extends (_b = Error, _a = IDENTIFYING_FIELD, _b) {
	constructor(data) {
		super(typeof data === "string" ? data : stringifyValueForError(data));
		__publicField$13(this, "name", "ConvexError");
		__publicField$13(this, "data");
		__publicField$13(this, _a, true);
		this.data = data;
	}
};
//#endregion
//#region node_modules/convex/dist/esm/index.js
var version = "1.41.0";
//#endregion
//#region node_modules/convex/dist/esm/server/functionName.js
var functionName = Symbol.for("functionName");
//#endregion
//#region node_modules/convex/dist/esm/server/components/paths.js
var toReferencePath = Symbol.for("toReferencePath");
function extractReferencePath(reference) {
	return reference[toReferencePath] ?? null;
}
function isFunctionHandle(s) {
	return s.startsWith("function://");
}
function getFunctionAddress(functionReference) {
	let functionAddress;
	if (typeof functionReference === "string") if (isFunctionHandle(functionReference)) functionAddress = { functionHandle: functionReference };
	else functionAddress = { name: functionReference };
	else if (functionReference[functionName]) functionAddress = { name: functionReference[functionName] };
	else {
		const referencePath = extractReferencePath(functionReference);
		if (!referencePath) throw new Error(`${functionReference} is not a functionReference`);
		functionAddress = { reference: referencePath };
	}
	return functionAddress;
}
//#endregion
//#region node_modules/convex/dist/esm/server/api.js
function getFunctionName(functionReference) {
	const address = getFunctionAddress(functionReference);
	if (address.name === void 0) {
		if (address.functionHandle !== void 0) throw new Error(`Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${address.functionHandle}`);
		else if (address.reference !== void 0) throw new Error(`Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${address.reference}`);
		throw new Error(`Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(address)}`);
	}
	if (typeof functionReference === "string") return functionReference;
	const name = functionReference[functionName];
	if (!name) throw new Error(`${functionReference} is not a functionReference`);
	return name;
}
function makeFunctionReference(name) {
	return { [functionName]: name };
}
function createApi(pathParts = []) {
	return new Proxy({}, { get(_, prop) {
		if (typeof prop === "string") return createApi([...pathParts, prop]);
		else if (prop === functionName) {
			if (pathParts.length < 2) {
				const found = ["api", ...pathParts].join(".");
				throw new Error(`API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``);
			}
			const path = pathParts.slice(0, -1).join("/");
			const exportName = pathParts[pathParts.length - 1];
			if (exportName === "default") return path;
			else return path + ":" + exportName;
		} else if (prop === Symbol.toStringTag) return "FunctionReference";
		else return;
	} });
}
var anyApi = createApi();
//#endregion
//#region node_modules/convex/dist/esm/browser/logging.js
var __defProp$13 = Object.defineProperty;
var __defNormalProp$12 = (obj, key, value) => key in obj ? __defProp$13(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$12 = (obj, key, value) => __defNormalProp$12(obj, typeof key !== "symbol" ? key + "" : key, value);
var INFO_COLOR = "color:rgb(0, 145, 255)";
function prefix_for_source(source) {
	switch (source) {
		case "query": return "Q";
		case "mutation": return "M";
		case "action": return "A";
		case "any": return "?";
	}
}
var DefaultLogger = class {
	constructor(options) {
		__publicField$12(this, "_onLogLineFuncs");
		__publicField$12(this, "_verbose");
		this._onLogLineFuncs = {};
		this._verbose = options.verbose;
	}
	addLogLineListener(func) {
		let id = Math.random().toString(36).substring(2, 15);
		for (let i = 0; i < 10; i++) {
			if (this._onLogLineFuncs[id] === void 0) break;
			id = Math.random().toString(36).substring(2, 15);
		}
		this._onLogLineFuncs[id] = func;
		return () => {
			delete this._onLogLineFuncs[id];
		};
	}
	logVerbose(...args) {
		if (this._verbose) for (const func of Object.values(this._onLogLineFuncs)) func("debug", `${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
	}
	log(...args) {
		for (const func of Object.values(this._onLogLineFuncs)) func("info", ...args);
	}
	warn(...args) {
		for (const func of Object.values(this._onLogLineFuncs)) func("warn", ...args);
	}
	error(...args) {
		for (const func of Object.values(this._onLogLineFuncs)) func("error", ...args);
	}
};
function instantiateDefaultLogger(options) {
	const logger = new DefaultLogger(options);
	logger.addLogLineListener((level, ...args) => {
		switch (level) {
			case "debug":
				console.debug(...args);
				break;
			case "info":
				console.log(...args);
				break;
			case "warn":
				console.warn(...args);
				break;
			case "error":
				console.error(...args);
				break;
			default: console.log(...args);
		}
	});
	return logger;
}
function instantiateNoopLogger(options) {
	return new DefaultLogger(options);
}
function logForFunction(logger, type, source, udfPath, message) {
	const prefix = prefix_for_source(source);
	if (typeof message === "object") message = `ConvexError ${JSON.stringify(message.errorData, null, 2)}`;
	if (type === "info") {
		const match = message.match(/^\[.*?\] /);
		if (match === null) {
			logger.error(`[CONVEX ${prefix}(${udfPath})] Could not parse console.log`);
			return;
		}
		const level = message.slice(1, match[0].length - 2);
		const args = message.slice(match[0].length);
		logger.log(`%c[CONVEX ${prefix}(${udfPath})] [${level}]`, INFO_COLOR, args);
	} else logger.error(`[CONVEX ${prefix}(${udfPath})] ${message}`);
}
function logFatalError(logger, message) {
	const errorMessage = `[CONVEX FATAL ERROR] ${message}`;
	logger.error(errorMessage);
	return new Error(errorMessage);
}
function createHybridErrorStacktrace(source, udfPath, result) {
	return `[CONVEX ${prefix_for_source(source)}(${udfPath})] ${result.errorMessage}
  Called by client`;
}
function forwardData(result, error) {
	error.data = result.errorData;
	return error;
}
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/udf_path_utils.js
function canonicalizeUdfPath(udfPath) {
	const pieces = udfPath.split(":");
	let moduleName;
	let functionName;
	if (pieces.length === 1) {
		moduleName = pieces[0];
		functionName = "default";
	} else {
		moduleName = pieces.slice(0, pieces.length - 1).join(":");
		functionName = pieces[pieces.length - 1];
	}
	if (moduleName.endsWith(".js")) moduleName = moduleName.slice(0, -3);
	return `${moduleName}:${functionName}`;
}
function serializePathAndArgs(udfPath, args) {
	return JSON.stringify({
		udfPath: canonicalizeUdfPath(udfPath),
		args: convexToJson(args)
	});
}
function serializePaginatedPathAndArgs(udfPath, args, options) {
	const { initialNumItems, id } = options;
	return JSON.stringify({
		type: "paginated",
		udfPath: canonicalizeUdfPath(udfPath),
		args: convexToJson(args),
		options: convexToJson({
			initialNumItems,
			id
		})
	});
}
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/local_state.js
var __defProp$12 = Object.defineProperty;
var __defNormalProp$11 = (obj, key, value) => key in obj ? __defProp$12(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$11 = (obj, key, value) => __defNormalProp$11(obj, typeof key !== "symbol" ? key + "" : key, value);
var LocalSyncState = class {
	constructor() {
		__publicField$11(this, "nextQueryId");
		__publicField$11(this, "querySetVersion");
		__publicField$11(this, "querySet");
		__publicField$11(this, "queryIdToToken");
		__publicField$11(this, "identityVersion");
		__publicField$11(this, "auth");
		__publicField$11(this, "outstandingQueriesOlderThanRestart");
		__publicField$11(this, "outstandingAuthOlderThanRestart");
		__publicField$11(this, "paused");
		__publicField$11(this, "pendingQuerySetModifications");
		this.nextQueryId = 0;
		this.querySetVersion = 0;
		this.identityVersion = 0;
		this.querySet = /* @__PURE__ */ new Map();
		this.queryIdToToken = /* @__PURE__ */ new Map();
		this.outstandingQueriesOlderThanRestart = /* @__PURE__ */ new Set();
		this.outstandingAuthOlderThanRestart = false;
		this.paused = false;
		this.pendingQuerySetModifications = /* @__PURE__ */ new Map();
	}
	hasSyncedPastLastReconnect() {
		return this.outstandingQueriesOlderThanRestart.size === 0 && !this.outstandingAuthOlderThanRestart;
	}
	markAuthCompletion() {
		this.outstandingAuthOlderThanRestart = false;
	}
	subscribe(udfPath, args, journal, componentPath) {
		const canonicalizedUdfPath = canonicalizeUdfPath(udfPath);
		const queryToken = serializePathAndArgs(canonicalizedUdfPath, args);
		const existingEntry = this.querySet.get(queryToken);
		if (existingEntry !== void 0) {
			existingEntry.numSubscribers += 1;
			return {
				queryToken,
				modification: null,
				unsubscribe: () => this.removeSubscriber(queryToken)
			};
		} else {
			const queryId = this.nextQueryId++;
			const query = {
				id: queryId,
				canonicalizedUdfPath,
				args,
				numSubscribers: 1,
				journal,
				componentPath
			};
			this.querySet.set(queryToken, query);
			this.queryIdToToken.set(queryId, queryToken);
			const baseVersion = this.querySetVersion;
			const newVersion = this.querySetVersion + 1;
			const add = {
				type: "Add",
				queryId,
				udfPath: canonicalizedUdfPath,
				args: [convexToJson(args)],
				journal,
				componentPath
			};
			if (this.paused) this.pendingQuerySetModifications.set(queryId, add);
			else this.querySetVersion = newVersion;
			return {
				queryToken,
				modification: {
					type: "ModifyQuerySet",
					baseVersion,
					newVersion,
					modifications: [add]
				},
				unsubscribe: () => this.removeSubscriber(queryToken)
			};
		}
	}
	transition(transition) {
		for (const modification of transition.modifications) switch (modification.type) {
			case "QueryUpdated":
			case "QueryFailed": {
				this.outstandingQueriesOlderThanRestart.delete(modification.queryId);
				const journal = modification.journal;
				if (journal !== void 0) {
					const queryToken = this.queryIdToToken.get(modification.queryId);
					if (queryToken !== void 0) this.querySet.get(queryToken).journal = journal;
				}
				break;
			}
			case "QueryRemoved":
				this.outstandingQueriesOlderThanRestart.delete(modification.queryId);
				break;
			default: throw new Error(`Invalid modification ${modification.type}`);
		}
	}
	queryId(udfPath, args) {
		const queryToken = serializePathAndArgs(canonicalizeUdfPath(udfPath), args);
		const existingEntry = this.querySet.get(queryToken);
		if (existingEntry !== void 0) return existingEntry.id;
		return null;
	}
	isCurrentOrNewerAuthVersion(version) {
		return version >= this.identityVersion;
	}
	getAuth() {
		return this.auth;
	}
	setAuth(value) {
		this.auth = {
			tokenType: "User",
			value
		};
		const baseVersion = this.identityVersion;
		if (!this.paused) this.identityVersion = baseVersion + 1;
		return {
			type: "Authenticate",
			baseVersion,
			...this.auth
		};
	}
	setAdminAuth(value, actingAs) {
		const auth = {
			tokenType: "Admin",
			value,
			impersonating: actingAs
		};
		this.auth = auth;
		const baseVersion = this.identityVersion;
		if (!this.paused) this.identityVersion = baseVersion + 1;
		return {
			type: "Authenticate",
			baseVersion,
			...auth
		};
	}
	clearAuth() {
		this.auth = void 0;
		this.markAuthCompletion();
		const baseVersion = this.identityVersion;
		if (!this.paused) this.identityVersion = baseVersion + 1;
		return {
			type: "Authenticate",
			tokenType: "None",
			baseVersion
		};
	}
	hasAuth() {
		return !!this.auth;
	}
	isNewAuth(value) {
		return this.auth?.value !== value;
	}
	queryPath(queryId) {
		const pathAndArgs = this.queryIdToToken.get(queryId);
		if (pathAndArgs) return this.querySet.get(pathAndArgs).canonicalizedUdfPath;
		return null;
	}
	queryArgs(queryId) {
		const pathAndArgs = this.queryIdToToken.get(queryId);
		if (pathAndArgs) return this.querySet.get(pathAndArgs).args;
		return null;
	}
	queryToken(queryId) {
		return this.queryIdToToken.get(queryId) ?? null;
	}
	queryJournal(queryToken) {
		return this.querySet.get(queryToken)?.journal;
	}
	restart() {
		this.unpause();
		this.outstandingQueriesOlderThanRestart.clear();
		const modifications = [];
		for (const localQuery of this.querySet.values()) {
			const add = {
				type: "Add",
				queryId: localQuery.id,
				udfPath: localQuery.canonicalizedUdfPath,
				args: [convexToJson(localQuery.args)],
				journal: localQuery.journal,
				componentPath: localQuery.componentPath
			};
			modifications.push(add);
			this.outstandingQueriesOlderThanRestart.add(localQuery.id);
		}
		this.querySetVersion = 1;
		const querySet = {
			type: "ModifyQuerySet",
			baseVersion: 0,
			newVersion: 1,
			modifications
		};
		if (!this.auth) {
			this.identityVersion = 0;
			return [querySet, void 0];
		}
		this.outstandingAuthOlderThanRestart = true;
		const authenticate = {
			type: "Authenticate",
			baseVersion: 0,
			...this.auth
		};
		this.identityVersion = 1;
		return [querySet, authenticate];
	}
	pause() {
		this.paused = true;
	}
	resume() {
		const querySet = this.pendingQuerySetModifications.size > 0 ? {
			type: "ModifyQuerySet",
			baseVersion: this.querySetVersion,
			newVersion: ++this.querySetVersion,
			modifications: Array.from(this.pendingQuerySetModifications.values())
		} : void 0;
		const authenticate = this.auth !== void 0 ? {
			type: "Authenticate",
			baseVersion: this.identityVersion++,
			...this.auth
		} : void 0;
		this.unpause();
		return [querySet, authenticate];
	}
	unpause() {
		this.paused = false;
		this.pendingQuerySetModifications.clear();
	}
	removeSubscriber(queryToken) {
		const localQuery = this.querySet.get(queryToken);
		if (localQuery.numSubscribers > 1) {
			localQuery.numSubscribers -= 1;
			return null;
		} else {
			this.querySet.delete(queryToken);
			this.queryIdToToken.delete(localQuery.id);
			this.outstandingQueriesOlderThanRestart.delete(localQuery.id);
			const baseVersion = this.querySetVersion;
			const newVersion = this.querySetVersion + 1;
			const remove = {
				type: "Remove",
				queryId: localQuery.id
			};
			if (this.paused) if (this.pendingQuerySetModifications.has(localQuery.id)) this.pendingQuerySetModifications.delete(localQuery.id);
			else this.pendingQuerySetModifications.set(localQuery.id, remove);
			else this.querySetVersion = newVersion;
			return {
				type: "ModifyQuerySet",
				baseVersion,
				newVersion,
				modifications: [remove]
			};
		}
	}
};
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/request_manager.js
var __defProp$11 = Object.defineProperty;
var __defNormalProp$10 = (obj, key, value) => key in obj ? __defProp$11(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$10 = (obj, key, value) => __defNormalProp$10(obj, typeof key !== "symbol" ? key + "" : key, value);
var RequestManager = class {
	constructor(logger, markConnectionStateDirty) {
		this.logger = logger;
		this.markConnectionStateDirty = markConnectionStateDirty;
		__publicField$10(this, "inflightRequests");
		__publicField$10(this, "requestsOlderThanRestart");
		__publicField$10(this, "inflightMutationsCount", 0);
		__publicField$10(this, "inflightActionsCount", 0);
		this.inflightRequests = /* @__PURE__ */ new Map();
		this.requestsOlderThanRestart = /* @__PURE__ */ new Set();
	}
	request(message, sent) {
		const result = new Promise((resolve) => {
			const status = sent ? "Requested" : "NotSent";
			this.inflightRequests.set(message.requestId, {
				message,
				status: {
					status,
					requestedAt: /* @__PURE__ */ new Date(),
					onResult: resolve
				}
			});
			if (message.type === "Mutation") this.inflightMutationsCount++;
			else if (message.type === "Action") this.inflightActionsCount++;
		});
		this.markConnectionStateDirty();
		return result;
	}
	/**
	* Update the state after receiving a response.
	*
	* @returns A RequestId if the request is complete and its optimistic update
	* can be dropped, null otherwise.
	*/
	onResponse(response) {
		const requestInfo = this.inflightRequests.get(response.requestId);
		if (requestInfo === void 0) return null;
		if (requestInfo.status.status === "Completed") return null;
		const udfType = requestInfo.message.type === "Mutation" ? "mutation" : "action";
		const udfPath = requestInfo.message.udfPath;
		for (const line of response.logLines) logForFunction(this.logger, "info", udfType, udfPath, line);
		const status = requestInfo.status;
		let result;
		let onResolve;
		if (response.success) {
			result = {
				success: true,
				logLines: response.logLines,
				value: jsonToConvex(response.result)
			};
			onResolve = () => status.onResult(result);
		} else {
			const errorMessage = response.result;
			const { errorData } = response;
			logForFunction(this.logger, "error", udfType, udfPath, errorMessage);
			result = {
				success: false,
				errorMessage,
				errorData: errorData !== void 0 ? jsonToConvex(errorData) : void 0,
				logLines: response.logLines
			};
			onResolve = () => status.onResult(result);
		}
		if (response.type === "ActionResponse" || !response.success) {
			onResolve();
			this.inflightRequests.delete(response.requestId);
			this.requestsOlderThanRestart.delete(response.requestId);
			if (requestInfo.message.type === "Action") this.inflightActionsCount--;
			else if (requestInfo.message.type === "Mutation") this.inflightMutationsCount--;
			this.markConnectionStateDirty();
			return {
				requestId: response.requestId,
				result
			};
		}
		requestInfo.status = {
			status: "Completed",
			result,
			ts: response.ts,
			onResolve
		};
		return null;
	}
	removeCompleted(ts) {
		const completeRequests = /* @__PURE__ */ new Map();
		for (const [requestId, requestInfo] of this.inflightRequests.entries()) {
			const status = requestInfo.status;
			if (status.status === "Completed" && status.ts.lessThanOrEqual(ts)) {
				status.onResolve();
				completeRequests.set(requestId, status.result);
				if (requestInfo.message.type === "Mutation") this.inflightMutationsCount--;
				else if (requestInfo.message.type === "Action") this.inflightActionsCount--;
				this.inflightRequests.delete(requestId);
				this.requestsOlderThanRestart.delete(requestId);
			}
		}
		if (completeRequests.size > 0) this.markConnectionStateDirty();
		return completeRequests;
	}
	restart() {
		this.requestsOlderThanRestart = new Set(this.inflightRequests.keys());
		const allMessages = [];
		for (const [requestId, value] of this.inflightRequests) {
			if (value.status.status === "NotSent") {
				value.status.status = "Requested";
				allMessages.push(value.message);
				continue;
			}
			if (value.message.type === "Mutation") allMessages.push(value.message);
			else if (value.message.type === "Action") {
				this.inflightRequests.delete(requestId);
				this.requestsOlderThanRestart.delete(requestId);
				this.inflightActionsCount--;
				if (value.status.status === "Completed") throw new Error("Action should never be in 'Completed' state");
				value.status.onResult({
					success: false,
					errorMessage: "Connection lost while action was in flight",
					logLines: []
				});
			}
		}
		this.markConnectionStateDirty();
		return allMessages;
	}
	resume() {
		const allMessages = [];
		for (const [, value] of this.inflightRequests) if (value.status.status === "NotSent") {
			value.status.status = "Requested";
			allMessages.push(value.message);
			continue;
		}
		return allMessages;
	}
	/**
	* @returns true if there are any requests that have been requested but have
	* not be completed yet.
	*/
	hasIncompleteRequests() {
		for (const requestInfo of this.inflightRequests.values()) if (requestInfo.status.status === "Requested") return true;
		return false;
	}
	/**
	* @returns true if there are any inflight requests, including ones that have
	* completed on the server, but have not been applied.
	*/
	hasInflightRequests() {
		return this.inflightRequests.size > 0;
	}
	/**
	* @returns true if there are any inflight requests, that have been hanging around
	* since prior to the most recent restart.
	*/
	hasSyncedPastLastReconnect() {
		return this.requestsOlderThanRestart.size === 0;
	}
	timeOfOldestInflightRequest() {
		if (this.inflightRequests.size === 0) return null;
		let oldestInflightRequest = Date.now();
		for (const request of this.inflightRequests.values()) if (request.status.status !== "Completed") {
			if (request.status.requestedAt.getTime() < oldestInflightRequest) oldestInflightRequest = request.status.requestedAt.getTime();
		}
		return new Date(oldestInflightRequest);
	}
	/**
	* @returns The number of mutations currently in flight.
	*/
	inflightMutations() {
		return this.inflightMutationsCount;
	}
	/**
	* @returns The number of actions currently in flight.
	*/
	inflightActions() {
		return this.inflightActionsCount;
	}
};
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/optimistic_updates_impl.js
var __defProp$10 = Object.defineProperty;
var __defNormalProp$9 = (obj, key, value) => key in obj ? __defProp$10(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$9 = (obj, key, value) => __defNormalProp$9(obj, typeof key !== "symbol" ? key + "" : key, value);
var OptimisticLocalStoreImpl = class OptimisticLocalStoreImpl {
	constructor(queryResults) {
		__publicField$9(this, "queryResults");
		__publicField$9(this, "modifiedQueries");
		this.queryResults = queryResults;
		this.modifiedQueries = [];
	}
	getQuery(query, ...args) {
		const queryArgs = parseArgs(args[0]);
		const name = getFunctionName(query);
		const queryResult = this.queryResults.get(serializePathAndArgs(name, queryArgs));
		if (queryResult === void 0) return;
		return OptimisticLocalStoreImpl.queryValue(queryResult.result);
	}
	getAllQueries(query) {
		const queriesWithName = [];
		const name = getFunctionName(query);
		for (const queryResult of this.queryResults.values()) if (queryResult.udfPath === canonicalizeUdfPath(name)) queriesWithName.push({
			args: queryResult.args,
			value: OptimisticLocalStoreImpl.queryValue(queryResult.result)
		});
		return queriesWithName;
	}
	setQuery(queryReference, args, value) {
		const queryArgs = parseArgs(args);
		const name = getFunctionName(queryReference);
		const queryToken = serializePathAndArgs(name, queryArgs);
		let result;
		if (value === void 0) result = void 0;
		else result = {
			success: true,
			value,
			logLines: []
		};
		const query = {
			udfPath: name,
			args: queryArgs,
			result
		};
		this.queryResults.set(queryToken, query);
		this.modifiedQueries.push(queryToken);
	}
	static queryValue(result) {
		if (result === void 0) return;
		else if (result.success) return result.value;
		else return;
	}
};
var OptimisticQueryResults = class {
	constructor() {
		__publicField$9(this, "queryResults");
		__publicField$9(this, "optimisticUpdates");
		this.queryResults = /* @__PURE__ */ new Map();
		this.optimisticUpdates = [];
	}
	/**
	* Apply all optimistic updates on top of server query results
	*/
	ingestQueryResultsFromServer(serverQueryResults, optimisticUpdatesToDrop) {
		this.optimisticUpdates = this.optimisticUpdates.filter((updateAndId) => {
			return !optimisticUpdatesToDrop.has(updateAndId.mutationId);
		});
		const oldQueryResults = this.queryResults;
		this.queryResults = new Map(serverQueryResults);
		const localStore = new OptimisticLocalStoreImpl(this.queryResults);
		for (const updateAndId of this.optimisticUpdates) updateAndId.update(localStore);
		const changedQueries = [];
		for (const [queryToken, query] of this.queryResults) {
			const oldQuery = oldQueryResults.get(queryToken);
			if (oldQuery === void 0 || oldQuery.result !== query.result) changedQueries.push(queryToken);
		}
		return changedQueries;
	}
	applyOptimisticUpdate(update, mutationId) {
		this.optimisticUpdates.push({
			update,
			mutationId
		});
		const localStore = new OptimisticLocalStoreImpl(this.queryResults);
		update(localStore);
		return localStore.modifiedQueries;
	}
	/**
	* "Raw" with respect to errors vs values, but query results still have
	* optimistic updates applied.
	*
	* @internal
	*/
	rawQueryResult(queryToken) {
		const query = this.queryResults.get(queryToken);
		if (query === void 0) return;
		return query.result;
	}
	queryResult(queryToken) {
		const query = this.queryResults.get(queryToken);
		if (query === void 0) return;
		const result = query.result;
		if (result === void 0) return;
		else if (result.success) return result.value;
		else {
			if (result.errorData !== void 0) throw forwardData(result, new ConvexError(createHybridErrorStacktrace("query", query.udfPath, result)));
			throw new Error(createHybridErrorStacktrace("query", query.udfPath, result));
		}
	}
	hasQueryResult(queryToken) {
		return this.queryResults.get(queryToken) !== void 0;
	}
	/**
	* @internal
	*/
	queryLogs(queryToken) {
		return this.queryResults.get(queryToken)?.result?.logLines;
	}
};
//#endregion
//#region node_modules/convex/dist/esm/vendor/long.js
var __defProp$9 = Object.defineProperty;
var __defNormalProp$8 = (obj, key, value) => key in obj ? __defProp$9(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$8 = (obj, key, value) => __defNormalProp$8(obj, typeof key !== "symbol" ? key + "" : key, value);
var Long = class Long {
	constructor(low, high) {
		__publicField$8(this, "low");
		__publicField$8(this, "high");
		__publicField$8(this, "__isUnsignedLong__");
		this.low = low | 0;
		this.high = high | 0;
		this.__isUnsignedLong__ = true;
	}
	static isLong(obj) {
		return (obj && obj.__isUnsignedLong__) === true;
	}
	static fromBytesLE(bytes) {
		return new Long(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24);
	}
	toBytesLE() {
		const hi = this.high;
		const lo = this.low;
		return [
			lo & 255,
			lo >>> 8 & 255,
			lo >>> 16 & 255,
			lo >>> 24,
			hi & 255,
			hi >>> 8 & 255,
			hi >>> 16 & 255,
			hi >>> 24
		];
	}
	static fromNumber(value) {
		if (isNaN(value)) return UZERO;
		if (value < 0) return UZERO;
		if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
		return new Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0);
	}
	toString() {
		return (BigInt(this.high) * BigInt(TWO_PWR_32_DBL) + BigInt(this.low)).toString();
	}
	equals(other) {
		if (!Long.isLong(other)) other = Long.fromValue(other);
		if (this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
		return this.high === other.high && this.low === other.low;
	}
	notEquals(other) {
		return !this.equals(other);
	}
	comp(other) {
		if (!Long.isLong(other)) other = Long.fromValue(other);
		if (this.equals(other)) return 0;
		return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
	}
	lessThanOrEqual(other) {
		return this.comp(other) <= 0;
	}
	static fromValue(val) {
		if (typeof val === "number") return Long.fromNumber(val);
		return new Long(val.low, val.high);
	}
};
var UZERO = new Long(0, 0);
var TWO_PWR_16_DBL = 65536;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var MAX_UNSIGNED_VALUE = new Long(-1, -1);
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/remote_query_set.js
var __defProp$8 = Object.defineProperty;
var __defNormalProp$7 = (obj, key, value) => key in obj ? __defProp$8(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$7 = (obj, key, value) => __defNormalProp$7(obj, typeof key !== "symbol" ? key + "" : key, value);
var RemoteQuerySet = class {
	constructor(queryPath, logger) {
		__publicField$7(this, "version");
		__publicField$7(this, "remoteQuerySet");
		__publicField$7(this, "queryPath");
		__publicField$7(this, "logger");
		this.version = {
			querySet: 0,
			ts: Long.fromNumber(0),
			identity: 0
		};
		this.remoteQuerySet = /* @__PURE__ */ new Map();
		this.queryPath = queryPath;
		this.logger = logger;
	}
	transition(transition) {
		const start = transition.startVersion;
		if (this.version.querySet !== start.querySet || this.version.ts.notEquals(start.ts) || this.version.identity !== start.identity) throw new Error(`Invalid start version: ${start.ts.toString()}:${start.querySet}:${start.identity}, transitioning from ${this.version.ts.toString()}:${this.version.querySet}:${this.version.identity}`);
		for (const modification of transition.modifications) switch (modification.type) {
			case "QueryUpdated": {
				const queryPath = this.queryPath(modification.queryId);
				if (queryPath) for (const line of modification.logLines) logForFunction(this.logger, "info", "query", queryPath, line);
				const value = jsonToConvex(modification.value ?? null);
				this.remoteQuerySet.set(modification.queryId, {
					success: true,
					value,
					logLines: modification.logLines
				});
				break;
			}
			case "QueryFailed": {
				const queryPath = this.queryPath(modification.queryId);
				if (queryPath) for (const line of modification.logLines) logForFunction(this.logger, "info", "query", queryPath, line);
				const { errorData } = modification;
				this.remoteQuerySet.set(modification.queryId, {
					success: false,
					errorMessage: modification.errorMessage,
					errorData: errorData !== void 0 ? jsonToConvex(errorData) : void 0,
					logLines: modification.logLines
				});
				break;
			}
			case "QueryRemoved":
				this.remoteQuerySet.delete(modification.queryId);
				break;
			default: throw new Error(`Invalid modification ${modification.type}`);
		}
		this.version = transition.endVersion;
	}
	remoteQueryResults() {
		return this.remoteQuerySet;
	}
	timestamp() {
		return this.version.ts;
	}
};
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/protocol.js
function u64ToLong(encoded) {
	const integerBytes = toByteArray(encoded);
	return Long.fromBytesLE(Array.from(integerBytes));
}
function longToU64(raw) {
	return fromByteArray(new Uint8Array(raw.toBytesLE()));
}
function parseServerMessage(encoded) {
	switch (encoded.type) {
		case "FatalError":
		case "AuthError":
		case "ActionResponse":
		case "TransitionChunk":
		case "Ping": return { ...encoded };
		case "MutationResponse": if (encoded.success) return {
			...encoded,
			ts: u64ToLong(encoded.ts)
		};
		else return { ...encoded };
		case "Transition": return {
			...encoded,
			startVersion: {
				...encoded.startVersion,
				ts: u64ToLong(encoded.startVersion.ts)
			},
			endVersion: {
				...encoded.endVersion,
				ts: u64ToLong(encoded.endVersion.ts)
			}
		};
		default:
	}
}
function encodeClientMessage(message) {
	switch (message.type) {
		case "Authenticate":
		case "ModifyQuerySet":
		case "Mutation":
		case "Action":
		case "Event": return { ...message };
		case "Connect": if (message.maxObservedTimestamp !== void 0) return {
			...message,
			maxObservedTimestamp: longToU64(message.maxObservedTimestamp)
		};
		else return {
			...message,
			maxObservedTimestamp: void 0
		};
		default:
	}
}
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/web_socket_manager.js
var __defProp$7 = Object.defineProperty;
var __defNormalProp$6 = (obj, key, value) => key in obj ? __defProp$7(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$6 = (obj, key, value) => __defNormalProp$6(obj, typeof key !== "symbol" ? key + "" : key, value);
var CLOSE_NORMAL = 1e3;
var CLOSE_GOING_AWAY = 1001;
var CLOSE_NO_STATUS = 1005;
var CLOSE_NOT_FOUND = 4040;
var firstTime;
function monotonicMillis() {
	if (firstTime === void 0) firstTime = Date.now();
	if (typeof performance === "undefined" || !performance.now) return Date.now();
	return Math.round(firstTime + performance.now());
}
function prettyNow() {
	return `t=${Math.round((monotonicMillis() - firstTime) / 100) / 10}s`;
}
var serverDisconnectErrors = {
	InternalServerError: { timeout: 1e3 },
	SubscriptionsWorkerFullError: { timeout: 3e3 },
	TooManyConcurrentRequests: { timeout: 3e3 },
	CommitterFullError: { timeout: 3e3 },
	AwsTooManyRequestsException: { timeout: 3e3 },
	ExecuteFullError: { timeout: 3e3 },
	SystemTimeoutError: { timeout: 3e3 },
	ExpiredInQueue: { timeout: 3e3 },
	VectorIndexesUnavailable: { timeout: 1e3 },
	SearchIndexesUnavailable: { timeout: 1e3 },
	TableSummariesUnavailable: { timeout: 1e3 },
	VectorIndexTooLarge: { timeout: 3e3 },
	SearchIndexTooLarge: { timeout: 3e3 },
	TooManyWritesInTimePeriod: { timeout: 3e3 }
};
function classifyDisconnectError(s) {
	if (s === void 0) return "Unknown";
	for (const prefix of Object.keys(serverDisconnectErrors)) if (s.startsWith(prefix)) return prefix;
	return "Unknown";
}
var WebSocketManager = class {
	constructor(uri, callbacks, webSocketConstructor, logger, markConnectionStateDirty, debug) {
		this.markConnectionStateDirty = markConnectionStateDirty;
		this.debug = debug;
		__publicField$6(this, "socket");
		__publicField$6(this, "connectionCount");
		__publicField$6(this, "_hasEverConnected", false);
		__publicField$6(this, "lastCloseReason");
		__publicField$6(this, "transitionChunkBuffer", null);
		/** Upon HTTPS/WSS failure, the first jittered backoff duration, in ms. */
		__publicField$6(this, "defaultInitialBackoff");
		/** We backoff exponentially, but we need to cap that--this is the jittered max. */
		__publicField$6(this, "maxBackoff");
		/** How many times have we failed consecutively? */
		__publicField$6(this, "retries");
		/** How long before lack of server response causes us to initiate a reconnect,
		* in ms */
		__publicField$6(this, "serverInactivityThreshold");
		__publicField$6(this, "reconnectDueToServerInactivityTimeout");
		/** Scheduled reconnect state: timeout handle and timing info */
		__publicField$6(this, "scheduledReconnect", null);
		__publicField$6(this, "networkOnlineHandler", null);
		/** Pending event to send after reconnecting due to network recovery */
		__publicField$6(this, "pendingNetworkRecoveryInfo", null);
		__publicField$6(this, "uri");
		__publicField$6(this, "onOpen");
		__publicField$6(this, "onResume");
		__publicField$6(this, "onMessage");
		__publicField$6(this, "webSocketConstructor");
		__publicField$6(this, "logger");
		__publicField$6(this, "onServerDisconnectError");
		this.webSocketConstructor = webSocketConstructor;
		this.socket = { state: "disconnected" };
		this.connectionCount = 0;
		this.lastCloseReason = "InitialConnect";
		this.defaultInitialBackoff = 1e3;
		this.maxBackoff = 16e3;
		this.retries = 0;
		this.serverInactivityThreshold = 6e4;
		this.reconnectDueToServerInactivityTimeout = null;
		this.uri = uri;
		this.onOpen = callbacks.onOpen;
		this.onResume = callbacks.onResume;
		this.onMessage = callbacks.onMessage;
		this.onServerDisconnectError = callbacks.onServerDisconnectError;
		this.logger = logger;
		this.setupNetworkListener();
		this.connect();
	}
	setSocketState(state) {
		this.socket = state;
		this._logVerbose(`socket state changed: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}`);
		this.markConnectionStateDirty();
	}
	setupNetworkListener() {
		if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
		if (this.networkOnlineHandler !== null) return;
		this.networkOnlineHandler = () => {
			this._logVerbose("network online event detected");
			this.tryReconnectImmediately();
		};
		window.addEventListener("online", this.networkOnlineHandler);
		this._logVerbose("network online event listener registered");
	}
	cleanupNetworkListener() {
		if (this.networkOnlineHandler && typeof window !== "undefined" && typeof window.removeEventListener === "function") {
			window.removeEventListener("online", this.networkOnlineHandler);
			this.networkOnlineHandler = null;
			this._logVerbose("network online event listener removed");
		}
	}
	assembleTransition(chunk) {
		if (chunk.partNumber < 0 || chunk.partNumber >= chunk.totalParts || chunk.totalParts === 0 || this.transitionChunkBuffer && (this.transitionChunkBuffer.totalParts !== chunk.totalParts || this.transitionChunkBuffer.transitionId !== chunk.transitionId)) {
			this.transitionChunkBuffer = null;
			throw new Error("Invalid TransitionChunk");
		}
		if (this.transitionChunkBuffer === null) this.transitionChunkBuffer = {
			chunks: [],
			totalParts: chunk.totalParts,
			transitionId: chunk.transitionId
		};
		if (chunk.partNumber !== this.transitionChunkBuffer.chunks.length) {
			const expectedLength = this.transitionChunkBuffer.chunks.length;
			this.transitionChunkBuffer = null;
			throw new Error(`TransitionChunk received out of order: expected part ${expectedLength}, got ${chunk.partNumber}`);
		}
		this.transitionChunkBuffer.chunks.push(chunk.chunk);
		if (this.transitionChunkBuffer.chunks.length === chunk.totalParts) {
			const fullJson = this.transitionChunkBuffer.chunks.join("");
			this.transitionChunkBuffer = null;
			const transition = parseServerMessage(JSON.parse(fullJson));
			if (transition.type !== "Transition") throw new Error(`Expected Transition, got ${transition.type} after assembling chunks`);
			return transition;
		}
		return null;
	}
	connect() {
		if (this.socket.state === "terminated") return;
		if (this.socket.state !== "disconnected" && this.socket.state !== "stopped") throw new Error("Didn't start connection from disconnected state: " + this.socket.state);
		const ws = new this.webSocketConstructor(this.uri);
		this._logVerbose("constructed WebSocket");
		this.setSocketState({
			state: "connecting",
			ws,
			paused: "no"
		});
		this.resetServerInactivityTimeout();
		ws.onopen = () => {
			this.logger.logVerbose("begin ws.onopen");
			if (this.socket.state !== "connecting") throw new Error("onopen called with socket not in connecting state");
			this.setSocketState({
				state: "ready",
				ws,
				paused: this.socket.paused === "yes" ? "uninitialized" : "no"
			});
			this.resetServerInactivityTimeout();
			if (this.socket.paused === "no") {
				this._hasEverConnected = true;
				this.onOpen({
					connectionCount: this.connectionCount,
					lastCloseReason: this.lastCloseReason,
					clientTs: monotonicMillis()
				});
			}
			if (this.lastCloseReason !== "InitialConnect") if (this.lastCloseReason) this.logger.log("WebSocket reconnected at", prettyNow(), "after disconnect due to", this.lastCloseReason);
			else this.logger.log("WebSocket reconnected at", prettyNow());
			this.connectionCount += 1;
			this.lastCloseReason = null;
			if (this.pendingNetworkRecoveryInfo !== null) {
				const { timeSavedMs } = this.pendingNetworkRecoveryInfo;
				this.pendingNetworkRecoveryInfo = null;
				this.sendMessage({
					type: "Event",
					eventType: "NetworkRecoveryReconnect",
					event: { timeSavedMs }
				});
				this.logger.log(`Network recovery reconnect saved ~${Math.round(timeSavedMs / 1e3)}s of waiting`);
			}
		};
		ws.onerror = (error) => {
			this.transitionChunkBuffer = null;
			const message = error.message;
			if (message) this.logger.log(`WebSocket error message: ${message}`);
		};
		ws.onmessage = (message) => {
			this.resetServerInactivityTimeout();
			const messageLength = message.data.length;
			let serverMessage = parseServerMessage(JSON.parse(message.data));
			this._logVerbose(`received ws message with type ${serverMessage.type}`);
			if (serverMessage.type === "Ping") return;
			if (serverMessage.type === "TransitionChunk") {
				const transition = this.assembleTransition(serverMessage);
				if (!transition) return;
				serverMessage = transition;
				this._logVerbose(`assembled full ws message of type ${serverMessage.type}`);
			}
			if (this.transitionChunkBuffer !== null) {
				this.transitionChunkBuffer = null;
				this.logger.log(`Received unexpected ${serverMessage.type} while buffering TransitionChunks`);
			}
			if (serverMessage.type === "Transition") this.reportLargeTransition({
				messageLength,
				transition: serverMessage
			});
			if (this.onMessage(serverMessage).hasSyncedPastLastReconnect) {
				this.retries = 0;
				this.markConnectionStateDirty();
			}
		};
		ws.onclose = (event) => {
			this._logVerbose("begin ws.onclose");
			this.transitionChunkBuffer = null;
			if (this.lastCloseReason === null) this.lastCloseReason = event.reason || `closed with code ${event.code}`;
			if (event.code !== CLOSE_NORMAL && event.code !== CLOSE_GOING_AWAY && event.code !== CLOSE_NO_STATUS && event.code !== CLOSE_NOT_FOUND) {
				let msg = `WebSocket closed with code ${event.code}`;
				if (event.reason) msg += `: ${event.reason}`;
				this.logger.log(msg);
				if (this.onServerDisconnectError && event.reason) this.onServerDisconnectError(msg);
			}
			const reason = classifyDisconnectError(event.reason);
			this.scheduleReconnect(reason);
		};
	}
	/**
	* @returns The state of the {@link Socket}.
	*/
	socketState() {
		return this.socket.state;
	}
	/**
	* @param message - A ClientMessage to send.
	* @returns Whether the message (might have been) sent.
	*/
	sendMessage(message) {
		const messageForLog = {
			type: message.type,
			...message.type === "Authenticate" && message.tokenType === "User" ? { value: `...${message.value.slice(-7)}` } : {}
		};
		if (this.socket.state === "ready" && this.socket.paused === "no") {
			const encodedMessage = encodeClientMessage(message);
			const request = JSON.stringify(encodedMessage);
			let sent = false;
			try {
				this.socket.ws.send(request);
				sent = true;
			} catch (error) {
				this.logger.log(`Failed to send message on WebSocket, reconnecting: ${error}`);
				this.closeAndReconnect("FailedToSendMessage");
			}
			this._logVerbose(`${sent ? "sent" : "failed to send"} message with type ${message.type}: ${JSON.stringify(messageForLog)}`);
			return true;
		}
		this._logVerbose(`message not sent (socket state: ${this.socket.state}, paused: ${"paused" in this.socket ? this.socket.paused : void 0}): ${JSON.stringify(messageForLog)}`);
		return false;
	}
	resetServerInactivityTimeout() {
		if (this.socket.state === "terminated") return;
		if (this.reconnectDueToServerInactivityTimeout !== null) {
			clearTimeout(this.reconnectDueToServerInactivityTimeout);
			this.reconnectDueToServerInactivityTimeout = null;
		}
		this.reconnectDueToServerInactivityTimeout = setTimeout(() => {
			this.closeAndReconnect("InactiveServer");
		}, this.serverInactivityThreshold);
	}
	scheduleReconnect(reason) {
		if (this.scheduledReconnect) {
			clearTimeout(this.scheduledReconnect.timeout);
			this.scheduledReconnect = null;
		}
		this.socket = { state: "disconnected" };
		const backoff = this.nextBackoff(reason);
		this.markConnectionStateDirty();
		this.logger.log(`Attempting reconnect in ${Math.round(backoff)}ms`);
		const scheduledAt = monotonicMillis();
		const timeoutId = setTimeout(() => {
			if (this.scheduledReconnect?.timeout === timeoutId) {
				this.scheduledReconnect = null;
				this.connect();
			}
		}, backoff);
		this.scheduledReconnect = {
			timeout: timeoutId,
			scheduledAt,
			backoffMs: backoff
		};
	}
	/**
	* Close the WebSocket and schedule a reconnect.
	*
	* This should be used when we hit an error and would like to restart the session.
	*/
	closeAndReconnect(closeReason) {
		this._logVerbose(`begin closeAndReconnect with reason ${closeReason}`);
		switch (this.socket.state) {
			case "disconnected":
			case "terminated":
			case "stopped": return;
			case "connecting":
			case "ready":
				this.lastCloseReason = closeReason;
				this.close();
				this.scheduleReconnect("client");
				return;
			default: this.socket;
		}
	}
	/**
	* Close the WebSocket, being careful to clear the onclose handler to avoid re-entrant
	* calls. Use this instead of directly calling `ws.close()`
	*
	* It is the callers responsibility to update the state after this method is called so that the
	* closed socket is not accessible or used again after this method is called
	*/
	close() {
		this.transitionChunkBuffer = null;
		switch (this.socket.state) {
			case "disconnected":
			case "terminated":
			case "stopped": return Promise.resolve();
			case "connecting": {
				const ws = this.socket.ws;
				ws.onmessage = (_message) => {
					this._logVerbose("Ignoring message received after close");
				};
				return new Promise((r) => {
					ws.onclose = () => {
						this._logVerbose("Closed after connecting");
						r();
					};
					ws.onopen = () => {
						this._logVerbose("Opened after connecting");
						ws.close();
					};
				});
			}
			case "ready": {
				this._logVerbose("ws.close called");
				const ws = this.socket.ws;
				ws.onmessage = (_message) => {
					this._logVerbose("Ignoring message received after close");
				};
				const result = new Promise((r) => {
					ws.onclose = () => {
						r();
					};
				});
				ws.close();
				return result;
			}
			default:
				this.socket;
				return Promise.resolve();
		}
	}
	/**
	* Close the WebSocket and do not reconnect.
	* @returns A Promise that resolves when the WebSocket `onClose` callback is called.
	*/
	terminate() {
		if (this.reconnectDueToServerInactivityTimeout) clearTimeout(this.reconnectDueToServerInactivityTimeout);
		if (this.scheduledReconnect) {
			clearTimeout(this.scheduledReconnect.timeout);
			this.scheduledReconnect = null;
		}
		this.cleanupNetworkListener();
		switch (this.socket.state) {
			case "terminated":
			case "stopped":
			case "disconnected":
			case "connecting":
			case "ready": {
				const result = this.close();
				this.setSocketState({ state: "terminated" });
				return result;
			}
			default:
				this.socket;
				throw new Error(`Invalid websocket state: ${this.socket.state}`);
		}
	}
	stop() {
		switch (this.socket.state) {
			case "terminated": return Promise.resolve();
			case "connecting":
			case "stopped":
			case "disconnected":
			case "ready": {
				this.cleanupNetworkListener();
				const result = this.close();
				this.socket = { state: "stopped" };
				return result;
			}
			default:
				this.socket;
				return Promise.resolve();
		}
	}
	/**
	* Create a new WebSocket after a previous `stop()`, unless `terminate()` was
	* called before.
	*/
	tryRestart() {
		switch (this.socket.state) {
			case "stopped": break;
			case "terminated":
			case "connecting":
			case "ready":
			case "disconnected":
				this.logger.logVerbose("Restart called without stopping first");
				return;
			default: this.socket;
		}
		this.setupNetworkListener();
		this.connect();
	}
	pause() {
		switch (this.socket.state) {
			case "disconnected":
			case "stopped":
			case "terminated": return;
			case "connecting":
			case "ready":
				this.socket = {
					...this.socket,
					paused: "yes"
				};
				return;
			default:
				this.socket;
				return;
		}
	}
	/**
	* Try to reconnect immediately, canceling any scheduled reconnect.
	* This is useful when detecting network recovery.
	* Only takes action if we're in disconnected state (waiting to reconnect).
	*/
	tryReconnectImmediately() {
		this._logVerbose("tryReconnectImmediately called");
		if (this.socket.state !== "disconnected") {
			this._logVerbose(`tryReconnectImmediately called but socket state is ${this.socket.state}, no action taken`);
			return;
		}
		let timeSavedMs = null;
		if (this.scheduledReconnect) {
			const elapsed = monotonicMillis() - this.scheduledReconnect.scheduledAt;
			timeSavedMs = Math.max(0, this.scheduledReconnect.backoffMs - elapsed);
			this._logVerbose(`would have waited ${Math.round(timeSavedMs)}ms more (backoff was ${Math.round(this.scheduledReconnect.backoffMs)}ms, elapsed ${Math.round(elapsed)}ms)`);
			clearTimeout(this.scheduledReconnect.timeout);
			this.scheduledReconnect = null;
			this._logVerbose("canceled scheduled reconnect");
		}
		this.logger.log("Network recovery detected, reconnecting immediately");
		this.pendingNetworkRecoveryInfo = timeSavedMs !== null ? { timeSavedMs } : null;
		this.connect();
	}
	/**
	* Resume the state machine if previously paused.
	*/
	resume() {
		switch (this.socket.state) {
			case "connecting":
				this.socket = {
					...this.socket,
					paused: "no"
				};
				return;
			case "ready":
				if (this.socket.paused === "uninitialized") {
					this.socket = {
						...this.socket,
						paused: "no"
					};
					this._hasEverConnected = true;
					this.onOpen({
						connectionCount: this.connectionCount,
						lastCloseReason: this.lastCloseReason,
						clientTs: monotonicMillis()
					});
				} else if (this.socket.paused === "yes") {
					this.socket = {
						...this.socket,
						paused: "no"
					};
					this.onResume();
				}
				return;
			case "terminated":
			case "stopped":
			case "disconnected": return;
			default: this.socket;
		}
		this.connect();
	}
	connectionState() {
		return {
			isConnected: this.socket.state === "ready",
			hasEverConnected: this._hasEverConnected,
			connectionCount: this.connectionCount,
			connectionRetries: this.retries
		};
	}
	_logVerbose(message) {
		this.logger.logVerbose(message);
	}
	nextBackoff(reason) {
		const baseBackoff = (reason === "client" ? 100 : reason === "Unknown" ? this.defaultInitialBackoff : serverDisconnectErrors[reason].timeout) * Math.pow(2, this.retries);
		this.retries += 1;
		const actualBackoff = Math.min(baseBackoff, this.maxBackoff);
		return actualBackoff + actualBackoff * (Math.random() - .5);
	}
	reportLargeTransition({ transition, messageLength }) {
		if (transition.clientClockSkew === void 0 || transition.serverTs === void 0) return;
		const transitionTransitTime = monotonicMillis() - transition.clientClockSkew - transition.serverTs / 1e6;
		const prettyTransitionTime = `${Math.round(transitionTransitTime)}ms`;
		const prettyMessageMB = `${Math.round(messageLength / 1e4) / 100}MB`;
		const bytesPerSecond = messageLength / (transitionTransitTime / 1e3);
		const prettyBytesPerSecond = `${Math.round(bytesPerSecond / 1e4) / 100}MB per second`;
		this._logVerbose(`received ${prettyMessageMB} transition in ${prettyTransitionTime} at ${prettyBytesPerSecond}`);
		if (messageLength > 2e7) this.logger.log(`received query results totaling more that 20MB (${prettyMessageMB}) which will take a long time to download on slower connections`);
		else if (transitionTransitTime > 2e4) this.logger.log(`received query results totaling ${prettyMessageMB} which took more than 20s to arrive (${prettyTransitionTime})`);
		if (this.debug) this.sendMessage({
			type: "Event",
			eventType: "ClientReceivedTransition",
			event: {
				transitionTransitTime,
				messageLength
			}
		});
	}
};
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/session.js
function newSessionId() {
	return uuidv4();
}
function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
		const r = Math.random() * 16 | 0;
		return (c === "x" ? r : r & 3 | 8).toString(16);
	});
}
//#endregion
//#region node_modules/convex/dist/esm/vendor/jwt-decode/index.js
var InvalidTokenError = class extends Error {};
InvalidTokenError.prototype.name = "InvalidTokenError";
function b64DecodeUnicode(str) {
	return decodeURIComponent(atob(str).replace(/(.)/g, (_m, p) => {
		let code = p.charCodeAt(0).toString(16).toUpperCase();
		if (code.length < 2) code = "0" + code;
		return "%" + code;
	}));
}
function base64UrlDecode(str) {
	let output = str.replace(/-/g, "+").replace(/_/g, "/");
	switch (output.length % 4) {
		case 0: break;
		case 2:
			output += "==";
			break;
		case 3:
			output += "=";
			break;
		default: throw new Error("base64 string is not of the correct length");
	}
	try {
		return b64DecodeUnicode(output);
	} catch {
		return atob(output);
	}
}
function jwtDecode(token, options) {
	if (typeof token !== "string") throw new InvalidTokenError("Invalid token specified: must be a string");
	options || (options = {});
	const pos = options.header === true ? 0 : 1;
	const part = token.split(".")[pos];
	if (typeof part !== "string") throw new InvalidTokenError(`Invalid token specified: missing part #${pos + 1}`);
	let decoded;
	try {
		decoded = base64UrlDecode(part);
	} catch (e) {
		throw new InvalidTokenError(`Invalid token specified: invalid base64 for part #${pos + 1} (${e.message})`);
	}
	try {
		return JSON.parse(decoded);
	} catch (e) {
		throw new InvalidTokenError(`Invalid token specified: invalid json for part #${pos + 1} (${e.message})`);
	}
}
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/authentication_manager.js
var __defProp$6 = Object.defineProperty;
var __defNormalProp$5 = (obj, key, value) => key in obj ? __defProp$6(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$5 = (obj, key, value) => __defNormalProp$5(obj, typeof key !== "symbol" ? key + "" : key, value);
var MAXIMUM_REFRESH_DELAY = 480 * 60 * 60 * 1e3;
var MAX_TOKEN_CONFIRMATION_ATTEMPTS = 2;
var AuthenticationManager = class {
	constructor(syncState, callbacks, config) {
		__publicField$5(this, "authState", { state: "noAuth" });
		__publicField$5(this, "configVersion", 0);
		__publicField$5(this, "syncState");
		__publicField$5(this, "authenticate");
		__publicField$5(this, "stopSocket");
		__publicField$5(this, "tryRestartSocket");
		__publicField$5(this, "pauseSocket");
		__publicField$5(this, "resumeSocket");
		__publicField$5(this, "clearAuth");
		__publicField$5(this, "logger");
		__publicField$5(this, "refreshTokenLeewaySeconds");
		__publicField$5(this, "lastRefreshChange");
		__publicField$5(this, "tokenConfirmationAttempts", 0);
		this.syncState = syncState;
		this.authenticate = callbacks.authenticate;
		this.stopSocket = callbacks.stopSocket;
		this.tryRestartSocket = callbacks.tryRestartSocket;
		this.pauseSocket = callbacks.pauseSocket;
		this.resumeSocket = callbacks.resumeSocket;
		this.clearAuth = callbacks.clearAuth;
		this.logger = config.logger;
		this.refreshTokenLeewaySeconds = config.refreshTokenLeewaySeconds;
		this.lastRefreshChange = false;
	}
	notifyRefreshChange(isRefreshing) {
		if (this.authState.state !== "noAuth" && this.authState.state !== "initialRefetch" && this.authState.config.onRefreshChange && this.lastRefreshChange !== isRefreshing) {
			this.lastRefreshChange = isRefreshing;
			this.authState.config.onRefreshChange(isRefreshing);
		}
	}
	async setConfig(fetchToken, onChange, onRefreshChange) {
		this.resetAuthState();
		this._logVerbose("pausing WS for auth token fetch");
		this.pauseSocket();
		const token = await this.fetchTokenAndGuardAgainstRace(fetchToken, { forceRefreshToken: false });
		if (token.isFromOutdatedConfig) return;
		const config = {
			fetchToken,
			onAuthChange: onChange,
			onRefreshChange
		};
		if (token.value) {
			this.setAuthState({
				state: "waitingForServerConfirmationOfCachedToken",
				config,
				hasRetried: false
			});
			this.authenticate(token.value);
		} else {
			this.setAuthState({
				state: "initialRefetch",
				config
			});
			await this.refetchToken();
		}
		this._logVerbose("resuming WS after auth token fetch");
		this.resumeSocket();
	}
	onTransition(serverMessage) {
		if (!this.syncState.isCurrentOrNewerAuthVersion(serverMessage.endVersion.identity)) return;
		if (serverMessage.endVersion.identity <= serverMessage.startVersion.identity) return;
		this._logVerbose(`auth state is ${this.authState.state} when handling transition`);
		this.syncState.markAuthCompletion();
		if (this.authState.state === "waitingForServerConfirmationOfCachedToken") {
			this._logVerbose("server confirmed auth token is valid");
			this.refetchToken();
			this.authState.config.onAuthChange(true);
			return;
		}
		if (this.authState.state === "waitingForServerConfirmationOfFreshToken") {
			this._logVerbose("server confirmed new auth token is valid");
			this.notifyRefreshChange(false);
			this.scheduleTokenRefetch(this.authState.token);
			this.tokenConfirmationAttempts = 0;
			if (!this.authState.hadAuth) this.authState.config.onAuthChange(true);
		}
	}
	onAuthError(serverMessage) {
		if (serverMessage.authUpdateAttempted === false && (this.authState.state === "waitingForServerConfirmationOfFreshToken" || this.authState.state === "waitingForServerConfirmationOfCachedToken")) {
			this._logVerbose("ignoring non-auth token expired error");
			return;
		}
		const { baseVersion } = serverMessage;
		if (!this.syncState.isCurrentOrNewerAuthVersion(baseVersion + 1)) {
			this._logVerbose("ignoring auth error for previous auth attempt");
			return;
		}
		this.tryToReauthenticate(serverMessage);
	}
	async tryToReauthenticate(serverMessage) {
		this._logVerbose(`attempting to reauthenticate: ${serverMessage.error}`);
		if (this.authState.state === "noAuth" || this.authState.state === "waitingForServerConfirmationOfFreshToken" && this.tokenConfirmationAttempts >= MAX_TOKEN_CONFIRMATION_ATTEMPTS) {
			this.logger.error(`Failed to authenticate: "${serverMessage.error}", check your server auth config`);
			if (this.syncState.hasAuth()) this.syncState.clearAuth();
			if (this.authState.state !== "noAuth") this.setAndReportAuthFailed(this.authState.config.onAuthChange);
			return;
		}
		if (this.authState.state === "waitingForServerConfirmationOfFreshToken") {
			this.tokenConfirmationAttempts++;
			this._logVerbose(`retrying reauthentication, ${MAX_TOKEN_CONFIRMATION_ATTEMPTS - this.tokenConfirmationAttempts} attempts remaining`);
		}
		this.notifyRefreshChange(true);
		await this.stopSocket();
		if (this.authState.state === "noAuth") return;
		const token = await this.fetchTokenAndGuardAgainstRace(this.authState.config.fetchToken, { forceRefreshToken: true });
		if (token.isFromOutdatedConfig) return;
		if (token.value && this.syncState.isNewAuth(token.value)) {
			this.authenticate(token.value);
			this.setAuthState({
				state: "waitingForServerConfirmationOfFreshToken",
				config: this.authState.config,
				token: token.value,
				hadAuth: this.authState.state === "notRefetching" || this.authState.state === "waitingForScheduledRefetch"
			});
		} else {
			this._logVerbose("reauthentication failed, could not fetch a new token");
			if (this.syncState.hasAuth()) this.syncState.clearAuth();
			this.setAndReportAuthFailed(this.authState.config.onAuthChange);
		}
		this.tryRestartSocket();
	}
	async refetchToken() {
		if (this.authState.state === "noAuth") return;
		this._logVerbose("refetching auth token");
		const token = await this.fetchTokenAndGuardAgainstRace(this.authState.config.fetchToken, { forceRefreshToken: true });
		if (token.isFromOutdatedConfig) return;
		if (token.value) if (this.syncState.isNewAuth(token.value)) {
			this.setAuthState({
				state: "waitingForServerConfirmationOfFreshToken",
				hadAuth: this.syncState.hasAuth(),
				token: token.value,
				config: this.authState.config
			});
			this.authenticate(token.value);
		} else this.setAuthState({
			state: "notRefetching",
			config: this.authState.config
		});
		else {
			this._logVerbose("refetching token failed");
			if (this.syncState.hasAuth()) this.clearAuth();
			this.setAndReportAuthFailed(this.authState.config.onAuthChange);
		}
		this._logVerbose("restarting WS after auth token fetch (if currently stopped)");
		this.tryRestartSocket();
	}
	scheduleTokenRefetch(token) {
		if (this.authState.state === "noAuth") return;
		const decodedToken = this.decodeToken(token);
		if (!decodedToken) {
			this.logger.error("Auth token is not a valid JWT, cannot refetch the token");
			return;
		}
		const { iat, exp } = decodedToken;
		if (!iat || !exp) {
			this.logger.error("Auth token does not have required fields, cannot refetch the token");
			return;
		}
		const tokenValiditySeconds = exp - iat;
		if (tokenValiditySeconds <= 2) {
			this.logger.error("Auth token does not live long enough, cannot refetch the token");
			return;
		}
		let delay = Math.min(MAXIMUM_REFRESH_DELAY, (tokenValiditySeconds - this.refreshTokenLeewaySeconds) * 1e3);
		if (delay <= 0) {
			this.logger.warn(`Refetching auth token immediately, configured leeway ${this.refreshTokenLeewaySeconds}s is larger than the token's lifetime ${tokenValiditySeconds}s`);
			delay = 0;
		}
		const refetchTokenTimeoutId = setTimeout(() => {
			this._logVerbose("running scheduled token refetch");
			this.refetchToken();
		}, delay);
		this.setAuthState({
			state: "waitingForScheduledRefetch",
			refetchTokenTimeoutId,
			config: this.authState.config
		});
		this._logVerbose(`scheduled preemptive auth token refetching in ${delay}ms`);
	}
	async fetchTokenAndGuardAgainstRace(fetchToken, fetchArgs) {
		const originalConfigVersion = ++this.configVersion;
		this._logVerbose(`fetching token with config version ${originalConfigVersion}`);
		const token = await fetchToken(fetchArgs);
		if (this.configVersion !== originalConfigVersion) {
			this._logVerbose(`stale config version, expected ${originalConfigVersion}, got ${this.configVersion}`);
			return { isFromOutdatedConfig: true };
		}
		return {
			isFromOutdatedConfig: false,
			value: token
		};
	}
	stop() {
		this.resetAuthState();
		this.configVersion++;
		this._logVerbose(`config version bumped to ${this.configVersion}`);
	}
	setAndReportAuthFailed(onAuthChange) {
		onAuthChange(false);
		this.resetAuthState();
	}
	resetAuthState() {
		this.notifyRefreshChange(false);
		this.setAuthState({ state: "noAuth" });
	}
	setAuthState(newAuth) {
		const authStateForLog = newAuth.state === "waitingForServerConfirmationOfFreshToken" ? {
			hadAuth: newAuth.hadAuth,
			state: newAuth.state,
			token: `...${newAuth.token.slice(-7)}`
		} : { state: newAuth.state };
		this._logVerbose(`setting auth state to ${JSON.stringify(authStateForLog)}`);
		switch (newAuth.state) {
			case "waitingForScheduledRefetch":
			case "notRefetching":
			case "noAuth":
				this.tokenConfirmationAttempts = 0;
				break;
			case "waitingForServerConfirmationOfFreshToken":
			case "waitingForServerConfirmationOfCachedToken":
			case "initialRefetch": break;
			default:
		}
		if (this.authState.state === "waitingForScheduledRefetch") clearTimeout(this.authState.refetchTokenTimeoutId);
		this.authState = newAuth;
	}
	decodeToken(token) {
		try {
			return jwtDecode(token);
		} catch (e) {
			this._logVerbose(`Error decoding token: ${e instanceof Error ? e.message : "Unknown error"}`);
			return null;
		}
	}
	_logVerbose(message) {
		this.logger.logVerbose(`${message} [v${this.configVersion}]`);
	}
};
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/metrics.js
var markNames = [
	"convexClientConstructed",
	"convexWebSocketOpen",
	"convexFirstMessageReceived"
];
function mark(name, sessionId) {
	const detail = { sessionId };
	if (typeof performance === "undefined" || !performance.mark) return;
	performance.mark(name, { detail });
}
function performanceMarkToJson(mark2) {
	let name = mark2.name.slice(6);
	name = name.charAt(0).toLowerCase() + name.slice(1);
	return {
		name,
		startTime: mark2.startTime
	};
}
function getMarksReport(sessionId) {
	if (typeof performance === "undefined" || !performance.getEntriesByName) return [];
	const allMarks = [];
	for (const name of markNames) {
		const marks = performance.getEntriesByName(name).filter((entry) => entry.entryType === "mark").filter((mark2) => mark2.detail.sessionId === sessionId);
		allMarks.push(...marks);
	}
	return allMarks.map(performanceMarkToJson);
}
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/client.js
var __defProp$5 = Object.defineProperty;
var __defNormalProp$4 = (obj, key, value) => key in obj ? __defProp$5(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$4 = (obj, key, value) => __defNormalProp$4(obj, typeof key !== "symbol" ? key + "" : key, value);
var BaseConvexClient = class {
	/**
	* @param address - The url of your Convex deployment, often provided
	* by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
	* @param onTransition - A callback receiving an array of query tokens
	* corresponding to query results that have changed -- additional handlers
	* can be added via `addOnTransitionHandler`.
	* @param options - See {@link BaseConvexClientOptions} for a full description.
	*/
	constructor(address, onTransition, options) {
		__publicField$4(this, "address");
		__publicField$4(this, "state");
		__publicField$4(this, "requestManager");
		__publicField$4(this, "webSocketManager");
		__publicField$4(this, "authenticationManager");
		__publicField$4(this, "remoteQuerySet");
		__publicField$4(this, "optimisticQueryResults");
		__publicField$4(this, "_transitionHandlerCounter", 0);
		__publicField$4(this, "_nextRequestId");
		__publicField$4(this, "_onTransitionFns", /* @__PURE__ */ new Map());
		__publicField$4(this, "_sessionId");
		__publicField$4(this, "firstMessageReceived", false);
		__publicField$4(this, "debug");
		__publicField$4(this, "logger");
		__publicField$4(this, "maxObservedTimestamp");
		__publicField$4(this, "connectionStateSubscribers", /* @__PURE__ */ new Map());
		__publicField$4(this, "nextConnectionStateSubscriberId", 0);
		__publicField$4(this, "_lastPublishedConnectionState");
		/**
		* Call this whenever the connection state may have changed in a way that could
		* require publishing it. Schedules a possibly update.
		*/
		__publicField$4(this, "markConnectionStateDirty", () => {
			Promise.resolve().then(() => {
				const curConnectionState = this.connectionState();
				if (JSON.stringify(curConnectionState) !== JSON.stringify(this._lastPublishedConnectionState)) {
					this._lastPublishedConnectionState = curConnectionState;
					for (const cb of this.connectionStateSubscribers.values()) cb(curConnectionState);
				}
			});
		});
		__publicField$4(this, "mark", (name) => {
			if (this.debug) mark(name, this.sessionId);
		});
		if (typeof address === "object") throw new Error("Passing a ClientConfig object is no longer supported. Pass the URL of the Convex deployment as a string directly.");
		if (options?.skipConvexDeploymentUrlCheck !== true) validateDeploymentUrl(address);
		options = { ...options };
		const authRefreshTokenLeewaySeconds = options.authRefreshTokenLeewaySeconds ?? 10;
		let webSocketConstructor = options.webSocketConstructor;
		if (!webSocketConstructor && typeof WebSocket === "undefined") throw new Error("No WebSocket global variable defined! To use Convex in an environment without WebSocket try the HTTP client: https://docs.convex.dev/api/classes/browser.ConvexHttpClient");
		webSocketConstructor = webSocketConstructor || WebSocket;
		this.debug = options.reportDebugInfoToConvex ?? false;
		this.address = address;
		this.logger = options.logger === false ? instantiateNoopLogger({ verbose: options.verbose ?? false }) : options.logger !== true && options.logger ? options.logger : instantiateDefaultLogger({ verbose: options.verbose ?? false });
		const i = address.search("://");
		if (i === -1) throw new Error("Provided address was not an absolute URL.");
		const origin = address.substring(i + 3);
		const protocol = address.substring(0, i);
		let wsProtocol;
		if (protocol === "http") wsProtocol = "ws";
		else if (protocol === "https") wsProtocol = "wss";
		else throw new Error(`Unknown parent protocol ${protocol}`);
		const wsUri = `${wsProtocol}://${origin}/api/${version}/sync`;
		this.state = new LocalSyncState();
		this.remoteQuerySet = new RemoteQuerySet((queryId) => this.state.queryPath(queryId), this.logger);
		this.requestManager = new RequestManager(this.logger, this.markConnectionStateDirty);
		const pauseSocket = () => {
			this.webSocketManager.pause();
			this.state.pause();
		};
		this.authenticationManager = new AuthenticationManager(this.state, {
			authenticate: (token) => {
				const message = this.state.setAuth(token);
				this.webSocketManager.sendMessage(message);
				return message.baseVersion;
			},
			stopSocket: () => this.webSocketManager.stop(),
			tryRestartSocket: () => this.webSocketManager.tryRestart(),
			pauseSocket,
			resumeSocket: () => this.webSocketManager.resume(),
			clearAuth: () => {
				this.clearAuth();
			}
		}, {
			logger: this.logger,
			refreshTokenLeewaySeconds: authRefreshTokenLeewaySeconds
		});
		this.optimisticQueryResults = new OptimisticQueryResults();
		this.addOnTransitionHandler((transition) => {
			onTransition(transition.queries.map((q) => q.token));
		});
		this._nextRequestId = 0;
		this._sessionId = newSessionId();
		const { unsavedChangesWarning } = options;
		if (typeof window === "undefined" || typeof window.addEventListener === "undefined") {
			if (unsavedChangesWarning === true) throw new Error("unsavedChangesWarning requested, but window.addEventListener not found! Remove {unsavedChangesWarning: true} from Convex client options.");
		} else if (unsavedChangesWarning !== false) window.addEventListener("beforeunload", (e) => {
			if (this.requestManager.hasIncompleteRequests()) {
				e.preventDefault();
				const confirmationMessage = "Are you sure you want to leave? Your changes may not be saved.";
				(e || window.event).returnValue = confirmationMessage;
				return confirmationMessage;
			}
		});
		this.webSocketManager = new WebSocketManager(wsUri, {
			onOpen: (reconnectMetadata) => {
				this.mark("convexWebSocketOpen");
				this.webSocketManager.sendMessage({
					...reconnectMetadata,
					type: "Connect",
					sessionId: this._sessionId,
					maxObservedTimestamp: this.maxObservedTimestamp
				});
				this.remoteQuerySet = new RemoteQuerySet((queryId) => this.state.queryPath(queryId), this.logger);
				const [querySetModification, authModification] = this.state.restart();
				if (authModification) this.webSocketManager.sendMessage(authModification);
				this.webSocketManager.sendMessage(querySetModification);
				for (const message of this.requestManager.restart()) this.webSocketManager.sendMessage(message);
			},
			onResume: () => {
				const [querySetModification, authModification] = this.state.resume();
				if (authModification) this.webSocketManager.sendMessage(authModification);
				if (querySetModification) this.webSocketManager.sendMessage(querySetModification);
				for (const message of this.requestManager.resume()) this.webSocketManager.sendMessage(message);
			},
			onMessage: (serverMessage) => {
				if (!this.firstMessageReceived) {
					this.firstMessageReceived = true;
					this.mark("convexFirstMessageReceived");
					this.reportMarks();
				}
				switch (serverMessage.type) {
					case "Transition": {
						this.observedTimestamp(serverMessage.endVersion.ts);
						this.authenticationManager.onTransition(serverMessage);
						this.remoteQuerySet.transition(serverMessage);
						this.state.transition(serverMessage);
						const completedRequests = this.requestManager.removeCompleted(this.remoteQuerySet.timestamp());
						this.notifyOnQueryResultChanges(completedRequests);
						break;
					}
					case "MutationResponse": {
						if (serverMessage.success) this.observedTimestamp(serverMessage.ts);
						const completedMutationInfo = this.requestManager.onResponse(serverMessage);
						if (completedMutationInfo !== null) this.notifyOnQueryResultChanges(/* @__PURE__ */ new Map([[completedMutationInfo.requestId, completedMutationInfo.result]]));
						break;
					}
					case "ActionResponse":
						this.requestManager.onResponse(serverMessage);
						break;
					case "AuthError":
						this.authenticationManager.onAuthError(serverMessage);
						break;
					case "FatalError": {
						const error = logFatalError(this.logger, serverMessage.error);
						this.webSocketManager.terminate();
						throw error;
					}
					default:
				}
				return { hasSyncedPastLastReconnect: this.hasSyncedPastLastReconnect() };
			},
			onServerDisconnectError: options.onServerDisconnectError
		}, webSocketConstructor, this.logger, this.markConnectionStateDirty, this.debug);
		this.mark("convexClientConstructed");
		if (options.expectAuth) pauseSocket();
	}
	/**
	* Return true if there is outstanding work from prior to the time of the most recent restart.
	* This indicates that the client has not proven itself to have gotten past the issue that
	* potentially led to the restart. Use this to influence when to reset backoff after a failure.
	*/
	hasSyncedPastLastReconnect() {
		return this.requestManager.hasSyncedPastLastReconnect() && this.state.hasSyncedPastLastReconnect();
	}
	observedTimestamp(observedTs) {
		if (this.maxObservedTimestamp === void 0 || this.maxObservedTimestamp.lessThanOrEqual(observedTs)) this.maxObservedTimestamp = observedTs;
	}
	getMaxObservedTimestamp() {
		return this.maxObservedTimestamp;
	}
	/**
	* Compute the current query results based on the remoteQuerySet and the
	* current optimistic updates and call `onTransition` for all the changed
	* queries.
	*
	* @param completedMutations - A set of mutation IDs whose optimistic updates
	* are no longer needed.
	*/
	notifyOnQueryResultChanges(completedRequests) {
		const remoteQueryResults = this.remoteQuerySet.remoteQueryResults();
		const queryTokenToValue = /* @__PURE__ */ new Map();
		for (const [queryId, result] of remoteQueryResults) {
			const queryToken = this.state.queryToken(queryId);
			if (queryToken !== null) {
				const query = {
					result,
					udfPath: this.state.queryPath(queryId),
					args: this.state.queryArgs(queryId)
				};
				queryTokenToValue.set(queryToken, query);
			}
		}
		const changedQueryTokens = this.optimisticQueryResults.ingestQueryResultsFromServer(queryTokenToValue, new Set(completedRequests.keys()));
		this.handleTransition({
			queries: changedQueryTokens.map((token) => {
				return {
					token,
					modification: {
						kind: "Updated",
						result: this.optimisticQueryResults.rawQueryResult(token)
					}
				};
			}),
			reflectedMutations: Array.from(completedRequests).map(([requestId, result]) => ({
				requestId,
				result
			})),
			timestamp: this.remoteQuerySet.timestamp()
		});
	}
	handleTransition(transition) {
		for (const fn of this._onTransitionFns.values()) fn(transition);
	}
	/**
	* Add a handler that will be called on a transition.
	*
	* Any external side effects (e.g. setting React state) should be handled here.
	*
	* @param fn
	*
	* @returns
	*/
	addOnTransitionHandler(fn) {
		const id = this._transitionHandlerCounter++;
		this._onTransitionFns.set(id, fn);
		return () => this._onTransitionFns.delete(id);
	}
	/**
	* Get the current JWT auth token and decoded claims.
	*/
	getCurrentAuthClaims() {
		const authToken = this.state.getAuth();
		let decoded = {};
		if (authToken && authToken.tokenType === "User") try {
			decoded = authToken ? jwtDecode(authToken.value) : {};
		} catch {
			decoded = {};
		}
		else return;
		return {
			token: authToken.value,
			decoded
		};
	}
	/**
	* Set the authentication token to be used for subsequent queries and mutations.
	* `fetchToken` will be called automatically again if a token expires.
	* `fetchToken` should return `null` if the token cannot be retrieved, for example
	* when the user's rights were permanently revoked.
	* @param fetchToken - an async function returning the JWT-encoded OpenID Connect Identity Token
	* @param onChange - a callback that will be called when the authentication status changes
	* @param onRefreshChange - a callback called with `true` when the socket is paused to fetch a replacement token after a server rejection, and `false` when refresh completes
	*/
	setAuth(fetchToken, onChange, onRefreshChange) {
		this.authenticationManager.setConfig(fetchToken, onChange, onRefreshChange);
	}
	hasAuth() {
		return this.state.hasAuth();
	}
	/** @internal */
	setAdminAuth(value, fakeUserIdentity) {
		const message = this.state.setAdminAuth(value, fakeUserIdentity);
		this.webSocketManager.sendMessage(message);
	}
	clearAuth() {
		const message = this.state.clearAuth();
		this.webSocketManager.sendMessage(message);
	}
	/**
	* Subscribe to a query function.
	*
	* Whenever this query's result changes, the `onTransition` callback
	* passed into the constructor will be called.
	*
	* @param name - The name of the query.
	* @param args - An arguments object for the query. If this is omitted, the
	* arguments will be `{}`.
	* @param options - A {@link SubscribeOptions} options object for this query.
	
	* @returns An object containing a {@link QueryToken} corresponding to this
	* query and an `unsubscribe` callback.
	*/
	subscribe(name, args, options) {
		const argsObject = parseArgs(args);
		const { modification, queryToken, unsubscribe } = this.state.subscribe(name, argsObject, options?.journal, options?.componentPath);
		if (modification !== null) this.webSocketManager.sendMessage(modification);
		return {
			queryToken,
			unsubscribe: () => {
				const modification2 = unsubscribe();
				if (modification2) this.webSocketManager.sendMessage(modification2);
			}
		};
	}
	/**
	* A query result based only on the current, local state.
	*
	* The only way this will return a value is if we're already subscribed to the
	* query or its value has been set optimistically.
	*/
	localQueryResult(udfPath, args) {
		const queryToken = serializePathAndArgs(udfPath, parseArgs(args));
		return this.optimisticQueryResults.queryResult(queryToken);
	}
	/**
	* Get query result by query token based on current, local state
	*
	* The only way this will return a value is if we're already subscribed to the
	* query or its value has been set optimistically.
	*
	* @internal
	*/
	localQueryResultByToken(queryToken) {
		return this.optimisticQueryResults.queryResult(queryToken);
	}
	/**
	* Whether local query result is available for a token.
	*
	* This method does not throw if the result is an error.
	*
	* @internal
	*/
	hasLocalQueryResultByToken(queryToken) {
		return this.optimisticQueryResults.hasQueryResult(queryToken);
	}
	/**
	* @internal
	*/
	localQueryLogs(udfPath, args) {
		const queryToken = serializePathAndArgs(udfPath, parseArgs(args));
		return this.optimisticQueryResults.queryLogs(queryToken);
	}
	/**
	* Retrieve the current {@link QueryJournal} for this query function.
	*
	* If we have not yet received a result for this query, this will be `undefined`.
	*
	* @param name - The name of the query.
	* @param args - The arguments object for this query.
	* @returns The query's {@link QueryJournal} or `undefined`.
	*/
	queryJournal(name, args) {
		const queryToken = serializePathAndArgs(name, parseArgs(args));
		return this.state.queryJournal(queryToken);
	}
	/**
	* Get the current {@link ConnectionState} between the client and the Convex
	* backend.
	*
	* @returns The {@link ConnectionState} with the Convex backend.
	*/
	connectionState() {
		const wsConnectionState = this.webSocketManager.connectionState();
		return {
			hasInflightRequests: this.requestManager.hasInflightRequests(),
			isWebSocketConnected: wsConnectionState.isConnected,
			hasEverConnected: wsConnectionState.hasEverConnected,
			connectionCount: wsConnectionState.connectionCount,
			connectionRetries: wsConnectionState.connectionRetries,
			timeOfOldestInflightRequest: this.requestManager.timeOfOldestInflightRequest(),
			inflightMutations: this.requestManager.inflightMutations(),
			inflightActions: this.requestManager.inflightActions()
		};
	}
	/**
	* Subscribe to the {@link ConnectionState} between the client and the Convex
	* backend, calling a callback each time it changes.
	*
	* Subscribed callbacks will be called when any part of ConnectionState changes.
	* ConnectionState may grow in future versions (e.g. to provide a array of
	* inflight requests) in which case callbacks would be called more frequently.
	*
	* @returns An unsubscribe function to stop listening.
	*/
	subscribeToConnectionState(cb) {
		const id = this.nextConnectionStateSubscriberId++;
		this.connectionStateSubscribers.set(id, cb);
		return () => {
			this.connectionStateSubscribers.delete(id);
		};
	}
	/**
	* Execute a mutation function.
	*
	* @param name - The name of the mutation.
	* @param args - An arguments object for the mutation. If this is omitted,
	* the arguments will be `{}`.
	* @param options - A {@link MutationOptions} options object for this mutation.
	
	* @returns - A promise of the mutation's result.
	*/
	async mutation(name, args, options) {
		const result = await this.mutationInternal(name, args, options);
		if (!result.success) {
			if (result.errorData !== void 0) throw forwardData(result, new ConvexError(createHybridErrorStacktrace("mutation", name, result)));
			throw new Error(createHybridErrorStacktrace("mutation", name, result));
		}
		return result.value;
	}
	/**
	* @internal
	*/
	async mutationInternal(udfPath, args, options, componentPath) {
		const { mutationPromise } = this.enqueueMutation(udfPath, args, options, componentPath);
		return mutationPromise;
	}
	/**
	* @internal
	*/
	enqueueMutation(udfPath, args, options, componentPath) {
		const mutationArgs = parseArgs(args);
		this.tryReportLongDisconnect();
		const requestId = this.nextRequestId;
		this._nextRequestId++;
		if (options !== void 0) {
			const optimisticUpdate = options.optimisticUpdate;
			if (optimisticUpdate !== void 0) {
				const wrappedUpdate = (localQueryStore) => {
					if (optimisticUpdate(localQueryStore, mutationArgs) instanceof Promise) this.logger.warn("Optimistic update handler returned a Promise. Optimistic updates should be synchronous.");
				};
				const changedQueries = this.optimisticQueryResults.applyOptimisticUpdate(wrappedUpdate, requestId).map((token) => {
					const localResult = this.localQueryResultByToken(token);
					return {
						token,
						modification: {
							kind: "Updated",
							result: localResult === void 0 ? void 0 : {
								success: true,
								value: localResult,
								logLines: []
							}
						}
					};
				});
				this.handleTransition({
					queries: changedQueries,
					reflectedMutations: [],
					timestamp: this.remoteQuerySet.timestamp()
				});
			}
		}
		const message = {
			type: "Mutation",
			requestId,
			udfPath,
			componentPath,
			args: [convexToJson(mutationArgs)]
		};
		const mightBeSent = this.webSocketManager.sendMessage(message);
		return {
			requestId,
			mutationPromise: this.requestManager.request(message, mightBeSent)
		};
	}
	/**
	* Execute an action function.
	*
	* @param name - The name of the action.
	* @param args - An arguments object for the action. If this is omitted,
	* the arguments will be `{}`.
	* @returns A promise of the action's result.
	*/
	async action(name, args) {
		const result = await this.actionInternal(name, args);
		if (!result.success) {
			if (result.errorData !== void 0) throw forwardData(result, new ConvexError(createHybridErrorStacktrace("action", name, result)));
			throw new Error(createHybridErrorStacktrace("action", name, result));
		}
		return result.value;
	}
	/**
	* @internal
	*/
	async actionInternal(udfPath, args, componentPath) {
		const actionArgs = parseArgs(args);
		const requestId = this.nextRequestId;
		this._nextRequestId++;
		this.tryReportLongDisconnect();
		const message = {
			type: "Action",
			requestId,
			udfPath,
			componentPath,
			args: [convexToJson(actionArgs)]
		};
		const mightBeSent = this.webSocketManager.sendMessage(message);
		return this.requestManager.request(message, mightBeSent);
	}
	/**
	* Close any network handles associated with this client and stop all subscriptions.
	*
	* Call this method when you're done with an {@link BaseConvexClient} to
	* dispose of its sockets and resources.
	*
	* @returns A `Promise` fulfilled when the connection has been completely closed.
	*/
	async close() {
		this.authenticationManager.stop();
		return this.webSocketManager.terminate();
	}
	/**
	* Return the address for this client, useful for creating a new client.
	*
	* Not guaranteed to match the address with which this client was constructed:
	* it may be canonicalized.
	*/
	get url() {
		return this.address;
	}
	/**
	* @internal
	*/
	get nextRequestId() {
		return this._nextRequestId;
	}
	/**
	* @internal
	*/
	get sessionId() {
		return this._sessionId;
	}
	/**
	* Reports performance marks to the server. This should only be called when
	* we have a functional websocket.
	*/
	reportMarks() {
		if (this.debug) {
			const report = getMarksReport(this.sessionId);
			this.webSocketManager.sendMessage({
				type: "Event",
				eventType: "ClientConnect",
				event: report
			});
		}
	}
	tryReportLongDisconnect() {
		if (!this.debug) return;
		const timeOfOldestRequest = this.connectionState().timeOfOldestInflightRequest;
		if (timeOfOldestRequest === null || Date.now() - timeOfOldestRequest.getTime() <= 60 * 1e3) return;
		const endpoint = `${this.address}/api/debug_event`;
		fetch(endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Convex-Client": `npm-${version}`
			},
			body: JSON.stringify({ event: "LongWebsocketDisconnect" })
		}).then((response) => {
			if (!response.ok) this.logger.warn("Analytics request failed with response:", response.body);
		}).catch((error) => {
			this.logger.warn("Analytics response failed with error:", error);
		});
	}
};
//#endregion
//#region node_modules/convex/dist/esm/browser/http_client.js
var __defProp$4 = Object.defineProperty;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$4(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$3 = (obj, key, value) => __defNormalProp$3(obj, typeof key !== "symbol" ? key + "" : key, value);
var specifiedFetch = void 0;
var ConvexHttpClient = class {
	/**
	* Create a new {@link ConvexHttpClient}.
	*
	* @param address - The url of your Convex deployment, often provided
	* by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
	* @param options - An object of options.
	* - `skipConvexDeploymentUrlCheck` - Skip validating that the Convex deployment URL looks like
	* `https://happy-animal-123.convex.cloud` or localhost. This can be useful if running a self-hosted
	* Convex backend that uses a different URL.
	* - `logger` - A logger or a boolean. If not provided, logs to the console.
	* You can construct your own logger to customize logging to log elsewhere
	* or not log at all, or use `false` as a shorthand for a no-op logger.
	* A logger is an object with 4 methods: log(), warn(), error(), and logVerbose().
	* These methods can receive multiple arguments of any types, like console.log().
	* - `auth` - A JWT containing identity claims accessible in Convex functions.
	* This identity may expire so it may be necessary to call `setAuth()` later,
	* but for short-lived clients it's convenient to specify this value here.
	* - `fetch` - A custom fetch implementation to use for all HTTP requests made by this client.
	*/
	constructor(address, options) {
		__publicField$3(this, "address");
		__publicField$3(this, "auth");
		__publicField$3(this, "adminAuth");
		__publicField$3(this, "encodedTsPromise");
		__publicField$3(this, "debug");
		__publicField$3(this, "fetchOptions");
		__publicField$3(this, "fetch");
		__publicField$3(this, "logger");
		__publicField$3(this, "mutationQueue", []);
		__publicField$3(this, "isProcessingQueue", false);
		if (typeof options === "boolean") throw new Error("skipConvexDeploymentUrlCheck as the second argument is no longer supported. Please pass an options object, `{ skipConvexDeploymentUrlCheck: true }`.");
		if ((options ?? {}).skipConvexDeploymentUrlCheck !== true) validateDeploymentUrl(address);
		this.logger = options?.logger === false ? instantiateNoopLogger({ verbose: false }) : options?.logger !== true && options?.logger ? options.logger : instantiateDefaultLogger({ verbose: false });
		this.address = address;
		this.debug = true;
		this.auth = void 0;
		this.adminAuth = void 0;
		this.fetch = options?.fetch;
		if (options?.auth) this.setAuth(options.auth);
	}
	/**
	* Obtain the {@link ConvexHttpClient}'s URL to its backend.
	* @deprecated Use url, which returns the url without /api at the end.
	*
	* @returns The URL to the Convex backend, including the client's API version.
	*/
	backendUrl() {
		return `${this.address}/api`;
	}
	/**
	* Return the address for this client, useful for creating a new client.
	*
	* Not guaranteed to match the address with which this client was constructed:
	* it may be canonicalized.
	*/
	get url() {
		return this.address;
	}
	/**
	* Set the authentication token to be used for subsequent queries and mutations.
	*
	* Should be called whenever the token changes (i.e. due to expiration and refresh).
	*
	* @param value - JWT-encoded OpenID Connect identity token.
	*/
	setAuth(value) {
		this.clearAuth();
		this.auth = value;
	}
	/**
	* Set admin auth token to allow calling internal queries, mutations, and actions
	* and acting as an identity.
	*
	* @internal
	*/
	setAdminAuth(token, actingAsIdentity) {
		this.clearAuth();
		if (actingAsIdentity !== void 0) {
			const bytes = new TextEncoder().encode(JSON.stringify(actingAsIdentity));
			const actingAsIdentityEncoded = btoa(String.fromCodePoint(...bytes));
			this.adminAuth = `${token}:${actingAsIdentityEncoded}`;
		} else this.adminAuth = token;
	}
	/**
	* Clear the current authentication token if set.
	*/
	clearAuth() {
		this.auth = void 0;
		this.adminAuth = void 0;
	}
	/**
	* Sets whether the result log lines should be printed on the console or not.
	*
	* @internal
	*/
	setDebug(debug) {
		this.debug = debug;
	}
	/**
	* Used to customize the fetch behavior in some runtimes.
	*
	* @internal
	*/
	setFetchOptions(fetchOptions) {
		this.fetchOptions = fetchOptions;
	}
	/**
	* This API is experimental: it may change or disappear.
	*
	* Execute a Convex query function at the same timestamp as every other
	* consistent query execution run by this HTTP client.
	*
	* This doesn't make sense for long-lived ConvexHttpClients as Convex
	* backends can read a limited amount into the past: beyond 30 seconds
	* in the past may not be available.
	*
	* Create a new client to use a consistent time.
	*
	* @param name - The name of the query.
	* @param args - The arguments object for the query. If this is omitted,
	* the arguments will be `{}`.
	* @returns A promise of the query's result.
	*
	* @deprecated This API is experimental: it may change or disappear.
	*/
	async consistentQuery(query, ...args) {
		const queryArgs = parseArgs(args[0]);
		const timestampPromise = this.getTimestamp();
		return await this.queryInner(query, queryArgs, { timestampPromise });
	}
	async getTimestamp() {
		if (this.encodedTsPromise) return this.encodedTsPromise;
		return this.encodedTsPromise = this.getTimestampInner();
	}
	async getTimestampInner() {
		const localFetch = this.fetch || specifiedFetch || fetch;
		const headers = {
			"Content-Type": "application/json",
			"Convex-Client": `npm-${version}`
		};
		const response = await localFetch(`${this.address}/api/query_ts`, {
			...this.fetchOptions,
			method: "POST",
			headers
		});
		if (!response.ok) throw new Error(await response.text());
		const { ts } = await response.json();
		return ts;
	}
	/**
	* Execute a Convex query function.
	*
	* @param name - The name of the query.
	* @param args - The arguments object for the query. If this is omitted,
	* the arguments will be `{}`.
	* @returns A promise of the query's result.
	*/
	async query(query, ...args) {
		const queryArgs = parseArgs(args[0]);
		return await this.queryInner(query, queryArgs, {});
	}
	async queryInner(query, queryArgs, options) {
		const name = getFunctionName(query);
		const args = [convexToJson(queryArgs)];
		const headers = {
			"Content-Type": "application/json",
			"Convex-Client": `npm-${version}`
		};
		if (this.adminAuth) headers["Authorization"] = `Convex ${this.adminAuth}`;
		else if (this.auth) headers["Authorization"] = `Bearer ${this.auth}`;
		const localFetch = this.fetch || specifiedFetch || fetch;
		const timestamp = options.timestampPromise ? await options.timestampPromise : void 0;
		const body = JSON.stringify({
			path: name,
			format: "convex_encoded_json",
			args,
			...timestamp ? { ts: timestamp } : {}
		});
		const response = await localFetch(timestamp ? `${this.address}/api/query_at_ts` : `${this.address}/api/query`, {
			...this.fetchOptions,
			body,
			method: "POST",
			headers
		});
		if (!response.ok && response.status !== 560) throw new Error(await response.text());
		const respJSON = await response.json();
		if (this.debug) for (const line of respJSON.logLines ?? []) logForFunction(this.logger, "info", "query", name, line);
		switch (respJSON.status) {
			case "success": return jsonToConvex(respJSON.value);
			case "error":
				if (respJSON.errorData !== void 0) throw forwardErrorData(respJSON.errorData, new ConvexError(respJSON.errorMessage));
				throw new Error(respJSON.errorMessage);
			default: throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
		}
	}
	async mutationInner(mutation, mutationArgs) {
		const name = getFunctionName(mutation);
		const body = JSON.stringify({
			path: name,
			format: "convex_encoded_json",
			args: [convexToJson(mutationArgs)]
		});
		const headers = {
			"Content-Type": "application/json",
			"Convex-Client": `npm-${version}`
		};
		if (this.adminAuth) headers["Authorization"] = `Convex ${this.adminAuth}`;
		else if (this.auth) headers["Authorization"] = `Bearer ${this.auth}`;
		const response = await (this.fetch || specifiedFetch || fetch)(`${this.address}/api/mutation`, {
			...this.fetchOptions,
			body,
			method: "POST",
			headers
		});
		if (!response.ok && response.status !== 560) throw new Error(await response.text());
		const respJSON = await response.json();
		if (this.debug) for (const line of respJSON.logLines ?? []) logForFunction(this.logger, "info", "mutation", name, line);
		switch (respJSON.status) {
			case "success": return jsonToConvex(respJSON.value);
			case "error":
				if (respJSON.errorData !== void 0) throw forwardErrorData(respJSON.errorData, new ConvexError(respJSON.errorMessage));
				throw new Error(respJSON.errorMessage);
			default: throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
		}
	}
	async processMutationQueue() {
		if (this.isProcessingQueue) return;
		this.isProcessingQueue = true;
		while (this.mutationQueue.length > 0) {
			const { mutation, args, resolve, reject } = this.mutationQueue.shift();
			try {
				resolve(await this.mutationInner(mutation, args));
			} catch (error) {
				reject(error);
			}
		}
		this.isProcessingQueue = false;
	}
	enqueueMutation(mutation, args) {
		return new Promise((resolve, reject) => {
			this.mutationQueue.push({
				mutation,
				args,
				resolve,
				reject
			});
			this.processMutationQueue();
		});
	}
	/**
	* Execute a Convex mutation function. Mutations are queued by default.
	*
	* @param name - The name of the mutation.
	* @param args - The arguments object for the mutation. If this is omitted,
	* the arguments will be `{}`.
	* @param options - An optional object containing
	* @returns A promise of the mutation's result.
	*/
	async mutation(mutation, ...args) {
		const [fnArgs, options] = args;
		const mutationArgs = parseArgs(fnArgs);
		if (!options?.skipQueue) return await this.enqueueMutation(mutation, mutationArgs);
		else return await this.mutationInner(mutation, mutationArgs);
	}
	/**
	* Execute a Convex action function. Actions are not queued.
	*
	* @param name - The name of the action.
	* @param args - The arguments object for the action. If this is omitted,
	* the arguments will be `{}`.
	* @returns A promise of the action's result.
	*/
	async action(action, ...args) {
		const actionArgs = parseArgs(args[0]);
		const name = getFunctionName(action);
		const body = JSON.stringify({
			path: name,
			format: "convex_encoded_json",
			args: [convexToJson(actionArgs)]
		});
		const headers = {
			"Content-Type": "application/json",
			"Convex-Client": `npm-${version}`
		};
		if (this.adminAuth) headers["Authorization"] = `Convex ${this.adminAuth}`;
		else if (this.auth) headers["Authorization"] = `Bearer ${this.auth}`;
		const response = await (this.fetch || specifiedFetch || fetch)(`${this.address}/api/action`, {
			...this.fetchOptions,
			body,
			method: "POST",
			headers
		});
		if (!response.ok && response.status !== 560) throw new Error(await response.text());
		const respJSON = await response.json();
		if (this.debug) for (const line of respJSON.logLines ?? []) logForFunction(this.logger, "info", "action", name, line);
		switch (respJSON.status) {
			case "success": return jsonToConvex(respJSON.value);
			case "error":
				if (respJSON.errorData !== void 0) throw forwardErrorData(respJSON.errorData, new ConvexError(respJSON.errorMessage));
				throw new Error(respJSON.errorMessage);
			default: throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
		}
	}
	/**
	* Execute a Convex function of an unknown type. These function calls are not queued.
	*
	* @param name - The name of the function.
	* @param args - The arguments object for the function. If this is omitted,
	* the arguments will be `{}`.
	* @returns A promise of the function's result.
	*
	* @internal
	*/
	async function(anyFunction, componentPath, ...args) {
		const functionArgs = parseArgs(args[0]);
		const name = typeof anyFunction === "string" ? anyFunction : getFunctionName(anyFunction);
		const body = JSON.stringify({
			componentPath,
			path: name,
			format: "convex_encoded_json",
			args: convexToJson(functionArgs)
		});
		const headers = {
			"Content-Type": "application/json",
			"Convex-Client": `npm-${version}`
		};
		if (this.adminAuth) headers["Authorization"] = `Convex ${this.adminAuth}`;
		else if (this.auth) headers["Authorization"] = `Bearer ${this.auth}`;
		const response = await (this.fetch || specifiedFetch || fetch)(`${this.address}/api/function`, {
			...this.fetchOptions,
			body,
			method: "POST",
			headers
		});
		if (!response.ok && response.status !== 560) throw new Error(await response.text());
		const respJSON = await response.json();
		if (this.debug) for (const line of respJSON.logLines ?? []) logForFunction(this.logger, "info", "any", name, line);
		switch (respJSON.status) {
			case "success": return jsonToConvex(respJSON.value);
			case "error":
				if (respJSON.errorData !== void 0) throw forwardErrorData(respJSON.errorData, new ConvexError(respJSON.errorMessage));
				throw new Error(respJSON.errorMessage);
			default: throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
		}
	}
};
function forwardErrorData(errorData, error) {
	error.data = jsonToConvex(errorData);
	return error;
}
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/pagination.js
var import_react = /* @__PURE__ */ __toESM(require_react(), 1);
function asPaginationResult(value) {
	if (typeof value !== "object" || value === null || !Array.isArray(value.page) || typeof value.isDone !== "boolean" || typeof value.continueCursor !== "string") throw new Error(`Not a valid paginated query result: ${value?.toString()}`);
	return value;
}
//#endregion
//#region node_modules/convex/dist/esm/browser/sync/paginated_query_client.js
var __defProp$3 = Object.defineProperty;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$3(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$2 = (obj, key, value) => __defNormalProp$2(obj, typeof key !== "symbol" ? key + "" : key, value);
var PaginatedQueryClient = class {
	constructor(client, onTransition) {
		this.client = client;
		this.onTransition = onTransition;
		__publicField$2(this, "paginatedQuerySet", /* @__PURE__ */ new Map());
		__publicField$2(this, "lastTransitionTs");
		this.lastTransitionTs = Long.fromNumber(0);
		this.client.addOnTransitionHandler((transition) => this.onBaseTransition(transition));
	}
	/**
	* Subscribe to a paginated query.
	*
	* @param name - The name of the paginated query function
	* @param args - Arguments for the query (excluding paginationOpts)
	* @param options - Pagination options including initialNumItems
	* @returns Object with paginatedQueryToken and unsubscribe function
	*/
	subscribe(name, args, options) {
		const canonicalizedUdfPath = canonicalizeUdfPath(name);
		const token = serializePaginatedPathAndArgs(canonicalizedUdfPath, args, options);
		const unsubscribe = () => this.removePaginatedQuerySubscriber(token);
		const existingEntry = this.paginatedQuerySet.get(token);
		if (existingEntry) {
			existingEntry.numSubscribers += 1;
			return {
				paginatedQueryToken: token,
				unsubscribe
			};
		}
		this.paginatedQuerySet.set(token, {
			token,
			canonicalizedUdfPath,
			args,
			numSubscribers: 1,
			options: { initialNumItems: options.initialNumItems },
			nextPageKey: 0,
			pageKeys: [],
			pageKeyToQuery: /* @__PURE__ */ new Map(),
			ongoingSplits: /* @__PURE__ */ new Map(),
			skip: false,
			id: options.id
		});
		this.addPageToPaginatedQuery(token, null, options.initialNumItems);
		return {
			paginatedQueryToken: token,
			unsubscribe
		};
	}
	/**
	* Get current results for a paginated query based on local state.
	*
	* Throws an error when one of the pages has errored.
	*/
	localQueryResult(name, args, options) {
		const token = serializePaginatedPathAndArgs(canonicalizeUdfPath(name), args, options);
		return this.localQueryResultByToken(token);
	}
	/**
	* @internal
	*/
	localQueryResultByToken(token) {
		const paginatedQuery = this.paginatedQuerySet.get(token);
		if (!paginatedQuery) return;
		const activePages = this.activePageQueryTokens(paginatedQuery);
		if (activePages.length === 0) return {
			results: [],
			status: "LoadingFirstPage",
			loadMore: (numItems) => {
				return this.loadMoreOfPaginatedQuery(token, numItems);
			}
		};
		let allResults = [];
		let hasUndefined = false;
		let isDone = false;
		for (const pageToken of activePages) {
			const result = this.client.localQueryResultByToken(pageToken);
			if (result === void 0) {
				hasUndefined = true;
				isDone = false;
				continue;
			}
			const paginationResult = asPaginationResult(result);
			allResults = allResults.concat(paginationResult.page);
			isDone = !!paginationResult.isDone;
		}
		let status;
		if (hasUndefined) status = allResults.length === 0 ? "LoadingFirstPage" : "LoadingMore";
		else if (isDone) status = "Exhausted";
		else status = "CanLoadMore";
		return {
			results: allResults,
			status,
			loadMore: (numItems) => {
				return this.loadMoreOfPaginatedQuery(token, numItems);
			}
		};
	}
	onBaseTransition(transition) {
		const changedBaseTokens = transition.queries.map((q) => q.token);
		const changed = this.queriesContainingTokens(changedBaseTokens);
		let paginatedQueries = [];
		if (changed.length > 0) {
			this.processPaginatedQuerySplits(changed, (token) => this.client.localQueryResultByToken(token));
			paginatedQueries = changed.map((token) => ({
				token,
				modification: {
					kind: "Updated",
					result: this.localQueryResultByToken(token)
				}
			}));
		}
		const extendedTransition = {
			...transition,
			paginatedQueries
		};
		this.onTransition(extendedTransition);
	}
	/**
	* Load more items for a paginated query.
	*
	* This *always* causes a transition, the status of the query
	* has probably changed from "CanLoadMore" to "LoadingMore".
	* Data might have changed too: maybe a subscription to this page
	* query already exists (unlikely but possible) or this page query
	* has an optimistic update providing some initial data.
	*
	* @internal
	*/
	loadMoreOfPaginatedQuery(token, numItems) {
		this.mustGetPaginatedQuery(token);
		const lastPageToken = this.queryTokenForLastPageOfPaginatedQuery(token);
		const lastPageResult = this.client.localQueryResultByToken(lastPageToken);
		if (!lastPageResult) return false;
		const paginationResult = asPaginationResult(lastPageResult);
		if (paginationResult.isDone) return false;
		this.addPageToPaginatedQuery(token, paginationResult.continueCursor, numItems);
		const loadMoreTransition = {
			timestamp: this.lastTransitionTs,
			reflectedMutations: [],
			queries: [],
			paginatedQueries: [{
				token,
				modification: {
					kind: "Updated",
					result: this.localQueryResultByToken(token)
				}
			}]
		};
		this.onTransition(loadMoreTransition);
		return true;
	}
	/**
	* @internal
	*/
	queriesContainingTokens(queryTokens) {
		if (queryTokens.length === 0) return [];
		const changed = [];
		const queryTokenSet = new Set(queryTokens);
		for (const [paginatedToken, paginatedQuery] of this.paginatedQuerySet) for (const pageToken of this.allQueryTokens(paginatedQuery)) if (queryTokenSet.has(pageToken)) {
			changed.push(paginatedToken);
			break;
		}
		return changed;
	}
	/**
	* @internal
	*/
	processPaginatedQuerySplits(changed, getResult) {
		for (const paginatedQueryToken of changed) {
			const paginatedQuery = this.mustGetPaginatedQuery(paginatedQueryToken);
			const { ongoingSplits, pageKeyToQuery, pageKeys } = paginatedQuery;
			for (const [pageKey, [splitKey1, splitKey2]] of ongoingSplits) if (getResult(pageKeyToQuery.get(splitKey1).queryToken) !== void 0 && getResult(pageKeyToQuery.get(splitKey2).queryToken) !== void 0) this.completePaginatedQuerySplit(paginatedQuery, pageKey, splitKey1, splitKey2);
			for (const pageKey of pageKeys) {
				if (ongoingSplits.has(pageKey)) continue;
				const pageToken = pageKeyToQuery.get(pageKey).queryToken;
				const pageResult = getResult(pageToken);
				if (!pageResult) continue;
				const result = asPaginationResult(pageResult);
				if (result.splitCursor && (result.pageStatus === "SplitRecommended" || result.pageStatus === "SplitRequired" || result.page.length > paginatedQuery.options.initialNumItems * 2)) this.splitPaginatedQueryPage(paginatedQuery, pageKey, result.splitCursor, result.continueCursor);
			}
		}
	}
	splitPaginatedQueryPage(paginatedQuery, pageKey, splitCursor, continueCursor) {
		const splitKey1 = paginatedQuery.nextPageKey++;
		const splitKey2 = paginatedQuery.nextPageKey++;
		const paginationOpts = {
			cursor: continueCursor,
			numItems: paginatedQuery.options.initialNumItems,
			id: paginatedQuery.id
		};
		const firstSubscription = this.client.subscribe(paginatedQuery.canonicalizedUdfPath, {
			...paginatedQuery.args,
			paginationOpts: {
				...paginationOpts,
				cursor: null,
				endCursor: splitCursor
			}
		});
		paginatedQuery.pageKeyToQuery.set(splitKey1, firstSubscription);
		const secondSubscription = this.client.subscribe(paginatedQuery.canonicalizedUdfPath, {
			...paginatedQuery.args,
			paginationOpts: {
				...paginationOpts,
				cursor: splitCursor,
				endCursor: continueCursor
			}
		});
		paginatedQuery.pageKeyToQuery.set(splitKey2, secondSubscription);
		paginatedQuery.ongoingSplits.set(pageKey, [splitKey1, splitKey2]);
	}
	/**
	* @internal
	*/
	addPageToPaginatedQuery(token, continueCursor, numItems) {
		const paginatedQuery = this.mustGetPaginatedQuery(token);
		const pageKey = paginatedQuery.nextPageKey++;
		const paginationOpts = {
			cursor: continueCursor,
			numItems,
			id: paginatedQuery.id
		};
		const pageArgs = {
			...paginatedQuery.args,
			paginationOpts
		};
		const subscription = this.client.subscribe(paginatedQuery.canonicalizedUdfPath, pageArgs);
		paginatedQuery.pageKeys.push(pageKey);
		paginatedQuery.pageKeyToQuery.set(pageKey, subscription);
		return subscription;
	}
	removePaginatedQuerySubscriber(token) {
		const paginatedQuery = this.paginatedQuerySet.get(token);
		if (!paginatedQuery) return;
		paginatedQuery.numSubscribers -= 1;
		if (paginatedQuery.numSubscribers > 0) return;
		for (const subscription of paginatedQuery.pageKeyToQuery.values()) subscription.unsubscribe();
		this.paginatedQuerySet.delete(token);
	}
	completePaginatedQuerySplit(paginatedQuery, pageKey, splitKey1, splitKey2) {
		const originalQuery = paginatedQuery.pageKeyToQuery.get(pageKey);
		paginatedQuery.pageKeyToQuery.delete(pageKey);
		const pageIndex = paginatedQuery.pageKeys.indexOf(pageKey);
		paginatedQuery.pageKeys.splice(pageIndex, 1, splitKey1, splitKey2);
		paginatedQuery.ongoingSplits.delete(pageKey);
		originalQuery.unsubscribe();
	}
	/** The query tokens for all active pages, in result order */
	activePageQueryTokens(paginatedQuery) {
		return paginatedQuery.pageKeys.map((pageKey) => paginatedQuery.pageKeyToQuery.get(pageKey).queryToken);
	}
	allQueryTokens(paginatedQuery) {
		return Array.from(paginatedQuery.pageKeyToQuery.values()).map((sub) => sub.queryToken);
	}
	queryTokenForLastPageOfPaginatedQuery(token) {
		const paginatedQuery = this.mustGetPaginatedQuery(token);
		const lastPageKey = paginatedQuery.pageKeys[paginatedQuery.pageKeys.length - 1];
		if (lastPageKey === void 0) throw new Error(`No pages for paginated query ${token}`);
		return paginatedQuery.pageKeyToQuery.get(lastPageKey).queryToken;
	}
	mustGetPaginatedQuery(token) {
		const paginatedQuery = this.paginatedQuerySet.get(token);
		if (!paginatedQuery) throw new Error("paginated query no longer exists for token " + token);
		return paginatedQuery;
	}
};
//#endregion
//#region node_modules/common-tags/es/TemplateTag/TemplateTag.js
var _createClass = function() {
	function defineProperties(target, props) {
		for (var i = 0; i < props.length; i++) {
			var descriptor = props[i];
			descriptor.enumerable = descriptor.enumerable || false;
			descriptor.configurable = true;
			if ("value" in descriptor) descriptor.writable = true;
			Object.defineProperty(target, descriptor.key, descriptor);
		}
	}
	return function(Constructor, protoProps, staticProps) {
		if (protoProps) defineProperties(Constructor.prototype, protoProps);
		if (staticProps) defineProperties(Constructor, staticProps);
		return Constructor;
	};
}();
var _templateObject = _taggedTemplateLiteral(["", ""], ["", ""]);
function _taggedTemplateLiteral(strings, raw) {
	return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } }));
}
function _classCallCheck(instance, Constructor) {
	if (!(instance instanceof Constructor)) throw new TypeError("Cannot call a class as a function");
}
/**
* @class TemplateTag
* @classdesc Consumes a pipeline of composable transformer plugins and produces a template tag.
*/
var TemplateTag = function() {
	/**
	* constructs a template tag
	* @constructs TemplateTag
	* @param  {...Object} [...transformers] - an array or arguments list of transformers
	* @return {Function}                    - a template tag
	*/
	function TemplateTag() {
		var _this = this;
		for (var _len = arguments.length, transformers = Array(_len), _key = 0; _key < _len; _key++) transformers[_key] = arguments[_key];
		_classCallCheck(this, TemplateTag);
		this.tag = function(strings) {
			for (var _len2 = arguments.length, expressions = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) expressions[_key2 - 1] = arguments[_key2];
			if (typeof strings === "function") return _this.interimTag.bind(_this, strings);
			if (typeof strings === "string") return _this.transformEndResult(strings);
			strings = strings.map(_this.transformString.bind(_this));
			return _this.transformEndResult(strings.reduce(_this.processSubstitutions.bind(_this, expressions)));
		};
		if (transformers.length > 0 && Array.isArray(transformers[0])) transformers = transformers[0];
		this.transformers = transformers.map(function(transformer) {
			return typeof transformer === "function" ? transformer() : transformer;
		});
		return this.tag;
	}
	/**
	* Applies all transformers to a template literal tagged with this method.
	* If a function is passed as the first argument, assumes the function is a template tag
	* and applies it to the template, returning a template tag.
	* @param  {(Function|String|Array<String>)} strings        - Either a template tag or an array containing template strings separated by identifier
	* @param  {...*}                            ...expressions - Optional list of substitution values.
	* @return {(String|Function)}                              - Either an intermediary tag function or the results of processing the template.
	*/
	_createClass(TemplateTag, [
		{
			key: "interimTag",
			/**
			* An intermediary template tag that receives a template tag and passes the result of calling the template with the received
			* template tag to our own template tag.
			* @param  {Function}        nextTag          - the received template tag
			* @param  {Array<String>}   template         - the template to process
			* @param  {...*}            ...substitutions - `substitutions` is an array of all substitutions in the template
			* @return {*}                                - the final processed value
			*/
			value: function interimTag(previousTag, template) {
				for (var _len3 = arguments.length, substitutions = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) substitutions[_key3 - 2] = arguments[_key3];
				return this.tag(_templateObject, previousTag.apply(void 0, [template].concat(substitutions)));
			}
		},
		{
			key: "processSubstitutions",
			value: function processSubstitutions(substitutions, resultSoFar, remainingPart) {
				var substitution = this.transformSubstitution(substitutions.shift(), resultSoFar);
				return "".concat(resultSoFar, substitution, remainingPart);
			}
		},
		{
			key: "transformString",
			value: function transformString(str) {
				return this.transformers.reduce(function cb(res, transform) {
					return transform.onString ? transform.onString(res) : res;
				}, str);
			}
		},
		{
			key: "transformSubstitution",
			value: function transformSubstitution(substitution, resultSoFar) {
				return this.transformers.reduce(function cb(res, transform) {
					return transform.onSubstitution ? transform.onSubstitution(res, resultSoFar) : res;
				}, substitution);
			}
		},
		{
			key: "transformEndResult",
			value: function transformEndResult(endResult) {
				return this.transformers.reduce(function cb(res, transform) {
					return transform.onEndResult ? transform.onEndResult(res) : res;
				}, endResult);
			}
		}
	]);
	return TemplateTag;
}();
//#endregion
//#region node_modules/common-tags/es/trimResultTransformer/trimResultTransformer.js
/**
* TemplateTag transformer that trims whitespace on the end result of a tagged template
* @param  {String} side = '' - The side of the string to trim. Can be 'start' or 'end' (alternatively 'left' or 'right')
* @return {Object}           - a TemplateTag transformer
*/
var trimResultTransformer = function trimResultTransformer() {
	var side = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
	return { onEndResult: function onEndResult(endResult) {
		if (side === "") return endResult.trim();
		side = side.toLowerCase();
		if (side === "start" || side === "left") return endResult.replace(/^\s*/, "");
		if (side === "end" || side === "right") return endResult.replace(/\s*$/, "");
		throw new Error("Side not supported: " + side);
	} };
};
//#endregion
//#region node_modules/common-tags/es/stripIndentTransformer/stripIndentTransformer.js
function _toConsumableArray(arr) {
	if (Array.isArray(arr)) {
		for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
		return arr2;
	} else return Array.from(arr);
}
/**
* strips indentation from a template literal
* @param  {String} type = 'initial' - whether to remove all indentation or just leading indentation. can be 'all' or 'initial'
* @return {Object}                  - a TemplateTag transformer
*/
var stripIndentTransformer = function stripIndentTransformer() {
	var type = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "initial";
	return { onEndResult: function onEndResult(endResult) {
		if (type === "initial") {
			var match = endResult.match(/^[^\S\n]*(?=\S)/gm);
			var indent = match && Math.min.apply(Math, _toConsumableArray(match.map(function(el) {
				return el.length;
			})));
			if (indent) {
				var regexp = new RegExp("^.{" + indent + "}", "gm");
				return endResult.replace(regexp, "");
			}
			return endResult;
		}
		if (type === "all") return endResult.replace(/^[^\S\n]+/gm, "");
		throw new Error("Unknown type: " + type);
	} };
};
//#endregion
//#region node_modules/common-tags/es/replaceResultTransformer/replaceResultTransformer.js
/**
* Replaces tabs, newlines and spaces with the chosen value when they occur in sequences
* @param  {(String|RegExp)} replaceWhat - the value or pattern that should be replaced
* @param  {*}               replaceWith - the replacement value
* @return {Object}                      - a TemplateTag transformer
*/
var replaceResultTransformer = function replaceResultTransformer(replaceWhat, replaceWith) {
	return { onEndResult: function onEndResult(endResult) {
		if (replaceWhat == null || replaceWith == null) throw new Error("replaceResultTransformer requires at least 2 arguments.");
		return endResult.replace(replaceWhat, replaceWith);
	} };
};
//#endregion
//#region node_modules/common-tags/es/replaceSubstitutionTransformer/replaceSubstitutionTransformer.js
var replaceSubstitutionTransformer = function replaceSubstitutionTransformer(replaceWhat, replaceWith) {
	return { onSubstitution: function onSubstitution(substitution, resultSoFar) {
		if (replaceWhat == null || replaceWith == null) throw new Error("replaceSubstitutionTransformer requires at least 2 arguments.");
		if (substitution == null) return substitution;
		else return substitution.toString().replace(replaceWhat, replaceWith);
	} };
};
//#endregion
//#region node_modules/common-tags/es/inlineArrayTransformer/inlineArrayTransformer.js
var defaults = {
	separator: "",
	conjunction: "",
	serial: false
};
/**
* Converts an array substitution to a string containing a list
* @param  {String} [opts.separator = ''] - the character that separates each item
* @param  {String} [opts.conjunction = '']  - replace the last separator with this
* @param  {Boolean} [opts.serial = false] - include the separator before the conjunction? (Oxford comma use-case)
*
* @return {Object}                     - a TemplateTag transformer
*/
var inlineArrayTransformer = function inlineArrayTransformer() {
	var opts = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : defaults;
	return { onSubstitution: function onSubstitution(substitution, resultSoFar) {
		if (Array.isArray(substitution)) {
			var arrayLength = substitution.length;
			var separator = opts.separator;
			var conjunction = opts.conjunction;
			var serial = opts.serial;
			var indent = resultSoFar.match(/(\n?[^\S\n]+)$/);
			if (indent) substitution = substitution.join(separator + indent[1]);
			else substitution = substitution.join(separator + " ");
			if (conjunction && arrayLength > 1) {
				var separatorIndex = substitution.lastIndexOf(separator);
				substitution = substitution.slice(0, separatorIndex) + (serial ? separator : "") + " " + conjunction + substitution.slice(separatorIndex + 1);
			}
		}
		return substitution;
	} };
};
//#endregion
//#region node_modules/common-tags/es/splitStringTransformer/splitStringTransformer.js
var splitStringTransformer = function splitStringTransformer(splitBy) {
	return { onSubstitution: function onSubstitution(substitution, resultSoFar) {
		if (splitBy != null && typeof splitBy === "string") {
			if (typeof substitution === "string" && substitution.includes(splitBy)) substitution = substitution.split(splitBy);
		} else throw new Error("You need to specify a string character to split by.");
		return substitution;
	} };
};
//#endregion
//#region node_modules/common-tags/es/removeNonPrintingValuesTransformer/removeNonPrintingValuesTransformer.js
var isValidValue = function isValidValue(x) {
	return x != null && !Number.isNaN(x) && typeof x !== "boolean";
};
var removeNonPrintingValuesTransformer = function removeNonPrintingValuesTransformer() {
	return { onSubstitution: function onSubstitution(substitution) {
		if (Array.isArray(substitution)) return substitution.filter(isValidValue);
		if (isValidValue(substitution)) return substitution;
		return "";
	} };
};
new TemplateTag(inlineArrayTransformer({ separator: "," }), stripIndentTransformer, trimResultTransformer);
new TemplateTag(inlineArrayTransformer({
	separator: ",",
	conjunction: "and"
}), stripIndentTransformer, trimResultTransformer);
new TemplateTag(inlineArrayTransformer({
	separator: ",",
	conjunction: "or"
}), stripIndentTransformer, trimResultTransformer);
new TemplateTag(splitStringTransformer("\n"), removeNonPrintingValuesTransformer, inlineArrayTransformer, stripIndentTransformer, trimResultTransformer);
new TemplateTag(splitStringTransformer("\n"), inlineArrayTransformer, stripIndentTransformer, trimResultTransformer, replaceSubstitutionTransformer(/&/g, "&amp;"), replaceSubstitutionTransformer(/</g, "&lt;"), replaceSubstitutionTransformer(/>/g, "&gt;"), replaceSubstitutionTransformer(/"/g, "&quot;"), replaceSubstitutionTransformer(/'/g, "&#x27;"), replaceSubstitutionTransformer(/`/g, "&#x60;"));
new TemplateTag(replaceResultTransformer(/(?:\n(?:\s*))+/g, " "), trimResultTransformer);
new TemplateTag(replaceResultTransformer(/(?:\n\s*)/g, ""), trimResultTransformer);
new TemplateTag(inlineArrayTransformer({ separator: "," }), replaceResultTransformer(/(?:\s+)/g, " "), trimResultTransformer);
new TemplateTag(inlineArrayTransformer({
	separator: ",",
	conjunction: "or"
}), replaceResultTransformer(/(?:\s+)/g, " "), trimResultTransformer);
new TemplateTag(inlineArrayTransformer({
	separator: ",",
	conjunction: "and"
}), replaceResultTransformer(/(?:\s+)/g, " "), trimResultTransformer);
new TemplateTag(inlineArrayTransformer, stripIndentTransformer, trimResultTransformer);
new TemplateTag(inlineArrayTransformer, replaceResultTransformer(/(?:\s+)/g, " "), trimResultTransformer);
//#endregion
//#region node_modules/common-tags/es/stripIndent/stripIndent.js
var stripIndent = new TemplateTag(stripIndentTransformer, trimResultTransformer);
new TemplateTag(stripIndentTransformer("all"), trimResultTransformer);
//#endregion
//#region node_modules/better-auth/dist/utils/wildcard.mjs
/**
* Escapes a character if it has a special meaning in regular expressions
* and returns the character as is if it doesn't
*/
function escapeRegExpChar(char) {
	if (char === "-" || char === "^" || char === "$" || char === "+" || char === "." || char === "(" || char === ")" || char === "|" || char === "[" || char === "]" || char === "{" || char === "}" || char === "*" || char === "?" || char === "\\") return `\\${char}`;
	else return char;
}
/**
* Escapes all characters in a given string that have a special meaning in regular expressions
*/
function escapeRegExpString(str) {
	let result = "";
	for (let i = 0; i < str.length; i++) result += escapeRegExpChar(str[i]);
	return result;
}
/**
* Transforms one or more glob patterns into a RegExp pattern
*/
function transform(pattern, separator = true) {
	if (Array.isArray(pattern)) return `(?:${pattern.map((p) => `^${transform(p, separator)}$`).join("|")})`;
	let separatorSplitter = "";
	let separatorMatcher = "";
	let wildcard = ".";
	if (separator === true) {
		separatorSplitter = "/";
		separatorMatcher = "[/\\\\]";
		wildcard = "[^/\\\\]";
	} else if (separator) {
		separatorSplitter = separator;
		separatorMatcher = escapeRegExpString(separatorSplitter);
		if (separatorMatcher.length > 1) {
			separatorMatcher = `(?:${separatorMatcher})`;
			wildcard = `((?!${separatorMatcher}).)`;
		} else wildcard = `[^${separatorMatcher}]`;
	}
	const requiredSeparator = separator ? `${separatorMatcher}+?` : "";
	const optionalSeparator = separator ? `${separatorMatcher}*?` : "";
	const segments = separator ? pattern.split(separatorSplitter) : [pattern];
	let result = "";
	for (let s = 0; s < segments.length; s++) {
		const segment = segments[s];
		const nextSegment = segments[s + 1];
		let currentSeparator = "";
		if (!segment && s > 0) continue;
		if (separator) if (s === segments.length - 1) currentSeparator = optionalSeparator;
		else if (nextSegment !== "**") currentSeparator = requiredSeparator;
		else currentSeparator = "";
		if (separator && segment === "**") {
			if (currentSeparator) {
				result += s === 0 ? "" : currentSeparator;
				result += `(?:${wildcard}*?${currentSeparator})*?`;
			}
			continue;
		}
		for (let c = 0; c < segment.length; c++) {
			const char = segment[c];
			if (char === "\\") {
				if (c < segment.length - 1) {
					result += escapeRegExpChar(segment[c + 1]);
					c++;
				}
			} else if (char === "?") result += wildcard;
			else if (char === "*") result += `${wildcard}*?`;
			else result += escapeRegExpChar(char);
		}
		result += currentSeparator;
	}
	return result;
}
function isMatch(regexp, sample) {
	if (typeof sample !== "string") throw new TypeError(`Sample must be a string, but ${typeof sample} given`);
	return regexp.test(sample);
}
/**
* Compiles one or more glob patterns into a RegExp and returns an isMatch function.
* The isMatch function takes a sample string as its only argument and returns `true`
* if the string matches the pattern(s).
*
* ```js
* wildcardMatch('src/*.js')('src/index.js') //=> true
* ```
*
* ```js
* const isMatch = wildcardMatch('*.example.com', '.')
* isMatch('foo.example.com') //=> true
* isMatch('foo.bar.com') //=> false
* ```
*/
function wildcardMatch(pattern, options) {
	if (typeof pattern !== "string" && !Array.isArray(pattern)) throw new TypeError(`The first argument must be a single pattern string or an array of patterns, but ${typeof pattern} given`);
	if (typeof options === "string" || typeof options === "boolean") options = { separator: options };
	if (arguments.length === 2 && !(typeof options === "undefined" || typeof options === "object" && options !== null && !Array.isArray(options))) throw new TypeError(`The second argument must be an options object or a string/boolean separator, but ${typeof options} given`);
	options = options || {};
	if (options.separator === "\\") throw new Error("\\ is not a valid separator because it is used for escaping. Try setting the separator to `true` instead");
	const regexpPattern = transform(pattern, options.separator);
	const regexp = new RegExp(`^${regexpPattern}$`, options.flags);
	const fn = isMatch.bind(null, regexp);
	fn.options = options;
	fn.pattern = pattern;
	fn.regexp = regexp;
	return fn;
}
//#endregion
//#region node_modules/better-auth/dist/utils/url.mjs
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
function getProtocol(url) {
	try {
		return new URL(url).protocol;
	} catch {
		return null;
	}
}
function getHost(url) {
	try {
		return new URL(url).host;
	} catch {
		return null;
	}
}
//#endregion
//#region node_modules/better-auth/dist/utils/date.mjs
var getDate = (span, unit = "ms") => {
	return new Date(Date.now() + (unit === "sec" ? span * 1e3 : span));
};
//#endregion
//#region node_modules/better-auth/dist/db/schema.mjs
var cache$1 = /* @__PURE__ */ new WeakMap();
function getFields(options, modelName, mode) {
	const cacheKey = `${modelName}:${mode}`;
	if (!cache$1.has(options)) cache$1.set(options, /* @__PURE__ */ new Map());
	const tableCache = cache$1.get(options);
	if (tableCache.has(cacheKey)) return tableCache.get(cacheKey);
	const coreSchema = mode === "output" ? getAuthTables(options)[modelName]?.fields ?? {} : {};
	const additionalFields = modelName === "user" || modelName === "session" || modelName === "account" ? options[modelName]?.additionalFields : void 0;
	let schema = {
		...coreSchema,
		...additionalFields ?? {}
	};
	for (const plugin of options.plugins || []) if (plugin.schema && plugin.schema[modelName]) schema = {
		...schema,
		...plugin.schema[modelName].fields
	};
	tableCache.set(cacheKey, schema);
	return schema;
}
function parseUserOutput(options, user) {
	return filterOutputFields(user, getFields(options, "user", "output"));
}
function parseSessionOutput(options, session) {
	return filterOutputFields(session, getFields(options, "session", "output"));
}
function parseAccountOutput(options, account) {
	const { accessToken: _accessToken, refreshToken: _refreshToken, idToken: _idToken, accessTokenExpiresAt: _accessTokenExpiresAt, refreshTokenExpiresAt: _refreshTokenExpiresAt, password: _password, ...rest } = filterOutputFields(account, getFields(options, "account", "output"));
	return rest;
}
function parseInputData(data, schema) {
	const action = schema.action || "create";
	const fields = schema.fields;
	const parsedData = Object.create(null);
	for (const key in fields) {
		if (key in data) {
			if (fields[key].input === false) {
				if (fields[key].defaultValue !== void 0) {
					if (action !== "update") {
						parsedData[key] = fields[key].defaultValue;
						continue;
					}
				}
				if (data[key]) throw APIError.from("BAD_REQUEST", {
					...BASE_ERROR_CODES.FIELD_NOT_ALLOWED,
					message: `${key} is not allowed to be set`
				});
				continue;
			}
			if (fields[key].validator?.input && data[key] !== void 0) {
				const result = fields[key].validator.input["~standard"].validate(data[key]);
				if (result instanceof Promise) throw APIError.from("INTERNAL_SERVER_ERROR", BASE_ERROR_CODES.ASYNC_VALIDATION_NOT_SUPPORTED);
				if ("issues" in result && result.issues) throw APIError.from("BAD_REQUEST", {
					...BASE_ERROR_CODES.VALIDATION_ERROR,
					message: result.issues[0]?.message || "Validation Error"
				});
				parsedData[key] = result.value;
				continue;
			}
			if (fields[key].transform?.input && data[key] !== void 0) {
				parsedData[key] = fields[key].transform?.input(data[key]);
				continue;
			}
			parsedData[key] = data[key];
			continue;
		}
		if (fields[key].defaultValue !== void 0 && action === "create") {
			if (typeof fields[key].defaultValue === "function") {
				parsedData[key] = fields[key].defaultValue();
				continue;
			}
			parsedData[key] = fields[key].defaultValue;
			continue;
		}
		if (fields[key].required && action === "create") throw APIError.from("BAD_REQUEST", {
			...BASE_ERROR_CODES.MISSING_FIELD,
			message: `${key} is required`
		});
	}
	return parsedData;
}
function parseUserInput(options, user = {}, action) {
	return parseInputData(user, {
		fields: getFields(options, "user", "input"),
		action
	});
}
function parseAdditionalUserInput(options, user) {
	const schema = getFields(options, "user", "input");
	return parseInputData(user || {}, { fields: schema });
}
function parseAccountInput(options, account) {
	return parseInputData(account, { fields: getFields(options, "account", "input") });
}
function parseSessionInput(options, session, action) {
	return parseInputData(session, {
		fields: getFields(options, "session", "input"),
		action
	});
}
function getSessionDefaultFields(options) {
	const fields = getFields(options, "session", "input");
	const defaults = {};
	for (const key in fields) if (fields[key].defaultValue !== void 0) defaults[key] = typeof fields[key].defaultValue === "function" ? fields[key].defaultValue() : fields[key].defaultValue;
	return defaults;
}
function mergeSchema(schema, newSchema) {
	if (!newSchema) return schema;
	for (const table in newSchema) {
		const newModelName = newSchema[table]?.modelName;
		if (newModelName) schema[table].modelName = newModelName;
		for (const field in schema[table].fields) {
			const newField = newSchema[table]?.fields?.[field];
			if (!newField) continue;
			schema[table].fields[field].fieldName = newField;
		}
	}
	return schema;
}
//#endregion
//#region node_modules/better-auth/dist/utils/is-promise.mjs
function isPromise(obj) {
	return !!obj && (typeof obj === "object" || typeof obj === "function") && typeof obj.then === "function";
}
//#endregion
//#region node_modules/@noble/hashes/utils.js
/**
* Utilities for hex, bytes, CSPRNG.
* @module
*/
/*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
function isBytes$1(a) {
	return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
/** Asserts something is positive integer. */
function anumber$1(n, title = "") {
	if (!Number.isSafeInteger(n) || n < 0) {
		const prefix = title && `"${title}" `;
		throw new Error(`${prefix}expected integer >= 0, got ${n}`);
	}
}
/** Asserts something is Uint8Array. */
function abytes$1(value, length, title = "") {
	const bytes = isBytes$1(value);
	const len = value?.length;
	const needsLen = length !== void 0;
	if (!bytes || needsLen && len !== length) {
		const prefix = title && `"${title}" `;
		const ofLen = needsLen ? ` of length ${length}` : "";
		const got = bytes ? `length=${len}` : `type=${typeof value}`;
		throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
	}
	return value;
}
/** Asserts something is hash */
function ahash(h) {
	if (typeof h !== "function" || typeof h.create !== "function") throw new Error("Hash must wrapped by utils.createHasher");
	anumber$1(h.outputLen);
	anumber$1(h.blockLen);
}
/** Asserts a hash instance has not been destroyed / finished */
function aexists$1(instance, checkFinished = true) {
	if (instance.destroyed) throw new Error("Hash instance has been destroyed");
	if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
}
/** Asserts output is properly-sized byte array */
function aoutput$1(out, instance) {
	abytes$1(out, void 0, "digestInto() output");
	const min = instance.outputLen;
	if (out.length < min) throw new Error("\"digestInto() output\" expected to be of length >=" + min);
}
/** Zeroize a byte array. Warning: JS provides no guarantees. */
function clean$1(...arrays) {
	for (let i = 0; i < arrays.length; i++) arrays[i].fill(0);
}
/** Create DataView of an array for easy byte-level manipulation. */
function createView$1(arr) {
	return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
/** The rotate right (circular right shift) operation for uint32 */
function rotr(word, shift) {
	return word << 32 - shift | word >>> shift;
}
/** Creates function with outputLen, blockLen, create properties from a class constructor. */
function createHasher(hashCons, info = {}) {
	const hashC = (msg, opts) => hashCons(opts).update(msg).digest();
	const tmp = hashCons(void 0);
	hashC.outputLen = tmp.outputLen;
	hashC.blockLen = tmp.blockLen;
	hashC.create = (opts) => hashCons(opts);
	Object.assign(hashC, info);
	return Object.freeze(hashC);
}
/** Creates OID opts for NIST hashes, with prefix 06 09 60 86 48 01 65 03 04 02. */
var oidNist = (suffix) => ({ oid: Uint8Array.from([
	6,
	9,
	96,
	134,
	72,
	1,
	101,
	3,
	4,
	2,
	suffix
]) });
//#endregion
//#region node_modules/@noble/hashes/hmac.js
/**
* HMAC: RFC2104 message authentication code.
* @module
*/
/** Internal class for HMAC. */
var _HMAC = class {
	oHash;
	iHash;
	blockLen;
	outputLen;
	finished = false;
	destroyed = false;
	constructor(hash, key) {
		ahash(hash);
		abytes$1(key, void 0, "key");
		this.iHash = hash.create();
		if (typeof this.iHash.update !== "function") throw new Error("Expected instance of class which extends utils.Hash");
		this.blockLen = this.iHash.blockLen;
		this.outputLen = this.iHash.outputLen;
		const blockLen = this.blockLen;
		const pad = new Uint8Array(blockLen);
		pad.set(key.length > blockLen ? hash.create().update(key).digest() : key);
		for (let i = 0; i < pad.length; i++) pad[i] ^= 54;
		this.iHash.update(pad);
		this.oHash = hash.create();
		for (let i = 0; i < pad.length; i++) pad[i] ^= 106;
		this.oHash.update(pad);
		clean$1(pad);
	}
	update(buf) {
		aexists$1(this);
		this.iHash.update(buf);
		return this;
	}
	digestInto(out) {
		aexists$1(this);
		abytes$1(out, this.outputLen, "output");
		this.finished = true;
		this.iHash.digestInto(out);
		this.oHash.update(out);
		this.oHash.digestInto(out);
		this.destroy();
	}
	digest() {
		const out = new Uint8Array(this.oHash.outputLen);
		this.digestInto(out);
		return out;
	}
	_cloneInto(to) {
		to ||= Object.create(Object.getPrototypeOf(this), {});
		const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
		to = to;
		to.finished = finished;
		to.destroyed = destroyed;
		to.blockLen = blockLen;
		to.outputLen = outputLen;
		to.oHash = oHash._cloneInto(to.oHash);
		to.iHash = iHash._cloneInto(to.iHash);
		return to;
	}
	clone() {
		return this._cloneInto();
	}
	destroy() {
		this.destroyed = true;
		this.oHash.destroy();
		this.iHash.destroy();
	}
};
/**
* HMAC: RFC2104 message authentication code.
* @param hash - function that would be used e.g. sha256
* @param key - message key
* @param message - message data
* @example
* import { hmac } from '@noble/hashes/hmac';
* import { sha256 } from '@noble/hashes/sha2';
* const mac1 = hmac(sha256, 'key', 'message');
*/
var hmac = (hash, key, message) => new _HMAC(hash, key).update(message).digest();
hmac.create = (hash, key) => new _HMAC(hash, key);
//#endregion
//#region node_modules/@noble/hashes/hkdf.js
/**
* HKDF (RFC 5869): extract + expand in one step.
* See https://soatok.blog/2021/11/17/understanding-hkdf/.
* @module
*/
/**
* HKDF-extract from spec. Less important part. `HKDF-Extract(IKM, salt) -> PRK`
* Arguments position differs from spec (IKM is first one, since it is not optional)
* @param hash - hash function that would be used (e.g. sha256)
* @param ikm - input keying material, the initial key
* @param salt - optional salt value (a non-secret random value)
*/
function extract(hash, ikm, salt) {
	ahash(hash);
	if (salt === void 0) salt = new Uint8Array(hash.outputLen);
	return hmac(hash, salt, ikm);
}
var HKDF_COUNTER = /* @__PURE__ */ Uint8Array.of(0);
var EMPTY_BUFFER = /* @__PURE__ */ Uint8Array.of();
/**
* HKDF-expand from the spec. The most important part. `HKDF-Expand(PRK, info, L) -> OKM`
* @param hash - hash function that would be used (e.g. sha256)
* @param prk - a pseudorandom key of at least HashLen octets (usually, the output from the extract step)
* @param info - optional context and application specific information (can be a zero-length string)
* @param length - length of output keying material in bytes
*/
function expand(hash, prk, info, length = 32) {
	ahash(hash);
	anumber$1(length, "length");
	const olen = hash.outputLen;
	if (length > 255 * olen) throw new Error("Length must be <= 255*HashLen");
	const blocks = Math.ceil(length / olen);
	if (info === void 0) info = EMPTY_BUFFER;
	else abytes$1(info, void 0, "info");
	const okm = new Uint8Array(blocks * olen);
	const HMAC = hmac.create(hash, prk);
	const HMACTmp = HMAC._cloneInto();
	const T = new Uint8Array(HMAC.outputLen);
	for (let counter = 0; counter < blocks; counter++) {
		HKDF_COUNTER[0] = counter + 1;
		HMACTmp.update(counter === 0 ? EMPTY_BUFFER : T).update(info).update(HKDF_COUNTER).digestInto(T);
		okm.set(T, olen * counter);
		HMAC._cloneInto(HMACTmp);
	}
	HMAC.destroy();
	HMACTmp.destroy();
	clean$1(T, HKDF_COUNTER);
	return okm.slice(0, length);
}
/**
* HKDF (RFC 5869): derive keys from an initial input.
* Combines hkdf_extract + hkdf_expand in one step
* @param hash - hash function that would be used (e.g. sha256)
* @param ikm - input keying material, the initial key
* @param salt - optional salt value (a non-secret random value)
* @param info - optional context and application specific information (can be a zero-length string)
* @param length - length of output keying material in bytes
* @example
* import { hkdf } from '@noble/hashes/hkdf';
* import { sha256 } from '@noble/hashes/sha2';
* import { randomBytes } from '@noble/hashes/utils';
* const inputKey = randomBytes(32);
* const salt = randomBytes(32);
* const info = 'application-key';
* const hk1 = hkdf(sha256, inputKey, salt, info, 32);
*/
var hkdf = (hash, ikm, salt, info, length) => expand(hash, extract(hash, ikm, salt), info, length);
//#endregion
//#region node_modules/@noble/hashes/_md.js
/**
* Internal Merkle-Damgard hash utils.
* @module
*/
/** Choice: a ? b : c */
function Chi(a, b, c) {
	return a & b ^ ~a & c;
}
/** Majority function, true if any two inputs is true. */
function Maj(a, b, c) {
	return a & b ^ a & c ^ b & c;
}
/**
* Merkle-Damgard hash construction base class.
* Could be used to create MD5, RIPEMD, SHA1, SHA2.
*/
var HashMD = class {
	blockLen;
	outputLen;
	padOffset;
	isLE;
	buffer;
	view;
	finished = false;
	length = 0;
	pos = 0;
	destroyed = false;
	constructor(blockLen, outputLen, padOffset, isLE) {
		this.blockLen = blockLen;
		this.outputLen = outputLen;
		this.padOffset = padOffset;
		this.isLE = isLE;
		this.buffer = new Uint8Array(blockLen);
		this.view = createView$1(this.buffer);
	}
	update(data) {
		aexists$1(this);
		abytes$1(data);
		const { view, buffer, blockLen } = this;
		const len = data.length;
		for (let pos = 0; pos < len;) {
			const take = Math.min(blockLen - this.pos, len - pos);
			if (take === blockLen) {
				const dataView = createView$1(data);
				for (; blockLen <= len - pos; pos += blockLen) this.process(dataView, pos);
				continue;
			}
			buffer.set(data.subarray(pos, pos + take), this.pos);
			this.pos += take;
			pos += take;
			if (this.pos === blockLen) {
				this.process(view, 0);
				this.pos = 0;
			}
		}
		this.length += data.length;
		this.roundClean();
		return this;
	}
	digestInto(out) {
		aexists$1(this);
		aoutput$1(out, this);
		this.finished = true;
		const { buffer, view, blockLen, isLE } = this;
		let { pos } = this;
		buffer[pos++] = 128;
		clean$1(this.buffer.subarray(pos));
		if (this.padOffset > blockLen - pos) {
			this.process(view, 0);
			pos = 0;
		}
		for (let i = pos; i < blockLen; i++) buffer[i] = 0;
		view.setBigUint64(blockLen - 8, BigInt(this.length * 8), isLE);
		this.process(view, 0);
		const oview = createView$1(out);
		const len = this.outputLen;
		if (len % 4) throw new Error("_sha2: outputLen must be aligned to 32bit");
		const outLen = len / 4;
		const state = this.get();
		if (outLen > state.length) throw new Error("_sha2: outputLen bigger than state");
		for (let i = 0; i < outLen; i++) oview.setUint32(4 * i, state[i], isLE);
	}
	digest() {
		const { buffer, outputLen } = this;
		this.digestInto(buffer);
		const res = buffer.slice(0, outputLen);
		this.destroy();
		return res;
	}
	_cloneInto(to) {
		to ||= new this.constructor();
		to.set(...this.get());
		const { blockLen, buffer, length, finished, destroyed, pos } = this;
		to.destroyed = destroyed;
		to.finished = finished;
		to.length = length;
		to.pos = pos;
		if (length % blockLen) to.buffer.set(buffer);
		return to;
	}
	clone() {
		return this._cloneInto();
	}
};
/**
* Initial SHA-2 state: fractional parts of square roots of first 16 primes 2..53.
* Check out `test/misc/sha2-gen-iv.js` for recomputation guide.
*/
/** Initial SHA256 state. Bits 0..32 of frac part of sqrt of primes 2..19 */
var SHA256_IV = /* @__PURE__ */ Uint32Array.from([
	1779033703,
	3144134277,
	1013904242,
	2773480762,
	1359893119,
	2600822924,
	528734635,
	1541459225
]);
//#endregion
//#region node_modules/@noble/hashes/sha2.js
/**
* SHA2 hash function. A.k.a. sha256, sha384, sha512, sha512_224, sha512_256.
* SHA256 is the fastest hash implementable in JS, even faster than Blake3.
* Check out [RFC 4634](https://www.rfc-editor.org/rfc/rfc4634) and
* [FIPS 180-4](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.180-4.pdf).
* @module
*/
/**
* Round constants:
* First 32 bits of fractional parts of the cube roots of the first 64 primes 2..311)
*/
var SHA256_K = /* @__PURE__ */ Uint32Array.from([
	1116352408,
	1899447441,
	3049323471,
	3921009573,
	961987163,
	1508970993,
	2453635748,
	2870763221,
	3624381080,
	310598401,
	607225278,
	1426881987,
	1925078388,
	2162078206,
	2614888103,
	3248222580,
	3835390401,
	4022224774,
	264347078,
	604807628,
	770255983,
	1249150122,
	1555081692,
	1996064986,
	2554220882,
	2821834349,
	2952996808,
	3210313671,
	3336571891,
	3584528711,
	113926993,
	338241895,
	666307205,
	773529912,
	1294757372,
	1396182291,
	1695183700,
	1986661051,
	2177026350,
	2456956037,
	2730485921,
	2820302411,
	3259730800,
	3345764771,
	3516065817,
	3600352804,
	4094571909,
	275423344,
	430227734,
	506948616,
	659060556,
	883997877,
	958139571,
	1322822218,
	1537002063,
	1747873779,
	1955562222,
	2024104815,
	2227730452,
	2361852424,
	2428436474,
	2756734187,
	3204031479,
	3329325298
]);
/** Reusable temporary buffer. "W" comes straight from spec. */
var SHA256_W = /* @__PURE__ */ new Uint32Array(64);
/** Internal 32-byte base SHA2 hash class. */
var SHA2_32B = class extends HashMD {
	constructor(outputLen) {
		super(64, outputLen, 8, false);
	}
	get() {
		const { A, B, C, D, E, F, G, H } = this;
		return [
			A,
			B,
			C,
			D,
			E,
			F,
			G,
			H
		];
	}
	set(A, B, C, D, E, F, G, H) {
		this.A = A | 0;
		this.B = B | 0;
		this.C = C | 0;
		this.D = D | 0;
		this.E = E | 0;
		this.F = F | 0;
		this.G = G | 0;
		this.H = H | 0;
	}
	process(view, offset) {
		for (let i = 0; i < 16; i++, offset += 4) SHA256_W[i] = view.getUint32(offset, false);
		for (let i = 16; i < 64; i++) {
			const W15 = SHA256_W[i - 15];
			const W2 = SHA256_W[i - 2];
			const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ W15 >>> 3;
			SHA256_W[i] = (rotr(W2, 17) ^ rotr(W2, 19) ^ W2 >>> 10) + SHA256_W[i - 7] + s0 + SHA256_W[i - 16] | 0;
		}
		let { A, B, C, D, E, F, G, H } = this;
		for (let i = 0; i < 64; i++) {
			const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
			const T1 = H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i] | 0;
			const T2 = (rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22)) + Maj(A, B, C) | 0;
			H = G;
			G = F;
			F = E;
			E = D + T1 | 0;
			D = C;
			C = B;
			B = A;
			A = T1 + T2 | 0;
		}
		A = A + this.A | 0;
		B = B + this.B | 0;
		C = C + this.C | 0;
		D = D + this.D | 0;
		E = E + this.E | 0;
		F = F + this.F | 0;
		G = G + this.G | 0;
		H = H + this.H | 0;
		this.set(A, B, C, D, E, F, G, H);
	}
	roundClean() {
		clean$1(SHA256_W);
	}
	destroy() {
		this.set(0, 0, 0, 0, 0, 0, 0, 0);
		clean$1(this.buffer);
	}
};
/** Internal SHA2-256 hash class. */
var _SHA256 = class extends SHA2_32B {
	A = SHA256_IV[0] | 0;
	B = SHA256_IV[1] | 0;
	C = SHA256_IV[2] | 0;
	D = SHA256_IV[3] | 0;
	E = SHA256_IV[4] | 0;
	F = SHA256_IV[5] | 0;
	G = SHA256_IV[6] | 0;
	H = SHA256_IV[7] | 0;
	constructor() {
		super(32);
	}
};
/**
* SHA2-256 hash function from RFC 4634. In JS it's the fastest: even faster than Blake3. Some info:
*
* - Trying 2^128 hashes would get 50% chance of collision, using birthday attack.
* - BTC network is doing 2^70 hashes/sec (2^95 hashes/year) as per 2025.
* - Each sha256 hash is executing 2^18 bit operations.
* - Good 2024 ASICs can do 200Th/sec with 3500 watts of power, corresponding to 2^36 hashes/joule.
*/
var sha256 = /* @__PURE__ */ createHasher(() => new _SHA256(), /* @__PURE__ */ oidNist(1));
//#endregion
//#region node_modules/jose/dist/webapi/lib/iv.js
function bitLength(alg) {
	switch (alg) {
		case "A128GCM":
		case "A128GCMKW":
		case "A192GCM":
		case "A192GCMKW":
		case "A256GCM":
		case "A256GCMKW": return 96;
		case "A128CBC-HS256":
		case "A192CBC-HS384":
		case "A256CBC-HS512": return 128;
		default: throw new JOSENotSupported(`Unsupported JWE Algorithm: ${alg}`);
	}
}
var generateIv = (alg) => crypto.getRandomValues(new Uint8Array(bitLength(alg) >> 3));
//#endregion
//#region node_modules/jose/dist/webapi/lib/check_iv_length.js
function checkIvLength(enc, iv) {
	if (iv.length << 3 !== bitLength(enc)) throw new JWEInvalid("Invalid Initialization Vector length");
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/check_cek_length.js
function checkCekLength(cek, expected) {
	const actual = cek.byteLength << 3;
	if (actual !== expected) throw new JWEInvalid(`Invalid Content Encryption Key length. Expected ${expected} bits, got ${actual} bits`);
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/decrypt.js
async function timingSafeEqual(a, b) {
	if (!(a instanceof Uint8Array)) throw new TypeError("First argument must be a buffer");
	if (!(b instanceof Uint8Array)) throw new TypeError("Second argument must be a buffer");
	const algorithm = {
		name: "HMAC",
		hash: "SHA-256"
	};
	const key = await crypto.subtle.generateKey(algorithm, false, ["sign"]);
	const aHmac = new Uint8Array(await crypto.subtle.sign(algorithm, key, a));
	const bHmac = new Uint8Array(await crypto.subtle.sign(algorithm, key, b));
	let out = 0;
	let i = -1;
	while (++i < 32) out |= aHmac[i] ^ bHmac[i];
	return out === 0;
}
async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
	if (!(cek instanceof Uint8Array)) throw new TypeError(invalidKeyInput(cek, "Uint8Array"));
	const keySize = parseInt(enc.slice(1, 4), 10);
	const encKey = await crypto.subtle.importKey("raw", cek.subarray(keySize >> 3), "AES-CBC", false, ["decrypt"]);
	const macKey = await crypto.subtle.importKey("raw", cek.subarray(0, keySize >> 3), {
		hash: `SHA-${keySize << 1}`,
		name: "HMAC"
	}, false, ["sign"]);
	const macData = concat(aad, iv, ciphertext, uint64be(aad.length << 3));
	const expectedTag = new Uint8Array((await crypto.subtle.sign("HMAC", macKey, macData)).slice(0, keySize >> 3));
	let macCheckPassed;
	try {
		macCheckPassed = await timingSafeEqual(tag, expectedTag);
	} catch {}
	if (!macCheckPassed) throw new JWEDecryptionFailed();
	let plaintext;
	try {
		plaintext = new Uint8Array(await crypto.subtle.decrypt({
			iv,
			name: "AES-CBC"
		}, encKey, ciphertext));
	} catch {}
	if (!plaintext) throw new JWEDecryptionFailed();
	return plaintext;
}
async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
	let encKey;
	if (cek instanceof Uint8Array) encKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["decrypt"]);
	else {
		checkEncCryptoKey(cek, enc, "decrypt");
		encKey = cek;
	}
	try {
		return new Uint8Array(await crypto.subtle.decrypt({
			additionalData: aad,
			iv,
			name: "AES-GCM",
			tagLength: 128
		}, encKey, concat(ciphertext, tag)));
	} catch {
		throw new JWEDecryptionFailed();
	}
}
async function decrypt$1(enc, cek, ciphertext, iv, tag, aad) {
	if (!isCryptoKey(cek) && !(cek instanceof Uint8Array)) throw new TypeError(invalidKeyInput(cek, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
	if (!iv) throw new JWEInvalid("JWE Initialization Vector missing");
	if (!tag) throw new JWEInvalid("JWE Authentication Tag missing");
	checkIvLength(enc, iv);
	switch (enc) {
		case "A128CBC-HS256":
		case "A192CBC-HS384":
		case "A256CBC-HS512":
			if (cek instanceof Uint8Array) checkCekLength(cek, parseInt(enc.slice(-3), 10));
			return cbcDecrypt(enc, cek, ciphertext, iv, tag, aad);
		case "A128GCM":
		case "A192GCM":
		case "A256GCM":
			if (cek instanceof Uint8Array) checkCekLength(cek, parseInt(enc.slice(1, 4), 10));
			return gcmDecrypt(enc, cek, ciphertext, iv, tag, aad);
		default: throw new JOSENotSupported("Unsupported JWE Content Encryption Algorithm");
	}
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/aeskw.js
function checkKeySize(key, alg) {
	if (key.algorithm.length !== parseInt(alg.slice(1, 4), 10)) throw new TypeError(`Invalid key size for alg: ${alg}`);
}
function getCryptoKey$1(key, alg, usage) {
	if (key instanceof Uint8Array) return crypto.subtle.importKey("raw", key, "AES-KW", true, [usage]);
	checkEncCryptoKey(key, alg, usage);
	return key;
}
async function wrap$2(alg, key, cek) {
	const cryptoKey = await getCryptoKey$1(key, alg, "wrapKey");
	checkKeySize(cryptoKey, alg);
	const cryptoKeyCek = await crypto.subtle.importKey("raw", cek, {
		hash: "SHA-256",
		name: "HMAC"
	}, true, ["sign"]);
	return new Uint8Array(await crypto.subtle.wrapKey("raw", cryptoKeyCek, cryptoKey, "AES-KW"));
}
async function unwrap$2(alg, key, encryptedKey) {
	const cryptoKey = await getCryptoKey$1(key, alg, "unwrapKey");
	checkKeySize(cryptoKey, alg);
	const cryptoKeyCek = await crypto.subtle.unwrapKey("raw", encryptedKey, cryptoKey, "AES-KW", {
		hash: "SHA-256",
		name: "HMAC"
	}, true, ["sign"]);
	return new Uint8Array(await crypto.subtle.exportKey("raw", cryptoKeyCek));
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/digest.js
async function digest(algorithm, data) {
	const subtleDigest = `SHA-${algorithm.slice(-3)}`;
	return new Uint8Array(await crypto.subtle.digest(subtleDigest, data));
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/ecdhes.js
function lengthAndInput(input) {
	return concat(uint32be(input.length), input);
}
async function concatKdf(Z, L, OtherInfo) {
	const dkLen = L >> 3;
	const hashLen = 32;
	const reps = Math.ceil(dkLen / hashLen);
	const dk = new Uint8Array(reps * hashLen);
	for (let i = 1; i <= reps; i++) {
		const hashInput = new Uint8Array(4 + Z.length + OtherInfo.length);
		hashInput.set(uint32be(i), 0);
		hashInput.set(Z, 4);
		hashInput.set(OtherInfo, 4 + Z.length);
		const hashResult = await digest("sha256", hashInput);
		dk.set(hashResult, (i - 1) * hashLen);
	}
	return dk.slice(0, dkLen);
}
async function deriveKey$1(publicKey, privateKey, algorithm, keyLength, apu = new Uint8Array(), apv = new Uint8Array()) {
	checkEncCryptoKey(publicKey, "ECDH");
	checkEncCryptoKey(privateKey, "ECDH", "deriveBits");
	const otherInfo = concat(lengthAndInput(encode(algorithm)), lengthAndInput(apu), lengthAndInput(apv), uint32be(keyLength), new Uint8Array());
	return concatKdf(new Uint8Array(await crypto.subtle.deriveBits({
		name: publicKey.algorithm.name,
		public: publicKey
	}, privateKey, getEcdhBitLength(publicKey))), keyLength, otherInfo);
}
function getEcdhBitLength(publicKey) {
	if (publicKey.algorithm.name === "X25519") return 256;
	return Math.ceil(parseInt(publicKey.algorithm.namedCurve.slice(-3), 10) / 8) << 3;
}
function allowed(key) {
	switch (key.algorithm.namedCurve) {
		case "P-256":
		case "P-384":
		case "P-521": return true;
		default: return key.algorithm.name === "X25519";
	}
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/pbes2kw.js
function getCryptoKey(key, alg) {
	if (key instanceof Uint8Array) return crypto.subtle.importKey("raw", key, "PBKDF2", false, ["deriveBits"]);
	checkEncCryptoKey(key, alg, "deriveBits");
	return key;
}
var concatSalt = (alg, p2sInput) => concat(encode(alg), Uint8Array.of(0), p2sInput);
async function deriveKey(p2s, alg, p2c, key) {
	if (!(p2s instanceof Uint8Array) || p2s.length < 8) throw new JWEInvalid("PBES2 Salt Input must be 8 or more octets");
	const salt = concatSalt(alg, p2s);
	const keylen = parseInt(alg.slice(13, 16), 10);
	const subtleAlg = {
		hash: `SHA-${alg.slice(8, 11)}`,
		iterations: p2c,
		name: "PBKDF2",
		salt
	};
	const cryptoKey = await getCryptoKey(key, alg);
	return new Uint8Array(await crypto.subtle.deriveBits(subtleAlg, cryptoKey, keylen));
}
async function wrap$1(alg, key, cek, p2c = 2048, p2s = crypto.getRandomValues(new Uint8Array(16))) {
	const derived = await deriveKey(p2s, alg, p2c, key);
	return {
		encryptedKey: await wrap$2(alg.slice(-6), derived, cek),
		p2c,
		p2s: encode$1(p2s)
	};
}
async function unwrap$1(alg, key, encryptedKey, p2c, p2s) {
	const derived = await deriveKey(p2s, alg, p2c, key);
	return unwrap$2(alg.slice(-6), derived, encryptedKey);
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/rsaes.js
var subtleAlgorithm = (alg) => {
	switch (alg) {
		case "RSA-OAEP":
		case "RSA-OAEP-256":
		case "RSA-OAEP-384":
		case "RSA-OAEP-512": return "RSA-OAEP";
		default: throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
	}
};
async function encrypt$1(alg, key, cek) {
	checkEncCryptoKey(key, alg, "encrypt");
	checkKeyLength(alg, key);
	return new Uint8Array(await crypto.subtle.encrypt(subtleAlgorithm(alg), key, cek));
}
async function decrypt(alg, key, encryptedKey) {
	checkEncCryptoKey(key, alg, "decrypt");
	checkKeyLength(alg, key);
	return new Uint8Array(await crypto.subtle.decrypt(subtleAlgorithm(alg), key, encryptedKey));
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/cek.js
function cekLength(alg) {
	switch (alg) {
		case "A128GCM": return 128;
		case "A192GCM": return 192;
		case "A256GCM":
		case "A128CBC-HS256": return 256;
		case "A192CBC-HS384": return 384;
		case "A256CBC-HS512": return 512;
		default: throw new JOSENotSupported(`Unsupported JWE Algorithm: ${alg}`);
	}
}
var generateCek = (alg) => crypto.getRandomValues(new Uint8Array(cekLength(alg) >> 3));
//#endregion
//#region node_modules/jose/dist/webapi/lib/encrypt.js
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
	if (!(cek instanceof Uint8Array)) throw new TypeError(invalidKeyInput(cek, "Uint8Array"));
	const keySize = parseInt(enc.slice(1, 4), 10);
	const encKey = await crypto.subtle.importKey("raw", cek.subarray(keySize >> 3), "AES-CBC", false, ["encrypt"]);
	const macKey = await crypto.subtle.importKey("raw", cek.subarray(0, keySize >> 3), {
		hash: `SHA-${keySize << 1}`,
		name: "HMAC"
	}, false, ["sign"]);
	const ciphertext = new Uint8Array(await crypto.subtle.encrypt({
		iv,
		name: "AES-CBC"
	}, encKey, plaintext));
	const macData = concat(aad, iv, ciphertext, uint64be(aad.length << 3));
	return {
		ciphertext,
		tag: new Uint8Array((await crypto.subtle.sign("HMAC", macKey, macData)).slice(0, keySize >> 3)),
		iv
	};
}
async function gcmEncrypt(enc, plaintext, cek, iv, aad) {
	let encKey;
	if (cek instanceof Uint8Array) encKey = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
	else {
		checkEncCryptoKey(cek, enc, "encrypt");
		encKey = cek;
	}
	const encrypted = new Uint8Array(await crypto.subtle.encrypt({
		additionalData: aad,
		iv,
		name: "AES-GCM",
		tagLength: 128
	}, encKey, plaintext));
	const tag = encrypted.slice(-16);
	return {
		ciphertext: encrypted.slice(0, -16),
		tag,
		iv
	};
}
async function encrypt(enc, plaintext, cek, iv, aad) {
	if (!isCryptoKey(cek) && !(cek instanceof Uint8Array)) throw new TypeError(invalidKeyInput(cek, "CryptoKey", "KeyObject", "Uint8Array", "JSON Web Key"));
	if (iv) checkIvLength(enc, iv);
	else iv = generateIv(enc);
	switch (enc) {
		case "A128CBC-HS256":
		case "A192CBC-HS384":
		case "A256CBC-HS512":
			if (cek instanceof Uint8Array) checkCekLength(cek, parseInt(enc.slice(-3), 10));
			return cbcEncrypt(enc, plaintext, cek, iv, aad);
		case "A128GCM":
		case "A192GCM":
		case "A256GCM":
			if (cek instanceof Uint8Array) checkCekLength(cek, parseInt(enc.slice(1, 4), 10));
			return gcmEncrypt(enc, plaintext, cek, iv, aad);
		default: throw new JOSENotSupported("Unsupported JWE Content Encryption Algorithm");
	}
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/aesgcmkw.js
async function wrap(alg, key, cek, iv) {
	const wrapped = await encrypt(alg.slice(0, 7), cek, key, iv, new Uint8Array());
	return {
		encryptedKey: wrapped.ciphertext,
		iv: encode$1(wrapped.iv),
		tag: encode$1(wrapped.tag)
	};
}
async function unwrap(alg, key, encryptedKey, iv, tag) {
	return decrypt$1(alg.slice(0, 7), key, encryptedKey, iv, tag, new Uint8Array());
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/decrypt_key_management.js
async function decryptKeyManagement(alg, key, encryptedKey, joseHeader, options) {
	switch (alg) {
		case "dir":
			if (encryptedKey !== void 0) throw new JWEInvalid("Encountered unexpected JWE Encrypted Key");
			return key;
		case "ECDH-ES": if (encryptedKey !== void 0) throw new JWEInvalid("Encountered unexpected JWE Encrypted Key");
		case "ECDH-ES+A128KW":
		case "ECDH-ES+A192KW":
		case "ECDH-ES+A256KW": {
			if (!isObject(joseHeader.epk)) throw new JWEInvalid(`JOSE Header "epk" (Ephemeral Public Key) missing or invalid`);
			assertCryptoKey(key);
			if (!allowed(key)) throw new JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
			const epk = await importJWK(joseHeader.epk, alg);
			assertCryptoKey(epk);
			let partyUInfo;
			let partyVInfo;
			if (joseHeader.apu !== void 0) {
				if (typeof joseHeader.apu !== "string") throw new JWEInvalid(`JOSE Header "apu" (Agreement PartyUInfo) invalid`);
				try {
					partyUInfo = decode(joseHeader.apu);
				} catch {
					throw new JWEInvalid("Failed to base64url decode the apu");
				}
			}
			if (joseHeader.apv !== void 0) {
				if (typeof joseHeader.apv !== "string") throw new JWEInvalid(`JOSE Header "apv" (Agreement PartyVInfo) invalid`);
				try {
					partyVInfo = decode(joseHeader.apv);
				} catch {
					throw new JWEInvalid("Failed to base64url decode the apv");
				}
			}
			const sharedSecret = await deriveKey$1(epk, key, alg === "ECDH-ES" ? joseHeader.enc : alg, alg === "ECDH-ES" ? cekLength(joseHeader.enc) : parseInt(alg.slice(-5, -2), 10), partyUInfo, partyVInfo);
			if (alg === "ECDH-ES") return sharedSecret;
			if (encryptedKey === void 0) throw new JWEInvalid("JWE Encrypted Key missing");
			return unwrap$2(alg.slice(-6), sharedSecret, encryptedKey);
		}
		case "RSA-OAEP":
		case "RSA-OAEP-256":
		case "RSA-OAEP-384":
		case "RSA-OAEP-512":
			if (encryptedKey === void 0) throw new JWEInvalid("JWE Encrypted Key missing");
			assertCryptoKey(key);
			return decrypt(alg, key, encryptedKey);
		case "PBES2-HS256+A128KW":
		case "PBES2-HS384+A192KW":
		case "PBES2-HS512+A256KW": {
			if (encryptedKey === void 0) throw new JWEInvalid("JWE Encrypted Key missing");
			if (typeof joseHeader.p2c !== "number") throw new JWEInvalid(`JOSE Header "p2c" (PBES2 Count) missing or invalid`);
			const p2cLimit = options?.maxPBES2Count || 1e4;
			if (joseHeader.p2c > p2cLimit) throw new JWEInvalid(`JOSE Header "p2c" (PBES2 Count) out is of acceptable bounds`);
			if (typeof joseHeader.p2s !== "string") throw new JWEInvalid(`JOSE Header "p2s" (PBES2 Salt) missing or invalid`);
			let p2s;
			try {
				p2s = decode(joseHeader.p2s);
			} catch {
				throw new JWEInvalid("Failed to base64url decode the p2s");
			}
			return unwrap$1(alg, key, encryptedKey, joseHeader.p2c, p2s);
		}
		case "A128KW":
		case "A192KW":
		case "A256KW":
			if (encryptedKey === void 0) throw new JWEInvalid("JWE Encrypted Key missing");
			return unwrap$2(alg, key, encryptedKey);
		case "A128GCMKW":
		case "A192GCMKW":
		case "A256GCMKW": {
			if (encryptedKey === void 0) throw new JWEInvalid("JWE Encrypted Key missing");
			if (typeof joseHeader.iv !== "string") throw new JWEInvalid(`JOSE Header "iv" (Initialization Vector) missing or invalid`);
			if (typeof joseHeader.tag !== "string") throw new JWEInvalid(`JOSE Header "tag" (Authentication Tag) missing or invalid`);
			let iv;
			try {
				iv = decode(joseHeader.iv);
			} catch {
				throw new JWEInvalid("Failed to base64url decode the iv");
			}
			let tag;
			try {
				tag = decode(joseHeader.tag);
			} catch {
				throw new JWEInvalid("Failed to base64url decode the tag");
			}
			return unwrap(alg, key, encryptedKey, iv, tag);
		}
		default: throw new JOSENotSupported("Invalid or unsupported \"alg\" (JWE Algorithm) header value");
	}
}
//#endregion
//#region node_modules/jose/dist/webapi/jwe/flattened/decrypt.js
async function flattenedDecrypt(jwe, key, options) {
	if (!isObject(jwe)) throw new JWEInvalid("Flattened JWE must be an object");
	if (jwe.protected === void 0 && jwe.header === void 0 && jwe.unprotected === void 0) throw new JWEInvalid("JOSE Header missing");
	if (jwe.iv !== void 0 && typeof jwe.iv !== "string") throw new JWEInvalid("JWE Initialization Vector incorrect type");
	if (typeof jwe.ciphertext !== "string") throw new JWEInvalid("JWE Ciphertext missing or incorrect type");
	if (jwe.tag !== void 0 && typeof jwe.tag !== "string") throw new JWEInvalid("JWE Authentication Tag incorrect type");
	if (jwe.protected !== void 0 && typeof jwe.protected !== "string") throw new JWEInvalid("JWE Protected Header incorrect type");
	if (jwe.encrypted_key !== void 0 && typeof jwe.encrypted_key !== "string") throw new JWEInvalid("JWE Encrypted Key incorrect type");
	if (jwe.aad !== void 0 && typeof jwe.aad !== "string") throw new JWEInvalid("JWE AAD incorrect type");
	if (jwe.header !== void 0 && !isObject(jwe.header)) throw new JWEInvalid("JWE Shared Unprotected Header incorrect type");
	if (jwe.unprotected !== void 0 && !isObject(jwe.unprotected)) throw new JWEInvalid("JWE Per-Recipient Unprotected Header incorrect type");
	let parsedProt;
	if (jwe.protected) try {
		const protectedHeader = decode(jwe.protected);
		parsedProt = JSON.parse(decoder.decode(protectedHeader));
	} catch {
		throw new JWEInvalid("JWE Protected Header is invalid");
	}
	if (!isDisjoint(parsedProt, jwe.header, jwe.unprotected)) throw new JWEInvalid("JWE Protected, JWE Unprotected Header, and JWE Per-Recipient Unprotected Header Parameter names must be disjoint");
	const joseHeader = {
		...parsedProt,
		...jwe.header,
		...jwe.unprotected
	};
	validateCrit(JWEInvalid, /* @__PURE__ */ new Map(), options?.crit, parsedProt, joseHeader);
	if (joseHeader.zip !== void 0) throw new JOSENotSupported("JWE \"zip\" (Compression Algorithm) Header Parameter is not supported.");
	const { alg, enc } = joseHeader;
	if (typeof alg !== "string" || !alg) throw new JWEInvalid("missing JWE Algorithm (alg) in JWE Header");
	if (typeof enc !== "string" || !enc) throw new JWEInvalid("missing JWE Encryption Algorithm (enc) in JWE Header");
	const keyManagementAlgorithms = options && validateAlgorithms("keyManagementAlgorithms", options.keyManagementAlgorithms);
	const contentEncryptionAlgorithms = options && validateAlgorithms("contentEncryptionAlgorithms", options.contentEncryptionAlgorithms);
	if (keyManagementAlgorithms && !keyManagementAlgorithms.has(alg) || !keyManagementAlgorithms && alg.startsWith("PBES2")) throw new JOSEAlgNotAllowed("\"alg\" (Algorithm) Header Parameter value not allowed");
	if (contentEncryptionAlgorithms && !contentEncryptionAlgorithms.has(enc)) throw new JOSEAlgNotAllowed("\"enc\" (Encryption Algorithm) Header Parameter value not allowed");
	let encryptedKey;
	if (jwe.encrypted_key !== void 0) try {
		encryptedKey = decode(jwe.encrypted_key);
	} catch {
		throw new JWEInvalid("Failed to base64url decode the encrypted_key");
	}
	let resolvedKey = false;
	if (typeof key === "function") {
		key = await key(parsedProt, jwe);
		resolvedKey = true;
	}
	checkKeyType(alg === "dir" ? enc : alg, key, "decrypt");
	const k = await normalizeKey(key, alg);
	let cek;
	try {
		cek = await decryptKeyManagement(alg, k, encryptedKey, joseHeader, options);
	} catch (err) {
		if (err instanceof TypeError || err instanceof JWEInvalid || err instanceof JOSENotSupported) throw err;
		cek = generateCek(enc);
	}
	let iv;
	let tag;
	if (jwe.iv !== void 0) try {
		iv = decode(jwe.iv);
	} catch {
		throw new JWEInvalid("Failed to base64url decode the iv");
	}
	if (jwe.tag !== void 0) try {
		tag = decode(jwe.tag);
	} catch {
		throw new JWEInvalid("Failed to base64url decode the tag");
	}
	const protectedHeader = jwe.protected !== void 0 ? encode(jwe.protected) : new Uint8Array();
	let additionalData;
	if (jwe.aad !== void 0) additionalData = concat(protectedHeader, encode("."), encode(jwe.aad));
	else additionalData = protectedHeader;
	let ciphertext;
	try {
		ciphertext = decode(jwe.ciphertext);
	} catch {
		throw new JWEInvalid("Failed to base64url decode the ciphertext");
	}
	const result = { plaintext: await decrypt$1(enc, cek, ciphertext, iv, tag, additionalData) };
	if (jwe.protected !== void 0) result.protectedHeader = parsedProt;
	if (jwe.aad !== void 0) try {
		result.additionalAuthenticatedData = decode(jwe.aad);
	} catch {
		throw new JWEInvalid("Failed to base64url decode the aad");
	}
	if (jwe.unprotected !== void 0) result.sharedUnprotectedHeader = jwe.unprotected;
	if (jwe.header !== void 0) result.unprotectedHeader = jwe.header;
	if (resolvedKey) return {
		...result,
		key: k
	};
	return result;
}
//#endregion
//#region node_modules/jose/dist/webapi/jwe/compact/decrypt.js
async function compactDecrypt(jwe, key, options) {
	if (jwe instanceof Uint8Array) jwe = decoder.decode(jwe);
	if (typeof jwe !== "string") throw new JWEInvalid("Compact JWE must be a string or Uint8Array");
	const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length } = jwe.split(".");
	if (length !== 5) throw new JWEInvalid("Invalid Compact JWE");
	const decrypted = await flattenedDecrypt({
		ciphertext,
		iv: iv || void 0,
		protected: protectedHeader,
		tag: tag || void 0,
		encrypted_key: encryptedKey || void 0
	}, key, options);
	const result = {
		plaintext: decrypted.plaintext,
		protectedHeader: decrypted.protectedHeader
	};
	if (typeof key === "function") return {
		...result,
		key: decrypted.key
	};
	return result;
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/private_symbols.js
var unprotected = Symbol();
//#endregion
//#region node_modules/jose/dist/webapi/lib/key_to_jwk.js
async function keyToJWK(key) {
	if (isKeyObject(key)) if (key.type === "secret") key = key.export();
	else return key.export({ format: "jwk" });
	if (key instanceof Uint8Array) return {
		kty: "oct",
		k: encode$1(key)
	};
	if (!isCryptoKey(key)) throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "Uint8Array"));
	if (!key.extractable) throw new TypeError("non-extractable CryptoKey cannot be exported as a JWK");
	const { ext, key_ops, alg, use, ...jwk } = await crypto.subtle.exportKey("jwk", key);
	if (jwk.kty === "AKP") jwk.alg = alg;
	return jwk;
}
//#endregion
//#region node_modules/jose/dist/webapi/key/export.js
async function exportJWK(key) {
	return keyToJWK(key);
}
//#endregion
//#region node_modules/jose/dist/webapi/lib/encrypt_key_management.js
async function encryptKeyManagement(alg, enc, key, providedCek, providedParameters = {}) {
	let encryptedKey;
	let parameters;
	let cek;
	switch (alg) {
		case "dir":
			cek = key;
			break;
		case "ECDH-ES":
		case "ECDH-ES+A128KW":
		case "ECDH-ES+A192KW":
		case "ECDH-ES+A256KW": {
			assertCryptoKey(key);
			if (!allowed(key)) throw new JOSENotSupported("ECDH with the provided key is not allowed or not supported by your javascript runtime");
			const { apu, apv } = providedParameters;
			let ephemeralKey;
			if (providedParameters.epk) ephemeralKey = await normalizeKey(providedParameters.epk, alg);
			else ephemeralKey = (await crypto.subtle.generateKey(key.algorithm, true, ["deriveBits"])).privateKey;
			const { x, y, crv, kty } = await exportJWK(ephemeralKey);
			const sharedSecret = await deriveKey$1(key, ephemeralKey, alg === "ECDH-ES" ? enc : alg, alg === "ECDH-ES" ? cekLength(enc) : parseInt(alg.slice(-5, -2), 10), apu, apv);
			parameters = { epk: {
				x,
				crv,
				kty
			} };
			if (kty === "EC") parameters.epk.y = y;
			if (apu) parameters.apu = encode$1(apu);
			if (apv) parameters.apv = encode$1(apv);
			if (alg === "ECDH-ES") {
				cek = sharedSecret;
				break;
			}
			cek = providedCek || generateCek(enc);
			encryptedKey = await wrap$2(alg.slice(-6), sharedSecret, cek);
			break;
		}
		case "RSA-OAEP":
		case "RSA-OAEP-256":
		case "RSA-OAEP-384":
		case "RSA-OAEP-512":
			cek = providedCek || generateCek(enc);
			assertCryptoKey(key);
			encryptedKey = await encrypt$1(alg, key, cek);
			break;
		case "PBES2-HS256+A128KW":
		case "PBES2-HS384+A192KW":
		case "PBES2-HS512+A256KW": {
			cek = providedCek || generateCek(enc);
			const { p2c, p2s } = providedParameters;
			({encryptedKey, ...parameters} = await wrap$1(alg, key, cek, p2c, p2s));
			break;
		}
		case "A128KW":
		case "A192KW":
		case "A256KW":
			cek = providedCek || generateCek(enc);
			encryptedKey = await wrap$2(alg, key, cek);
			break;
		case "A128GCMKW":
		case "A192GCMKW":
		case "A256GCMKW": {
			cek = providedCek || generateCek(enc);
			const { iv } = providedParameters;
			({encryptedKey, ...parameters} = await wrap(alg, key, cek, iv));
			break;
		}
		default: throw new JOSENotSupported("Invalid or unsupported \"alg\" (JWE Algorithm) header value");
	}
	return {
		cek,
		encryptedKey,
		parameters
	};
}
//#endregion
//#region node_modules/jose/dist/webapi/jwe/flattened/encrypt.js
var FlattenedEncrypt = class {
	#plaintext;
	#protectedHeader;
	#sharedUnprotectedHeader;
	#unprotectedHeader;
	#aad;
	#cek;
	#iv;
	#keyManagementParameters;
	constructor(plaintext) {
		if (!(plaintext instanceof Uint8Array)) throw new TypeError("plaintext must be an instance of Uint8Array");
		this.#plaintext = plaintext;
	}
	setKeyManagementParameters(parameters) {
		if (this.#keyManagementParameters) throw new TypeError("setKeyManagementParameters can only be called once");
		this.#keyManagementParameters = parameters;
		return this;
	}
	setProtectedHeader(protectedHeader) {
		if (this.#protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
		this.#protectedHeader = protectedHeader;
		return this;
	}
	setSharedUnprotectedHeader(sharedUnprotectedHeader) {
		if (this.#sharedUnprotectedHeader) throw new TypeError("setSharedUnprotectedHeader can only be called once");
		this.#sharedUnprotectedHeader = sharedUnprotectedHeader;
		return this;
	}
	setUnprotectedHeader(unprotectedHeader) {
		if (this.#unprotectedHeader) throw new TypeError("setUnprotectedHeader can only be called once");
		this.#unprotectedHeader = unprotectedHeader;
		return this;
	}
	setAdditionalAuthenticatedData(aad) {
		this.#aad = aad;
		return this;
	}
	setContentEncryptionKey(cek) {
		if (this.#cek) throw new TypeError("setContentEncryptionKey can only be called once");
		this.#cek = cek;
		return this;
	}
	setInitializationVector(iv) {
		if (this.#iv) throw new TypeError("setInitializationVector can only be called once");
		this.#iv = iv;
		return this;
	}
	async encrypt(key, options) {
		if (!this.#protectedHeader && !this.#unprotectedHeader && !this.#sharedUnprotectedHeader) throw new JWEInvalid("either setProtectedHeader, setUnprotectedHeader, or sharedUnprotectedHeader must be called before #encrypt()");
		if (!isDisjoint(this.#protectedHeader, this.#unprotectedHeader, this.#sharedUnprotectedHeader)) throw new JWEInvalid("JWE Protected, JWE Shared Unprotected and JWE Per-Recipient Header Parameter names must be disjoint");
		const joseHeader = {
			...this.#protectedHeader,
			...this.#unprotectedHeader,
			...this.#sharedUnprotectedHeader
		};
		validateCrit(JWEInvalid, /* @__PURE__ */ new Map(), options?.crit, this.#protectedHeader, joseHeader);
		if (joseHeader.zip !== void 0) throw new JOSENotSupported("JWE \"zip\" (Compression Algorithm) Header Parameter is not supported.");
		const { alg, enc } = joseHeader;
		if (typeof alg !== "string" || !alg) throw new JWEInvalid("JWE \"alg\" (Algorithm) Header Parameter missing or invalid");
		if (typeof enc !== "string" || !enc) throw new JWEInvalid("JWE \"enc\" (Encryption Algorithm) Header Parameter missing or invalid");
		let encryptedKey;
		if (this.#cek && (alg === "dir" || alg === "ECDH-ES")) throw new TypeError(`setContentEncryptionKey cannot be called with JWE "alg" (Algorithm) Header ${alg}`);
		checkKeyType(alg === "dir" ? enc : alg, key, "encrypt");
		let cek;
		{
			let parameters;
			const k = await normalizeKey(key, alg);
			({cek, encryptedKey, parameters} = await encryptKeyManagement(alg, enc, k, this.#cek, this.#keyManagementParameters));
			if (parameters) if (options && unprotected in options) if (!this.#unprotectedHeader) this.setUnprotectedHeader(parameters);
			else this.#unprotectedHeader = {
				...this.#unprotectedHeader,
				...parameters
			};
			else if (!this.#protectedHeader) this.setProtectedHeader(parameters);
			else this.#protectedHeader = {
				...this.#protectedHeader,
				...parameters
			};
		}
		let additionalData;
		let protectedHeaderS;
		let protectedHeaderB;
		let aadMember;
		if (this.#protectedHeader) {
			protectedHeaderS = encode$1(JSON.stringify(this.#protectedHeader));
			protectedHeaderB = encode(protectedHeaderS);
		} else {
			protectedHeaderS = "";
			protectedHeaderB = new Uint8Array();
		}
		if (this.#aad) {
			aadMember = encode$1(this.#aad);
			const aadMemberBytes = encode(aadMember);
			additionalData = concat(protectedHeaderB, encode("."), aadMemberBytes);
		} else additionalData = protectedHeaderB;
		const { ciphertext, tag, iv } = await encrypt(enc, this.#plaintext, cek, this.#iv, additionalData);
		const jwe = { ciphertext: encode$1(ciphertext) };
		if (iv) jwe.iv = encode$1(iv);
		if (tag) jwe.tag = encode$1(tag);
		if (encryptedKey) jwe.encrypted_key = encode$1(encryptedKey);
		if (aadMember) jwe.aad = aadMember;
		if (this.#protectedHeader) jwe.protected = protectedHeaderS;
		if (this.#sharedUnprotectedHeader) jwe.unprotected = this.#sharedUnprotectedHeader;
		if (this.#unprotectedHeader) jwe.header = this.#unprotectedHeader;
		return jwe;
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jwt/decrypt.js
async function jwtDecrypt(jwt, key, options) {
	const decrypted = await compactDecrypt(jwt, key, options);
	const payload = validateClaimsSet(decrypted.protectedHeader, decrypted.plaintext, options);
	const { protectedHeader } = decrypted;
	if (protectedHeader.iss !== void 0 && protectedHeader.iss !== payload.iss) throw new JWTClaimValidationFailed("replicated \"iss\" claim header parameter mismatch", payload, "iss", "mismatch");
	if (protectedHeader.sub !== void 0 && protectedHeader.sub !== payload.sub) throw new JWTClaimValidationFailed("replicated \"sub\" claim header parameter mismatch", payload, "sub", "mismatch");
	if (protectedHeader.aud !== void 0 && JSON.stringify(protectedHeader.aud) !== JSON.stringify(payload.aud)) throw new JWTClaimValidationFailed("replicated \"aud\" claim header parameter mismatch", payload, "aud", "mismatch");
	const result = {
		payload,
		protectedHeader
	};
	if (typeof key === "function") return {
		...result,
		key: decrypted.key
	};
	return result;
}
//#endregion
//#region node_modules/jose/dist/webapi/jwe/compact/encrypt.js
var CompactEncrypt = class {
	#flattened;
	constructor(plaintext) {
		this.#flattened = new FlattenedEncrypt(plaintext);
	}
	setContentEncryptionKey(cek) {
		this.#flattened.setContentEncryptionKey(cek);
		return this;
	}
	setInitializationVector(iv) {
		this.#flattened.setInitializationVector(iv);
		return this;
	}
	setProtectedHeader(protectedHeader) {
		this.#flattened.setProtectedHeader(protectedHeader);
		return this;
	}
	setKeyManagementParameters(parameters) {
		this.#flattened.setKeyManagementParameters(parameters);
		return this;
	}
	async encrypt(key, options) {
		const jwe = await this.#flattened.encrypt(key, options);
		return [
			jwe.protected,
			jwe.encrypted_key,
			jwe.iv,
			jwe.ciphertext,
			jwe.tag
		].join(".");
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/lib/sign.js
async function sign(alg, key, data) {
	const cryptoKey = await getSigKey(alg, key, "sign");
	checkKeyLength(alg, cryptoKey);
	const signature = await crypto.subtle.sign(subtleAlgorithm$1(alg, cryptoKey.algorithm), cryptoKey, data);
	return new Uint8Array(signature);
}
//#endregion
//#region node_modules/jose/dist/webapi/jws/flattened/sign.js
var FlattenedSign = class {
	#payload;
	#protectedHeader;
	#unprotectedHeader;
	constructor(payload) {
		if (!(payload instanceof Uint8Array)) throw new TypeError("payload must be an instance of Uint8Array");
		this.#payload = payload;
	}
	setProtectedHeader(protectedHeader) {
		if (this.#protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
		this.#protectedHeader = protectedHeader;
		return this;
	}
	setUnprotectedHeader(unprotectedHeader) {
		if (this.#unprotectedHeader) throw new TypeError("setUnprotectedHeader can only be called once");
		this.#unprotectedHeader = unprotectedHeader;
		return this;
	}
	async sign(key, options) {
		if (!this.#protectedHeader && !this.#unprotectedHeader) throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
		if (!isDisjoint(this.#protectedHeader, this.#unprotectedHeader)) throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
		const joseHeader = {
			...this.#protectedHeader,
			...this.#unprotectedHeader
		};
		const extensions = validateCrit(JWSInvalid, new Map([["b64", true]]), options?.crit, this.#protectedHeader, joseHeader);
		let b64 = true;
		if (extensions.has("b64")) {
			b64 = this.#protectedHeader.b64;
			if (typeof b64 !== "boolean") throw new JWSInvalid("The \"b64\" (base64url-encode payload) Header Parameter must be a boolean");
		}
		const { alg } = joseHeader;
		if (typeof alg !== "string" || !alg) throw new JWSInvalid("JWS \"alg\" (Algorithm) Header Parameter missing or invalid");
		checkKeyType(alg, key, "sign");
		let payloadS;
		let payloadB;
		if (b64) {
			payloadS = encode$1(this.#payload);
			payloadB = encode(payloadS);
		} else {
			payloadB = this.#payload;
			payloadS = "";
		}
		let protectedHeaderString;
		let protectedHeaderBytes;
		if (this.#protectedHeader) {
			protectedHeaderString = encode$1(JSON.stringify(this.#protectedHeader));
			protectedHeaderBytes = encode(protectedHeaderString);
		} else {
			protectedHeaderString = "";
			protectedHeaderBytes = new Uint8Array();
		}
		const data = concat(protectedHeaderBytes, encode("."), payloadB);
		const jws = {
			signature: encode$1(await sign(alg, await normalizeKey(key, alg), data)),
			payload: payloadS
		};
		if (this.#unprotectedHeader) jws.header = this.#unprotectedHeader;
		if (this.#protectedHeader) jws.protected = protectedHeaderString;
		return jws;
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jws/compact/sign.js
var CompactSign = class {
	#flattened;
	constructor(payload) {
		this.#flattened = new FlattenedSign(payload);
	}
	setProtectedHeader(protectedHeader) {
		this.#flattened.setProtectedHeader(protectedHeader);
		return this;
	}
	async sign(key, options) {
		const jws = await this.#flattened.sign(key, options);
		if (jws.payload === void 0) throw new TypeError("use the flattened module for creating JWS with b64: false");
		return `${jws.protected}.${jws.payload}.${jws.signature}`;
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jwt/sign.js
var SignJWT = class {
	#protectedHeader;
	#jwt;
	constructor(payload = {}) {
		this.#jwt = new JWTClaimsBuilder(payload);
	}
	setIssuer(issuer) {
		this.#jwt.iss = issuer;
		return this;
	}
	setSubject(subject) {
		this.#jwt.sub = subject;
		return this;
	}
	setAudience(audience) {
		this.#jwt.aud = audience;
		return this;
	}
	setJti(jwtId) {
		this.#jwt.jti = jwtId;
		return this;
	}
	setNotBefore(input) {
		this.#jwt.nbf = input;
		return this;
	}
	setExpirationTime(input) {
		this.#jwt.exp = input;
		return this;
	}
	setIssuedAt(input) {
		this.#jwt.iat = input;
		return this;
	}
	setProtectedHeader(protectedHeader) {
		this.#protectedHeader = protectedHeader;
		return this;
	}
	async sign(key, options) {
		const sig = new CompactSign(this.#jwt.data());
		sig.setProtectedHeader(this.#protectedHeader);
		if (Array.isArray(this.#protectedHeader?.crit) && this.#protectedHeader.crit.includes("b64") && this.#protectedHeader.b64 === false) throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
		return sig.sign(key, options);
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jwt/encrypt.js
var EncryptJWT = class {
	#cek;
	#iv;
	#keyManagementParameters;
	#protectedHeader;
	#replicateIssuerAsHeader;
	#replicateSubjectAsHeader;
	#replicateAudienceAsHeader;
	#jwt;
	constructor(payload = {}) {
		this.#jwt = new JWTClaimsBuilder(payload);
	}
	setIssuer(issuer) {
		this.#jwt.iss = issuer;
		return this;
	}
	setSubject(subject) {
		this.#jwt.sub = subject;
		return this;
	}
	setAudience(audience) {
		this.#jwt.aud = audience;
		return this;
	}
	setJti(jwtId) {
		this.#jwt.jti = jwtId;
		return this;
	}
	setNotBefore(input) {
		this.#jwt.nbf = input;
		return this;
	}
	setExpirationTime(input) {
		this.#jwt.exp = input;
		return this;
	}
	setIssuedAt(input) {
		this.#jwt.iat = input;
		return this;
	}
	setProtectedHeader(protectedHeader) {
		if (this.#protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
		this.#protectedHeader = protectedHeader;
		return this;
	}
	setKeyManagementParameters(parameters) {
		if (this.#keyManagementParameters) throw new TypeError("setKeyManagementParameters can only be called once");
		this.#keyManagementParameters = parameters;
		return this;
	}
	setContentEncryptionKey(cek) {
		if (this.#cek) throw new TypeError("setContentEncryptionKey can only be called once");
		this.#cek = cek;
		return this;
	}
	setInitializationVector(iv) {
		if (this.#iv) throw new TypeError("setInitializationVector can only be called once");
		this.#iv = iv;
		return this;
	}
	replicateIssuerAsHeader() {
		this.#replicateIssuerAsHeader = true;
		return this;
	}
	replicateSubjectAsHeader() {
		this.#replicateSubjectAsHeader = true;
		return this;
	}
	replicateAudienceAsHeader() {
		this.#replicateAudienceAsHeader = true;
		return this;
	}
	async encrypt(key, options) {
		const enc = new CompactEncrypt(this.#jwt.data());
		if (this.#protectedHeader && (this.#replicateIssuerAsHeader || this.#replicateSubjectAsHeader || this.#replicateAudienceAsHeader)) this.#protectedHeader = {
			...this.#protectedHeader,
			iss: this.#replicateIssuerAsHeader ? this.#jwt.iss : void 0,
			sub: this.#replicateSubjectAsHeader ? this.#jwt.sub : void 0,
			aud: this.#replicateAudienceAsHeader ? this.#jwt.aud : void 0
		};
		enc.setProtectedHeader(this.#protectedHeader);
		if (this.#iv) enc.setInitializationVector(this.#iv);
		if (this.#cek) enc.setContentEncryptionKey(this.#cek);
		if (this.#keyManagementParameters) enc.setKeyManagementParameters(this.#keyManagementParameters);
		return enc.encrypt(key, options);
	}
};
//#endregion
//#region node_modules/jose/dist/webapi/jwk/thumbprint.js
var check = (value, description) => {
	if (typeof value !== "string" || !value) throw new JWKInvalid(`${description} missing or invalid`);
};
async function calculateJwkThumbprint(key, digestAlgorithm) {
	let jwk;
	if (isJWK(key)) jwk = key;
	else if (isKeyLike(key)) jwk = await exportJWK(key);
	else throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "JSON Web Key"));
	digestAlgorithm ??= "sha256";
	if (digestAlgorithm !== "sha256" && digestAlgorithm !== "sha384" && digestAlgorithm !== "sha512") throw new TypeError("digestAlgorithm must one of \"sha256\", \"sha384\", or \"sha512\"");
	let components;
	switch (jwk.kty) {
		case "AKP":
			check(jwk.alg, "\"alg\" (Algorithm) Parameter");
			check(jwk.pub, "\"pub\" (Public key) Parameter");
			components = {
				alg: jwk.alg,
				kty: jwk.kty,
				pub: jwk.pub
			};
			break;
		case "EC":
			check(jwk.crv, "\"crv\" (Curve) Parameter");
			check(jwk.x, "\"x\" (X Coordinate) Parameter");
			check(jwk.y, "\"y\" (Y Coordinate) Parameter");
			components = {
				crv: jwk.crv,
				kty: jwk.kty,
				x: jwk.x,
				y: jwk.y
			};
			break;
		case "OKP":
			check(jwk.crv, "\"crv\" (Subtype of Key Pair) Parameter");
			check(jwk.x, "\"x\" (Public Key) Parameter");
			components = {
				crv: jwk.crv,
				kty: jwk.kty,
				x: jwk.x
			};
			break;
		case "RSA":
			check(jwk.e, "\"e\" (Exponent) Parameter");
			check(jwk.n, "\"n\" (Modulus) Parameter");
			components = {
				e: jwk.e,
				kty: jwk.kty,
				n: jwk.n
			};
			break;
		case "oct":
			check(jwk.k, "\"k\" (Key Value) Parameter");
			components = {
				k: jwk.k,
				kty: jwk.kty
			};
			break;
		default: throw new JOSENotSupported("\"kty\" (Key Type) Parameter missing or unsupported");
	}
	const data = encode(JSON.stringify(components));
	return encode$1(await digest(digestAlgorithm, data));
}
//#endregion
//#region node_modules/better-auth/dist/crypto/jwt.mjs
async function signJWT(payload, secret, expiresIn = 3600) {
	return await new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1e3) + expiresIn).sign(new TextEncoder().encode(secret));
}
async function verifyJWT(token, secret) {
	try {
		return (await jwtVerify(token, new TextEncoder().encode(secret))).payload;
	} catch {
		return null;
	}
}
var info = new Uint8Array([
	66,
	101,
	116,
	116,
	101,
	114,
	65,
	117,
	116,
	104,
	46,
	106,
	115,
	32,
	71,
	101,
	110,
	101,
	114,
	97,
	116,
	101,
	100,
	32,
	69,
	110,
	99,
	114,
	121,
	112,
	116,
	105,
	111,
	110,
	32,
	75,
	101,
	121
]);
var now = () => Date.now() / 1e3 | 0;
var alg = "dir";
var enc = "A256CBC-HS512";
function deriveEncryptionSecret(secret, salt) {
	return hkdf(sha256, new TextEncoder().encode(secret), new TextEncoder().encode(salt), info, 64);
}
function getCurrentSecret(secret) {
	if (typeof secret === "string") return secret;
	const value = secret.keys.get(secret.currentVersion);
	if (!value) throw new Error(`Secret version ${secret.currentVersion} not found in keys`);
	return value;
}
function getAllSecrets(secret) {
	if (typeof secret === "string") return [{
		version: 0,
		value: secret
	}];
	const result = [];
	for (const [version, value] of secret.keys) result.push({
		version,
		value
	});
	if (secret.legacySecret && !result.some((s) => s.value === secret.legacySecret)) result.push({
		version: -1,
		value: secret.legacySecret
	});
	return result;
}
async function symmetricEncodeJWT(payload, secret, salt, expiresIn = 3600) {
	const encryptionSecret = deriveEncryptionSecret(getCurrentSecret(secret), salt);
	const thumbprint = await calculateJwkThumbprint({
		kty: "oct",
		k: encode$1(encryptionSecret)
	}, "sha256");
	return await new EncryptJWT(payload).setProtectedHeader({
		alg,
		enc,
		kid: thumbprint
	}).setIssuedAt().setExpirationTime(now() + expiresIn).setJti(crypto.randomUUID()).encrypt(encryptionSecret);
}
var jwtDecryptOpts = {
	clockTolerance: 15,
	keyManagementAlgorithms: [alg],
	contentEncryptionAlgorithms: [enc, "A256GCM"]
};
async function symmetricDecodeJWT(token, secret, salt) {
	if (!token) return null;
	let hasKid = false;
	try {
		hasKid = decodeProtectedHeader(token).kid !== void 0;
	} catch {
		return null;
	}
	try {
		const secrets = getAllSecrets(secret);
		const { payload } = await jwtDecrypt(token, async (protectedHeader) => {
			const kid = protectedHeader.kid;
			if (kid !== void 0) {
				for (const s of secrets) {
					const encryptionSecret = deriveEncryptionSecret(s.value, salt);
					if (kid === await calculateJwkThumbprint({
						kty: "oct",
						k: encode$1(encryptionSecret)
					}, "sha256")) return encryptionSecret;
				}
				throw new Error("no matching decryption secret");
			}
			if (secrets.length === 1) return deriveEncryptionSecret(secrets[0].value, salt);
			return deriveEncryptionSecret(secrets[0].value, salt);
		}, jwtDecryptOpts);
		return payload;
	} catch {
		if (hasKid) return null;
		const secrets = getAllSecrets(secret);
		if (secrets.length <= 1) return null;
		for (let i = 1; i < secrets.length; i++) try {
			const s = secrets[i];
			const { payload } = await jwtDecrypt(token, deriveEncryptionSecret(s.value, salt), jwtDecryptOpts);
			return payload;
		} catch {
			continue;
		}
		return null;
	}
}
//#endregion
//#region node_modules/better-auth/dist/crypto/random.mjs
var generateRandomString = createRandomStringGenerator("a-z", "0-9", "A-Z", "-_");
//#endregion
//#region node_modules/@noble/ciphers/utils.js
/**
* Utilities for hex, bytes, CSPRNG.
* @module
*/
/*! noble-ciphers - MIT License (c) 2023 Paul Miller (paulmillr.com) */
/** Checks if something is Uint8Array. Be careful: nodejs Buffer will return true. */
function isBytes(a) {
	return a instanceof Uint8Array || ArrayBuffer.isView(a) && a.constructor.name === "Uint8Array";
}
/** Asserts something is boolean. */
function abool(b) {
	if (typeof b !== "boolean") throw new Error(`boolean expected, not ${b}`);
}
/** Asserts something is positive integer. */
function anumber(n) {
	if (!Number.isSafeInteger(n) || n < 0) throw new Error("positive integer expected, got " + n);
}
/** Asserts something is Uint8Array. */
function abytes(value, length, title = "") {
	const bytes = isBytes(value);
	const len = value?.length;
	const needsLen = length !== void 0;
	if (!bytes || needsLen && len !== length) {
		const prefix = title && `"${title}" `;
		const ofLen = needsLen ? ` of length ${length}` : "";
		const got = bytes ? `length=${len}` : `type=${typeof value}`;
		throw new Error(prefix + "expected Uint8Array" + ofLen + ", got " + got);
	}
	return value;
}
/** Asserts a hash instance has not been destroyed / finished */
function aexists(instance, checkFinished = true) {
	if (instance.destroyed) throw new Error("Hash instance has been destroyed");
	if (checkFinished && instance.finished) throw new Error("Hash#digest() has already been called");
}
/** Asserts output is properly-sized byte array */
function aoutput(out, instance) {
	abytes(out, void 0, "output");
	const min = instance.outputLen;
	if (out.length < min) throw new Error("digestInto() expects output buffer of length at least " + min);
}
/** Cast u8 / u16 / u32 to u32. */
function u32(arr) {
	return new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
}
/** Zeroize a byte array. Warning: JS provides no guarantees. */
function clean(...arrays) {
	for (let i = 0; i < arrays.length; i++) arrays[i].fill(0);
}
/** Create DataView of an array for easy byte-level manipulation. */
function createView(arr) {
	return new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
}
/** Is current platform little-endian? Most are. Big-Endian platform: IBM */
var isLE = /* @__PURE__ */ (() => new Uint8Array(new Uint32Array([287454020]).buffer)[0] === 68)();
var hasHexBuiltin = /* @__PURE__ */ (() => typeof Uint8Array.from([]).toHex === "function" && typeof Uint8Array.fromHex === "function")();
var hexes = /* @__PURE__ */ Array.from({ length: 256 }, (_, i) => i.toString(16).padStart(2, "0"));
/**
* Convert byte array to hex string. Uses built-in function, when available.
* @example bytesToHex(Uint8Array.from([0xca, 0xfe, 0x01, 0x23])) // 'cafe0123'
*/
function bytesToHex(bytes) {
	abytes(bytes);
	if (hasHexBuiltin) return bytes.toHex();
	let hex = "";
	for (let i = 0; i < bytes.length; i++) hex += hexes[bytes[i]];
	return hex;
}
var asciis = {
	_0: 48,
	_9: 57,
	A: 65,
	F: 70,
	a: 97,
	f: 102
};
function asciiToBase16(ch) {
	if (ch >= asciis._0 && ch <= asciis._9) return ch - asciis._0;
	if (ch >= asciis.A && ch <= asciis.F) return ch - (asciis.A - 10);
	if (ch >= asciis.a && ch <= asciis.f) return ch - (asciis.a - 10);
}
/**
* Convert hex string to byte array. Uses built-in function, when available.
* @example hexToBytes('cafe0123') // Uint8Array.from([0xca, 0xfe, 0x01, 0x23])
*/
function hexToBytes(hex) {
	if (typeof hex !== "string") throw new Error("hex string expected, got " + typeof hex);
	if (hasHexBuiltin) return Uint8Array.fromHex(hex);
	const hl = hex.length;
	const al = hl / 2;
	if (hl % 2) throw new Error("hex string expected, got unpadded hex of length " + hl);
	const array = new Uint8Array(al);
	for (let ai = 0, hi = 0; ai < al; ai++, hi += 2) {
		const n1 = asciiToBase16(hex.charCodeAt(hi));
		const n2 = asciiToBase16(hex.charCodeAt(hi + 1));
		if (n1 === void 0 || n2 === void 0) {
			const char = hex[hi] + hex[hi + 1];
			throw new Error("hex string expected, got non-hex character \"" + char + "\" at index " + hi);
		}
		array[ai] = n1 * 16 + n2;
	}
	return array;
}
/**
* Converts string to bytes using UTF8 encoding.
* @example utf8ToBytes('abc') // new Uint8Array([97, 98, 99])
*/
function utf8ToBytes(str) {
	if (typeof str !== "string") throw new Error("string expected");
	return new Uint8Array(new TextEncoder().encode(str));
}
/**
* Copies several Uint8Arrays into one.
*/
function concatBytes(...arrays) {
	let sum = 0;
	for (let i = 0; i < arrays.length; i++) {
		const a = arrays[i];
		abytes(a);
		sum += a.length;
	}
	const res = new Uint8Array(sum);
	for (let i = 0, pad = 0; i < arrays.length; i++) {
		const a = arrays[i];
		res.set(a, pad);
		pad += a.length;
	}
	return res;
}
function checkOpts(defaults, opts) {
	if (opts == null || typeof opts !== "object") throw new Error("options must be defined");
	return Object.assign(defaults, opts);
}
/** Compares 2 uint8array-s in kinda constant time. */
function equalBytes(a, b) {
	if (a.length !== b.length) return false;
	let diff = 0;
	for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
	return diff === 0;
}
/**
* Wraps a cipher: validates args, ensures encrypt() can only be called once.
* @__NO_SIDE_EFFECTS__
*/
var wrapCipher = (params, constructor) => {
	function wrappedCipher(key, ...args) {
		abytes(key, void 0, "key");
		if (!isLE) throw new Error("Non little-endian hardware is not yet supported");
		if (params.nonceLength !== void 0) {
			const nonce = args[0];
			abytes(nonce, params.varSizeNonce ? void 0 : params.nonceLength, "nonce");
		}
		const tagl = params.tagLength;
		if (tagl && args[1] !== void 0) abytes(args[1], void 0, "AAD");
		const cipher = constructor(key, ...args);
		const checkOutput = (fnLength, output) => {
			if (output !== void 0) {
				if (fnLength !== 2) throw new Error("cipher output not supported");
				abytes(output, void 0, "output");
			}
		};
		let called = false;
		return {
			encrypt(data, output) {
				if (called) throw new Error("cannot encrypt() twice with same key + nonce");
				called = true;
				abytes(data);
				checkOutput(cipher.encrypt.length, output);
				return cipher.encrypt(data, output);
			},
			decrypt(data, output) {
				abytes(data);
				if (tagl && data.length < tagl) throw new Error("\"ciphertext\" expected length bigger than tagLength=" + tagl);
				checkOutput(cipher.decrypt.length, output);
				return cipher.decrypt(data, output);
			}
		};
	}
	Object.assign(wrappedCipher, params);
	return wrappedCipher;
};
/**
* By default, returns u8a of length.
* When out is available, it checks it for validity and uses it.
*/
function getOutput(expectedLength, out, onlyAligned = true) {
	if (out === void 0) return new Uint8Array(expectedLength);
	if (out.length !== expectedLength) throw new Error("\"output\" expected Uint8Array of length " + expectedLength + ", got: " + out.length);
	if (onlyAligned && !isAligned32$1(out)) throw new Error("invalid output, must be aligned");
	return out;
}
function u64Lengths(dataLength, aadLength, isLE) {
	abool(isLE);
	const num = new Uint8Array(16);
	const view = createView(num);
	view.setBigUint64(0, BigInt(aadLength), isLE);
	view.setBigUint64(8, BigInt(dataLength), isLE);
	return num;
}
function isAligned32$1(bytes) {
	return bytes.byteOffset % 4 === 0;
}
function copyBytes(bytes) {
	return Uint8Array.from(bytes);
}
/** Cryptographically secure PRNG. Uses internal OS-level `crypto.getRandomValues`. */
function randomBytes(bytesLength = 32) {
	const cr = typeof globalThis === "object" ? globalThis.crypto : null;
	if (typeof cr?.getRandomValues !== "function") throw new Error("crypto.getRandomValues must be defined");
	return cr.getRandomValues(new Uint8Array(bytesLength));
}
/**
* Uses CSPRG for nonce, nonce injected in ciphertext.
* For `encrypt`, a `nonceBytes`-length buffer is fetched from CSPRNG and
* prepended to encrypted ciphertext. For `decrypt`, first `nonceBytes` of ciphertext
* are treated as nonce.
*
* NOTE: Under the same key, using random nonces (e.g. `managedNonce`) with AES-GCM and ChaCha
* should be limited to `2**23` (8M) messages to get a collision chance of `2**-50`. Stretching to  * `2**32` (4B) messages, chance would become `2**-33` - still negligible, but creeping up.
* @example
* const gcm = managedNonce(aes.gcm);
* const ciphr = gcm(key).encrypt(data);
* const plain = gcm(key).decrypt(ciph);
*/
function managedNonce(fn, randomBytes_ = randomBytes) {
	const { nonceLength } = fn;
	anumber(nonceLength);
	const addNonce = (nonce, ciphertext) => {
		const out = concatBytes(nonce, ciphertext);
		ciphertext.fill(0);
		return out;
	};
	return ((key, ...args) => ({
		encrypt(plaintext) {
			abytes(plaintext);
			const nonce = randomBytes_(nonceLength);
			const encrypted = fn(key, nonce, ...args).encrypt(plaintext);
			if (encrypted instanceof Promise) return encrypted.then((ct) => addNonce(nonce, ct));
			return addNonce(nonce, encrypted);
		},
		decrypt(ciphertext) {
			abytes(ciphertext);
			const nonce = ciphertext.subarray(0, nonceLength);
			const decrypted = ciphertext.subarray(nonceLength);
			return fn(key, nonce, ...args).decrypt(decrypted);
		}
	}));
}
//#endregion
//#region node_modules/@noble/ciphers/_arx.js
/**
* Basic utils for ARX (add-rotate-xor) salsa and chacha ciphers.

RFC8439 requires multi-step cipher stream, where
authKey starts with counter: 0, actual msg with counter: 1.

For this, we need a way to re-use nonce / counter:

const counter = new Uint8Array(4);
chacha(..., counter, ...); // counter is now 1
chacha(..., counter, ...); // counter is now 2

This is complicated:

- 32-bit counters are enough, no need for 64-bit: max ArrayBuffer size in JS is 4GB
- Original papers don't allow mutating counters
- Counter overflow is undefined [^1]
- Idea A: allow providing (nonce | counter) instead of just nonce, re-use it
- Caveat: Cannot be re-used through all cases:
- * chacha has (counter | nonce)
- * xchacha has (nonce16 | counter | nonce16)
- Idea B: separate nonce / counter and provide separate API for counter re-use
- Caveat: there are different counter sizes depending on an algorithm.
- salsa & chacha also differ in structures of key & sigma:
salsa20:      s[0] | k(4) | s[1] | nonce(2) | cnt(2) | s[2] | k(4) | s[3]
chacha:       s(4) | k(8) | cnt(1) | nonce(3)
chacha20orig: s(4) | k(8) | cnt(2) | nonce(2)
- Idea C: helper method such as `setSalsaState(key, nonce, sigma, data)`
- Caveat: we can't re-use counter array

xchacha [^2] uses the subkey and remaining 8 byte nonce with ChaCha20 as normal
(prefixed by 4 NUL bytes, since [RFC8439] specifies a 12-byte nonce).

[^1]: https://mailarchive.ietf.org/arch/msg/cfrg/gsOnTJzcbgG6OqD8Sc0GO5aR_tU/
[^2]: https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha#appendix-A.2

* @module
*/
var encodeStr = (str) => Uint8Array.from(str.split(""), (c) => c.charCodeAt(0));
var sigma16 = encodeStr("expand 16-byte k");
var sigma32 = encodeStr("expand 32-byte k");
var sigma16_32 = u32(sigma16);
var sigma32_32 = u32(sigma32);
/** Rotate left. */
function rotl(a, b) {
	return a << b | a >>> 32 - b;
}
function isAligned32(b) {
	return b.byteOffset % 4 === 0;
}
var BLOCK_LEN = 64;
var BLOCK_LEN32 = 16;
var MAX_COUNTER = 2 ** 32 - 1;
var U32_EMPTY = Uint32Array.of();
function runCipher(core, sigma, key, nonce, data, output, counter, rounds) {
	const len = data.length;
	const block = new Uint8Array(BLOCK_LEN);
	const b32 = u32(block);
	const isAligned = isAligned32(data) && isAligned32(output);
	const d32 = isAligned ? u32(data) : U32_EMPTY;
	const o32 = isAligned ? u32(output) : U32_EMPTY;
	for (let pos = 0; pos < len; counter++) {
		core(sigma, key, nonce, b32, counter, rounds);
		if (counter >= MAX_COUNTER) throw new Error("arx: counter overflow");
		const take = Math.min(BLOCK_LEN, len - pos);
		if (isAligned && take === BLOCK_LEN) {
			const pos32 = pos / 4;
			if (pos % 4 !== 0) throw new Error("arx: invalid block position");
			for (let j = 0, posj; j < BLOCK_LEN32; j++) {
				posj = pos32 + j;
				o32[posj] = d32[posj] ^ b32[j];
			}
			pos += BLOCK_LEN;
			continue;
		}
		for (let j = 0, posj; j < take; j++) {
			posj = pos + j;
			output[posj] = data[posj] ^ block[j];
		}
		pos += take;
	}
}
/** Creates ARX-like (ChaCha, Salsa) cipher stream from core function. */
function createCipher(core, opts) {
	const { allowShortKeys, extendNonceFn, counterLength, counterRight, rounds } = checkOpts({
		allowShortKeys: false,
		counterLength: 8,
		counterRight: false,
		rounds: 20
	}, opts);
	if (typeof core !== "function") throw new Error("core must be a function");
	anumber(counterLength);
	anumber(rounds);
	abool(counterRight);
	abool(allowShortKeys);
	return (key, nonce, data, output, counter = 0) => {
		abytes(key, void 0, "key");
		abytes(nonce, void 0, "nonce");
		abytes(data, void 0, "data");
		const len = data.length;
		if (output === void 0) output = new Uint8Array(len);
		abytes(output, void 0, "output");
		anumber(counter);
		if (counter < 0 || counter >= MAX_COUNTER) throw new Error("arx: counter overflow");
		if (output.length < len) throw new Error(`arx: output (${output.length}) is shorter than data (${len})`);
		const toClean = [];
		let l = key.length;
		let k;
		let sigma;
		if (l === 32) {
			toClean.push(k = copyBytes(key));
			sigma = sigma32_32;
		} else if (l === 16 && allowShortKeys) {
			k = new Uint8Array(32);
			k.set(key);
			k.set(key, 16);
			sigma = sigma16_32;
			toClean.push(k);
		} else {
			abytes(key, 32, "arx key");
			throw new Error("invalid key size");
		}
		if (!isAligned32(nonce)) toClean.push(nonce = copyBytes(nonce));
		const k32 = u32(k);
		if (extendNonceFn) {
			if (nonce.length !== 24) throw new Error(`arx: extended nonce must be 24 bytes`);
			extendNonceFn(sigma, k32, u32(nonce.subarray(0, 16)), k32);
			nonce = nonce.subarray(16);
		}
		const nonceNcLen = 16 - counterLength;
		if (nonceNcLen !== nonce.length) throw new Error(`arx: nonce must be ${nonceNcLen} or 16 bytes`);
		if (nonceNcLen !== 12) {
			const nc = new Uint8Array(12);
			nc.set(nonce, counterRight ? 0 : 12 - nonce.length);
			nonce = nc;
			toClean.push(nonce);
		}
		const n32 = u32(nonce);
		runCipher(core, sigma, k32, n32, data, output, counter, rounds);
		clean(...toClean);
		return output;
	};
}
//#endregion
//#region node_modules/@noble/ciphers/_poly1305.js
/**
* Poly1305 ([PDF](https://cr.yp.to/mac/poly1305-20050329.pdf),
* [wiki](https://en.wikipedia.org/wiki/Poly1305))
* is a fast and parallel secret-key message-authentication code suitable for
* a wide variety of applications. It was standardized in
* [RFC 8439](https://www.rfc-editor.org/rfc/rfc8439) and is now used in TLS 1.3.
*
* Polynomial MACs are not perfect for every situation:
* they lack Random Key Robustness: the MAC can be forged, and can't be used in PAKE schemes.
* See [invisible salamanders attack](https://keymaterial.net/2020/09/07/invisible-salamanders-in-aes-gcm-siv/).
* To combat invisible salamanders, `hash(key)` can be included in ciphertext,
* however, this would violate ciphertext indistinguishability:
* an attacker would know which key was used - so `HKDF(key, i)`
* could be used instead.
*
* Check out [original website](https://cr.yp.to/mac.html).
* Based on Public Domain [poly1305-donna](https://github.com/floodyberry/poly1305-donna).
* @module
*/
function u8to16(a, i) {
	return a[i++] & 255 | (a[i++] & 255) << 8;
}
/** Poly1305 class. Prefer poly1305() function instead. */
var Poly1305 = class {
	blockLen = 16;
	outputLen = 16;
	buffer = new Uint8Array(16);
	r = new Uint16Array(10);
	h = new Uint16Array(10);
	pad = new Uint16Array(8);
	pos = 0;
	finished = false;
	constructor(key) {
		key = copyBytes(abytes(key, 32, "key"));
		const t0 = u8to16(key, 0);
		const t1 = u8to16(key, 2);
		const t2 = u8to16(key, 4);
		const t3 = u8to16(key, 6);
		const t4 = u8to16(key, 8);
		const t5 = u8to16(key, 10);
		const t6 = u8to16(key, 12);
		const t7 = u8to16(key, 14);
		this.r[0] = t0 & 8191;
		this.r[1] = (t0 >>> 13 | t1 << 3) & 8191;
		this.r[2] = (t1 >>> 10 | t2 << 6) & 7939;
		this.r[3] = (t2 >>> 7 | t3 << 9) & 8191;
		this.r[4] = (t3 >>> 4 | t4 << 12) & 255;
		this.r[5] = t4 >>> 1 & 8190;
		this.r[6] = (t4 >>> 14 | t5 << 2) & 8191;
		this.r[7] = (t5 >>> 11 | t6 << 5) & 8065;
		this.r[8] = (t6 >>> 8 | t7 << 8) & 8191;
		this.r[9] = t7 >>> 5 & 127;
		for (let i = 0; i < 8; i++) this.pad[i] = u8to16(key, 16 + 2 * i);
	}
	process(data, offset, isLast = false) {
		const hibit = isLast ? 0 : 2048;
		const { h, r } = this;
		const r0 = r[0];
		const r1 = r[1];
		const r2 = r[2];
		const r3 = r[3];
		const r4 = r[4];
		const r5 = r[5];
		const r6 = r[6];
		const r7 = r[7];
		const r8 = r[8];
		const r9 = r[9];
		const t0 = u8to16(data, offset + 0);
		const t1 = u8to16(data, offset + 2);
		const t2 = u8to16(data, offset + 4);
		const t3 = u8to16(data, offset + 6);
		const t4 = u8to16(data, offset + 8);
		const t5 = u8to16(data, offset + 10);
		const t6 = u8to16(data, offset + 12);
		const t7 = u8to16(data, offset + 14);
		let h0 = h[0] + (t0 & 8191);
		let h1 = h[1] + ((t0 >>> 13 | t1 << 3) & 8191);
		let h2 = h[2] + ((t1 >>> 10 | t2 << 6) & 8191);
		let h3 = h[3] + ((t2 >>> 7 | t3 << 9) & 8191);
		let h4 = h[4] + ((t3 >>> 4 | t4 << 12) & 8191);
		let h5 = h[5] + (t4 >>> 1 & 8191);
		let h6 = h[6] + ((t4 >>> 14 | t5 << 2) & 8191);
		let h7 = h[7] + ((t5 >>> 11 | t6 << 5) & 8191);
		let h8 = h[8] + ((t6 >>> 8 | t7 << 8) & 8191);
		let h9 = h[9] + (t7 >>> 5 | hibit);
		let c = 0;
		let d0 = c + h0 * r0 + h1 * (5 * r9) + h2 * (5 * r8) + h3 * (5 * r7) + h4 * (5 * r6);
		c = d0 >>> 13;
		d0 &= 8191;
		d0 += h5 * (5 * r5) + h6 * (5 * r4) + h7 * (5 * r3) + h8 * (5 * r2) + h9 * (5 * r1);
		c += d0 >>> 13;
		d0 &= 8191;
		let d1 = c + h0 * r1 + h1 * r0 + h2 * (5 * r9) + h3 * (5 * r8) + h4 * (5 * r7);
		c = d1 >>> 13;
		d1 &= 8191;
		d1 += h5 * (5 * r6) + h6 * (5 * r5) + h7 * (5 * r4) + h8 * (5 * r3) + h9 * (5 * r2);
		c += d1 >>> 13;
		d1 &= 8191;
		let d2 = c + h0 * r2 + h1 * r1 + h2 * r0 + h3 * (5 * r9) + h4 * (5 * r8);
		c = d2 >>> 13;
		d2 &= 8191;
		d2 += h5 * (5 * r7) + h6 * (5 * r6) + h7 * (5 * r5) + h8 * (5 * r4) + h9 * (5 * r3);
		c += d2 >>> 13;
		d2 &= 8191;
		let d3 = c + h0 * r3 + h1 * r2 + h2 * r1 + h3 * r0 + h4 * (5 * r9);
		c = d3 >>> 13;
		d3 &= 8191;
		d3 += h5 * (5 * r8) + h6 * (5 * r7) + h7 * (5 * r6) + h8 * (5 * r5) + h9 * (5 * r4);
		c += d3 >>> 13;
		d3 &= 8191;
		let d4 = c + h0 * r4 + h1 * r3 + h2 * r2 + h3 * r1 + h4 * r0;
		c = d4 >>> 13;
		d4 &= 8191;
		d4 += h5 * (5 * r9) + h6 * (5 * r8) + h7 * (5 * r7) + h8 * (5 * r6) + h9 * (5 * r5);
		c += d4 >>> 13;
		d4 &= 8191;
		let d5 = c + h0 * r5 + h1 * r4 + h2 * r3 + h3 * r2 + h4 * r1;
		c = d5 >>> 13;
		d5 &= 8191;
		d5 += h5 * r0 + h6 * (5 * r9) + h7 * (5 * r8) + h8 * (5 * r7) + h9 * (5 * r6);
		c += d5 >>> 13;
		d5 &= 8191;
		let d6 = c + h0 * r6 + h1 * r5 + h2 * r4 + h3 * r3 + h4 * r2;
		c = d6 >>> 13;
		d6 &= 8191;
		d6 += h5 * r1 + h6 * r0 + h7 * (5 * r9) + h8 * (5 * r8) + h9 * (5 * r7);
		c += d6 >>> 13;
		d6 &= 8191;
		let d7 = c + h0 * r7 + h1 * r6 + h2 * r5 + h3 * r4 + h4 * r3;
		c = d7 >>> 13;
		d7 &= 8191;
		d7 += h5 * r2 + h6 * r1 + h7 * r0 + h8 * (5 * r9) + h9 * (5 * r8);
		c += d7 >>> 13;
		d7 &= 8191;
		let d8 = c + h0 * r8 + h1 * r7 + h2 * r6 + h3 * r5 + h4 * r4;
		c = d8 >>> 13;
		d8 &= 8191;
		d8 += h5 * r3 + h6 * r2 + h7 * r1 + h8 * r0 + h9 * (5 * r9);
		c += d8 >>> 13;
		d8 &= 8191;
		let d9 = c + h0 * r9 + h1 * r8 + h2 * r7 + h3 * r6 + h4 * r5;
		c = d9 >>> 13;
		d9 &= 8191;
		d9 += h5 * r4 + h6 * r3 + h7 * r2 + h8 * r1 + h9 * r0;
		c += d9 >>> 13;
		d9 &= 8191;
		c = (c << 2) + c | 0;
		c = c + d0 | 0;
		d0 = c & 8191;
		c = c >>> 13;
		d1 += c;
		h[0] = d0;
		h[1] = d1;
		h[2] = d2;
		h[3] = d3;
		h[4] = d4;
		h[5] = d5;
		h[6] = d6;
		h[7] = d7;
		h[8] = d8;
		h[9] = d9;
	}
	finalize() {
		const { h, pad } = this;
		const g = new Uint16Array(10);
		let c = h[1] >>> 13;
		h[1] &= 8191;
		for (let i = 2; i < 10; i++) {
			h[i] += c;
			c = h[i] >>> 13;
			h[i] &= 8191;
		}
		h[0] += c * 5;
		c = h[0] >>> 13;
		h[0] &= 8191;
		h[1] += c;
		c = h[1] >>> 13;
		h[1] &= 8191;
		h[2] += c;
		g[0] = h[0] + 5;
		c = g[0] >>> 13;
		g[0] &= 8191;
		for (let i = 1; i < 10; i++) {
			g[i] = h[i] + c;
			c = g[i] >>> 13;
			g[i] &= 8191;
		}
		g[9] -= 8192;
		let mask = (c ^ 1) - 1;
		for (let i = 0; i < 10; i++) g[i] &= mask;
		mask = ~mask;
		for (let i = 0; i < 10; i++) h[i] = h[i] & mask | g[i];
		h[0] = (h[0] | h[1] << 13) & 65535;
		h[1] = (h[1] >>> 3 | h[2] << 10) & 65535;
		h[2] = (h[2] >>> 6 | h[3] << 7) & 65535;
		h[3] = (h[3] >>> 9 | h[4] << 4) & 65535;
		h[4] = (h[4] >>> 12 | h[5] << 1 | h[6] << 14) & 65535;
		h[5] = (h[6] >>> 2 | h[7] << 11) & 65535;
		h[6] = (h[7] >>> 5 | h[8] << 8) & 65535;
		h[7] = (h[8] >>> 8 | h[9] << 5) & 65535;
		let f = h[0] + pad[0];
		h[0] = f & 65535;
		for (let i = 1; i < 8; i++) {
			f = (h[i] + pad[i] | 0) + (f >>> 16) | 0;
			h[i] = f & 65535;
		}
		clean(g);
	}
	update(data) {
		aexists(this);
		abytes(data);
		data = copyBytes(data);
		const { buffer, blockLen } = this;
		const len = data.length;
		for (let pos = 0; pos < len;) {
			const take = Math.min(blockLen - this.pos, len - pos);
			if (take === blockLen) {
				for (; blockLen <= len - pos; pos += blockLen) this.process(data, pos);
				continue;
			}
			buffer.set(data.subarray(pos, pos + take), this.pos);
			this.pos += take;
			pos += take;
			if (this.pos === blockLen) {
				this.process(buffer, 0, false);
				this.pos = 0;
			}
		}
		return this;
	}
	destroy() {
		clean(this.h, this.r, this.buffer, this.pad);
	}
	digestInto(out) {
		aexists(this);
		aoutput(out, this);
		this.finished = true;
		const { buffer, h } = this;
		let { pos } = this;
		if (pos) {
			buffer[pos++] = 1;
			for (; pos < 16; pos++) buffer[pos] = 0;
			this.process(buffer, 0, true);
		}
		this.finalize();
		let opos = 0;
		for (let i = 0; i < 8; i++) {
			out[opos++] = h[i] >>> 0;
			out[opos++] = h[i] >>> 8;
		}
		return out;
	}
	digest() {
		const { buffer, outputLen } = this;
		this.digestInto(buffer);
		const res = buffer.slice(0, outputLen);
		this.destroy();
		return res;
	}
};
function wrapConstructorWithKey(hashCons) {
	const hashC = (msg, key) => hashCons(key).update(msg).digest();
	const tmp = hashCons(new Uint8Array(32));
	hashC.outputLen = tmp.outputLen;
	hashC.blockLen = tmp.blockLen;
	hashC.create = (key) => hashCons(key);
	return hashC;
}
/** Poly1305 MAC from RFC 8439. */
var poly1305 = (() => wrapConstructorWithKey((key) => new Poly1305(key)))();
//#endregion
//#region node_modules/@noble/ciphers/chacha.js
/**
* ChaCha stream cipher, released
* in 2008. Developed after Salsa20, ChaCha aims to increase diffusion per round.
* It was standardized in [RFC 8439](https://www.rfc-editor.org/rfc/rfc8439) and
* is now used in TLS 1.3.
*
* [XChaCha20](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha)
* extended-nonce variant is also provided. Similar to XSalsa, it's safe to use with
* randomly-generated nonces.
*
* Check out [PDF](http://cr.yp.to/chacha/chacha-20080128.pdf) and
* [wiki](https://en.wikipedia.org/wiki/Salsa20) and
* [website](https://cr.yp.to/chacha.html).
*
* @module
*/
/** Identical to `chachaCore_small`. Unused. */
function chachaCore(s, k, n, out, cnt, rounds = 20) {
	let y00 = s[0], y01 = s[1], y02 = s[2], y03 = s[3], y04 = k[0], y05 = k[1], y06 = k[2], y07 = k[3], y08 = k[4], y09 = k[5], y10 = k[6], y11 = k[7], y12 = cnt, y13 = n[0], y14 = n[1], y15 = n[2];
	let x00 = y00, x01 = y01, x02 = y02, x03 = y03, x04 = y04, x05 = y05, x06 = y06, x07 = y07, x08 = y08, x09 = y09, x10 = y10, x11 = y11, x12 = y12, x13 = y13, x14 = y14, x15 = y15;
	for (let r = 0; r < rounds; r += 2) {
		x00 = x00 + x04 | 0;
		x12 = rotl(x12 ^ x00, 16);
		x08 = x08 + x12 | 0;
		x04 = rotl(x04 ^ x08, 12);
		x00 = x00 + x04 | 0;
		x12 = rotl(x12 ^ x00, 8);
		x08 = x08 + x12 | 0;
		x04 = rotl(x04 ^ x08, 7);
		x01 = x01 + x05 | 0;
		x13 = rotl(x13 ^ x01, 16);
		x09 = x09 + x13 | 0;
		x05 = rotl(x05 ^ x09, 12);
		x01 = x01 + x05 | 0;
		x13 = rotl(x13 ^ x01, 8);
		x09 = x09 + x13 | 0;
		x05 = rotl(x05 ^ x09, 7);
		x02 = x02 + x06 | 0;
		x14 = rotl(x14 ^ x02, 16);
		x10 = x10 + x14 | 0;
		x06 = rotl(x06 ^ x10, 12);
		x02 = x02 + x06 | 0;
		x14 = rotl(x14 ^ x02, 8);
		x10 = x10 + x14 | 0;
		x06 = rotl(x06 ^ x10, 7);
		x03 = x03 + x07 | 0;
		x15 = rotl(x15 ^ x03, 16);
		x11 = x11 + x15 | 0;
		x07 = rotl(x07 ^ x11, 12);
		x03 = x03 + x07 | 0;
		x15 = rotl(x15 ^ x03, 8);
		x11 = x11 + x15 | 0;
		x07 = rotl(x07 ^ x11, 7);
		x00 = x00 + x05 | 0;
		x15 = rotl(x15 ^ x00, 16);
		x10 = x10 + x15 | 0;
		x05 = rotl(x05 ^ x10, 12);
		x00 = x00 + x05 | 0;
		x15 = rotl(x15 ^ x00, 8);
		x10 = x10 + x15 | 0;
		x05 = rotl(x05 ^ x10, 7);
		x01 = x01 + x06 | 0;
		x12 = rotl(x12 ^ x01, 16);
		x11 = x11 + x12 | 0;
		x06 = rotl(x06 ^ x11, 12);
		x01 = x01 + x06 | 0;
		x12 = rotl(x12 ^ x01, 8);
		x11 = x11 + x12 | 0;
		x06 = rotl(x06 ^ x11, 7);
		x02 = x02 + x07 | 0;
		x13 = rotl(x13 ^ x02, 16);
		x08 = x08 + x13 | 0;
		x07 = rotl(x07 ^ x08, 12);
		x02 = x02 + x07 | 0;
		x13 = rotl(x13 ^ x02, 8);
		x08 = x08 + x13 | 0;
		x07 = rotl(x07 ^ x08, 7);
		x03 = x03 + x04 | 0;
		x14 = rotl(x14 ^ x03, 16);
		x09 = x09 + x14 | 0;
		x04 = rotl(x04 ^ x09, 12);
		x03 = x03 + x04 | 0;
		x14 = rotl(x14 ^ x03, 8);
		x09 = x09 + x14 | 0;
		x04 = rotl(x04 ^ x09, 7);
	}
	let oi = 0;
	out[oi++] = y00 + x00 | 0;
	out[oi++] = y01 + x01 | 0;
	out[oi++] = y02 + x02 | 0;
	out[oi++] = y03 + x03 | 0;
	out[oi++] = y04 + x04 | 0;
	out[oi++] = y05 + x05 | 0;
	out[oi++] = y06 + x06 | 0;
	out[oi++] = y07 + x07 | 0;
	out[oi++] = y08 + x08 | 0;
	out[oi++] = y09 + x09 | 0;
	out[oi++] = y10 + x10 | 0;
	out[oi++] = y11 + x11 | 0;
	out[oi++] = y12 + x12 | 0;
	out[oi++] = y13 + x13 | 0;
	out[oi++] = y14 + x14 | 0;
	out[oi++] = y15 + x15 | 0;
}
/**
* hchacha hashes key and nonce into key' and nonce' for xchacha20.
* Identical to `hchacha_small`.
* Need to find a way to merge it with `chachaCore` without 25% performance hit.
*/
function hchacha(s, k, i, out) {
	let x00 = s[0], x01 = s[1], x02 = s[2], x03 = s[3], x04 = k[0], x05 = k[1], x06 = k[2], x07 = k[3], x08 = k[4], x09 = k[5], x10 = k[6], x11 = k[7], x12 = i[0], x13 = i[1], x14 = i[2], x15 = i[3];
	for (let r = 0; r < 20; r += 2) {
		x00 = x00 + x04 | 0;
		x12 = rotl(x12 ^ x00, 16);
		x08 = x08 + x12 | 0;
		x04 = rotl(x04 ^ x08, 12);
		x00 = x00 + x04 | 0;
		x12 = rotl(x12 ^ x00, 8);
		x08 = x08 + x12 | 0;
		x04 = rotl(x04 ^ x08, 7);
		x01 = x01 + x05 | 0;
		x13 = rotl(x13 ^ x01, 16);
		x09 = x09 + x13 | 0;
		x05 = rotl(x05 ^ x09, 12);
		x01 = x01 + x05 | 0;
		x13 = rotl(x13 ^ x01, 8);
		x09 = x09 + x13 | 0;
		x05 = rotl(x05 ^ x09, 7);
		x02 = x02 + x06 | 0;
		x14 = rotl(x14 ^ x02, 16);
		x10 = x10 + x14 | 0;
		x06 = rotl(x06 ^ x10, 12);
		x02 = x02 + x06 | 0;
		x14 = rotl(x14 ^ x02, 8);
		x10 = x10 + x14 | 0;
		x06 = rotl(x06 ^ x10, 7);
		x03 = x03 + x07 | 0;
		x15 = rotl(x15 ^ x03, 16);
		x11 = x11 + x15 | 0;
		x07 = rotl(x07 ^ x11, 12);
		x03 = x03 + x07 | 0;
		x15 = rotl(x15 ^ x03, 8);
		x11 = x11 + x15 | 0;
		x07 = rotl(x07 ^ x11, 7);
		x00 = x00 + x05 | 0;
		x15 = rotl(x15 ^ x00, 16);
		x10 = x10 + x15 | 0;
		x05 = rotl(x05 ^ x10, 12);
		x00 = x00 + x05 | 0;
		x15 = rotl(x15 ^ x00, 8);
		x10 = x10 + x15 | 0;
		x05 = rotl(x05 ^ x10, 7);
		x01 = x01 + x06 | 0;
		x12 = rotl(x12 ^ x01, 16);
		x11 = x11 + x12 | 0;
		x06 = rotl(x06 ^ x11, 12);
		x01 = x01 + x06 | 0;
		x12 = rotl(x12 ^ x01, 8);
		x11 = x11 + x12 | 0;
		x06 = rotl(x06 ^ x11, 7);
		x02 = x02 + x07 | 0;
		x13 = rotl(x13 ^ x02, 16);
		x08 = x08 + x13 | 0;
		x07 = rotl(x07 ^ x08, 12);
		x02 = x02 + x07 | 0;
		x13 = rotl(x13 ^ x02, 8);
		x08 = x08 + x13 | 0;
		x07 = rotl(x07 ^ x08, 7);
		x03 = x03 + x04 | 0;
		x14 = rotl(x14 ^ x03, 16);
		x09 = x09 + x14 | 0;
		x04 = rotl(x04 ^ x09, 12);
		x03 = x03 + x04 | 0;
		x14 = rotl(x14 ^ x03, 8);
		x09 = x09 + x14 | 0;
		x04 = rotl(x04 ^ x09, 7);
	}
	let oi = 0;
	out[oi++] = x00;
	out[oi++] = x01;
	out[oi++] = x02;
	out[oi++] = x03;
	out[oi++] = x12;
	out[oi++] = x13;
	out[oi++] = x14;
	out[oi++] = x15;
}
/**
* XChaCha eXtended-nonce ChaCha. With 24-byte nonce, it's safe to make it random (CSPRNG).
* See [IRTF draft](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha).
*/
var xchacha20 = /* @__PURE__ */ createCipher(chachaCore, {
	counterRight: false,
	counterLength: 8,
	extendNonceFn: hchacha,
	allowShortKeys: false
});
var ZEROS16 = /* @__PURE__ */ new Uint8Array(16);
var updatePadded = (h, msg) => {
	h.update(msg);
	const leftover = msg.length % 16;
	if (leftover) h.update(ZEROS16.subarray(leftover));
};
var ZEROS32 = /* @__PURE__ */ new Uint8Array(32);
function computeTag(fn, key, nonce, ciphertext, AAD) {
	if (AAD !== void 0) abytes(AAD, void 0, "AAD");
	const authKey = fn(key, nonce, ZEROS32);
	const lengths = u64Lengths(ciphertext.length, AAD ? AAD.length : 0, true);
	const h = poly1305.create(authKey);
	if (AAD) updatePadded(h, AAD);
	updatePadded(h, ciphertext);
	h.update(lengths);
	const res = h.digest();
	clean(authKey, lengths);
	return res;
}
/**
* AEAD algorithm from RFC 8439.
* Salsa20 and chacha (RFC 8439) use poly1305 differently.
* We could have composed them, but it's hard because of authKey:
* In salsa20, authKey changes position in salsa stream.
* In chacha, authKey can't be computed inside computeTag, it modifies the counter.
*/
var _poly1305_aead = (xorStream) => (key, nonce, AAD) => {
	const tagLength = 16;
	return {
		encrypt(plaintext, output) {
			const plength = plaintext.length;
			output = getOutput(plength + tagLength, output, false);
			output.set(plaintext);
			const oPlain = output.subarray(0, -16);
			xorStream(key, nonce, oPlain, oPlain, 1);
			const tag = computeTag(xorStream, key, nonce, oPlain, AAD);
			output.set(tag, plength);
			clean(tag);
			return output;
		},
		decrypt(ciphertext, output) {
			output = getOutput(ciphertext.length - tagLength, output, false);
			const data = ciphertext.subarray(0, -16);
			const passedTag = ciphertext.subarray(-16);
			const tag = computeTag(xorStream, key, nonce, data, AAD);
			if (!equalBytes(passedTag, tag)) throw new Error("invalid tag");
			output.set(ciphertext.subarray(0, -16));
			xorStream(key, nonce, output, output, 1);
			clean(tag);
			return output;
		}
	};
};
/**
* XChaCha20-Poly1305 extended-nonce chacha.
*
* Can be safely used with random nonces (CSPRNG).
* See [IRTF draft](https://datatracker.ietf.org/doc/html/draft-irtf-cfrg-xchacha).
*/
var xchacha20poly1305 = /* @__PURE__ */ wrapCipher({
	blockSize: 64,
	nonceLength: 24,
	tagLength: 16
}, _poly1305_aead(xchacha20));
//#endregion
//#region node_modules/better-auth/dist/crypto/index.mjs
var ENVELOPE_PREFIX = "$ba$";
function parseEnvelope(data) {
	if (!data.startsWith(ENVELOPE_PREFIX)) return null;
	const firstSep = 4;
	const secondSep = data.indexOf("$", firstSep);
	if (secondSep === -1) return null;
	const version = parseInt(data.slice(firstSep, secondSep), 10);
	if (!Number.isInteger(version) || version < 0) return null;
	return {
		version,
		ciphertext: data.slice(secondSep + 1)
	};
}
function formatEnvelope(version, ciphertext) {
	return `${ENVELOPE_PREFIX}${version}$${ciphertext}`;
}
async function rawEncrypt(secret, data) {
	const keyAsBytes = await createHash("SHA-256").digest(secret);
	const dataAsBytes = utf8ToBytes(data);
	return bytesToHex(managedNonce(xchacha20poly1305)(new Uint8Array(keyAsBytes)).encrypt(dataAsBytes));
}
async function rawDecrypt(secret, hex) {
	const keyAsBytes = await createHash("SHA-256").digest(secret);
	const dataAsBytes = hexToBytes(hex);
	const chacha = managedNonce(xchacha20poly1305)(new Uint8Array(keyAsBytes));
	return new TextDecoder().decode(chacha.decrypt(dataAsBytes));
}
var symmetricEncrypt = async ({ key, data }) => {
	if (typeof key === "string") return rawEncrypt(key, data);
	const secret = key.keys.get(key.currentVersion);
	if (!secret) throw new Error(`Secret version ${key.currentVersion} not found in keys`);
	const ciphertext = await rawEncrypt(secret, data);
	return formatEnvelope(key.currentVersion, ciphertext);
};
var symmetricDecrypt = async ({ key, data }) => {
	if (typeof key === "string") return rawDecrypt(key, data);
	const envelope = parseEnvelope(data);
	if (envelope) {
		const secret = key.keys.get(envelope.version);
		if (!secret) throw new Error(`Secret version ${envelope.version} not found in keys (key may have been retired)`);
		return rawDecrypt(secret, envelope.ciphertext);
	}
	if (key.legacySecret) return rawDecrypt(key.legacySecret, data);
	throw new Error("Cannot decrypt legacy bare-hex payload: no legacy secret available. Set BETTER_AUTH_SECRET for backwards compatibility.");
};
//#endregion
//#region node_modules/better-auth/dist/cookies/session-store.mjs
var ALLOWED_COOKIE_SIZE = 4096;
var ESTIMATED_EMPTY_COOKIE_SIZE = 200;
var CHUNK_SIZE = ALLOWED_COOKIE_SIZE - ESTIMATED_EMPTY_COOKIE_SIZE;
/**
* Parse cookies from the request headers
*/
function parseCookiesFromContext(ctx) {
	const cookieHeader = ctx.headers?.get("cookie");
	if (!cookieHeader) return {};
	const cookies = {};
	const pairs = cookieHeader.split("; ");
	for (const pair of pairs) {
		const [name, ...valueParts] = pair.split("=");
		if (name && valueParts.length > 0) cookies[name] = valueParts.join("=");
	}
	return cookies;
}
/**
* Extract the chunk index from a cookie name
*/
function getChunkIndex(cookieName) {
	const parts = cookieName.split(".");
	const lastPart = parts[parts.length - 1];
	const index = parseInt(lastPart || "0", 10);
	return isNaN(index) ? 0 : index;
}
/**
* Read all existing chunks from cookies
*/
function readExistingChunks(cookieName, ctx) {
	const chunks = {};
	const cookies = parseCookiesFromContext(ctx);
	for (const [name, value] of Object.entries(cookies)) if (name.startsWith(cookieName)) chunks[name] = value;
	return chunks;
}
/**
* Get the full session data by joining all chunks
*/
function joinChunks(chunks) {
	return Object.keys(chunks).sort((a, b) => {
		return getChunkIndex(a) - getChunkIndex(b);
	}).map((key) => chunks[key]).join("");
}
/**
* Split a cookie value into chunks if needed
*/
function chunkCookie(storeName, cookie, chunks, logger) {
	const chunkCount = Math.ceil(cookie.value.length / CHUNK_SIZE);
	if (chunkCount === 1) {
		chunks[cookie.name] = cookie.value;
		return [cookie];
	}
	const cookies = [];
	for (let i = 0; i < chunkCount; i++) {
		const name = `${cookie.name}.${i}`;
		const start = i * CHUNK_SIZE;
		const value = cookie.value.substring(start, start + CHUNK_SIZE);
		cookies.push({
			...cookie,
			name,
			value
		});
		chunks[name] = value;
	}
	logger.debug(`CHUNKING_${storeName.toUpperCase()}_COOKIE`, {
		message: `${storeName} cookie exceeds allowed ${ALLOWED_COOKIE_SIZE} bytes.`,
		emptyCookieSize: ESTIMATED_EMPTY_COOKIE_SIZE,
		valueSize: cookie.value.length,
		chunkCount,
		chunks: cookies.map((c) => c.value.length + ESTIMATED_EMPTY_COOKIE_SIZE)
	});
	return cookies;
}
/**
* Get all cookies that should be cleaned (removed)
*/
function getCleanCookies(chunks, cookieOptions) {
	const cleanedChunks = {};
	for (const name in chunks) cleanedChunks[name] = {
		name,
		value: "",
		attributes: {
			...cookieOptions,
			maxAge: 0
		}
	};
	return cleanedChunks;
}
/**
* Create a session store for handling cookie chunking.
* When session data exceeds 4KB, it automatically splits it into multiple cookies.
*
* Based on next-auth's SessionStore implementation.
* @see https://github.com/nextauthjs/next-auth/blob/27b2519b84b8eb9cf053775dea29d577d2aa0098/packages/next-auth/src/core/lib/cookie.ts
*/
var storeFactory = (storeName) => (cookieName, cookieOptions, ctx) => {
	const chunks = readExistingChunks(cookieName, ctx);
	const logger = ctx.context.logger;
	return {
		getValue() {
			return joinChunks(chunks);
		},
		hasChunks() {
			return Object.keys(chunks).length > 0;
		},
		chunk(value, options) {
			const cleanedChunks = getCleanCookies(chunks, cookieOptions);
			for (const name in chunks) delete chunks[name];
			const cookies = cleanedChunks;
			const chunked = chunkCookie(storeName, {
				name: cookieName,
				value,
				attributes: {
					...cookieOptions,
					...options
				}
			}, chunks, logger);
			for (const chunk of chunked) cookies[chunk.name] = chunk;
			return Object.values(cookies);
		},
		clean() {
			const cleanedChunks = getCleanCookies(chunks, cookieOptions);
			for (const name in chunks) delete chunks[name];
			return Object.values(cleanedChunks);
		},
		setCookies(cookies) {
			for (const cookie of cookies) ctx.setCookie(cookie.name, cookie.value, cookie.attributes);
		}
	};
};
var createSessionStore = storeFactory("Session");
var createAccountStore = storeFactory("Account");
function getChunkedCookie(ctx, cookieName) {
	const value = ctx.getCookie(cookieName);
	if (value) return value;
	const chunks = [];
	const cookieHeader = ctx.headers?.get("cookie");
	if (!cookieHeader) return null;
	const cookies = {};
	const pairs = cookieHeader.split("; ");
	for (const pair of pairs) {
		const [name, ...valueParts] = pair.split("=");
		if (name && valueParts.length > 0) cookies[name] = valueParts.join("=");
	}
	for (const [name, val] of Object.entries(cookies)) if (name.startsWith(cookieName + ".")) {
		const indexStr = name.split(".").at(-1);
		const index = parseInt(indexStr || "0", 10);
		if (!isNaN(index)) chunks.push({
			index,
			value: val
		});
	}
	if (chunks.length > 0) {
		chunks.sort((a, b) => a.index - b.index);
		return chunks.map((c) => c.value).join("");
	}
	return null;
}
async function setAccountCookie(c, accountData) {
	const accountDataCookie = c.context.authCookies.accountData;
	const options = {
		maxAge: 300,
		...accountDataCookie.attributes
	};
	const data = await symmetricEncodeJWT(accountData, c.context.secretConfig, "better-auth-account", options.maxAge);
	if (data.length > ALLOWED_COOKIE_SIZE) {
		const accountStore = createAccountStore(accountDataCookie.name, options, c);
		const cookies = accountStore.chunk(data, options);
		accountStore.setCookies(cookies);
	} else {
		const accountStore = createAccountStore(accountDataCookie.name, options, c);
		if (accountStore.hasChunks()) {
			const cleanCookies = accountStore.clean();
			accountStore.setCookies(cleanCookies);
		}
		c.setCookie(accountDataCookie.name, data, options);
	}
}
async function getAccountCookie(c) {
	const accountCookie = getChunkedCookie(c, c.context.authCookies.accountData.name);
	if (accountCookie) {
		const accountData = safeJSONParse(await symmetricDecodeJWT(accountCookie, c.context.secretConfig, "better-auth-account"));
		if (accountData) return accountData;
	}
	return null;
}
var getSessionQuerySchema = optional(object({
	disableCookieCache: boolean().meta({ description: "Disable cookie cache and fetch session from database" }).optional(),
	disableRefresh: boolean().meta({ description: "Disable session refresh. Useful for checking session status, without updating the session" }).optional()
}));
var DAY = 1e3 * 60 * 60 * 24;
DAY * 7;
DAY * 30;
DAY * 365.25;
//#endregion
//#region node_modules/better-auth/dist/cookies/index.mjs
async function setCookieCache(ctx, session, dontRememberMe) {
	if (!ctx.context.options.session?.cookieCache?.enabled) return;
	const filteredSession = filterOutputFields(session.session, ctx.context.options.session?.additionalFields);
	const filteredUser = parseUserOutput(ctx.context.options, session.user);
	const versionConfig = ctx.context.options.session?.cookieCache?.version;
	let version = "1";
	if (versionConfig) {
		if (typeof versionConfig === "string") version = versionConfig;
		else if (typeof versionConfig === "function") {
			const result = versionConfig(session.session, session.user);
			version = isPromise(result) ? await result : result;
		}
	}
	const sessionData = {
		session: filteredSession,
		user: filteredUser,
		updatedAt: Date.now(),
		version
	};
	const options = {
		...ctx.context.authCookies.sessionData.attributes,
		maxAge: dontRememberMe ? void 0 : ctx.context.authCookies.sessionData.attributes.maxAge
	};
	const expiresAtDate = getDate(options.maxAge || 60, "sec").getTime();
	const strategy = ctx.context.options.session?.cookieCache?.strategy || "compact";
	let data;
	if (strategy === "jwe") data = await symmetricEncodeJWT(sessionData, ctx.context.secretConfig, "better-auth-session", options.maxAge || 300);
	else if (strategy === "jwt") data = await signJWT(sessionData, ctx.context.secret, options.maxAge || 300);
	else data = base64Url.encode(JSON.stringify({
		session: sessionData,
		expiresAt: expiresAtDate,
		signature: await createHMAC("SHA-256", "base64urlnopad").sign(ctx.context.secret, JSON.stringify({
			...sessionData,
			expiresAt: expiresAtDate
		}))
	}), { padding: false });
	if (data.length > 4093) {
		const sessionStore = createSessionStore(ctx.context.authCookies.sessionData.name, options, ctx);
		const cookies = sessionStore.chunk(data, options);
		sessionStore.setCookies(cookies);
	} else {
		const sessionStore = createSessionStore(ctx.context.authCookies.sessionData.name, options, ctx);
		if (sessionStore.hasChunks()) {
			const cleanCookies = sessionStore.clean();
			sessionStore.setCookies(cleanCookies);
		}
		ctx.setCookie(ctx.context.authCookies.sessionData.name, data, options);
	}
	if (ctx.context.options.account?.storeAccountCookie) {
		const accountData = await getAccountCookie(ctx);
		if (accountData) await setAccountCookie(ctx, accountData);
	}
}
async function setSessionCookie(ctx, session, dontRememberMe, overrides) {
	const dontRememberMeCookie = await ctx.getSignedCookie(ctx.context.authCookies.dontRememberToken.name, ctx.context.secret);
	dontRememberMe = dontRememberMe !== void 0 ? dontRememberMe : !!dontRememberMeCookie;
	const options = ctx.context.authCookies.sessionToken.attributes;
	const maxAge = dontRememberMe ? void 0 : ctx.context.sessionConfig.expiresIn;
	await ctx.setSignedCookie(ctx.context.authCookies.sessionToken.name, session.session.token, ctx.context.secret, {
		...options,
		maxAge,
		...overrides
	});
	if (dontRememberMe) await ctx.setSignedCookie(ctx.context.authCookies.dontRememberToken.name, "true", ctx.context.secret, ctx.context.authCookies.dontRememberToken.attributes);
	await setCookieCache(ctx, session, dontRememberMe);
	ctx.context.setNewSession(session);
}
/**
* Expires a cookie by setting `maxAge: 0` while preserving its attributes
*/
function expireCookie(ctx, cookie) {
	ctx.setCookie(cookie.name, "", {
		...cookie.attributes,
		maxAge: 0
	});
}
function deleteSessionCookie(ctx, skipDontRememberMe) {
	expireCookie(ctx, ctx.context.authCookies.sessionToken);
	expireCookie(ctx, ctx.context.authCookies.sessionData);
	if (ctx.context.options.account?.storeAccountCookie) {
		expireCookie(ctx, ctx.context.authCookies.accountData);
		const accountStore = createAccountStore(ctx.context.authCookies.accountData.name, ctx.context.authCookies.accountData.attributes, ctx);
		const cleanCookies = accountStore.clean();
		accountStore.setCookies(cleanCookies);
	}
	if (ctx.context.oauthConfig.storeStateStrategy === "cookie") expireCookie(ctx, ctx.context.createAuthCookie("oauth_state"));
	const sessionStore = createSessionStore(ctx.context.authCookies.sessionData.name, ctx.context.authCookies.sessionData.attributes, ctx);
	const cleanCookies = sessionStore.clean();
	sessionStore.setCookies(cleanCookies);
	if (!skipDontRememberMe) expireCookie(ctx, ctx.context.authCookies.dontRememberToken);
}
function parseCookies(cookieHeader) {
	const cookies = cookieHeader.split("; ");
	const cookieMap = /* @__PURE__ */ new Map();
	cookies.forEach((cookie) => {
		const [name, value] = cookie.split(/=(.*)/s);
		cookieMap.set(name, value);
	});
	return cookieMap;
}
var getSessionCookie = (request, config) => {
	const cookies = (request instanceof Headers || !("headers" in request) ? request : request.headers).get("cookie");
	if (!cookies) return null;
	const { cookieName = "session_token", cookiePrefix = "better-auth" } = config || {};
	const parsedCookie = parseCookies(cookies);
	const getCookie = (name) => parsedCookie.get(name) || parsedCookie.get(`__Secure-${name}`);
	const sessionToken = getCookie(`${cookiePrefix}.${cookieName}`) || getCookie(`${cookiePrefix}-${cookieName}`);
	if (sessionToken) return sessionToken;
	return null;
};
//#endregion
//#region node_modules/better-auth/dist/utils/is-api-error.mjs
function isAPIError(error) {
	return error instanceof APIError$1 || error instanceof APIError || error?.name === "APIError";
}
//#endregion
//#region node_modules/better-auth/dist/auth/trusted-origins.mjs
/**
* Matches the given url against an origin or origin pattern
* See "options.trustedOrigins" for details of supported patterns
*
* @param url The url to test
* @param pattern The origin pattern
* @param [settings] Specify supported pattern matching settings
* @returns {boolean} true if the URL matches the origin pattern, false otherwise.
*/
var matchesOriginPattern = (url, pattern, settings) => {
	if (url.startsWith("/")) {
		if (settings?.allowRelativePaths) return url.startsWith("/") && /^\/(?!\/|\\|%2f|%5c)[\w\-.\+/@]*(?:\?[\w\-.\+/=&%@]*)?$/.test(url);
		return false;
	}
	if (pattern.includes("*") || pattern.includes("?")) {
		if (pattern.includes("://")) return wildcardMatch(pattern)(getOrigin(url) || url);
		const host = getHost(url);
		if (!host) return false;
		return wildcardMatch(pattern)(host);
	}
	const protocol = getProtocol(url);
	return protocol === "http:" || protocol === "https:" || !protocol ? pattern === getOrigin(url) : url.startsWith(pattern);
};
//#endregion
//#region node_modules/better-auth/dist/api/middlewares/origin-check.mjs
/**
* Checks if CSRF should be skipped for backward compatibility.
* Previously, disableOriginCheck also disabled CSRF checks.
* This maintains that behavior when disableCSRFCheck isn't explicitly set.
* Only triggers for skipOriginCheck === true, not for path arrays.
*/
function shouldSkipCSRFForBackwardCompat(ctx) {
	return ctx.context.skipOriginCheck === true && ctx.context.options.advanced?.disableCSRFCheck === void 0;
}
/**
* Logs deprecation warning for users relying on coupled behavior.
* Only logs if user explicitly set disableOriginCheck (not test environment default).
*/
var logBackwardCompatWarning = deprecate(function logBackwardCompatWarning() {}, "disableOriginCheck: true currently also disables CSRF checks. In a future version, disableOriginCheck will ONLY disable URL validation. To keep CSRF disabled, add disableCSRFCheck: true to your config.");
createAuthMiddleware(async (ctx) => {
	if (ctx.request?.method === "GET" || ctx.request?.method === "OPTIONS" || ctx.request?.method === "HEAD" || !ctx.request) return;
	await validateOrigin(ctx);
	if (ctx.context.skipOriginCheck) return;
	const { body, query } = ctx;
	const callbackURL = body?.callbackURL || query?.callbackURL;
	const redirectURL = body?.redirectTo;
	const errorCallbackURL = body?.errorCallbackURL;
	const newUserCallbackURL = body?.newUserCallbackURL;
	const validateURL = (url, label) => {
		if (!url) return;
		if (!ctx.context.isTrustedOrigin(url, { allowRelativePaths: label !== "origin" })) {
			ctx.context.logger.error(`Invalid ${label}: ${url}`);
			ctx.context.logger.info(`If it's a valid URL, please add ${url} to trustedOrigins in your auth config\n`, `Current list of trustedOrigins: ${ctx.context.trustedOrigins}`);
			if (label === "origin") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_ORIGIN);
			if (label === "callbackURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_CALLBACK_URL);
			if (label === "redirectURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_REDIRECT_URL);
			if (label === "errorCallbackURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_ERROR_CALLBACK_URL);
			if (label === "newUserCallbackURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_NEW_USER_CALLBACK_URL);
			throw APIError.fromStatus("FORBIDDEN", { message: `Invalid ${label}` });
		}
	};
	callbackURL && validateURL(callbackURL, "callbackURL");
	redirectURL && validateURL(redirectURL, "redirectURL");
	errorCallbackURL && validateURL(errorCallbackURL, "errorCallbackURL");
	newUserCallbackURL && validateURL(newUserCallbackURL, "newUserCallbackURL");
});
var originCheck = (getValue) => createAuthMiddleware(async (ctx) => {
	if (!ctx.request) return;
	if (ctx.context.skipOriginCheck) return;
	const callbackURL = getValue(ctx);
	const validateURL = (url, label) => {
		if (!url) return;
		if (!ctx.context.isTrustedOrigin(url, { allowRelativePaths: label !== "origin" })) {
			ctx.context.logger.error(`Invalid ${label}: ${url}`);
			ctx.context.logger.info(`If it's a valid URL, please add ${url} to trustedOrigins in your auth config\n`, `Current list of trustedOrigins: ${ctx.context.trustedOrigins}`);
			if (label === "origin") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_ORIGIN);
			if (label === "callbackURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_CALLBACK_URL);
			if (label === "redirectURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_REDIRECT_URL);
			if (label === "errorCallbackURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_ERROR_CALLBACK_URL);
			if (label === "newUserCallbackURL") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_NEW_USER_CALLBACK_URL);
			throw APIError.fromStatus("FORBIDDEN", { message: `Invalid ${label}` });
		}
	};
	const callbacks = Array.isArray(callbackURL) ? callbackURL : [callbackURL];
	for (const url of callbacks) validateURL(url, "callbackURL");
});
/**
* Validates origin header against trusted origins.
* @param ctx - The endpoint context
* @param forceValidate - If true, always validate origin regardless of cookies/skip flags
*/
async function validateOrigin(ctx, forceValidate = false) {
	const headers = ctx.request?.headers;
	if (!headers || !ctx.request) return;
	const originHeader = headers.get("origin") || headers.get("referer") || "";
	const useCookies = headers.has("cookie");
	if (ctx.context.skipCSRFCheck) return;
	if (shouldSkipCSRFForBackwardCompat(ctx)) {
		ctx.context.options.advanced?.disableOriginCheck === true && logBackwardCompatWarning();
		return;
	}
	const skipOriginCheck = ctx.context.skipOriginCheck;
	if (Array.isArray(skipOriginCheck)) try {
		const basePath = new URL(ctx.context.baseURL).pathname;
		const currentPath = normalizePathname(ctx.request.url, basePath);
		if (skipOriginCheck.some((skipPath) => currentPath.startsWith(skipPath))) return;
	} catch {}
	if (!(forceValidate || useCookies)) return;
	if (!originHeader || originHeader === "null") throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.MISSING_OR_NULL_ORIGIN);
	const trustedOrigins = Array.isArray(ctx.context.options.trustedOrigins) ? ctx.context.trustedOrigins : [...ctx.context.trustedOrigins, ...(await ctx.context.options.trustedOrigins?.(ctx.request))?.filter((v) => Boolean(v)) || []];
	if (!trustedOrigins.some((origin) => matchesOriginPattern(originHeader, origin))) {
		ctx.context.logger.error(`Invalid origin: ${originHeader}`);
		ctx.context.logger.info(`If it's a valid URL, please add ${originHeader} to trustedOrigins in your auth config\n`, `Current list of trustedOrigins: ${trustedOrigins}`);
		throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.INVALID_ORIGIN);
	}
}
createAuthMiddleware(async (ctx) => {
	if (!ctx.request) return;
	await validateFormCsrf(ctx);
});
/**
* Validates CSRF protection for first-login scenarios using Fetch Metadata headers.
* This prevents cross-site form submission attacks while supporting progressive enhancement.
*/
async function validateFormCsrf(ctx) {
	const req = ctx.request;
	if (!req) return;
	if (ctx.context.skipCSRFCheck) return;
	if (shouldSkipCSRFForBackwardCompat(ctx)) return;
	const headers = req.headers;
	if (headers.has("cookie")) return await validateOrigin(ctx);
	const site = headers.get("Sec-Fetch-Site");
	const mode = headers.get("Sec-Fetch-Mode");
	const dest = headers.get("Sec-Fetch-Dest");
	if (Boolean(site && site.trim() || mode && mode.trim() || dest && dest.trim())) {
		if (site === "cross-site" && mode === "navigate") {
			ctx.context.logger.error("Blocked cross-site navigation login attempt (CSRF protection)", {
				secFetchSite: site,
				secFetchMode: mode,
				secFetchDest: dest
			});
			throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.CROSS_SITE_NAVIGATION_LOGIN_BLOCKED);
		}
		return await validateOrigin(ctx, true);
	}
}
//#endregion
//#region node_modules/better-auth/dist/utils/get-request-ip.mjs
var LOCALHOST_IP = "127.0.0.1";
function getIp(req, options) {
	if (options.advanced?.ipAddress?.disableIpTracking) return null;
	const headers = "headers" in req ? req.headers : req;
	const ipHeaders = options.advanced?.ipAddress?.ipAddressHeaders || ["x-forwarded-for"];
	for (const key of ipHeaders) {
		const value = "get" in headers ? headers.get(key) : headers[key];
		if (typeof value === "string") {
			const ip = value.split(",")[0].trim();
			if (isValidIP(ip)) return normalizeIP(ip, { ipv6Subnet: options.advanced?.ipAddress?.ipv6Subnet });
		}
	}
	if (isTest() || isDevelopment()) return LOCALHOST_IP;
	return null;
}
//#endregion
//#region node_modules/better-auth/dist/api/state/oauth.mjs
var { get: getOAuthState, set: setOAuthState } = defineRequestState(() => null);
//#endregion
//#region node_modules/better-auth/dist/api/state/should-session-refresh.mjs
/**
* State for skipping session refresh
*
* In some cases, such as when using server-side rendering (SSR) or when dealing with
* certain types of requests, it may be necessary to skip session refresh to prevent
* potential inconsistencies between the session data in the database and the session
* data stored in cookies.
*/
var { get: getShouldSkipSessionRefresh, set: setShouldSkipSessionRefresh } = defineRequestState(() => false);
//#endregion
//#region node_modules/better-auth/dist/_virtual/_rolldown/runtime.mjs
var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp$2(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp$2(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp$2(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
//#endregion
//#region node_modules/better-auth/dist/db/get-schema.mjs
function getSchema(config) {
	const tables = getAuthTables(config);
	const schema = {};
	for (const key in tables) {
		const table = tables[key];
		const fields = table.fields;
		const actualFields = {};
		Object.entries(fields).forEach(([key, field]) => {
			actualFields[field.fieldName || key] = field;
			if (field.references) {
				const refTable = tables[field.references.model];
				if (refTable) actualFields[field.fieldName || key].references = {
					...field.references,
					model: refTable.modelName,
					field: field.references.field
				};
			}
		});
		if (schema[table.modelName]) {
			schema[table.modelName].fields = {
				...schema[table.modelName].fields,
				...actualFields
			};
			continue;
		}
		schema[table.modelName] = {
			fields: actualFields,
			order: table.order || Infinity
		};
	}
	return schema;
}
//#endregion
//#region node_modules/better-auth/dist/db/field-converter.mjs
function convertToDB(fields, values) {
	const result = values.id ? { id: values.id } : {};
	for (const key in fields) {
		const field = fields[key];
		const value = values[key];
		if (value === void 0) continue;
		result[field.fieldName || key] = value;
	}
	return result;
}
function convertFromDB(fields, values) {
	if (!values) return null;
	const result = { id: values.id };
	for (const [key, value] of Object.entries(fields)) result[key] = values[value.fieldName || key];
	return result;
}
//#endregion
//#region node_modules/better-auth/dist/db/with-hooks.mjs
function getWithHooks(adapter, ctx) {
	const hooks = ctx.hooks;
	async function createWithHooks(data, model, customCreateFn) {
		const context = await getCurrentAuthContext().catch(() => null);
		let actualData = data;
		for (const hook of hooks || []) {
			const toRun = hook[model]?.create?.before;
			if (toRun) {
				const result = await toRun(actualData, context);
				if (result === false) return null;
				if (typeof result === "object" && "data" in result) actualData = {
					...actualData,
					...result.data
				};
			}
		}
		let created = null;
		if (!customCreateFn || customCreateFn.executeMainFn) created = await (await getCurrentAdapter(adapter)).create({
			model,
			data: actualData,
			forceAllowId: true
		});
		if (customCreateFn?.fn) created = await customCreateFn.fn(created ?? actualData);
		for (const hook of hooks || []) {
			const toRun = hook[model]?.create?.after;
			if (toRun) await queueAfterTransactionHook(async () => {
				await toRun(created, context);
			});
		}
		return created;
	}
	async function updateWithHooks(data, where, model, customUpdateFn) {
		const context = await getCurrentAuthContext().catch(() => null);
		let actualData = data;
		for (const hook of hooks || []) {
			const toRun = hook[model]?.update?.before;
			if (toRun) {
				const result = await toRun(data, context);
				if (result === false) return null;
				if (typeof result === "object" && "data" in result) actualData = {
					...actualData,
					...result.data
				};
			}
		}
		const customUpdated = customUpdateFn ? await customUpdateFn.fn(actualData) : null;
		const updated = !customUpdateFn || customUpdateFn.executeMainFn ? await (await getCurrentAdapter(adapter)).update({
			model,
			update: actualData,
			where
		}) : customUpdated;
		for (const hook of hooks || []) {
			const toRun = hook[model]?.update?.after;
			if (toRun) await queueAfterTransactionHook(async () => {
				await toRun(updated, context);
			});
		}
		return updated;
	}
	async function updateManyWithHooks(data, where, model, customUpdateFn) {
		const context = await getCurrentAuthContext().catch(() => null);
		let actualData = data;
		for (const hook of hooks || []) {
			const toRun = hook[model]?.update?.before;
			if (toRun) {
				const result = await toRun(data, context);
				if (result === false) return null;
				if (typeof result === "object" && "data" in result) actualData = {
					...actualData,
					...result.data
				};
			}
		}
		const customUpdated = customUpdateFn ? await customUpdateFn.fn(actualData) : null;
		const updated = !customUpdateFn || customUpdateFn.executeMainFn ? await (await getCurrentAdapter(adapter)).updateMany({
			model,
			update: actualData,
			where
		}) : customUpdated;
		for (const hook of hooks || []) {
			const toRun = hook[model]?.update?.after;
			if (toRun) await queueAfterTransactionHook(async () => {
				await toRun(updated, context);
			});
		}
		return updated;
	}
	async function deleteWithHooks(where, model, customDeleteFn) {
		const context = await getCurrentAuthContext().catch(() => null);
		let entityToDelete = null;
		try {
			entityToDelete = (await (await getCurrentAdapter(adapter)).findMany({
				model,
				where,
				limit: 1
			}))[0] || null;
		} catch {}
		if (entityToDelete) for (const hook of hooks || []) {
			const toRun = hook[model]?.delete?.before;
			if (toRun) {
				if (await toRun(entityToDelete, context) === false) return null;
			}
		}
		const customDeleted = customDeleteFn ? await customDeleteFn.fn(where) : null;
		const deleted = (!customDeleteFn || customDeleteFn.executeMainFn) && entityToDelete ? await (await getCurrentAdapter(adapter)).delete({
			model,
			where
		}) : customDeleted;
		if (entityToDelete) for (const hook of hooks || []) {
			const toRun = hook[model]?.delete?.after;
			if (toRun) await queueAfterTransactionHook(async () => {
				await toRun(entityToDelete, context);
			});
		}
		return deleted;
	}
	async function deleteManyWithHooks(where, model, customDeleteFn) {
		const context = await getCurrentAuthContext().catch(() => null);
		let entitiesToDelete = [];
		try {
			entitiesToDelete = await (await getCurrentAdapter(adapter)).findMany({
				model,
				where
			});
		} catch {}
		for (const entity of entitiesToDelete) for (const hook of hooks || []) {
			const toRun = hook[model]?.delete?.before;
			if (toRun) {
				if (await toRun(entity, context) === false) return null;
			}
		}
		const customDeleted = customDeleteFn ? await customDeleteFn.fn(where) : null;
		const deleted = !customDeleteFn || customDeleteFn.executeMainFn ? await (await getCurrentAdapter(adapter)).deleteMany({
			model,
			where
		}) : customDeleted;
		for (const entity of entitiesToDelete) for (const hook of hooks || []) {
			const toRun = hook[model]?.delete?.after;
			if (toRun) await queueAfterTransactionHook(async () => {
				await toRun(entity, context);
			});
		}
		return deleted;
	}
	return {
		createWithHooks,
		updateWithHooks,
		updateManyWithHooks,
		deleteWithHooks,
		deleteManyWithHooks
	};
}
//#endregion
//#region node_modules/better-auth/dist/db/verification-token-storage.mjs
var defaultKeyHasher = async (identifier) => {
	const hash = await createHash("SHA-256").digest(new TextEncoder().encode(identifier));
	return base64Url.encode(new Uint8Array(hash), { padding: false });
};
async function processIdentifier(identifier, option) {
	if (!option || option === "plain") return identifier;
	if (option === "hashed") return defaultKeyHasher(identifier);
	if (typeof option === "object" && "hash" in option) return option.hash(identifier);
	return identifier;
}
function getStorageOption(identifier, config) {
	if (!config) return;
	if (typeof config === "object" && "default" in config) {
		if (config.overrides) {
			for (const [prefix, option] of Object.entries(config.overrides)) if (identifier.startsWith(prefix)) return option;
		}
		return config.default;
	}
	return config;
}
//#endregion
//#region node_modules/better-auth/dist/db/internal-adapter.mjs
function getTTLSeconds(expiresAt, now = Date.now()) {
	const expiresMs = typeof expiresAt === "number" ? expiresAt : expiresAt.getTime();
	return Math.max(Math.floor((expiresMs - now) / 1e3), 0);
}
var createInternalAdapter = (adapter, ctx) => {
	const logger = ctx.logger;
	const options = ctx.options;
	const secondaryStorage = options.secondaryStorage;
	const sessionExpiration = options.session?.expiresIn || 3600 * 24 * 7;
	const { createWithHooks, updateWithHooks, updateManyWithHooks, deleteWithHooks, deleteManyWithHooks } = getWithHooks(adapter, ctx);
	async function refreshUserSessions(user) {
		if (!secondaryStorage) return;
		const listRaw = await secondaryStorage.get(`active-sessions-${user.id}`);
		if (!listRaw) return;
		const now = Date.now();
		const validSessions = (safeJSONParse(listRaw) || []).filter((s) => s.expiresAt > now);
		await Promise.all(validSessions.map(async ({ token }) => {
			const cached = await secondaryStorage.get(token);
			if (!cached) return;
			const parsed = safeJSONParse(cached);
			if (!parsed) return;
			const sessionTTL = getTTLSeconds(parsed.session.expiresAt, now);
			await secondaryStorage.set(token, JSON.stringify({
				session: parsed.session,
				user
			}), Math.floor(sessionTTL));
		}));
	}
	return {
		createOAuthUser: async (user, account) => {
			return runWithTransaction(adapter, async () => {
				const createdUser = await createWithHooks({
					createdAt: /* @__PURE__ */ new Date(),
					updatedAt: /* @__PURE__ */ new Date(),
					...user
				}, "user", void 0);
				return {
					user: createdUser,
					account: await createWithHooks({
						...account,
						userId: createdUser.id,
						createdAt: /* @__PURE__ */ new Date(),
						updatedAt: /* @__PURE__ */ new Date()
					}, "account", void 0)
				};
			});
		},
		createUser: async (user) => {
			return await createWithHooks({
				createdAt: /* @__PURE__ */ new Date(),
				updatedAt: /* @__PURE__ */ new Date(),
				...user,
				email: user.email?.toLowerCase()
			}, "user", void 0);
		},
		createAccount: async (account) => {
			return await createWithHooks({
				createdAt: /* @__PURE__ */ new Date(),
				updatedAt: /* @__PURE__ */ new Date(),
				...account
			}, "account", void 0);
		},
		listSessions: async (userId, options) => {
			if (secondaryStorage) {
				const currentList = await secondaryStorage.get(`active-sessions-${userId}`);
				if (!currentList) return [];
				const list = safeJSONParse(currentList) || [];
				const now = Date.now();
				const seenTokens = /* @__PURE__ */ new Set();
				const sessions = [];
				for (const { token, expiresAt } of list) {
					if (expiresAt <= now || seenTokens.has(token)) continue;
					seenTokens.add(token);
					const data = await secondaryStorage.get(token);
					if (!data) continue;
					try {
						const parsed = typeof data === "string" ? JSON.parse(data) : data;
						if (!parsed?.session) continue;
						sessions.push(parseSessionOutput(ctx.options, {
							...parsed.session,
							expiresAt: new Date(parsed.session.expiresAt)
						}));
					} catch {
						continue;
					}
				}
				return sessions;
			}
			return await (await getCurrentAdapter(adapter)).findMany({
				model: "session",
				where: [{
					field: "userId",
					value: userId
				}, ...options?.onlyActiveSessions ? [{
					field: "expiresAt",
					value: /* @__PURE__ */ new Date(),
					operator: "gt"
				}] : []]
			});
		},
		listUsers: async (limit, offset, sortBy, where) => {
			return await (await getCurrentAdapter(adapter)).findMany({
				model: "user",
				limit,
				offset,
				sortBy,
				where
			});
		},
		countTotalUsers: async (where) => {
			const total = await (await getCurrentAdapter(adapter)).count({
				model: "user",
				where
			});
			if (typeof total === "string") return parseInt(total);
			return total;
		},
		deleteUser: async (userId) => {
			if (!secondaryStorage || options.session?.storeSessionInDatabase) await deleteManyWithHooks([{
				field: "userId",
				value: userId
			}], "session", void 0);
			await deleteManyWithHooks([{
				field: "userId",
				value: userId
			}], "account", void 0);
			await deleteWithHooks([{
				field: "id",
				value: userId
			}], "user", void 0);
		},
		createSession: async (userId, dontRememberMe, override, overrideAll) => {
			const headers = await (async () => {
				const ctx = await getCurrentAuthContext().catch(() => null);
				return ctx?.headers || ctx?.request?.headers;
			})();
			const storeInDb = options.session?.storeSessionInDatabase;
			const { id: _, ...rest } = override || {};
			const defaultAdditionalFields = getSessionDefaultFields(options);
			const data = {
				ipAddress: headers ? getIp(headers, options) || "" : "",
				userAgent: headers?.get("user-agent") || "",
				...rest,
				expiresAt: dontRememberMe ? getDate(3600 * 24, "sec") : getDate(sessionExpiration, "sec"),
				userId,
				token: generateId(32),
				createdAt: /* @__PURE__ */ new Date(),
				updatedAt: /* @__PURE__ */ new Date(),
				...defaultAdditionalFields,
				...overrideAll ? rest : {}
			};
			return await createWithHooks(data, "session", secondaryStorage ? {
				fn: async (sessionData) => {
					/**
					* store the session token for the user
					* so we can retrieve it later for listing sessions
					*/
					const currentList = await secondaryStorage.get(`active-sessions-${userId}`);
					let list = [];
					const now = Date.now();
					if (currentList) {
						list = safeJSONParse(currentList) || [];
						list = list.filter((session) => session.expiresAt > now && session.token !== data.token);
					}
					const sorted = [...list, {
						token: data.token,
						expiresAt: data.expiresAt.getTime()
					}].sort((a, b) => a.expiresAt - b.expiresAt);
					const furthestSessionTTL = getTTLSeconds(sorted.at(-1)?.expiresAt ?? data.expiresAt.getTime(), now);
					if (furthestSessionTTL > 0) await secondaryStorage.set(`active-sessions-${userId}`, JSON.stringify(sorted), furthestSessionTTL);
					const user = await (await getCurrentAdapter(adapter)).findOne({
						model: "user",
						where: [{
							field: "id",
							value: userId
						}]
					});
					const sessionTTL = getTTLSeconds(data.expiresAt, now);
					if (sessionTTL > 0) await secondaryStorage.set(data.token, JSON.stringify({
						session: sessionData,
						user
					}), sessionTTL);
					return sessionData;
				},
				executeMainFn: storeInDb
			} : void 0);
		},
		findSession: async (token) => {
			if (secondaryStorage) {
				const sessionStringified = await secondaryStorage.get(token);
				if (!sessionStringified && !options.session?.storeSessionInDatabase) return null;
				if (sessionStringified) {
					const s = safeJSONParse(sessionStringified);
					if (!s) return null;
					return {
						session: parseSessionOutput(ctx.options, {
							...s.session,
							expiresAt: new Date(s.session.expiresAt),
							createdAt: new Date(s.session.createdAt),
							updatedAt: new Date(s.session.updatedAt)
						}),
						user: parseUserOutput(ctx.options, {
							...s.user,
							createdAt: new Date(s.user.createdAt),
							updatedAt: new Date(s.user.updatedAt)
						})
					};
				}
			}
			const result = await (await getCurrentAdapter(adapter)).findOne({
				model: "session",
				where: [{
					value: token,
					field: "token"
				}],
				join: { user: true }
			});
			if (!result) return null;
			const { user, ...session } = result;
			if (!user) return null;
			return {
				session: parseSessionOutput(ctx.options, session),
				user: parseUserOutput(ctx.options, user)
			};
		},
		findSessions: async (sessionTokens, options) => {
			if (secondaryStorage) {
				const sessions = [];
				for (const sessionToken of sessionTokens) {
					const sessionStringified = await secondaryStorage.get(sessionToken);
					if (sessionStringified) try {
						const s = typeof sessionStringified === "string" ? JSON.parse(sessionStringified) : sessionStringified;
						if (!s) return [];
						const expiresAt = new Date(s.session.expiresAt);
						if (options?.onlyActiveSessions && expiresAt <= /* @__PURE__ */ new Date()) continue;
						const session = {
							session: {
								...s.session,
								expiresAt: new Date(s.session.expiresAt)
							},
							user: {
								...s.user,
								createdAt: new Date(s.user.createdAt),
								updatedAt: new Date(s.user.updatedAt)
							}
						};
						sessions.push(session);
					} catch {
						continue;
					}
				}
				return sessions;
			}
			const sessions = await (await getCurrentAdapter(adapter)).findMany({
				model: "session",
				where: [{
					field: "token",
					value: sessionTokens,
					operator: "in"
				}, ...options?.onlyActiveSessions ? [{
					field: "expiresAt",
					value: /* @__PURE__ */ new Date(),
					operator: "gt"
				}] : []],
				join: { user: true }
			});
			if (!sessions.length) return [];
			if (sessions.some((session) => !session.user)) return [];
			return sessions.map((_session) => {
				const { user, ...session } = _session;
				return {
					session,
					user
				};
			});
		},
		updateSession: async (sessionToken, session) => {
			return await updateWithHooks(session, [{
				field: "token",
				value: sessionToken
			}], "session", secondaryStorage ? {
				async fn(data) {
					const currentSession = await secondaryStorage.get(sessionToken);
					if (!currentSession) return null;
					const parsedSession = safeJSONParse(currentSession);
					if (!parsedSession) return null;
					const mergedSession = {
						...parsedSession.session,
						...data,
						expiresAt: new Date(data.expiresAt ?? parsedSession.session.expiresAt),
						createdAt: new Date(parsedSession.session.createdAt),
						updatedAt: new Date(data.updatedAt ?? parsedSession.session.updatedAt)
					};
					const updatedSession = parseSessionOutput(ctx.options, mergedSession);
					const now = Date.now();
					const expiresMs = new Date(updatedSession.expiresAt).getTime();
					const sessionTTL = getTTLSeconds(expiresMs, now);
					if (sessionTTL > 0) {
						await secondaryStorage.set(sessionToken, JSON.stringify({
							session: updatedSession,
							user: parsedSession.user
						}), sessionTTL);
						const listKey = `active-sessions-${updatedSession.userId}`;
						const listRaw = await secondaryStorage.get(listKey);
						const sorted = (listRaw ? safeJSONParse(listRaw) || [] : []).filter((s) => s.token !== sessionToken && s.expiresAt > now).concat([{
							token: sessionToken,
							expiresAt: expiresMs
						}]).sort((a, b) => a.expiresAt - b.expiresAt);
						const furthestSessionExp = sorted.at(-1)?.expiresAt;
						if (furthestSessionExp && furthestSessionExp > now) await secondaryStorage.set(listKey, JSON.stringify(sorted), getTTLSeconds(furthestSessionExp, now));
						else await secondaryStorage.delete(listKey);
					}
					return updatedSession;
				},
				executeMainFn: options.session?.storeSessionInDatabase
			} : void 0);
		},
		deleteSession: async (token) => {
			if (secondaryStorage) {
				const data = await secondaryStorage.get(token);
				if (data) {
					const { session } = safeJSONParse(data) ?? {};
					if (!session) {
						logger.error("Session not found in secondary storage");
						return;
					}
					const userId = session.userId;
					const currentList = await secondaryStorage.get(`active-sessions-${userId}`);
					if (currentList) {
						const list = safeJSONParse(currentList) || [];
						const now = Date.now();
						const filtered = list.filter((session) => session.expiresAt > now && session.token !== token);
						const furthestSessionExp = filtered.sort((a, b) => a.expiresAt - b.expiresAt).at(-1)?.expiresAt;
						if (filtered.length > 0 && furthestSessionExp && furthestSessionExp > Date.now()) await secondaryStorage.set(`active-sessions-${userId}`, JSON.stringify(filtered), getTTLSeconds(furthestSessionExp, now));
						else await secondaryStorage.delete(`active-sessions-${userId}`);
					} else logger.error("Active sessions list not found in secondary storage");
				}
				await secondaryStorage.delete(token);
				if (!options.session?.storeSessionInDatabase || ctx.options.session?.preserveSessionInDatabase) return;
			}
			await deleteWithHooks([{
				field: "token",
				value: token
			}], "session", void 0);
		},
		deleteAccounts: async (userId) => {
			await deleteManyWithHooks([{
				field: "userId",
				value: userId
			}], "account", void 0);
		},
		deleteAccount: async (accountId) => {
			await deleteWithHooks([{
				field: "id",
				value: accountId
			}], "account", void 0);
		},
		deleteSessions: async (userIdOrSessionTokens) => {
			if (secondaryStorage) {
				if (typeof userIdOrSessionTokens === "string") {
					const activeSession = await secondaryStorage.get(`active-sessions-${userIdOrSessionTokens}`);
					const sessions = activeSession ? safeJSONParse(activeSession) : [];
					if (!sessions) return;
					for (const session of sessions) await secondaryStorage.delete(session.token);
					await secondaryStorage.delete(`active-sessions-${userIdOrSessionTokens}`);
				} else for (const sessionToken of userIdOrSessionTokens) if (await secondaryStorage.get(sessionToken)) await secondaryStorage.delete(sessionToken);
				if (!options.session?.storeSessionInDatabase || ctx.options.session?.preserveSessionInDatabase) return;
			}
			await deleteManyWithHooks([{
				field: Array.isArray(userIdOrSessionTokens) ? "token" : "userId",
				value: userIdOrSessionTokens,
				operator: Array.isArray(userIdOrSessionTokens) ? "in" : void 0
			}], "session", void 0);
		},
		findOAuthUser: async (email, accountId, providerId) => {
			const account = await (await getCurrentAdapter(adapter)).findOne({
				model: "account",
				where: [{
					value: accountId,
					field: "accountId"
				}, {
					value: providerId,
					field: "providerId"
				}],
				join: { user: true }
			});
			if (account) if (account.user) return {
				user: account.user,
				linkedAccount: account,
				accounts: [account]
			};
			else {
				const user = await (await getCurrentAdapter(adapter)).findOne({
					model: "user",
					where: [{
						value: email.toLowerCase(),
						field: "email"
					}]
				});
				if (user) return {
					user,
					linkedAccount: account,
					accounts: [account]
				};
				return null;
			}
			else {
				const user = await (await getCurrentAdapter(adapter)).findOne({
					model: "user",
					where: [{
						value: email.toLowerCase(),
						field: "email"
					}]
				});
				if (user) return {
					user,
					linkedAccount: null,
					accounts: await (await getCurrentAdapter(adapter)).findMany({
						model: "account",
						where: [{
							value: user.id,
							field: "userId"
						}]
					}) || []
				};
				else return null;
			}
		},
		findUserByEmail: async (email, options) => {
			const result = await (await getCurrentAdapter(adapter)).findOne({
				model: "user",
				where: [{
					value: email.toLowerCase(),
					field: "email"
				}],
				join: { ...options?.includeAccounts ? { account: true } : {} }
			});
			if (!result) return null;
			const { account: accounts, ...user } = result;
			return {
				user,
				accounts: accounts ?? []
			};
		},
		findUserById: async (userId) => {
			if (!userId) return null;
			return await (await getCurrentAdapter(adapter)).findOne({
				model: "user",
				where: [{
					field: "id",
					value: userId
				}]
			});
		},
		linkAccount: async (account) => {
			return await createWithHooks({
				createdAt: /* @__PURE__ */ new Date(),
				updatedAt: /* @__PURE__ */ new Date(),
				...account
			}, "account", void 0);
		},
		updateUser: async (userId, data) => {
			const user = await updateWithHooks(data, [{
				field: "id",
				value: userId
			}], "user", void 0);
			await refreshUserSessions(user);
			return user;
		},
		updateUserByEmail: async (email, data) => {
			const user = await updateWithHooks(data, [{
				field: "email",
				value: email.toLowerCase()
			}], "user", void 0);
			await refreshUserSessions(user);
			return user;
		},
		updatePassword: async (userId, password) => {
			await updateManyWithHooks({ password }, [{
				field: "userId",
				value: userId
			}, {
				field: "providerId",
				value: "credential"
			}], "account", void 0);
		},
		findAccounts: async (userId) => {
			return await (await getCurrentAdapter(adapter)).findMany({
				model: "account",
				where: [{
					field: "userId",
					value: userId
				}]
			});
		},
		findAccount: async (accountId) => {
			return await (await getCurrentAdapter(adapter)).findOne({
				model: "account",
				where: [{
					field: "accountId",
					value: accountId
				}]
			});
		},
		findAccountByProviderId: async (accountId, providerId) => {
			return await (await getCurrentAdapter(adapter)).findOne({
				model: "account",
				where: [{
					field: "accountId",
					value: accountId
				}, {
					field: "providerId",
					value: providerId
				}]
			});
		},
		findAccountByUserId: async (userId) => {
			return await (await getCurrentAdapter(adapter)).findMany({
				model: "account",
				where: [{
					field: "userId",
					value: userId
				}]
			});
		},
		updateAccount: async (id, data) => {
			return await updateWithHooks(data, [{
				field: "id",
				value: id
			}], "account", void 0);
		},
		createVerificationValue: async (data) => {
			const storageOption = getStorageOption(data.identifier, options.verification?.storeIdentifier);
			const storedIdentifier = await processIdentifier(data.identifier, storageOption);
			return await createWithHooks({
				createdAt: /* @__PURE__ */ new Date(),
				updatedAt: /* @__PURE__ */ new Date(),
				...data,
				identifier: storedIdentifier
			}, "verification", secondaryStorage ? {
				async fn(verificationData) {
					const ttl = getTTLSeconds(verificationData.expiresAt);
					if (ttl > 0) await secondaryStorage.set(`verification:${storedIdentifier}`, JSON.stringify(verificationData), ttl);
					return verificationData;
				},
				executeMainFn: options.verification?.storeInDatabase
			} : void 0);
		},
		findVerificationValue: async (identifier) => {
			const storageOption = getStorageOption(identifier, options.verification?.storeIdentifier);
			const storedIdentifier = await processIdentifier(identifier, storageOption);
			if (secondaryStorage) {
				const cached = await secondaryStorage.get(`verification:${storedIdentifier}`);
				if (cached) {
					const parsed = safeJSONParse(cached);
					if (parsed) return parsed;
				}
				if (storageOption && storageOption !== "plain") {
					const plainCached = await secondaryStorage.get(`verification:${identifier}`);
					if (plainCached) {
						const parsed = safeJSONParse(plainCached);
						if (parsed) return parsed;
					}
				}
				if (!options.verification?.storeInDatabase) return null;
			}
			const currentAdapter = await getCurrentAdapter(adapter);
			async function findByIdentifier(id) {
				return currentAdapter.findMany({
					model: "verification",
					where: [{
						field: "identifier",
						value: id
					}],
					sortBy: {
						field: "createdAt",
						direction: "desc"
					},
					limit: 1
				});
			}
			let verification = await findByIdentifier(storedIdentifier);
			if (!verification.length && storageOption && storageOption !== "plain") verification = await findByIdentifier(identifier);
			if (!options.verification?.disableCleanup) await deleteManyWithHooks([{
				field: "expiresAt",
				value: /* @__PURE__ */ new Date(),
				operator: "lt"
			}], "verification", void 0);
			return verification[0] || null;
		},
		deleteVerificationByIdentifier: async (identifier) => {
			const storedIdentifier = await processIdentifier(identifier, getStorageOption(identifier, options.verification?.storeIdentifier));
			if (secondaryStorage) await secondaryStorage.delete(`verification:${storedIdentifier}`);
			if (!secondaryStorage || options.verification?.storeInDatabase) await deleteWithHooks([{
				field: "identifier",
				value: storedIdentifier
			}], "verification", void 0);
		},
		updateVerificationByIdentifier: async (identifier, data) => {
			const storedIdentifier = await processIdentifier(identifier, getStorageOption(identifier, options.verification?.storeIdentifier));
			if (secondaryStorage) {
				const cached = await secondaryStorage.get(`verification:${storedIdentifier}`);
				if (cached) {
					const parsed = safeJSONParse(cached);
					if (parsed) {
						const updated = {
							...parsed,
							...data
						};
						const expiresAt = updated.expiresAt ?? parsed.expiresAt;
						const ttl = getTTLSeconds(expiresAt instanceof Date ? expiresAt : new Date(expiresAt));
						if (ttl > 0) await secondaryStorage.set(`verification:${storedIdentifier}`, JSON.stringify(updated), ttl);
						if (!options.verification?.storeInDatabase) return updated;
					}
				}
			}
			if (!secondaryStorage || options.verification?.storeInDatabase) return await updateWithHooks(data, [{
				field: "identifier",
				value: storedIdentifier
			}], "verification", void 0);
			return data;
		}
	};
};
//#endregion
//#region node_modules/better-auth/dist/db/to-zod.mjs
function toZodSchema({ fields, isClientSide }) {
	return object(Object.keys(fields).reduce((acc, key) => {
		const field = fields[key];
		if (!field) return acc;
		if (isClientSide && field.input === false) return acc;
		let schema;
		if (field.type === "json") schema = json ? json() : any();
		else if (field.type === "string[]" || field.type === "number[]") schema = array(field.type === "string[]" ? string() : number());
		else if (Array.isArray(field.type)) schema = any();
		else schema = zod_exports[field.type]();
		if (field?.required === false) schema = schema.optional();
		if (!isClientSide && field?.returned === false) return acc;
		return {
			...acc,
			[key]: schema
		};
	}, {}));
}
__reExport(/* @__PURE__ */ __exportAll({
	convertFromDB: () => convertFromDB,
	convertToDB: () => convertToDB,
	createInternalAdapter: () => createInternalAdapter,
	getSchema: () => getSchema,
	getSessionDefaultFields: () => getSessionDefaultFields,
	getWithHooks: () => getWithHooks,
	mergeSchema: () => mergeSchema,
	parseAccountInput: () => parseAccountInput,
	parseAccountOutput: () => parseAccountOutput,
	parseAdditionalUserInput: () => parseAdditionalUserInput,
	parseInputData: () => parseInputData,
	parseSessionInput: () => parseSessionInput,
	parseSessionOutput: () => parseSessionOutput,
	parseUserInput: () => parseUserInput,
	parseUserOutput: () => parseUserOutput,
	toZodSchema: () => toZodSchema
}), db_exports$1);
//#endregion
//#region node_modules/better-auth/dist/api/routes/session.mjs
var getSession = () => createAuthEndpoint("/get-session", {
	method: ["GET", "POST"],
	operationId: "getSession",
	query: getSessionQuerySchema,
	requireHeaders: true,
	metadata: { openapi: {
		operationId: "getSession",
		description: "Get the current session",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				nullable: true,
				properties: {
					session: { $ref: "#/components/schemas/Session" },
					user: { $ref: "#/components/schemas/User" }
				},
				required: ["session", "user"]
			} } }
		} }
	} }
}, async (ctx) => {
	const deferSessionRefresh = ctx.context.options.session?.deferSessionRefresh;
	const isPostRequest = ctx.method === "POST";
	if (isPostRequest && !deferSessionRefresh) throw APIError.from("METHOD_NOT_ALLOWED", BASE_ERROR_CODES.METHOD_NOT_ALLOWED_DEFER_SESSION_REQUIRED);
	try {
		const sessionCookieToken = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret);
		if (!sessionCookieToken) return null;
		const sessionDataCookie = getChunkedCookie(ctx, ctx.context.authCookies.sessionData.name);
		let sessionDataPayload = null;
		if (sessionDataCookie) {
			const strategy = ctx.context.options.session?.cookieCache?.strategy || "compact";
			if (strategy === "jwe") {
				const payload = await symmetricDecodeJWT(sessionDataCookie, ctx.context.secretConfig, "better-auth-session");
				if (payload && payload.session && payload.user) sessionDataPayload = {
					session: {
						session: payload.session,
						user: payload.user,
						updatedAt: payload.updatedAt,
						version: payload.version
					},
					expiresAt: payload.exp ? payload.exp * 1e3 : Date.now()
				};
				else {
					expireCookie(ctx, ctx.context.authCookies.sessionData);
					return ctx.json(null);
				}
			} else if (strategy === "jwt") {
				const payload = await verifyJWT(sessionDataCookie, ctx.context.secret);
				if (payload && payload.session && payload.user) sessionDataPayload = {
					session: {
						session: payload.session,
						user: payload.user,
						updatedAt: payload.updatedAt,
						version: payload.version
					},
					expiresAt: payload.exp ? payload.exp * 1e3 : Date.now()
				};
				else {
					expireCookie(ctx, ctx.context.authCookies.sessionData);
					return ctx.json(null);
				}
			} else {
				const parsed = safeJSONParse(binary.decode(base64Url.decode(sessionDataCookie)));
				if (parsed) if (await createHMAC("SHA-256", "base64urlnopad").verify(ctx.context.secret, JSON.stringify({
					...parsed.session,
					expiresAt: parsed.expiresAt
				}), parsed.signature)) sessionDataPayload = parsed;
				else {
					expireCookie(ctx, ctx.context.authCookies.sessionData);
					return ctx.json(null);
				}
			}
		}
		const dontRememberMe = await ctx.getSignedCookie(ctx.context.authCookies.dontRememberToken.name, ctx.context.secret);
		/**
		* If session data is present in the cookie, check if it should be used or refreshed
		*/
		if (sessionDataPayload?.session && ctx.context.options.session?.cookieCache?.enabled && !ctx.query?.disableCookieCache) {
			const session = sessionDataPayload.session;
			const versionConfig = ctx.context.options.session?.cookieCache?.version;
			let expectedVersion = "1";
			if (versionConfig) {
				if (typeof versionConfig === "string") expectedVersion = versionConfig;
				else if (typeof versionConfig === "function") {
					const result = versionConfig(session.session, session.user);
					expectedVersion = result instanceof Promise ? await result : result;
				}
			}
			if ((session.version || "1") !== expectedVersion) expireCookie(ctx, ctx.context.authCookies.sessionData);
			else {
				const cachedSessionExpiresAt = new Date(session.session.expiresAt);
				if (sessionDataPayload.expiresAt < Date.now() || cachedSessionExpiresAt < /* @__PURE__ */ new Date()) expireCookie(ctx, ctx.context.authCookies.sessionData);
				else {
					const cookieRefreshCache = ctx.context.sessionConfig.cookieRefreshCache;
					if (cookieRefreshCache === false) {
						ctx.context.session = session;
						const parsedSession = parseSessionOutput(ctx.context.options, {
							...session.session,
							expiresAt: new Date(session.session.expiresAt),
							createdAt: new Date(session.session.createdAt),
							updatedAt: new Date(session.session.updatedAt)
						});
						const parsedUser = parseUserOutput(ctx.context.options, {
							...session.user,
							createdAt: new Date(session.user.createdAt),
							updatedAt: new Date(session.user.updatedAt)
						});
						return ctx.json({
							session: parsedSession,
							user: parsedUser
						});
					}
					const timeUntilExpiry = sessionDataPayload.expiresAt - Date.now();
					const updateAge = cookieRefreshCache.updateAge * 1e3;
					const shouldSkipSessionRefresh = await getShouldSkipSessionRefresh();
					if (timeUntilExpiry < updateAge && !shouldSkipSessionRefresh) {
						const newExpiresAt = getDate(ctx.context.options.session?.cookieCache?.maxAge || 300, "sec");
						const refreshedSession = {
							session: {
								...session.session,
								expiresAt: newExpiresAt
							},
							user: session.user,
							updatedAt: Date.now()
						};
						await setCookieCache(ctx, refreshedSession, false);
						const sessionTokenOptions = ctx.context.authCookies.sessionToken.attributes;
						const sessionTokenMaxAge = dontRememberMe ? void 0 : ctx.context.sessionConfig.expiresIn;
						await ctx.setSignedCookie(ctx.context.authCookies.sessionToken.name, session.session.token, ctx.context.secret, {
							...sessionTokenOptions,
							maxAge: sessionTokenMaxAge
						});
						const parsedRefreshedSession = parseSessionOutput(ctx.context.options, {
							...refreshedSession.session,
							expiresAt: new Date(refreshedSession.session.expiresAt),
							createdAt: new Date(refreshedSession.session.createdAt),
							updatedAt: new Date(refreshedSession.session.updatedAt)
						});
						const parsedRefreshedUser = parseUserOutput(ctx.context.options, {
							...refreshedSession.user,
							createdAt: new Date(refreshedSession.user.createdAt),
							updatedAt: new Date(refreshedSession.user.updatedAt)
						});
						ctx.context.session = {
							session: parsedRefreshedSession,
							user: parsedRefreshedUser
						};
						return ctx.json({
							session: parsedRefreshedSession,
							user: parsedRefreshedUser
						});
					}
					const parsedSession = parseSessionOutput(ctx.context.options, {
						...session.session,
						expiresAt: new Date(session.session.expiresAt),
						createdAt: new Date(session.session.createdAt),
						updatedAt: new Date(session.session.updatedAt)
					});
					const parsedUser = parseUserOutput(ctx.context.options, {
						...session.user,
						createdAt: new Date(session.user.createdAt),
						updatedAt: new Date(session.user.updatedAt)
					});
					ctx.context.session = {
						session: parsedSession,
						user: parsedUser
					};
					return ctx.json({
						session: parsedSession,
						user: parsedUser
					});
				}
			}
		}
		const session = await ctx.context.internalAdapter.findSession(sessionCookieToken);
		ctx.context.session = session;
		if (!session || session.session.expiresAt < /* @__PURE__ */ new Date()) {
			deleteSessionCookie(ctx);
			if (session) {
				/**
				* if session expired clean up the session
				* Only delete on POST when deferSessionRefresh is enabled
				*/
				if (!deferSessionRefresh || isPostRequest) await ctx.context.internalAdapter.deleteSession(session.session.token);
			}
			return ctx.json(null);
		}
		/**
		* We don't need to update the session if the user doesn't want to be remembered
		* or if the session refresh is disabled
		*/
		if (dontRememberMe || ctx.query?.disableRefresh) {
			const parsedSession = parseSessionOutput(ctx.context.options, session.session);
			const parsedUser = parseUserOutput(ctx.context.options, session.user);
			return ctx.json({
				session: parsedSession,
				user: parsedUser
			});
		}
		const expiresIn = ctx.context.sessionConfig.expiresIn;
		const updateAge = ctx.context.sessionConfig.updateAge;
		const shouldBeUpdated = session.session.expiresAt.valueOf() - expiresIn * 1e3 + updateAge * 1e3 <= Date.now();
		const disableRefresh = ctx.query?.disableRefresh || ctx.context.options.session?.disableSessionRefresh;
		const shouldSkipSessionRefresh = await getShouldSkipSessionRefresh();
		const needsRefresh = shouldBeUpdated && !disableRefresh && !shouldSkipSessionRefresh;
		/**
		* When deferSessionRefresh is enabled and this is a GET request,
		* return the session without performing writes, but include needsRefresh flag
		*/
		if (deferSessionRefresh && !isPostRequest) {
			await setCookieCache(ctx, session, !!dontRememberMe);
			const parsedSession = parseSessionOutput(ctx.context.options, session.session);
			const parsedUser = parseUserOutput(ctx.context.options, session.user);
			return ctx.json({
				session: parsedSession,
				user: parsedUser,
				needsRefresh
			});
		}
		if (needsRefresh) {
			const updatedSession = await ctx.context.internalAdapter.updateSession(session.session.token, {
				expiresAt: getDate(ctx.context.sessionConfig.expiresIn, "sec"),
				updatedAt: /* @__PURE__ */ new Date()
			});
			if (!updatedSession) {
				/**
				* Handle case where session update fails (e.g., concurrent deletion)
				*/
				deleteSessionCookie(ctx);
				throw APIError.from("UNAUTHORIZED", BASE_ERROR_CODES.FAILED_TO_GET_SESSION);
			}
			const maxAge = (updatedSession.expiresAt.valueOf() - Date.now()) / 1e3;
			await setSessionCookie(ctx, {
				session: updatedSession,
				user: session.user
			}, false, { maxAge });
			const parsedUpdatedSession = parseSessionOutput(ctx.context.options, updatedSession);
			const parsedUser = parseUserOutput(ctx.context.options, session.user);
			return ctx.json({
				session: parsedUpdatedSession,
				user: parsedUser
			});
		}
		await setCookieCache(ctx, session, !!dontRememberMe);
		const parsedSession = parseSessionOutput(ctx.context.options, session.session);
		const parsedUser = parseUserOutput(ctx.context.options, session.user);
		return ctx.json({
			session: parsedSession,
			user: parsedUser
		});
	} catch (error) {
		if (isAPIError(error)) throw error;
		ctx.context.logger.error("INTERNAL_SERVER_ERROR", error);
		throw APIError.from("INTERNAL_SERVER_ERROR", BASE_ERROR_CODES.FAILED_TO_GET_SESSION);
	}
});
var getSessionFromCtx = async (ctx, config) => {
	if (ctx.context.session) return ctx.context.session;
	const session = await getSession()({
		...ctx,
		method: "GET",
		asResponse: false,
		headers: ctx.headers,
		returnHeaders: false,
		returnStatus: false,
		query: {
			...config,
			...ctx.query
		}
	}).catch((e) => {
		return null;
	});
	ctx.context.session = session;
	return session;
};
/**
* The middleware forces the endpoint to require a valid session.
*/
var sessionMiddleware = createAuthMiddleware(async (ctx) => {
	const session = await getSessionFromCtx(ctx);
	if (!session?.session) throw APIError.from("UNAUTHORIZED", {
		message: "Unauthorized",
		code: "UNAUTHORIZED"
	});
	return { session };
});
/**
* This middleware forces the endpoint to require a valid session and ignores cookie cache.
* This should be used for sensitive operations like password changes, account deletion, etc.
* to ensure that revoked sessions cannot be used even if they're still cached in cookies.
*/
var sensitiveSessionMiddleware = createAuthMiddleware(async (ctx) => {
	const session = await getSessionFromCtx(ctx, { disableCookieCache: true });
	if (!session?.session) throw APIError.from("UNAUTHORIZED", {
		message: "Unauthorized",
		code: "UNAUTHORIZED"
	});
	return { session };
});
createAuthMiddleware(async (ctx) => {
	const session = await getSessionFromCtx(ctx);
	if (!session?.session && (ctx.request || ctx.headers)) throw APIError.from("UNAUTHORIZED", {
		message: "Unauthorized",
		code: "UNAUTHORIZED"
	});
	return { session };
});
/**
* This middleware forces the endpoint to require a valid session,
* as well as making sure the session is fresh before proceeding.
*
* Session freshness check will be skipped if the session config's freshAge
* is set to 0
*/
var freshSessionMiddleware = createAuthMiddleware(async (ctx) => {
	const session = await getSessionFromCtx(ctx);
	if (!session?.session) throw APIError.from("UNAUTHORIZED", {
		message: "Unauthorized",
		code: "UNAUTHORIZED"
	});
	if (ctx.context.sessionConfig.freshAge === 0) return { session };
	const freshAge = ctx.context.sessionConfig.freshAge;
	const lastUpdated = new Date(session.session.updatedAt || session.session.createdAt).getTime();
	if (!(Date.now() - lastUpdated < freshAge * 1e3)) throw APIError.from("FORBIDDEN", BASE_ERROR_CODES.SESSION_NOT_FRESH);
	return { session };
});
createAuthEndpoint("/revoke-session", {
	method: "POST",
	body: object({ token: string().meta({ description: "The token to revoke" }) }),
	use: [sensitiveSessionMiddleware],
	requireHeaders: true,
	metadata: { openapi: {
		description: "Revoke a single session",
		requestBody: { content: { "application/json": { schema: {
			type: "object",
			properties: { token: {
				type: "string",
				description: "The token to revoke"
			} },
			required: ["token"]
		} } } },
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: { status: {
					type: "boolean",
					description: "Indicates if the session was revoked successfully"
				} },
				required: ["status"]
			} } }
		} }
	} }
}, async (ctx) => {
	const token = ctx.body.token;
	if ((await ctx.context.internalAdapter.findSession(token))?.session.userId === ctx.context.session.user.id) try {
		await ctx.context.internalAdapter.deleteSession(token);
	} catch (error) {
		ctx.context.logger.error(error && typeof error === "object" && "name" in error ? error.name : "", error);
		throw APIError.from("INTERNAL_SERVER_ERROR", {
			message: "Internal Server Error",
			code: "INTERNAL_SERVER_ERROR"
		});
	}
	return ctx.json({ status: true });
});
createAuthEndpoint("/revoke-sessions", {
	method: "POST",
	use: [sensitiveSessionMiddleware],
	requireHeaders: true,
	metadata: { openapi: {
		description: "Revoke all sessions for the user",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: { status: {
					type: "boolean",
					description: "Indicates if all sessions were revoked successfully"
				} },
				required: ["status"]
			} } }
		} }
	} }
}, async (ctx) => {
	try {
		await ctx.context.internalAdapter.deleteSessions(ctx.context.session.user.id);
	} catch (error) {
		ctx.context.logger.error(error && typeof error === "object" && "name" in error ? error.name : "", error);
		throw APIError.from("INTERNAL_SERVER_ERROR", {
			message: "Internal Server Error",
			code: "INTERNAL_SERVER_ERROR"
		});
	}
	return ctx.json({ status: true });
});
createAuthEndpoint("/revoke-other-sessions", {
	method: "POST",
	requireHeaders: true,
	use: [sensitiveSessionMiddleware],
	metadata: { openapi: {
		description: "Revoke all other sessions for the user except the current one",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: { status: {
					type: "boolean",
					description: "Indicates if all other sessions were revoked successfully"
				} },
				required: ["status"]
			} } }
		} }
	} }
}, async (ctx) => {
	const session = ctx.context.session;
	if (!session.user) throw APIError.from("UNAUTHORIZED", {
		message: "Unauthorized",
		code: "UNAUTHORIZED"
	});
	const otherSessions = (await ctx.context.internalAdapter.listSessions(session.user.id)).filter((session) => {
		return session.expiresAt > /* @__PURE__ */ new Date();
	}).filter((session) => session.token !== ctx.context.session.session.token);
	await Promise.all(otherSessions.map((session) => ctx.context.internalAdapter.deleteSession(session.token)));
	return ctx.json({ status: true });
});
//#endregion
//#region node_modules/defu/dist/defu.mjs
function isPlainObject(value) {
	if (value === null || typeof value !== "object") return false;
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== null && prototype !== Object.prototype && Object.getPrototypeOf(prototype) !== null) return false;
	if (Symbol.iterator in value) return false;
	if (Symbol.toStringTag in value) return Object.prototype.toString.call(value) === "[object Module]";
	return true;
}
function _defu(baseObject, defaults, namespace = ".", merger) {
	if (!isPlainObject(defaults)) return _defu(baseObject, {}, namespace, merger);
	const object = Object.assign({}, defaults);
	for (const key in baseObject) {
		if (key === "__proto__" || key === "constructor") continue;
		const value = baseObject[key];
		if (value === null || value === void 0) continue;
		if (merger && merger(object, key, value, namespace)) continue;
		if (Array.isArray(value) && Array.isArray(object[key])) object[key] = [...value, ...object[key]];
		else if (isPlainObject(value) && isPlainObject(object[key])) object[key] = _defu(value, object[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
		else object[key] = value;
	}
	return object;
}
function createDefu(merger) {
	return (...arguments_) => arguments_.reduce((p, c) => _defu(p, c, "", merger), {});
}
var defu = createDefu();
//#endregion
//#region node_modules/better-auth/dist/context/helpers.mjs
async function getAwaitableValue(arr, item) {
	if (!arr) return void 0;
	for (const val of arr) {
		const value = typeof val === "function" ? await val() : val;
		if (value[item.field ?? "id"] === item.value) return value;
	}
}
//#endregion
//#region node_modules/better-auth/dist/state.mjs
var stateDataSchema = looseObject({
	callbackURL: string(),
	codeVerifier: string(),
	errorURL: string().optional(),
	newUserURL: string().optional(),
	expiresAt: number(),
	link: object({
		email: string(),
		userId: string$1()
	}).optional(),
	requestSignUp: boolean$1().optional()
});
var StateError = class extends BetterAuthError {
	code;
	details;
	constructor(message, options) {
		super(message, options);
		this.code = options.code;
		this.details = options.details;
	}
};
async function generateGenericState(c, stateData, settings) {
	const state = generateRandomString(32);
	if (c.context.oauthConfig.storeStateStrategy === "cookie") {
		const encryptedData = await symmetricEncrypt({
			key: c.context.secretConfig,
			data: JSON.stringify(stateData)
		});
		const stateCookie = c.context.createAuthCookie(settings?.cookieName ?? "oauth_state", { maxAge: 600 });
		c.setCookie(stateCookie.name, encryptedData, stateCookie.attributes);
		return {
			state,
			codeVerifier: stateData.codeVerifier
		};
	}
	const stateCookie = c.context.createAuthCookie(settings?.cookieName ?? "state", { maxAge: 300 });
	await c.setSignedCookie(stateCookie.name, state, c.context.secret, stateCookie.attributes);
	const expiresAt = /* @__PURE__ */ new Date();
	expiresAt.setMinutes(expiresAt.getMinutes() + 10);
	const verification = await c.context.internalAdapter.createVerificationValue({
		value: JSON.stringify(stateData),
		identifier: state,
		expiresAt
	});
	if (!verification) throw new StateError("Unable to create verification. Make sure the database adapter is properly working and there is a verification table in the database", { code: "state_generation_error" });
	return {
		state: verification.identifier,
		codeVerifier: stateData.codeVerifier
	};
}
async function parseGenericState(c, state, settings) {
	const storeStateStrategy = c.context.oauthConfig.storeStateStrategy;
	let parsedData;
	if (storeStateStrategy === "cookie") {
		const stateCookie = c.context.createAuthCookie(settings?.cookieName ?? "oauth_state");
		const encryptedData = c.getCookie(stateCookie.name);
		if (!encryptedData) throw new StateError("State mismatch: auth state cookie not found", {
			code: "state_mismatch",
			details: { state }
		});
		try {
			const decryptedData = await symmetricDecrypt({
				key: c.context.secretConfig,
				data: encryptedData
			});
			parsedData = stateDataSchema.parse(JSON.parse(decryptedData));
		} catch (error) {
			throw new StateError("State invalid: Failed to decrypt or parse auth state", {
				code: "state_invalid",
				details: { state },
				cause: error
			});
		}
		expireCookie(c, stateCookie);
	} else {
		const data = await c.context.internalAdapter.findVerificationValue(state);
		if (!data) throw new StateError("State mismatch: verification not found", {
			code: "state_mismatch",
			details: { state }
		});
		parsedData = stateDataSchema.parse(JSON.parse(data.value));
		const stateCookie = c.context.createAuthCookie(settings?.cookieName ?? "state");
		const stateCookieValue = await c.getSignedCookie(stateCookie.name, c.context.secret);
		if (!c.context.oauthConfig.skipStateCookieCheck && (!stateCookieValue || stateCookieValue !== state)) throw new StateError("State mismatch: State not persisted correctly", {
			code: "state_security_mismatch",
			details: { state }
		});
		expireCookie(c, stateCookie);
		await c.context.internalAdapter.deleteVerificationByIdentifier(state);
	}
	if (parsedData.expiresAt < Date.now()) throw new StateError("Invalid state: request expired", {
		code: "state_mismatch",
		details: { expiresAt: parsedData.expiresAt }
	});
	return parsedData;
}
//#endregion
//#region node_modules/better-auth/dist/oauth2/state.mjs
async function generateState(c, link, additionalData) {
	const callbackURL = c.body?.callbackURL || c.context.options.baseURL;
	if (!callbackURL) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.CALLBACK_URL_REQUIRED);
	const codeVerifier = generateRandomString(128);
	const stateData = {
		...additionalData ? additionalData : {},
		callbackURL,
		codeVerifier,
		errorURL: c.body?.errorCallbackURL,
		newUserURL: c.body?.newUserCallbackURL,
		link,
		expiresAt: Date.now() + 600 * 1e3,
		requestSignUp: c.body?.requestSignUp
	};
	await setOAuthState(stateData);
	try {
		return generateGenericState(c, stateData);
	} catch (error) {
		c.context.logger.error("Failed to create verification", error);
		throw new APIError("INTERNAL_SERVER_ERROR", {
			message: "Unable to create verification",
			cause: error
		});
	}
}
async function parseState(c) {
	const state = c.query.state || c.body.state;
	const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
	let parsedData;
	try {
		parsedData = await parseGenericState(c, state);
	} catch (error) {
		c.context.logger.error("Failed to parse state", error);
		if (error instanceof StateError && error.code === "state_security_mismatch") throw c.redirect(`${errorURL}?error=state_mismatch`);
		throw c.redirect(`${errorURL}?error=please_restart_the_process`);
	}
	if (!parsedData.errorURL) parsedData.errorURL = errorURL;
	if (parsedData) await setOAuthState(parsedData);
	return parsedData;
}
//#endregion
//#region node_modules/better-auth/dist/oauth2/utils.mjs
/**
* Check if a string looks like encrypted data
*/
function isLikelyEncrypted(token) {
	if (token.startsWith("$ba$")) return true;
	return token.length % 2 === 0 && /^[0-9a-f]+$/i.test(token);
}
function decryptOAuthToken(token, ctx) {
	if (!token) return token;
	if (ctx.options.account?.encryptOAuthTokens) {
		if (!isLikelyEncrypted(token)) return token;
		return symmetricDecrypt({
			key: ctx.secretConfig,
			data: token
		});
	}
	return token;
}
function setTokenUtil(token, ctx) {
	if (ctx.options.account?.encryptOAuthTokens && token) return symmetricEncrypt({
		key: ctx.secretConfig,
		data: token
	});
	return token;
}
createAuthEndpoint("/list-accounts", {
	method: "GET",
	use: [sessionMiddleware],
	metadata: { openapi: {
		operationId: "listUserAccounts",
		description: "List all accounts linked to the user",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "array",
				items: {
					type: "object",
					properties: {
						id: { type: "string" },
						providerId: { type: "string" },
						createdAt: {
							type: "string",
							format: "date-time"
						},
						updatedAt: {
							type: "string",
							format: "date-time"
						},
						accountId: { type: "string" },
						userId: { type: "string" },
						scopes: {
							type: "array",
							items: { type: "string" }
						}
					},
					required: [
						"id",
						"providerId",
						"createdAt",
						"updatedAt",
						"accountId",
						"userId",
						"scopes"
					]
				}
			} } }
		} }
	} }
}, async (c) => {
	const session = c.context.session;
	const accounts = await c.context.internalAdapter.findAccounts(session.user.id);
	return c.json(accounts.map((a) => {
		const { scope, ...parsed } = parseAccountOutput(c.context.options, a);
		return {
			...parsed,
			scopes: scope?.split(",") || []
		};
	}));
});
createAuthEndpoint("/link-social", {
	method: "POST",
	requireHeaders: true,
	body: object({
		callbackURL: string().meta({ description: "The URL to redirect to after the user has signed in" }).optional(),
		provider: SocialProviderListEnum,
		idToken: object({
			token: string(),
			nonce: string().optional(),
			accessToken: string().optional(),
			refreshToken: string().optional(),
			scopes: array(string()).optional()
		}).optional(),
		requestSignUp: boolean$1().optional(),
		scopes: array(string()).meta({ description: "Additional scopes to request from the provider" }).optional(),
		errorCallbackURL: string().meta({ description: "The URL to redirect to if there is an error during the link process" }).optional(),
		disableRedirect: boolean$1().meta({ description: "Disable automatic redirection to the provider. Useful for handling the redirection yourself" }).optional(),
		additionalData: record(string(), any()).optional()
	}),
	use: [sessionMiddleware],
	metadata: { openapi: {
		description: "Link a social account to the user",
		operationId: "linkSocialAccount",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					url: {
						type: "string",
						description: "The authorization URL to redirect the user to"
					},
					redirect: {
						type: "boolean",
						description: "Indicates if the user should be redirected to the authorization URL"
					},
					status: { type: "boolean" }
				},
				required: ["redirect"]
			} } }
		} }
	} }
}, async (c) => {
	const session = c.context.session;
	const provider = await getAwaitableValue(c.context.socialProviders, { value: c.body.provider });
	if (!provider) {
		c.context.logger.error("Provider not found. Make sure to add the provider in your auth config", { provider: c.body.provider });
		throw APIError.from("NOT_FOUND", BASE_ERROR_CODES.PROVIDER_NOT_FOUND);
	}
	if (c.body.idToken) {
		if (!provider.verifyIdToken) {
			c.context.logger.error("Provider does not support id token verification", { provider: c.body.provider });
			throw APIError.from("NOT_FOUND", BASE_ERROR_CODES.ID_TOKEN_NOT_SUPPORTED);
		}
		const { token, nonce } = c.body.idToken;
		if (!await provider.verifyIdToken(token, nonce)) {
			c.context.logger.error("Invalid id token", { provider: c.body.provider });
			throw APIError.from("UNAUTHORIZED", BASE_ERROR_CODES.INVALID_TOKEN);
		}
		const linkingUserInfo = await provider.getUserInfo({
			idToken: token,
			accessToken: c.body.idToken.accessToken,
			refreshToken: c.body.idToken.refreshToken
		});
		if (!linkingUserInfo || !linkingUserInfo?.user) {
			c.context.logger.error("Failed to get user info", { provider: c.body.provider });
			throw APIError.from("UNAUTHORIZED", BASE_ERROR_CODES.FAILED_TO_GET_USER_INFO);
		}
		const linkingUserId = String(linkingUserInfo.user.id);
		if (!linkingUserInfo.user.email) {
			c.context.logger.error("User email not found", { provider: c.body.provider });
			throw APIError.from("UNAUTHORIZED", BASE_ERROR_CODES.USER_EMAIL_NOT_FOUND);
		}
		if ((await c.context.internalAdapter.findAccounts(session.user.id)).find((a) => a.providerId === provider.id && a.accountId === linkingUserId)) return c.json({
			url: "",
			status: true,
			redirect: false
		});
		if (!c.context.trustedProviders.includes(provider.id) && !linkingUserInfo.user.emailVerified || c.context.options.account?.accountLinking?.enabled === false) throw APIError.from("UNAUTHORIZED", {
			message: "Account not linked - linking not allowed",
			code: "LINKING_NOT_ALLOWED"
		});
		if (linkingUserInfo.user.email?.toLowerCase() !== session.user.email.toLowerCase() && c.context.options.account?.accountLinking?.allowDifferentEmails !== true) throw APIError.from("UNAUTHORIZED", {
			message: "Account not linked - different emails not allowed",
			code: "LINKING_DIFFERENT_EMAILS_NOT_ALLOWED"
		});
		try {
			await c.context.internalAdapter.createAccount({
				userId: session.user.id,
				providerId: provider.id,
				accountId: linkingUserId,
				accessToken: c.body.idToken.accessToken,
				idToken: token,
				refreshToken: c.body.idToken.refreshToken,
				scope: c.body.idToken.scopes?.join(",")
			});
		} catch (_e) {
			throw APIError.from("EXPECTATION_FAILED", {
				message: "Account not linked - unable to create account",
				code: "LINKING_FAILED"
			});
		}
		if (c.context.options.account?.accountLinking?.updateUserInfoOnLink === true) try {
			await c.context.internalAdapter.updateUser(session.user.id, {
				name: linkingUserInfo.user?.name,
				image: linkingUserInfo.user?.image
			});
		} catch (e) {
			console.warn("Could not update user - " + e.toString());
		}
		return c.json({
			url: "",
			status: true,
			redirect: false
		});
	}
	const state = await generateState(c, {
		userId: session.user.id,
		email: session.user.email
	}, c.body.additionalData);
	const url = await provider.createAuthorizationURL({
		state: state.state,
		codeVerifier: state.codeVerifier,
		redirectURI: `${c.context.baseURL}/callback/${provider.id}`,
		scopes: c.body.scopes
	});
	if (!c.body.disableRedirect) c.setHeader("Location", url.toString());
	return c.json({
		url: url.toString(),
		redirect: !c.body.disableRedirect
	});
});
createAuthEndpoint("/unlink-account", {
	method: "POST",
	body: object({
		providerId: string(),
		accountId: string().optional()
	}),
	use: [freshSessionMiddleware],
	metadata: { openapi: {
		description: "Unlink an account",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: { status: { type: "boolean" } }
			} } }
		} }
	} }
}, async (ctx) => {
	const { providerId, accountId } = ctx.body;
	const accounts = await ctx.context.internalAdapter.findAccounts(ctx.context.session.user.id);
	if (accounts.length === 1 && !ctx.context.options.account?.accountLinking?.allowUnlinkingAll) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.FAILED_TO_UNLINK_LAST_ACCOUNT);
	const accountExist = accounts.find((account) => accountId ? account.accountId === accountId && account.providerId === providerId : account.providerId === providerId);
	if (!accountExist) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.ACCOUNT_NOT_FOUND);
	await ctx.context.internalAdapter.deleteAccount(accountExist.id);
	return ctx.json({ status: true });
});
var getAccessToken = createAuthEndpoint("/get-access-token", {
	method: "POST",
	body: object({
		providerId: string().meta({ description: "The provider ID for the OAuth provider" }),
		accountId: string().meta({ description: "The account ID associated with the refresh token" }).optional(),
		userId: string().meta({ description: "The user ID associated with the account" }).optional()
	}),
	metadata: { openapi: {
		description: "Get a valid access token, doing a refresh if needed",
		responses: {
			200: {
				description: "A Valid access token",
				content: { "application/json": { schema: {
					type: "object",
					properties: {
						tokenType: { type: "string" },
						idToken: { type: "string" },
						accessToken: { type: "string" },
						accessTokenExpiresAt: {
							type: "string",
							format: "date-time"
						}
					}
				} } }
			},
			400: { description: "Invalid refresh token or provider configuration" }
		}
	} }
}, async (ctx) => {
	const { providerId, accountId, userId } = ctx.body || {};
	const req = ctx.request;
	const session = await getSessionFromCtx(ctx);
	if (req && !session) throw ctx.error("UNAUTHORIZED");
	const resolvedUserId = session?.user?.id || userId;
	if (!resolvedUserId) throw ctx.error("UNAUTHORIZED");
	const provider = await getAwaitableValue(ctx.context.socialProviders, { value: providerId });
	if (!provider) throw APIError.from("BAD_REQUEST", {
		message: `Provider ${providerId} is not supported.`,
		code: "PROVIDER_NOT_SUPPORTED"
	});
	const accountData = await getAccountCookie(ctx);
	let account = void 0;
	if (accountData && providerId === accountData.providerId && (!accountId || accountData.id === accountId)) account = accountData;
	else account = (await ctx.context.internalAdapter.findAccounts(resolvedUserId)).find((acc) => accountId ? acc.accountId === accountId && acc.providerId === providerId : acc.providerId === providerId);
	if (!account) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.ACCOUNT_NOT_FOUND);
	try {
		let newTokens = null;
		const accessTokenExpired = account.accessTokenExpiresAt && new Date(account.accessTokenExpiresAt).getTime() - Date.now() < 5e3;
		if (account.refreshToken && accessTokenExpired && provider.refreshAccessToken) {
			const refreshToken = await decryptOAuthToken(account.refreshToken, ctx.context);
			newTokens = await provider.refreshAccessToken(refreshToken);
			const updatedData = {
				accessToken: await setTokenUtil(newTokens?.accessToken, ctx.context),
				accessTokenExpiresAt: newTokens?.accessTokenExpiresAt,
				refreshToken: newTokens?.refreshToken ? await setTokenUtil(newTokens.refreshToken, ctx.context) : account.refreshToken,
				refreshTokenExpiresAt: newTokens?.refreshTokenExpiresAt ?? account.refreshTokenExpiresAt,
				idToken: newTokens?.idToken || account.idToken
			};
			let updatedAccount = null;
			if (account.id) updatedAccount = await ctx.context.internalAdapter.updateAccount(account.id, updatedData);
			if (ctx.context.options.account?.storeAccountCookie) await setAccountCookie(ctx, {
				...account,
				...updatedAccount ?? updatedData
			});
		}
		const accessTokenExpiresAt = (() => {
			if (newTokens?.accessTokenExpiresAt) {
				if (typeof newTokens.accessTokenExpiresAt === "string") return new Date(newTokens.accessTokenExpiresAt);
				return newTokens.accessTokenExpiresAt;
			}
			if (account.accessTokenExpiresAt) {
				if (typeof account.accessTokenExpiresAt === "string") return new Date(account.accessTokenExpiresAt);
				return account.accessTokenExpiresAt;
			}
		})();
		const tokens = {
			accessToken: newTokens?.accessToken ?? await decryptOAuthToken(account.accessToken ?? "", ctx.context),
			accessTokenExpiresAt,
			scopes: account.scope?.split(",") ?? [],
			idToken: newTokens?.idToken ?? account.idToken ?? void 0
		};
		return ctx.json(tokens);
	} catch (_error) {
		throw APIError.from("BAD_REQUEST", {
			message: "Failed to get a valid access token",
			code: "FAILED_TO_GET_ACCESS_TOKEN"
		});
	}
});
createAuthEndpoint("/refresh-token", {
	method: "POST",
	body: object({
		providerId: string().meta({ description: "The provider ID for the OAuth provider" }),
		accountId: string().meta({ description: "The account ID associated with the refresh token" }).optional(),
		userId: string().meta({ description: "The user ID associated with the account" }).optional()
	}),
	metadata: { openapi: {
		description: "Refresh the access token using a refresh token",
		responses: {
			200: {
				description: "Access token refreshed successfully",
				content: { "application/json": { schema: {
					type: "object",
					properties: {
						tokenType: { type: "string" },
						idToken: { type: "string" },
						accessToken: { type: "string" },
						refreshToken: { type: "string" },
						accessTokenExpiresAt: {
							type: "string",
							format: "date-time"
						},
						refreshTokenExpiresAt: {
							type: "string",
							format: "date-time"
						}
					}
				} } }
			},
			400: { description: "Invalid refresh token or provider configuration" }
		}
	} }
}, async (ctx) => {
	const { providerId, accountId, userId } = ctx.body;
	const req = ctx.request;
	const session = await getSessionFromCtx(ctx);
	if (req && !session) throw ctx.error("UNAUTHORIZED");
	const resolvedUserId = session?.user?.id || userId;
	if (!resolvedUserId) throw APIError.from("BAD_REQUEST", {
		message: `Either userId or session is required`,
		code: "USER_ID_OR_SESSION_REQUIRED"
	});
	const provider = await getAwaitableValue(ctx.context.socialProviders, { value: providerId });
	if (!provider) throw APIError.from("BAD_REQUEST", {
		message: `Provider ${providerId} is not supported.`,
		code: "PROVIDER_NOT_SUPPORTED"
	});
	if (!provider.refreshAccessToken) throw APIError.from("BAD_REQUEST", {
		message: `Provider ${providerId} does not support token refreshing.`,
		code: "TOKEN_REFRESH_NOT_SUPPORTED"
	});
	let account = void 0;
	const accountData = await getAccountCookie(ctx);
	if (accountData && (!providerId || providerId === accountData?.providerId)) account = accountData;
	else account = (await ctx.context.internalAdapter.findAccounts(resolvedUserId)).find((acc) => accountId ? acc.accountId === accountId && acc.providerId === providerId : acc.providerId === providerId);
	if (!account) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.ACCOUNT_NOT_FOUND);
	let refreshToken = void 0;
	if (accountData && providerId === accountData.providerId) refreshToken = accountData.refreshToken ?? void 0;
	else refreshToken = account.refreshToken ?? void 0;
	if (!refreshToken) throw APIError.from("BAD_REQUEST", {
		message: "Refresh token not found",
		code: "REFRESH_TOKEN_NOT_FOUND"
	});
	try {
		const decryptedRefreshToken = await decryptOAuthToken(refreshToken, ctx.context);
		const tokens = await provider.refreshAccessToken(decryptedRefreshToken);
		const resolvedRefreshToken = tokens.refreshToken ? await setTokenUtil(tokens.refreshToken, ctx.context) : refreshToken;
		const resolvedRefreshTokenExpiresAt = tokens.refreshTokenExpiresAt ?? account.refreshTokenExpiresAt;
		if (account.id) {
			const updateData = {
				...account || {},
				accessToken: await setTokenUtil(tokens.accessToken, ctx.context),
				refreshToken: resolvedRefreshToken,
				accessTokenExpiresAt: tokens.accessTokenExpiresAt,
				refreshTokenExpiresAt: resolvedRefreshTokenExpiresAt,
				scope: tokens.scopes?.join(",") || account.scope,
				idToken: tokens.idToken || account.idToken
			};
			await ctx.context.internalAdapter.updateAccount(account.id, updateData);
		}
		if (accountData && providerId === accountData.providerId && ctx.context.options.account?.storeAccountCookie) await setAccountCookie(ctx, {
			...accountData,
			accessToken: await setTokenUtil(tokens.accessToken, ctx.context),
			refreshToken: resolvedRefreshToken,
			accessTokenExpiresAt: tokens.accessTokenExpiresAt,
			refreshTokenExpiresAt: resolvedRefreshTokenExpiresAt,
			scope: tokens.scopes?.join(",") || accountData.scope,
			idToken: tokens.idToken || accountData.idToken
		});
		return ctx.json({
			accessToken: tokens.accessToken,
			refreshToken: tokens.refreshToken ?? decryptedRefreshToken,
			accessTokenExpiresAt: tokens.accessTokenExpiresAt,
			refreshTokenExpiresAt: resolvedRefreshTokenExpiresAt,
			scope: tokens.scopes?.join(",") || account.scope,
			idToken: tokens.idToken || account.idToken,
			providerId: account.providerId,
			accountId: account.accountId
		});
	} catch (_error) {
		throw APIError.from("BAD_REQUEST", {
			message: "Failed to refresh access token",
			code: "FAILED_TO_REFRESH_ACCESS_TOKEN"
		});
	}
});
var accountInfoQuerySchema = optional(object({ accountId: string().meta({ description: "The provider given account id for which to get the account info" }).optional() }));
createAuthEndpoint("/account-info", {
	method: "GET",
	use: [sessionMiddleware],
	metadata: { openapi: {
		description: "Get the account info provided by the provider",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					user: {
						type: "object",
						properties: {
							id: { type: "string" },
							name: { type: "string" },
							email: { type: "string" },
							image: { type: "string" },
							emailVerified: { type: "boolean" }
						},
						required: ["id", "emailVerified"]
					},
					data: {
						type: "object",
						properties: {},
						additionalProperties: true
					}
				},
				required: ["user", "data"],
				additionalProperties: false
			} } }
		} }
	} },
	query: accountInfoQuerySchema
}, async (ctx) => {
	const providedAccountId = ctx.query?.accountId;
	let account = void 0;
	if (!providedAccountId) {
		if (ctx.context.options.account?.storeAccountCookie) {
			const accountData = await getAccountCookie(ctx);
			if (accountData) account = accountData;
		}
	} else {
		const accountData = await ctx.context.internalAdapter.findAccount(providedAccountId);
		if (accountData) account = accountData;
	}
	if (!account || account.userId !== ctx.context.session.user.id) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.ACCOUNT_NOT_FOUND);
	const provider = await getAwaitableValue(ctx.context.socialProviders, { value: account.providerId });
	if (!provider) throw APIError.from("INTERNAL_SERVER_ERROR", {
		message: `Provider account provider is ${account.providerId} but it is not configured`,
		code: "PROVIDER_NOT_CONFIGURED"
	});
	const tokens = await getAccessToken({
		...ctx,
		method: "POST",
		body: {
			accountId: account.accountId,
			providerId: account.providerId
		},
		returnHeaders: false,
		returnStatus: false
	});
	if (!tokens.accessToken) throw APIError.from("BAD_REQUEST", {
		message: "Access token not found",
		code: "ACCESS_TOKEN_NOT_FOUND"
	});
	const info = await provider.getUserInfo({
		...tokens,
		accessToken: tokens.accessToken
	});
	return ctx.json(info);
});
//#endregion
//#region node_modules/better-auth/dist/api/routes/email-verification.mjs
async function createEmailVerificationToken(secret, email, updateTo, expiresIn = 3600, extraPayload) {
	return await signJWT({
		email: email.toLowerCase(),
		updateTo,
		...extraPayload
	}, secret, expiresIn);
}
/**
* A function to send a verification email to the user
*/
async function sendVerificationEmailFn(ctx, user) {
	if (!ctx.context.options.emailVerification?.sendVerificationEmail) {
		ctx.context.logger.error("Verification email isn't enabled.");
		throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.VERIFICATION_EMAIL_NOT_ENABLED);
	}
	const token = await createEmailVerificationToken(ctx.context.secret, user.email, void 0, ctx.context.options.emailVerification?.expiresIn);
	const callbackURL = ctx.body.callbackURL ? encodeURIComponent(ctx.body.callbackURL) : encodeURIComponent("/");
	const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${callbackURL}`;
	await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
		user,
		url,
		token
	}, ctx.request));
}
createAuthEndpoint("/send-verification-email", {
	method: "POST",
	operationId: "sendVerificationEmail",
	body: object({
		email: email().meta({ description: "The email to send the verification email to" }),
		callbackURL: string().meta({ description: "The URL to use for email verification callback" }).optional()
	}),
	metadata: { openapi: {
		operationId: "sendVerificationEmail",
		description: "Send a verification email to the user",
		requestBody: { content: { "application/json": { schema: {
			type: "object",
			properties: {
				email: {
					type: "string",
					description: "The email to send the verification email to",
					example: "user@example.com"
				},
				callbackURL: {
					type: "string",
					description: "The URL to use for email verification callback",
					example: "https://example.com/callback",
					nullable: true
				}
			},
			required: ["email"]
		} } } },
		responses: {
			"200": {
				description: "Success",
				content: { "application/json": { schema: {
					type: "object",
					properties: { status: {
						type: "boolean",
						description: "Indicates if the email was sent successfully",
						example: true
					} }
				} } }
			},
			"400": {
				description: "Bad Request",
				content: { "application/json": { schema: {
					type: "object",
					properties: { message: {
						type: "string",
						description: "Error message",
						example: "Verification email isn't enabled"
					} }
				} } }
			}
		}
	} }
}, async (ctx) => {
	if (!ctx.context.options.emailVerification?.sendVerificationEmail) {
		ctx.context.logger.error("Verification email isn't enabled.");
		throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.VERIFICATION_EMAIL_NOT_ENABLED);
	}
	const { email } = ctx.body;
	const session = await getSessionFromCtx(ctx);
	if (!session) {
		const user = await ctx.context.internalAdapter.findUserByEmail(email);
		if (!user || user.user.emailVerified) {
			await createEmailVerificationToken(ctx.context.secret, email, void 0, ctx.context.options.emailVerification?.expiresIn);
			return ctx.json({ status: true });
		}
		await sendVerificationEmailFn(ctx, user.user);
		return ctx.json({ status: true });
	}
	if (session?.user.email !== email) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.EMAIL_MISMATCH);
	if (session?.user.emailVerified) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.EMAIL_ALREADY_VERIFIED);
	await sendVerificationEmailFn(ctx, session.user);
	return ctx.json({ status: true });
});
createAuthEndpoint("/verify-email", {
	method: "GET",
	operationId: "verifyEmail",
	query: object({
		token: string().meta({ description: "The token to verify the email" }),
		callbackURL: string().meta({ description: "The URL to redirect to after email verification" }).optional()
	}),
	use: [originCheck((ctx) => ctx.query.callbackURL)],
	metadata: { openapi: {
		description: "Verify the email of the user",
		parameters: [{
			name: "token",
			in: "query",
			description: "The token to verify the email",
			required: true,
			schema: { type: "string" }
		}, {
			name: "callbackURL",
			in: "query",
			description: "The URL to redirect to after email verification",
			required: false,
			schema: { type: "string" }
		}],
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					user: {
						type: "object",
						$ref: "#/components/schemas/User"
					},
					status: {
						type: "boolean",
						description: "Indicates if the email was verified successfully"
					}
				},
				required: ["user", "status"]
			} } }
		} }
	} }
}, async (ctx) => {
	function redirectOnError(error) {
		if (ctx.query.callbackURL) {
			if (ctx.query.callbackURL.includes("?")) throw ctx.redirect(`${ctx.query.callbackURL}&error=${error.code}`);
			throw ctx.redirect(`${ctx.query.callbackURL}?error=${error.code}`);
		}
		throw APIError.from("UNAUTHORIZED", error);
	}
	const { token } = ctx.query;
	let jwt;
	try {
		jwt = await jwtVerify(token, new TextEncoder().encode(ctx.context.secret), { algorithms: ["HS256"] });
	} catch (e) {
		if (e instanceof JWTExpired) return redirectOnError(BASE_ERROR_CODES.TOKEN_EXPIRED);
		return redirectOnError(BASE_ERROR_CODES.INVALID_TOKEN);
	}
	const parsed = object({
		email: email(),
		updateTo: string().optional(),
		requestType: string().optional()
	}).parse(jwt.payload);
	const user = await ctx.context.internalAdapter.findUserByEmail(parsed.email);
	if (!user) return redirectOnError(BASE_ERROR_CODES.USER_NOT_FOUND);
	if (parsed.updateTo) {
		const session = await getSessionFromCtx(ctx);
		if (session && session.user.email !== parsed.email) return redirectOnError(BASE_ERROR_CODES.INVALID_USER);
		switch (parsed.requestType) {
			case "change-email-confirmation": {
				const newToken = await createEmailVerificationToken(ctx.context.secret, parsed.email, parsed.updateTo, ctx.context.options.emailVerification?.expiresIn, { requestType: "change-email-verification" });
				const updateCallbackURL = ctx.query.callbackURL ? encodeURIComponent(ctx.query.callbackURL) : encodeURIComponent("/");
				const url = `${ctx.context.baseURL}/verify-email?token=${newToken}&callbackURL=${updateCallbackURL}`;
				if (ctx.context.options.emailVerification?.sendVerificationEmail) await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
					user: {
						...user.user,
						email: parsed.updateTo
					},
					url,
					token: newToken
				}, ctx.request));
				if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
				return ctx.json({ status: true });
			}
			case "change-email-verification": {
				let activeSession = session;
				if (!activeSession) {
					const newSession = await ctx.context.internalAdapter.createSession(user.user.id);
					if (!newSession) throw APIError.from("INTERNAL_SERVER_ERROR", BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION);
					activeSession = {
						session: newSession,
						user: user.user
					};
				}
				const updatedUser = await ctx.context.internalAdapter.updateUserByEmail(parsed.email, {
					email: parsed.updateTo,
					emailVerified: true
				});
				if (ctx.context.options.emailVerification?.afterEmailVerification) await ctx.context.options.emailVerification.afterEmailVerification(updatedUser, ctx.request);
				await setSessionCookie(ctx, {
					session: activeSession.session,
					user: {
						...activeSession.user,
						email: parsed.updateTo,
						emailVerified: true
					}
				});
				if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
				return ctx.json({
					status: true,
					user: parseUserOutput(ctx.context.options, updatedUser)
				});
			}
			default: {
				let activeSession = session;
				if (!activeSession) {
					const newSession = await ctx.context.internalAdapter.createSession(user.user.id);
					if (!newSession) throw APIError.from("INTERNAL_SERVER_ERROR", BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION);
					activeSession = {
						session: newSession,
						user: user.user
					};
				}
				const updatedUser = await ctx.context.internalAdapter.updateUserByEmail(parsed.email, {
					email: parsed.updateTo,
					emailVerified: false
				});
				const newToken = await createEmailVerificationToken(ctx.context.secret, parsed.updateTo);
				const updateCallbackURL = ctx.query.callbackURL ? encodeURIComponent(ctx.query.callbackURL) : encodeURIComponent("/");
				if (ctx.context.options.emailVerification?.sendVerificationEmail) await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailVerification.sendVerificationEmail({
					user: updatedUser,
					url: `${ctx.context.baseURL}/verify-email?token=${newToken}&callbackURL=${updateCallbackURL}`,
					token: newToken
				}, ctx.request));
				await setSessionCookie(ctx, {
					session: activeSession.session,
					user: {
						...activeSession.user,
						email: parsed.updateTo,
						emailVerified: false
					}
				});
				if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
				return ctx.json({
					status: true,
					user: parseUserOutput(ctx.context.options, updatedUser)
				});
			}
		}
	}
	if (user.user.emailVerified) {
		if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
		return ctx.json({
			status: true,
			user: null
		});
	}
	if (ctx.context.options.emailVerification?.beforeEmailVerification) await ctx.context.options.emailVerification.beforeEmailVerification(user.user, ctx.request);
	const updatedUser = await ctx.context.internalAdapter.updateUserByEmail(parsed.email, { emailVerified: true });
	if (ctx.context.options.emailVerification?.afterEmailVerification) await ctx.context.options.emailVerification.afterEmailVerification(updatedUser, ctx.request);
	if (ctx.context.options.emailVerification?.autoSignInAfterVerification) {
		const currentSession = await getSessionFromCtx(ctx);
		if (!currentSession || currentSession.user.email !== parsed.email) {
			const session = await ctx.context.internalAdapter.createSession(user.user.id);
			if (!session) throw APIError.from("INTERNAL_SERVER_ERROR", BASE_ERROR_CODES.FAILED_TO_CREATE_SESSION);
			await setSessionCookie(ctx, {
				session,
				user: {
					...user.user,
					emailVerified: true
				}
			});
		} else await setSessionCookie(ctx, {
			session: currentSession.session,
			user: {
				...currentSession.user,
				emailVerified: true
			}
		});
	}
	if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL);
	return ctx.json({
		status: true,
		user: null
	});
});
//#endregion
//#region node_modules/better-auth/dist/oauth2/link-account.mjs
async function handleOAuthUserInfo(c, opts) {
	const { userInfo, account, callbackURL, disableSignUp, overrideUserInfo } = opts;
	const dbUser = await c.context.internalAdapter.findOAuthUser(userInfo.email.toLowerCase(), account.accountId, account.providerId).catch((e) => {
		logger.error("Better auth was unable to query your database.\nError: ", e);
		const errorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
		throw c.redirect(`${errorURL}?error=internal_server_error`);
	});
	let user = dbUser?.user;
	const isRegister = !user;
	if (dbUser) {
		const linkedAccount = dbUser.linkedAccount ?? dbUser.accounts.find((acc) => acc.providerId === account.providerId && acc.accountId === account.accountId);
		if (!linkedAccount) {
			const accountLinking = c.context.options.account?.accountLinking;
			if (!(opts.isTrustedProvider || c.context.trustedProviders.includes(account.providerId)) && !userInfo.emailVerified || accountLinking?.enabled === false || accountLinking?.disableImplicitLinking === true) {
				if (isDevelopment()) logger.warn(`User already exist but account isn't linked to ${account.providerId}. To read more about how account linking works in Better Auth see https://www.better-auth.com/docs/concepts/users-accounts#account-linking.`);
				return {
					error: "account not linked",
					data: null
				};
			}
			try {
				await c.context.internalAdapter.linkAccount({
					providerId: account.providerId,
					accountId: userInfo.id.toString(),
					userId: dbUser.user.id,
					accessToken: await setTokenUtil(account.accessToken, c.context),
					refreshToken: await setTokenUtil(account.refreshToken, c.context),
					idToken: account.idToken,
					accessTokenExpiresAt: account.accessTokenExpiresAt,
					refreshTokenExpiresAt: account.refreshTokenExpiresAt,
					scope: account.scope
				});
			} catch (e) {
				logger.error("Unable to link account", e);
				return {
					error: "unable to link account",
					data: null
				};
			}
			if (userInfo.emailVerified && !dbUser.user.emailVerified && userInfo.email.toLowerCase() === dbUser.user.email) await c.context.internalAdapter.updateUser(dbUser.user.id, { emailVerified: true });
		} else {
			const freshTokens = c.context.options.account?.updateAccountOnSignIn !== false ? Object.fromEntries(Object.entries({
				idToken: account.idToken,
				accessToken: await setTokenUtil(account.accessToken, c.context),
				refreshToken: await setTokenUtil(account.refreshToken, c.context),
				accessTokenExpiresAt: account.accessTokenExpiresAt,
				refreshTokenExpiresAt: account.refreshTokenExpiresAt,
				scope: account.scope
			}).filter(([_, value]) => value !== void 0)) : {};
			if (c.context.options.account?.storeAccountCookie) await setAccountCookie(c, {
				...linkedAccount,
				...freshTokens
			});
			if (Object.keys(freshTokens).length > 0) await c.context.internalAdapter.updateAccount(linkedAccount.id, freshTokens);
			if (userInfo.emailVerified && !dbUser.user.emailVerified && userInfo.email.toLowerCase() === dbUser.user.email) await c.context.internalAdapter.updateUser(dbUser.user.id, { emailVerified: true });
		}
		if (overrideUserInfo) {
			const { id: _, ...restUserInfo } = userInfo;
			user = await c.context.internalAdapter.updateUser(dbUser.user.id, {
				...restUserInfo,
				email: userInfo.email.toLowerCase(),
				emailVerified: userInfo.email.toLowerCase() === dbUser.user.email ? dbUser.user.emailVerified || userInfo.emailVerified : userInfo.emailVerified
			});
		}
	} else {
		if (disableSignUp) return {
			error: "signup disabled",
			data: null,
			isRegister: false
		};
		try {
			const { id: _, ...restUserInfo } = userInfo;
			const accountData = {
				accessToken: await setTokenUtil(account.accessToken, c.context),
				refreshToken: await setTokenUtil(account.refreshToken, c.context),
				idToken: account.idToken,
				accessTokenExpiresAt: account.accessTokenExpiresAt,
				refreshTokenExpiresAt: account.refreshTokenExpiresAt,
				scope: account.scope,
				providerId: account.providerId,
				accountId: userInfo.id.toString()
			};
			const { user: createdUser, account: createdAccount } = await c.context.internalAdapter.createOAuthUser({
				...restUserInfo,
				email: userInfo.email.toLowerCase()
			}, accountData);
			user = createdUser;
			if (c.context.options.account?.storeAccountCookie) await setAccountCookie(c, createdAccount);
			if (!userInfo.emailVerified && user && c.context.options.emailVerification?.sendOnSignUp && c.context.options.emailVerification?.sendVerificationEmail) {
				const token = await createEmailVerificationToken(c.context.secret, user.email, void 0, c.context.options.emailVerification?.expiresIn);
				const url = `${c.context.baseURL}/verify-email?token=${token}&callbackURL=${callbackURL}`;
				await c.context.runInBackgroundOrAwait(c.context.options.emailVerification.sendVerificationEmail({
					user,
					url,
					token
				}, c.request));
			}
		} catch (e) {
			logger.error(e);
			if (isAPIError(e)) return {
				error: e.message,
				data: null,
				isRegister: false
			};
			return {
				error: "unable to create user",
				data: null,
				isRegister: false
			};
		}
	}
	if (!user) return {
		error: "unable to create user",
		data: null,
		isRegister: false
	};
	const session = await c.context.internalAdapter.createSession(user.id);
	if (!session) return {
		error: "unable to create session",
		data: null,
		isRegister: false
	};
	return {
		data: {
			session,
			user
		},
		error: null,
		isRegister
	};
}
//#endregion
//#region node_modules/better-auth/dist/utils/hide-metadata.mjs
var HIDE_METADATA = { scope: "server" };
//#endregion
//#region node_modules/better-auth/dist/api/routes/callback.mjs
var schema = object({
	code: string().optional(),
	error: string().optional(),
	device_id: string().optional(),
	error_description: string().optional(),
	state: string().optional(),
	user: string().optional()
});
createAuthEndpoint("/callback/:id", {
	method: ["GET", "POST"],
	operationId: "handleOAuthCallback",
	body: schema.optional(),
	query: schema.optional(),
	metadata: {
		...HIDE_METADATA,
		allowedMediaTypes: ["application/x-www-form-urlencoded", "application/json"]
	}
}, async (c) => {
	let queryOrBody;
	const defaultErrorURL = c.context.options.onAPIError?.errorURL || `${c.context.baseURL}/error`;
	if (c.method === "POST") {
		const postData = c.body ? schema.parse(c.body) : {};
		const queryData = c.query ? schema.parse(c.query) : {};
		const mergedData = schema.parse({
			...postData,
			...queryData
		});
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(mergedData)) if (value !== void 0 && value !== null) params.set(key, String(value));
		const redirectURL = `${c.context.baseURL}/callback/${c.params.id}?${params.toString()}`;
		throw c.redirect(redirectURL);
	}
	try {
		if (c.method === "GET") queryOrBody = schema.parse(c.query);
		else if (c.method === "POST") queryOrBody = schema.parse(c.body);
		else throw new Error("Unsupported method");
	} catch (e) {
		c.context.logger.error("INVALID_CALLBACK_REQUEST", e);
		throw c.redirect(`${defaultErrorURL}?error=invalid_callback_request`);
	}
	const { code, error, state, error_description, device_id, user: userData } = queryOrBody;
	if (!state) {
		c.context.logger.error("State not found", error);
		const url = `${defaultErrorURL}${defaultErrorURL.includes("?") ? "&" : "?"}state=state_not_found`;
		throw c.redirect(url);
	}
	const { codeVerifier, callbackURL, link, errorURL, newUserURL, requestSignUp } = await parseState(c);
	function redirectOnError(error, description) {
		const baseURL = errorURL ?? defaultErrorURL;
		const params = new URLSearchParams({ error });
		if (description) params.set("error_description", description);
		const url = `${baseURL}${baseURL.includes("?") ? "&" : "?"}${params.toString()}`;
		throw c.redirect(url);
	}
	if (error) redirectOnError(error, error_description);
	if (!code) {
		c.context.logger.error("Code not found");
		throw redirectOnError("no_code");
	}
	const provider = await getAwaitableValue(c.context.socialProviders, { value: c.params.id });
	if (!provider) {
		c.context.logger.error("Oauth provider with id", c.params.id, "not found");
		throw redirectOnError("oauth_provider_not_found");
	}
	let tokens;
	try {
		tokens = await provider.validateAuthorizationCode({
			code,
			codeVerifier,
			deviceId: device_id,
			redirectURI: `${c.context.baseURL}/callback/${provider.id}`
		});
	} catch (e) {
		c.context.logger.error("", e);
		throw redirectOnError("invalid_code");
	}
	if (!tokens) throw redirectOnError("invalid_code");
	const parsedUserData = userData ? safeJSONParse(userData) : null;
	const userInfo = await provider.getUserInfo({
		...tokens,
		user: parsedUserData ?? void 0
	}).then((res) => res?.user);
	if (!userInfo) {
		c.context.logger.error("Unable to get user info");
		return redirectOnError("unable_to_get_user_info");
	}
	if (!callbackURL) {
		c.context.logger.error("No callback URL found");
		throw redirectOnError("no_callback_url");
	}
	if (link) {
		if (!c.context.trustedProviders.includes(provider.id) && !userInfo.emailVerified || c.context.options.account?.accountLinking?.enabled === false) {
			c.context.logger.error("Unable to link account - untrusted provider");
			return redirectOnError("unable_to_link_account");
		}
		if (userInfo.email?.toLowerCase() !== link.email.toLowerCase() && c.context.options.account?.accountLinking?.allowDifferentEmails !== true) return redirectOnError("email_doesn't_match");
		const existingAccount = await c.context.internalAdapter.findAccount(String(userInfo.id));
		if (existingAccount) {
			if (existingAccount.userId.toString() !== link.userId.toString()) return redirectOnError("account_already_linked_to_different_user");
			const updateData = Object.fromEntries(Object.entries({
				accessToken: await setTokenUtil(tokens.accessToken, c.context),
				refreshToken: await setTokenUtil(tokens.refreshToken, c.context),
				idToken: tokens.idToken,
				accessTokenExpiresAt: tokens.accessTokenExpiresAt,
				refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
				scope: tokens.scopes?.join(",")
			}).filter(([_, value]) => value !== void 0));
			await c.context.internalAdapter.updateAccount(existingAccount.id, updateData);
		} else if (!await c.context.internalAdapter.createAccount({
			userId: link.userId,
			providerId: provider.id,
			accountId: String(userInfo.id),
			...tokens,
			accessToken: await setTokenUtil(tokens.accessToken, c.context),
			refreshToken: await setTokenUtil(tokens.refreshToken, c.context),
			scope: tokens.scopes?.join(",")
		})) return redirectOnError("unable_to_link_account");
		let toRedirectTo;
		try {
			toRedirectTo = callbackURL.toString();
		} catch {
			toRedirectTo = callbackURL;
		}
		throw c.redirect(toRedirectTo);
	}
	if (!userInfo.email) {
		c.context.logger.error("Provider did not return email. This could be due to misconfiguration in the provider settings.");
		return redirectOnError("email_not_found");
	}
	const accountData = {
		providerId: provider.id,
		accountId: String(userInfo.id),
		...tokens,
		scope: tokens.scopes?.join(",")
	};
	const result = await handleOAuthUserInfo(c, {
		userInfo: {
			...userInfo,
			id: String(userInfo.id),
			email: userInfo.email,
			name: userInfo.name || ""
		},
		account: accountData,
		callbackURL,
		disableSignUp: provider.disableImplicitSignUp && !requestSignUp || provider.options?.disableSignUp,
		overrideUserInfo: provider.options?.overrideUserInfoOnSignIn
	});
	if (result.error) {
		c.context.logger.error(result.error.split(" ").join("_"));
		return redirectOnError(result.error.split(" ").join("_"));
	}
	const { session, user } = result.data;
	await setSessionCookie(c, {
		session,
		user
	});
	let toRedirectTo;
	try {
		toRedirectTo = (result.isRegister ? newUserURL || callbackURL : callbackURL).toString();
	} catch {
		toRedirectTo = result.isRegister ? newUserURL || callbackURL : callbackURL;
	}
	throw c.redirect(toRedirectTo);
});
//#endregion
//#region node_modules/better-auth/dist/api/routes/error.mjs
function sanitize(input) {
	return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/&(?!amp;|lt;|gt;|quot;|#39;|#x[0-9a-fA-F]+;|#[0-9]+;)/g, "&amp;");
}
var html = (options, code = "Unknown", description = null) => {
	const custom = options.onAPIError?.customizeDefaultErrorPage;
	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Error</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body {
        font-family: ${custom?.font?.defaultFamily || "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"};
        background: ${custom?.colors?.background || "var(--background)"};
        color: var(--foreground);
        margin: 0;
      }
      :root,
      :host {
        --spacing: 0.25rem;
        --container-md: 28rem;
        --text-sm: ${custom?.size?.textSm || "0.875rem"};
        --text-sm--line-height: calc(1.25 / 0.875);
        --text-2xl: ${custom?.size?.text2xl || "1.5rem"};
        --text-2xl--line-height: calc(2 / 1.5);
        --text-4xl: ${custom?.size?.text4xl || "2.25rem"};
        --text-4xl--line-height: calc(2.5 / 2.25);
        --text-6xl: ${custom?.size?.text6xl || "3rem"};
        --text-6xl--line-height: 1;
        --font-weight-medium: 500;
        --font-weight-semibold: 600;
        --font-weight-bold: 700;
        --default-transition-duration: 150ms;
        --default-transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        --radius: ${custom?.size?.radiusSm || "0.625rem"};
        --default-mono-font-family: ${custom?.font?.monoFamily || "var(--font-geist-mono)"};
        --primary: ${custom?.colors?.primary || "black"};
        --primary-foreground: ${custom?.colors?.primaryForeground || "white"};
        --background: ${custom?.colors?.background || "white"};
        --foreground: ${custom?.colors?.foreground || "oklch(0.271 0 0)"};
        --border: ${custom?.colors?.border || "oklch(0.89 0 0)"};
        --destructive: ${custom?.colors?.destructive || "oklch(0.55 0.15 25.723)"};
        --muted-foreground: ${custom?.colors?.mutedForeground || "oklch(0.545 0 0)"};
        --corner-border: ${custom?.colors?.cornerBorder || "#404040"};
      }

      button, .btn {
        cursor: pointer;
        background: none;
        border: none;
        color: inherit;
        font: inherit;
        transition: all var(--default-transition-duration)
          var(--default-transition-timing-function);
      }
      button:hover, .btn:hover {
        opacity: 0.8;
      }

      @media (prefers-color-scheme: dark) {
        :root,
        :host {
          --primary: ${custom?.colors?.primary || "white"};
          --primary-foreground: ${custom?.colors?.primaryForeground || "black"};
          --background: ${custom?.colors?.background || "oklch(0.15 0 0)"};
          --foreground: ${custom?.colors?.foreground || "oklch(0.98 0 0)"};
          --border: ${custom?.colors?.border || "oklch(0.27 0 0)"};
          --destructive: ${custom?.colors?.destructive || "oklch(0.65 0.15 25.723)"};
          --muted-foreground: ${custom?.colors?.mutedForeground || "oklch(0.65 0 0)"};
          --corner-border: ${custom?.colors?.cornerBorder || "#a0a0a0"};
        }
      }
      @media (max-width: 640px) {
        :root, :host {
          --text-6xl: 2.5rem;
          --text-2xl: 1.25rem;
          --text-sm: 0.8125rem;
        }
      }
      @media (max-width: 480px) {
        :root, :host {
          --text-6xl: 2rem;
          --text-2xl: 1.125rem;
        }
      }
    </style>
  </head>
  <body style="width: 100vw; min-height: 100vh; overflow-x: hidden; overflow-y: auto;">
    <div
        style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.5rem;
            position: relative;
            width: 100%;
            min-height: 100vh;
            padding: 1rem;
        "
        >
${custom?.disableBackgroundGrid ? "" : `
      <div
        style="
          position: absolute;
          inset: 0;
          background-image: linear-gradient(to right, ${custom?.colors?.gridColor || "var(--border)"} 1px, transparent 1px),
            linear-gradient(to bottom, ${custom?.colors?.gridColor || "var(--border)"} 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.6;
          pointer-events: none;
          width: 100vw;
          height: 100vh;
        "
      ></div>
      <div
        style="
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${custom?.colors?.background || "var(--background)"};
          mask-image: radial-gradient(ellipse at center, transparent 20%, black);
          -webkit-mask-image: radial-gradient(ellipse at center, transparent 20%, black);
          pointer-events: none;
        "
      ></div>
`}

<div
  style="
    position: relative;
    z-index: 10;
    border: 2px solid var(--border);
    background: ${custom?.colors?.cardBackground || "var(--background)"};
    padding: 1.5rem;
    max-width: 42rem;
    width: 100%;
  "
>
    ${custom?.disableCornerDecorations ? "" : `
        <!-- Corner decorations -->
        <div
          style="
            position: absolute;
            top: -2px;
            left: -2px;
            width: 2rem;
            height: 2rem;
            border-top: 4px solid var(--corner-border);
            border-left: 4px solid var(--corner-border);
          "
        ></div>
        <div
          style="
            position: absolute;
            top: -2px;
            right: -2px;
            width: 2rem;
            height: 2rem;
            border-top: 4px solid var(--corner-border);
            border-right: 4px solid var(--corner-border);
          "
        ></div>
  
        <div
          style="
            position: absolute;
            bottom: -2px;
            left: -2px;
            width: 2rem;
            height: 2rem;
            border-bottom: 4px solid var(--corner-border);
            border-left: 4px solid var(--corner-border);
          "
        ></div>
        <div
          style="
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 2rem;
            height: 2rem;
            border-bottom: 4px solid var(--corner-border);
            border-right: 4px solid var(--corner-border);
          "
        ></div>`}

        <div style="text-align: center; margin-bottom: 1.5rem;">
          <div style="margin-bottom: 1.5rem;">
            <div
              style="
                display: inline-block;
                border: 2px solid ${custom?.disableTitleBorder ? "transparent" : custom?.colors?.titleBorder || "var(--destructive)"};
                padding: 0.375rem 1rem;
              "
            >
              <h1
                style="
                  font-size: var(--text-6xl);
                  font-weight: var(--font-weight-semibold);
                  color: ${custom?.colors?.titleColor || "var(--foreground)"};
                  letter-spacing: -0.02em;
                  margin: 0;
                "
              >
                ERROR
              </h1>
            </div>
            <div
              style="
                height: 2px;
                background-color: var(--border);
                width: calc(100% + 3rem);
                margin-left: -1.5rem;
                margin-top: 1.5rem;
              "
            ></div>
          </div>

          <h2
            style="
              font-size: var(--text-2xl);
              font-weight: var(--font-weight-semibold);
              color: var(--foreground);
              margin: 0 0 1rem;
            "
          >
            Something went wrong
          </h2>

          <div
            style="
                display: inline-flex;
                align-items: center;
                gap: 0.5rem;
                border: 2px solid var(--border);
                background-color: var(--muted);
                padding: 0.375rem 0.75rem;
                margin: 0 0 1rem;
                flex-wrap: wrap;
                justify-content: center;
            "
            >
            <span
                style="
                font-size: 0.75rem;
                color: var(--muted-foreground);
                font-weight: var(--font-weight-semibold);
                "
            >
                CODE:
            </span>
            <span
                style="
                font-size: var(--text-sm);
                font-family: var(--default-mono-font-family, monospace);
                color: var(--foreground);
                word-break: break-all;
                "
            >
                ${sanitize(code)}
            </span>
            </div>

          <p
            style="
              color: var(--muted-foreground);
              max-width: 28rem;
              margin: 0 auto;
              font-size: var(--text-sm);
              line-height: 1.5;
              text-wrap: pretty;
            "
          >
            ${!description ? `We encountered an unexpected error. Please try again or return to the home page. If you're a developer, you can find more information about the error <a href='https://better-auth.com/docs/reference/errors/${encodeURIComponent(code)}' target='_blank' rel="noopener noreferrer" style='color: var(--foreground); text-decoration: underline;'>here</a>.` : description}
          </p>
        </div>

        <div
          style="
            display: flex;
            gap: 0.75rem;
            margin-top: 1.5rem;
            justify-content: center;
            flex-wrap: wrap;
          "
        >
          <a
            href="/"
            style="
              text-decoration: none;
            "
          >
            <div
              style="
                border: 2px solid var(--border);
                background: var(--primary);
                color: var(--primary-foreground);
                padding: 0.5rem 1rem;
                border-radius: 0;
                white-space: nowrap;
              "
              class="btn"
            >
              Go Home
            </div>
          </a>
          <a
            href="https://better-auth.com/docs/reference/errors/${encodeURIComponent(code)}?askai=${encodeURIComponent(`What does the error code ${code} mean?`)}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              text-decoration: none;
            "
          >
            <div
              style="
                border: 2px solid var(--border);
                background: transparent;
                color: var(--foreground);
                padding: 0.5rem 1rem;
                border-radius: 0;
                white-space: nowrap;
              "
              class="btn"
            >
              Ask AI
            </div>
          </a>
        </div>
      </div>
    </div>
  </body>
</html>`;
};
createAuthEndpoint("/error", {
	method: "GET",
	metadata: {
		...HIDE_METADATA,
		openapi: {
			description: "Displays an error page",
			responses: { "200": {
				description: "Success",
				content: { "text/html": { schema: {
					type: "string",
					description: "The HTML content of the error page"
				} } }
			} }
		}
	}
}, async (c) => {
	const url = new URL(c.request?.url || "");
	const unsanitizedCode = url.searchParams.get("error") || "UNKNOWN";
	const unsanitizedDescription = url.searchParams.get("error_description") || null;
	const safeCode = /^[\'A-Za-z0-9_-]+$/.test(unsanitizedCode || "") ? unsanitizedCode : "UNKNOWN";
	const safeDescription = unsanitizedDescription ? sanitize(unsanitizedDescription) : null;
	const queryParams = new URLSearchParams();
	queryParams.set("error", safeCode);
	if (unsanitizedDescription) queryParams.set("error_description", unsanitizedDescription);
	const options = c.context.options;
	const errorURL = options.onAPIError?.errorURL;
	if (errorURL) return new Response(null, {
		status: 302,
		headers: { Location: `${errorURL}${errorURL.includes("?") ? "&" : "?"}${queryParams.toString()}` }
	});
	if (isProduction && !options.onAPIError?.customizeDefaultErrorPage) return new Response(null, {
		status: 302,
		headers: { Location: `/?${queryParams.toString()}` }
	});
	return new Response(html(c.context.options, safeCode, safeDescription), { headers: { "Content-Type": "text/html" } });
});
createAuthEndpoint("/ok", {
	method: "GET",
	metadata: {
		...HIDE_METADATA,
		openapi: {
			description: "Check if the API is working",
			responses: { "200": {
				description: "API is working",
				content: { "application/json": { schema: {
					type: "object",
					properties: { ok: {
						type: "boolean",
						description: "Indicates if the API is working"
					} },
					required: ["ok"]
				} } }
			} }
		}
	}
}, async (ctx) => {
	return ctx.json({ ok: true });
});
//#endregion
//#region node_modules/better-auth/dist/utils/password.mjs
async function validatePassword(ctx, data) {
	const credentialAccount = (await ctx.context.internalAdapter.findAccounts(data.userId))?.find((account) => account.providerId === "credential");
	const currentPassword = credentialAccount?.password;
	if (!credentialAccount || !currentPassword) return false;
	return await ctx.context.password.verify({
		hash: currentPassword,
		password: data.password
	});
}
//#endregion
//#region node_modules/better-auth/dist/api/routes/password.mjs
function redirectError(ctx, callbackURL, query) {
	const url = callbackURL ? new URL(callbackURL, ctx.baseURL) : new URL(`${ctx.baseURL}/error`);
	if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
	return url.href;
}
function redirectCallback(ctx, callbackURL, query) {
	const url = new URL(callbackURL, ctx.baseURL);
	if (query) Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v));
	return url.href;
}
createAuthEndpoint("/request-password-reset", {
	method: "POST",
	body: object({
		email: email().meta({ description: "The email address of the user to send a password reset email to" }),
		redirectTo: string().meta({ description: "The URL to redirect the user to reset their password. If the token isn't valid or expired, it'll be redirected with a query parameter `?error=INVALID_TOKEN`. If the token is valid, it'll be redirected with a query parameter `?token=VALID_TOKEN" }).optional()
	}),
	metadata: { openapi: {
		operationId: "requestPasswordReset",
		description: "Send a password reset email to the user",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					status: { type: "boolean" },
					message: { type: "string" }
				}
			} } }
		} }
	} },
	use: [originCheck((ctx) => ctx.body.redirectTo)]
}, async (ctx) => {
	if (!ctx.context.options.emailAndPassword?.sendResetPassword) {
		ctx.context.logger.error("Reset password isn't enabled.Please pass an emailAndPassword.sendResetPassword function in your auth config!");
		throw APIError.from("BAD_REQUEST", {
			message: "Reset password isn't enabled",
			code: "RESET_PASSWORD_DISABLED"
		});
	}
	const { email, redirectTo } = ctx.body;
	const user = await ctx.context.internalAdapter.findUserByEmail(email, { includeAccounts: true });
	if (!user) {
		/**
		* We simulate the verification token generation and the database lookup
		* to mitigate timing attacks.
		*/
		generateId(24);
		await ctx.context.internalAdapter.findVerificationValue("dummy-verification-token");
		ctx.context.logger.error("Reset Password: User not found", { email });
		return ctx.json({
			status: true,
			message: "If this email exists in our system, check your email for the reset link"
		});
	}
	const expiresAt = getDate(ctx.context.options.emailAndPassword.resetPasswordTokenExpiresIn || 3600 * 1, "sec");
	const verificationToken = generateId(24);
	await ctx.context.internalAdapter.createVerificationValue({
		value: user.user.id,
		identifier: `reset-password:${verificationToken}`,
		expiresAt
	});
	const callbackURL = redirectTo ? encodeURIComponent(redirectTo) : "";
	const url = `${ctx.context.baseURL}/reset-password/${verificationToken}?callbackURL=${callbackURL}`;
	await ctx.context.runInBackgroundOrAwait(ctx.context.options.emailAndPassword.sendResetPassword({
		user: user.user,
		url,
		token: verificationToken
	}, ctx.request));
	return ctx.json({
		status: true,
		message: "If this email exists in our system, check your email for the reset link"
	});
});
createAuthEndpoint("/reset-password/:token", {
	method: "GET",
	operationId: "forgetPasswordCallback",
	query: object({ callbackURL: string().meta({ description: "The URL to redirect the user to reset their password" }) }),
	use: [originCheck((ctx) => ctx.query.callbackURL)],
	metadata: { openapi: {
		operationId: "resetPasswordCallback",
		description: "Redirects the user to the callback URL with the token",
		parameters: [{
			name: "token",
			in: "path",
			required: true,
			description: "The token to reset the password",
			schema: { type: "string" }
		}, {
			name: "callbackURL",
			in: "query",
			required: true,
			description: "The URL to redirect the user to reset their password",
			schema: { type: "string" }
		}],
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: { token: { type: "string" } }
			} } }
		} }
	} }
}, async (ctx) => {
	const { token } = ctx.params;
	const { callbackURL } = ctx.query;
	if (!token || !callbackURL) throw ctx.redirect(redirectError(ctx.context, callbackURL, { error: "INVALID_TOKEN" }));
	const verification = await ctx.context.internalAdapter.findVerificationValue(`reset-password:${token}`);
	if (!verification || verification.expiresAt < /* @__PURE__ */ new Date()) throw ctx.redirect(redirectError(ctx.context, callbackURL, { error: "INVALID_TOKEN" }));
	throw ctx.redirect(redirectCallback(ctx.context, callbackURL, { token }));
});
createAuthEndpoint("/reset-password", {
	method: "POST",
	operationId: "resetPassword",
	query: object({ token: string().optional() }).optional(),
	body: object({
		newPassword: string().meta({ description: "The new password to set" }),
		token: string().meta({ description: "The token to reset the password" }).optional()
	}),
	metadata: { openapi: {
		operationId: "resetPassword",
		description: "Reset the password for a user",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: { status: { type: "boolean" } }
			} } }
		} }
	} }
}, async (ctx) => {
	const token = ctx.body.token || ctx.query?.token;
	if (!token) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.INVALID_TOKEN);
	const { newPassword } = ctx.body;
	const minLength = ctx.context.password?.config.minPasswordLength;
	const maxLength = ctx.context.password?.config.maxPasswordLength;
	if (newPassword.length < minLength) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.PASSWORD_TOO_SHORT);
	if (newPassword.length > maxLength) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.PASSWORD_TOO_LONG);
	const id = `reset-password:${token}`;
	const verification = await ctx.context.internalAdapter.findVerificationValue(id);
	if (!verification || verification.expiresAt < /* @__PURE__ */ new Date()) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.INVALID_TOKEN);
	const userId = verification.value;
	const hashedPassword = await ctx.context.password.hash(newPassword);
	if (!(await ctx.context.internalAdapter.findAccounts(userId)).find((ac) => ac.providerId === "credential")) await ctx.context.internalAdapter.createAccount({
		userId,
		providerId: "credential",
		password: hashedPassword,
		accountId: userId
	});
	else await ctx.context.internalAdapter.updatePassword(userId, hashedPassword);
	await ctx.context.internalAdapter.deleteVerificationByIdentifier(id);
	if (ctx.context.options.emailAndPassword?.onPasswordReset) {
		const user = await ctx.context.internalAdapter.findUserById(userId);
		if (user) await ctx.context.options.emailAndPassword.onPasswordReset({ user }, ctx.request);
	}
	if (ctx.context.options.emailAndPassword?.revokeSessionsOnPasswordReset) await ctx.context.internalAdapter.deleteSessions(userId);
	return ctx.json({ status: true });
});
createAuthEndpoint("/verify-password", {
	method: "POST",
	body: object({ password: string().meta({ description: "The password to verify" }) }),
	metadata: {
		scope: "server",
		openapi: {
			operationId: "verifyPassword",
			description: "Verify the current user's password",
			responses: { "200": {
				description: "Success",
				content: { "application/json": { schema: {
					type: "object",
					properties: { status: { type: "boolean" } }
				} } }
			} }
		}
	},
	use: [sensitiveSessionMiddleware]
}, async (ctx) => {
	const { password } = ctx.body;
	const session = ctx.context.session;
	if (!await validatePassword(ctx, {
		password,
		userId: session.user.id
	})) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.INVALID_PASSWORD);
	return ctx.json({ status: true });
});
object({
	callbackURL: string().meta({ description: "Callback URL to redirect to after the user has signed in" }).optional(),
	newUserCallbackURL: string().optional(),
	errorCallbackURL: string().meta({ description: "Callback URL to redirect to if an error happens" }).optional(),
	provider: SocialProviderListEnum,
	disableRedirect: boolean$1().meta({ description: "Disable automatic redirection to the provider. Useful for handling the redirection yourself" }).optional(),
	idToken: optional(object({
		token: string().meta({ description: "ID token from the provider" }),
		nonce: string().meta({ description: "Nonce used to generate the token" }).optional(),
		accessToken: string().meta({ description: "Access token from the provider" }).optional(),
		refreshToken: string().meta({ description: "Refresh token from the provider" }).optional(),
		expiresAt: number().meta({ description: "Expiry date of the token" }).optional(),
		user: object({
			name: object({
				firstName: string().optional(),
				lastName: string().optional()
			}).optional(),
			email: string().optional()
		}).meta({ description: "The user object from the provider. Only available for some providers like Apple." }).optional()
	})),
	scopes: array(string()).meta({ description: "Array of scopes to request from the provider. This will override the default scopes passed." }).optional(),
	requestSignUp: boolean$1().meta({ description: "Explicitly request sign-up. Useful when disableImplicitSignUp is true for this provider" }).optional(),
	loginHint: string().meta({ description: "The login hint to use for the authorization code request" }).optional(),
	additionalData: record(string(), any()).optional().meta({ description: "Additional data to be passed through the OAuth flow" })
});
createAuthEndpoint("/sign-out", {
	method: "POST",
	operationId: "signOut",
	requireHeaders: true,
	metadata: { openapi: {
		operationId: "signOut",
		description: "Sign out the current user",
		responses: { "200": {
			description: "Success",
			content: { "application/json": { schema: {
				type: "object",
				properties: { success: { type: "boolean" } }
			} } }
		} }
	} }
}, async (ctx) => {
	const sessionCookieToken = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret);
	if (sessionCookieToken) try {
		await ctx.context.internalAdapter.deleteSession(sessionCookieToken);
	} catch (e) {
		ctx.context.logger.error("Failed to delete session from database", e);
	}
	deleteSessionCookie(ctx);
	return ctx.json({ success: true });
});
object({
	name: string(),
	email: email(),
	password: string().nonempty(),
	image: string().optional(),
	callbackURL: string().optional(),
	rememberMe: boolean$1().optional()
}).and(record(string(), any()));
record(string().meta({ description: "Field name must be a string" }), any());
record(string().meta({ description: "Field name must be a string" }), any());
createAuthEndpoint("/change-password", {
	method: "POST",
	operationId: "changePassword",
	body: object({
		newPassword: string().meta({ description: "The new password to set" }),
		currentPassword: string().meta({ description: "The current password is required" }),
		revokeOtherSessions: boolean$1().meta({ description: "Must be a boolean value" }).optional()
	}),
	use: [sensitiveSessionMiddleware],
	metadata: { openapi: {
		operationId: "changePassword",
		description: "Change the password of the user",
		responses: { "200": {
			description: "Password successfully changed",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					token: {
						type: "string",
						nullable: true,
						description: "New session token if other sessions were revoked"
					},
					user: {
						type: "object",
						properties: {
							id: {
								type: "string",
								description: "The unique identifier of the user"
							},
							email: {
								type: "string",
								format: "email",
								description: "The email address of the user"
							},
							name: {
								type: "string",
								description: "The name of the user"
							},
							image: {
								type: "string",
								format: "uri",
								nullable: true,
								description: "The profile image URL of the user"
							},
							emailVerified: {
								type: "boolean",
								description: "Whether the email has been verified"
							},
							createdAt: {
								type: "string",
								format: "date-time",
								description: "When the user was created"
							},
							updatedAt: {
								type: "string",
								format: "date-time",
								description: "When the user was last updated"
							}
						},
						required: [
							"id",
							"email",
							"name",
							"emailVerified",
							"createdAt",
							"updatedAt"
						]
					}
				},
				required: ["user"]
			} } }
		} }
	} }
}, async (ctx) => {
	const { newPassword, currentPassword, revokeOtherSessions } = ctx.body;
	const session = ctx.context.session;
	const minPasswordLength = ctx.context.password.config.minPasswordLength;
	if (newPassword.length < minPasswordLength) {
		ctx.context.logger.error("Password is too short");
		throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.PASSWORD_TOO_SHORT);
	}
	const maxPasswordLength = ctx.context.password.config.maxPasswordLength;
	if (newPassword.length > maxPasswordLength) {
		ctx.context.logger.error("Password is too long");
		throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.PASSWORD_TOO_LONG);
	}
	const account = (await ctx.context.internalAdapter.findAccounts(session.user.id)).find((account) => account.providerId === "credential" && account.password);
	if (!account || !account.password) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.CREDENTIAL_ACCOUNT_NOT_FOUND);
	const passwordHash = await ctx.context.password.hash(newPassword);
	if (!await ctx.context.password.verify({
		hash: account.password,
		password: currentPassword
	})) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.INVALID_PASSWORD);
	await ctx.context.internalAdapter.updateAccount(account.id, { password: passwordHash });
	let token = null;
	if (revokeOtherSessions) {
		await ctx.context.internalAdapter.deleteSessions(session.user.id);
		const newSession = await ctx.context.internalAdapter.createSession(session.user.id);
		if (!newSession) throw APIError.from("INTERNAL_SERVER_ERROR", BASE_ERROR_CODES.FAILED_TO_GET_SESSION);
		await setSessionCookie(ctx, {
			session: newSession,
			user: session.user
		});
		token = newSession.token;
	}
	return ctx.json({
		token,
		user: parseUserOutput(ctx.context.options, session.user)
	});
});
createAuthEndpoint({
	method: "POST",
	body: object({ newPassword: string().meta({ description: "The new password to set is required" }) }),
	use: [sensitiveSessionMiddleware]
}, async (ctx) => {
	const { newPassword } = ctx.body;
	const session = ctx.context.session;
	const minPasswordLength = ctx.context.password.config.minPasswordLength;
	if (newPassword.length < minPasswordLength) {
		ctx.context.logger.error("Password is too short");
		throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.PASSWORD_TOO_SHORT);
	}
	const maxPasswordLength = ctx.context.password.config.maxPasswordLength;
	if (newPassword.length > maxPasswordLength) {
		ctx.context.logger.error("Password is too long");
		throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.PASSWORD_TOO_LONG);
	}
	const account = (await ctx.context.internalAdapter.findAccounts(session.user.id)).find((account) => account.providerId === "credential" && account.password);
	const passwordHash = await ctx.context.password.hash(newPassword);
	if (!account) {
		await ctx.context.internalAdapter.linkAccount({
			userId: session.user.id,
			providerId: "credential",
			accountId: session.user.id,
			password: passwordHash
		});
		return ctx.json({ status: true });
	}
	throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.PASSWORD_ALREADY_SET);
});
createAuthEndpoint("/delete-user", {
	method: "POST",
	use: [sensitiveSessionMiddleware],
	body: object({
		callbackURL: string().meta({ description: "The callback URL to redirect to after the user is deleted" }).optional(),
		password: string().meta({ description: "The password of the user is required to delete the user" }).optional(),
		token: string().meta({ description: "The token to delete the user is required" }).optional()
	}),
	metadata: { openapi: {
		operationId: "deleteUser",
		description: "Delete the user",
		requestBody: { content: { "application/json": { schema: {
			type: "object",
			properties: {
				callbackURL: {
					type: "string",
					description: "The callback URL to redirect to after the user is deleted"
				},
				password: {
					type: "string",
					description: "The user's password. Required if session is not fresh"
				},
				token: {
					type: "string",
					description: "The deletion verification token"
				}
			}
		} } } },
		responses: { "200": {
			description: "User deletion processed successfully",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					success: {
						type: "boolean",
						description: "Indicates if the operation was successful"
					},
					message: {
						type: "string",
						enum: ["User deleted", "Verification email sent"],
						description: "Status message of the deletion process"
					}
				},
				required: ["success", "message"]
			} } }
		} }
	} }
}, async (ctx) => {
	if (!ctx.context.options.user?.deleteUser?.enabled) {
		ctx.context.logger.error("Delete user is disabled. Enable it in the options");
		throw APIError.fromStatus("NOT_FOUND");
	}
	const session = ctx.context.session;
	if (ctx.body.password) {
		const account = (await ctx.context.internalAdapter.findAccounts(session.user.id)).find((account) => account.providerId === "credential" && account.password);
		if (!account || !account.password) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.CREDENTIAL_ACCOUNT_NOT_FOUND);
		if (!await ctx.context.password.verify({
			hash: account.password,
			password: ctx.body.password
		})) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.INVALID_PASSWORD);
	}
	if (ctx.body.token) {
		await deleteUserCallback({
			...ctx,
			query: { token: ctx.body.token }
		});
		return ctx.json({
			success: true,
			message: "User deleted"
		});
	}
	if (ctx.context.options.user.deleteUser?.sendDeleteAccountVerification) {
		const token = generateRandomString(32, "0-9", "a-z");
		await ctx.context.internalAdapter.createVerificationValue({
			value: session.user.id,
			identifier: `delete-account-${token}`,
			expiresAt: new Date(Date.now() + (ctx.context.options.user.deleteUser?.deleteTokenExpiresIn || 3600 * 24) * 1e3)
		});
		const url = `${ctx.context.baseURL}/delete-user/callback?token=${token}&callbackURL=${encodeURIComponent(ctx.body.callbackURL || "/")}`;
		await ctx.context.runInBackgroundOrAwait(ctx.context.options.user.deleteUser.sendDeleteAccountVerification({
			user: session.user,
			url,
			token
		}, ctx.request));
		return ctx.json({
			success: true,
			message: "Verification email sent"
		});
	}
	if (!ctx.body.password && ctx.context.sessionConfig.freshAge !== 0) {
		const currentAge = new Date(session.session.createdAt).getTime();
		const freshAge = ctx.context.sessionConfig.freshAge * 1e3;
		if (Date.now() - currentAge > freshAge) throw APIError.from("BAD_REQUEST", BASE_ERROR_CODES.SESSION_EXPIRED);
	}
	const beforeDelete = ctx.context.options.user.deleteUser?.beforeDelete;
	if (beforeDelete) await beforeDelete(session.user, ctx.request);
	await ctx.context.internalAdapter.deleteUser(session.user.id);
	await ctx.context.internalAdapter.deleteSessions(session.user.id);
	deleteSessionCookie(ctx);
	const afterDelete = ctx.context.options.user.deleteUser?.afterDelete;
	if (afterDelete) await afterDelete(session.user, ctx.request);
	return ctx.json({
		success: true,
		message: "User deleted"
	});
});
var deleteUserCallback = createAuthEndpoint("/delete-user/callback", {
	method: "GET",
	query: object({
		token: string().meta({ description: "The token to verify the deletion request" }),
		callbackURL: string().meta({ description: "The URL to redirect to after deletion" }).optional()
	}),
	use: [originCheck((ctx) => ctx.query.callbackURL)],
	metadata: { openapi: {
		description: "Callback to complete user deletion with verification token",
		responses: { "200": {
			description: "User successfully deleted",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					success: {
						type: "boolean",
						description: "Indicates if the deletion was successful"
					},
					message: {
						type: "string",
						enum: ["User deleted"],
						description: "Confirmation message"
					}
				},
				required: ["success", "message"]
			} } }
		} }
	} }
}, async (ctx) => {
	if (!ctx.context.options.user?.deleteUser?.enabled) {
		ctx.context.logger.error("Delete user is disabled. Enable it in the options");
		throw APIError.from("NOT_FOUND", {
			message: "Not found",
			code: "NOT_FOUND"
		});
	}
	const session = await getSessionFromCtx(ctx);
	if (!session) throw APIError.from("NOT_FOUND", BASE_ERROR_CODES.FAILED_TO_GET_USER_INFO);
	const token = await ctx.context.internalAdapter.findVerificationValue(`delete-account-${ctx.query.token}`);
	if (!token || token.expiresAt < /* @__PURE__ */ new Date()) throw APIError.from("NOT_FOUND", BASE_ERROR_CODES.INVALID_TOKEN);
	if (token.value !== session.user.id) throw APIError.from("NOT_FOUND", BASE_ERROR_CODES.INVALID_TOKEN);
	const beforeDelete = ctx.context.options.user.deleteUser?.beforeDelete;
	if (beforeDelete) await beforeDelete(session.user, ctx.request);
	await ctx.context.internalAdapter.deleteUser(session.user.id);
	await ctx.context.internalAdapter.deleteSessions(session.user.id);
	await ctx.context.internalAdapter.deleteAccounts(session.user.id);
	await ctx.context.internalAdapter.deleteVerificationByIdentifier(`delete-account-${ctx.query.token}`);
	deleteSessionCookie(ctx);
	const afterDelete = ctx.context.options.user.deleteUser?.afterDelete;
	if (afterDelete) await afterDelete(session.user, ctx.request);
	if (ctx.query.callbackURL) throw ctx.redirect(ctx.query.callbackURL || "/");
	return ctx.json({
		success: true,
		message: "User deleted"
	});
});
createAuthEndpoint("/change-email", {
	method: "POST",
	body: object({
		newEmail: email().meta({ description: "The new email address to set must be a valid email address" }),
		callbackURL: string().meta({ description: "The URL to redirect to after email verification" }).optional()
	}),
	use: [sensitiveSessionMiddleware],
	metadata: { openapi: {
		operationId: "changeEmail",
		responses: { "200": {
			description: "Email change request processed successfully",
			content: { "application/json": { schema: {
				type: "object",
				properties: {
					user: {
						type: "object",
						$ref: "#/components/schemas/User"
					},
					status: {
						type: "boolean",
						description: "Indicates if the request was successful"
					},
					message: {
						type: "string",
						enum: ["Email updated", "Verification email sent"],
						description: "Status message of the email change process",
						nullable: true
					}
				},
				required: ["status"]
			} } }
		} }
	} }
}, async (ctx) => {
	if (!ctx.context.options.user?.changeEmail?.enabled) {
		ctx.context.logger.error("Change email is disabled.");
		throw APIError.fromStatus("BAD_REQUEST", { message: "Change email is disabled" });
	}
	const newEmail = ctx.body.newEmail.toLowerCase();
	if (newEmail === ctx.context.session.user.email) {
		ctx.context.logger.error("Email is the same");
		throw APIError.fromStatus("BAD_REQUEST", { message: "Email is the same" });
	}
	/**
	* Early config check: ensure at least one email-change flow is
	* available for the current session state. Without this, an
	* existing-email lookup would return 200 while a non-existing
	* email would later throw 400, leaking email existence.
	*/
	const canUpdateWithoutVerification = ctx.context.session.user.emailVerified !== true && ctx.context.options.user.changeEmail.updateEmailWithoutVerification;
	const canSendConfirmation = ctx.context.session.user.emailVerified && ctx.context.options.user.changeEmail.sendChangeEmailConfirmation;
	const canSendVerification = ctx.context.options.emailVerification?.sendVerificationEmail;
	if (!canUpdateWithoutVerification && !canSendConfirmation && !canSendVerification) {
		ctx.context.logger.error("Verification email isn't enabled.");
		throw APIError.fromStatus("BAD_REQUEST", { message: "Verification email isn't enabled" });
	}
	if (await ctx.context.internalAdapter.findUserByEmail(newEmail)) {
		await createEmailVerificationToken(ctx.context.secret, ctx.context.session.user.email, newEmail, ctx.context.options.emailVerification?.expiresIn);
		ctx.context.logger.info("Change email attempt for existing email");
		return ctx.json({ status: true });
	}
	/**
	* If the email is not verified, we can update the email if the option is enabled
	*/
	if (canUpdateWithoutVerification) {
		await ctx.context.internalAdapter.updateUserByEmail(ctx.context.session.user.email, { email: newEmail });
		await setSessionCookie(ctx, {
			session: ctx.context.session.session,
			user: {
				...ctx.context.session.user,
				email: newEmail
			}
		});
		if (canSendVerification) {
			const token = await createEmailVerificationToken(ctx.context.secret, newEmail, void 0, ctx.context.options.emailVerification?.expiresIn);
			const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${ctx.body.callbackURL || "/"}`;
			await ctx.context.runInBackgroundOrAwait(canSendVerification({
				user: {
					...ctx.context.session.user,
					email: newEmail
				},
				url,
				token
			}, ctx.request));
		}
		return ctx.json({ status: true });
	}
	/**
	* If the email is verified, we need to send a verification email
	*/
	if (canSendConfirmation) {
		const token = await createEmailVerificationToken(ctx.context.secret, ctx.context.session.user.email, newEmail, ctx.context.options.emailVerification?.expiresIn, { requestType: "change-email-confirmation" });
		const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${ctx.body.callbackURL || "/"}`;
		await ctx.context.runInBackgroundOrAwait(canSendConfirmation({
			user: ctx.context.session.user,
			newEmail,
			url,
			token
		}, ctx.request));
		return ctx.json({ status: true });
	}
	if (!canSendVerification) {
		ctx.context.logger.error("Verification email isn't enabled.");
		throw APIError.fromStatus("BAD_REQUEST", { message: "Verification email isn't enabled" });
	}
	const token = await createEmailVerificationToken(ctx.context.secret, ctx.context.session.user.email, newEmail, ctx.context.options.emailVerification?.expiresIn, { requestType: "change-email-verification" });
	const url = `${ctx.context.baseURL}/verify-email?token=${token}&callbackURL=${ctx.body.callbackURL || "/"}`;
	await ctx.context.runInBackgroundOrAwait(canSendVerification({
		user: {
			...ctx.context.session.user,
			email: newEmail
		},
		url,
		token
	}, ctx.request));
	return ctx.json({ status: true });
});
object({
	payload: record(string(), any()),
	overrideOptions: record(string(), any()).optional()
});
object({
	token: string(),
	issuer: string().optional()
});
//#endregion
//#region node_modules/better-auth/dist/plugins/oidc-provider/schema.mjs
object({
	clientId: string(),
	clientSecret: string().optional(),
	type: _enum([
		"web",
		"native",
		"user-agent-based",
		"public"
	]),
	name: string(),
	icon: string().optional(),
	metadata: string().optional(),
	disabled: boolean$1().optional().default(false),
	redirectUrls: string(),
	userId: string().optional(),
	createdAt: date(),
	updatedAt: date()
});
object({
	accept: boolean$1(),
	consent_code: string().optional().nullish()
});
record(any(), any());
object({
	redirect_uris: array(string()).meta({ description: "A list of redirect URIs. Eg: [\"https://client.example.com/callback\"]" }),
	token_endpoint_auth_method: _enum([
		"none",
		"client_secret_basic",
		"client_secret_post"
	]).meta({ description: "The authentication method for the token endpoint. Eg: \"client_secret_basic\"" }).default("client_secret_basic").optional(),
	grant_types: array(_enum([
		"authorization_code",
		"implicit",
		"password",
		"client_credentials",
		"refresh_token",
		"urn:ietf:params:oauth:grant-type:jwt-bearer",
		"urn:ietf:params:oauth:grant-type:saml2-bearer"
	])).meta({ description: "The grant types supported by the application. Eg: [\"authorization_code\"]" }).default(["authorization_code"]).optional(),
	response_types: array(_enum(["code", "token"])).meta({ description: "The response types supported by the application. Eg: [\"code\"]" }).default(["code"]).optional(),
	client_name: string().meta({ description: "The name of the application. Eg: \"My App\"" }).optional(),
	client_uri: string().meta({ description: "The URI of the application. Eg: \"https://client.example.com\"" }).optional(),
	logo_uri: string().meta({ description: "The URI of the application logo. Eg: \"https://client.example.com/logo.png\"" }).optional(),
	scope: string().meta({ description: "The scopes supported by the application. Separated by spaces. Eg: \"profile email\"" }).optional(),
	contacts: array(string()).meta({ description: "The contact information for the application. Eg: [\"admin@example.com\"]" }).optional(),
	tos_uri: string().meta({ description: "The URI of the application terms of service. Eg: \"https://client.example.com/tos\"" }).optional(),
	policy_uri: string().meta({ description: "The URI of the application privacy policy. Eg: \"https://client.example.com/policy\"" }).optional(),
	jwks_uri: string().meta({ description: "The URI of the application JWKS. Eg: \"https://client.example.com/jwks\"" }).optional(),
	jwks: record(any(), any()).meta({ description: "The JWKS of the application. Eg: {\"keys\": [{\"kty\": \"RSA\", \"alg\": \"RS256\", \"use\": \"sig\", \"n\": \"...\", \"e\": \"...\"}]}" }).optional(),
	metadata: record(any(), any()).meta({ description: "The metadata of the application. Eg: {\"key\": \"value\"}" }).optional(),
	software_id: string().meta({ description: "The software ID of the application. Eg: \"my-software\"" }).optional(),
	software_version: string().meta({ description: "The software version of the application. Eg: \"1.0.0\"" }).optional(),
	software_statement: string().meta({ description: "The software statement of the application." }).optional()
});
//#endregion
//#region node_modules/@convex-dev/better-auth/dist/plugins/convex/index.js
var JWT_COOKIE_NAME = "convex_jwt";
//#endregion
//#region node_modules/@convex-dev/better-auth/dist/utils/index.js
var getToken = async (siteUrl, headers, opts) => {
	const fetchToken = async () => {
		const { data } = await betterFetch("/api/auth/convex/token", {
			baseURL: siteUrl,
			headers
		});
		return {
			isFresh: true,
			token: data?.token
		};
	};
	if (!opts?.jwtCache?.enabled || opts.forceRefresh) return await fetchToken();
	const token = getSessionCookie(new Headers(headers), {
		cookieName: JWT_COOKIE_NAME,
		cookiePrefix: opts?.cookiePrefix
	});
	if (!token) return await fetchToken();
	try {
		const exp = decodeJwt(token)?.exp;
		const now = Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3);
		if (!(exp ? now > exp + (opts?.jwtCache?.expirationToleranceSeconds ?? 60) : true)) return {
			isFresh: false,
			token
		};
	} catch (error) {
		console.error("Error decoding JWT", error);
	}
	return await fetchToken();
};
//#endregion
//#region node_modules/@convex-dev/better-auth/dist/react-start/index.js
var cache = import_react.cache || ((fn) => {
	return (...args) => fn(...args);
});
function setupClient(options) {
	const client = new ConvexHttpClient(options.convexUrl);
	if (options.token !== void 0) client.setAuth(options.token);
	client.setFetchOptions({ cache: "no-store" });
	return client;
}
var parseConvexSiteUrl = (url) => {
	if (!url) throw new Error(stripIndent`
      CONVEX_SITE_URL is not set.
      This is automatically set in the Convex backend, but must be set in the TanStack Start environment.
      For local development, this can be set in the .env.local file.
    `);
	if (url.endsWith(".convex.cloud")) throw new Error(stripIndent`
      CONVEX_SITE_URL should be set to your Convex Site URL, which ends in .convex.site.
      Currently set to ${url}.
    `);
	return url;
};
var handler = (request, opts) => {
	const requestUrl = new URL(request.url);
	const nextUrl = `${opts.convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;
	const headers = new Headers(request.headers);
	headers.set("accept-encoding", "application/json");
	headers.set("host", new URL(opts.convexSiteUrl).host);
	return fetch(nextUrl, {
		method: request.method,
		headers,
		redirect: "manual",
		body: request.body,
		duplex: "half"
	});
};
var convexBetterAuthReactStart = (opts) => {
	const siteUrl = parseConvexSiteUrl(opts.convexSiteUrl);
	const cachedGetToken = cache(async (opts) => {
		const { getRequestHeaders } = await import("../@tanstack/react-start+[...].mjs").then((n) => n.t);
		const headers = getRequestHeaders();
		const mutableHeaders = new Headers(headers);
		mutableHeaders.delete("content-length");
		mutableHeaders.delete("transfer-encoding");
		mutableHeaders.set("accept-encoding", "identity");
		return getToken(siteUrl, mutableHeaders, opts);
	});
	const callWithToken = async (fn) => {
		const token = await cachedGetToken(opts) ?? {};
		try {
			return await fn(token?.token);
		} catch (error) {
			if (!opts?.jwtCache?.enabled || token.isFresh || opts.jwtCache?.isAuthError(error)) throw error;
			return await fn((await cachedGetToken({
				...opts,
				forceRefresh: true
			})).token);
		}
	};
	return {
		getToken: async () => {
			return (await cachedGetToken(opts)).token;
		},
		handler: (request) => handler(request, opts),
		fetchAuthQuery: async (query, ...args) => {
			return callWithToken((token) => {
				return setupClient({
					...opts,
					token
				}).query(query, ...args);
			});
		},
		fetchAuthMutation: async (mutation, ...args) => {
			return callWithToken((token) => {
				return setupClient({
					...opts,
					token
				}).mutation(mutation, ...args);
			});
		},
		fetchAuthAction: async (action, ...args) => {
			return callWithToken((token) => {
				return setupClient({
					...opts,
					token
				}).action(action, ...args);
			});
		}
	};
};
//#endregion
//#region node_modules/convex/dist/esm/react/use_subscription.js
function useSubscription({ getCurrentValue, subscribe }) {
	const [state, setState] = (0, import_react.useState)(() => ({
		getCurrentValue,
		subscribe,
		value: getCurrentValue()
	}));
	let valueToReturn = state.value;
	if (state.getCurrentValue !== getCurrentValue || state.subscribe !== subscribe) {
		valueToReturn = getCurrentValue();
		setState({
			getCurrentValue,
			subscribe,
			value: valueToReturn
		});
	}
	(0, import_react.useEffect)(() => {
		let didUnsubscribe = false;
		const checkForUpdates = () => {
			if (didUnsubscribe) return;
			setState((prevState) => {
				if (prevState.getCurrentValue !== getCurrentValue || prevState.subscribe !== subscribe) return prevState;
				const value = getCurrentValue();
				if (prevState.value === value) return prevState;
				return {
					...prevState,
					value
				};
			});
		};
		const unsubscribe = subscribe(checkForUpdates);
		checkForUpdates();
		return () => {
			didUnsubscribe = true;
			unsubscribe();
		};
	}, [getCurrentValue, subscribe]);
	return valueToReturn;
}
//#endregion
//#region node_modules/convex/dist/esm/react/client.js
var __defProp$1 = Object.defineProperty;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField$1 = (obj, key, value) => __defNormalProp$1(obj, typeof key !== "symbol" ? key + "" : key, value);
var DEFAULT_EXTEND_SUBSCRIPTION_FOR = 5e3;
if (typeof import_react.default === "undefined") throw new Error("Required dependency 'react' not found");
function createMutation(mutationReference, client, update) {
	function mutation(args) {
		assertNotAccidentalArgument(args);
		return client.mutation(mutationReference, args, { optimisticUpdate: update });
	}
	mutation.withOptimisticUpdate = function withOptimisticUpdate(optimisticUpdate) {
		if (update !== void 0) throw new Error(`Already specified optimistic update for mutation ${getFunctionName(mutationReference)}`);
		return createMutation(mutationReference, client, optimisticUpdate);
	};
	return mutation;
}
function createAction(actionReference, client) {
	return function(args) {
		return client.action(actionReference, args);
	};
}
var ConvexReactClient = class {
	/**
	* @param address - The url of your Convex deployment, often provided
	* by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
	* @param options - See {@link ConvexReactClientOptions} for a full description.
	*/
	constructor(address, options) {
		__publicField$1(this, "address");
		__publicField$1(this, "cachedSync");
		__publicField$1(this, "cachedPaginatedQueryClient");
		__publicField$1(this, "listeners");
		__publicField$1(this, "options");
		__publicField$1(this, "closed", false);
		__publicField$1(this, "_logger");
		__publicField$1(this, "adminAuth");
		__publicField$1(this, "fakeUserIdentity");
		if (address === void 0) throw new Error("No address provided to ConvexReactClient.\nIf trying to deploy to production, make sure to follow all the instructions found at https://docs.convex.dev/production/hosting/\nIf running locally, make sure to run `convex dev` and ensure the .env.local file is populated.");
		if (typeof address !== "string") throw new Error(`ConvexReactClient requires a URL like 'https://happy-otter-123.convex.cloud', received something of type ${typeof address} instead.`);
		if (!address.includes("://")) throw new Error("Provided address was not an absolute URL.");
		this.address = address;
		this.listeners = /* @__PURE__ */ new Map();
		this._logger = options?.logger === false ? instantiateNoopLogger({ verbose: options?.verbose ?? false }) : options?.logger !== true && options?.logger ? options.logger : instantiateDefaultLogger({ verbose: options?.verbose ?? false });
		this.options = {
			...options,
			logger: this._logger
		};
	}
	/**
	* Return the address for this client, useful for creating a new client.
	*
	* Not guaranteed to match the address with which this client was constructed:
	* it may be canonicalized.
	*/
	get url() {
		return this.address;
	}
	/**
	* Lazily instantiate the `BaseConvexClient` so we don't create the WebSocket
	* when server-side rendering.
	*
	* @internal
	*/
	get sync() {
		if (this.closed) throw new Error("ConvexReactClient has already been closed.");
		if (this.cachedSync) return this.cachedSync;
		this.cachedSync = new BaseConvexClient(this.address, () => {}, this.options);
		if (this.adminAuth) this.cachedSync.setAdminAuth(this.adminAuth, this.fakeUserIdentity);
		this.cachedPaginatedQueryClient = new PaginatedQueryClient(this.cachedSync, (transition) => this.handleTransition(transition));
		return this.cachedSync;
	}
	/**
	* Lazily instantiate the `PaginatedQueryClient` so we don't create it
	* when server-side rendering.
	*
	* @internal
	*/
	get paginatedQueryClient() {
		this.sync;
		if (this.cachedPaginatedQueryClient) return this.cachedPaginatedQueryClient;
		throw new Error("Should already be instantiated");
	}
	/**
	* Set the authentication token to be used for subsequent queries and mutations.
	* `fetchToken` will be called automatically again if a token expires.
	* `fetchToken` should return `null` if the token cannot be retrieved, for example
	* when the user's rights were permanently revoked.
	* @param fetchToken - an async function returning the JWT-encoded OpenID Connect Identity Token
	* @param onChange - a callback that will be called when the authentication status changes
	* @param onRefreshChange - a callback called with `true` when the socket is paused to fetch a replacement token after a server rejection, and `false` when refresh completes
	*/
	setAuth(fetchToken, onChange, onRefreshChange) {
		if (typeof fetchToken === "string") throw new Error("Passing a string to ConvexReactClient.setAuth is no longer supported, please upgrade to passing in an async function to handle reauthentication.");
		this.sync.setAuth(fetchToken, onChange ?? (() => {}), onRefreshChange);
	}
	/**
	* Clear the current authentication token if set.
	*/
	clearAuth() {
		this.sync.clearAuth();
	}
	/**
	* @internal
	*/
	setAdminAuth(token, identity) {
		this.adminAuth = token;
		this.fakeUserIdentity = identity;
		if (this.closed) throw new Error("ConvexReactClient has already been closed.");
		if (this.cachedSync) this.sync.setAdminAuth(token, identity);
	}
	/**
	* Construct a new {@link Watch} on a Convex query function.
	*
	* **Most application code should not call this method directly. Instead use
	* the {@link useQuery} hook.**
	*
	* The act of creating a watch does nothing, a Watch is stateless.
	*
	* @param query - A {@link server.FunctionReference} for the public query to run.
	* @param args - An arguments object for the query. If this is omitted,
	* the arguments will be `{}`.
	* @param options - A {@link WatchQueryOptions} options object for this query.
	*
	* @returns The {@link Watch} object.
	*/
	watchQuery(query, ...argsAndOptions) {
		const [args, options] = argsAndOptions;
		const name = getFunctionName(query);
		return {
			onUpdate: (callback) => {
				const { queryToken, unsubscribe } = this.sync.subscribe(name, args, options);
				const currentListeners = this.listeners.get(queryToken);
				if (currentListeners !== void 0) currentListeners.add(callback);
				else this.listeners.set(queryToken, /* @__PURE__ */ new Set([callback]));
				return () => {
					if (this.closed) return;
					const currentListeners2 = this.listeners.get(queryToken);
					currentListeners2.delete(callback);
					if (currentListeners2.size === 0) this.listeners.delete(queryToken);
					unsubscribe();
				};
			},
			localQueryResult: () => {
				if (this.cachedSync) return this.cachedSync.localQueryResult(name, args);
			},
			localQueryLogs: () => {
				if (this.cachedSync) return this.cachedSync.localQueryLogs(name, args);
			},
			journal: () => {
				if (this.cachedSync) return this.cachedSync.queryJournal(name, args);
			}
		};
	}
	/**
	* Indicates likely future interest in a query subscription.
	*
	* The implementation currently immediately subscribes to a query. In the future this method
	* may prioritize some queries over others, fetch the query result without subscribing, or
	* do nothing in slow network connections or high load scenarios.
	*
	* To use this in a React component, call useQuery() and ignore the return value.
	*
	* @param queryOptions - A query (function reference from an api object) and its args, plus
	* an optional extendSubscriptionFor for how long to subscribe to the query.
	*/
	prewarmQuery(queryOptions) {
		const extendSubscriptionFor = queryOptions.extendSubscriptionFor ?? DEFAULT_EXTEND_SUBSCRIPTION_FOR;
		const unsubscribe = this.watchQuery(queryOptions.query, queryOptions.args || {}).onUpdate(() => {});
		setTimeout(unsubscribe, extendSubscriptionFor);
	}
	/**
	* Construct a new {@link PaginatedWatch} on a Convex paginated query function.
	*
	* **Most application code should not call this method directly. Instead use
	* the {@link usePaginatedQuery} hook.**
	*
	* The act of creating a watch does nothing, a Watch is stateless.
	*
	* @param query - A {@link server.FunctionReference} for the public query to run.
	* @param args - An arguments object for the query. If this is omitted,
	* the arguments will be `{}`.
	* @param options - A {@link WatchPaginatedQueryOptions} options object for this query.
	*
	* @returns The {@link PaginatedWatch} object.
	*
	* @internal
	*/
	watchPaginatedQuery(query, args, options) {
		const name = getFunctionName(query);
		return {
			onUpdate: (callback) => {
				const { paginatedQueryToken, unsubscribe } = this.paginatedQueryClient.subscribe(name, args || {}, options);
				const currentListeners = this.listeners.get(paginatedQueryToken);
				if (currentListeners !== void 0) currentListeners.add(callback);
				else this.listeners.set(paginatedQueryToken, /* @__PURE__ */ new Set([callback]));
				return () => {
					if (this.closed) return;
					const currentListeners2 = this.listeners.get(paginatedQueryToken);
					currentListeners2.delete(callback);
					if (currentListeners2.size === 0) this.listeners.delete(paginatedQueryToken);
					unsubscribe();
				};
			},
			localQueryResult: () => {
				return this.paginatedQueryClient.localQueryResult(name, args, options);
			}
		};
	}
	/**
	* Execute a mutation function.
	*
	* @param mutation - A {@link server.FunctionReference} for the public mutation
	* to run.
	* @param args - An arguments object for the mutation. If this is omitted,
	* the arguments will be `{}`.
	* @param options - A {@link MutationOptions} options object for the mutation.
	* @returns A promise of the mutation's result.
	*/
	mutation(mutation, ...argsAndOptions) {
		const [args, options] = argsAndOptions;
		const name = getFunctionName(mutation);
		return this.sync.mutation(name, args, options);
	}
	/**
	* Execute an action function.
	*
	* @param action - A {@link server.FunctionReference} for the public action
	* to run.
	* @param args - An arguments object for the action. If this is omitted,
	* the arguments will be `{}`.
	* @returns A promise of the action's result.
	*/
	action(action, ...args) {
		const name = getFunctionName(action);
		return this.sync.action(name, ...args);
	}
	/**
	* Fetch a query result once.
	*
	* **Most application code should subscribe to queries instead, using
	* the {@link useQuery} hook.**
	*
	* @param query - A {@link server.FunctionReference} for the public query
	* to run.
	* @param args - An arguments object for the query. If this is omitted,
	* the arguments will be `{}`.
	* @returns A promise of the query's result.
	*/
	query(query, ...args) {
		const watch = this.watchQuery(query, ...args);
		const existingResult = watch.localQueryResult();
		if (existingResult !== void 0) return Promise.resolve(existingResult);
		return new Promise((resolve, reject) => {
			const unsubscribe = watch.onUpdate(() => {
				unsubscribe();
				try {
					resolve(watch.localQueryResult());
				} catch (e) {
					reject(e);
				}
			});
		});
	}
	/**
	* Get the current {@link ConnectionState} between the client and the Convex
	* backend.
	*
	* @returns The {@link ConnectionState} with the Convex backend.
	*/
	connectionState() {
		return this.sync.connectionState();
	}
	/**
	* Subscribe to the {@link ConnectionState} between the client and the Convex
	* backend, calling a callback each time it changes.
	*
	* Subscribed callbacks will be called when any part of ConnectionState changes.
	* ConnectionState may grow in future versions (e.g. to provide a array of
	* inflight requests) in which case callbacks would be called more frequently.
	* ConnectionState may also *lose* properties in future versions as we figure
	* out what information is most useful. As such this API is considered unstable.
	*
	* @returns An unsubscribe function to stop listening.
	*/
	subscribeToConnectionState(cb) {
		return this.sync.subscribeToConnectionState(cb);
	}
	/**
	* Get the logger for this client.
	*
	* @returns The {@link Logger} for this client.
	*/
	get logger() {
		return this._logger;
	}
	/**
	* Close any network handles associated with this client and stop all subscriptions.
	*
	* Call this method when you're done with a {@link ConvexReactClient} to
	* dispose of its sockets and resources.
	*
	* @returns A `Promise` fulfilled when the connection has been completely closed.
	*/
	async close() {
		this.closed = true;
		this.listeners = /* @__PURE__ */ new Map();
		if (this.cachedPaginatedQueryClient) this.cachedPaginatedQueryClient = void 0;
		if (this.cachedSync) {
			const sync = this.cachedSync;
			this.cachedSync = void 0;
			await sync.close();
		}
	}
	/**
	* Handle transitions from both base client and paginated client.
	* This ensures all transitions are processed synchronously and in order.
	*/
	handleTransition(transition) {
		const simple = transition.queries.map((q) => q.token);
		const paginated = transition.paginatedQueries.map((q) => q.token);
		this.transition([...simple, ...paginated]);
	}
	transition(updatedQueries) {
		for (const queryToken of updatedQueries) {
			const callbacks = this.listeners.get(queryToken);
			if (callbacks) for (const callback of callbacks) callback();
		}
	}
};
var ConvexContext = import_react.createContext(void 0);
function useConvex() {
	return (0, import_react.useContext)(ConvexContext);
}
var ConvexProvider = ({ client, children }) => {
	return import_react.createElement(ConvexContext.Provider, { value: client }, children);
};
function useQuery(query, ...args) {
	const skip = args[0] === "skip";
	const argsObject = args[0] === "skip" ? {} : parseArgs(args[0]);
	const queryReference = typeof query === "string" ? makeFunctionReference(query) : query;
	const queryName = getFunctionName(queryReference);
	const result = useQueries((0, import_react.useMemo)(() => skip ? {} : { query: {
		query: queryReference,
		args: argsObject
	} }, [
		JSON.stringify(convexToJson(argsObject)),
		queryName,
		skip
	]))["query"];
	if (result instanceof Error) throw result;
	return result;
}
function useMutation(mutation) {
	const mutationReference = typeof mutation === "string" ? makeFunctionReference(mutation) : mutation;
	const convex = (0, import_react.useContext)(ConvexContext);
	if (convex === void 0) throw new Error("Could not find Convex client! `useMutation` must be used in the React component tree under `ConvexProvider`. Did you forget it? See https://docs.convex.dev/quick-start#set-up-convex-in-your-react-app");
	return (0, import_react.useMemo)(() => createMutation(mutationReference, convex), [convex, getFunctionName(mutationReference)]);
}
function useAction(action) {
	const convex = (0, import_react.useContext)(ConvexContext);
	const actionReference = typeof action === "string" ? makeFunctionReference(action) : action;
	if (convex === void 0) throw new Error("Could not find Convex client! `useAction` must be used in the React component tree under `ConvexProvider`. Did you forget it? See https://docs.convex.dev/quick-start#set-up-convex-in-your-react-app");
	return (0, import_react.useMemo)(() => createAction(actionReference, convex), [convex, getFunctionName(actionReference)]);
}
function assertNotAccidentalArgument(value) {
	if (typeof value === "object" && value !== null && "bubbles" in value && "persist" in value && "isDefaultPrevented" in value) throw new Error(`Convex function called with SyntheticEvent object. Did you use a Convex function as an event handler directly? Event handlers like onClick receive an event object as their first argument. These SyntheticEvent objects are not valid Convex values. Try wrapping the function like \`const handler = () => myMutation();\` and using \`handler\` in the event handler.`);
}
//#endregion
//#region node_modules/convex/dist/esm/react/queries_observer.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {
	enumerable: true,
	configurable: true,
	writable: true,
	value
}) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var QueriesObserver = class {
	constructor(createWatch) {
		__publicField(this, "createWatch");
		__publicField(this, "queries");
		__publicField(this, "listeners");
		this.createWatch = createWatch;
		this.queries = {};
		this.listeners = /* @__PURE__ */ new Set();
	}
	setQueries(newQueries) {
		for (const identifier of Object.keys(newQueries)) {
			const { query, args, paginationOptions } = newQueries[identifier];
			getFunctionName(query);
			if (this.queries[identifier] === void 0) this.addQuery(identifier, query, args, paginationOptions ? { paginationOptions } : {});
			else {
				const existingInfo = this.queries[identifier];
				if (getFunctionName(query) !== getFunctionName(existingInfo.query) || JSON.stringify(convexToJson(args)) !== JSON.stringify(convexToJson(existingInfo.args)) || JSON.stringify(paginationOptions) !== JSON.stringify(existingInfo.paginationOptions)) {
					this.removeQuery(identifier);
					this.addQuery(identifier, query, args, paginationOptions ? { paginationOptions } : {});
				}
			}
		}
		for (const identifier of Object.keys(this.queries)) if (newQueries[identifier] === void 0) this.removeQuery(identifier);
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
	getLocalResults(queries) {
		const result = {};
		for (const identifier of Object.keys(queries)) {
			const { query, args } = queries[identifier];
			const paginationOptions = queries[identifier].paginationOptions;
			getFunctionName(query);
			const watch = this.createWatch(query, args, paginationOptions ? { paginationOptions } : {});
			let value;
			try {
				value = watch.localQueryResult();
			} catch (e) {
				if (e instanceof Error) value = e;
				else throw e;
			}
			result[identifier] = value;
		}
		return result;
	}
	setCreateWatch(createWatch) {
		this.createWatch = createWatch;
		for (const identifier of Object.keys(this.queries)) {
			const { query, args, watch, paginationOptions } = this.queries[identifier];
			const journal = "journal" in watch ? watch.journal() : void 0;
			this.removeQuery(identifier);
			this.addQuery(identifier, query, args, {
				...journal ? { journal } : [],
				...paginationOptions ? { paginationOptions } : {}
			});
		}
	}
	destroy() {
		for (const identifier of Object.keys(this.queries)) this.removeQuery(identifier);
		this.listeners = /* @__PURE__ */ new Set();
	}
	addQuery(identifier, query, args, { paginationOptions, journal }) {
		if (this.queries[identifier] !== void 0) throw new Error(`Tried to add a new query with identifier ${identifier} when it already exists.`);
		const watch = this.createWatch(query, args, {
			...journal ? { journal } : [],
			...paginationOptions ? { paginationOptions } : {}
		});
		const unsubscribe = watch.onUpdate(() => this.notifyListeners());
		this.queries[identifier] = {
			query,
			args,
			watch,
			unsubscribe,
			...paginationOptions ? { paginationOptions } : {}
		};
	}
	removeQuery(identifier) {
		const info = this.queries[identifier];
		if (info === void 0) throw new Error(`No query found with identifier ${identifier}.`);
		info.unsubscribe();
		delete this.queries[identifier];
	}
	notifyListeners() {
		for (const listener of this.listeners) listener();
	}
};
//#endregion
//#region node_modules/convex/dist/esm/react/use_queries.js
function useQueries(queries) {
	const convex = useConvex();
	if (convex === void 0) throw new Error("Could not find Convex client! `useQuery` must be used in the React component tree under `ConvexProvider`. Did you forget it? See https://docs.convex.dev/quick-start#set-up-convex-in-your-react-app");
	return useQueriesHelper(queries, (0, import_react.useMemo)(() => {
		return (query, args, { journal, paginationOptions }) => {
			if (paginationOptions) return convex.watchPaginatedQuery(query, args, paginationOptions);
			else return convex.watchQuery(query, args, journal ? { journal } : {});
		};
	}, [convex]));
}
function useQueriesHelper(queries, createWatch) {
	const [observer] = (0, import_react.useState)(() => new QueriesObserver(createWatch));
	if (observer.createWatch !== createWatch) observer.setCreateWatch(createWatch);
	(0, import_react.useEffect)(() => () => observer.destroy(), [observer]);
	return useSubscription((0, import_react.useMemo)(() => ({
		getCurrentValue: () => {
			return observer.getLocalResults(queries);
		},
		subscribe: (callback) => {
			observer.setQueries(queries);
			return observer.subscribe(callback);
		}
	}), [observer, queries]));
}
//#endregion
//#region node_modules/convex/dist/esm/react/ConvexAuthState.js
var ConvexAuthContext = (0, import_react.createContext)(void 0);
function useConvexAuth() {
	const authContext = (0, import_react.useContext)(ConvexAuthContext);
	if (authContext === void 0) throw new Error("Could not find `ConvexProviderWithAuth` (or `ConvexProviderWithClerk` or `ConvexProviderWithAuth0`) as an ancestor component. This component may be missing, or you might have two instances of the `convex/react` module loaded in your project.");
	return authContext;
}
function ConvexProviderWithAuth({ children, client, useAuth }) {
	const { isLoading: authProviderLoading, isAuthenticated: authProviderAuthenticated, fetchAccessToken } = useAuth();
	const [isConvexAuthenticated, setIsConvexAuthenticated] = (0, import_react.useState)(null);
	const [isRefreshing, setIsRefreshing] = (0, import_react.useState)(false);
	if (authProviderLoading && isConvexAuthenticated !== null) {
		setIsConvexAuthenticated(null);
		setIsRefreshing(false);
	}
	if (!authProviderLoading && !authProviderAuthenticated && isConvexAuthenticated !== false) {
		setIsConvexAuthenticated(false);
		setIsRefreshing(false);
	}
	const isAuthenticated = authProviderAuthenticated && (isConvexAuthenticated ?? false);
	return /* @__PURE__ */ import_react.createElement(ConvexAuthContext.Provider, { value: {
		isLoading: isConvexAuthenticated === null,
		isAuthenticated,
		isRefreshing: isRefreshing && isAuthenticated
	} }, /* @__PURE__ */ import_react.createElement(ConvexAuthStateFirstEffect, {
		authProviderAuthenticated,
		fetchAccessToken,
		authProviderLoading,
		client,
		setIsConvexAuthenticated,
		setIsRefreshing
	}), /* @__PURE__ */ import_react.createElement(ConvexProvider, { client }, children), /* @__PURE__ */ import_react.createElement(ConvexAuthStateLastEffect, {
		authProviderAuthenticated,
		fetchAccessToken,
		authProviderLoading,
		client,
		setIsConvexAuthenticated,
		setIsRefreshing
	}));
}
function ConvexAuthStateFirstEffect({ authProviderAuthenticated, fetchAccessToken, authProviderLoading, client, setIsConvexAuthenticated, setIsRefreshing }) {
	(0, import_react.useEffect)(() => {
		let isThisEffectRelevant = true;
		if (authProviderAuthenticated) {
			client.setAuth(fetchAccessToken, (backendReportsIsAuthenticated) => {
				if (isThisEffectRelevant) setIsConvexAuthenticated(() => backendReportsIsAuthenticated);
			}, (isRefreshing) => {
				if (isThisEffectRelevant) setIsRefreshing(isRefreshing);
			});
			return () => {
				isThisEffectRelevant = false;
				setIsConvexAuthenticated((isConvexAuthenticated) => isConvexAuthenticated ? false : null);
				setIsRefreshing(false);
			};
		}
	}, [
		authProviderAuthenticated,
		fetchAccessToken,
		authProviderLoading,
		client,
		setIsConvexAuthenticated,
		setIsRefreshing
	]);
	return null;
}
function ConvexAuthStateLastEffect({ authProviderAuthenticated, fetchAccessToken, authProviderLoading, client, setIsConvexAuthenticated, setIsRefreshing }) {
	(0, import_react.useEffect)(() => {
		if (authProviderAuthenticated) return () => {
			client.clearAuth();
			setIsConvexAuthenticated(() => null);
			setIsRefreshing(false);
		};
	}, [
		authProviderAuthenticated,
		fetchAccessToken,
		authProviderLoading,
		client,
		setIsConvexAuthenticated,
		setIsRefreshing
	]);
	return null;
}
//#endregion
//#region node_modules/@convex-dev/better-auth/dist/plugins/convex/client.js
var convexClient = () => {
	return {
		id: "convex",
		$InferServerPlugin: {}
	};
};
//#endregion
//#region node_modules/@convex-dev/better-auth/dist/react/index.js
var import_jsx_runtime = require_jsx_runtime();
/**
* A wrapper React component which provides a {@link react.ConvexReactClient}
* authenticated with Better Auth.
*
* @public
*/
function ConvexBetterAuthProvider({ children, client, authClient, initialToken }) {
	const useBetterAuth = useUseAuthFromBetterAuth(authClient, initialToken);
	(0, import_react.useEffect)(() => {
		(async () => {
			if (typeof window === "undefined" || !window.location?.href) return;
			const url = new URL(window.location.href);
			const token = url.searchParams.get("ott");
			if (token) {
				const authClientWithCrossDomain = authClient;
				url.searchParams.delete("ott");
				window.history.replaceState({}, "", url);
				const session = (await authClientWithCrossDomain.crossDomain.oneTimeToken.verify({ token })).data?.session;
				if (session) {
					await authClient.getSession({ fetchOptions: { headers: { Authorization: `Bearer ${session.token}` } } });
					authClientWithCrossDomain.updateSession();
				}
			}
		})();
	}, [authClient]);
	return (0, import_jsx_runtime.jsx)(ConvexProviderWithAuth, {
		client,
		useAuth: useBetterAuth,
		children: (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children })
	});
}
var initialTokenUsed = false;
function useUseAuthFromBetterAuth(authClient, initialToken) {
	const [cachedToken, setCachedToken] = (0, import_react.useState)(initialTokenUsed ? null : initialToken ?? null);
	const pendingTokenRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!initialTokenUsed) initialTokenUsed = true;
	}, []);
	return (0, import_react.useMemo)(() => function useAuthFromBetterAuth() {
		const { data: session, isPending: isSessionPending } = authClient.useSession();
		const sessionId = session?.session?.id;
		(0, import_react.useEffect)(() => {
			if (!session && !isSessionPending && cachedToken) setCachedToken(null);
		}, [session, isSessionPending]);
		const fetchAccessToken = (0, import_react.useCallback)(async ({ forceRefreshToken = false } = {}) => {
			if (cachedToken && !forceRefreshToken) return cachedToken;
			if (!forceRefreshToken && pendingTokenRef.current) return pendingTokenRef.current;
			pendingTokenRef.current = authClient.convex.token({ fetchOptions: { throw: false } }).then(({ data }) => {
				const token = data?.token || null;
				setCachedToken(token);
				return token;
			}).catch(() => {
				setCachedToken(null);
				return null;
			}).finally(() => {
				pendingTokenRef.current = null;
			});
			return pendingTokenRef.current;
		}, [sessionId]);
		return (0, import_react.useMemo)(() => ({
			isLoading: isSessionPending && !cachedToken,
			isAuthenticated: Boolean(session?.session) || cachedToken !== null,
			fetchAccessToken
		}), [
			isSessionPending,
			sessionId,
			fetchAccessToken,
			cachedToken
		]);
	}, [authClient]);
}
//#endregion
export { require_jsx_runtime as S, getFunctionName as _, ConvexProvider as a, convexToJson as b, useConvex as c, convexBetterAuthReactStart as d, getToken as f, anyApi as g, ConvexHttpClient as h, useQueries as i, useMutation as l, getBaseURL as m, convexClient as n, ConvexReactClient as o, defu as p, useConvexAuth as r, useAction as s, ConvexBetterAuthProvider as t, useQuery as u, toReferencePath as v, require_react as x, ConvexError as y };
