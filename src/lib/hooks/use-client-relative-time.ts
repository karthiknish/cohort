'use client';
import { useSyncExternalStore } from 'react';
import { formatRelativeTime } from '@/lib/dates';
function subscribeClientMounted(onStoreChange: () => void) {
    onStoreChange();
    return () => undefined;
}
function getClientMountedSnapshot() {
    return true;
}
function getServerMountedSnapshot() {
    return false;
}
function formatClientRelativeTime(value: string | number | Date | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    return formatRelativeTime(value);
}
/**
 * Relative time label safe for SSR — empty until after mount, then formatted client-side.
 */
export function useClientRelativeTime(value: string | number | Date | null | undefined): string | null {
    const isMounted = useSyncExternalStore(subscribeClientMounted, getClientMountedSnapshot, getServerMountedSnapshot);
    if (!isMounted) {
        return null;
    }
    return formatClientRelativeTime(value);
}
let cachedNowMs = 0;
function subscribeNow(onStoreChange: () => void) {
    if (cachedNowMs === 0) {
        cachedNowMs = Date.now();
    }
    const intervalId = window.setInterval(() => {
        cachedNowMs = Date.now();
        onStoreChange();
    }, 60000);
    return () => window.clearInterval(intervalId);
}
function getNowMsSnapshot() {
    return cachedNowMs;
}
/** Milliseconds since epoch on the client; `0` during SSR. */
export function useClientNowMs(): number {
    const isMounted = useSyncExternalStore(subscribeClientMounted, getClientMountedSnapshot, getServerMountedSnapshot);
    const nowMs = useSyncExternalStore(subscribeNow, getNowMsSnapshot, () => 0);
    return isMounted ? nowMs : 0;
}
/** Current time, null during SSR and until mount. */
export function useClientNow(): Date | null {
    const nowMs = useClientNowMs();
    if (nowMs === 0)
        return null;
    return new Date(nowMs);
}
