'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type UsePersistedTabOptions<TValue extends string> = {
  /** Query param key to use in the URL (default: "tab") */
  param?: string
  /** Default tab value */
  defaultValue: TValue
  /** Allowed values (used to validate URL/localStorage) */
  allowedValues: readonly TValue[]
  /** Optional namespace to avoid collisions across pages/components */
  storageNamespace?: string
  /** Persist to URL query param (default: true) */
  syncToUrl?: boolean
}

type UsePersistedTabReturn<TValue extends string> = {
  value: TValue
  setValue: (next: TValue) => void
}

function isAllowed<TValue extends string>(
  allowed: readonly TValue[],
  candidate: string | null,
): candidate is TValue {
  if (!candidate) return false
  return (allowed as readonly string[]).includes(candidate)
}

// Stable deep equality check for arrays
function arraysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

export function usePersistedTab<TValue extends string>(
  options: UsePersistedTabOptions<TValue>,
): UsePersistedTabReturn<TValue> {
  const {
    param = 'tab',
    defaultValue,
    allowedValues,
    storageNamespace,
    syncToUrl = true,
  } = options

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const storageKey = useMemo(() => {
    const base = storageNamespace ? `${storageNamespace}:` : ''
    return `${base}${pathname}:${param}`
  }, [pathname, param, storageNamespace])

  // Start with defaultValue to avoid hydration mismatch
  const [value, setValueState] = useState<TValue>(defaultValue)
  const [hasMounted, setHasMounted] = useState(false)

  const didInitRef = useRef(false)
  // Use refs to prevent infinite loops from changing dependencies
  const allowedValuesRef = useRef(allowedValues)
  const defaultValueRef = useRef(defaultValue)
  const valueRef = useRef(value)

  // Keep refs in sync
  useEffect(() => {
    allowedValuesRef.current = allowedValues
    defaultValueRef.current = defaultValue
    valueRef.current = value
  })

  // Only run initialization after mount to avoid hydration mismatch
  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted) return
    if (didInitRef.current) return
    didInitRef.current = true

    const fromUrl = searchParams.get(param)
    if (isAllowed(allowedValuesRef.current, fromUrl)) {
      // Only set if different from default to avoid unnecessary re-render
      if (fromUrl !== defaultValueRef.current) {
        setValueState(fromUrl)
      }
      return
    }

    try {
      const fromStorage = window.localStorage.getItem(storageKey)
      if (isAllowed(allowedValuesRef.current, fromStorage)) {
        // Only set if different from default to avoid unnecessary re-render
        if (fromStorage !== defaultValueRef.current) {
          setValueState(fromStorage)
        }
      }
    } catch {
      // ignore storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, param, searchParams, storageKey])

  // Handle allowed values changes in a separate effect with proper guards
  useEffect(() => {
    if (!hasMounted) return
    
    // Only reset if allowedValues actually changed (shallow compare contents)
    if (arraysEqual(allowedValuesRef.current, allowedValues)) return
    
    allowedValuesRef.current = allowedValues
    
    // Check if current value is still valid - if so, keep it
    if (isAllowed(allowedValues, valueRef.current)) return

    // Only reset if the current value is no longer allowed
    setValueState(defaultValue)
  }, [hasMounted, allowedValues, defaultValue])

  // Use a ref to track if we're currently syncing to URL to prevent loops
  const isSyncingToUrlRef = useRef(false)
  
  const setValue = useCallback(
    (next: TValue) => {
      // Use ref to get current allowed values without creating dependency
      const currentAllowed = allowedValuesRef.current
      const currentDefault = defaultValueRef.current
      
      if (!isAllowed(currentAllowed, next)) {
        setValueState(currentDefault)
        return
      }

      // Only update state if value actually changed
      setValueState((prev) => {
        if (prev === next) return prev
        return next
      })

      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // ignore storage errors
      }

      if (!syncToUrl) return
      if (isSyncingToUrlRef.current) return

      // Check if URL actually needs to change
      const currentParamValue = searchParams.get(param)
      if (currentParamValue === next) return

      isSyncingToUrlRef.current = true
      const params = new URLSearchParams(searchParams.toString())
      params.set(param, next)
      const queryString = params.toString()
      
      // Use setTimeout to break synchronous render cycle
      setTimeout(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
        isSyncingToUrlRef.current = false
      }, 0)
    },
    // Minimal deps - use refs for values that change frequently
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [param, pathname, router, searchParams, storageKey, syncToUrl],
  )

  return { value, setValue }
}
