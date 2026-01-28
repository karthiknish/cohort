'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'
import { Skeleton, SkeletonCard, SkeletonTable, SkeletonList, SkeletonDashboardCard } from './skeleton'
import {
  EmptyState,
  NoDataEmptyState,
  NoResultsEmptyState,
  NoAccessEmptyState,
  NetworkErrorEmptyState,
} from './empty-state'
import { AlertCircle, RefreshCw, LucideIcon } from 'lucide-react'
import { Button } from './button'

// =============================================================================
// TYPES
// =============================================================================

export type StateWrapperLoadingVariant =
  | 'spinner'
  | 'skeleton-card'
  | 'skeleton-table'
  | 'skeleton-list'
  | 'skeleton-dashboard'
  | 'overlay'

export interface StateWrapperProps {
  // State control
  isLoading?: boolean
  isEmpty?: boolean
  isError?: boolean
  // Content
  children: React.ReactNode
  // Loading configuration
  loadingVariant?: StateWrapperLoadingVariant
  loadingMessage?: string
  skeletonRows?: number
  skeletonColumns?: number
  skeletonItems?: number
  // Empty state configuration
  emptyTitle?: string
  emptyDescription?: string
  emptyIcon?: LucideIcon
  emptyAction?: {
    label: string
    onClick: () => void
  }
  // Error state configuration
  errorTitle?: string
  errorDescription?: string
  error?: Error | string | null
  onRetry?: () => void
  // Styling
  className?: string
  contentClassName?: string
}

// =============================================================================
// ERROR STATE COMPONENT
// =============================================================================

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

function ErrorState({ title, description, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4', className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 ring-4 ring-destructive/5 mb-4">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title || 'Something went wrong'}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground text-center">{description}</p>
      )}
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline" className="mt-5">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  )
}

// =============================================================================
// LOADING STATE COMPONENT
// =============================================================================

interface LoadingStateProps {
  variant: StateWrapperLoadingVariant
  message?: string
  rows?: number
  columns?: number
  items?: number
}

function LoadingState({ variant, message, rows, columns, items }: LoadingStateProps) {
  if (variant === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Spinner size="lg" variant="primary" />
        {message && (
          <p className="mt-3 text-sm text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div className="flex flex-col items-center justify-center inset-0 bg-background/50 backdrop-blur-sm z-10">
        <Spinner size="lg" variant="primary" />
        {message && (
          <p className="mt-3 text-sm text-muted-foreground animate-pulse">{message}</p>
        )}
      </div>
    )
  }

  if (variant === 'skeleton-table') {
    return <SkeletonTable rows={rows} columns={columns} />
  }

  if (variant === 'skeleton-list') {
    return <SkeletonList items={items} />
  }

  if (variant === 'skeleton-dashboard') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SkeletonDashboardCard />
        <SkeletonDashboardCard />
        <SkeletonDashboardCard />
        <SkeletonDashboardCard />
      </div>
    )
  }

  // Default to skeleton-card
  if (variant === 'skeleton-card') {
    return <SkeletonCard />
  }

  return <Skeleton />
}

// =============================================================================
// MAIN STATE WRAPPER COMPONENT
// =============================================================================

export function StateWrapper({
  isLoading = false,
  isEmpty = false,
  isError = false,
  children,
  loadingVariant = 'spinner',
  loadingMessage,
  skeletonRows = 5,
  skeletonColumns = 4,
  skeletonItems = 5,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  emptyAction,
  errorTitle,
  errorDescription,
  error,
  onRetry,
  className,
  contentClassName,
}: StateWrapperProps) {
  // Error state takes precedence
  if (isError) {
    const errorMessage = typeof error === 'string' ? error : error?.message
    return (
      <ErrorState
        title={errorTitle}
        description={errorDescription || errorMessage}
        onRetry={onRetry}
        className={className}
      />
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={className}>
        <LoadingState
          variant={loadingVariant}
          message={loadingMessage}
          rows={skeletonRows}
          columns={skeletonColumns}
          items={skeletonItems}
        />
      </div>
    )
  }

  // Empty state
  if (isEmpty) {
    if (emptyIcon || emptyTitle) {
      return (
        <div className={className}>
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle || 'No data'}
            description={emptyDescription}
            action={emptyAction}
          />
        </div>
      )
    }
    // Default empty state
    return (
      <div className={className}>
        <NoDataEmptyState action={emptyAction} />
      </div>
    )
  }

  // Success - render children
  return <div className={contentClassName}>{children}</div>
}

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

export interface UseStateWrapperReturn {
  isLoading: boolean
  isEmpty: boolean
  isError: boolean
  error: Error | null
  data: unknown
}

export function useStateWrapper<Data = unknown>(
  state: {
    data?: Data | null
    isLoading?: boolean
    isError?: boolean
    error?: Error | null
  }
): UseStateWrapperReturn & { data: Data | null } {
  return {
    isLoading: state.isLoading ?? false,
    isEmpty: !state.isLoading && !state.data,
    isError: state.isError ?? false,
    error: state.error ?? null,
    data: state.data ?? null,
  }
}

// =============================================================================
// PRESET WRAPPERS
// =============================================================================

export interface AsyncStateWrapperProps<T> extends Omit<StateWrapperProps, 'isLoading' | 'isEmpty' | 'isError' | 'error'> {
  data?: T | null
  loading?: boolean
  error?: Error | null
}

export function AsyncStateWrapper<T>({
  data,
  loading = false,
  error = null,
  ...props
}: AsyncStateWrapperProps<T>) {
  const isLoading = loading
  const isEmpty = !loading && !data
  const isError = !loading && !!error

  return (
    <StateWrapper
      {...props}
      isLoading={isLoading}
      isEmpty={isEmpty}
      isError={isError}
      error={error}
    >
      {props.children}
    </StateWrapper>
  )
}
