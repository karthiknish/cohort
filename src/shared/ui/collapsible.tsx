'use client'

import * as React from 'react'
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'

import { cn } from '@/lib/utils'

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

type CollapsibleContentProps = React.ComponentPropsWithRef<typeof CollapsiblePrimitive.CollapsibleContent>

const CollapsibleContent = ({ className, children, ref, ...props }: CollapsibleContentProps) => (
    <CollapsiblePrimitive.CollapsibleContent
        ref={ref}
        className={cn(
            'overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
            className
        )}
        {...props}
    >
        {children}
    </CollapsiblePrimitive.CollapsibleContent>
)
CollapsibleContent.displayName = CollapsiblePrimitive.CollapsibleContent.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
