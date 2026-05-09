"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { interactiveTransitionClass } from "@/lib/animation-system"
import { cn } from "@/lib/utils"

function getProgressTransformStyle(value: number | null | undefined) {
  return {
    transform: `translateX(-${100 - (value || 0)}%)`,
  }
}

type ProgressProps = React.ComponentPropsWithRef<typeof ProgressPrimitive.Root>

const Progress = ({ className, value, ref, ...props }: ProgressProps) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn('h-full w-full flex-1 bg-primary', interactiveTransitionClass)}
      style={getProgressTransformStyle(value)}
    />
  </ProgressPrimitive.Root>
)
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
