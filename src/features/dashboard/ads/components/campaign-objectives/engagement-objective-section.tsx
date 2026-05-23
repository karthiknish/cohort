'use client'

import { useAction } from 'convex/react'
import { useCallback, useEffect, useReducer } from 'react'
import { Calendar, CheckCircle, Heart, Loader2, MessageSquare, ThumbsUp } from 'lucide-react'

import { adsMetaToolsApi } from '@/lib/convex-api'
import { reportConvexFailure } from '@/lib/handle-convex-error'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'

import { ENGAGEMENT_TYPES } from './types'
import type { ObjectiveComponentProps } from './types'

type PagePostRow = {
  id: string
  message?: string
  createdTime?: string
}

type PageEventRow = {
  id: string
  name: string
  startTime?: string
}

type EngagementResourcesState = {
  posts: PagePostRow[]
  events: PageEventRow[]
  loadingPosts: boolean
  loadingEvents: boolean
}

type EngagementResourcesAction =
  | { type: 'setPosts'; value: { posts: PagePostRow[]; loading: boolean } }
  | { type: 'setEvents'; value: { events: PageEventRow[]; loading: boolean } }
  | { type: 'setLoadingPosts'; value: boolean }
  | { type: 'setLoadingEvents'; value: boolean }

function createInitialEngagementResourcesState(): EngagementResourcesState {
  return { posts: [], events: [], loadingPosts: false, loadingEvents: false }
}

function engagementResourcesReducer(
  state: EngagementResourcesState,
  action: EngagementResourcesAction,
): EngagementResourcesState {
  switch (action.type) {
    case 'setPosts':
      return { ...state, posts: action.value.posts, loadingPosts: action.value.loading }
    case 'setEvents':
      return { ...state, events: action.value.events, loadingEvents: action.value.loading }
    case 'setLoadingPosts':
      return { ...state, loadingPosts: action.value }
    case 'setLoadingEvents':
      return { ...state, loadingEvents: action.value }
    default:
      return state
  }
}

function formatPostPreview(post: PagePostRow): string {
  const text = post.message?.trim()
  if (text) return text.length > 120 ? `${text.slice(0, 117)}…` : text
  if (post.createdTime) {
    try {
      return `Post · ${new Date(post.createdTime).toLocaleDateString()}`
    } catch {
      return `Post ${post.id}`
    }
  }
  return `Post ${post.id}`
}

function formatEventWhen(startTime?: string): string | null {
  if (!startTime) return null
  try {
    return new Date(startTime).toLocaleString()
  } catch {
    return startTime
  }
}

