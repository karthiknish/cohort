import { listItemEnterClass } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** Applies list item entrance CSS without Framer (virtualized-safe). */
export function motionListItemClassName(className?: string) {
  return cn(listItemEnterClass, className)
}
