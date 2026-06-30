'use client';
import * as React from 'react';
import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { cn } from '@/lib/utils';
import { resolveNativeButton } from '@/shared/ui/base-ui-utils';

const Collapsible = CollapsiblePrimitive.Root;

type CollapsibleTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof CollapsiblePrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
  nativeButton?: boolean;
};

function CollapsibleTrigger({ asChild, children, render, nativeButton, ...props }: CollapsibleTriggerProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    const resolved = resolveNativeButton(renderProp as React.ReactElement, { nativeButton });
    return (
      <CollapsiblePrimitive.Trigger nativeButton={resolved} render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </CollapsiblePrimitive.Trigger>
    );
  }
  return <CollapsiblePrimitive.Trigger {...props}>{children}</CollapsiblePrimitive.Trigger>;
}

type CollapsibleContentProps = React.ComponentPropsWithRef<typeof CollapsiblePrimitive.Panel>;

const CollapsibleContent = ({ className, children, ref, ...props }: CollapsibleContentProps) => (
  <CollapsiblePrimitive.Panel
    ref={ref}
    className={cn('overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down', className)}
    {...props}
  >
    {children}
  </CollapsiblePrimitive.Panel>
);
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
