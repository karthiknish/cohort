'use client'

import * as React from 'react'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'

export { HoverCardTrigger } from './hover-card-trigger'
export { HoverCardContent } from './hover-card-content'

function HoverCard({ ...props }: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" openDelay={200} closeDelay={100} {...props} />
}

export { HoverCard }
