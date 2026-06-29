'use client';
import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';
import { isPreviewModeEnabled, isScreenRecordingModeEnabled, setPreviewModeEnabled, PREVIEW_MODE_EVENT, PREVIEW_MODE_STORAGE_KEY, } from '@/lib/preview-data';
interface PreviewContextValue {
    isPreviewMode: boolean;
    togglePreviewMode: () => void;
    setPreviewMode: (enabled: boolean) => void;
}
const PreviewContext = createContext<PreviewContextValue | undefined>(undefined);
const DEFAULT_PREVIEW_CONTEXT: PreviewContextValue = {
    isPreviewMode: false,
    togglePreviewMode: () => { },
    setPreviewMode: () => { },
};
export function PreviewProvider({ children }: PropsWithChildren) {
    const [storedPreviewMode, setStoredPreviewMode] = useState(() => isPreviewModeEnabled());
    const isPreviewModeForced = isScreenRecordingModeEnabled();
    const isPreviewMode = isPreviewModeForced || storedPreviewMode;
    useEffect(() => {
        const syncFromStorage = () => {
            setStoredPreviewMode(isPreviewModeEnabled());
        };
        const onStorage = (event: StorageEvent) => {
            if (event.key === PREVIEW_MODE_STORAGE_KEY) {
                syncFromStorage();
            }
        };
        const onPreviewEvent = () => {
            syncFromStorage();
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener);
        };
    }, []);
    const updatePreviewMode = (enabled: boolean) => {
        if (isPreviewModeForced)
            return;
        setStoredPreviewMode(enabled);
        setPreviewModeEnabled(enabled);
    };
    const togglePreviewMode = () => {
        const nextValue = !isPreviewMode;
        updatePreviewMode(nextValue);
    };
    const setPreviewMode = (enabled: boolean) => {
        updatePreviewMode(enabled);
    };
    const value = ({
        isPreviewMode,
        togglePreviewMode,
        setPreviewMode,
    });
    return (<PreviewContext.Provider value={value}>
      {children}
    </PreviewContext.Provider>);
}
export function usePreview() {
    const context = use(PreviewContext);
    if (context === undefined) {
        return DEFAULT_PREVIEW_CONTEXT;
    }
    return context;
}
