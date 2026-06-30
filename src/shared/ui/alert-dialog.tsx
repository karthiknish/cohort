'use client';
import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import { surfaceMotionClasses } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/shared/ui/button-variants';
import { resolveNativeButton } from '@/shared/ui/base-ui-utils';

const AlertDialog = AlertDialogPrimitive.Root;

type AlertDialogTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
  nativeButton?: boolean;
};

function AlertDialogTrigger({ asChild, children, render, nativeButton, ...props }: AlertDialogTriggerProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    const resolved = resolveNativeButton(renderProp as React.ReactElement, { nativeButton });
    return (
      <AlertDialogPrimitive.Trigger nativeButton={resolved} render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </AlertDialogPrimitive.Trigger>
    );
  }
  return <AlertDialogPrimitive.Trigger {...props}>{children}</AlertDialogPrimitive.Trigger>;
}

const AlertDialogPortal = AlertDialogPrimitive.Portal;

type AlertDialogOverlayProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Backdrop>;

const AlertDialogOverlay = ({ className, ref, ...props }: AlertDialogOverlayProps) => (
  <AlertDialogPrimitive.Backdrop
    className={cn('fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm', surfaceMotionClasses.overlay, className)}
    {...props}
    ref={ref}
  />
);
AlertDialogOverlay.displayName = 'AlertDialogOverlay';

type AlertDialogContentProps = React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Popup>;

const AlertDialogContent = ({ className, ref, ...props }: AlertDialogContentProps) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Popup
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-[1100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg',
        surfaceMotionClasses.modalContent,
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
);
AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);
AlertDialogHeader.displayName = 'AlertDialogHeader';

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
AlertDialogFooter.displayName = 'AlertDialogFooter';

const AlertDialogTitle = ({ className, ref, ...props }: React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Title>) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
);
AlertDialogTitle.displayName = 'AlertDialogTitle';

const AlertDialogDescription = ({ className, ref, ...props }: React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Description>) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
);
AlertDialogDescription.displayName = 'AlertDialogDescription';

type AlertDialogActionProps = Omit<
  React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Close>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
};

const AlertDialogAction = ({ className, ref, asChild, render, children, ...props }: AlertDialogActionProps) => {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    return (
      <AlertDialogPrimitive.Close
        ref={ref}
        render={renderProp as any}
        className={cn(buttonVariants(), className)}
        {...props}
      >
        {asChild ? undefined : children}
      </AlertDialogPrimitive.Close>
    );
  }
  return (
    <AlertDialogPrimitive.Close ref={ref} className={cn(buttonVariants(), className)} {...props}>
      {children}
    </AlertDialogPrimitive.Close>
  );
};
AlertDialogAction.displayName = 'AlertDialogAction';

type AlertDialogCancelProps = Omit<
  React.ComponentPropsWithRef<typeof AlertDialogPrimitive.Close>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
};

const AlertDialogCancel = ({ className, ref, asChild, render, children, ...props }: AlertDialogCancelProps) => {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    return (
      <AlertDialogPrimitive.Close
        ref={ref}
        render={renderProp as any}
        className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
        {...props}
      >
        {asChild ? undefined : children}
      </AlertDialogPrimitive.Close>
    );
  }
  return (
    <AlertDialogPrimitive.Close
      ref={ref}
      className={cn(buttonVariants({ variant: 'outline' }), 'mt-2 sm:mt-0', className)}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Close>
  );
};
AlertDialogCancel.displayName = 'AlertDialogCancel';

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
