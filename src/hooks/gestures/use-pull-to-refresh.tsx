import { useRef, useCallback, useState, useEffect } from 'react'

export interface PullToRefreshOptions {
  threshold?: number
  onRefresh: () => Promise<void> | void
  disabled?: boolean
}

export interface PullToRefreshState {
  isPulling: boolean
  isRefreshing: boolean
  pullDistance: number
  progress: number
}

const DEFAULT_THRESHOLD = 80

export function usePullToRefresh(
  ref: React.RefObject<HTMLElement | null>,
  options: PullToRefreshOptions
) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    progress: 0,
  })
  
  const startYRef = useRef<number>(0)
  const pullingRef = useRef<boolean>(false)

  const handleRefresh = useCallback(() => {
    if (state.isRefreshing) return
    
    setState(prev => ({ ...prev, isRefreshing: true, isPulling: false }))

    void Promise.resolve(options.onRefresh())
      .finally(() => {
        setState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0, progress: 0 }))
      })
  }, [options, state.isRefreshing])

  useEffect(() => {
    if (options.disabled) return
    
    const element = ref.current
    if (!element) return

    const handleTouchStart = (e: TouchEvent) => {
      if (element.scrollTop <= 0 && e.touches.length === 1) {
        startYRef.current = e.touches[0]!.clientY
        pullingRef.current = true
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!pullingRef.current || state.isRefreshing) return
      
      const currentY = e.touches[0]!.clientY
      const deltaY = currentY - startYRef.current
      
      if (deltaY > 0 && element.scrollTop <= 0) {
        const pullDistance = Math.min(deltaY * 0.5, threshold * 1.5)
        const progress = Math.min(pullDistance / threshold, 1)
        
        setState({
          isPulling: true,
          isRefreshing: false,
          pullDistance,
          progress,
        })
        
        if (deltaY > 10) {
          e.preventDefault()
        }
      } else {
        pullingRef.current = false
        setState(prev => ({ ...prev, isPulling: false, pullDistance: 0, progress: 0 }))
      }
    }

    const handleTouchEnd = () => {
      pullingRef.current = false
      
      if (state.progress >= 1 && !state.isRefreshing) {
        handleRefresh()
      } else {
        setState(prev => ({ ...prev, isPulling: false, pullDistance: 0, progress: 0 }))
      }
    }

    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [ref, threshold, state.isRefreshing, state.progress, handleRefresh, options.disabled])

  return state
}

export interface PullToRefreshIndicatorProps {
  state: PullToRefreshState
  threshold?: number
}

export function PullToRefreshIndicator({ state, threshold = DEFAULT_THRESHOLD }: PullToRefreshIndicatorProps) {
  const { isPulling, isRefreshing, pullDistance, progress } = state
  
  if (!isPulling && !isRefreshing) return null
  
  return (
    <div
      className="absolute top-0 left-0 right-0 flex justify-center items-center overflow-hidden pointer-events-none z-10"
      style={{
        height: Math.min(pullDistance, threshold),
        opacity: Math.min(progress * 2, 1),
      }}
    >
      <div
        className={`transition-transform duration-200 ${isRefreshing ? 'animate-spin' : ''}`}
        style={{
          transform: `rotate(${progress * 360}deg)`,
        }}
      >
        <svg
          className="w-6 h-6 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
    </div>
  )
}
