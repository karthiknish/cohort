"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { surfaceMotionClasses } from "@/lib/animation-system"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

type TooltipContentProps = React.ComponentPropsWithRef<typeof TooltipPrimitive.Content>

const TooltipContent = ({ className, sideOffset = 4, ref, ...props }: TooltipContentProps) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-[100] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
        surfaceMotionClasses.popoverContent,
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
)
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
