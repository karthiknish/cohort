'use client'

import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params'

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
  return a.length === b.length && a.every((v, i) => v === b[i])
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
  const searchParams = useUrlSearchParams()

  const storageKey = useMemo(() => {
    const base = storageNamespace ? `${storageNamespace}:` : ''
    return `${base}${pathname}:${param}`
  }, [pathname, param, storageNamespace])

  // Start with defaultValue to avoid hydration mismatch
  const [value, setValueState] = useState<TValue>(defaultValue)
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  const didInitRef = useRef(false)
  const allowedValuesRef = useRef(allowedValues)
  const defaultValueRef = useRef(defaultValue)
  const valueRef = useRef(value)

  allowedValuesRef.current = allowedValues
  defaultValueRef.current = defaultValue
  valueRef.current = value

  if (hasMounted && !didInitRef.current) {
    didInitRef.current = true

    const fromUrl = searchParams.get(param)
    if (isAllowed(allowedValuesRef.current, fromUrl)) {
      if (fromUrl !== defaultValueRef.current) {
        setValueState(fromUrl)
      }
    } else {
      try {
        const fromStorage = window.localStorage.getItem(storageKey)
        if (isAllowed(allowedValuesRef.current, fromStorage)) {
          if (fromStorage !== defaultValueRef.current) {
            setValueState(fromStorage)
          }
        }
      } catch {
        // ignore storage errors
      }
    }
  }

  if (hasMounted && !arraysEqual(allowedValuesRef.current, allowedValues)) {
    allowedValuesRef.current = allowedValues

    if (!isAllowed(allowedValues, valueRef.current)) {
      setValueState(defaultValue)
    }
  }

  const isSyncingToUrlRef = useRef(false)

  const setValue = useCallback(
    (next: TValue) => {
      const currentAllowed = allowedValuesRef.current
      const currentDefault = defaultValueRef.current

      if (!isAllowed(currentAllowed, next)) {
        setValueState(currentDefault)
        return
      }

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

      const currentParamValue = searchParams.get(param)
      if (currentParamValue === next) return

      isSyncingToUrlRef.current = true
      const params = new URLSearchParams(searchParams.toString())
      params.set(param, next)
      const queryString = params.toString()

      setTimeout(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
        isSyncingToUrlRef.current = false
      }, 0)
    },
    [param, pathname, router, searchParams, storageKey, syncToUrl],
  )

  return { value, setValue }
}
