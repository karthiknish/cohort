'use client'

import { useSyncExternalStore } from 'react'
import { WifiOff, Cloud, CloudOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
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
      'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all',
      'bg-gray-500 text-white'
    )}>
      <WifiOff className="h-4 w-4" />
      <span className="text-sm font-medium">You're offline • Changes will sync when reconnected</span>
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
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
          : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
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
