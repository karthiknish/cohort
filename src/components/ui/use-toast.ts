'use client'

import * as React from 'react'
import { toast as sonnerToast } from 'sonner'

import type { ToastProps, ToastVariantProps } from '@/components/ui/toast'

type ToastToDismiss = string

type Toast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: ToastVariantProps['variant'] | 'loading' | 'info'
  duration?: number
  persistent?: boolean
  undoLabel?: string
  onUndo?: () => void
  href?: string
  onNavigate?: () => void
  onMarkRead?: () => void
}

type ToastState = {
  toasts: Toast[]
}

const variantToMethod = {
  default: 'message' as const,
  destructive: 'error' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  info: 'info' as const,
  loading: 'loading' as const,
} as const

type ToastMethod = typeof variantToMethod[keyof typeof variantToMethod]

/**
 * Toast function using Sonner under the hood for robust notifications.
 * Maintains the same API as the legacy implementation for backward compatibility.
 */
export const toast = ({ ...props }: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).slice(2, 9)
  const method = variantToMethod[props.variant ?? 'default'] ?? 'message'

  // Handle undo action (special case for legacy compatibility)
  if (props.onUndo && props.undoLabel) {
    sonnerToast.message(props.title ?? '', {
      id,
      description: props.description,
      duration: props.persistent ? 0 : (props.duration ?? 5000),
      action: {
        label: props.undoLabel,
        onClick: () => {
          props.onUndo?.()
          sonnerToast.dismiss(id)
        },
      },
    })
  }
  // Handle link action
  else if (props.href && props.onNavigate) {
    sonnerToast.message(props.title ?? '', {
      id,
      description: props.description,
      duration: props.persistent ? 0 : (props.duration ?? 5000),
      action: {
        label: 'Open',
        onClick: () => {
          props.onNavigate?.()
        },
      },
    })
  }
  // Handle custom action (React node - render as description)
  else if (props.action) {
    sonnerToast.message(props.title ?? '', {
      id,
      description: props.description,
      duration: props.persistent ? 0 : (props.duration ?? 5000),
    })
  }
  // Standard toast based on variant
  else {
    if (props.variant === 'loading') {
      sonnerToast.loading(props.title ?? 'Loading...', {
        id,
        description: props.description,
      })
    } else if (props.variant === 'success') {
      sonnerToast.success(props.title ?? '', {
        id,
        description: props.description,
        duration: props.persistent ? 0 : (props.duration ?? 5000),
      })
    } else if (props.variant === 'destructive') {
      sonnerToast.error(props.title ?? '', {
        id,
        description: props.description,
        duration: props.persistent ? 0 : (props.duration ?? 5000),
      })
    } else if (props.variant === 'warning') {
      sonnerToast.warning(props.title ?? '', {
        id,
        description: props.description,
        duration: props.persistent ? 0 : (props.duration ?? 5000),
      })
    } else if (props.variant === 'info') {
      sonnerToast.info(props.title ?? '', {
        id,
        description: props.description,
        duration: props.persistent ? 0 : (props.duration ?? 5000),
      })
    } else {
      sonnerToast.message(props.title ?? '', {
        id,
        description: props.description,
        duration: props.persistent ? 0 : (props.duration ?? 5000),
      })
    }
  }

  const update = (updateProps: Toast) => {
    if (updateProps.variant === 'loading') {
      sonnerToast.loading(updateProps.title ?? 'Loading...', {
        id,
        description: updateProps.description,
      })
    } else if (updateProps.variant === 'success') {
      sonnerToast.success(updateProps.title ?? '', {
        id,
        description: updateProps.description,
        duration: updateProps.persistent ? 0 : (updateProps.duration ?? 5000),
      })
    } else if (updateProps.variant === 'destructive') {
      sonnerToast.error(updateProps.title ?? '', {
        id,
        description: updateProps.description,
        duration: updateProps.persistent ? 0 : (updateProps.duration ?? 5000),
      })
    } else if (updateProps.variant === 'warning') {
      sonnerToast.warning(updateProps.title ?? '', {
        id,
        description: updateProps.description,
        duration: updateProps.persistent ? 0 : (updateProps.duration ?? 5000),
      })
    } else if (updateProps.variant === 'info') {
      sonnerToast.info(updateProps.title ?? '', {
        id,
        description: updateProps.description,
        duration: updateProps.persistent ? 0 : (updateProps.duration ?? 5000),
      })
    } else {
      sonnerToast.message(updateProps.title ?? '', {
        id,
        description: updateProps.description,
        duration: updateProps.persistent ? 0 : (updateProps.duration ?? 5000),
      })
    }
  }

  const dismiss = () => sonnerToast.dismiss(id)

  return {
    id,
    dismiss,
    update,
  }
}

export type ToastT = ReturnType<typeof toast>

/**
 * Hook for managing toasts.
 * Now powered by Sonner under the hood for better performance and UX.
 */
export const useToast = () => {
  // Sonner manages its own state, so we just provide the toast function
  // and a dismiss function for compatibility
  const [state] = React.useState<ToastState>({ toasts: [] })

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  }
}
