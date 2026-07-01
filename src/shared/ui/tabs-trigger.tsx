import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { interactiveTransitionClass } from '@/lib/motion';
import { useHaptics } from '@/shared/lib/haptics';
import { cn } from '@/lib/utils';

type TabsTriggerProps = React.ComponentPropsWithRef<typeof TabsPrimitive.Tab>;

const TabsTrigger = ({ className, ref, onPointerDown, ...props }: TabsTriggerProps) => {
  const haptics = useHaptics();
  return (
    <TabsPrimitive.Tab
      ref={ref}
      onPointerDown={(e) => { haptics.selection(); onPointerDown?.(e); }}
      className={cn(
        'focus-ring-subtle inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow',
        interactiveTransitionClass,
        className,
      )}
      {...props}
    />
  );
};
TabsTrigger.displayName = 'TabsTrigger';

export { TabsTrigger };
