'use client';
import { useEffect, useState } from 'react';
/**
 * Returns `false` during SSR and the first client render, then `true` after
 * `useEffect` fires. Use this to gate client-only values (e.g.
 * `useReducedMotion`) so server and hydration output match, avoiding
 * React hydration mismatch errors (#418).
 */
export function useMounted() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return mounted;
}
