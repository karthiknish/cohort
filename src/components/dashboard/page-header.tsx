'use client'

import Link from 'next/link'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: LucideIcon
  backHref?: string
  backLabel?: string
  badge?: string
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline'
  helpText?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  backHref,
  backLabel = 'Back',
  badge,
  badgeVariant = 'secondary',
  helpText,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {backHref && (
        <Button variant="ghost" size="sm" asChild className="gap-1 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>
      )}
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {badge && (
                  <Badge variant={badgeVariant}>{badge}</Badge>
                )}
                {helpText && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Help</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p>{helpText}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}
