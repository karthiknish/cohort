'use client';
import { createContext, use } from 'react';
import type { ClientContextValue } from './client-context-types';
import { useClientProvider } from './use-client-provider';
const ClientContext = createContext<ClientContextValue | undefined>(undefined);
export function ClientProvider({ children }: {
    children: React.ReactNode;
}) {
    const value = useClientProvider();
    return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}
export function useClientContext() {
    const context = use(ClientContext);
    if (!context) {
        throw new Error('useClientContext must be used within a ClientProvider');
    }
    return context;
}
