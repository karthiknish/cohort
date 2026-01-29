'use client'

import { useState, useCallback } from 'react'
import { format } from 'date-fns'
import { MessageCircle, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { EnhancedActivity } from '../types'

interface ActivityComment {
  id: string
  userId: string
  userName: string
  text: string
  timestamp: string
}

interface ActivityCommentsProps {
  activity: EnhancedActivity
  comments: ActivityComment[]
  onAddComment: (activityId: string, text: string) => void
  currentUserName?: string
}

export function ActivityComments({
  activity,
  comments,
  onAddComment,
  currentUserName,
}: ActivityCommentsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newComment, setNewComment] = useState('')

  const handleSubmit = useCallback(() => {
    if (newComment.trim()) {
      onAddComment(activity.id, newComment.trim())
      setNewComment('')
    }
  }, [newComment, activity.id, onAddComment])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit]
  )

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors',
          isOpen && 'text-foreground'
        )}
      >
        <MessageCircle className="h-3 w-3" />
        {comments.length > 0 && <span>{comments.length}</span>}
        {isOpen ? 'Hide' : 'Show'} comments
      </button>

      {isOpen && (
        <div className="mt-2 space-y-3 p-3 rounded-lg bg-muted/50">
          {/* Comments list */}
          {comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {comment.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium">{comment.userName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(comment.timestamp), 'MMM d, h:mm a')}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground break-words">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Add comment */}
          <div className="flex gap-2">
            <Textarea
              placeholder="Add a comment... (⌘+Enter to send)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] max-h-[120px] text-sm resize-none"
              rows={2}
            />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={handleSubmit}
                disabled={!newComment.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
              {newComment && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setNewComment('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
