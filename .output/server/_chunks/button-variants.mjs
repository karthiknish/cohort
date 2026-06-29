import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils.mjs";
import { T as pressableScaleClass, y as interactiveTransitionClass } from "./motion.mjs";
//#region src/shared/ui/button-variants.ts
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
//#endregion
export { buttonVariants as t };
