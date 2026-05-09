'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { interactiveTransitionClass } from '@/lib/animation-system'
import { cn } from '@/lib/utils'

type ToastPropsVariables = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>
type ToastViewportProps = React.ComponentPropsWithRef<typeof ToastPrimitives.Viewport>
type ToastPrimitiveProps = ToastPropsVariables & VariantProps<typeof toastVariants>
type ToastActionProps = React.ComponentPropsWithRef<typeof ToastPrimitives.Action>
type ToastCloseProps = React.ComponentPropsWithRef<typeof ToastPrimitives.Close>
type ToastTitleProps = React.ComponentPropsWithRef<typeof ToastPrimitives.Title>
type ToastDescriptionProps = React.ComponentPropsWithRef<typeof ToastPrimitives.Description>

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = ({ className, ref, ...props }: ToastViewportProps) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2 p-1 sm:bottom-6 sm:right-6 sm:max-w-sm max-h-[360px] overflow-y-auto',
      className
    )}
    {...props}
  />
)
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'focus-ring-subtle group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-lg border bg-background p-4 pr-8 text-sm shadow-lg transition-[transform,opacity,box-shadow] duration-[var(--motion-duration-normal)] ease-[var(--motion-ease-out)] motion-reduce:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-right-full data-[state=open]:slide-in-from-top-1 motion-reduce:animate-none',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground shadow-lg',
        success: 'border-success/20 bg-success/10 text-success',
        destructive: 'border-destructive/50 bg-destructive text-destructive-foreground shadow-lg',
        warning: 'border-warning/20 bg-warning/10 text-warning',
      },
    },
    defaultVariants: {
      variant: 'success',
    },
  }
)

type ToastVariantProps = VariantProps<typeof toastVariants>

const Toast = ({ className, variant, ref, ...props }: ToastPrimitiveProps) => (
  <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
)
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = ({ className, ref, ...props }: ToastActionProps) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'focus-ring-subtle inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
      interactiveTransitionClass,
      className
    )}
    {...props}
  />
)
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = ({ className, ref, ...props }: ToastCloseProps) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'focus-ring-subtle absolute right-2 top-2 rounded-md p-1 text-current opacity-70 hover:opacity-100',
      interactiveTransitionClass,
      className
    )}
    aria-label="Dismiss notification"
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
)
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = ({ className, ref, ...props }: ToastTitleProps) => (
  <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
)
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = ({ className, ref, ...props }: ToastDescriptionProps) => (
  <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
)
ToastDescription.displayName = ToastPrimitives.Description.displayName

export type { ToastPropsVariables as ToastProps, ToastVariantProps }
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, toastVariants }
