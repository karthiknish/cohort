import * as crypto from "node:crypto";
import { KeyObject, constants, createSecretKey } from "node:crypto";
import { Buffer as Buffer$1 } from "node:buffer";
import * as util from "node:util";
import { promisify } from "node:util";
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/buffer_utils.js
var encoder = new TextEncoder();
var decoder = new TextDecoder();
function concat(...buffers) {
	const size = buffers.reduce((acc, { length }) => acc + length, 0);
	const buf = new Uint8Array(size);
	let i = 0;
	for (const buffer of buffers) {
		buf.set(buffer, i);
		i += buffer.length;
	}
	return buf;
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/base64url.js
var encode = (input) => Buffer$1.from(input).toString("base64url");
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/util/errors.js
var JOSEError = class extends Error {
	static code = "ERR_JOSE_GENERIC";
	code = "ERR_JOSE_GENERIC";
	constructor(message, options) {
		super(message, options);
		this.name = this.constructor.name;
		Error.captureStackTrace?.(this, this.constructor);
	}
};
var JOSENotSupported = class extends JOSEError {
	static code = "ERR_JOSE_NOT_SUPPORTED";
	code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWSInvalid = class extends JOSEError {
	static code = "ERR_JWS_INVALID";
	code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
	static code = "ERR_JWT_INVALID";
	code = "ERR_JWT_INVALID";
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/is_key_object.js
var is_key_object_default = (obj) => util.types.isKeyObject(obj);
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/webcrypto.js
var webcrypto = crypto.webcrypto;
var isCryptoKey = (key) => util.types.isCryptoKey(key);
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/crypto_key.js
function unusable(name, prop = "algorithm.name") {
	return /* @__PURE__ */ new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
}
function isAlgorithm(algorithm, name) {
	return algorithm.name === name;
}
function getHashLength(hash) {
	return parseInt(hash.name.slice(4), 10);
}
function getNamedCurve$1(alg) {
	switch (alg) {
		case "ES256": return "P-256";
		case "ES384": return "P-384";
		case "ES512": return "P-521";
		default: throw new Error("unreachable");
	}
}
function checkUsage(key, usages) {
	if (usages.length && !usages.some((expected) => key.usages.includes(expected))) {
		let msg = "CryptoKey does not support this operation, its usages must include ";
		if (usages.length > 2) {
			const last = usages.pop();
			msg += `one of ${usages.join(", ")}, or ${last}.`;
		} else if (usages.length === 2) msg += `one of ${usages[0]} or ${usages[1]}.`;
		else msg += `${usages[0]}.`;
		throw new TypeError(msg);
	}
}
function checkSigCryptoKey(key, alg, ...usages) {
	switch (alg) {
		case "HS256":
		case "HS384":
		case "HS512": {
			if (!isAlgorithm(key.algorithm, "HMAC")) throw unusable("HMAC");
			const expected = parseInt(alg.slice(2), 10);
			if (getHashLength(key.algorithm.hash) !== expected) throw unusable(`SHA-${expected}`, "algorithm.hash");
			break;
		}
		case "RS256":
		case "RS384":
		case "RS512": {
			if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5")) throw unusable("RSASSA-PKCS1-v1_5");
			const expected = parseInt(alg.slice(2), 10);
			if (getHashLength(key.algorithm.hash) !== expected) throw unusable(`SHA-${expected}`, "algorithm.hash");
			break;
		}
		case "PS256":
		case "PS384":
		case "PS512": {
			if (!isAlgorithm(key.algorithm, "RSA-PSS")) throw unusable("RSA-PSS");
			const expected = parseInt(alg.slice(2), 10);
			if (getHashLength(key.algorithm.hash) !== expected) throw unusable(`SHA-${expected}`, "algorithm.hash");
			break;
		}
		case "EdDSA":
			if (key.algorithm.name !== "Ed25519" && key.algorithm.name !== "Ed448") throw unusable("Ed25519 or Ed448");
			break;
		case "Ed25519":
			if (!isAlgorithm(key.algorithm, "Ed25519")) throw unusable("Ed25519");
			break;
		case "ES256":
		case "ES384":
		case "ES512": {
			if (!isAlgorithm(key.algorithm, "ECDSA")) throw unusable("ECDSA");
			const expected = getNamedCurve$1(alg);
			if (key.algorithm.namedCurve !== expected) throw unusable(expected, "algorithm.namedCurve");
			break;
		}
		default: throw new TypeError("CryptoKey does not support this operation");
	}
	checkUsage(key, usages);
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/invalid_key_input.js
function message(msg, actual, ...types) {
	types = types.filter(Boolean);
	if (types.length > 2) {
		const last = types.pop();
		msg += `one of type ${types.join(", ")}, or ${last}.`;
	} else if (types.length === 2) msg += `one of type ${types[0]} or ${types[1]}.`;
	else msg += `of type ${types[0]}.`;
	if (actual == null) msg += ` Received ${actual}`;
	else if (typeof actual === "function" && actual.name) msg += ` Received function ${actual.name}`;
	else if (typeof actual === "object" && actual != null) {
		if (actual.constructor?.name) msg += ` Received an instance of ${actual.constructor.name}`;
	}
	return msg;
}
var invalid_key_input_default = (actual, ...types) => {
	return message("Key must be ", actual, ...types);
};
function withAlg(alg, actual, ...types) {
	return message(`Key for the ${alg} algorithm must be `, actual, ...types);
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/is_key_like.js
var is_key_like_default = (key) => is_key_object_default(key) || isCryptoKey(key);
var types = ["KeyObject"];
if (globalThis.CryptoKey || webcrypto?.CryptoKey) types.push("CryptoKey");
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/is_disjoint.js
var isDisjoint = (...headers) => {
	const sources = headers.filter(Boolean);
	if (sources.length === 0 || sources.length === 1) return true;
	let acc;
	for (const header of sources) {
		const parameters = Object.keys(header);
		if (!acc || acc.size === 0) {
			acc = new Set(parameters);
			continue;
		}
		for (const parameter of parameters) {
			if (acc.has(parameter)) return false;
			acc.add(parameter);
		}
	}
	return true;
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/is_object.js
function isObjectLike(value) {
	return typeof value === "object" && value !== null;
}
function isObject(input) {
	if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") return false;
	if (Object.getPrototypeOf(input) === null) return true;
	let proto = input;
	while (Object.getPrototypeOf(proto) !== null) proto = Object.getPrototypeOf(proto);
	return Object.getPrototypeOf(input) === proto;
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/is_jwk.js
function isJWK(key) {
	return isObject(key) && typeof key.kty === "string";
}
function isPrivateJWK(key) {
	return key.kty !== "oct" && typeof key.d === "string";
}
function isPublicJWK(key) {
	return key.kty !== "oct" && typeof key.d === "undefined";
}
function isSecretJWK(key) {
	return isJWK(key) && key.kty === "oct" && typeof key.k === "string";
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/get_named_curve.js
var namedCurveToJOSE = (namedCurve) => {
	switch (namedCurve) {
		case "prime256v1": return "P-256";
		case "secp384r1": return "P-384";
		case "secp521r1": return "P-521";
		case "secp256k1": return "secp256k1";
		default: throw new JOSENotSupported("Unsupported key curve for this operation");
	}
};
var getNamedCurve = (kee, raw) => {
	let key;
	if (isCryptoKey(kee)) key = KeyObject.from(kee);
	else if (is_key_object_default(kee)) key = kee;
	else if (isJWK(kee)) return kee.crv;
	else throw new TypeError(invalid_key_input_default(kee, ...types));
	if (key.type === "secret") throw new TypeError("only \"private\" or \"public\" type keys can be used for this operation");
	switch (key.asymmetricKeyType) {
		case "ed25519":
		case "ed448": return `Ed${key.asymmetricKeyType.slice(2)}`;
		case "x25519":
		case "x448": return `X${key.asymmetricKeyType.slice(1)}`;
		case "ec": {
			const namedCurve = key.asymmetricKeyDetails.namedCurve;
			if (raw) return namedCurve;
			return namedCurveToJOSE(namedCurve);
		}
		default: throw new TypeError("Invalid asymmetric key type for this operation");
	}
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/check_key_length.js
var check_key_length_default = (key, alg) => {
	let modulusLength;
	try {
		if (key instanceof KeyObject) modulusLength = key.asymmetricKeyDetails?.modulusLength;
		else modulusLength = Buffer.from(key.n, "base64url").byteLength << 3;
	} catch {}
	if (typeof modulusLength !== "number" || modulusLength < 2048) throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/check_key_type.js
var tag = (key) => key?.[Symbol.toStringTag];
var jwkMatchesOp = (alg, key, usage) => {
	if (key.use !== void 0 && key.use !== "sig") throw new TypeError("Invalid key for this operation, when present its use must be sig");
	if (key.key_ops !== void 0 && key.key_ops.includes?.(usage) !== true) throw new TypeError(`Invalid key for this operation, when present its key_ops must include ${usage}`);
	if (key.alg !== void 0 && key.alg !== alg) throw new TypeError(`Invalid key for this operation, when present its alg must be ${alg}`);
	return true;
};
var symmetricTypeCheck = (alg, key, usage, allowJwk) => {
	if (key instanceof Uint8Array) return;
	if (allowJwk && isJWK(key)) {
		if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage)) return;
		throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
	}
	if (!is_key_like_default(key)) throw new TypeError(withAlg(alg, key, ...types, "Uint8Array", allowJwk ? "JSON Web Key" : null));
	if (key.type !== "secret") throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
};
var asymmetricTypeCheck = (alg, key, usage, allowJwk) => {
	if (allowJwk && isJWK(key)) switch (usage) {
		case "sign":
			if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage)) return;
			throw new TypeError(`JSON Web Key for this operation be a private JWK`);
		case "verify":
			if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage)) return;
			throw new TypeError(`JSON Web Key for this operation be a public JWK`);
	}
	if (!is_key_like_default(key)) throw new TypeError(withAlg(alg, key, ...types, allowJwk ? "JSON Web Key" : null));
	if (key.type === "secret") throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
	if (usage === "sign" && key.type === "public") throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
	if (usage === "decrypt" && key.type === "public") throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
	if (key.algorithm && usage === "verify" && key.type === "private") throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
	if (key.algorithm && usage === "encrypt" && key.type === "private") throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
};
function checkKeyType(allowJwk, alg, key, usage) {
	if (alg.startsWith("HS") || alg === "dir" || alg.startsWith("PBES2") || /^A\d{3}(?:GCM)?KW$/.test(alg)) symmetricTypeCheck(alg, key, usage, allowJwk);
	else asymmetricTypeCheck(alg, key, usage, allowJwk);
}
checkKeyType.bind(void 0, false);
var checkKeyTypeWithJwk = checkKeyType.bind(void 0, true);
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
	if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) throw new Err("\"crit\" (Critical) Header Parameter MUST be integrity protected");
	if (!protectedHeader || protectedHeader.crit === void 0) return /* @__PURE__ */ new Set();
	if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) throw new Err("\"crit\" (Critical) Header Parameter MUST be an array of non-empty strings when present");
	let recognized;
	if (recognizedOption !== void 0) recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
	else recognized = recognizedDefault;
	for (const parameter of protectedHeader.crit) {
		if (!recognized.has(parameter)) throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
		if (joseHeader[parameter] === void 0) throw new Err(`Extension Header Parameter "${parameter}" is missing`);
		if (recognized.get(parameter) && protectedHeader[parameter] === void 0) throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
	}
	return new Set(protectedHeader.crit);
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/dsa_digest.js
function dsaDigest(alg) {
	switch (alg) {
		case "PS256":
		case "RS256":
		case "ES256":
		case "ES256K": return "sha256";
		case "PS384":
		case "RS384":
		case "ES384": return "sha384";
		case "PS512":
		case "RS512":
		case "ES512": return "sha512";
		case "Ed25519":
		case "EdDSA": return;
		default: throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
	}
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/node_key.js
var ecCurveAlgMap = new Map([
	["ES256", "P-256"],
	["ES256K", "secp256k1"],
	["ES384", "P-384"],
	["ES512", "P-521"]
]);
function keyForCrypto(alg, key) {
	let asymmetricKeyType;
	let asymmetricKeyDetails;
	let isJWK;
	if (key instanceof KeyObject) {
		asymmetricKeyType = key.asymmetricKeyType;
		asymmetricKeyDetails = key.asymmetricKeyDetails;
	} else {
		isJWK = true;
		switch (key.kty) {
			case "RSA":
				asymmetricKeyType = "rsa";
				break;
			case "EC":
				asymmetricKeyType = "ec";
				break;
			case "OKP":
				if (key.crv === "Ed25519") {
					asymmetricKeyType = "ed25519";
					break;
				}
				if (key.crv === "Ed448") {
					asymmetricKeyType = "ed448";
					break;
				}
				throw new TypeError("Invalid key for this operation, its crv must be Ed25519 or Ed448");
			default: throw new TypeError("Invalid key for this operation, its kty must be RSA, OKP, or EC");
		}
	}
	let options;
	switch (alg) {
		case "Ed25519":
			if (asymmetricKeyType !== "ed25519") throw new TypeError(`Invalid key for this operation, its asymmetricKeyType must be ed25519`);
			break;
		case "EdDSA":
			if (!["ed25519", "ed448"].includes(asymmetricKeyType)) throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be ed25519 or ed448");
			break;
		case "RS256":
		case "RS384":
		case "RS512":
			if (asymmetricKeyType !== "rsa") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be rsa");
			check_key_length_default(key, alg);
			break;
		case "PS256":
		case "PS384":
		case "PS512":
			if (asymmetricKeyType === "rsa-pss") {
				const { hashAlgorithm, mgf1HashAlgorithm, saltLength } = asymmetricKeyDetails;
				const length = parseInt(alg.slice(-3), 10);
				if (hashAlgorithm !== void 0 && (hashAlgorithm !== `sha${length}` || mgf1HashAlgorithm !== hashAlgorithm)) throw new TypeError(`Invalid key for this operation, its RSA-PSS parameters do not meet the requirements of "alg" ${alg}`);
				if (saltLength !== void 0 && saltLength > length >> 3) throw new TypeError(`Invalid key for this operation, its RSA-PSS parameter saltLength does not meet the requirements of "alg" ${alg}`);
			} else if (asymmetricKeyType !== "rsa") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be rsa or rsa-pss");
			check_key_length_default(key, alg);
			options = {
				padding: constants.RSA_PKCS1_PSS_PADDING,
				saltLength: constants.RSA_PSS_SALTLEN_DIGEST
			};
			break;
		case "ES256":
		case "ES256K":
		case "ES384":
		case "ES512": {
			if (asymmetricKeyType !== "ec") throw new TypeError("Invalid key for this operation, its asymmetricKeyType must be ec");
			const actual = getNamedCurve(key);
			const expected = ecCurveAlgMap.get(alg);
			if (actual !== expected) throw new TypeError(`Invalid key curve for the algorithm, its curve must be ${expected}, got ${actual}`);
			options = { dsaEncoding: "ieee-p1363" };
			break;
		}
		default: throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
	}
	if (isJWK) return {
		format: "jwk",
		key,
		...options
	};
	return options ? {
		...options,
		key
	} : key;
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/hmac_digest.js
function hmacDigest(alg) {
	switch (alg) {
		case "HS256": return "sha256";
		case "HS384": return "sha384";
		case "HS512": return "sha512";
		default: throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
	}
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/get_sign_verify_key.js
function getSignVerifyKey(alg, key, usage) {
	if (key instanceof Uint8Array) {
		if (!alg.startsWith("HS")) throw new TypeError(invalid_key_input_default(key, ...types));
		return createSecretKey(key);
	}
	if (key instanceof KeyObject) return key;
	if (isCryptoKey(key)) {
		checkSigCryptoKey(key, alg, usage);
		return KeyObject.from(key);
	}
	if (isJWK(key)) {
		if (alg.startsWith("HS")) return createSecretKey(Buffer.from(key.k, "base64url"));
		return key;
	}
	throw new TypeError(invalid_key_input_default(key, ...types, "Uint8Array", "JSON Web Key"));
}
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/runtime/sign.js
var oneShotSign = promisify(crypto.sign);
var sign = async (alg, key, data) => {
	const k = getSignVerifyKey(alg, key, "sign");
	if (alg.startsWith("HS")) {
		const hmac = crypto.createHmac(hmacDigest(alg), k);
		hmac.update(data);
		return hmac.digest();
	}
	return oneShotSign(dsaDigest(alg), data, keyForCrypto(alg, k));
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/epoch.js
var epoch_default = (date) => Math.floor(date.getTime() / 1e3);
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/lib/secs.js
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
var secs_default = (str) => {
	const matched = REGEX.exec(str);
	if (!matched || matched[4] && matched[1]) throw new TypeError("Invalid time period format");
	const value = parseFloat(matched[2]);
	const unit = matched[3].toLowerCase();
	let numericDate;
	switch (unit) {
		case "sec":
		case "secs":
		case "second":
		case "seconds":
		case "s":
			numericDate = Math.round(value);
			break;
		case "minute":
		case "minutes":
		case "min":
		case "mins":
		case "m":
			numericDate = Math.round(value * minute);
			break;
		case "hour":
		case "hours":
		case "hr":
		case "hrs":
		case "h":
			numericDate = Math.round(value * hour);
			break;
		case "day":
		case "days":
		case "d":
			numericDate = Math.round(value * day);
			break;
		case "week":
		case "weeks":
		case "w":
			numericDate = Math.round(value * week);
			break;
		default:
			numericDate = Math.round(value * year);
			break;
	}
	if (matched[1] === "-" || matched[4] === "ago") return -numericDate;
	return numericDate;
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/jws/flattened/sign.js
var FlattenedSign = class {
	_payload;
	_protectedHeader;
	_unprotectedHeader;
	constructor(payload) {
		if (!(payload instanceof Uint8Array)) throw new TypeError("payload must be an instance of Uint8Array");
		this._payload = payload;
	}
	setProtectedHeader(protectedHeader) {
		if (this._protectedHeader) throw new TypeError("setProtectedHeader can only be called once");
		this._protectedHeader = protectedHeader;
		return this;
	}
	setUnprotectedHeader(unprotectedHeader) {
		if (this._unprotectedHeader) throw new TypeError("setUnprotectedHeader can only be called once");
		this._unprotectedHeader = unprotectedHeader;
		return this;
	}
	async sign(key, options) {
		if (!this._protectedHeader && !this._unprotectedHeader) throw new JWSInvalid("either setProtectedHeader or setUnprotectedHeader must be called before #sign()");
		if (!isDisjoint(this._protectedHeader, this._unprotectedHeader)) throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
		const joseHeader = {
			...this._protectedHeader,
			...this._unprotectedHeader
		};
		const extensions = validateCrit(JWSInvalid, new Map([["b64", true]]), options?.crit, this._protectedHeader, joseHeader);
		let b64 = true;
		if (extensions.has("b64")) {
			b64 = this._protectedHeader.b64;
			if (typeof b64 !== "boolean") throw new JWSInvalid("The \"b64\" (base64url-encode payload) Header Parameter must be a boolean");
		}
		const { alg } = joseHeader;
		if (typeof alg !== "string" || !alg) throw new JWSInvalid("JWS \"alg\" (Algorithm) Header Parameter missing or invalid");
		checkKeyTypeWithJwk(alg, key, "sign");
		let payload = this._payload;
		if (b64) payload = encoder.encode(encode(payload));
		let protectedHeader;
		if (this._protectedHeader) protectedHeader = encoder.encode(encode(JSON.stringify(this._protectedHeader)));
		else protectedHeader = encoder.encode("");
		const jws = {
			signature: encode(await sign(alg, key, concat(protectedHeader, encoder.encode("."), payload))),
			payload: ""
		};
		if (b64) jws.payload = decoder.decode(payload);
		if (this._unprotectedHeader) jws.header = this._unprotectedHeader;
		if (this._protectedHeader) jws.protected = decoder.decode(protectedHeader);
		return jws;
	}
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/jws/compact/sign.js
var CompactSign = class {
	_flattened;
	constructor(payload) {
		this._flattened = new FlattenedSign(payload);
	}
	setProtectedHeader(protectedHeader) {
		this._flattened.setProtectedHeader(protectedHeader);
		return this;
	}
	async sign(key, options) {
		const jws = await this._flattened.sign(key, options);
		if (jws.payload === void 0) throw new TypeError("use the flattened module for creating JWS with b64: false");
		return `${jws.protected}.${jws.payload}.${jws.signature}`;
	}
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/jwt/produce.js
function validateInput(label, input) {
	if (!Number.isFinite(input)) throw new TypeError(`Invalid ${label} input`);
	return input;
}
var ProduceJWT = class {
	_payload;
	constructor(payload = {}) {
		if (!isObject(payload)) throw new TypeError("JWT Claims Set MUST be an object");
		this._payload = payload;
	}
	setIssuer(issuer) {
		this._payload = {
			...this._payload,
			iss: issuer
		};
		return this;
	}
	setSubject(subject) {
		this._payload = {
			...this._payload,
			sub: subject
		};
		return this;
	}
	setAudience(audience) {
		this._payload = {
			...this._payload,
			aud: audience
		};
		return this;
	}
	setJti(jwtId) {
		this._payload = {
			...this._payload,
			jti: jwtId
		};
		return this;
	}
	setNotBefore(input) {
		if (typeof input === "number") this._payload = {
			...this._payload,
			nbf: validateInput("setNotBefore", input)
		};
		else if (input instanceof Date) this._payload = {
			...this._payload,
			nbf: validateInput("setNotBefore", epoch_default(input))
		};
		else this._payload = {
			...this._payload,
			nbf: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input)
		};
		return this;
	}
	setExpirationTime(input) {
		if (typeof input === "number") this._payload = {
			...this._payload,
			exp: validateInput("setExpirationTime", input)
		};
		else if (input instanceof Date) this._payload = {
			...this._payload,
			exp: validateInput("setExpirationTime", epoch_default(input))
		};
		else this._payload = {
			...this._payload,
			exp: epoch_default(/* @__PURE__ */ new Date()) + secs_default(input)
		};
		return this;
	}
	setIssuedAt(input) {
		if (typeof input === "undefined") this._payload = {
			...this._payload,
			iat: epoch_default(/* @__PURE__ */ new Date())
		};
		else if (input instanceof Date) this._payload = {
			...this._payload,
			iat: validateInput("setIssuedAt", epoch_default(input))
		};
		else if (typeof input === "string") this._payload = {
			...this._payload,
			iat: validateInput("setIssuedAt", epoch_default(/* @__PURE__ */ new Date()) + secs_default(input))
		};
		else this._payload = {
			...this._payload,
			iat: validateInput("setIssuedAt", input)
		};
		return this;
	}
};
//#endregion
//#region node_modules/livekit-server-sdk/node_modules/jose/dist/node/esm/jwt/sign.js
var SignJWT = class extends ProduceJWT {
	_protectedHeader;
	setProtectedHeader(protectedHeader) {
		this._protectedHeader = protectedHeader;
		return this;
	}
	async sign(key, options) {
		const sig = new CompactSign(encoder.encode(JSON.stringify(this._payload)));
		sig.setProtectedHeader(this._protectedHeader);
		if (Array.isArray(this._protectedHeader?.crit) && this._protectedHeader.crit.includes("b64") && this._protectedHeader.b64 === false) throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
		return sig.sign(key, options);
	}
};
//#endregion
export { SignJWT as t };
