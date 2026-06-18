'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { createElement, useReducer, useState, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, } from '@/shared/ui/dialog';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { cn } from '@/lib/utils';
import { CreatePollDialogFooter, CreatePollDialogHeader, CreatePollDialogTrigger, CreatePollFormFields, CreatePollSettings, PollCardFooterActions, PollCardHeader, PollOptionRow, QuickPollTrigger, } from './message-polls-sections';
const CREATE_POLL_DEFAULT_TRIGGER = <CreatePollDialogTrigger />;
export interface PollOption {
    id: string;
    text: string;
    voters: string[]; // Array of user IDs who voted for this option
}
export interface MessagePoll {
    id: string;
    question: string;
    options: PollOption[];
    multipleChoice: boolean;
    anonymous: boolean;
    endTime?: string | null;
    createdBy: string;
    createdByName: string;
    createdAt: string;
}
interface PollCardProps {
    poll: MessagePoll;
    userId: string | null;
    onVote?: (pollId: string, optionIds: string[]) => Promise<void>;
    onEndPoll?: (pollId: string) => Promise<void>;
    canVote?: boolean;
    canEnd?: boolean;
    showResults?: boolean;
    className?: string;
}
type PollOptionRowFlags = {
    canVote: boolean;
    hasVoted: boolean;
    isExpired: boolean;
    showResults: boolean;
};
type PollOptionRowItemProps = {
    flags: PollOptionRowFlags;
    handleToggleOption: (optionId: string) => void;
    index: number;
    option: PollOption;
    selectedOptions: string[];
    sortedOptions: PollOption[];
    totalVotes: number;
};
function PollOptionRowItem({ flags, handleToggleOption, index, option, selectedOptions, sortedOptions, totalVotes, }: PollOptionRowItemProps) {
    const { canVote, hasVoted, isExpired, showResults } = flags;
    const voteCount = option.voters.length;
    const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
    const isSelected = selectedOptions.includes(option.id);
    const showOptionResults = showResults || hasVoted || isExpired || !canVote;
    const ui = ({
        canVote,
        selected: isSelected,
        showResults: showOptionResults,
        hasLeadingWinner: index === 0,
    });
    return (<PollOptionRow ui={ui} handleToggleOption={handleToggleOption} option={option} percentage={percentage} sortedOptions={sortedOptions} voteCount={voteCount}/>);
}
/**
 * Display a poll with voting functionality
 */
export function PollCard({ poll, userId, onVote, onEndPoll, canVote = true, canEnd = false, showResults: showResultsProp, className, }: PollCardProps) {
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [isVoting, setIsVoting] = useState(false);
    const [showResults, setShowResults] = useState(showResultsProp ?? false);
    // Check if user has already voted
    const userVotedOptions = (() => {
        if (!userId)
            return [];
        return poll.options.filter((opt) => opt.voters.includes(userId));
    })();
    const hasVoted = userVotedOptions.length > 0;
    // Calculate total votes
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voters.length, 0);
    // Sort options by vote count (descending)
    const sortedOptions = poll.options.toSorted((a, b) => b.voters.length - a.voters.length);
    const handleVote = async () => {
        if (!onVote || !userId || selectedOptions.length === 0)
            return;
        setIsVoting(true);
        await onVote(poll.id, selectedOptions)
            .then(() => {
            notifySuccess({
                title: 'Vote recorded',
                message: 'Your response has been saved.',
            });
            setShowResults(true);
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'PollCard:handleVote',
                title: 'Failed to record vote',
                fallbackMessage: 'Failed to record vote',
            });
        })
            .finally(() => {
            setIsVoting(false);
        });
    };
    const handleShowResults = () => {
        setShowResults(true);
    };
    const handleToggleOption = (optionId: string) => {
        if (poll.multipleChoice) {
            setSelectedOptions((prev) => prev.includes(optionId)
                ? prev.filter((id) => id !== optionId)
                : [...prev, optionId]);
        }
        else {
            setSelectedOptions([optionId]);
        }
    };
    const handleEndPoll = async () => {
        if (!onEndPoll)
            return;
        try {
            await onEndPoll(poll.id);
            notifySuccess({
                title: 'Poll ended',
                message: 'The poll has been closed and results are final.',
            });
        }
        catch (error) {
            reportConvexFailure({
                error: error,
                context: 'PollCard:handleEndPoll',
                title: 'Failed to end poll',
                fallbackMessage: 'Failed to end poll',
            });
        }
    };
    const isExpired = (typeof poll.endTime === 'string' ? new Date(poll.endTime) < new Date() : false);
    const footerUi = ({
        canEnd: canEnd && !!onEndPoll,
        canVote,
        hasVoted,
        isExpired: typeof poll.endTime === 'string' ? new Date(poll.endTime) < new Date() : false,
        isVoting,
        showResults,
    });
    const optionRowFlags = ({ canVote, hasVoted, isExpired, showResults });
    return (<div className={cn('border rounded-lg overflow-hidden bg-muted/30', className)}>
      <PollCardHeader isExpired={isExpired} poll={poll} totalVotes={totalVotes}/>

      <div className="p-3 space-y-2">
        {sortedOptions.map((option, index) => (<PollOptionRowItem key={option.id} flags={optionRowFlags} handleToggleOption={handleToggleOption} index={index} option={option} selectedOptions={selectedOptions} sortedOptions={sortedOptions} totalVotes={totalVotes}/>))}
      </div>

      <PollCardFooterActions ui={footerUi} onEndPoll={handleEndPoll} onShowResults={handleShowResults} onVote={handleVote} selectedOptionsCount={selectedOptions.length}/>
    </div>);
}
interface CreatePollDialogProps {
    workspaceId: string | null;
    userId: string | null;
    onCreate?: (poll: Omit<MessagePoll, 'id' | 'createdAt'>) => Promise<void>;
    trigger?: React.ReactNode;
}
type CreatePollFormState = {
    question: string;
    options: Array<{
        id: string;
        text: string;
    }>;
    multipleChoice: boolean;
    anonymous: boolean;
};
type CreatePollFormAction = {
    type: 'reset';
} | {
    type: 'setQuestion';
    value: string;
} | {
    type: 'addOption';
} | {
    type: 'removeOption';
    id: string;
} | {
    type: 'setOptionText';
    id: string;
    text: string;
} | {
    type: 'setMultipleChoice';
    value: boolean;
} | {
    type: 'setAnonymous';
    value: boolean;
};
function createInitialPollFormState(): CreatePollFormState {
    return {
        question: '',
        options: [
            { id: '1', text: '' },
            { id: '2', text: '' },
        ],
        multipleChoice: false,
        anonymous: false,
    };
}
function createPollFormReducer(state: CreatePollFormState, action: CreatePollFormAction): CreatePollFormState {
    switch (action.type) {
        case 'reset':
            return createInitialPollFormState();
        case 'setQuestion':
            return { ...state, question: action.value };
        case 'addOption':
            return {
                ...state,
                options: [...state.options, { id: String(state.options.length + 1), text: '' }],
            };
        case 'removeOption':
            if (state.options.length <= 2)
                return state;
            return { ...state, options: state.options.filter((opt) => opt.id !== action.id) };
        case 'setOptionText':
            return {
                ...state,
                options: state.options.map((opt) => opt.id === action.id ? { ...opt, text: action.text } : opt),
            };
        case 'setMultipleChoice':
            return { ...state, multipleChoice: action.value };
        case 'setAnonymous':
            return { ...state, anonymous: action.value };
        default:
            return state;
    }
}
/**
 * Dialog for creating a new poll
 */
