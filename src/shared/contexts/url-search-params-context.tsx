'use client';
import { Suspense, createContext, use, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
const UrlSearchParamsContext = createContext<URLSearchParams | null>(null);
function UrlSearchParamsReader({ children }: {
    children: ReactNode;
}) {
    const searchParams = useSearchParams();
    const value = new URLSearchParams(searchParams.toString());
    return (<UrlSearchParamsContext.Provider value={value}>{children}</UrlSearchParamsContext.Provider>);
}
export function UrlSearchParamsProvider({ children }: {
    children: ReactNode;
}) {
    return (<Suspense fallback={null}>
      <UrlSearchParamsReader>{children}</UrlSearchParamsReader>
    </Suspense>);
}
export function useUrlSearchParamsContext() {
    const value = use(UrlSearchParamsContext);
    if (!value) {
        throw new Error('useUrlSearchParamsContext must be used within UrlSearchParamsProvider');
    }
    return value;
}
