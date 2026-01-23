'use client'

import { memo, useCallback, useState, useEffect } from 'react'
import { Check, ChevronRight, ExternalLink, Loader2, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { PROVIDER_INFO, PROVIDER_IDS, CONNECTION_STEPS, ERROR_GUIDANCE } from './constants'

// =============================================================================
// TYPES
// =============================================================================

export type ConnectionStep = 'idle' | 'redirecting' | 'authenticating' | 'fetching' | 'selecting' | 'syncing' | 'complete' | 'error'

// =============================================================================
// ERROR MESSAGE HELPERS
// =============================================================================

/**
 * Map raw error messages to user-friendly guidance
 */
function getErrorGuidance(error: string): { title: string; action: string } | null {
  const errorLower = error.toLowerCase()

  if (errorLower.includes('popup') || errorLower.includes('blocked')) {
    return ERROR_GUIDANCE.POPUP_BLOCKED
  }
  if (errorLower.includes('cancel') || errorLower.includes('closed')) {
    return ERROR_GUIDANCE.OAUTH_CANCELLED
  }
  if (errorLower.includes('denied') || errorLower.includes('declined')) {
    return ERROR_GUIDANCE.OAUTH_DENIED
  }
  if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return ERROR_GUIDANCE.TIMEOUT
  }
  if (errorLower.includes('network') || errorLower.includes('internet') || errorLower.includes('failed to fetch')) {
    return ERROR_GUIDANCE.NETWORK_ERROR
  }
  if (errorLower.includes('not configured') || errorLower.includes('environment')) {
    return ERROR_GUIDANCE.NOT_CONFIGURED
  }
  if (errorLower.includes('rate limit') || errorLower.includes('too many')) {
    return ERROR_GUIDANCE.RATE_LIMITED
  }
  if (errorLower.includes('no ad accounts') || errorLower.includes('no accounts')) {
    return ERROR_GUIDANCE.NO_AD_ACCOUNTS
  }

  return null
}

interface ConnectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerId: string | null
  providerIcon?: React.ComponentType<{ className?: string }>
  onConnect: () => Promise<void>
  isConnecting: boolean
  connectionStep: ConnectionStep
  error: string | null
  onRetry: () => void
}

interface DisconnectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providerName: string
  onConfirm: () => Promise<void>
  isDisconnecting: boolean
}

interface ConnectionProgressProps {
  step: ConnectionStep
  providerName: string
}

// =============================================================================
// CONNECTION PROGRESS COMPONENT
// =============================================================================

const STEP_CONFIG: Record<ConnectionStep, { label: string; order: number }> = {
  idle: { label: 'Ready to connect', order: 0 },
  redirecting: { label: CONNECTION_STEPS.REDIRECTING, order: 1 },
  authenticating: { label: CONNECTION_STEPS.AUTHENTICATING, order: 2 },
  fetching: { label: CONNECTION_STEPS.FETCHING_ACCOUNTS, order: 3 },
  selecting: { label: CONNECTION_STEPS.SELECTING_ACCOUNT, order: 4 },
  syncing: { label: CONNECTION_STEPS.SYNCING_DATA, order: 5 },
  complete: { label: CONNECTION_STEPS.COMPLETE, order: 6 },
  error: { label: 'Connection failed', order: -1 },
}