export function CreatePollDialog({ workspaceId, userId, onCreate, trigger, }: CreatePollDialogProps) {
    const [open, setOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [formState, dispatch] = useReducer(createPollFormReducer, undefined, createInitialPollFormState);
    const { question, options, multipleChoice, anonymous } = formState;
    const handleAddOption = () => {
        dispatch({ type: 'addOption' });
    };
    const handleRemoveOption = (id: string) => {
        dispatch({ type: 'removeOption', id });
    };
    const handleOptionChange = (id: string, text: string) => {
        dispatch({ type: 'setOptionText', id, text });
    };
    const handleQuestionChange = (value: string) => {
        dispatch({ type: 'setQuestion', value });
    };
    const handleMultipleChoiceChange = (value: boolean) => {
        dispatch({ type: 'setMultipleChoice', value });
    };
    const handleAnonymousChange = (value: boolean) => {
        dispatch({ type: 'setAnonymous', value });
    };
    const resetForm = () => {
        dispatch({ type: 'reset' });
    };
    const handleCreate = async () => {
        if (!workspaceId || !userId) {
            notifyFailure({
                title: 'Authentication required',
                message: 'Authentication required',
            });
            return;
        }
        const trimmedQuestion = question.trim();
        if (!trimmedQuestion) {
            notifyFailure({
                title: 'Question required',
                message: 'Please enter a question for the poll.',
            });
            return;
        }
        const validOptions = options
            .flatMap((opt) => {
            const text = opt.text.trim();
            return text.length > 0 ? [{ ...opt, text, id: crypto.randomUUID() }] : [];
        });
        if (validOptions.length < 2) {
            notifyFailure({
                title: 'At least 2 options required',
                message: 'Please provide at least 2 answer options.',
            });
            return;
        }
        setIsCreating(true);
        const newPoll: Omit<MessagePoll, 'id' | 'createdAt'> = {
            question: trimmedQuestion,
            options: validOptions.map((opt) => ({ ...opt, voters: [] })),
            multipleChoice,
            anonymous,
            createdBy: userId,
            createdByName: 'You', // Would be populated from user context
            endTime: null,
        };
        await Promise.resolve(onCreate?.(newPoll))
            .then(() => {
            notifySuccess({
                title: 'Poll created',
                message: 'Your poll has been posted to the channel.',
            });
            // Reset form
            resetForm();
            setOpen(false);
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CreatePollDialog:handleCreate',
                title: 'Failed to create poll',
                fallbackMessage: 'Failed to create poll',
            });
        })
            .finally(() => {
            setIsCreating(false);
        });
    };
    const handleCancelCreate = () => {
        setOpen(false);
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      {trigger ?? CREATE_POLL_DEFAULT_TRIGGER}
      <DialogContent className="sm:max-w-md">
        <CreatePollDialogHeader />
        <CreatePollFormFields onAddOption={handleAddOption} onOptionChange={handleOptionChange} onQuestionChange={handleQuestionChange} onRemoveOption={handleRemoveOption} options={options} question={question}/>
        <CreatePollSettings anonymous={anonymous} multipleChoice={multipleChoice} onAnonymousChange={handleAnonymousChange} onMultipleChoiceChange={handleMultipleChoiceChange}/>
        <CreatePollDialogFooter isCreating={isCreating} onCancel={handleCancelCreate} onCreate={handleCreate} question={question}/>
      </DialogContent>
    </Dialog>);
}
/**
 * Quick poll button for message composer toolbar
 */
export function QuickPollButton(props: CreatePollDialogProps) {
    return (<CreatePollDialog {...props} trigger={createElement(QuickPollTrigger)}/>);
}
