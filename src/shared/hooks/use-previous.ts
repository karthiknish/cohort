'use client';
import { useEffect, useRef, useState } from 'react';
/** Returns the previous render's `value` (undefined on first render). */
export function usePrevious<T>(value: T): T | undefined {
    const valueRef = useRef(value);
    const [previous, setPrevious] = useState<T | undefined>(undefined);
    useEffect(() => {
        setPrevious(valueRef.current);
        valueRef.current = value;
    }, [value]);
    return previous;
}
