'use client';
import * as React from 'react';
import { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
import { Check, ChevronRight, Circle } from 'lucide-react';
import { interactiveTransitionClass, surfaceMotionClasses } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { menuItemHighlightClass } from '@/shared/ui/menu-highlight';
import { resolveNativeButton } from '@/shared/ui/base-ui-utils';

function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

type ContextMenuTriggerProps = Omit<
  React.ComponentPropsWithRef<typeof ContextMenuPrimitive.Trigger>,
  'render'
> & {
  asChild?: boolean;
  render?: React.ReactElement | ((props: any, state: any) => React.ReactNode);
  nativeButton?: boolean;
};

function ContextMenuTrigger({ asChild, children, render, nativeButton: _nativeButton, ...props }: ContextMenuTriggerProps) {
  const renderProp = render ?? (asChild && React.isValidElement(children) ? children : undefined);
  if (renderProp) {
    return (
      <ContextMenuPrimitive.Trigger render={renderProp as any} {...props}>
        {asChild ? undefined : children}
      </ContextMenuPrimitive.Trigger>
    );
  }
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props}>{children}</ContextMenuPrimitive.Trigger>;
}

function ContextMenuGroup({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />;
}

function ContextMenuPortal({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />;
}

function ContextMenuSub({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuRoot>) {
  return <ContextMenuPrimitive.SubmenuRoot data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />;
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubmenuTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubmenuTrigger
      data-slot="context-menu-sub-trigger"
      className={cn(
        menuItemHighlightClass,
        'text-popover-foreground flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[state=open]:bg-muted data-[state=open]:text-foreground',
        inset && 'pl-8',
        interactiveTransitionClass,
        className,
      )}
      {...props}
    >
      {children}
      <ChevronRight className="ml-auto size-4" />
    </ContextMenuPrimitive.SubmenuTrigger>
  );
}

function ContextMenuSubContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Popup>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Positioner sideOffset={4}>
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-sub-content"
          className={cn(
            'z-[1200] min-w-[8rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg',
            surfaceMotionClasses.popoverContent,
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuContent({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Popup>) {
  return (
    <ContextMenuPortal>
      <ContextMenuPrimitive.Positioner sideOffset={4}>
        <ContextMenuPrimitive.Popup
          data-slot="context-menu-content"
          className={cn(
            'z-[1200] max-h-[min(24rem,70dvh)] min-w-[8rem] overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md',
            surfaceMotionClasses.popoverContent,
            className,
          )}
          {...props}
        />
      </ContextMenuPrimitive.Positioner>
    </ContextMenuPortal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = 'default',
  onSelect,
  onClick,
  ...props
}: Omit<React.ComponentProps<typeof ContextMenuPrimitive.Item>, 'render' | 'onSelect'> & {
  inset?: boolean;
  variant?: 'default' | 'destructive';
  onSelect?: (event: Event) => void;
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      onClick={(onClick ?? onSelect) as any}
      className={cn(
        menuItemHighlightClass,
        'text-popover-foreground relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        inset && 'pl-8',
        variant === 'destructive' &&
          'text-destructive focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive',
        interactiveTransitionClass,
        className,
      )}
      {...props}
    />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        menuItemHighlightClass,
        'text-popover-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        interactiveTransitionClass,
        className,
      )}
      checked={checked}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.CheckboxItemIndicator>
          <Check className="size-4" />
        </ContextMenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        menuItemHighlightClass,
        'text-popover-foreground relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        interactiveTransitionClass,
        className,
      )}
      {...props}
    >
      <span className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.RadioItemIndicator>
          <Circle className="size-2 fill-current" />
        </ContextMenuPrimitive.RadioItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.GroupLabel> & { inset?: boolean }) {
  // Base UI's GroupLabel requires a parent Menu.Group context.
  return (
    <ContextMenuPrimitive.Group>
      <ContextMenuPrimitive.GroupLabel
        data-slot="context-menu-label"
        className={cn('px-2 py-1.5 text-xs font-semibold text-foreground', inset && 'pl-8', className)}
        {...props}
      />
    </ContextMenuPrimitive.Group>
  );
}

function ContextMenuSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="context-menu-separator" className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />;
}

function ContextMenuShortcut({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span data-slot="context-menu-shortcut" className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
};
