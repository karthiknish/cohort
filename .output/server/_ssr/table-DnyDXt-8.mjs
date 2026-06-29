import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { D as tableRowHoverClass } from "./motion-Cf6ujF0h.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
var Table = ({ className, wrapperClassName, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("relative w-full overflow-auto", wrapperClassName),
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("table", {
		ref,
		className: cn("w-full caption-bottom text-sm", className),
		...props
	})
});
Table.displayName = "Table";
var TableHeader = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
	ref,
	className: cn("[&_tr]:border-b", className),
	...props
});
TableHeader.displayName = "TableHeader";
var TableBody = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
	ref,
	className: cn("[&_tr:last-child]:border-0", className),
	...props
});
TableBody.displayName = "TableBody";
var TableFooter = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", {
	ref,
	className: cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className),
	...props
});
TableFooter.displayName = "TableFooter";
var TableRow = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
	ref,
	className: cn("border-b hover:bg-muted/50 data-[state=selected]:bg-muted", tableRowHoverClass, className),
	...props
});
TableRow.displayName = "TableRow";
var TableHead = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
	ref,
	className: cn("h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0", className),
	...props
});
TableHead.displayName = "TableHead";
var TableCell = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
	ref,
	className: cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className),
	...props
});
TableCell.displayName = "TableCell";
var TableCaption = ({ className, ref, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
	ref,
	className: cn("mt-4 text-sm text-muted-foreground", className),
	...props
});
TableCaption.displayName = "TableCaption";
//#endregion
export { TableHead as a, TableCell as i, TableBody as n, TableHeader as o, TableCaption as r, TableRow as s, Table as t };
