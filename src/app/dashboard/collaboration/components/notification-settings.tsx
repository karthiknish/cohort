'use client'

import { useState, useCallback } from 'react'
import {
  Bell,
  BellOff,
  Mail,
  AtSign,
  Hash,
  Volume2,
  VolumeX,
  Save,
  LoaderCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export type NotificationPreference = {
  enabled: boolean
  mentions: boolean
  allMessages: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  mobile: boolean
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  keywords: string[] // Custom keywords to notify for
  muteUntil?: Date | null
}

interface NotificationSettingsProps {
  preferences: NotificationPreference
  onSave: (preferences: NotificationPreference) => Promise<void>
  trigger?: React.ReactNode
}

const DEFAULT_PREFERENCES: NotificationPreference = {
  enabled: true,
  mentions: true,
  allMessages: false,
  sound: true,
  desktop: true,
  email: false,
  mobile: true,
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
  keywords: [],
  muteUntil: null,
}

/**
 * Notification settings dialog for collaboration channels
 */
export function NotificationSettings({
  preferences: initialPreferences,
  onSave,
  trigger,
}: NotificationSettingsProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreference>(
    initialPreferences ?? DEFAULT_PREFERENCES
  )
  const [isSaving, setIsSaving] = useState(false)
  const [keywordInput, setKeywordInput] = useState('')

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      await onSave(preferences)
      toast({
        title: 'Notification settings saved',
        description: 'Your preferences have been updated.',
      })
      setOpen(false)
    } catch (error) {
      console.error('Failed to save notification settings:', error)
      toast({
        title: 'Failed to save settings',
        description: 'An error occurred while saving your preferences.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }, [preferences, onSave, toast])

  const handleAddKeyword = useCallback(() => {
    const keyword = keywordInput.trim().toLowerCase()
    if (keyword && !preferences.keywords.includes(keyword)) {
      setPreferences((prev) => ({
        ...prev,
        keywords: [...prev.keywords, keyword],
      }))
      setKeywordInput('')
    }
  }, [keywordInput, preferences.keywords])

  const handleRemoveKeyword = useCallback((keyword: string) => {
    setPreferences((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }))
  }, [])

  const handleMuteFor = useCallback((duration: number) => {
    const until = new Date(Date.now() + duration * 60 * 1000)
    setPreferences((prev) => ({
      ...prev,
      muteUntil: until,
    }))
  }, [])

  const handleUnmute = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      muteUntil: null,
    }))
  }, [])

  const isMuted = preferences.muteUntil ? new Date() < preferences.muteUntil : false

  const defaultTrigger = (
    <DialogTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        {isMuted ? (
          <BellOff className="h-4 w-4" />
        ) : (
          <Bell className="h-4 w-4" />
        )}
        <span className="sr-only">Notification settings</span>
      </Button>
    </DialogTrigger>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger || defaultTrigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </DialogTitle>
          <DialogDescription>
            Configure how and when you receive notifications for this channel.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Mute status */}
          {isMuted && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-sm">
                <BellOff className="h-4 w-4 text-muted-foreground" />
                <span>
                  Muted until {preferences.muteUntil?.toLocaleTimeString()}
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleUnmute}>
                Unmute
              </Button>
            </div>
          )}

          {/* Quick mute options */}
          {!isMuted && (
            <div className="space-y-2">
              <Label>Quick mute</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMuteFor(15)}
                >
                  15 min
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMuteFor(60)}
                >
                  1 hour
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMuteFor(480)}
                >
                  8 hours
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleMuteFor(1440)}
                >
                  24 hours
                </Button>
              </div>
            </div>
          )}

          {/* Notification preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">What to notify</h3>

            {/* All messages */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="all-messages">All messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified for every message
                  </p>
                </div>
              </div>
              <Switch
                id="all-messages"
                checked={preferences.allMessages}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, allMessages: checked }))
                }
              />
            </div>

            {/* Mentions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AtSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label htmlFor="mentions">Mentions</Label>
                  <p className="text-xs text-muted-foreground">
                    Get notified when mentioned
                  </p>
                </div>
              </div>
              <Switch
                id="mentions"
                checked={preferences.mentions}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, mentions: checked }))
                }
              />
            </div>

            {/* Custom keywords */}
            <div className="space-y-2">
              <Label>Custom keywords</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add keyword..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                  className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
                />
                <Button type="button" size="sm" onClick={handleAddKeyword}>
                  Add
                </Button>
              </div>
              {preferences.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {preferences.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="hover:text-destructive"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* How to notify */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">How to notify</h3>

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.sound ? (
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound">Sound</Label>
              </div>
              <Switch
                id="sound"
                checked={preferences.sound}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, sound: checked }))
                }
              />
            </div>

            {/* Desktop notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="desktop">Desktop</Label>
              </div>
              <Switch
                id="desktop"
                checked={preferences.desktop}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, desktop: checked }))
                }
              />
            </div>

            {/* Email */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email">Email</Label>
              </div>
              <Switch
                id="email"
                checked={preferences.email}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({ ...prev, email: checked }))
                }
              />
            </div>
          </div>

          {/* Quiet hours */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Quiet hours</Label>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) =>
                  setPreferences((prev) => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, enabled: checked },
                  }))
                }
              />
            </div>
            {preferences.quietHours.enabled && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, start: e.target.value },
                    }))
                  }
                  className="px-3 py-2 text-sm rounded-md border bg-background"
                />
                <span className="text-muted-foreground">to</span>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      quietHours: { ...prev.quietHours, end: e.target.value },
                    }))
                  }
                  className="px-3 py-2 text-sm rounded-md border bg-background"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
