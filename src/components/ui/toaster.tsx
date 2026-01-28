'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { Toast, ToastAction, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'

/**
 * Legacy Toaster component.
 *
 * NOTE: This component is kept for backward compatibility but is now a no-op.
 * The actual toast rendering is handled by Sonner (via @/components/ui/sonner.tsx).
 *
 * The useToast hook now uses Sonner under the hood, so the toasts array will
 * always be empty. Sonner manages its own state and renders toasts directly.
 */
export function Toaster() {
  const { toasts, dismiss } = useToast()
  const router = useRouter()

  // Filter out toasts that are handled by Sonner (loading, info) or have no data
  const legacyToasts = toasts.filter(
    (t) => t.variant !== 'loading' && t.variant !== 'info'
  )

  if (legacyToasts.length === 0) {
    return null
  }

  return (
    <ToastProvider swipeDirection="right" duration={5000}>
      {legacyToasts.map(({ id, title, description, action, onNavigate, href, onMarkRead, persistent, undoLabel, onUndo, duration, ...props }) => {
        const { onOpenChange, ...restProps } = props

        const handleNavigate = () => {
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
          } catch (err) {
            // If navigation fails, keep toast
            console.error('[toast] navigation failed', err)
          }
        }

        const handleMarkRead = async () => {
          if (!onMarkRead) return
          try {
            await onMarkRead()
            dismiss(id)
          } catch (err) {
            // Keep toast open if marking as read fails
            console.error('[toast] mark as read failed', err)
          }
        }

        return (
          <Toast
            key={id}
            {...(restProps as Omit<typeof restProps, 'variant'> & { variant?: 'default' | 'success' | 'destructive' | 'warning' })}
            duration={duration ?? (persistent ? 0 : 5000)}
            onOpenChange={(open) => {
              onOpenChange?.(open)
              if (!open) {
                dismiss(id)
              }
            }}
            onClick={(event) => {
              const target = event.target as HTMLElement | null
              if (target?.closest('[data-toast-action="true"]')) return
              if (onNavigate || href) {
                handleNavigate()
              }
            }}
            role={onNavigate || href ? 'button' : restProps.role}
            tabIndex={onNavigate || href ? 0 : restProps.tabIndex}
            onKeyDown={(event) => {
              if (!onNavigate && !href) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                handleNavigate()
              }
            }}
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
                  onClick={(event) => {
                    event.stopPropagation()
                    onUndo()
                    dismiss(id)
                  }}
                >
                  {undoLabel ?? 'Undo'}
                </ToastAction>
              )}
              {onMarkRead && (
                <ToastAction
                  data-toast-action="true"
                  altText="Mark as read"
                  onPointerDown={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                  }}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    void handleMarkRead()
                  }}
                >
                  Mark as read
                </ToastAction>
              )}
              <ToastClose data-toast-action="true" onClick={() => dismiss(id)} />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
