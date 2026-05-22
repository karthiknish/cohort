'use client'

import * as React from 'react'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'

import { surfaceMotionClasses } from '@/lib/motion'
import { cn } from '@/lib/utils'

function HoverCardContent({
  className,
  align = 'center',
  sideOffset = 6,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-[1200] w-64 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          surfaceMotionClasses.popoverContent,
          className,
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
}

export { HoverCardContent }
