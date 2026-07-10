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

export interface UsePptViewerReturn {
    frameRef: React.RefObject<HTMLDivElement | null>;
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

function getSlideFrameMaxHeight(embedded: boolean): number {
    return embedded
        ? Math.min(window.innerHeight * 0.55, 480)
        : Math.min(window.innerHeight * 0.65, 560);
}

/** Size the visible slide frame from deck aspect ratio so slides stay inside the viewport. */
function syncSlideFrameSize(
    frameEl: HTMLElement,
    viewer: PptxViewer,
    embedded: boolean,
): void {
    const maxHeightPx = getSlideFrameMaxHeight(embedded);
    const slideWidth = viewer.slideWidth;
    const slideHeight = viewer.slideHeight;
    if (slideWidth <= 0 || slideHeight <= 0) {
        return;
    }

    const slideAspect = slideHeight / slideWidth;

    // Use getBoundingClientRect for the actual rendered size of the parent,
    // rather than clientWidth which can return unconstrained values in flex
    // layouts where the parent is a flex row wrapping the frame itself.
    const parentRect = frameEl.parentElement?.getBoundingClientRect();
    const parentWidth = parentRect?.width ?? frameEl.clientWidth;
    const maxWidthPx = Math.min(parentWidth, window.innerWidth - 48);

    let width = maxWidthPx;
    let height = width * slideAspect;
    if (height > maxHeightPx) {
        height = maxHeightPx;
        width = height / slideAspect;
    }

    // Clamp width to parent so the frame never extends past its container
    const constrainedWidth = Math.min(width, parentWidth);

    frameEl.style.width = `${Math.round(constrainedWidth)}px`;
    frameEl.style.height = `${Math.round(height)}px`;
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

            const containerEl = containerRef.current;
            const frameEl = frameRef.current;
            const parentWidth = frameEl?.parentElement?.clientWidth
                ?? containerEl.parentElement?.clientWidth
                ?? containerEl.clientWidth;
            const availableWidth = Math.min(parentWidth, window.innerWidth - 48);

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

            if (frameEl) {
                syncSlideFrameSize(frameEl, viewer, embedded);
            }
            await viewer.setFitMode('contain');

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
        const onResize = () => {
            const viewer = viewerRef.current;
            const frameEl = frameRef.current;
            if (!viewer || !frameEl) {
                return;
            }
            syncSlideFrameSize(frameEl, viewer, embedded);
            void viewer.setFitMode('contain');
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
        const handle = viewer.renderThumbnailToContainer(index, container, { width: 112 });
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
