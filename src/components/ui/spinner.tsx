'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'muted'
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
}

const variantClasses = {
  default: 'text-foreground',
  primary: 'text-primary',
  muted: 'text-muted-foreground',
}

export function Spinner({ className, size = 'md', variant = 'default', ...props }: SpinnerProps) {
  return (
    <div role="status" aria-label="Loading" {...props}>
      <Loader2
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      />
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string
  fullScreen?: boolean
}

export function LoadingOverlay({ 
  className, 
  message = 'Loading...', 
  fullScreen = false,
  ...props 
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm',
        fullScreen ? 'fixed inset-0 z-50' : 'absolute inset-0 rounded-lg',
        className
      )}
      {...props}
    >
      <div className="relative">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <Spinner size="lg" variant="primary" />
      </div>
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  )
}

export interface LoadingButtonProps {
  isLoading?: boolean
  loadingText?: string
  children: React.ReactNode
}

export function LoadingContent({ 
  isLoading, 
  loadingText = 'Loading...', 
  children 
}: LoadingButtonProps) {
  if (isLoading) {
    return (
      <>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{loadingText}</span>
      </>
    )
  }
  return <>{children}</>
}

// Progress bar for longer operations
export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number // 0-100
  showLabel?: boolean
  variant?: 'default' | 'success' | 'warning' | 'error'
}

export function ProgressBar({ 
  className, 
  progress, 
  showLabel = false,
  variant = 'default',
  ...props 
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))
  
  const variantColors = {
    default: 'bg-primary',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-destructive',
  }

  return (
    <div className={cn('w-full', className)} {...props}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300 ease-out',
            variantColors[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}
