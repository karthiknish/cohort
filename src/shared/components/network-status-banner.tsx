'use client'

import { useSyncExternalStore } from 'react'
import { Cloud, CloudOff, WifiOff } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { cn } from '@/lib/utils'

function subscribeOnlineStatus(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('online', onStoreChange)
  window.addEventListener('offline', onStoreChange)

  return () => {
    window.removeEventListener('online', onStoreChange)
    window.removeEventListener('offline', onStoreChange)
  }
}

function getOnlineSnapshot() {
  if (typeof navigator === 'undefined') {
    return true
  }

  return navigator.onLine
}

export function useOnlineStatus() {
  return useSyncExternalStore(subscribeOnlineStatus, getOnlineSnapshot, () => true)
}

export function NetworkStatusBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="border-b border-warning/20 bg-warning/10 px-4 py-2 text-warning md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl items-center gap-2 text-sm font-medium">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>You're offline. Changes will sync when your connection returns.</span>
      </div>
    </div>
  )
}

export function SyncStatusBadge({ showLabel = false }: { showLabel?: boolean }) {
  const isOnline = useOnlineStatus()

  return (
    <Badge
      variant={isOnline ? 'outline' : 'secondary'}
      className={cn(
        'gap-1.5',
        isOnline
          ? 'bg-success/10 text-success border-success/20'
          : 'bg-warning/10 text-warning border-warning/20'
      )}
    >
      {isOnline ? (
        <>
          <Cloud className="h-3 w-3" />
          {showLabel ? <span className="text-[10px] font-medium">Synced</span> : null}
        </>
      ) : (
        <>
          <CloudOff className="h-3 w-3" />
          {showLabel ? <span className="text-[10px] font-medium">Offline</span> : null}
        </>
      )}
    </Badge>
  )
}