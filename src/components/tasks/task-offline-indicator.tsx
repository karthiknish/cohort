'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type SyncStatus = 'online' | 'offline' | 'syncing' | 'error'

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online')
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setSyncStatus('syncing')
      setShowStatus(true)
      // Simulate sync completion
      setTimeout(() => {
        setSyncStatus('online')
        setTimeout(() => setShowStatus(false), 2000)
      }, 1500)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus('offline')
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) {
      setSyncStatus('offline')
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showStatus && isOnline) return null

  return (
    <div className={cn(
      'fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all',
      syncStatus === 'online' && 'bg-emerald-500 text-white',
      syncStatus === 'offline' && 'bg-gray-500 text-white',
      syncStatus === 'syncing' && 'bg-blue-500 text-white',
      syncStatus === 'error' && 'bg-red-500 text-white'
    )}>
      {syncStatus === 'online' && (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">Back online • Changes synced</span>
        </>
      )}
      {syncStatus === 'offline' && (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">You're offline • Changes will sync when reconnected</span>
        </>
      )}
      {syncStatus === 'syncing' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">Syncing changes...</span>
        </>
      )}
    </div>
  )
}

// Compact sync status badge for header
export function SyncStatusBadge({ showLabel = false }: { showLabel?: boolean }) {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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
