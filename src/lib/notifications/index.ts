/**
 * Centralized Notification System
 *
 * Provides a unified API for user-facing notifications using Sonner.
 * This system complements the legacy toast() function with a more robust, type-safe API.
 *
 * Features:
 * - Success, Error, Warning, Info, Loading toasts
 * - Promise-based toasts that automatically handle loading/success/error states
 * - Consistent theming and positioning
 * - TypeScript type safety
 * - Action buttons on toasts
 * - Dismissal handling
 */

import { toast as sonnerToast } from 'sonner'
import * as React from 'react'

// =============================================================================
// TYPES
// =============================================================================

export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'

type BaseToastOptions = {
  /** Optional title for the toast */
  title?: string
  /** Main message content (renders as description in Sonner) */
  message: string
  /** Optional description (renders below message) */
  description?: string
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Auto-dismiss duration in milliseconds (default varies by type) */
  duration?: number
  /** Position on screen */
  position?: ToastPosition
  /** Custom icon (React node) */
  icon?: React.ReactNode
  /** onDismiss callback */
  onDismiss?: () => void
  /** onAutoClose callback */
  onAutoClose?: () => void
}

type SuccessToastOptions = BaseToastOptions & {
  variant?: 'success'
}

type ErrorToastOptions = BaseToastOptions & {
  variant?: 'error'
}

type WarningToastOptions = BaseToastOptions & {
  variant?: 'warning'
}

type InfoToastOptions = BaseToastOptions & {
  variant?: 'info'
}

type LoadingToastOptions = {
  title?: string
  message: string
  description?: string
  position?: ToastPosition
}

// =============================================================================
// NOTIFICATION FUNCTIONS
// =============================================================================

/**
 * Show a success notification
 */
