"use client";
import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { useHaptics } from "@/shared/lib/haptics";
import { toggleVariants } from "@/shared/ui/toggle-variants";
function Toggle({ className, variant, size, onPressedChange, ...props }: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
    const haptics = useHaptics();
    return (<TogglePrimitive.Root data-slot="toggle" className={cn(toggleVariants({ variant, size, className }))} onPressedChange={(pressed) => { haptics.selection(); onPressedChange?.(pressed); }} {...props}/>);
}
export { Toggle };
