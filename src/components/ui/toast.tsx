'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

type ToastPropsVariables = React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed bottom-4 right-4 z-[100] flex w-full max-w-xs flex-col gap-2 p-0 sm:bottom-6 sm:right-6 sm:max-w-sm',
        className
      )}
      {...props}
    />
  )
)
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-md border bg-background p-3 pr-8 text-sm shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        success: 'border-emerald-600 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-500 dark:text-emerald-50',
        destructive: 'border-destructive/50 bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      variant: 'success',
    },
  }
)

type ToastPrimitiveProps = ToastPropsVariables & VariantProps<typeof toastVariants>

type ToastVariantProps = VariantProps<typeof toastVariants>

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, ToastPrimitiveProps>(
  ({ className, variant, ...props }, ref) => (
    <ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props} />
  )
)
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Action>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        'inline-flex h-8 items-center justify-center rounded-md border border-input bg-transparent px-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
)
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Close
      ref={ref}
      className={cn('absolute right-2 top-2 rounded-md p-1 text-current opacity-70 transition hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', className)}
      aria-label="Dismiss notification"
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
)
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
  )
)
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Description ref={ref} className={cn('text-sm opacity-90', className)} {...props} />
  )
)
ToastDescription.displayName = ToastPrimitives.Description.displayName

export type { ToastPropsVariables as ToastProps, ToastVariantProps }
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, toastVariants }
