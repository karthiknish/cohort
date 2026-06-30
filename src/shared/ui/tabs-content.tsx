import * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cn } from '@/lib/utils';

type TabsContentProps = React.ComponentPropsWithRef<typeof TabsPrimitive.Panel>;

const TabsContent = ({ className, ref, ...props }: TabsContentProps) => (
  <TabsPrimitive.Panel
    ref={ref}
    className={cn('focus-ring-subtle mt-4 ring-offset-background', className)}
    {...props}
  />
);
TabsContent.displayName = 'TabsContent';

export { TabsContent };
