import "../_runtime.mjs";
import { S as require_jsx_runtime, x as require_react } from "../_libs/@convex-dev/better-auth+[...].mjs";
import { i as Slot } from "../_libs/@radix-ui/react-avatar+[...].mjs";
import { c as cn } from "./utils-hh4sibN0.mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { b as pressableScaleClass, p as interactiveTransitionClass } from "./motion-Cf6ujF0h.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/button-variants-_j-9V2rC.js
/** Opaque hover fills — avoid `/80` on colored buttons over light cards (washes out + white text). */
var hoverPrimaryBg = "hover:bg-[color-mix(in_srgb,var(--primary)_88%,#0f172a_12%)]";
var buttonVariants = cva([
	"focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
	interactiveTransitionClass,
	pressableScaleClass
].join(" "), {
	variants: {
		variant: {
			default: cn("bg-primary text-primary-foreground border border-border shadow-sm hover:shadow-md", hoverPrimaryBg),
			destructive: cn("bg-destructive text-destructive-foreground focus-visible:ring-destructive/20 shadow-sm", "hover:bg-[color-mix(in_srgb,var(--destructive)_88%,#0f172a_12%)]"),
			outline: "border border-border bg-background text-foreground shadow-xs hover:border-primary/30 hover:bg-primary/10 hover:text-foreground",
			secondary: cn("bg-secondary text-secondary-foreground shadow-sm", "hover:bg-[color-mix(in_srgb,var(--secondary)_88%,#0f172a_12%)]"),
			ghost: "text-foreground hover:bg-muted hover:text-foreground",
			link: "text-primary underline-offset-4 hover:underline",
			success: cn("bg-primary text-primary-foreground border border-border shadow-sm hover:shadow-md focus-visible:ring-primary/20", hoverPrimaryBg)
		},
		size: {
			default: "h-9 px-4 py-2 has-[>svg]:px-3",
			sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
			lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
			icon: "size-9",
			"icon-sm": "size-9",
			"icon-lg": "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
require_react();
var import_jsx_runtime = require_jsx_runtime();
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
//#endregion
export { buttonVariants as n, Button as t };
