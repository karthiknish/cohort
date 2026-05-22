import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

type TabsContentProps = React.ComponentPropsWithRef<typeof TabsPrimitive.Content>

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

export { TabsContent }
