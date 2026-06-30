'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
const EMPTY_ARRAY: readonly unknown[] = Object.freeze([]);
export type ParsedCursorPage<TItem, TCursor> = {
    items: TItem[];
    nextCursor: TCursor | null;
};
type UseAccumulatedCursorPagesArgs<TItem, TCursor> = {
    scopeKey: string;
    queryData: unknown;
    loadCursor: TCursor | null;
    setLoadCursor: (cursor: TCursor | null) => void;
    enabled?: boolean;
    getItemKey: (item: TItem) => string;
    parsePage: (queryData: unknown) => ParsedCursorPage<TItem, TCursor> | null;
    mergePages: (firstPage: TItem[], olderPages: TItem[]) => TItem[];
};
/** @internal Exported for unit tests. */
export function areCursorsEqual<TCursor>(left: TCursor | null, right: TCursor | null): boolean {
    if (left === right) {
        return true;
    }
    if (left === null || right === null) {
        return false;
    }
    return JSON.stringify(left) === JSON.stringify(right);
}
export function useAccumulatedCursorPages<TItem, TCursor>({ scopeKey, queryData, loadCursor, setLoadCursor, enabled = true, getItemKey, parsePage, mergePages, }: UseAccumulatedCursorPagesArgs<TItem, TCursor>) {
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [nextPageCursor, setNextPageCursor] = useState<TCursor | null>(null);
    const [olderItems, setOlderItems] = useState<TItem[]>([]);
    const getItemKeyRef = useRef(getItemKey);
    useEffect(() => {
        getItemKeyRef.current = getItemKey;
    }, [getItemKey]);
    const parsePageRef = useRef(parsePage);
    useEffect(() => {
        parsePageRef.current = parsePage;
    }, [parsePage]);
    const reset = useCallback(() => {
        setLoadCursor(null);
        setIsLoadingMore(false);
        setNextPageCursor(null);
        setOlderItems([]);
    }, [setLoadCursor]);
    useEffect(() => {
        reset();
    }, [reset, scopeKey]);
    const parsedPage = useMemo(() => {
        if (!enabled || queryData === undefined) {
            return null;
        }
        return parsePageRef.current(queryData);
    }, [enabled, queryData]);
    useEffect(() => {
        if (!enabled || queryData === undefined || !parsedPage) {
            return;
        }
        const { items, nextCursor } = parsedPage;
        if (loadCursor === null) {
            setNextPageCursor((previous) => areCursorsEqual(previous, nextCursor) ? previous : nextCursor);
            return;
        }
        const resolveItemKey = getItemKeyRef.current;
        setOlderItems((previous) => {
            const seen = new Set(previous.map(resolveItemKey));
            const appended = [...previous];
            let didAppend = false;
            for (const item of items) {
                const key = resolveItemKey(item);
                if (seen.has(key)) {
                    continue;
                }
                seen.add(key);
                appended.push(item);
                didAppend = true;
            }
            return didAppend ? appended : previous;
        });
        setNextPageCursor((previous) => areCursorsEqual(previous, nextCursor) ? previous : nextCursor);
        setLoadCursor(null);
        setIsLoadingMore(false);
    }, [enabled, loadCursor, parsedPage, queryData, setLoadCursor]);
    const firstPageItems = parsedPage?.items ?? (EMPTY_ARRAY as TItem[]);
    const mergePagesRef = useRef(mergePages);
    useEffect(() => {
        mergePagesRef.current = mergePages;
    }, [mergePages]);
    const mergedItems = useMemo(() => mergePagesRef.current(firstPageItems, olderItems), [firstPageItems, olderItems]);
    const isInitialLoading = enabled && queryData === undefined && loadCursor === null;
    const loadMore = () => {
        if (!enabled || !nextPageCursor || isLoadingMore || isInitialLoading) {
            return;
        }
        setIsLoadingMore(true);
        setLoadCursor(nextPageCursor);
    };
    return {
        mergedItems,
        nextCursor: nextPageCursor,
        isInitialLoading,
        isLoadingMore,
        loadMore,
        reset,
    };
}
