// Firebase Analytics has been removed as part of the client SDK migration.
// We now support optional Google Analytics (gtag) along with PostHog.
// posthog-js is loaded on demand so it stays out of the entry chunk.
type AnalyticsParams = Record<string, string | number | boolean | null | undefined>;
type GtagFunction = (command: 'event' | 'config' | 'set' | 'consent', targetIdOrName: string, params?: Record<string, unknown>) => void;
type PostHogClient = typeof import('posthog-js').default;

declare global {
    interface Window {
        gtag?: GtagFunction;
    }
}

function getGtag(): GtagFunction | null {
    if (typeof window === 'undefined')
        return null;
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (!measurementId)
        return null;
    return typeof window.gtag === 'function' ? window.gtag : null;
}

async function getPosthog(): Promise<PostHogClient | null> {
    if (typeof window === 'undefined')
        return null;
    const { default: posthog } = await import('posthog-js');
    return posthog;
}

export async function getAnalyticsInstance(): Promise<null> {
    return null;
}

export async function logAnalyticsEvent(eventName: string, parameters?: AnalyticsParams): Promise<void> {
    if (typeof window === 'undefined')
        return;
    const posthog = await getPosthog();
    posthog?.capture(eventName, parameters);
    const gtag = getGtag();
    if (gtag) {
        gtag('event', eventName, parameters as Record<string, unknown> | undefined);
    }
}

export async function logPageView(path: string, parameters?: AnalyticsParams): Promise<void> {
    if (typeof window === 'undefined') {
        return;
    }
    const location = window.location.href;
    const defaultParams: AnalyticsParams = {
        page_path: path,
        page_location: location,
    };
    const posthog = await getPosthog();
    posthog?.capture('$pageview', {
        ...defaultParams,
        ...parameters,
    });
    const gtag = getGtag();
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gtag && measurementId) {
        gtag('config', measurementId, {
            page_path: path,
            page_location: location,
            ...parameters,
        });
    }
}

export async function setAnalyticsUserId(userId: string | null): Promise<void> {
    if (typeof window === 'undefined') {
        return;
    }
    const posthog = await getPosthog();
    if (userId) {
        posthog?.identify(userId);
    }
    else {
        posthog?.reset();
    }
    const gtag = getGtag();
    if (gtag) {
        gtag('set', 'user_id', { user_id: userId ?? undefined });
    }
}

export async function setAnalyticsUserProperties(properties: Record<string, string | number | null | undefined>): Promise<void> {
    if (typeof window === 'undefined') {
        return;
    }
    const filteredEntries = Object.entries(properties).reduce<Record<string, string | number>>((accumulator, [key, value]) => {
        if (value === undefined || value === null) {
            return accumulator;
        }
        accumulator[key] = value;
        return accumulator;
    }, {});
    if (Object.keys(filteredEntries).length > 0) {
        const posthog = await getPosthog();
        posthog?.people.set(filteredEntries);
    }
    const gtag = getGtag();
    if (gtag && Object.keys(filteredEntries).length > 0) {
        gtag('set', 'user_properties', filteredEntries);
    }
}
