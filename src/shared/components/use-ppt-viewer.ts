'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PptxViewer, RECOMMENDED_ZIP_LIMITS } from '@aiden0z/pptx-renderer';
import { asErrorMessage } from '@/lib/convex-errors';

export interface UsePptViewerOptions {
    url: string;
    /** Optional callback to fetch a fresh signed URL when the current one expires (503). */
    refreshUrl?: () => Promise<string | null>;
    /** When true, uses a shorter viewport height for in-page deck cards. */
    embedded?: boolean;
}

export type PptThumbnailMount = {
    dispose: () => void;
    ready: Promise<void>;
};

export type PptLoadingPhase = 'fetching' | 'rendering';

export interface UsePptViewerReturn {
    frameRef: React.RefObject<HTMLDivElement | null>;
    containerRef: React.RefObject<HTMLDivElement | null>;
    slideCount: number;
    currentSlide: number;
    isLoading: boolean;
    loadingPhase: PptLoadingPhase;
    error: string | null;
    isFullscreen: boolean;
    goToSlide: (index: number) => void;
    handlePrevSlide: () => void;
    handleNextSlide: () => void;
    handleToggleFullscreen: () => void;
    handleRetry: () => void;
    isViewerReady: boolean;
    renderThumbnail: (index: number, container: HTMLElement) => PptThumbnailMount | null;
}

/**
 * Fetch a PPTX file through the proxy with retry + expired-URL refresh logic.
 * Returns an ArrayBuffer suitable for passing to PptxViewer.
 */
