'use client'

import * as React from 'react'

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast'
import { useToast } from '@/components/ui/use-toast'

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider swipeDirection="right" duration={4000}>
      {toasts.map(({ id, title, description, action, ...props }) => {
        const { onOpenChange, ...restProps } = props

        return (
          <Toast
            key={id}
            {...restProps}
            onOpenChange={(open) => {
              onOpenChange?.(open)
              if (!open) {
                dismiss(id)
              }
            }}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
