'use client'

import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Separator } from '@/shared/ui/separator'

export function CollaborationSkeleton() {
  const tabSlots = ['tab-1', 'tab-2', 'tab-3']
  const folderSlots = ['folder-1', 'folder-2', 'folder-3', 'folder-4', 'folder-5', 'folder-6']
  const messageSlots = ['message-1', 'message-2', 'message-3', 'message-4', 'message-5', 'message-6', 'message-7', 'message-8']
  const sidebarSlots = ['sidebar-1', 'sidebar-2', 'sidebar-3', 'sidebar-4', 'sidebar-5']
  const insightSlots = ['insight-1', 'insight-2', 'insight-3']

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      <Card className="border-muted/60 bg-background">
        <CardHeader className="border-b border-muted/40 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            {tabSlots.map((slot) => (
              <Skeleton key={slot} className="h-6 w-40" />
            ))}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 p-0 lg:flex-row">
          <div className="w-full max-w-xs border-r border-muted/30 p-4">
            <Skeleton className="h-9 w-full" />
            <div className="mt-4 space-y-3">
              {folderSlots.map((slot) => (
                <div key={slot} className="rounded-md border border-muted/60 bg-muted/10 p-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-32" />
                </div>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <div className="flex-1 space-y-4 p-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-44" />
            </div>
            <div className="space-y-3">
              {messageSlots.map((slot) => (
                <div key={slot} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            </div>
          </div>

          <Separator orientation="vertical" className="hidden h-[640px] lg:block" />

          <div className="w-full max-w-xs space-y-4 border-l border-muted/30 p-4">
            <Skeleton className="h-5 w-44" />
            <div className="space-y-3">
              {sidebarSlots.map((slot) => (
                <div key={slot} className="rounded-md border border-muted/60 bg-muted/10 p-3">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="mt-2 h-3 w-28" />
                </div>
              ))}
            </div>
            <Skeleton className="h-5 w-40" />
            <div className="space-y-3">
              {insightSlots.map((slot) => (
                <div key={slot} className="rounded-md border border-muted/60 bg-muted/10 p-3">
                  <Skeleton className="h-4 w-32" />
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {insightSlots.map((innerSlot) => (
                      <Skeleton key={innerSlot} className="h-3 w-full" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
