"use client";
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { switchMotionClass } from "@/lib/motion";
import { useHaptics } from "@/shared/lib/haptics";
import { cn } from "@/lib/utils";
type SwitchProps = React.ComponentPropsWithRef<typeof SwitchPrimitives.Root>;
const Switch = ({ className, ref, onCheckedChange, ...props }: SwitchProps) => {
    const haptics = useHaptics();
    return (<SwitchPrimitives.Root className={cn("focus-ring-subtle peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", switchMotionClass, className)} onCheckedChange={(checked) => { haptics.selection(); onCheckedChange?.(checked); }} {...props} ref={ref}>
        <SwitchPrimitives.Thumb className={cn("pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0", switchMotionClass)}/>
    </SwitchPrimitives.Root>);
};
Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };
