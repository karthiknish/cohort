"use client";
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { interactiveTransitionClass } from "@/lib/motion";
import { cn } from "@/lib/utils";
export { AvatarImage } from "./avatar-image";
export { AvatarFallback } from "./avatar-fallback";
function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
    return (<AvatarPrimitive.Root data-slot="avatar" className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", interactiveTransitionClass, className)} {...props}/>);
}
export { Avatar };
