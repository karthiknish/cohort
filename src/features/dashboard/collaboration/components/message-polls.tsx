'use client'

import { createElement, useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
} from '@/shared/ui/dialog'
import { asErrorMessage, logError } from '@/lib/convex-errors'
import { cn } from '@/lib/utils'
import { useToast } from '@/shared/ui/use-toast'
import {
  CreatePollDialogFooter,
  CreatePollDialogHeader,
  CreatePollDialogTrigger,
  CreatePollFormFields,
  CreatePollSettings,
  PollCardFooterActions,
  PollCardHeader,
  PollOptionRow,
  QuickPollTrigger,
} from './message-polls-sections'

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
    return poll.options.toSorted((a, b) => b.voters.length - a.voters.length)
  }, [poll.options])

  const handleVote = useCallback(async () => {
    if (!onVote || !userId || selectedOptions.length === 0) return

    setIsVoting(true)
    await onVote(poll.id, selectedOptions)
      .then(() => {
        toast({
          title: 'Vote recorded',
          description: 'Your response has been saved.',
        })
        setShowResults(true)
      })
      .catch((error) => {
        logError(error, 'PollCard:handleVote')
        toast({
          title: 'Failed to record vote',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsVoting(false)
      })
  }, [onVote, poll.id, selectedOptions, userId, toast])

  const handleShowResults = useCallback(() => {
    setShowResults(true)
  }, [])

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
      logError(error, 'PollCard:handleEndPoll')
      toast({
        title: 'Failed to end poll',
        description: asErrorMessage(error),
        variant: 'destructive',
      })
    }
  }, [onEndPoll, poll.id, toast])

  const isExpired = typeof poll.endTime === 'string' ? new Date(poll.endTime) < new Date() : false

  return (
    <div className={cn('border rounded-lg overflow-hidden bg-muted/30', className)}>
      <PollCardHeader isExpired={isExpired} poll={poll} totalVotes={totalVotes} />

      <div className="p-3 space-y-2">
        {sortedOptions.map((option, index) => {
          const voteCount = option.voters.length
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
          const isSelected = selectedOptions.includes(option.id)
          const showOptionResults = showResults || hasVoted || isExpired || !canVote

          return (
            <PollOptionRow
              key={option.id}
              canVote={canVote}
              handleToggleOption={handleToggleOption}
              hasLeadingWinner={index === 0}
              isSelected={isSelected}
              option={option}
              percentage={percentage}
              showOptionResults={showOptionResults}
              sortedOptions={sortedOptions}
              voteCount={voteCount}
            />
          )
        })}
      </div>

      <PollCardFooterActions
        canEnd={canEnd && !!onEndPoll}
        canVote={canVote}
        hasVoted={hasVoted}
        isExpired={isExpired}
        isVoting={isVoting}
        onEndPoll={handleEndPoll}
        onShowResults={handleShowResults}
        onVote={handleVote}
        selectedOptionsCount={selectedOptions.length}
        showResults={showResults}
      />
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
    const newPoll: Omit<MessagePoll, 'id' | 'createdAt'> = {
      question: trimmedQuestion,
      options: validOptions.map((opt) => ({ ...opt, voters: [] })),
      multipleChoice,
      anonymous,
      createdBy: userId,
      createdByName: 'You', // Would be populated from user context
      endTime: null,
    }

    await Promise.resolve(onCreate?.(newPoll))
      .then(() => {
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
      })
      .catch((error) => {
        logError(error, 'CreatePollDialog:handleCreate')
        toast({
          title: 'Failed to create poll',
          description: asErrorMessage(error),
          variant: 'destructive',
        })
      })
      .finally(() => {
        setIsCreating(false)
      })
  }, [question, options, multipleChoice, anonymous, workspaceId, userId, onCreate, toast])

  const handleCancelCreate = useCallback(() => {
    setOpen(false)
  }, [])

  const defaultTrigger = (
    <CreatePollDialogTrigger />
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger || defaultTrigger}
      <DialogContent className="sm:max-w-md">
        <CreatePollDialogHeader />
        <CreatePollFormFields
          onAddOption={handleAddOption}
          onOptionChange={handleOptionChange}
          onQuestionChange={setQuestion}
          onRemoveOption={handleRemoveOption}
          options={options}
          question={question}
        />
        <CreatePollSettings
          anonymous={anonymous}
          multipleChoice={multipleChoice}
          onAnonymousChange={setAnonymous}
          onMultipleChoiceChange={setMultipleChoice}
        />
        <CreatePollDialogFooter isCreating={isCreating} onCancel={handleCancelCreate} onCreate={handleCreate} question={question} />
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
      trigger={createElement(QuickPollTrigger)}
    />
  )
}
