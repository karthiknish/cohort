'use client';

import * as React from 'react';
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
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
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = DialogPrimitive.Backdrop;

type DialogContentProps = Omit<
  React.ComponentPropsWithRef<typeof DialogPrimitive.Popup>,
  'onOpenAutoFocus' | 'onCloseAutoFocus' | 'onInteractOutside' | 'onPointerDownOutside'
> & {
  onOpenAutoFocus?: (event: Event) => void;
  onCloseAutoFocus?: (event: Event) => void;
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: Event) => void;
};

const DialogContent = ({ onOpenAutoFocus: _oaf, onCloseAutoFocus: _caf, onInteractOutside: _oio, onPointerDownOutside: _opdo, ...props }: DialogContentProps) => (
  <DialogPrimitive.Popup {...props} />
);
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogClose,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
};
