'use client'

import { useRef } from 'react'

/** Returns the previous render's `value` (undefined on first render). */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)
  const previous = ref.current
  ref.current = value
  return previous
}
