import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import * as React from 'react';
import { interactiveTransitionClass, surfaceMotionClasses } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { resolveNativeButton } from '@/shared/ui/base-ui-utils';

const Dialog = DialogPrimitive.Root;

type DialogTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
  nativeButton?: boolean;
};

function DialogTrigger({ asChild, children, render, nativeButton, ...props }: DialogTriggerProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    const resolved = resolveNativeButton(renderProp as React.ReactElement, { nativeButton });
    return (
      <DialogPrimitive.Trigger nativeButton={resolved} render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </DialogPrimitive.Trigger>
    );
  }
  return <DialogPrimitive.Trigger {...props}>{children}</DialogPrimitive.Trigger>;
}

const DialogPortal = DialogPrimitive.Portal;

type DialogCloseProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Close>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
};

function DialogClose({ asChild, children, render, nativeButton, ...props }: DialogCloseProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    const resolved = resolveNativeButton(renderProp as React.ReactElement, { nativeButton });
    return (
      <DialogPrimitive.Close nativeButton={resolved} render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </DialogPrimitive.Close>
    );
  }
  return <DialogPrimitive.Close {...props}>{children}</DialogPrimitive.Close>;
}

type DialogContentProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Popup>,
  | 'onOpenAutoFocus'
  | 'onCloseAutoFocus'
  | 'onInteractOutside'
  | 'onPointerDownOutside'
> & {
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: Event) => void;
};

function DialogContent({ className, children, ref, onOpenAutoFocus: _oaf, onCloseAutoFocus: _caf, onInteractOutside: _oio, onPointerDownOutside: _opdo, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogPrimitive.Backdrop
        className={cn('fixed inset-0 z-[1100] bg-background/80 backdrop-blur-sm', surfaceMotionClasses.overlay)}
      />
      <DialogPrimitive.Popup
        ref={ref}
        className={cn(
          'focus-ring fixed left-1/2 top-1/2 z-[1100] grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-background p-6 shadow-lg sm:rounded-xl max-h-[85vh] overflow-y-auto',
          surfaceMotionClasses.modalContent,
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={cn('focus-ring absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100', interactiveTransitionClass)}
        >
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Popup>
    </DialogPortal>
  );
}
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = ({ className, ref, ...props }: React.ComponentPropsWithRef<typeof DialogPrimitive.Title>) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
);
DialogTitle.displayName = 'DialogTitle';

type DialogDescriptionProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Description>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
};

const DialogDescription = ({ className, ref, asChild, children, render, ...props }: DialogDescriptionProps) => {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    return (
      <DialogPrimitive.Description
        ref={ref}
        render={renderProp as any}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      >
        {asChild ? undefined : children}
      </DialogPrimitive.Description>
    );
  }
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Description>
  );
};
DialogDescription.displayName = 'DialogDescription';

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose };
