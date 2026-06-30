"use client";
import * as React from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { surfaceMotionClasses } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Wrapper around Base UI's `Tooltip.Provider` that accepts the legacy
 * `delayDuration` / `skipDelayDuration` props (Radix-style) and maps them
 * to Base UI's `delay` / `timeout` props.
 */
type TooltipProviderProps = Omit<React.ComponentPropsWithRef<typeof TooltipPrimitive.Provider>, 'delay' | 'timeout'> & {
  delayDuration?: number;
  skipDelayDuration?: number;
};

const TooltipProvider = ({ delayDuration, skipDelayDuration, ...props }: TooltipProviderProps) => (
  <TooltipPrimitive.Provider
    delay={delayDuration}
    timeout={skipDelayDuration}
    {...props}
  />
);
const Tooltip = TooltipPrimitive.Root;

type TooltipTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof TooltipPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
};

const TooltipTrigger = React.forwardRef<HTMLButtonElement, TooltipTriggerProps>(
  ({ asChild, children, render, ...props }, ref) => {
    const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
    if (renderProp) {
      return (
        <TooltipPrimitive.Trigger ref={ref as any} render={renderProp as any} {...props}>
          {asChild ? undefined : children}
        </TooltipPrimitive.Trigger>
      );
    }
    return (
      <TooltipPrimitive.Trigger ref={ref as any} {...props}>
        {children}
      </TooltipPrimitive.Trigger>
    );
  },
);
TooltipTrigger.displayName = "TooltipTrigger";

type TooltipContentProps = React.ComponentPropsWithRef<typeof TooltipPrimitive.Popup> & {
  sideOffset?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'start' | 'center' | 'end';
};

const TooltipContent = ({ className, sideOffset = 4, side = 'top', align = 'center', ref, ...props }: TooltipContentProps) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Positioner sideOffset={sideOffset} side={side} align={align}>
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          "z-[100] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
          surfaceMotionClasses.popoverContent,
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPrimitive.Portal>
);
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
