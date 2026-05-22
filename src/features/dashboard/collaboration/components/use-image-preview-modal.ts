'use client'

import { useCallback, useEffect, useEffectEvent, useMemo, useReducer, useRef } from 'react'

import { createInitialImagePreviewState, imagePreviewReducer } from './image-preview-modal-reducer'
import type { ImagePreviewModalProps } from './image-preview-modal-types'

export function useImagePreviewModal({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImagePreviewModalProps) {
  const [state, dispatch] = useReducer(imagePreviewReducer, undefined, createInitialImagePreviewState)
  const { indexOffset, zoom, isDragging, position } = state
  const dragStartRef = useRef({ x: 0, y: 0 })

  const normalizedIndex =
    images.length > 0
      ? ((initialIndex + indexOffset) % images.length + images.length) % images.length
      : 0

  const currentImage = images[normalizedIndex]
  const hasMultipleImages = images.length > 1

  const handleClose = useCallback(() => {
    dispatch({ type: 'close' })
    onClose()
  }, [onClose])

  const handlePrevious = useCallback(() => {
    dispatch({ type: 'navigate', direction: 'previous' })
  }, [])

  const handleNext = useCallback(() => {
    dispatch({ type: 'navigate', direction: 'next' })
  }, [])

  const handleZoomIn = useCallback(() => {
    dispatch({ type: 'zoomIn' })
  }, [])

  const handleZoomOut = useCallback(() => {
    dispatch({ type: 'zoomOut' })
  }, [])

  const handleSelectThumbnail = useCallback((offset: number) => {
    dispatch({ type: 'selectThumbnail', offset })
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        dispatch({ type: 'setIsDragging', value: true })
        dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y }
      }
    },
    [zoom, position]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        dispatch({
          type: 'setPosition',
          value: {
            x: e.clientX - dragStartRef.current.x,
            y: e.clientY - dragStartRef.current.y,
          },
        })
      }
    },
    [isDragging, zoom]
  )

  const handleMouseUp = useCallback(() => {
    dispatch({ type: 'setIsDragging', value: false })
  }, [])

  const handleOnOpenChange = useCallback(
    (open: boolean) => {
      if (!open) handleClose()
    },
    [handleClose]
  )

  const handleStopPropagation = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  const handleZoomOutClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleZoomOut()
    },
    [handleZoomOut]
  )

  const handleZoomInClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleZoomIn()
    },
    [handleZoomIn]
  )

  const handleCloseClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleClose()
    },
    [handleClose]
  )

  const handlePreviousClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handlePrevious()
    },
    [handlePrevious]
  )

  const handleNextClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      handleNext()
    },
    [handleNext]
  )

  const handleImageAreaKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    },
    [handleClose]
  )

  const handleImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (zoom === 1) {
        handleZoomIn()
      }
    },
    [zoom, handleZoomIn]
  )

  const imageStyle = useMemo(
    () => ({
      transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
    }),
    [zoom, position.x, position.y]
  )

  const handleWindowKeyDown = useEffectEvent((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        handleClose()
        break
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
        handleZoomOut()
        break
    }
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleWindowKeyDown(e)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
  }
}

export type UseImagePreviewModalReturn = ReturnType<typeof useImagePreviewModal>
