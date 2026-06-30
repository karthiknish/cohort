import * as React from 'react';
import { Select as SelectPrimitive } from '@base-ui/react/select';
import { Check, ChevronDown } from 'lucide-react';
import { interactiveTransitionClass, surfaceMotionClasses } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { menuItemHighlightClass } from '@/shared/ui/menu-highlight';

/**
 * Wrapper around Base UI's `Select.Root` that adapts `onValueChange` to the
 * simpler `(value: T) => void` signature (dropping the `null` and
 * `eventDetails` arguments). This keeps all 150+ call sites compatible.
 */
type SelectRootProps = Omit<
  React.ComponentPropsWithRef<typeof SelectPrimitive.Root>,
  'onValueChange'
> & {
  onValueChange?: (value: any) => void;
};

const Select = React.forwardRef<any, SelectRootProps>(
  ({ onValueChange, ...props }, ref) => (
    <SelectPrimitive.Root
      ref={ref}
      onValueChange={onValueChange ? ((value: any) => onValueChange(value)) as any : undefined}
      {...props as any}
    />
  ),
);
Select.displayName = 'Select';

const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

type SelectTriggerProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Trigger>;

const SelectTrigger = ({ className, children, ref, ...props }: SelectTriggerProps) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'focus-ring flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
      interactiveTransitionClass,
      className,
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon>
      <ChevronDown className="size-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
);
SelectTrigger.displayName = 'SelectTrigger';

type SelectContentProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Popup> & {
  position?: 'popper' | 'item-aligned';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
};

const SelectContent = ({ className, children, position = 'popper', align, sideOffset, side, ref, ...props }: SelectContentProps) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Positioner
      alignItemWithTrigger={position === 'item-aligned'}
      align={align}
      sideOffset={sideOffset}
      side={side}
      className="z-[3000]"
    >
      <SelectPrimitive.Popup
        ref={ref}
        className={cn(
          'relative min-w-[8rem] max-w-[28rem] w-[var(--anchor-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md',
          surfaceMotionClasses.popoverContent,
          className,
        )}
        {...props}
      >
        <SelectPrimitive.List className="max-h-[min(24rem,60vh)] overflow-y-auto p-1">{children}</SelectPrimitive.List>
      </SelectPrimitive.Popup>
    </SelectPrimitive.Positioner>
  </SelectPrimitive.Portal>
);
SelectContent.displayName = 'SelectContent';

type SelectLabelProps = React.ComponentPropsWithRef<typeof SelectPrimitive.GroupLabel>;

const SelectLabel = ({ className, ref, ...props }: SelectLabelProps) => (
  <SelectPrimitive.GroupLabel
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold text-muted-foreground', className)}
    {...props}
  />
);
SelectLabel.displayName = 'SelectLabel';

type SelectItemProps = React.ComponentPropsWithRef<typeof SelectPrimitive.Item> & {
  hideIndicator?: boolean;
};

const SelectItem = ({ className, children, hideIndicator = false, ref, ...props }: SelectItemProps) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      menuItemHighlightClass,
      'text-popover-foreground relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      hideIndicator ? 'pl-2' : 'pl-8',
      className,
    )}
    {...props}
  >
    {!hideIndicator && (
      <span className="absolute left-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
    )}
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);
SelectItem.displayName = 'SelectItem';

function SelectSeparator({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />;
}
SelectSeparator.displayName = 'SelectSeparator';

export { Select, SelectGroup, SelectTrigger, SelectValue, SelectContent, SelectLabel, SelectItem, SelectSeparator };
