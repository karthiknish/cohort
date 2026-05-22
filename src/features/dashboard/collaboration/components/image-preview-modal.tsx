'use client'

import {
  ImagePreviewModalDialog,
} from './image-preview-modal-sections'
import { useImagePreviewModal } from './use-image-preview-modal'
import type { ImagePreviewModalProps } from './image-preview-modal-types'

export type { ImagePreviewModalProps } from './image-preview-modal-types'

export function ImagePreviewModal(props: ImagePreviewModalProps) {
  const dialogProps = useImagePreviewModal(props)
  return <ImagePreviewModalDialog {...dialogProps} />
}
