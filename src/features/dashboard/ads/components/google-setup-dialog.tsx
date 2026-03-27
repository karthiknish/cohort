'use client'

import { AlertTriangle, Loader2 } from 'lucide-react'
import { Chrome } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

type GoogleAdAccountOption = {
  id: string
  name: string
  currencyCode: string | null
  isManager: boolean
  loginCustomerId: string | null
  managerCustomerId: string | null
}

type GoogleSetupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  setupMessage: string | null
  accountOptions: GoogleAdAccountOption[]
  selectedAccountId: string
  onAccountSelectionChange: (accountId: string) => void
  loadingAccounts: boolean
  initializing: boolean
  onReloadAccounts: () => void
  onInitialize: () => void
}

export function GoogleSetupDialog({
  open,
  onOpenChange,
  setupMessage,
  accountOptions,
  selectedAccountId,
  onAccountSelectionChange,
  loadingAccounts,
  initializing,
  onReloadAccounts,
  onInitialize,
}: GoogleSetupDialogProps) {
  const noAccounts = !loadingAccounts && accountOptions.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-info/10 text-info">
              <Chrome className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>Complete Google Ads setup</DialogTitle>
              <DialogDescription>
                Choose which Google Ads account to sync into this workspace.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {setupMessage ? (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Setup issue</AlertTitle>
              <AlertDescription>{setupMessage}</AlertDescription>
            </Alert>
          ) : null}

          <div className="space-y-2">
            <p className="text-sm font-medium">Google Ads account</p>
            <Select
              value={selectedAccountId || undefined}
              onValueChange={onAccountSelectionChange}
              disabled={loadingAccounts || initializing || accountOptions.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingAccounts ? 'Loading accounts...' : 'Select Google Ads account'} />
              </SelectTrigger>
              <SelectContent>
                {accountOptions.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}{account.isManager ? ' (Manager)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {noAccounts ? (
              <p className="text-xs text-warning">
                No Google Ads accounts were found for this token. Verify account permissions, then reload.
              </p>
            ) : null}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onReloadAccounts}
            disabled={loadingAccounts || initializing}
          >
            {loadingAccounts ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              'Reload accounts'
            )}
          </Button>
          <Button
            type="button"
            onClick={onInitialize}
            disabled={initializing || loadingAccounts || !selectedAccountId}
          >
            {initializing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finishing...
              </>
            ) : (
              'Finish setup'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
