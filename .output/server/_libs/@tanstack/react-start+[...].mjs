import { r as __exportAll } from "../../_runtime.mjs";
import { AsyncLocalStorage } from "node:async_hooks";
//#region node_modules/@tanstack/start-server-core/dist/esm/request-response.js
var GLOBAL_EVENT_STORAGE_KEY = Symbol.for("tanstack-start:event-storage");
var globalObj = globalThis;
if (!globalObj[GLOBAL_EVENT_STORAGE_KEY]) globalObj[GLOBAL_EVENT_STORAGE_KEY] = new AsyncLocalStorage();
var eventStorage = globalObj[GLOBAL_EVENT_STORAGE_KEY];
function getH3Event() {
	const event = eventStorage.getStore();
	if (!event) throw new Error(`No StartEvent found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
	return event.h3Event;
}
function getRequest() {
	return getH3Event().req;
}
function getRequestHeaders() {
	return getH3Event().req.headers;
}
function getRequestHeader(name) {
	return getRequestHeaders().get(name) || void 0;
}
//#endregion
//#region node_modules/@tanstack/react-start/dist/esm/server.js
var server_exports = /* @__PURE__ */ __exportAll({
	getRequest: () => getRequest,
	getRequestHeader: () => getRequestHeader,
	getRequestHeaders: () => getRequestHeaders
});
//#endregion
export { getRequest as n, server_exports as t };
