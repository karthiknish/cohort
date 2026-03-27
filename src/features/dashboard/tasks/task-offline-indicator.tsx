'use client'

import { useSyncExternalStore } from 'react'
import { WifiOff, Cloud, CloudOff } from 'lucide-react'
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

function useOnlineStatus() {
  return useSyncExternalStore(subscribeOnlineStatus, getOnlineSnapshot, () => true)
}

export function OfflineIndicator() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]',
      'bg-muted-foreground text-background'
    )}>
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">You are offline • Changes will sync when reconnected</span>
    </div>
  )
}

// Compact sync status badge for header
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
          {showLabel && <span className="text-[10px] font-medium">Synced</span>}
        </>
      ) : (
        <>
          <CloudOff className="h-3 w-3" />
          {showLabel && <span className="text-[10px] font-medium">Offline</span>}
        </>
      )}
    </Badge>
  )
}
