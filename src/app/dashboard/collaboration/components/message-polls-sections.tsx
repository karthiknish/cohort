'use client'

import type { ReactNode } from 'react'

import { BarChart3, Check, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { MessagePoll, PollOption } from './message-polls'

export function PollCardHeader({
  isExpired,
  poll,
  totalVotes,
}: {
  isExpired: boolean | null
  poll: MessagePoll
  totalVotes: number
}) {
  return (
    <div className="border-b bg-muted/50 p-3">
      <div className="flex items-start gap-2">
        <BarChart3 className="mt-0.5 h-5 w-5 text-primary" />
        <div className="min-w-0 flex-1">
          <p className="font-medium">{poll.question}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
            {poll.endTime ? (
              <>
                <span>•</span>
                <span className={cn(isExpired && 'text-red-500')}>
                  {isExpired ? 'Ended' : `Ends ${new Date(poll.endTime).toLocaleString()}`}
                </span>
              </>
            ) : null}
            {poll.anonymous ? (
              <>
                <span>•</span>
                <span>Anonymous</span>
              </>
            ) : null}
            {poll.multipleChoice ? (
              <>
                <span>•</span>
                <span>Multiple choices</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PollOptionRow({
  canVote,
  handleToggleOption,
  hasLeadingWinner,
  isSelected,
  option,
  percentage,
  showOptionResults,
  sortedOptions,
  voteCount,
}: {
  canVote: boolean
  handleToggleOption: (optionId: string) => void
  hasLeadingWinner: boolean
  isSelected: boolean
  option: PollOption
  percentage: number
  showOptionResults: boolean
  sortedOptions: PollOption[]
  voteCount: number
}) {
  const interactive = !showOptionResults && canVote

  return (
    <button
      type="button"
      className={cn(
        'relative rounded-lg border p-3 transition-colors',
        interactive && 'cursor-pointer hover:bg-background',
        isSelected && 'border-primary bg-primary/5',
        showOptionResults && hasLeadingWinner && percentage > 0 && 'border-primary/50',
      )}
      onClick={() => {
        if (interactive) {
          handleToggleOption(option.id)
        }
      }}
      disabled={!interactive}
    >
      {showOptionResults && percentage > 0 ? (
        <div className="absolute inset-0 -z-10 rounded-lg bg-primary/5" style={{ width: `${percentage}%` }} />
      ) : null}

      <div className="flex items-start gap-3">
        {!showOptionResults ? (
          <div className="pt-0.5">
            <Checkbox checked={isSelected} onChange={() => handleToggleOption(option.id)} />
          </div>
        ) : null}

        {showOptionResults && hasLeadingWinner && voteCount > 0 && voteCount > (sortedOptions[1]?.voters.length ?? 0) ? (
          <Check className="h-4 w-4 text-primary" />
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{option.text}</p>
          <div className="mt-1 flex items-center gap-2">
            {showOptionResults ? (
              <div className="flex-1">
                <Progress value={percentage} className="h-2" />
              </div>
            ) : null}
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {showOptionResults ? `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'} (${percentage.toFixed(0)}%)` : `${voteCount} ${voteCount === 1 ? 'vote' : 'votes'}`}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

export function PollCardFooterActions({
  canEnd,
  canVote,
  hasVoted,
  isExpired,
  isVoting,
  onEndPoll,
  onShowResults,
  onVote,
  selectedOptionsCount,
  showResults,
}: {
  canEnd: boolean
  canVote: boolean
  hasVoted: boolean
  isExpired: boolean | null
  isVoting: boolean
  onEndPoll: () => void
  onShowResults: () => void
  onVote: () => void
  selectedOptionsCount: number
  showResults: boolean
}) {
  if (!((canVote && !hasVoted && !isExpired) || canEnd)) {
    return null
  }

  return (
    <div className="flex items-center justify-between border-t bg-muted/50 p-3">
      {canVote && !hasVoted && !isExpired ? (
        <Button type="button" size="sm" onClick={onVote} disabled={selectedOptionsCount === 0 || isVoting}>
          {isVoting ? 'Submitting...' : 'Submit Vote'}
        </Button>
      ) : null}

      {canEnd && !isExpired ? (
        <Button type="button" size="sm" variant="outline" onClick={onEndPoll}>
          End Poll
        </Button>
      ) : null}

      {hasVoted && !showResults ? (
        <Button type="button" size="sm" variant="ghost" onClick={onShowResults}>
          View Results
        </Button>
      ) : null}
    </div>
  )
}

export function CreatePollDialogTrigger({ trigger }: { trigger?: ReactNode }) {
  if (trigger) return <>{trigger}</>

  return (
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="gap-2">
        <BarChart3 className="h-4 w-4" />
        Create Poll
      </Button>
    </DialogTrigger>
  )
}

export function CreatePollDialogHeader() {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Create Poll
      </DialogTitle>
      <DialogDescription>Create a poll to gather team feedback or make decisions.</DialogDescription>
    </DialogHeader>
  )
}

export function CreatePollFormFields({
  onAddOption,
  onOptionChange,
  onQuestionChange,
  onRemoveOption,
  options,
  question,
}: {
  onAddOption: () => void
  onOptionChange: (id: string, text: string) => void
  onQuestionChange: (value: string) => void
  onRemoveOption: (id: string) => void
  options: Array<{ id: string; text: string }>
  question: string
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question *</Label>
        <Input id="question" placeholder="What do you want to ask?" value={question} onChange={(event) => onQuestionChange(event.target.value)} maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label>Options *</Label>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={option.id} className="flex items-center gap-2">
              <span className="w-6 text-sm text-muted-foreground">{index + 1}.</span>
              <Input placeholder={`Option ${index + 1}`} value={option.text} onChange={(event) => onOptionChange(option.id, event.target.value)} className="flex-1" />
              {options.length > 2 ? (
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemoveOption(option.id)} aria-label={`Remove option ${index + 1}`}>
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Remove option {index + 1}</span>
                </Button>
              ) : null}
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onAddOption} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>
    </div>
  )
}

export function CreatePollSettings({
  anonymous,
  multipleChoice,
  onAnonymousChange,
  onMultipleChoiceChange,
}: {
  anonymous: boolean
  multipleChoice: boolean
  onAnonymousChange: (value: boolean) => void
  onMultipleChoiceChange: (value: boolean) => void
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <Label>Allow multiple selections</Label>
          <p className="text-xs text-muted-foreground">Users can select more than one option</p>
        </div>
        <Checkbox checked={multipleChoice} onCheckedChange={(checked) => onMultipleChoiceChange(checked as boolean)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Anonymous votes</Label>
          <p className="text-xs text-muted-foreground">Hide who voted for each option</p>
        </div>
        <Checkbox checked={anonymous} onCheckedChange={(checked) => onAnonymousChange(checked as boolean)} />
      </div>
    </div>
  )
}

export function CreatePollDialogFooter({
  isCreating,
  onCancel,
  onCreate,
  question,
}: {
  isCreating: boolean
  onCancel: () => void
  onCreate: () => void
  question: string
}) {
  return (
    <DialogFooter>
      <Button type="button" variant="outline" onClick={onCancel} disabled={isCreating}>
        Cancel
      </Button>
      <Button type="button" onClick={onCreate} disabled={isCreating || !question.trim()}>
        {isCreating ? 'Creating…' : 'Create Poll'}
      </Button>
    </DialogFooter>
  )
}

export function QuickPollTrigger() {
  return (
    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Create poll">
      <BarChart3 className="h-4 w-4" />
      <span className="sr-only">Create poll</span>
    </Button>
  )
}