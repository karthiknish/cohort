import { cva, type VariantProps } from 'class-variance-authority';
import { interactiveTransitionClass } from '@/lib/motion';
export const badgeVariants = cva([
    "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive overflow-hidden select-none",
    interactiveTransitionClass,
].join(' '), {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-[color-mix(in_srgb,var(--primary)_88%,#0f172a_12%)] shadow-sm",
            secondary: "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-[color-mix(in_srgb,var(--secondary)_88%,#0f172a_12%)]",
            destructive: "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-[color-mix(in_srgb,var(--destructive)_88%,#0f172a_12%)] focus-visible:ring-destructive/20",
            outline: "text-foreground border-muted-foreground/30 [a&]:hover:bg-muted [a&]:hover:text-foreground",
            success: "border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/15",
            warning: "border-transparent bg-warning text-warning-foreground [a&]:hover:bg-[color-mix(in_srgb,var(--warning)_92%,#0f172a_8%)]",
            info: "border-transparent bg-info text-info-foreground [a&]:hover:bg-[color-mix(in_srgb,var(--info)_88%,#0f172a_12%)]",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
export type BadgeVariantProps = VariantProps<typeof badgeVariants>;
