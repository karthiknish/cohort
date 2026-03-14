import { useRef, useCallback, useState, useEffect } from 'react'

export interface LongPressOptions {
  threshold?: number
  onStart?: () => void
  onFinish?: () => void
  onCancel?: () => void
}

export interface LongPressState {
  isPressed: boolean
  isLongPress: boolean
  progress: number
}

const DEFAULT_THRESHOLD = 500

export function useLongPress(
  callback: () => void,
  options: LongPressOptions = {}
) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const [state, setState] = useState<LongPressState>({
    isPressed: false,
    isLongPress: false,
    progress: 0,
  })
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const start = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    clear()
    
    startTimeRef.current = Date.now()
    setState({ isPressed: true, isLongPress: false, progress: 0 })
    
    options.onStart?.()
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / threshold, 1)
      setState(prev => ({ ...prev, progress }))
    }, 16)
    
    timeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, isLongPress: true }))
      callback()
      options.onFinish?.()
      clear()
    }, threshold)
  }, [callback, clear, threshold, options])

  const stop = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    clear()
    
    if (state.isPressed && !state.isLongPress) {
      options.onCancel?.()
    }
    
    setState({ isPressed: false, isLongPress: false, progress: 0 })
  }, [clear, state.isPressed, state.isLongPress, options])

  const bind = {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchCancel: stop,
  }

  return {
    state,
    bind,
    isLongPressed: state.isLongPress,
  }
}

export function useLongPressRef(
  ref: React.RefObject<HTMLElement | null>,
  callback: () => void,
  options: LongPressOptions = {}
) {
  const threshold = options.threshold ?? DEFAULT_THRESHOLD
  const [isLongPressed, setIsLongPressed] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startPosRef = useRef({ x: 0, y: 0 })
  
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleStart = (e: TouchEvent | MouseEvent) => {
      let x: number, y: number
      
      if ('touches' in e) {
        if (e.touches.length !== 1) return
        x = e.touches[0]!.clientX
        y = e.touches[0]!.clientY
      } else {
        x = e.clientX
        y = e.clientY
      }
      
      startPosRef.current = { x, y }
      options.onStart?.()
      
      timeoutRef.current = setTimeout(() => {
        setIsLongPressed(true)
        callback()
        options.onFinish?.()
      }, threshold)
    }

    const handleEnd = () => {
      clear()
      if (!isLongPressed) {
        options.onCancel?.()
      }
      setIsLongPressed(false)
    }

    const handleMove = (e: TouchEvent | MouseEvent) => {
      let x: number, y: number
      
      if ('touches' in e) {
        if (e.touches.length !== 1) return
        x = e.touches[0]!.clientX
        y = e.touches[0]!.clientY
      } else {
        x = e.clientX
        y = e.clientY
      }
      
      const dx = Math.abs(x - startPosRef.current.x)
      const dy = Math.abs(y - startPosRef.current.y)
      
      if (dx > 10 || dy > 10) {
        clear()
        setIsLongPressed(false)
      }
    }

    element.addEventListener('touchstart', handleStart, { passive: true })
    element.addEventListener('touchend', handleEnd, { passive: true })
    element.addEventListener('touchmove', handleMove, { passive: true })
    element.addEventListener('mousedown', handleStart, { passive: true })
    element.addEventListener('mouseup', handleEnd, { passive: true })
    element.addEventListener('mouseleave', handleEnd, { passive: true })
    element.addEventListener('mousemove', handleMove, { passive: true })

    return () => {
      element.removeEventListener('touchstart', handleStart)
      element.removeEventListener('touchend', handleEnd)
      element.removeEventListener('touchmove', handleMove)
      element.removeEventListener('mousedown', handleStart)
      element.removeEventListener('mouseup', handleEnd)
      element.removeEventListener('mouseleave', handleEnd)
      element.removeEventListener('mousemove', handleMove)
      clear()
    }
  }, [ref, callback, threshold, clear, isLongPressed, options])

  return isLongPressed
}
