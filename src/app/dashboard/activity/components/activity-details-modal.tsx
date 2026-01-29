'use client'

import { format } from 'date-fns'
import Link from 'next/link'
import {
  ArrowUpRight,
  Check,
  Pin,
  PinOff,
  Tag,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ACTIVITY_ICONS, ACTIVITY_COLORS } from '../constants'
import type { EnhancedActivity } from '../types'

interface ActivityDetailsModalProps {
  activity: EnhancedActivity | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkAsRead: (id: string) => void
  onTogglePin: (id: string) => void
}

export function ActivityDetailsModal({
  activity,
  open,
  onOpenChange,
  onMarkAsRead,
  onTogglePin,
}: ActivityDetailsModalProps) {
  if (!activity) return null

  const Icon = ACTIVITY_ICONS[activity.type]
  const colorClass = ACTIVITY_COLORS[activity.type]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg">{activity.entityName}</DialogTitle>
              <DialogDescription>
                {format(new Date(activity.timestamp), 'MMMM d, yyyy • h:mm a')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">
              {activity.description}
            </p>
          </div>

          {/* Metadata */}
          {activity.metadata?.changes && (
            <div>
              <h4 className="text-sm font-medium mb-2">Changes</h4>
              <div className="space-y-2">
                {activity.metadata.changes.map((change, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm rounded-lg bg-muted/50 p-2"
                  >
                    <span className="text-muted-foreground">{change.field}:</span>
                    <span className="line-through text-red-500">
                      {change.oldValue}
                    </span>
                    <span>→</span>
                    <span className="text-green-600">{change.newValue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User */}
          {activity.userName && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                {activity.userAvatar ? (
                  <AvatarImage src={activity.userAvatar} alt={activity.userName} />
                ) : (
                  <AvatarFallback className="text-xs">
                    {activity.userName.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="text-sm text-muted-foreground">
                By {activity.userName}
              </span>
            </div>
          )}

          {/* Tags */}
          {activity.metadata?.tags && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {activity.metadata.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onTogglePin(activity.id)}
          >
            {activity.isPinned ? (
              <>
                <PinOff className="h-4 w-4 mr-1" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="h-4 w-4 mr-1" />
                Pin
              </>
            )}
          </Button>
          {!activity.isRead && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsRead(activity.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Mark as Read
            </Button>
          )}
          {activity.navigationUrl && (
            <Button asChild size="sm">
              <Link href={activity.navigationUrl}>
                View Details
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
