'use client';
import { useEffect, useEffectEvent, useReducer, useRef } from 'react';
import JSZip from 'jszip';
import { createInitialPptViewerState, pptViewerReducer, type PptViewerProps, type Slide, } from './ppt-viewer-types';
export function usePptViewer({ url }: Pick<PptViewerProps, 'url'>) {
    const [state, dispatch] = useReducer(pptViewerReducer, undefined, createInitialPptViewerState);
    const { slides, currentSlide, isLoading, error, isFullscreen } = state;
    const loadRequestRef = useRef(0);
    const extractSlides = async (arrayBuffer: ArrayBuffer): Promise<Slide[]> => {
        const zip = await JSZip.loadAsync(arrayBuffer);
        const extractedSlides: Slide[] = [];
        const slideFiles = Object.keys(zip.files)
            .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
            .sort((a, b) => {
            const numA = parseInt(a.match(/slide(\d+)/)?.[1] || '0', 10);
            const numB = parseInt(b.match(/slide(\d+)/)?.[1] || '0', 10);
            return numA - numB;
        });
        const mediaFiles: Record<string, string> = {};
        const mediaEntries = Object.entries(zip.files).filter(([name]) => name.startsWith('ppt/media/'));
        await Promise.all(mediaEntries.map(async ([name, file]) => {
            const blob = await file.async('blob').catch(() => null);
            if (blob) {
                mediaFiles[name] = URL.createObjectURL(blob);
            }
        }));
        const mediaValues = Object.values(mediaFiles);
        const parsedSlides = await Promise.all(slideFiles.map(async (slideFile, i) => {
            if (!slideFile)
                return null;
            const slideNum = parseInt(slideFile.match(/slide(\d+)/)?.[1] || '0', 10);
            let imageUrl: string | null = null;
            let textContent = '';
            const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
            const relsFile = zip.files[relsPath];
            if (relsFile) {
                const relsContent = await relsFile.async('text').catch(() => null);
                if (relsContent) {
                    const imageMatch = relsContent.match(/Target="\.\.\/media\/(image\d+\.[^"]+)"/);
                    if (imageMatch) {
                        const mediaPath = `ppt/media/${imageMatch[1]}`;
                        imageUrl = mediaFiles[mediaPath] || null;
                    }
                }
            }
            const slideFileEntry = zip.files[slideFile];
            if (slideFileEntry) {
                const slideContent = await slideFileEntry.async('text').catch(() => null);
                if (slideContent) {
                    const textMatches = slideContent.match(/<a:t>([^<]*)<\/a:t>/g);
                    if (textMatches) {
                        textContent = textMatches
                            .flatMap((match: string | undefined) => {
                            const text = match?.replace(/<\/?a:t>/g, '') ?? '';
                            return text.trim() ? [text] : [];
                        })
                            .join(' ');
                    }
                }
            }
            if (!imageUrl && mediaValues.length > 0 && mediaValues[i]) {
                imageUrl = mediaValues[i] ?? null;
            }
            return {
                index: i,
                imageUrl,
                textContent: textContent.slice(0, 500),
            };
        }));
        extractedSlides.push(...parsedSlides.filter((slide): slide is NonNullable<typeof slide> => slide !== null));
        return extractedSlides;
    };
    const fetchPresentation = async (fileUrl: string): Promise<ArrayBuffer> => {
        const proxyUrl = `/api/proxy/file?url=${encodeURIComponent(fileUrl)}`;
        const response = await fetch(proxyUrl, {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Access denied. You may not have permission to view this file.');
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error((errorData as {
                error?: string;
            }).error || `Failed to fetch presentation: ${response.status}`);
        }
        return response.arrayBuffer();
    };
    const loadPresentation = useEffectEvent(() => {
        const requestId = loadRequestRef.current + 1;
        loadRequestRef.current = requestId;
        dispatch({ type: 'beginLoad' });
        void fetchPresentation(url)
            .then((arrayBuffer) => {
            if (loadRequestRef.current !== requestId)
                return null;
            return extractSlides(arrayBuffer);
        })
            .then((extractedSlides) => {
            if (loadRequestRef.current !== requestId || !extractedSlides)
                return;
            if (extractedSlides.length === 0) {
                throw new Error('No slides found in presentation');
            }
            dispatch({ type: 'loadResolved', slides: extractedSlides });
        })
            .catch((err) => {
            if (loadRequestRef.current !== requestId)
                return;
            dispatch({
                type: 'loadResolved',
                slides: [],
                error: err instanceof Error ? err.message : 'Failed to load presentation',
            });
        });
    });
    useEffect(() => {
        loadPresentation();
    }, [url]);
    useEffect(() => {
        return () => {
            slides.forEach((slide) => {
                if (slide.imageUrl) {
                    URL.revokeObjectURL(slide.imageUrl);
                }
            });
        };
    }, [slides]);
    const goToSlide = useEffectEvent((index: number) => {
        if (index >= 0 && index < slides.length) {
            dispatch({ type: 'setCurrentSlide', value: index });
        }
    });
    const handlePrevSlide = () => {
        goToSlide(currentSlide - 1);
    };
    const handleNextSlide = () => {
        goToSlide(currentSlide + 1);
    };
    const handleToggleFullscreen = () => {
        dispatch({ type: 'toggleFullscreen' });
    };
    const handleKeyDownRef = useRef<(e: KeyboardEvent) => void>(() => { });
    useEffect(() => {
        handleKeyDownRef.current = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goToSlide(currentSlide - 1);
            }
            else if (e.key === 'ArrowRight') {
                goToSlide(currentSlide + 1);
            }
            else if (e.key === 'Home') {
                goToSlide(0);
            }
            else if (e.key === 'End') {
                goToSlide(slides.length - 1);
            }
            else if (e.key === 'Escape' && isFullscreen) {
                dispatch({ type: 'setFullscreen', value: false });
            }
        };
    }, [currentSlide, isFullscreen, slides.length]);
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            handleKeyDownRef.current(e);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
    const handleRetry = () => {
        loadPresentation();
    };
    return {
        slides,
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
