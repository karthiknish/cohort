'use client'

import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ContextualEmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel: string
  actionHref: string
  secondaryActionLabel?: string
  secondaryActionHref?: string
  tips?: string[]
  className?: string
}

export function ContextualEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  secondaryActionLabel,
  secondaryActionHref,
  tips,
  className,
}: ContextualEmptyStateProps) {
  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <Icon className="h-8 w-8" />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">{description}</p>
        
        <div className="mt-6 flex items-center gap-3">
          <Button asChild>
            <Link href={actionHref}>
              {actionLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          
          {secondaryActionLabel && secondaryActionHref && (
            <Button variant="outline" asChild>
              <Link href={secondaryActionHref}>
                {secondaryActionLabel}
              </Link>
            </Button>
          )}
        </div>
        
        {tips && tips.length > 0 && (
          <div className="mt-8 w-full max-w-md">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
              <Sparkles className="h-3 w-3" />
              <span>Quick tips</span>
            </div>
            <ul className="space-y-2 text-left">
              {tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
