'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

export type ParsedCursorPage<TItem, TCursor> = {
  items: TItem[]
  nextCursor: TCursor | null
}

type UseAccumulatedCursorPagesArgs<TItem, TCursor> = {
  scopeKey: string
  queryData: unknown
  loadCursor: TCursor | null
  setLoadCursor: (cursor: TCursor | null) => void
  enabled?: boolean
  getItemKey: (item: TItem) => string
  parsePage: (queryData: unknown) => ParsedCursorPage<TItem, TCursor> | null
  mergePages: (firstPage: TItem[], olderPages: TItem[]) => TItem[]
}

export function useAccumulatedCursorPages<TItem, TCursor>({
  scopeKey,
  queryData,
  loadCursor,
  setLoadCursor,
  enabled = true,
  getItemKey,
  parsePage,
  mergePages,
}: UseAccumulatedCursorPagesArgs<TItem, TCursor>) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [nextPageCursor, setNextPageCursor] = useState<TCursor | null>(null)
  const [olderItems, setOlderItems] = useState<TItem[]>([])

  const reset = useCallback(() => {
    setLoadCursor(null)
    setIsLoadingMore(false)
    setNextPageCursor(null)
    setOlderItems([])
  }, [setLoadCursor])

  useEffect(() => {
    reset()
  }, [reset, scopeKey])

  const parsedPage = useMemo(() => {
    if (!enabled || queryData === undefined) {
      return null
    }
    return parsePage(queryData)
  }, [enabled, parsePage, queryData])

  useEffect(() => {
    if (!enabled || queryData === undefined || !parsedPage) {
      return
    }

    const { items, nextCursor } = parsedPage

    if (loadCursor === null) {
      setNextPageCursor(nextCursor)
      return
    }

    setOlderItems((previous) => {
      const seen = new Set(previous.map(getItemKey))
      const appended = [...previous]
      for (const item of items) {
        const key = getItemKey(item)
        if (seen.has(key)) {
          continue
        }
        seen.add(key)
        appended.push(item)
      }
      return appended
    })
    setNextPageCursor(nextCursor)
    setLoadCursor(null)
    setIsLoadingMore(false)
  }, [enabled, getItemKey, loadCursor, parsedPage, queryData, setLoadCursor])

  const firstPageItems = parsedPage?.items ?? []
  const mergedItems = useMemo(
    () => mergePages(firstPageItems, olderItems),
    [firstPageItems, mergePages, olderItems],
  )

  const isInitialLoading = enabled && queryData === undefined && loadCursor === null

  const loadMore = useCallback(() => {
    if (!enabled || !nextPageCursor || isLoadingMore || isInitialLoading) {
      return
    }

    setIsLoadingMore(true)
    setLoadCursor(nextPageCursor)
  }, [enabled, isInitialLoading, isLoadingMore, nextPageCursor, setLoadCursor])

  return {
    mergedItems,
    nextCursor: nextPageCursor,
    isInitialLoading,
    isLoadingMore,
    loadMore,
    reset,
  }
}
