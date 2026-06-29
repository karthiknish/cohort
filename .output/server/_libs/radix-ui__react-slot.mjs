import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "./@convex-dev/better-auth+[...].mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var SLOTTABLE_IDENTIFIER = Symbol("radix.slottable");
// @__NO_SIDE_EFFECTS__
function createSlottable(ownerName) {
	const Slottable2 = ({ children }) => {
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	};
	Slottable2.displayName = `${ownerName}.Slottable`;
	Slottable2.__radixId = SLOTTABLE_IDENTIFIER;
	return Slottable2;
}
//#endregion
export { createSlottable as t };
