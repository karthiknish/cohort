import { S as require_jsx_runtime } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { On as FileX, Sr as ChartColumn, cr as CircleAlert, x as TrendingUp } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils.mjs";
import { t as Button } from "./button.mjs";
//#region src/shared/ui/analytics-empty-state.tsx
var import_jsx_runtime = require_jsx_runtime();
var variantConfig = {
	"no-data": {
		defaultIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileX, { className: "size-10" }),
		defaultTitle: "No Data Available",
		defaultDescription: "There is no data to display for the current selection."
	},
	"no-filters": {
		defaultIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-10" }),
		defaultTitle: "No Matching Data",
		defaultDescription: "Try adjusting your filters to see results."
	},
	"no-integration": {
		defaultIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "size-10" }),
		defaultTitle: "Connect Your Account",
		defaultDescription: "Connect your ad platform to start seeing analytics data."
	},
	"no-metrics": {
		defaultIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-10" }),
		defaultTitle: "Metrics Not Available",
		defaultDescription: "The requested metrics are not available for this platform."
	},
	"error": {
		defaultIcon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-10" }),
		defaultTitle: "Unable to Load Data",
		defaultDescription: "There was a problem loading the analytics data."
	}
};
function createConnectAction(onConnect, platform) {
	if (!onConnect) return;
	return {
		label: `Connect ${platform || "Account"}`,
		onClick: onConnect
	};
}
function AnalyticsEmptyState({ variant = "no-data", title, description, icon, action, className }) {
	const config = variantConfig[variant];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col items-center justify-center py-12 px-4 text-center", className),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-16 items-center justify-center rounded-full bg-muted mb-4 text-muted-foreground",
				children: icon || config.defaultIcon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold mb-2",
				children: title || config.defaultTitle
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground max-w-sm mb-4",
				children: description || config.defaultDescription
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				onClick: action.onClick,
				children: action.label
			})
		]
	});
}
function NoInsightsData({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsEmptyState, {
		variant: "no-filters",
		title: "No Insights Available",
		description: "No specific optimizations identified for the current data set. Try adjusting your filters or time period.",
		className
	});
}
function NoIntegrationConnected({ onConnect, platform, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnalyticsEmptyState, {
		variant: "no-integration",
		title: `Connect Your ${platform || "Ad"} Account`,
		description: `Connect your ${platform || "ad platform"} account to start seeing performance data and insights.`,
		action: createConnectAction(onConnect, platform),
		className
	});
}
//#endregion
export { NoInsightsData as n, NoIntegrationConnected as r, AnalyticsEmptyState as t };
