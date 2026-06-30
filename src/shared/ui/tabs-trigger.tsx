import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { interactiveTransitionClass } from '@/lib/motion';
import { cn } from '@/lib/utils';
type TabsTriggerProps = React.ComponentPropsWithRef<typeof TabsPrimitive.Trigger>;
const TabsTrigger = ({ className, ref, ...props }: TabsTriggerProps) => (<TabsPrimitive.Trigger ref={ref} className={cn('focus-ring-subtle inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow', interactiveTransitionClass, className)} {...props}/>);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
export { TabsTrigger };
