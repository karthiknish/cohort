//#region src/lib/colors.ts
var SEMANTIC_SWATCHES = {
	success: {
		DEFAULT: "#16a34a",
		foreground: "#ffffff",
		border: "#15803d",
		light: "#22c55e",
		dark: "#15803d",
		bg: "#ecfdf5",
		text: "#065f46"
	},
	warning: {
		DEFAULT: "#f59e0b",
		foreground: "#78350f",
		border: "#d97706",
		light: "#fbbf24",
		bg: "#fffbeb",
		text: "#92400e"
	},
	info: {
		DEFAULT: "#3b82f6",
		foreground: "#ffffff",
		border: "#2563eb",
		light: "#60a5fa",
		bg: "#eff6ff",
		text: "#1e40af"
	}
};
SEMANTIC_SWATCHES.success, SEMANTIC_SWATCHES.warning, SEMANTIC_SWATCHES.info;
var GRAYS = {
	50: "#f9fafb",
	100: "#f3f4f6",
	200: "#e5e7eb",
	300: "#d1d5db",
	400: "#9ca3af",
	500: "#6b7280",
	600: "#4b5563",
	700: "#374151",
	800: "#1f2937",
	900: "#111827",
	950: "#0f172a"
};
var PROVIDER_COLORS = {
	google: {
		DEFAULT: "#4285F4",
		blue: "#4285F4",
		green: "#34A853",
		yellow: "#FBBC05",
		red: "#EA4335",
		analytics: {
			yellow: "#F9AB00",
			orange: "#E37400"
		}
	},
	facebook: "#1877F2",
	meta: "#0668E1",
	linkedin: "#0A66C2",
	tiktok: "#FE2C55"
};
var SEMANTIC_COLORS = {
	status: {
		active: SEMANTIC_SWATCHES.success.DEFAULT,
		inactive: "#6b7280",
		pending: SEMANTIC_SWATCHES.warning.DEFAULT,
		error: "#dc2626",
		success: SEMANTIC_SWATCHES.success.DEFAULT,
		warning: SEMANTIC_SWATCHES.warning.DEFAULT,
		info: SEMANTIC_SWATCHES.info.DEFAULT
	},
	priority: {
		low: "#3b82f6",
		medium: SEMANTIC_SWATCHES.warning.DEFAULT,
		high: "#f97316",
		critical: "#dc2626"
	},
	project: {
		planning: "#64748b",
		active: SEMANTIC_SWATCHES.success.DEFAULT,
		onHold: SEMANTIC_SWATCHES.warning.DEFAULT,
		completed: SEMANTIC_SWATCHES.info.DEFAULT
	},
	severity: {
		critical: "#dc2626",
		warning: SEMANTIC_SWATCHES.warning.DEFAULT,
		info: SEMANTIC_SWATCHES.info.DEFAULT
	}
};
var CHART_COLORS = {
	primary: [
		"#3b82f6",
		"#22c55e",
		"#f59e0b",
		"#8b5cf6",
		"#ec4899",
		"#10b981",
		"#06b6d4",
		"#f97316",
		"#84cc16",
		"#6366f1"
	],
	funnel: {
		impressions: "#3b82f6",
		clicks: "#8b5cf6",
		conversions: "#10b981",
		visitors: "#3b82f6",
		views: "#6366f1",
		cart: "#8b5cf6",
		checkout: "#a855f7",
		purchase: "#10b981"
	},
	metrics: {
		spend: "#ef4444",
		revenue: "#22c55e",
		roas: "#3b82f6",
		ctr: "#f59e0b",
		efficiency: "#8b5cf6",
		impressions: "#3b82f6",
		clicks: "#8b5cf6"
	},
	hsl: {
		emerald: "hsl(160 84% 39%)",
		red: "hsl(0 84% 60%)",
		indigo: "hsl(239 84% 67%)",
		amber: "hsl(38 92% 50%)",
		blue: "hsl(217 91% 60%)",
		facebook: "hsl(214 89% 52%)",
		pink: "hsl(339 80% 55%)",
		primary: "hsl(var(--primary))",
		destructive: "hsl(var(--destructive))"
	}
};
var EMAIL_COLORS = {
	background: "#f8fafc",
	canvasGlow: "#eef2ff",
	card: "#ffffff",
	muted: "#f8fafc",
	highlight: "#eef2ff",
	heading: "#0f172a",
	body: "#334155",
	subtle: "#64748b",
	mutedText: "#94a3b8",
	disabled: "#cbd5e1",
	border: "#e2e8f0",
	lightBorder: "#edf2f7",
	brand: {
		primary: "#2563eb",
		secondary: "#0ea5e9",
		foreground: "#ffffff",
		accent: "#3b82f6",
		accentSoft: "#dbeafe"
	},
	button: {
		primary: "#2563eb",
		dark: "#1d4ed8"
	},
	success: {
		bg: SEMANTIC_SWATCHES.success.bg,
		border: "#bbf7d0",
		text: SEMANTIC_SWATCHES.success.border,
		darkText: "#166534"
	},
	info: {
		bg: SEMANTIC_SWATCHES.info.bg,
		border: "#bfdbfe",
		text: SEMANTIC_SWATCHES.info.text,
		darkText: "#1e3a8a"
	},
	error: {
		bg: "#fef2f2",
		border: "#fecaca",
		text: "#dc2626",
		darkText: "#991b1b"
	},
	warning: {
		bg: SEMANTIC_SWATCHES.warning.bg,
		border: "#fde68a",
		text: SEMANTIC_SWATCHES.warning.text,
		darkText: "#92400e"
	}
};
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
function hexToRgba(hex, alpha) {
	const rgb = hexToRgb(hex);
	if (!rgb) return hex;
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}
function getStatusColor(status) {
	return {
		active: SEMANTIC_COLORS.status.active,
		inactive: SEMANTIC_COLORS.status.inactive,
		pending: SEMANTIC_COLORS.status.pending,
		error: SEMANTIC_COLORS.status.error,
		success: SEMANTIC_COLORS.status.success,
		warning: SEMANTIC_COLORS.status.warning,
		info: SEMANTIC_COLORS.status.info,
		planning: SEMANTIC_COLORS.project.planning,
		on_hold: SEMANTIC_COLORS.project.onHold,
		completed: SEMANTIC_COLORS.project.completed
	}[status.toLowerCase()] || GRAYS[500];
}
function getChartColor(index) {
	return CHART_COLORS.primary[index % CHART_COLORS.primary.length];
}
function getPriorityColor(priority) {
	return {
		low: SEMANTIC_COLORS.priority.low,
		medium: SEMANTIC_COLORS.priority.medium,
		high: SEMANTIC_COLORS.priority.high,
		critical: SEMANTIC_COLORS.priority.critical
	}[priority.toLowerCase()] || GRAYS[500];
}
function getSemanticBadgeStyle(color, alpha = .12) {
	return {
		backgroundColor: hexToRgba(color, alpha),
		borderColor: hexToRgba(color, alpha + .08),
		color
	};
}
//#endregion
export { SEMANTIC_COLORS as a, getSemanticBadgeStyle as c, PROVIDER_COLORS as i, getStatusColor as l, EMAIL_COLORS as n, getChartColor as o, GRAYS as r, getPriorityColor as s, CHART_COLORS as t };
