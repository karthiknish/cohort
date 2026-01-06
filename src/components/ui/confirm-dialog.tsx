'use client'

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { LoaderCircle, TriangleAlert, Trash2, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive' | 'warning'
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel?: () => void
}

const variantConfig = {
  default: {
    icon: CircleCheck,
    iconClass: 'text-primary',
    bgClass: 'bg-primary/10',
    buttonVariant: 'default' as const,
  },
  destructive: {
    icon: Trash2,
    iconClass: 'text-destructive',
    bgClass: 'bg-destructive/10',
    buttonVariant: 'destructive' as const,
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'text-amber-600',
    bgClass: 'bg-amber-100',
    buttonVariant: 'default' as const,
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-full', config.bgClass)}>
              <Icon className={cn('h-6 w-6', config.iconClass)} />
            </div>
            <div className="space-y-2">
              <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="text-sm leading-relaxed">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2 sm:gap-3">
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading} asChild>
            <Button variant="outline" disabled={isLoading}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={config.buttonVariant}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
              {confirmLabel}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Hook for easy confirmation dialogs
interface UseConfirmDialogOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive' | 'warning'
}

export function useConfirmDialog(defaultOptions: UseConfirmDialogOptions) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null)
  const optionsRef = React.useRef(defaultOptions)

  const confirm = React.useCallback(
    (options?: Partial<UseConfirmDialogOptions>): Promise<boolean> => {
      if (options) {
        optionsRef.current = { ...defaultOptions, ...options }
      }
      setIsOpen(true)
      return new Promise((resolve) => {
        resolveRef.current = resolve
      })
    },
    [defaultOptions]
  )

  const handleConfirm = React.useCallback(() => {
    resolveRef.current?.(true)
    setIsOpen(false)
  }, [])

  const handleCancel = React.useCallback(() => {
    resolveRef.current?.(false)
    setIsOpen(false)
  }, [])

  const ConfirmDialogComponent = React.useCallback(
    () => (
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title={optionsRef.current.title}
        description={optionsRef.current.description}
        confirmLabel={optionsRef.current.confirmLabel}
        cancelLabel={optionsRef.current.cancelLabel}
        variant={optionsRef.current.variant}
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    ),
    [isOpen, isLoading, handleConfirm, handleCancel]
  )

  return {
    confirm,
    isOpen,
    setIsLoading,
    ConfirmDialog: ConfirmDialogComponent,
  }
}