const ConnectionProgress = memo(function ConnectionProgress({ step, providerName }: ConnectionProgressProps) {
  const steps: ConnectionStep[] = ['redirecting', 'authenticating', 'fetching', 'selecting', 'syncing']
  const currentOrder = STEP_CONFIG[step].order

  if (step === 'idle' || step === 'error') return null

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {step === 'complete' ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        <div>
          <p className="font-medium">
            {step === 'complete' ? `${providerName} connected!` : `Connecting to ${providerName}`}
          </p>
          <p className="text-sm text-muted-foreground">{STEP_CONFIG[step].label}</p>
        </div>
      </div>

      {step !== 'complete' && (
        <div className="flex items-center gap-1">
          {steps.map((s, index) => {
            const stepOrder = STEP_CONFIG[s].order
            const isComplete = currentOrder > stepOrder
            const isCurrent = step === s

            return (
              <div key={s} className="flex items-center">
                <div
                  className={cn(
                    'h-2 w-8 rounded-full transition-colors',
                    isComplete && 'bg-primary',
                    isCurrent && 'bg-primary/50',
                    !isComplete && !isCurrent && 'bg-muted'
                  )}
                />
                {index < steps.length - 1 && <div className="h-[2px] w-1 bg-muted" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

// =============================================================================
// CONNECTION DIALOG COMPONENT
// =============================================================================

export const ConnectionDialog = memo(function ConnectionDialog({
  open,
  onOpenChange,
  providerId,
  providerIcon: Icon,
  onConnect,
  isConnecting,
  connectionStep,
  error,
  onRetry,
}: ConnectionDialogProps) {
  const providerInfo = providerId ? PROVIDER_INFO[providerId as keyof typeof PROVIDER_INFO] : null

  const handleConnect = useCallback(async () => {
    try {
      await onConnect()
    } catch {
      // Error handled by parent
    }
  }, [onConnect])

  const handleClose = useCallback(() => {
    if (!isConnecting || connectionStep === 'error' || connectionStep === 'complete') {
      onOpenChange(false)
    }
  }, [isConnecting, connectionStep, onOpenChange])

  if (!providerInfo || !providerId) return null

  const isInProgress = isConnecting && connectionStep !== 'idle' && connectionStep !== 'error' && connectionStep !== 'complete'
  const showPreConnect = connectionStep === 'idle' && !isConnecting && !error

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div>
              <DialogTitle>Connect {providerInfo.name}</DialogTitle>
              <DialogDescription className="text-sm">
                {providerInfo.estimatedSetupTime} setup
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pre-connection info */}
          {showPreConnect && (
            <>
              <div>
                <h4 className="mb-2 text-sm font-medium">What you&apos;ll get</h4>
                <ul className="space-y-1.5">
                  {providerInfo.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium">Requirements</h4>
                <ul className="space-y-1.5">
                  {providerInfo.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              {providerInfo.loginMethod === 'redirect' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <ExternalLink className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    You&apos;ll be redirected to {providerInfo.shortName} to log in. After granting access, you&apos;ll return here automatically.
                  </AlertDescription>
                </Alert>
              )}

              {providerInfo.loginMethod === 'popup' && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-sm text-blue-800">
                    A popup window will open for you to log in to {providerInfo.shortName}. Make sure popups are allowed for this site.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {/* Redirecting state - special handling for redirect-based OAuth */}
          {connectionStep === 'redirecting' && providerInfo.loginMethod === 'redirect' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <ArrowRight className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Redirecting to {providerInfo.shortName}</p>
                  <p className="text-sm text-muted-foreground">
                    You&apos;ll be taken to {providerInfo.shortName} to log in
                  </p>
                </div>
              </div>
              <Alert className="border-blue-200 bg-blue-50">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-sm text-blue-800">
                  After logging in, you&apos;ll be automatically redirected back here to complete setup.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Connection progress - for popup flows and post-redirect steps */}
          {((isInProgress && !(connectionStep === 'redirecting' && providerInfo.loginMethod === 'redirect')) || connectionStep === 'complete') && (
            <ConnectionProgress step={connectionStep} providerName={providerInfo.name} />
          )}

          {/* Error state */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{getErrorGuidance(error)?.title ?? 'Connection failed'}</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{error}</p>
                {getErrorGuidance(error)?.action && (
                  <p className="mt-2 text-xs font-medium opacity-90">
                    {getErrorGuidance(error)?.action}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Success state */}
          {connectionStep === 'complete' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-sm text-green-800">
                Your {providerInfo.name} account is now connected. We&apos;re syncing your last 90 days of data in the background.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {showPreConnect && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConnect} disabled={isConnecting}>
                {providerInfo.loginMethod === 'redirect' ? (
                  <>
                    Continue to {providerInfo.shortName}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  `Connect ${providerInfo.shortName}`
                )}
              </Button>
            </>
          )}

          {isInProgress && (
            <Button variant="outline" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </Button>
          )}

          {error && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={onRetry}>Try again</Button>
            </>
          )}

          {connectionStep === 'complete' && (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

// =============================================================================
// DISCONNECT CONFIRMATION DIALOG
// =============================================================================

export const DisconnectDialog = memo(function DisconnectDialog({
  open,
  onOpenChange,
  providerName,
  onConfirm,
  isDisconnecting,
}: DisconnectDialogProps) {
  const handleConfirm = useCallback(async () => {
    await onConfirm()
    onOpenChange(false)
  }, [onConfirm, onOpenChange])

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {providerName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>This will:</p>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li>Stop all future data syncs from {providerName}</li>
              <li>Remove the connection to your {providerName} account</li>
              <li>Keep your existing synced data in Cohorts</li>
            </ul>
            <p className="pt-2">You can reconnect at any time to resume syncing.</p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDisconnecting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDisconnecting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDisconnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disconnecting...
              </>
            ) : (
              'Disconnect'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
})

// =============================================================================
// EXPORTS
// =============================================================================

export { ConnectionProgress }
export type { ConnectionDialogProps, DisconnectDialogProps, ConnectionProgressProps }
