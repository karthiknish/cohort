import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from '@/lib/utils';

type TabsListProps = React.ComponentPropsWithRef<typeof TabsPrimitive.List>;

const TabsList = ({ className, ref, ...props }: TabsListProps) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-foreground/70', className)}
    {...props}
  />
);
TabsList.displayName = 'TabsList';

export { TabsList };
