import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-C56hVplk.js
var import_jsx_runtime = require_jsx_runtime();
/* @__NO_SIDE_EFFECTS__ */
function createMock(name) {
	const fn = function() {};
	fn.prototype.name = name;
	const children = Object.create(null);
	const proxy = new Proxy(fn, {
		get(_target, prop) {
			if (prop === "__esModule") return true;
			if (prop === "default") return proxy;
			if (prop === "caller") return null;
			if (prop === "then") return (f) => Promise.resolve(f(proxy));
			if (prop === "catch") return () => Promise.resolve(proxy);
			if (prop === "finally") return (f) => {
				f();
				return Promise.resolve(proxy);
			};
			if (prop === Symbol.toPrimitive) return () => {
				return "[import-protection mock]";
			};
			if (prop === "toString" || prop === "valueOf" || prop === "toJSON") return () => {
				return "[import-protection mock]";
			};
			if (typeof prop === "symbol") return void 0;
			if (!(prop in children)) children[prop] = /* @__PURE__ */ createMock(name + "." + prop);
			return children[prop];
		},
		apply() {
			return /* @__PURE__ */ createMock(name + "()");
		},
		construct() {
			return /* @__PURE__ */ createMock("new " + name);
		}
	});
	return proxy;
}
var mock = /* @__PURE__ */ createMock("mock");
function HomePage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(mock, {});
}
//#endregion
export { HomePage as component };
