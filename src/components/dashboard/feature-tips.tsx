'use client'

import { useState, useEffect } from 'react'
import { X, Lightbulb, ChevronRight, ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem(`tips_dismissed_${storageKey}`)
    if (stored === 'true') {
      setDismissed(true)
    }
  }, [storageKey])

  if (!isClient || dismissed || tips.length === 0) {
    return null
  }

  const currentTip = tips[currentIndex]!
  const isFirst = currentIndex === 0
  const isLast = currentIndex === tips.length - 1

  const handleDismiss = () => {
    localStorage.setItem(`tips_dismissed_${storageKey}`, 'true')
    setDismissed(true)
  }

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  return (
    <Card className={cn('border-primary/20 bg-primary/5', className)}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
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
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleNext}
                  disabled={isLast}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
