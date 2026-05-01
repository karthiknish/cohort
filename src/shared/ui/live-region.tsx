import { cn } from '@/lib/utils'

type LiveRegionProps = {
  message?: string | null
  id?: string
  politeness?: 'polite' | 'assertive'
  atomic?: boolean
  className?: string
}

export function LiveRegion({
  message,
  id,
  politeness = 'polite',
  atomic = true,
  className,
}: LiveRegionProps) {
  return (
    <p
      id={id}
      className={cn('sr-only', className)}
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic={atomic}
    >
      {message ?? ''}
    </p>
  )
}