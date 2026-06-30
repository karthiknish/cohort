"use client";
import * as React from "react";
import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import { surfaceMotionClasses } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { resolveNativeButton } from "@/shared/ui/base-ui-utils";

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

type PopoverTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof PopoverPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
  nativeButton?: boolean;
};

function PopoverTrigger({ asChild, children, render, nativeButton, ...props }: PopoverTriggerProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    const resolved = resolveNativeButton(renderProp as React.ReactElement, { nativeButton });
    return (
      <PopoverPrimitive.Trigger nativeButton={resolved} render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </PopoverPrimitive.Trigger>
    );
  }
  return <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> & {
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner align={align} sideOffset={sideOffset}>
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground z-[3000] w-72 rounded-md border p-4 shadow-md outline-hidden",
            surfaceMotionClasses.popoverContent,
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

type PopoverAnchorProps = Omit<
  React.ComponentPropsWithRef<typeof PopoverPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
};

function PopoverAnchor({ asChild, children, ...props }: PopoverAnchorProps) {
  // Base UI doesn't have a separate Anchor — use Trigger with render
  const renderProp = asChild && React.isValidElement(children) ? children : undefined;
  if (renderProp) {
    return (
      <PopoverPrimitive.Trigger render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </PopoverPrimitive.Trigger>
    );
  }
  return <PopoverPrimitive.Trigger {...props}>{children}</PopoverPrimitive.Trigger>;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
