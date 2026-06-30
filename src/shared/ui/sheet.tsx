"use client";
import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import { interactiveTransitionClass, surfaceMotionClasses } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { resolveNativeButton } from "@/shared/ui/base-ui-utils";

function Sheet({ modal = true, ...props }: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="sheet" modal={modal} {...props} />;
}

type SheetTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
  nativeButton?: boolean;
};

function SheetTrigger({ asChild, children, render, nativeButton, ...props }: SheetTriggerProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    const resolved = resolveNativeButton(renderProp as React.ReactElement, { nativeButton });
    return (
      <DialogPrimitive.Trigger nativeButton={resolved} render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </DialogPrimitive.Trigger>
    );
  }
  return <DialogPrimitive.Trigger data-slot="sheet-trigger" {...props}>{children}</DialogPrimitive.Trigger>;
}

type SheetCloseProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Close>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
};

function SheetClose({ asChild, children, render, ...props }: SheetCloseProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    return (
      <DialogPrimitive.Close render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </DialogPrimitive.Close>
    );
  }
  return <DialogPrimitive.Close data-slot="sheet-close" {...props}>{children}</DialogPrimitive.Close>;
}

function SheetPortal({ ...props }: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn("fixed inset-0 z-[1500] bg-black/50", surfaceMotionClasses.overlay, className)}
      {...props}
    />
  );
}

type SheetContentProps = Omit<
  React.ComponentProps<typeof DialogPrimitive.Popup>,
  'onOpenAutoFocus' | 'onCloseAutoFocus' | 'onInteractOutside' | 'onPointerDownOutside'
> & {
  side?: "top" | "right" | "bottom" | "left";
  showOverlay?: boolean;
  overlayClassName?: string;
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: Event) => void;
};

function SheetContent({ className, children, side = "right", showOverlay = true, overlayClassName, onOpenAutoFocus: _oaf, onCloseAutoFocus: _caf, onInteractOutside: _oio, onPointerDownOutside: _opdo, ...props }: SheetContentProps) {
  return (
    <SheetPortal>
      {showOverlay ? <SheetOverlay className={overlayClassName} /> : null}
      <DialogPrimitive.Popup
        data-slot="sheet-content"
        className={cn(
          "bg-background fixed z-[1500] flex flex-col gap-4 shadow-lg",
          surfaceMotionClasses.sheetContent,
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn(
            "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
            interactiveTransitionClass,
          )}
        >
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 p-4", className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="sheet-title" className={cn("text-foreground font-semibold", className)} {...props} />;
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description data-slot="sheet-description" className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription };
