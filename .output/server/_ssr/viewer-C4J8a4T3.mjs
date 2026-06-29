import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { t as Button } from "./button-BHcJlp0q.mjs";
import { a as CardHeader, o as CardTitle, r as CardDescription, t as Card } from "./card-CDBnK3ba.mjs";
import { Ur as ArrowLeft } from "../_libs/lucide-react.mjs";
import { t as Link$1 } from "./link-D4Easb0H.mjs";
import { t as Route } from "./viewer-RuFWxFAn.mjs";
import { t as DeckDocumentViewer } from "./deck-document-viewer-DYOkkoJk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/viewer-C4J8a4T3.js
var import_jsx_runtime = require_jsx_runtime();
function ProposalDeckViewerPageClient({ src = null }) {
	return !src ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "sm",
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link$1, {
				href: "/dashboard/proposals",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "mr-2 size-4" }), "Back to proposals"]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "border-destructive/40 bg-destructive/5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-destructive",
				children: "This deck isn't available"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
				className: "text-destructive/80",
				children: "Open a proposal from your dashboard and choose Preview to view the deck here."
			})] })
		})]
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeckDocumentViewer, {
		src,
		backHref: "/dashboard/proposals",
		backLabel: "Back to proposals",
		subtitle: "Interactive deck preview"
	});
}
function ProposalViewerRoute() {
	const { src } = Route.useSearch();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalDeckViewerPageClient, { src: src ?? null });
}
//#endregion
export { ProposalViewerRoute as component };
