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

  const [value, setValueState] = useState<TValue>(defaultValue)

  const didInitRef = useRef(false)

  useEffect(() => {
    if (didInitRef.current) return
    didInitRef.current = true

    const fromUrl = searchParams.get(param)
    if (isAllowed(allowedValues, fromUrl)) {
      setValueState(fromUrl)
      return
    }

    try {
      const fromStorage = window.localStorage.getItem(storageKey)
      if (isAllowed(allowedValues, fromStorage)) {
        setValueState(fromStorage)
      }
    } catch {
      // ignore storage errors
    }
  }, [allowedValues, param, searchParams, storageKey])

  // If allowed values change (role-based tabs, feature flags), force a valid selection.
  useEffect(() => {
    if (isAllowed(allowedValues, value)) return
    setValueState(defaultValue)
  }, [allowedValues, defaultValue, value])

  const setValue = useCallback(
    (next: TValue) => {
      if (!isAllowed(allowedValues, next)) {
        setValueState(defaultValue)
        return
      }

      setValueState(next)

      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // ignore storage errors
      }

      if (!syncToUrl) return

      const params = new URLSearchParams(searchParams.toString())
      params.set(param, next)
      const queryString = params.toString()
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false })
    },
    [
      allowedValues,
      defaultValue,
      param,
      pathname,
      router,
      searchParams,
      storageKey,
      syncToUrl,
    ],
  )

  return { value, setValue }
}
