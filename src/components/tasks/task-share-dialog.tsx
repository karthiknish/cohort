'use client'

import { useState, useCallback } from 'react'
import { Link2, Check, Copy, Mail, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { TaskRecord } from '@/types/tasks'

type TaskShareDialogProps = {
  task: TaskRecord
  onShareUpdate?: (sharedWith: string[]) => void
  trigger?: React.ReactNode
}

export function TaskShareDialog({ task, onShareUpdate, trigger }: TaskShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [sharedWith, setSharedWith] = useState<string[]>(task.sharedWith ?? [])
  const { toast } = useToast()

  const taskUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?taskId=${task.id}`
    : ''

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(taskUrl)
    setCopied(true)
    toast({ title: 'Link copied to clipboard' })
    setTimeout(() => setCopied(false), 2000)
  }, [taskUrl, toast])

  const handleAddEmail = useCallback(() => {
    const email = emailInput.trim().toLowerCase()
    if (!email) return

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      })
      return
    }

    if (sharedWith.includes(email)) {
      toast({
        title: 'Already shared',
        description: 'This person already has access',
        variant: 'destructive',
      })
      return
    }

    const newSharedWith = [...sharedWith, email]
    setSharedWith(newSharedWith)
    setEmailInput('')
    onShareUpdate?.(newSharedWith)
    toast({ title: 'Shared with ' + email })
  }, [sharedWith, emailInput, onShareUpdate, toast])

  const handleRemoveEmail = useCallback((email: string) => {
    const newSharedWith = sharedWith.filter(e => e !== email)
    setSharedWith(newSharedWith)
    onShareUpdate?.(newSharedWith)
  }, [sharedWith, onShareUpdate])

  const handleShareViaEmail = useCallback(() => {
    const subject = encodeURIComponent(`Task: ${task.title}`)
    const body = encodeURIComponent(
      `Hi,\n\nI wanted to share this task with you:\n\n${task.title}\n\n${task.description || ''}\n\nYou can view it here: ${taskUrl}`
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }, [task.title, task.description, taskUrl])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Task
          </DialogTitle>
          <DialogDescription>
            Share "{task.title}" with others via link or email
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Copy Link</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div className="space-y-2">
              <Label>Task Link</Label>
              <div className="flex gap-2">
                <Input
                  value={taskUrl}
                  readOnly
                  className="flex-1 text-xs bg-muted"
                />
                <Button
                  onClick={handleCopyLink}
                  className={cn(
                    'gap-1.5 shrink-0',
                    copied && 'bg-emerald-600 hover:bg-emerald-700'
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view this task
              </p>
            </div>

            {/* Currently shared with */}
            {sharedWith.length > 0 && (
              <div className="space-y-2">
                <Label>Shared with</Label>
                <div className="flex flex-wrap gap-1.5">
                  {sharedWith.map((email) => (
                    <Badge
                      key={email}
                      variant="secondary"
                      className="gap-1.5 pr-1"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label>Invite via email</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="colleague@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddEmail()
                    }
                  }}
                />
                <Button
                  onClick={handleAddEmail}
                  disabled={!emailInput}
                  className="shrink-0"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="text-sm">
                <p className="font-medium">Send via email</p>
                <p className="text-xs text-muted-foreground">Open your email client with pre-filled content</p>
              </div>
              <Button
                onClick={handleShareViaEmail}
                variant="outline"
                size="sm"
                className="gap-1.5"
              >
                <Mail className="h-4 w-4" />
                Open Email
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Quick share button
export function QuickShareButton({ task, onShareUpdate }: { task: TaskRecord, onShareUpdate?: (sharedWith: string[]) => void }) {
  return (
    <TaskShareDialog task={task} onShareUpdate={onShareUpdate} />
  )
}
