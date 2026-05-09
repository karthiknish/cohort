import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { interactiveTransitionClass } from '@/lib/animation-system'
import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

type TabsListProps = React.ComponentPropsWithRef<typeof TabsPrimitive.List>
type TabsTriggerProps = React.ComponentPropsWithRef<typeof TabsPrimitive.Trigger>
type TabsContentProps = React.ComponentPropsWithRef<typeof TabsPrimitive.Content>

const TabsList = ({ className, ref, ...props }: TabsListProps) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = ({ className, ref, ...props }: TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'focus-ring-subtle inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
      interactiveTransitionClass,
      className
    )}
    {...props}
  />
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = ({ className, ref, ...props }: TabsContentProps) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'focus-ring-subtle mt-4 ring-offset-background',
      className
    )}
    {...props}
  />
)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
