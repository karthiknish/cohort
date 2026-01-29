'use client'

import { useState, useCallback, useMemo } from 'react'
import { BarChart3, Plus, Trash2, Users, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

export interface PollOption {
  id: string
  text: string
  voters: string[] // Array of user IDs who voted for this option
}

export interface MessagePoll {
  id: string
  question: string
  options: PollOption[]
  multipleChoice: boolean
  anonymous: boolean
  endTime?: string | null
  createdBy: string
  createdByName: string
  createdAt: string
}

interface PollCardProps {
  poll: MessagePoll
  userId: string | null
  onVote?: (pollId: string, optionIds: string[]) => Promise<void>
  onEndPoll?: (pollId: string) => Promise<void>
  canVote?: boolean
  canEnd?: boolean
  showResults?: boolean
  className?: string
}

/**
 * Display a poll with voting functionality
 */
export function PollCard({
  poll,
  userId,
  onVote,
  onEndPoll,
  canVote = true,
  canEnd = false,
  showResults: showResultsProp,
  className,
}: PollCardProps) {
  const { toast } = useToast()
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [isVoting, setIsVoting] = useState(false)
  const [showResults, setShowResults] = useState(showResultsProp ?? false)

  // Check if user has already voted
  const userVotedOptions = useMemo(() => {
    if (!userId) return []
    return poll.options.filter((opt) => opt.voters.includes(userId))
  }, [poll.options, userId])

  const hasVoted = userVotedOptions.length > 0

  // Calculate total votes
  const totalVotes = useMemo(() => {
    return poll.options.reduce((sum, opt) => sum + opt.voters.length, 0)
  }, [poll.options])

  // Sort options by vote count (descending)
  const sortedOptions = useMemo(() => {
    return [...poll.options].sort((a, b) => b.voters.length - a.voters.length)
  }, [poll.options])

  const handleVote = useCallback(async () => {
    if (!onVote || !userId || selectedOptions.length === 0) return

    setIsVoting(true)
    try {
      await onVote(poll.id, selectedOptions)
      toast({
        title: 'Vote recorded',
        description: 'Your response has been saved.',
      })
      setShowResults(true)
    } catch (error) {
      console.error('Failed to vote:', error)
      toast({
        title: 'Failed to record vote',
        description: 'An error occurred while saving your vote.',
        variant: 'destructive',
      })
    } finally {
      setIsVoting(false)
    }
  }, [onVote, poll.id, selectedOptions, userId, toast])

  const handleToggleOption = useCallback((optionId: string) => {
    if (poll.multipleChoice) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      )
    } else {
      setSelectedOptions([optionId])
    }
  }, [poll.multipleChoice])

  const handleEndPoll = useCallback(async () => {
    if (!onEndPoll) return
    try {
      await onEndPoll(poll.id)
      toast({
        title: 'Poll ended',
        description: 'The poll has been closed and results are final.',
      })
    } catch (error) {
      console.error('Failed to end poll:', error)
      toast({
        title: 'Failed to end poll',
        variant: 'destructive',
      })
    }
  }, [onEndPoll, poll.id, toast])

  const isExpired = poll.endTime && new Date(poll.endTime) < new Date()

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-muted/30', className)}>
      {/* Header */}
      <div className="p-3 border-b bg-muted/50">
        <div className="flex items-start gap-2">
          <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{poll.question}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
              <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
              {poll.endTime && (
                <>
                  <span>•</span>
                  <span className={cn(isExpired && 'text-red-500')}>
                    {isExpired ? 'Ended' : `Ends ${new Date(poll.endTime).toLocaleString()}`}
                  </span>
                </>
              )}
              {poll.anonymous && (
                <>
                  <span>•</span>
                  <span>Anonymous</span>
                </>
              )}
              {poll.multipleChoice && (
                <>
                  <span>•</span>
                  <span>Multiple choices</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-3 space-y-2">
        {sortedOptions.map((option, index) => {
          const voteCount = option.voters.length
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
          const isSelected = selectedOptions.includes(option.id)
          const hasUserVoted = option.voters.includes(userId ?? '')

          // Determine if we show results or voting UI
          const showOptionResults = showResults || hasVoted || isExpired || !canVote

          return (
            <div
              key={option.id}
              className={cn(
                'relative p-3 rounded-lg border transition-colors',
                !showOptionResults && 'hover:bg-background cursor-pointer',
                isSelected && 'border-primary bg-primary/5',
                showOptionResults && index === 0 && percentage > 0 && 'border-primary/50'
              )}
              onClick={() => !showOptionResults && handleToggleOption(option.id)}
            >
              {/* Progress bar background (shown in results mode) */}
              {showOptionResults && percentage > 0 && (
                <div
                  className="absolute inset-0 bg-primary/5 rounded-lg -z-10"
                  style={{ width: `${percentage}%` }}
                />
              )}

              <div className="flex items-start gap-3">
                {/* Checkbox/Radio (only in voting mode) */}
                {!showOptionResults && (
                  <div className="pt-0.5">
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleToggleOption(option.id)}
                    />
                  </div>
                )}

                {/* Winner indicator */}
                {showOptionResults && index === 0 && voteCount > 0 && voteCount > sortedOptions[1]?.voters.length! && (
                  <Check className="h-4 w-4 text-primary" />
                )}

                {/* Option text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{option.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {/* Progress bar */}
                    {showOptionResults && (
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {showOptionResults ? (
                        <>
                          {voteCount} {voteCount === 1 ? 'vote' : 'votes'} ({percentage.toFixed(0)}%)
                        </>
                      ) : (
                        <>
                          {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      {(canVote && !hasVoted && !isExpired) || canEnd ? (
        <div className="p-3 border-t bg-muted/50 flex items-center justify-between">
          {canVote && !hasVoted && !isExpired && (
            <Button
              type="button"
              size="sm"
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || isVoting}
            >
              {isVoting ? 'Submitting...' : 'Submit Vote'}
            </Button>
          )}

          {canEnd && !isExpired && onEndPoll && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleEndPoll}
            >
              End Poll
            </Button>
          )}

          {hasVoted && !showResults && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowResults(true)}
            >
              View Results
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}

interface CreatePollDialogProps {
  workspaceId: string | null
  userId: string | null
  onCreate?: (poll: Omit<MessagePoll, 'id' | 'createdAt'>) => Promise<void>
  trigger?: React.ReactNode
}

/**
 * Dialog for creating a new poll
 */
export function CreatePollDialog({
  workspaceId,
  userId,
  onCreate,
  trigger,
}: CreatePollDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState<Array<{ id: string; text: string }>>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ])
  const [multipleChoice, setMultipleChoice] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const handleAddOption = useCallback(() => {
    setOptions((prev) => [
      ...prev,
      { id: String(prev.length + 1), text: '' },
    ])
  }, [])

  const handleRemoveOption = useCallback((id: string) => {
    if (options.length <= 2) return
    setOptions((prev) => prev.filter((opt) => opt.id !== id))
  }, [options.length])

  const handleOptionChange = useCallback((id: string, text: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.id === id ? { ...opt, text } : opt))
    )
  }, [])

  const handleCreate = useCallback(async () => {
    if (!workspaceId || !userId) {
      toast({
        title: 'Authentication required',
        variant: 'destructive',
      })
      return
    }

    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) {
      toast({
        title: 'Question required',
        description: 'Please enter a question for the poll.',
        variant: 'destructive',
      })
      return
    }

    const validOptions = options
      .filter((opt) => opt.text.trim().length > 0)
      .map((opt) => ({ ...opt, text: opt.text.trim(), id: crypto.randomUUID() }))

    if (validOptions.length < 2) {
      toast({
        title: 'At least 2 options required',
        description: 'Please provide at least 2 answer options.',
        variant: 'destructive',
      })
      return
    }

    setIsCreating(true)
    try {
      const newPoll: Omit<MessagePoll, 'id' | 'createdAt'> = {
        question: trimmedQuestion,
        options: validOptions.map((opt) => ({ ...opt, voters: [] })),
        multipleChoice,
        anonymous,
        createdBy: userId,
        createdByName: 'You', // Would be populated from user context
        endTime: null,
      }

      await onCreate?.(newPoll)

      toast({
        title: 'Poll created',
        description: 'Your poll has been posted to the channel.',
      })

      // Reset form
      setQuestion('')
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' },
      ])
      setMultipleChoice(false)
      setAnonymous(false)
      setOpen(false)
    } catch (error) {
      console.error('Failed to create poll:', error)
      toast({
        title: 'Failed to create poll',
        variant: 'destructive',
      })
    } finally {
      setIsCreating(false)
    }
  }, [question, options, multipleChoice, anonymous, workspaceId, userId, onCreate, toast])

  const defaultTrigger = (
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="gap-2">
        <BarChart3 className="h-4 w-4" />
        Create Poll
      </Button>
    </DialogTrigger>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger || defaultTrigger}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Create Poll
          </DialogTitle>
          <DialogDescription>
            Create a poll to gather team feedback or make decisions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              placeholder="What do you want to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={200}
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <Label>Options *</Label>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    className="flex-1"
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveOption(option.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddOption}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Option
            </Button>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Allow multiple selections</Label>
                <p className="text-xs text-muted-foreground">
                  Users can select more than one option
                </p>
              </div>
              <Checkbox
                checked={multipleChoice}
                onCheckedChange={(checked) => setMultipleChoice(checked as boolean)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Anonymous votes</Label>
                <p className="text-xs text-muted-foreground">
                  Hide who voted for each option
                </p>
              </div>
              <Checkbox
                checked={anonymous}
                onCheckedChange={(checked) => setAnonymous(checked as boolean)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !question.trim()}
          >
            {isCreating ? 'Creating...' : 'Create Poll'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Quick poll button for message composer toolbar
 */
export function QuickPollButton(props: CreatePollDialogProps) {
  return (
    <CreatePollDialog
      {...props}
      trigger={
        <Button type="button" variant="ghost" size="icon" className="h-7 w-7">
          <BarChart3 className="h-4 w-4" />
          <span className="sr-only">Create poll</span>
        </Button>
      }
    />
  )
}
