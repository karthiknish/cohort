'use client'

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { X, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Card, CardContent } from '@/shared/ui/card'
import { cn } from '@/lib/utils'

interface FeatureTip {
  id: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

interface FeatureTipsProps {
  tips: FeatureTip[]
  storageKey: string
  className?: string
}

export function FeatureTips({ tips, storageKey, className }: FeatureTipsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isStoredDismissed = useMemo(() => {
    if (!isHydrated) {
      return false
    }

    try {
      return localStorage.getItem(`tips_dismissed_${storageKey}`) === 'true'
    } catch {
      return false
    }
  }, [isHydrated, storageKey])

  const isFirst = currentIndex === 0
  const isLast = currentIndex === tips.length - 1

  const handleDismiss = useCallback(() => {
    localStorage.setItem(`tips_dismissed_${storageKey}`, 'true')
    setDismissed(true)
  }, [storageKey])

  const handleNext = useCallback(() => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1)
    }
  }, [isLast])

  const handlePrev = useCallback(() => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1)
    }
  }, [isFirst])

  if (!isHydrated || dismissed || isStoredDismissed || tips.length === 0) {
    return null
  }

  const currentTip = tips[currentIndex]!

  return (
    <Card className={cn('border-accent/20 bg-accent/5', className)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/20 text-primary">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium text-foreground">{currentTip.title}</h4>
                {tips.length > 1 && (
                  <span className="text-xs text-muted-foreground">
                    {currentIndex + 1}/{tips.length}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{currentTip.description}</p>
              
              {currentTip.action && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-primary"
                  onClick={currentTip.action.onClick}
                >
                  {currentTip.action.label}
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {tips.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handlePrev}
                  disabled={isFirst}
                  aria-label="Previous tip"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleNext}
                  disabled={isLast}
                  aria-label="Next tip"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              onClick={handleDismiss}
              aria-label="Dismiss tips"
            >
              <X className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
