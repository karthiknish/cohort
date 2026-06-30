'use client';
import * as React from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';
import { resolveNativeButton } from '@/shared/ui/base-ui-utils';

type HoverCardTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof PreviewCardPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
  openDelay?: number;
  closeDelay?: number;
  nativeButton?: boolean;
};

function HoverCardTrigger({ asChild, children, render, openDelay = 200, closeDelay = 100, nativeButton: _nativeButton, ...props }: HoverCardTriggerProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    return (
      <PreviewCardPrimitive.Trigger render={renderProp as any} delay={openDelay} closeDelay={closeDelay} {...props}>
        {asChild ? undefined : children}
      </PreviewCardPrimitive.Trigger>
    );
  }
  return (
    <PreviewCardPrimitive.Trigger data-slot="hover-card-trigger" delay={openDelay} closeDelay={closeDelay} {...props}>
      {children}
    </PreviewCardPrimitive.Trigger>
  );
}

export { HoverCardTrigger };
