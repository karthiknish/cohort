// =============================================================================
// ENGAGEMENT OBJECTIVE SECTION - Boost post and page engagement
// =============================================================================

'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, MessageSquare, Calendar, ThumbsUp } from 'lucide-react'
import { ENGAGEMENT_TYPES, ObjectiveComponentProps } from './types'

// Mock posts - in real implementation, these would be fetched from the API
const MOCK_POSTS = [
  { id: 'post_1', message: 'Check out our new summer collection! ☀️', likes: 234, comments: 45, shares: 12 },
  { id: 'post_2', message: 'Behind the scenes at our latest photoshoot 📸', likes: 567, comments: 89, shares: 34 },
  { id: 'post_3', message: 'Thank you for 10K followers! 🎉', likes: 1234, comments: 234, shares: 156 },
]

const MOCK_EVENTS = [
  { id: 'event_1', name: 'Summer Sale Launch', date: '2024-07-01', interested: 456 },
  { id: 'event_2', name: 'Product Demo Webinar', date: '2024-07-15', interested: 234 },
]

export function EngagementObjectiveSection({ formData, onChange, disabled }: ObjectiveComponentProps) {
  return (
    <div className="space-y-6">
      {/* Engagement Type Selection */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="w-4 h-4 text-pink-500" />
            Engagement Type
          </CardTitle>
          <CardDescription>
            Choose what type of engagement you want to drive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="engagement-type">Engagement Goal</Label>
            <Select
              value={formData.engagementType}
              onValueChange={(value) => onChange({ engagementType: value as any })}
              disabled={disabled}
            >
              <SelectTrigger id="engagement-type">
                <SelectValue placeholder="Select engagement type" />
              </SelectTrigger>
              <SelectContent>
                {ENGAGEMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col items-start">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Post Engagement - Select Post */}
      {formData.engagementType === 'POST_ENGAGEMENT' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ThumbsUp className="w-4 h-4" />
              Select Post to Promote
            </CardTitle>
            <CardDescription>
              Choose an existing post to boost engagement.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOCK_POSTS.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => onChange({ postId: post.id })}
                  disabled={disabled}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    formData.postId === post.id
                      ? 'border-pink-500 bg-pink-500/5'
                      : 'border-border hover:border-pink-500/50'
                  }`}
                >
                  <p className="text-sm font-medium line-clamp-2">{post.message}</p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {post.comments}
                    </span>
                    <span>Shared {post.shares} times</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Event Responses - Select Event */}
      {formData.engagementType === 'EVENT_RESPONSES' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="w-4 h-4" />
              Select Event to Promote
            </CardTitle>
            <CardDescription>
              Choose an event to drive attendance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {MOCK_EVENTS.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onChange({ eventId: event.id })}
                  disabled={disabled}
                  className={`w-full p-3 rounded-lg border text-left transition-all ${
                    formData.eventId === event.id
                      ? 'border-pink-500 bg-pink-500/5'
                      : 'border-border hover:border-pink-500/50'
                  }`}
                >
                  <p className="text-sm font-medium">{event.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString()} • {event.interested} interested
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Engagement */}
      {formData.engagementType === 'PAGE_ENGAGEMENT' && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ThumbsUp className="w-5 h-5 text-pink-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Page Engagement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  This will promote your Facebook Page to get more likes, follows, and overall engagement. 
                  Your ads will be optimized to reach people most likely to engage with your page content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card className="border-pink-500/20 bg-pink-500/5">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="w-5 h-5 text-pink-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Engagement Campaign Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use eye-catching visuals and videos</li>
                <li>Ask questions to encourage comments</li>
                <li>Post during peak engagement hours</li>
                <li>Respond to comments quickly</li>
                <li>Run contests or giveaways (follow platform rules)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
