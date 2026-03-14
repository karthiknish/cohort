import { useRef, useCallback, useState, useEffect } from 'react'
import type { TouchEvent } from 'react'

export interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

export interface SwipeState {
  startX: number
  startY: number
  currentX: number
  currentY: number
  isSwiping: boolean
  direction: 'left' | 'right' | 'up' | 'down' | null
  distance: number
}

const SWIPE_THRESHOLD = 50
const SWIPE_VELOCITY_THRESHOLD = 0.3

export function useSwipe(handlers: SwipeHandlers, options?: { threshold?: number; preventScroll?: boolean }) {
  const threshold = options?.threshold ?? SWIPE_THRESHOLD
  const preventScroll = options?.preventScroll ?? false
  
  const [state, setState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
    direction: null,
    distance: 0,
  })
  
  const startTimeRef = useRef<number>(0)
  const touchIdRef = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) return
    
    const touch = e.touches[0]
    if (!touch) return
    
    touchIdRef.current = touch.identifier
    startTimeRef.current = Date.now()
    
    setState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: true,
      direction: null,
      distance: 0,
    })
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent<HTMLElement>) => {
    if (!state.isSwiping) return
    
    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current)
    if (!touch) return
    
    const deltaX = touch.clientX - state.startX
    const deltaY = touch.clientY - state.startY
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    
    let direction: SwipeState['direction'] = null
    if (absX > threshold || absY > threshold) {
      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }
    }
    
    if (preventScroll && (direction === 'left' || direction === 'right')) {
      e.preventDefault()
    }
    
    setState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      direction,
      distance: Math.max(absX, absY),
    }))
  }, [state.isSwiping, state.startX, state.startY, threshold, preventScroll])

  const handleTouchEnd = useCallback(() => {
    if (!state.isSwiping) return
    
    const duration = Date.now() - startTimeRef.current
    const velocity = state.distance / duration
    
    if (state.distance > threshold && velocity > SWIPE_VELOCITY_THRESHOLD) {
      switch (state.direction) {
        case 'left':
          handlers.onSwipeLeft?.()
          break
        case 'right':
          handlers.onSwipeRight?.()
          break
        case 'up':
          handlers.onSwipeUp?.()
          break
        case 'down':
          handlers.onSwipeDown?.()
          break
      }
    }
    
    setState(prev => ({ ...prev, isSwiping: false, direction: null }))
    touchIdRef.current = null
  }, [state.isSwiping, state.distance, state.direction, handlers, threshold])

  return {
    state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  }
}

export function useSwipeable(ref: React.RefObject<HTMLElement | null>, handlers: SwipeHandlers, options?: { threshold?: number }) {
  const threshold = options?.threshold ?? SWIPE_THRESHOLD
  const [state, setState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
    direction: null,
    distance: 0,
  })
  
  const startTimeRef = useRef<number>(0)
  const touchIdRef = useRef<number | null>(null)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: globalThis.TouchEvent) => {
      if (e.touches.length !== 1) return
      
      const touch = e.touches[0]
      if (!touch) return
      
      touchIdRef.current = touch.identifier
      startTimeRef.current = Date.now()
      
      setState({
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        isSwiping: true,
        direction: null,
        distance: 0,
      })
    }

    const handleTouchMove = (e: globalThis.TouchEvent) => {
      if (!state.isSwiping) return
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current)
      if (!touch) return
      
      const deltaX = touch.clientX - state.startX
      const deltaY = touch.clientY - state.startY
      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)
      
      let direction: SwipeState['direction'] = null
      if (absX > threshold || absY > threshold) {
        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left'
        } else {
          direction = deltaY > 0 ? 'down' : 'up'
        }
      }
      
      setState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        direction,
        distance: Math.max(absX, absY),
      }))
    }

    const handleTouchEnd = () => {
      if (!state.isSwiping) return
      
      const duration = Date.now() - startTimeRef.current
      const velocity = state.distance / duration
      
      if (state.distance > threshold && velocity > SWIPE_VELOCITY_THRESHOLD) {
        switch (state.direction) {
          case 'left':
            handlers.onSwipeLeft?.()
            break
          case 'right':
            handlers.onSwipeRight?.()
            break
          case 'up':
            handlers.onSwipeUp?.()
            break
          case 'down':
            handlers.onSwipeDown?.()
            break
        }
      }
      
      setState(prev => ({ ...prev, isSwiping: false, direction: null }))
      touchIdRef.current = null
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: true })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, threshold, state.isSwiping, state.startX, state.startY, state.distance, state.direction, handlers])
  
  return state
}
