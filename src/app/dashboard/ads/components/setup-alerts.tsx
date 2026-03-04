'use client'

import { AlertTriangle, CircleAlert, Loader2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type MetaAccountOption = {
  id: string
  name: string
  currency: string | null
  accountStatus: number | null
  isActive: boolean
}

interface SetupAlertsProps {
  // Meta alerts
  metaSetupMessage: string | null
  metaNeedsAccountSelection: boolean
  initializingMeta: boolean
  onInitializeMeta: () => void
  metaAccountOptions: MetaAccountOption[]
  selectedMetaAccountId: string
  onMetaAccountSelectionChange: (accountId: string) => void
  loadingMetaAccountOptions: boolean
  onReloadMetaAccountOptions: () => void
  // TikTok alerts
  tiktokSetupMessage: string | null
  tiktokNeedsAccountSelection: boolean
  initializingTikTok: boolean
  onInitializeTikTok: () => void
}

export function SetupAlerts({
  metaSetupMessage,
  metaNeedsAccountSelection,
  initializingMeta,
  onInitializeMeta,
  metaAccountOptions,
  selectedMetaAccountId,
  onMetaAccountSelectionChange,
  loadingMetaAccountOptions,
  onReloadMetaAccountOptions,
  tiktokSetupMessage,
  tiktokNeedsAccountSelection,
  initializingTikTok,
  onInitializeTikTok,
}: SetupAlertsProps) {
  // Show initializing state prominently
  if (initializingMeta || initializingTikTok) {
    const platform = initializingMeta ? 'Meta' : 'TikTok'
    return (
      <Alert className="border-primary/40 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
          <div>
            <AlertTitle className="text-sm font-semibold">
              Completing {platform} setup...
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Fetching your ad accounts and configuring sync. This usually takes 5-10 seconds.
            </AlertDescription>
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <>
      {metaSetupMessage && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" /> Meta setup issue
          </AlertTitle>
          <AlertDescription className="mt-1 text-xs leading-relaxed">
            {metaSetupMessage}
          </AlertDescription>
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={onInitializeMeta}>
              Try again
            </Button>
          </div>
        </Alert>
      )}

      {metaNeedsAccountSelection && !metaSetupMessage && (
        <Alert className="border-primary/40 bg-primary/5">
          <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
            <CircleAlert className="h-4 w-4 text-primary" /> Complete Meta setup
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3 text-xs text-muted-foreground">
            <p>Select a Meta ad account to finish setup and start syncing.</p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select
                value={selectedMetaAccountId || undefined}
                onValueChange={onMetaAccountSelectionChange}
                disabled={loadingMetaAccountOptions || initializingMeta || metaAccountOptions.length === 0}
              >
                <SelectTrigger className="sm:max-w-xs">
                  <SelectValue placeholder={loadingMetaAccountOptions ? 'Loading ad accounts...' : 'Select Meta ad account'} />
                </SelectTrigger>
                <SelectContent>
                  {metaAccountOptions.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button size="sm" variant="outline" onClick={onReloadMetaAccountOptions} disabled={loadingMetaAccountOptions || initializingMeta}>
                {loadingMetaAccountOptions ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Reload accounts'
                )}
              </Button>

              <Button size="sm" onClick={onInitializeMeta} disabled={initializingMeta || loadingMetaAccountOptions || !selectedMetaAccountId}>
                {initializingMeta ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Finishing...
                  </>
                ) : (
                  'Finish setup'
                )}
              </Button>
            </div>

            {!loadingMetaAccountOptions && metaAccountOptions.length === 0 ? (
              <p className="text-amber-700">No Meta ad accounts found for this token. Verify your Meta Business Manager permissions.</p>
            ) : null}
          </AlertDescription>
        </Alert>
      )}

      {tiktokSetupMessage && (
        <Alert className="border-amber-300 bg-amber-50 text-amber-900">
          <AlertTitle className="flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4" /> TikTok setup issue
          </AlertTitle>
          <AlertDescription className="mt-1 text-xs leading-relaxed">
            {tiktokSetupMessage}
          </AlertDescription>
          <div className="mt-2">
            <Button size="sm" variant="outline" onClick={onInitializeTikTok}>
              Try again
            </Button>
          </div>
        </Alert>
      )}

      {tiktokNeedsAccountSelection && !tiktokSetupMessage && (
        <Alert className="border-primary/40 bg-primary/5">
          <AlertTitle className="flex items-center justify-between gap-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <CircleAlert className="h-4 w-4 text-primary" /> Complete TikTok setup
            </span>
            <Button size="sm" onClick={onInitializeTikTok} disabled={initializingTikTok}>
              {initializingTikTok ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Finishing...
                </>
              ) : (
                'Finish setup'
              )}
            </Button>
          </AlertTitle>
          <AlertDescription className="mt-2 text-xs text-muted-foreground">
            One more step! Click &quot;Finish setup&quot; to select your TikTok ad account and start syncing.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}
