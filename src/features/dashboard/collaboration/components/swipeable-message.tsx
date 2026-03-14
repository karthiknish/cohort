'use client'

import { useRef, useCallback, useState } from 'react'
import { Reply, Trash2, Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import { useSwipe } from '@/shared/hooks/gestures'
import type { UnifiedMessage } from './message-list'

export interface SwipeableMessageProps {
  message: UnifiedMessage
  currentUserId: string | null
  canDelete?: boolean
  onReply?: () => void
  onDelete?: () => void
  children: React.ReactNode
  className?: string
}

export function SwipeableMessage({
  canDelete = false,
  onReply,
  onDelete,
  children,
  className,
}: SwipeableMessageProps) {
  const [showActions, setShowActions] = useState(false)
  const [pendingAction, setPendingAction] = useState<'reply' | 'delete' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  const { state, handlers } = useSwipe({
    onSwipeRight: () => {
      if (onReply) {
        setPendingAction('reply')
        setShowActions(true)
      }
    },
    onSwipeLeft: () => {
      if (canDelete && onDelete) {
        setPendingAction('delete')
        setShowActions(true)
      }
    },
  }, { threshold: 60 })

  const handleConfirmAction = useCallback(() => {
    if (pendingAction === 'reply') {
      onReply?.()
    } else if (pendingAction === 'delete') {
      onDelete?.()
    }
    setShowActions(false)
    setPendingAction(null)
  }, [pendingAction, onReply, onDelete])

  const handleCancelAction = useCallback(() => {
    setShowActions(false)
    setPendingAction(null)
  }, [])

  const swipeOffset = state.isSwiping ? (state.direction === 'right' ? Math.min(state.distance, 80) : state.direction === 'left' ? -Math.min(state.distance, 80) : 0) : 0

  return (
    <div className="relative overflow-hidden">
      {showActions && (
        <div
          className={cn(
            'absolute inset-y-0 z-10 flex items-center gap-2 px-4',
            pendingAction === 'reply' ? 'left-0 bg-blue-500/20' : 'right-0 bg-red-500/20'
          )}
        >
          {pendingAction === 'reply' && (
            <>
              <Reply className="h-5 w-5 text-blue-500" />
              <span className="text-sm text-blue-500 font-medium">Reply</span>
              <Button size="sm" variant="ghost" onClick={handleConfirmAction}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelAction}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
          {pendingAction === 'delete' && (
            <>
              <Trash2 className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-500 font-medium">Delete</span>
              <Button size="sm" variant="ghost" onClick={handleConfirmAction}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelAction}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}
      
      <div
        ref={containerRef}
        className={cn(
          'transition-transform duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-out)] motion-reduce:transition-none touch-pan-y',
          state.isSwiping && 'transition-none',
          className
        )}
        style={{
          transform: showActions ? (pendingAction === 'reply' ? 'translateX(80px)' : 'translateX(-80px)') : `translateX(${swipeOffset}px)`,
        }}
        {...handlers}
      >
        {children}
      </div>
    </div>
  )
}

export interface LongPressMessageProps {
  message: UnifiedMessage
  onLongPress?: () => void
  children: React.ReactNode
  className?: string
}

export function LongPressMessage({
  onLongPress,
  children,
  className,
}: LongPressMessageProps) {
  const [isPressed, setIsPressed] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPosRef = useRef({ x: 0, y: 0 })

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    startPosRef.current = { x: touch.clientX, y: touch.clientY }
    setIsPressed(true)
    
    timeoutRef.current = setTimeout(() => {
      setIsPressed(false)
      onLongPress?.()
    }, 500)
  }, [onLongPress])

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsPressed(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    const dx = Math.abs(touch.clientX - startPosRef.current.x)
    const dy = Math.abs(touch.clientY - startPosRef.current.y)
    
    if (dx > 10 || dy > 10) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setIsPressed(false)
    }
  }, [])

  return (
    <div
      className={cn(
        isPressed && 'bg-muted/50 scale-[0.98]',
        'transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
        className
      )}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {children}
    </div>
  )
}