async function fetchPresentation(
    fileUrl: string,
    refreshUrl: (() => Promise<string | null>) | undefined,
): Promise<ArrayBuffer> {
    // Same-origin static assets (preview decks in /public) bypass the remote file proxy.
    if (fileUrl.startsWith('/')) {
        const response = await fetch(fileUrl, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch presentation: ${response.status}`);
        }
        return response.arrayBuffer();
    }

    let currentUrl = fileUrl;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < 4; attempt++) {
        try {
            const proxyUrl = `/api/proxy/file?url=${encodeURIComponent(currentUrl)}`;
            const response = await fetch(proxyUrl, {
                method: 'GET',
                credentials: 'include',
            });
            if (response.ok) {
                return response.arrayBuffer();
            }
            if (response.status === 401 || response.status === 403) {
                throw new Error('Access denied. You may not have permission to view this file.');
            }
            const errorData = await response.json().catch(() => ({}));
            const errorMsg =
                (errorData as { error?: string }).error ||
                `Failed to fetch presentation: ${response.status}`;
            if (response.status === 503) {
                if (errorMsg === 'FILE_URL_EXPIRED' && refreshUrl) {
                    const freshUrl = await refreshUrl().catch(() => null);
                    if (freshUrl && freshUrl !== currentUrl) {
                        currentUrl = freshUrl;
                        lastError = new Error('File URL expired, refreshing...');
                        continue;
                    }
                }
                if (attempt < 3) {
                    lastError = new Error(
                        errorMsg === 'FILE_URL_EXPIRED'
                            ? 'File URL has expired. Please refresh the page.'
                            : errorMsg,
                    );
                    await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
                    continue;
                }
            }
            throw new Error(
                errorMsg === 'FILE_URL_EXPIRED'
                    ? 'File URL has expired. Please refresh the page.'
                    : errorMsg,
            );
        } catch (err) {
            const message = asErrorMessage(err);
            if (message.includes('Access denied')) {
                throw new Error(message);
            }
            lastError = err instanceof Error ? err : new Error(message);
            if (attempt < 3) {
                await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
                continue;
            }
        }
    }
    throw lastError ?? new Error('Failed to fetch presentation after retries');
}

/**
 * Cap slide height to a generous viewport fraction. Prefer a large slide;
 * toolbar/filmstrip may sit below the fold and scroll into view.
 * (Sizing from frame.top made slides tiny when page chrome pushed the frame down.)
 */
function getSlideFrameMaxHeight(embedded: boolean): number {
    return embedded
        ? Math.min(window.innerHeight * 0.62, 560)
        : Math.min(window.innerHeight * 0.72, 680);
}

function measureFrameParentWidth(frameEl: HTMLElement): number {
    // getBoundingClientRect is reliable in flex layouts where clientWidth can
    // report unconstrained values when the parent wraps a shrink-0 child.
    const parentRect = frameEl.parentElement?.getBoundingClientRect();
    const parentWidth = parentRect?.width ?? frameEl.clientWidth;
    return Math.min(Math.max(parentWidth, 0), window.innerWidth - 48);
}

/**
 * Size the visible slide frame so width×aspect fits inside the viewport.
 * Returns the applied pixel size (used before open so the renderer measures a
 * constrained container — it sets position:relative and ignores CSS absolute).
 */
function sizeSlideFrame(
    frameEl: HTMLElement,
    slideAspect: number,
    embedded: boolean,
): { width: number; height: number } {
    const maxHeightPx = getSlideFrameMaxHeight(embedded);
    const maxWidthPx = measureFrameParentWidth(frameEl);
    const aspect = slideAspect > 0 ? slideAspect : 9 / 16;

    let width = maxWidthPx;
    let height = width * aspect;
    if (height > maxHeightPx) {
        height = maxHeightPx;
        width = height / aspect;
    }

    width = Math.min(width, maxWidthPx);
    const roundedWidth = Math.max(1, Math.round(width));
    const roundedHeight = Math.max(1, Math.round(height));
    frameEl.style.width = `${roundedWidth}px`;
    frameEl.style.height = `${roundedHeight}px`;
    return { width: roundedWidth, height: roundedHeight };
}

function syncSlideFrameSize(
    frameEl: HTMLElement,
    viewer: PptxViewer,
    embedded: boolean,
): void {
    const slideWidth = viewer.slideWidth;
    const slideHeight = viewer.slideHeight;
    if (slideWidth <= 0 || slideHeight <= 0) {
        sizeSlideFrame(frameEl, 9 / 16, embedded);
        return;
    }
    sizeSlideFrame(frameEl, slideHeight / slideWidth, embedded);
}

export function usePptViewer({ url, refreshUrl, embedded = false }: UsePptViewerOptions): UsePptViewerReturn {
    const frameRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewerRef = useRef<PptxViewer | null>(null);
    const refreshUrlRef = useRef(refreshUrl);
    refreshUrlRef.current = refreshUrl;
    const loadRequestRef = useRef(0);

    const [slideCount, setSlideCount] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [loadingPhase, setLoadingPhase] = useState<PptLoadingPhase>('fetching');
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Keep the loading frame sized to the viewport before the deck arrives.
    useEffect(() => {
        const frameEl = frameRef.current;
        if (!frameEl || !isLoading) {
            return;
        }
        sizeSlideFrame(frameEl, 9 / 16, embedded);
        const onResize = () => {
            if (frameRef.current && isLoading) {
                sizeSlideFrame(frameRef.current, 9 / 16, embedded);
            }
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [embedded, isLoading]);

    // After load, re-measure once layout settles (loading chrome unmounts / aspect class drops).
    useEffect(() => {
        if (isLoading) {
            return;
        }
        let raf2 = 0;
        const raf1 = requestAnimationFrame(() => {
            raf2 = requestAnimationFrame(() => {
                const viewer = viewerRef.current;
                const frameEl = frameRef.current;
                if (!viewer || !frameEl) {
                    return;
                }
                syncSlideFrameSize(frameEl, viewer, embedded);
            });
        });
        return () => {
            cancelAnimationFrame(raf1);
            if (raf2) cancelAnimationFrame(raf2);
        };
    }, [embedded, isLoading, slideCount]);

    const loadPresentation = useCallback(async () => {
        const requestId = loadRequestRef.current + 1;
        loadRequestRef.current = requestId;

        setIsLoading(true);
        setLoadingPhase('fetching');
        setError(null);

        // Destroy any existing viewer
        viewerRef.current?.destroy();
        viewerRef.current = null;

        if (!containerRef.current) return;

        try {
            const arrayBuffer = await fetchPresentation(url, refreshUrlRef.current);
            if (loadRequestRef.current !== requestId) return; // superseded

            const containerEl = containerRef.current;
            const frameEl = frameRef.current;
            if (!containerEl) return;

            setLoadingPhase('rendering');

            // Pre-size before open. PptxViewer forces position:relative on the
            // mount node and scales to container width only — a fixed `width`
            // option also disables its resize observer, so we must constrain
            // the frame first and omit `width` for adaptive contain.
            if (frameEl) {
                sizeSlideFrame(frameEl, 9 / 16, embedded);
            }

            const viewer = await PptxViewer.open(arrayBuffer, containerEl, {
                renderMode: 'slide',
                fitMode: 'contain',
                zipLimits: RECOMMENDED_ZIP_LIMITS,
                onSlideChange: (index: number) => {
                    setCurrentSlide(index);
                },
            });

            if (loadRequestRef.current !== requestId) {
                viewer.destroy();
                return;
            }

            if (frameEl) {
                syncSlideFrameSize(frameEl, viewer, embedded);
                // Force a second contain pass after the frame settles to the
                // real slide aspect (setFitMode is a no-op when already contain).
                await viewer.setFitMode('none');
                await viewer.setFitMode('contain');
            }

            viewerRef.current = viewer;
            setSlideCount(viewer.slideCount);
            setCurrentSlide(0);
            setIsLoading(false);
        } catch (err) {
            if (loadRequestRef.current !== requestId) return;
            setError(asErrorMessage(err));
            setIsLoading(false);
        }
    }, [url, embedded]);

    useEffect(() => {
        void loadPresentation();
    }, [loadPresentation]);

    // Re-fit the viewer when the window or slide frame is resized
    useEffect(() => {
        let resizeRaf = 0;
        const onResize = () => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = 0;
                const viewer = viewerRef.current;
                const frameEl = frameRef.current;
                if (!viewer || !frameEl) {
                    return;
                }
                // Omit fixed `width` so the library's container ResizeObserver
                // re-scales after we update the frame box.
                syncSlideFrameSize(frameEl, viewer, embedded);
            });
        };
        window.addEventListener('resize', onResize);
        const resizeTarget = frameRef.current?.parentElement;
        const observer = resizeTarget
            ? new ResizeObserver(() => {
                onResize();
            })
            : null;
        if (resizeTarget && observer) {
            observer.observe(resizeTarget);
        }
        return () => {
            window.removeEventListener('resize', onResize);
            observer?.disconnect();
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
        };
    }, [embedded]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            viewerRef.current?.destroy();
            viewerRef.current = null;
        };
    }, []);

    const goToSlide = useCallback((index: number) => {
        const viewer = viewerRef.current;
        if (!viewer) return;
        if (index >= 0 && index < viewer.slideCount) {
            void viewer.goToSlide(index);
            setCurrentSlide(index);
        }
    }, []);

    const handlePrevSlide = useCallback(() => {
        goToSlide(currentSlide - 1);
    }, [currentSlide, goToSlide]);

    const handleNextSlide = useCallback(() => {
        goToSlide(currentSlide + 1);
    }, [currentSlide, goToSlide]);

    const handleToggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    const handleRetry = useCallback(() => {
        void loadPresentation();
    }, [loadPresentation]);

    const renderThumbnail = useCallback((index: number, container: HTMLElement): PptThumbnailMount | null => {
        const viewer = viewerRef.current;
        if (!viewer) {
            return null;
        }
        container.replaceChildren();
        const handle = viewer.renderThumbnailToContainer(index, container, { width: 96 });
        if (!handle) {
            return null;
        }
        return {
            dispose: () => handle.dispose(),
            ready: handle.ready,
        };
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                handlePrevSlide();
            } else if (e.key === 'ArrowRight') {
                handleNextSlide();
            } else if (e.key === 'Home') {
                goToSlide(0);
            } else if (e.key === 'End') {
                goToSlide(slideCount - 1);
            } else if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handlePrevSlide, handleNextSlide, goToSlide, slideCount, isFullscreen]);

    return {
        frameRef,
        containerRef,
        slideCount,
        currentSlide,
        isLoading,
        loadingPhase,
        error,
        isFullscreen,
        goToSlide,
        handlePrevSlide,
        handleNextSlide,
        handleToggleFullscreen,
        handleRetry,
        isViewerReady: !isLoading && !error && slideCount > 0,
        renderThumbnail,
    };
}
