'use client'

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

type UseUrlDrivenDialogOptions<TValue extends string> = {
  paramName: string
  allowedValues: readonly TValue[]
}

type UseUrlDrivenDialogResult<TValue extends string> = {
  activeValue: TValue | null
  isOpen: boolean
  openValue: (value: TValue) => void
  close: () => void
  onOpenChange: (open: boolean) => void
}

/** @deprecated Consumers of this hook must be wrapped in <Suspense> */
export function useUrlDrivenDialog<TValue extends string>({
  paramName,
  allowedValues,
}: UseUrlDrivenDialogOptions<TValue>): UseUrlDrivenDialogResult<TValue> {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const allowedValueSet = useMemo(() => new Set(allowedValues), [allowedValues])

  const searchValue = useMemo(() => {
    const value = searchParams.get(paramName)
    return value && allowedValueSet.has(value as TValue) ? (value as TValue) : null
  }, [allowedValueSet, paramName, searchParams])

  const activeValue = searchValue

  const syncUrl = useCallback((value: TValue | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }

    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, { scroll: false })
  }, [paramName, pathname, router, searchParams])

  const openValue = useCallback((value: TValue) => {
    syncUrl(value)
  }, [syncUrl])

  const close = useCallback(() => {
    syncUrl(null)
  }, [syncUrl])

  const onOpenChange = useCallback((open: boolean) => {
    if (!open) {
      close()
    }
  }, [close])

  return {
    activeValue,
    isOpen: activeValue !== null,
    openValue,
    close,
    onOpenChange,
  }
}
