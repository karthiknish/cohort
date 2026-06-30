export async function registerServiceWorkerWhenAvailable(signal: {
    cancelled: boolean;
}): Promise<void> {
    const response = await fetch('/sw.js', {
        method: 'HEAD',
        cache: 'no-store',
    });
    if (!response.ok || signal.cancelled) {
        return;
    }
    const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    const updateFoundHandler = () => {
        const newWorker = registration.installing;
        if (!newWorker)
            return;
        const stateChangeHandler = () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                newWorker.postMessage({ type: 'SKIP_WAITING' });
            }
        };
        newWorker.addEventListener('statechange', stateChangeHandler);
    };
    registration.addEventListener('updatefound', updateFoundHandler);
}
