'use client';
import { useCallback, useEffect, useEffectEvent, useMemo, useReducer, useRef } from 'react';
import { createInitialImagePreviewState, imagePreviewReducer } from './image-preview-modal-reducer';
import type { ImagePreviewModalProps } from './image-preview-modal-types';
export function useImagePreviewModal({ images, initialIndex = 0, isOpen, onClose, }: ImagePreviewModalProps) {
    const [state, dispatch] = useReducer(imagePreviewReducer, undefined, createInitialImagePreviewState);
    const { indexOffset, zoom, isDragging, position } = state;
    const dragStartRef = useRef({ x: 0, y: 0 });
    const normalizedIndex = images.length > 0
        ? ((initialIndex + indexOffset) % images.length + images.length) % images.length
        : 0;
    const currentImage = images[normalizedIndex];
    const hasMultipleImages = images.length > 1;
    const handleClose = () => {
        dispatch({ type: 'close' });
        onClose();
    };
    const handlePrevious = () => {
        dispatch({ type: 'navigate', direction: 'previous' });
    };
    const handleNext = () => {
        dispatch({ type: 'navigate', direction: 'next' });
    };
    const handleZoomIn = () => {
        dispatch({ type: 'zoomIn' });
    };
    const handleZoomOut = () => {
        dispatch({ type: 'zoomOut' });
    };
    const handleSelectThumbnail = (offset: number) => {
        dispatch({ type: 'selectThumbnail', offset });
    };
    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            dispatch({ type: 'setIsDragging', value: true });
            dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        }
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging && zoom > 1) {
            dispatch({
                type: 'setPosition',
                value: {
                    x: e.clientX - dragStartRef.current.x,
                    y: e.clientY - dragStartRef.current.y,
                },
            });
        }
    };
    const handleMouseUp = () => {
        dispatch({ type: 'setIsDragging', value: false });
    };
    const handleOnOpenChange = (open: boolean) => {
        if (!open)
            handleClose();
    };
    const handleStopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };
    const handleZoomOutClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleZoomOut();
    };
    const handleZoomInClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleZoomIn();
    };
    const handleCloseClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleClose();
    };
    const handlePreviousClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handlePrevious();
    };
    const handleNextClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        handleNext();
    };
    const handleImageAreaKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            handleClose();
        }
    };
    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (zoom === 1) {
            handleZoomIn();
        }
    };
    const imageStyle = ({
        transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
    });
    const handleWindowKeyDown = useEffectEvent((e: KeyboardEvent) => {
        if (!isOpen)
            return;
        switch (e.key) {
            case 'Escape':
                handleClose();
                break;
            case 'ArrowLeft':
                handlePrevious();
                break;
            case 'ArrowRight':
                handleNext();
                break;
            case '+':
            case '=':
                handleZoomIn();
                break;
            case '-':
                handleZoomOut();
                break;
        }
    });
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            handleWindowKeyDown(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    return {
        currentImage,
        hasMultipleImages,
        normalizedIndex,
        images,
        initialIndex,
        isOpen,
        zoom,
        isDragging,
        imageStyle,
        handleOnOpenChange,
        handleStopPropagation,
        handleZoomOutClick,
        handleZoomInClick,
        handleCloseClick,
        handlePreviousClick,
        handleNextClick,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleImageAreaKeyDown,
        handleImageClick,
        handleSelectThumbnail,
        handleClose,
    };
}
export type UseImagePreviewModalReturn = ReturnType<typeof useImagePreviewModal>;