export function EngagementObjectiveSection({
  formData,
  onChange,
  disabled,
  metaContext,
}: ObjectiveComponentProps) {
  const [resources, dispatch] = useReducer(
    engagementResourcesReducer,
    undefined,
    createInitialEngagementResourcesState,
  )

  const listPagePosts = useAction(adsMetaToolsApi.listPagePosts)
  const listPageEvents = useAction(adsMetaToolsApi.listPageEvents)

  const canUseMetaApi = Boolean(metaContext?.workspaceId && metaContext.pageId)

  const handleEngagementTypeChange = useCallback(
    (value: string) => {
      onChange({
        engagementType: value as 'POST_ENGAGEMENT' | 'PAGE_ENGAGEMENT' | 'EVENT_RESPONSES',
        postId: undefined,
        eventId: undefined,
      })
    },
    [onChange],
  )

  const handlePostSelect = useCallback(
    (postId: string) => onChange({ postId }),
    [onChange],
  )

  const handleEventSelect = useCallback(
    (eventId: string) => onChange({ eventId }),
    [onChange],
  )

  useEffect(() => {
    if (!canUseMetaApi || formData.engagementType !== 'POST_ENGAGEMENT' || !metaContext?.pageId) {
      dispatch({ type: 'setPosts', value: { posts: [], loading: false } })
      return
    }

    let cancelled = false
    dispatch({ type: 'setLoadingPosts', value: true })

    void listPagePosts({
      workspaceId: metaContext.workspaceId,
      clientId: metaContext.clientId ?? null,
      pageId: metaContext.pageId,
    })
      .then((rows) => {
        if (cancelled) return
        dispatch({
          type: 'setPosts',
          value: {
            posts: Array.isArray(rows)
              ? rows.map((row) => ({
                  id: String(row.id),
                  message: row.message as string | undefined,
                  createdTime: row.createdTime as string | undefined,
                }))
              : [],
            loading: false,
          },
        })
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'EngagementObjectiveSection:listPagePosts',
          title: 'Could not load Page posts',
          fallbackMessage: 'Could not load Page posts',
        })
        dispatch({ type: 'setLoadingPosts', value: false })
      })

    return () => {
      cancelled = true
    }
  }, [
    canUseMetaApi,
    formData.engagementType,
    listPagePosts,
    metaContext?.clientId,
    metaContext?.pageId,
    metaContext?.workspaceId,
  ])

  useEffect(() => {
    if (!canUseMetaApi || formData.engagementType !== 'EVENT_RESPONSES' || !metaContext?.pageId) {
      dispatch({ type: 'setEvents', value: { events: [], loading: false } })
      return
    }

    let cancelled = false
    dispatch({ type: 'setLoadingEvents', value: true })

    void listPageEvents({
      workspaceId: metaContext.workspaceId,
      clientId: metaContext.clientId ?? null,
      pageId: metaContext.pageId,
    })
      .then((rows) => {
        if (cancelled) return
        dispatch({
          type: 'setEvents',
          value: {
            events: Array.isArray(rows)
              ? rows.map((row) => ({
                  id: String(row.id),
                  name: String(row.name),
                  startTime: row.startTime as string | undefined,
                }))
              : [],
            loading: false,
          },
        })
      })
      .catch((error) => {
        if (cancelled) return
        reportConvexFailure({
          error,
          context: 'EngagementObjectiveSection:listPageEvents',
          title: 'Could not load Page events',
          fallbackMessage: 'Could not load Page events',
        })
        dispatch({ type: 'setLoadingEvents', value: false })
      })

    return () => {
      cancelled = true
    }
  }, [
    canUseMetaApi,
    formData.engagementType,
    listPageEvents,
    metaContext?.clientId,
    metaContext?.pageId,
    metaContext?.workspaceId,
  ])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="size-4 text-primary" />
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
              onValueChange={handleEngagementTypeChange}
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

      {formData.engagementType === 'POST_ENGAGEMENT' ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="size-4 text-primary" />
              Page Post
            </CardTitle>
            <CardDescription>Select a published post from your Facebook Page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canUseMetaApi ? (
              <Alert>
                <AlertDescription className="text-xs">
                  Select a Facebook Page above to load posts.
                </AlertDescription>
              </Alert>
            ) : resources.loadingPosts ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading posts…
              </div>
            ) : resources.posts.length > 0 ? (
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {resources.posts.map((post) => (
                  <ResourceOptionButton
                    key={post.id}
                    disabled={Boolean(disabled)}
                    isSelected={formData.postId === post.id}
                    onSelectResource={handlePostSelect}
                    resourceId={post.id}
                    title={formatPostPreview(post)}
                    subtitle={post.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No published posts found for this Page. Publish a post on Facebook first.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {formData.engagementType === 'EVENT_RESPONSES' ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="size-4 text-primary" />
              Page Event
            </CardTitle>
            <CardDescription>Select an event hosted on your Facebook Page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canUseMetaApi ? (
              <Alert>
                <AlertDescription className="text-xs">
                  Select a Facebook Page above to load events.
                </AlertDescription>
              </Alert>
            ) : resources.loadingEvents ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Loading events…
              </div>
            ) : resources.events.length > 0 ? (
              <div className="grid gap-2 max-h-48 overflow-y-auto">
                {resources.events.map((event) => (
                  <ResourceOptionButton
                    key={event.id}
                    disabled={Boolean(disabled)}
                    isSelected={formData.eventId === event.id}
                    onSelectResource={handleEventSelect}
                    resourceId={event.id}
                    title={event.name}
                    subtitle={formatEventWhen(event.startTime) ?? event.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No upcoming events found. Create an event on your Facebook Page first.
              </p>
            )}
          </CardContent>
        </Card>
      ) : null}

      {formData.engagementType === 'PAGE_ENGAGEMENT' ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ThumbsUp className="size-5 text-primary mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Page Engagement</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Promotes your Facebook Page for likes, follows, and overall engagement.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-accent/20 bg-accent/10">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Heart className="size-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Engagement Campaign Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Use eye-catching visuals and videos</li>
                <li>Ask questions to encourage comments</li>
                <li>Post during peak engagement hours</li>
                <li>Respond to comments quickly</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ResourceOptionButton({
  title,
  subtitle,
  disabled,
  isSelected,
  resourceId,
  onSelectResource,
}: {
  title: string
  subtitle: string
  disabled: boolean
  isSelected: boolean
  resourceId: string
  onSelectResource: (resourceId: string) => void
}) {
  const handleSelectResource = useCallback(() => {
    onSelectResource(resourceId)
  }, [onSelectResource, resourceId])

  return (
    <button
      type="button"
      onClick={handleSelectResource}
      disabled={disabled}
      className={`flex items-center justify-between rounded-lg border p-3 text-left motion-chromatic ${
        isSelected ? 'border-primary/30 bg-primary/10' : 'border-border hover:border-primary/50'
      }`}
    >
      <div className="min-w-0 pr-2">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
      </div>
      {isSelected ? <CheckCircle className="size-5 shrink-0 text-primary" aria-hidden /> : null}
    </button>
  )
}
