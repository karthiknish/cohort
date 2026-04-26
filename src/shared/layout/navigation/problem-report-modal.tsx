'use client'

import { useCallback, useState } from 'react'
import { useMutation } from 'convex/react'
import { AlertCircle, LoaderCircle, MessageSquare } from 'lucide-react'
import { asErrorMessage } from '@/lib/convex-errors'
import { useAuth } from '@/shared/contexts/auth-context'
import { useClientContext } from '@/shared/contexts/client-context'
import { useToast } from '@/shared/ui/use-toast'
import { problemReportsApi } from '@/lib/convex-api'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Textarea } from '@/shared/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Label } from '@/shared/ui/label'

interface ProblemReportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProblemReportModal({ open, onOpenChange }: ProblemReportModalProps) {
  const { user } = useAuth()
  const { selectedClientId } = useClientContext()
  const { toast } = useToast()
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium')
  const [submitting, setSubmitting] = useState(false)

  const createProblemReport = useMutation(problemReportsApi.create)

  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
  }, [])

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value)
  }, [])

  const handleSeverityChange = useCallback((value: string) => {
    if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
      setSeverity(value)
    }
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  const handleSubmit = useCallback((event: React.FormEvent) => {
    event.preventDefault()
    if (!user) return

    setSubmitting(true)

    void createProblemReport({
      legacyId: `pr_${Date.now()}_${user.id ?? 'anon'}`,
      userId: user.id ?? null,
      userEmail: user.email ?? null,
      userName: user.name ?? null,
      workspaceId: selectedClientId || null,
      title,
      description,
      severity,
      status: 'open',
      createdAtMs: Date.now(),
      updatedAtMs: Date.now(),
    })
      .then(() => {
        toast({
          title: 'Report submitted',
          description: "Thank you for your feedback. We'll look into it as soon as possible.",
        })

        onOpenChange(false)
        setTitle('')
        setDescription('')
        setSeverity('medium')
      })
      .catch((error) => {
        console.error('Error submitting problem report:', error)
        toast({
          title: 'Could not submit report',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setSubmitting(false)
      })
  }, [createProblemReport, description, onOpenChange, selectedClientId, severity, title, toast, user])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" aria-hidden />
            Report a Problem
          </DialogTitle>
          <DialogDescription>
            Found a bug or having trouble? Let us know and we&apos;ll fix it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              placeholder="Brief summary of the problem"
              value={title}
              onChange={handleTitleChange}
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select
              value={severity}
              onValueChange={handleSeverityChange}
              disabled={submitting}
            >
              <SelectTrigger id="severity">
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor annoyance</SelectItem>
                <SelectItem value="medium">Medium - Important but usable</SelectItem>
                <SelectItem value="high">High - Limits functionality</SelectItem>
                <SelectItem value="critical">Critical - System broken / Data loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              placeholder="What happened? What did you expect to happen?"
              value={description}
              onChange={handleDescriptionChange}
              className="min-h-[120px]"
              required
              disabled={submitting}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
