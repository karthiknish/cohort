'use client';
import { useEffect } from 'react';

declare global {
    interface Window {
        dataLayer?: unknown[];
    }
}

/**
 * Google Analytics loader — replaces `next/script` (`strategy="afterInteractive"`).
 * Injects the gtag script + init snippet after hydration on the client.
 */
export function GoogleAnalyticsScript() {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    useEffect(() => {
        if (!measurementId)
            return;
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: unknown[]) {
            window.dataLayer?.push(args);
        }
        window.gtag = window.gtag || gtag;
        gtag('js', new Date());
        gtag('config', measurementId, { send_page_view: false });
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
        document.head.appendChild(script);
        return () => {
            script.remove();
        };
    }, [measurementId]);
    if (!measurementId) {
        return null;
    }
    return null;
}
