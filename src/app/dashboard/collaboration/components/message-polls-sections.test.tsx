import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ui/dialog', () => ({
  DialogDescription: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

import type { MessagePoll } from './message-polls'
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

const poll: MessagePoll = {
  id: 'poll-1',
  question: 'Which design direction should we ship?',
  options: [
    { id: 'a', text: 'Option A', voters: ['user-1', 'user-2'] },
    { id: 'b', text: 'Option B', voters: ['user-3'] },
  ],
  multipleChoice: false,
  anonymous: false,
  endTime: null,
  createdBy: 'user-1',
  createdByName: 'Alex Kim',
  createdAt: '2026-03-11T12:00:00.000Z',
}

describe('message polls sections', () => {
  it('renders poll card sections', () => {
    const markup = renderToStaticMarkup(
      <>
        <PollCardHeader isExpired={false} poll={poll} totalVotes={3} />
        <PollOptionRow
          canVote={true}
          handleToggleOption={vi.fn()}
          hasLeadingWinner={true}
          isSelected={true}
          option={poll.options[0]!}
          percentage={67}
          showOptionResults={true}
          sortedOptions={poll.options}
          voteCount={2}
        />
        <PollCardFooterActions
          canEnd={true}
          canVote={true}
          hasVoted={false}
          isExpired={false}
          isVoting={false}
          onEndPoll={vi.fn()}
          onShowResults={vi.fn()}
          onVote={vi.fn()}
          selectedOptionsCount={1}
          showResults={false}
        />
      </>,
    )

    expect(markup).toContain('Which design direction should we ship?')
    expect(markup).toContain('Option A')
    expect(markup).toContain('67%')
    expect(markup).toContain('Submit Vote')
    expect(markup).toContain('End Poll')
  })

  it('renders create poll dialog sections and quick trigger', () => {
    const markup = renderToStaticMarkup(
      <>
        <CreatePollDialogTrigger trigger={undefined} />
        <CreatePollDialogHeader />
        <CreatePollFormFields
          onAddOption={vi.fn()}
          onOptionChange={vi.fn()}
          onQuestionChange={vi.fn()}
          onRemoveOption={vi.fn()}
          options={[{ id: '1', text: '' }, { id: '2', text: 'Second' }]}
          question="Launch poll?"
        />
        <CreatePollSettings anonymous={true} multipleChoice={true} onAnonymousChange={vi.fn()} onMultipleChoiceChange={vi.fn()} />
        <CreatePollDialogFooter isCreating={false} onCancel={vi.fn()} onCreate={vi.fn()} question="Launch poll?" />
        <QuickPollTrigger />
      </>,
    )

    expect(markup).toContain('Create Poll')
    expect(markup).toContain('Launch poll?')
    expect(markup).toContain('Add Option')
    expect(markup).toContain('Allow multiple selections')
    expect(markup).toContain('Anonymous votes')
    expect(markup).toContain('Cancel')
  })
})
