'use client'

import { AlertCircle, ArrowRight, Check, CheckCircle2, ChevronRight, ExternalLink, Loader2 } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type ConnectionStep = 'idle' | 'redirecting' | 'authenticating' | 'fetching' | 'selecting' | 'syncing' | 'complete' | 'error'

const STEP_CONFIG: Record<ConnectionStep, { label: string; order: number }> = {
  idle: { label: 'Ready to connect', order: 0 },
  redirecting: { label: 'Redirecting to provider', order: 1 },
  authenticating: { label: 'Authenticating account', order: 2 },
  fetching: { label: 'Fetching ad accounts', order: 3 },
  selecting: { label: 'Selecting account', order: 4 },
  syncing: { label: 'Syncing historical data', order: 5 },
  complete: { label: 'Connection complete', order: 6 },
  error: { label: 'Connection failed', order: -1 },
}

type ProviderInfoShape = {
  name: string
  shortName: string
  estimatedSetupTime: string
  benefits: readonly string[]
  requirements: readonly string[]
  loginMethod: 'redirect' | 'popup'
}

export function ConnectionDialogHeader({ Icon, providerInfo }: { Icon?: React.ComponentType<{ className?: string }>; providerInfo: ProviderInfoShape }) {
  return (
    <DialogHeader>
      <div className="flex items-center gap-3">
        {Icon ? <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span> : null}
        <div><DialogTitle>Connect {providerInfo.name}</DialogTitle><DialogDescription className="text-sm">{providerInfo.estimatedSetupTime} setup</DialogDescription></div>
      </div>
    </DialogHeader>
  )
}

export function ConnectionProgress({ step, providerName }: { step: ConnectionStep; providerName: string }) {
  const steps: ConnectionStep[] = ['redirecting', 'authenticating', 'fetching', 'selecting', 'syncing']
  const currentOrder = STEP_CONFIG[step].order

  if (step === 'idle' || step === 'error') return null

  return (
    <div className="space-y-4"><div className="flex items-center gap-3">{step === 'complete' ? <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600"><CheckCircle2 className="h-5 w-5" /></div> : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}<div><p className="font-medium">{step === 'complete' ? `${providerName} connected!` : `Connecting to ${providerName}`}</p><p className="text-sm text-muted-foreground">{STEP_CONFIG[step].label}</p></div></div>{step !== 'complete' ? <div className="flex items-center gap-1">{steps.map((current, index) => { const stepOrder = STEP_CONFIG[current].order; const isComplete = currentOrder > stepOrder; const isCurrent = step === current; return <div key={current} className="flex items-center"><div className={cn('h-2 w-8 rounded-full transition-colors', isComplete && 'bg-primary', isCurrent && 'bg-primary/50', !isComplete && !isCurrent && 'bg-muted')} />{index < steps.length - 1 ? <div className="h-[2px] w-1 bg-muted" /> : null}</div> })}</div> : null}</div>
  )
}

export function ConnectionDialogBody({ connectionStep, error, errorGuidance, isInProgress, providerInfo, showPreConnect }: { connectionStep: ConnectionStep; error: string | null; errorGuidance: { title: string; action: string } | null; isInProgress: boolean; providerInfo: ProviderInfoShape; showPreConnect: boolean }) {
  return (
    <div className="space-y-4 py-4">
      {showPreConnect ? <><div><h4 className="mb-2 text-sm font-medium">What you&apos;ll get</h4><ul className="space-y-1.5">{providerInfo.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground"><Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />{benefit}</li>)}</ul></div><div><h4 className="mb-2 text-sm font-medium">Requirements</h4><ul className="space-y-1.5">{providerInfo.requirements.map((requirement) => <li key={requirement} className="flex items-start gap-2 text-sm text-muted-foreground"><ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/60" />{requirement}</li>)}</ul></div>{providerInfo.loginMethod === 'redirect' ? <Alert className="border-primary/20 bg-primary/5"><ExternalLink className="h-4 w-4 text-primary" /><AlertDescription className="text-sm text-foreground">You&apos;ll be redirected to {providerInfo.shortName} to log in. After granting access, you&apos;ll return here automatically.</AlertDescription></Alert> : null}{providerInfo.loginMethod === 'popup' ? <Alert className="border-primary/20 bg-primary/5"><AlertCircle className="h-4 w-4 text-primary" /><AlertDescription className="text-sm text-foreground">A popup window will open for you to log in to {providerInfo.shortName}. Make sure popups are allowed for this site.</AlertDescription></Alert> : null}</> : null}
      {connectionStep === 'redirecting' && providerInfo.loginMethod === 'redirect' ? <div className="space-y-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"><ArrowRight className="h-5 w-5 text-primary" /></div><div><p className="font-medium">Redirecting to {providerInfo.shortName}</p><p className="text-sm text-muted-foreground">You&apos;ll be taken to {providerInfo.shortName} to log in</p></div></div><Alert className="border-primary/20 bg-primary/5"><ExternalLink className="h-4 w-4 text-primary" /><AlertDescription className="text-sm text-foreground">After logging in, you&apos;ll be automatically redirected back here to complete setup.</AlertDescription></Alert></div> : null}
      {(isInProgress && !(connectionStep === 'redirecting' && providerInfo.loginMethod === 'redirect')) || connectionStep === 'complete' ? <ConnectionProgress step={connectionStep} providerName={providerInfo.name} /> : null}
      {error ? <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>{errorGuidance?.title ?? 'Connection failed'}</AlertTitle><AlertDescription className="space-y-2"><p>{error}</p>{errorGuidance?.action ? <p className="mt-2 text-xs font-medium opacity-90">{errorGuidance.action}</p> : null}</AlertDescription></Alert> : null}
      {connectionStep === 'complete' ? <Alert className="border-green-200 bg-green-50"><CheckCircle2 className="h-4 w-4 text-green-600" /><AlertDescription className="text-sm text-green-800">Your {providerInfo.name} account is now connected. We&apos;re syncing your last 90 days of data in the background.</AlertDescription></Alert> : null}
    </div>
  )
}

export function ConnectionDialogFooterActions({ connectionStep, handleClose, handleConnect, isConnecting, isInProgress, onRetry, providerInfo, showPreConnect, error }: { connectionStep: ConnectionStep; handleClose: () => void; handleConnect: () => void; isConnecting: boolean; isInProgress: boolean; onRetry: () => void; providerInfo: ProviderInfoShape; showPreConnect: boolean; error: string | null }) {
  return (
    <DialogFooter className="gap-2 sm:gap-0">{showPreConnect ? <><Button variant="outline" onClick={handleClose}>Cancel</Button><Button onClick={handleConnect} disabled={isConnecting}>{providerInfo.loginMethod === 'redirect' ? <>Continue to {providerInfo.shortName}<ExternalLink className="ml-2 h-4 w-4" /></> : `Connect ${providerInfo.shortName}`}</Button></> : null}{isInProgress ? <Button variant="outline" disabled><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connecting…</Button> : null}{error ? <><Button variant="outline" onClick={handleClose}>Cancel</Button><Button onClick={onRetry}>Try again</Button></> : null}{connectionStep === 'complete' ? <Button onClick={handleClose}>Done</Button> : null}</DialogFooter>
  )
}