'use client';
import { useSyncExternalStore } from 'react';
export function useMediaQuery(query: string): boolean {
    return useSyncExternalStore((onStoreChange) => {
        if (typeof window === 'undefined') {
            return () => undefined;
        }
        const media = window.matchMedia(query);
        const handleChange = () => {
            onStoreChange();
        };
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', handleChange);
            return () => {
                media.removeEventListener('change', handleChange);
            };
        }
        media.addListener(handleChange);
        return () => {
            media.removeListener(handleChange);
        };
    }, () => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(query).matches;
    }, () => false);
}
export function useWindowWidth(): number {
    return useSyncExternalStore((onStoreChange) => {
        if (typeof window === 'undefined') {
            return () => undefined;
        }
        const handleResize = () => {
            onStoreChange();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, () => (typeof window === 'undefined' ? 0 : window.innerWidth), () => 0);
}
