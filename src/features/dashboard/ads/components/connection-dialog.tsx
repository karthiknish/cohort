'use client'

import { memo, useCallback, useState } from 'react'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
} from '@/shared/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog'
import { Checkbox } from '@/shared/ui/checkbox'
import { ERROR_GUIDANCE, PROVIDER_INFO } from './constants'

import {
  ConnectionDialogBody,
  ConnectionDialogFooterActions,
  ConnectionDialogHeader,
  type ConnectionStep,
} from './connection-dialog-sections'

// =============================================================================
// TYPES
// =============================================================================

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
  onConfirm: (options: { clearHistoricalData: boolean }) => Promise<void>
  isDisconnecting: boolean
}

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
  const errorGuidance = error ? getErrorGuidance(error) : null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <ConnectionDialogHeader Icon={Icon} providerInfo={providerInfo} />
        <ConnectionDialogBody connectionStep={connectionStep} error={error} errorGuidance={errorGuidance} isInProgress={isInProgress} providerInfo={providerInfo} showPreConnect={showPreConnect} />
        <ConnectionDialogFooterActions connectionStep={connectionStep} error={error} handleClose={handleClose} handleConnect={handleConnect} isConnecting={isConnecting} isInProgress={isInProgress} onRetry={onRetry} providerInfo={providerInfo} showPreConnect={showPreConnect} />
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
  const [clearHistoricalData, setClearHistoricalData] = useState(false)

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setClearHistoricalData(false)
      }
      onOpenChange(nextOpen)
    },
    [onOpenChange]
  )

  const handleConfirm = useCallback(async () => {
    await onConfirm({ clearHistoricalData })
    onOpenChange(false)
  }, [clearHistoricalData, onConfirm, onOpenChange])

  const handleClearHistoricalDataChange = useCallback((checked: boolean | 'indeterminate') => {
    setClearHistoricalData(Boolean(checked))
  }, [])

  const checkboxId = `${providerName.replace(/\s+/g, '-').toLowerCase()}-clear-historical-data`

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Disconnect {providerName}?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>This will:</p>
            <ul className="ml-4 list-disc space-y-1 text-sm">
              <li>Stop all future data syncs from {providerName}</li>
              <li>Remove the connection to your {providerName} account</li>
              <li>Keep your existing synced data in Cohorts by default</li>
            </ul>
            <p className="pt-2">You can reconnect later to resume syncing.</p>
          </AlertDialogDescription>
          <div className="rounded-md border border-muted/60 p-3">
            <label htmlFor={checkboxId} className="flex items-start gap-3 text-sm">
              <Checkbox
                id={checkboxId}
                checked={clearHistoricalData}
                onCheckedChange={handleClearHistoricalDataChange}
                disabled={isDisconnecting}
                aria-label="Clear historical data"
              />
              <span>
                Also remove historical {providerName} metrics from this workspace.
              </span>
            </label>
          </div>
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

export { ConnectionProgress } from './connection-dialog-sections'
export type { ConnectionDialogProps, DisconnectDialogProps }
export type { ConnectionStep } from './connection-dialog-sections'
