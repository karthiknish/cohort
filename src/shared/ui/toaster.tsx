'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { asErrorMessage } from '@/lib/convex-errors'
import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/shared/ui/toast'
import { useToast } from '@/shared/ui/use-toast'
import { toast as showSonnerToast } from '@/shared/ui/sonner'

type LegacyToast = ReturnType<typeof useToast>['toasts'][number]

/**
 * Legacy Toaster component.
 *
 * NOTE: This component is kept for backward compatibility but is now a no-op.
 * The actual toast rendering is handled by Sonner (via @/shared/ui/sonner.tsx).
 *
 * The useToast hook now uses Sonner under the hood, so the toasts array will
 * always be empty. Sonner manages its own state and renders toasts directly.
 */
export function Toaster() {
  const { toasts, dismiss } = useToast()

  // Filter out toasts that are handled by Sonner (loading, info) or have no data
  const legacyToasts = toasts.filter(
    (t) => t.variant !== 'loading' && t.variant !== 'info'
  )

  if (legacyToasts.length === 0) {
    return null
  }

  return (
    <ToastProvider swipeDirection="right" duration={5000}>
      {legacyToasts.map((toast) => (
        <LegacyToastItem key={toast.id} dismiss={dismiss} toast={toast} />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

function LegacyToastItem({ dismiss, toast }: { dismiss: (toastId?: string) => void; toast: LegacyToast }) {
  const router = useRouter()

  const {
    id,
    title,
    description,
    action,
    onNavigate,
    href,
    onMarkRead,
    persistent,
    undoLabel,
    onUndo,
    duration,
    ...props
  } = toast

  const { onOpenChange, ...restProps } = props

  const handleNavigate = useCallback(() => {
    try {
      if (onNavigate) {
        onNavigate()
        dismiss(id)
        return
      }

      if (href) {
        router.push(href)
        dismiss(id)
      }
    } catch (error) {
      console.error('[toast] navigation failed', error)
      showSonnerToast.error('Could not open link', { description: asErrorMessage(error) })
    }
  }, [dismiss, href, id, onNavigate, router])

  const handleMarkRead = useCallback(async () => {
    if (!onMarkRead) return

    try {
      await onMarkRead()
      dismiss(id)
    } catch (error) {
      console.error('[toast] mark as read failed', error)
      showSonnerToast.error('Could not mark as read', { description: asErrorMessage(error) })
    }
  }, [dismiss, id, onMarkRead])

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange?.(open)
      if (!open) {
        dismiss(id)
      }
    },
    [dismiss, id, onOpenChange]
  )

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLLIElement>) => {
      const target = event.target as HTMLElement | null
      if (target?.closest('[data-toast-action="true"]')) return
      if (onNavigate || href) {
        handleNavigate()
      }
    },
    [handleNavigate, href, onNavigate]
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLLIElement>) => {
      if (!onNavigate && !href) return
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleNavigate()
      }
    },
    [handleNavigate, href, onNavigate]
  )

  const handleUndoClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation()
      onUndo?.()
      dismiss(id)
    },
    [dismiss, id, onUndo]
  )

  const handleMarkReadPointerDown = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
  }, [])

  const handleMarkReadClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault()
      event.stopPropagation()
      void handleMarkRead()
    },
    [handleMarkRead]
  )

  const handleCloseClick = useCallback(() => {
    dismiss(id)
  }, [dismiss, id])

  return (
    <Toast
      {...(restProps as Omit<typeof restProps, 'variant'> & { variant?: 'default' | 'success' | 'destructive' | 'warning' })}
      duration={duration ?? (persistent ? 0 : 5000)}
      onOpenChange={handleOpenChange}
      onClick={handleClick}
      role={onNavigate || href ? 'button' : restProps.role}
      tabIndex={onNavigate || href ? 0 : restProps.tabIndex}
      onKeyDown={handleKeyDown}
    >
      <div className="grid gap-1">
        {title && <ToastTitle>{title}</ToastTitle>}
        {description && <ToastDescription>{description}</ToastDescription>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {action}
        {onUndo && (
          <ToastAction
            data-toast-action="true"
            altText={undoLabel ?? 'Undo'}
            onClick={handleUndoClick}
          >
            {undoLabel ?? 'Undo'}
          </ToastAction>
        )}
        {onMarkRead && (
          <ToastAction
            data-toast-action="true"
            altText="Mark as read"
            onPointerDown={handleMarkReadPointerDown}
            onClick={handleMarkReadClick}
          >
            Mark as read
          </ToastAction>
        )}
        <ToastClose data-toast-action="true" onClick={handleCloseClick} />
      </div>
    </Toast>
  )
}