export function notifySuccess(options: SuccessToastOptions): string | number {
  return sonnerToast.success(options.message, {
    id: options.title,
    description: options.description,
    duration: options.duration ?? 4000,
    position: options.position,
    icon: options.icon,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
    action: options.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

/**
 * Show an error notification
 */
export function notifyError(options: ErrorToastOptions): string | number {
  return sonnerToast.error(options.message, {
    id: options.title,
    description: options.description,
    duration: options.duration ?? 6000,
    position: options.position,
    icon: options.icon,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
    action: options.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

/**
 * Show a warning notification
 */
export function notifyWarning(options: WarningToastOptions): string | number {
  return sonnerToast.warning(options.message, {
    id: options.title,
    description: options.description,
    duration: options.duration ?? 5000,
    position: options.position,
    icon: options.icon,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
    action: options.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

/**
 * Show an info notification
 */
export function notifyInfo(options: InfoToastOptions): string | number {
  return sonnerToast.info(options.message, {
    id: options.title,
    description: options.description,
    duration: options.duration ?? 4000,
    position: options.position,
    icon: options.icon,
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
    action: options.action ? {
      label: options.action.label,
      onClick: options.action.onClick,
    } : undefined,
  })
}

/**
 * Show a loading notification (does not auto-dismiss)
 * Returns a function to dismiss the toast
 */
export function notifyLoading(options: LoadingToastOptions): string | number {
  return sonnerToast.loading(options.title ?? 'Loading...', {
    description: options.description ?? options.message,
    position: options.position,
  })
}

/**
 * Show a promise toast - automatically handles loading, success, and error states
 */
export function notifyPromise<T = void>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((result: T) => string)
    error: string | ((error: Error) => string)
  }
): void {
  sonnerToast.promise(promise, messages)
}

/**
 * Convenience function for API operations with standard error handling
 */
export async function notifyApiCall<T>(
  operation: string,
  apiCall: () => Promise<T>,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (result: T) => void
    onError?: (error: Error) => void
  }
): Promise<T | undefined> {
  try {
    const result = await apiCall()
    if (options?.successMessage) {
      notifySuccess({
        title: operation,
        message: options.successMessage,
      })
    }
    options?.onSuccess?.(result)
    return result
  } catch (error) {
    const errorMessage = options?.errorMessage ??
      (error instanceof Error ? error.message : 'An unexpected error occurred')
    notifyError({
      title: `${operation} failed`,
      message: errorMessage,
    })
    options?.onError?.(error as Error)
    return undefined
  }
}

/**
 * Dismiss a toast by ID
 */
export function dismissToast(id: string | number): void {
  sonnerToast.dismiss(id)
}

/**
 * Dismiss all toasts
 */
export function dismissAllToasts(): void {
  sonnerToast.dismiss()
}

// =============================================================================
// RE-EXPORT SONNER FOR DIRECT USE
// =============================================================================

export { toast } from 'sonner'
export type { ToastT } from 'sonner'

// =============================================================================
// EMAIL NOTIFICATIONS (Brevo)
// =============================================================================

export {
  sendTransactionalEmail,
  notifyInvoicePaidEmail,
  notifyInvoiceSentEmail,
  notifyProjectCreatedEmail,
  notifyTaskAssignedEmail,
  notifyMentionEmail,
  notifyProposalReadyEmail,
  notifyIntegrationAlertEmail,
  notifyWorkspaceInviteEmail,
  notifyPerformanceDigestEmail,
  notifyTaskActivityEmail,
  notifyInvoicePaymentFailedEmail,
  checkBrevoHealth,
} from './brevo'

export type { BrevoEmailResult, BrevoSendOptions } from './brevo'

// Re-export email templates
export * from './email-templates'

// =============================================================================
// CONVENIENCE FUNCTIONS FOR COMMON PATTERNS
// =============================================================================

/**
 * Show a toast with an undo action
 */
export function notifyWithUndo(options: {
  message: string
  onUndo: () => void
  undoLabel?: string
}): string | number {
  return sonnerToast.message('', {
    description: options.message,
    duration: 6000,
    action: {
      label: options.undoLabel ?? 'Undo',
      onClick: () => {
        options.onUndo()
        sonnerToast.dismiss()
      },
    },
  })
}

/**
 * Show a confirmation toast with a destructive action
 */
export function notifyConfirmation(options: {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  cancelLabel?: string
}): string | number {
  return sonnerToast.message(options.title, {
    description: options.message,
    duration: 0, // Persistent - requires user action
    action: {
      label: options.confirmLabel,
      onClick: () => {
        options.onConfirm()
        sonnerToast.dismiss()
      },
    },
    cancel: options.cancelLabel ? {
      label: options.cancelLabel,
      onClick: () => sonnerToast.dismiss(),
    } : undefined,
  })
}

/**
 * Copy to clipboard with notification
 */
export async function notifyCopy(text: string, label?: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text)
    notifySuccess({
      message: label ? `${label} copied to clipboard` : 'Copied to clipboard',
      duration: 2000,
    })
  } catch {
    notifyError({
      message: 'Failed to copy to clipboard',
    })
  }
}

/**
 * Show network error notification
 */
export function notifyNetworkError(context?: string): string | number {
  return notifyError({
    title: 'Connection Error',
    message: context
      ? `Unable to connect. Please check your internet connection and try again.`
      : 'Network error. Please check your connection and try again.',
    duration: 6000,
  })
}

/**
 * Show validation error notification
 */
export function notifyValidationError(errors: string[] | Record<string, string>): string | number {
  const message = Array.isArray(errors)
    ? errors.join(', ')
    : Object.values(errors).join(', ')

  return notifyError({
    title: 'Validation Error',
    message: message || 'Please check your input and try again.',
    duration: 5000,
  })
}

/**
 * Show operation completed notification
 */
export function notifyCompleted(operation: string, details?: string): string | number {
  return notifySuccess({
    title: operation,
    message: details ?? 'Operation completed successfully.',
    duration: 3000,
  })
}

/**
 * Show operation failed notification
 */
export function notifyFailed(operation: string, details?: string): string | number {
  return notifyError({
    title: `${operation} failed`,
    message: details ?? 'Please try again later.',
    duration: 6000,
  })
}

/**
 * Show a notification for a successful resource creation/update
 */
export function notifyResourceCreated(resource: string, name?: string): string | number {
  return notifySuccess({
    message: name
      ? `${resource} "${name}" created successfully`
      : `${resource} created successfully`,
    duration: 3000,
  })
}

/**
 * Show a notification for a successful resource update
 */
export function notifyResourceUpdated(resource: string, name?: string): string | number {
  return notifySuccess({
    message: name
      ? `${resource} "${name}" updated successfully`
      : `${resource} updated successfully`,
    duration: 3000,
  })
}

/**
 * Show a notification for a successful resource deletion
 */
export function notifyResourceDeleted(resource: string, name?: string): string | number {
  return notifySuccess({
    message: name
      ? `${resource} "${name}" deleted successfully`
      : `${resource} deleted successfully`,
    duration: 3000,
  })
}

/**
 * Show a notification when sync starts
 */
export function notifySyncStarted(providerName: string): string | number {
  return notifyInfo({
    title: 'Sync started',
    message: `Syncing data from ${providerName}...`,
  })
}

/**
 * Show a notification when sync completes
 */
export function notifySyncCompleted(providerName: string, recordCount?: number): string | number {
  return notifySuccess({
    title: 'Sync complete',
    message: recordCount
      ? `${providerName}: ${recordCount} records synced`
      : `${providerName} synced successfully`,
  })
}

/**
 * Show a notification when sync fails
 */
export function notifySyncFailed(providerName: string, error?: string): string | number {
  return notifyError({
    title: 'Sync failed',
    message: error
      ? `${providerName}: ${error}`
      : `Failed to sync ${providerName}. Please try again.`,
  })
}

// =============================================================================
// HOOK FOR COMPONENTS
// =============================================================================

/**
 * Hook that provides notification functions with stable references
 */
export function useNotifications() {
  return {
    success: React.useCallback(notifySuccess, []),
    error: React.useCallback(notifyError, []),
    warning: React.useCallback(notifyWarning, []),
    info: React.useCallback(notifyInfo, []),
    loading: React.useCallback(notifyLoading, []),
    promise: React.useCallback(notifyPromise, []),
    apiCall: React.useCallback(notifyApiCall, []),
    withUndo: React.useCallback(notifyWithUndo, []),
    confirmation: React.useCallback(notifyConfirmation, []),
    copy: React.useCallback(notifyCopy, []),
    networkError: React.useCallback(notifyNetworkError, []),
    validationError: React.useCallback(notifyValidationError, []),
    completed: React.useCallback(notifyCompleted, []),
    failed: React.useCallback(notifyFailed, []),
    resourceCreated: React.useCallback(notifyResourceCreated, []),
    resourceUpdated: React.useCallback(notifyResourceUpdated, []),
    resourceDeleted: React.useCallback(notifyResourceDeleted, []),
    syncStarted: React.useCallback(notifySyncStarted, []),
    syncCompleted: React.useCallback(notifySyncCompleted, []),
    syncFailed: React.useCallback(notifySyncFailed, []),
    dismiss: React.useCallback(dismissToast, []),
    dismissAll: React.useCallback(dismissAllToasts, []),
  }
}
