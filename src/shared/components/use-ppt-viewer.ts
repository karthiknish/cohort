'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PptxViewer, RECOMMENDED_ZIP_LIMITS } from '@aiden0z/pptx-renderer';
import { asErrorMessage } from '@/lib/convex-errors';

export interface UsePptViewerOptions {
    url: string;
    /** Optional callback to fetch a fresh signed URL when the current one expires (503). */
    refreshUrl?: () => Promise<string | null>;
}

export interface UsePptViewerReturn {
    containerRef: React.RefObject<HTMLDivElement | null>;
    slideCount: number;
    currentSlide: number;
    isLoading: boolean;
    error: string | null;
    isFullscreen: boolean;
    goToSlide: (index: number) => void;
    handlePrevSlide: () => void;
    handleNextSlide: () => void;
    handleToggleFullscreen: () => void;
    handleRetry: () => void;
}

/**
 * Fetch a PPTX file through the proxy with retry + expired-URL refresh logic.
 * Returns an ArrayBuffer suitable for passing to PptxViewer.
 */
async function fetchPresentation(
    fileUrl: string,
    refreshUrl: (() => Promise<string | null>) | undefined,
): Promise<ArrayBuffer> {
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

export function usePptViewer({ url, refreshUrl }: UsePptViewerOptions): UsePptViewerReturn {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const viewerRef = useRef<PptxViewer | null>(null);
    const refreshUrlRef = useRef(refreshUrl);
    refreshUrlRef.current = refreshUrl;
    const loadRequestRef = useRef(0);

    const [slideCount, setSlideCount] = useState(0);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const loadPresentation = useCallback(async () => {
        const requestId = loadRequestRef.current + 1;
        loadRequestRef.current = requestId;

        setIsLoading(true);
        setError(null);

        // Destroy any existing viewer
        viewerRef.current?.destroy();
        viewerRef.current = null;

        if (!containerRef.current) return;

        try {
            const arrayBuffer = await fetchPresentation(url, refreshUrlRef.current);
            if (loadRequestRef.current !== requestId) return; // superseded

            // The page layout container can be wider than the viewport (max-w-[1600px]).
            // Cap the viewer width to the viewport so slides scale to fit the visible area
            // instead of being scaled up to match the oversized container.
            const containerEl = containerRef.current;
            const availableWidth = Math.min(containerEl.clientWidth, window.innerWidth);
            containerEl.style.maxWidth = `${availableWidth}px`;

            const viewer = await PptxViewer.open(arrayBuffer, containerEl, {
                renderMode: 'slide',
                fitMode: 'contain',
                width: availableWidth,
                zipLimits: RECOMMENDED_ZIP_LIMITS,
                onSlideChange: (index: number) => {
                    setCurrentSlide(index);
                },
            });

            if (loadRequestRef.current !== requestId) {
                viewer.destroy();
                return;
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
    }, [url]);

    useEffect(() => {
        void loadPresentation();
    }, [loadPresentation]);

    // Re-fit the viewer when the window is resized
    useEffect(() => {
        const onResize = () => {
            const viewer = viewerRef.current;
            const containerEl = containerRef.current;
            if (!viewer || !containerEl) return;
            const availableWidth = Math.min(containerEl.clientWidth, window.innerWidth);
            void viewer.setFitMode('contain');
            // The viewer reads container width on fit; cap it for oversized layouts
            containerEl.style.maxWidth = `${availableWidth}px`;
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

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
        containerRef,
        slideCount,
        currentSlide,
        isLoading,
        error,
        isFullscreen,
        goToSlide,
        handlePrevSlide,
        handleNextSlide,
        handleToggleFullscreen,
        handleRetry,
    };
}
