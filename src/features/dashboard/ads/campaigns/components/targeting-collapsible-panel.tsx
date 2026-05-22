'use client'

import { ChevronDown, type LucideIcon } from 'lucide-react'

import { ADS_PAGE_THEME } from '@/features/dashboard/ads/components/ads-page-theme'
import { Badge } from '@/shared/ui/badge'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/ui/collapsible'
import { cn } from '@/lib/utils'

type Props = {
  sectionId: string
  icon: LucideIcon
  title: string
  count?: number
  expanded: boolean
  onToggle: () => void
  headerActions?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function TargetingCollapsiblePanel({
  sectionId,
  icon: Icon,
  title,
  count,
  expanded,
  onToggle,
  headerActions,
  children,
  className,
}: Props) {
  return (
    <Collapsible open={expanded} onOpenChange={onToggle} className={className}>
      <div className={cn(ADS_PAGE_THEME.controlCollapsibleTrigger, expanded && 'border-primary/20 bg-card')}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-expanded={expanded}
            aria-controls={`targeting-panel-${sectionId}`}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60 ring-1 ring-border/50">
              <Icon className="size-4 text-muted-foreground" aria-hidden />
            </span>
            <span className="text-sm font-medium text-foreground">{title}</span>
            {typeof count === 'number' ? (
              <Badge variant="secondary" className="text-xs tabular-nums">
                {count}
              </Badge>
            ) : null}
          </button>
        </CollapsibleTrigger>
        <div className="flex shrink-0 items-center gap-1">
          {headerActions}
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title}`}
            >
              <ChevronDown
                className={cn('size-4 transition-transform duration-200', expanded && 'rotate-180')}
                aria-hidden
              />
            </button>
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent
        id={`targeting-panel-${sectionId}`}
        className="pt-2 motion-reduce:transition-none"
      >
        <div className={ADS_PAGE_THEME.controlCollapsibleBody}>{children}</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
