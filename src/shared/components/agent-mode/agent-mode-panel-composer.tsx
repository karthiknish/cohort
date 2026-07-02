'use client';
import { useCallback, useMemo, type ChangeEvent, type ComponentProps, type KeyboardEvent, type RefObject, } from 'react';
import { Clock, Loader2, Paperclip, Send, Sparkles, WifiOff } from 'lucide-react';
import { m } from '@/shared/ui/motion';
import type { AgentAttachmentContext } from '@/lib/agent-attachments';
import type { AgentError } from '@/lib/agent-errors';
import { ERROR_DISPLAY_MESSAGES } from '@/lib/agent-errors';
import type { AgentSuggestion } from '@/lib/agent-context';
import { cn } from '@/lib/utils';
import type { ConnectionStatus } from '@/shared/hooks/use-agent-mode';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { VoiceInputButton } from '@/shared/ui/voice-input';
import { MentionDropdown, type MentionDropdownHandle, type MentionItem } from './mention-dropdown';
import { splitAgentTextWithMentions } from './mention-highlights-utils';
import { AttachmentList } from './agent-mode-panel-attachments';
import { MOTION_FADE_SLIDE_UP, MOTION_FADE_SLIDE_UP_EXIT, MOTION_VISIBLE, } from './agent-mode-panel-message-constants';
function ConnectionIndicator({ status }: {
    status: ConnectionStatus;
}) {
    if (status === 'connected')
        return null;
    return (<m.output aria-live="polite" initial={MOTION_FADE_SLIDE_UP} animate={MOTION_VISIBLE} exit={MOTION_FADE_SLIDE_UP_EXIT} className={cn('flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium', status === 'retrying' && 'bg-warning/10 text-warning', status === 'disconnected' && 'bg-destructive/10 text-destructive')}>
      {status === 'retrying' ? (<>
          <Loader2 className="size-3 animate-spin"/>
          <span>Reconnecting…</span>
        </>) : (<>
          <WifiOff className="size-3"/>
          <span>Offline</span>
        </>)}
    </m.output>);
}
export function RateLimitBanner({ countdown, onDismiss }: {
    countdown: number;
    onDismiss?: () => void;
}) {
    return (<m.output aria-live="assertive" initial={MOTION_FADE_SLIDE_UP} animate={MOTION_VISIBLE} exit={MOTION_FADE_SLIDE_UP_EXIT} className="flex items-center justify-between gap-3 border border-warning/20 bg-warning/10 px-4 py-2.5 text-sm">
      <div className="flex items-center gap-2 text-warning">
        <Clock className="size-4 shrink-0"/>
        <span>Too many requests. Please wait <strong>{countdown}s</strong>…</span>
      </div>
      {onDismiss ? (<Button variant="ghost" size="sm" onClick={onDismiss} className="h-7 px-2 text-warning hover:text-warning/80" aria-label="Dismiss rate limit notice">
          Dismiss
        </Button>) : null}
    </m.output>);
}
export function AgentErrorBanner({ error, lastFailedMessage, onDismiss, }: {
    error: AgentError;
    lastFailedMessage: string | null;
    onDismiss: () => void;
}) {
    if (lastFailedMessage)
        return null;
    const text = error.type === 'validation' ? error.message : (ERROR_DISPLAY_MESSAGES[error.type] ?? error.message);
    return (<div role="alert" aria-live="assertive" className="flex items-center justify-between gap-3 border-b border-destructive/20 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
      <span className="min-w-0 flex-1">{text}</span>
      <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 border-destructive/30 text-destructive hover:bg-destructive/10" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>);
}
function AgentComposerInput({ value, onChange, onKeyDown, inputRef, placeholder, disabled, mentionLabels, maxLength, mentionListboxId, showMentions, }: {
    value: string;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    inputRef: RefObject<HTMLTextAreaElement | null>;
    placeholder: string;
    disabled: boolean;
    mentionLabels: string[];
    maxLength: number;
    mentionListboxId?: string;
    showMentions?: boolean;
}) {
    const activeMentions = (() => {
        const seen = new Set<string>();
        return splitAgentTextWithMentions(value, mentionLabels).flatMap((segment) => {
            if (!segment.isMention)
                return [];
            const key = segment.text.toLowerCase();
            if (seen.has(key))
                return [];
            seen.add(key);
            return [segment.text];
        });
    })();
    const remaining = maxLength - value.length;
    return (<div className="min-w-0 flex-1">
      <Textarea ref={inputRef} value={value} onChange={onChange} onKeyDown={onKeyDown} placeholder={placeholder} className="min-h-[44px] max-h-[160px] resize-none border-0 bg-transparent px-0 py-2 text-sm leading-relaxed shadow-none focus-visible:ring-0 focus-visible:ring-offset-0" disabled={disabled} spellCheck autoGrow maxLength={maxLength} rows={1} role="combobox" aria-label="Agent message" aria-expanded={showMentions ?? false} aria-controls={showMentions && mentionListboxId ? mentionListboxId : undefined} aria-autocomplete="list"/>

      <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
        <p className="text-[10px] text-muted-foreground">
          <kbd className="rounded-md border border-border/60 bg-muted/50 px-1 font-mono text-[10px]">Enter</kbd> send ·{' '}
          <kbd className="rounded-md border border-border/60 bg-muted/50 px-1 font-mono text-[10px]">⇧ Enter</kbd> line
        </p>
        <span className={cn('text-[10px] tabular-nums', remaining < 80 ? 'font-medium text-warning' : 'text-muted-foreground')} aria-live="polite">
          {value.length}/{maxLength}
          {remaining <= 0 ? ' · limit reached' : ''}
        </span>
      </div>

      {activeMentions.length > 0 ? (<div className="mt-2 flex flex-wrap gap-1.5">
          {activeMentions.map((mention) => (<Badge key={mention} variant="secondary" className="rounded-full bg-primary/10 text-primary hover:bg-primary/10">
              @{mention}
            </Badge>))}
        </div>) : null}
    </div>);
}
export type AgentComposerSectionProps = {
    layout: 'centered' | 'dock';
    inputValue: string;
    inputRef: RefObject<HTMLTextAreaElement | null>;
    mentionLabels: string[];
    maxMessageLength: number;
    showMentions: boolean;
    mentionQuery: string;
    clients: MentionDropdownProps['clients'];
    projects: MentionDropdownProps['projects'];
    teams: MentionDropdownProps['teams'];
    users: MentionDropdownProps['users'];
    mentionsLoading: MentionDropdownProps['isLoading'];
    pendingAttachments: AgentAttachmentContext[];
    isExtractingAttachments: boolean;
    disabled: boolean;
    onInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onOpenFilePicker: () => void;
    onCloseMentions: () => void;
    onSelectMention: (item: MentionItem) => void;
    onVoiceTranscript: (text: string) => void;
    onVoiceInterim: (text: string) => void;
    onRemoveAttachment: (attachmentId: string) => void;
    onSubmit: () => void;
    quickSuggestions?: AgentSuggestion[];
    onSuggestionClick?: (suggestion: AgentSuggestion) => void;
    mentionListboxId?: string;
    mentionDropdownRef?: RefObject<MentionDropdownHandle | null>;
};
type MentionDropdownProps = ComponentProps<typeof MentionDropdown>;
const EMPTY_QUICK_SUGGESTIONS: AgentSuggestion[] = [];
function SuggestionButton({ suggestion, disabled, onSuggestionClick, }: {
    suggestion: AgentSuggestion;
    disabled: boolean;
    onSuggestionClick: (suggestion: AgentSuggestion) => void;
}) {
    const onApplySuggestion = () => {
        onSuggestionClick(suggestion);
    };
    return (<button type="button" onClick={onApplySuggestion} disabled={disabled} className="group rounded-xl border border-border/60 bg-card/80 px-3 py-2 text-left text-xs font-medium shadow-sm transition-all hover:border-primary/25 hover:bg-primary/[0.04] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50" title={suggestion.prompt}>
      <span className="flex items-center gap-1.5">
        <Sparkles className="size-3 text-primary/70 transition-colors group-hover:text-primary" aria-hidden/>
        {suggestion.label}
      </span>
    </button>);
}
export function AgentComposerSection({ layout, inputValue, inputRef, mentionLabels, showMentions, mentionQuery, clients, projects, teams, users, mentionsLoading, pendingAttachments, isExtractingAttachments, disabled, onInputChange, onKeyDown, onOpenFilePicker, onCloseMentions, onSelectMention, onVoiceTranscript, onVoiceInterim, onRemoveAttachment, onSubmit, quickSuggestions = EMPTY_QUICK_SUGGESTIONS, onSuggestionClick, maxMessageLength, mentionListboxId = 'agent-mention-listbox', mentionDropdownRef, }: AgentComposerSectionProps) {
    const isCentered = layout === 'centered';
    return (<div className={cn(isCentered ? 'p-1' : 'relative border-t border-border/50 bg-muted/20 p-3', !isCentered &&
            'pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))]')}>
      <AttachmentList attachments={pendingAttachments} onRemoveAttachment={onRemoveAttachment}/>

      <div className={cn('relative', isCentered && 'mx-auto max-w-xl')}>
        <MentionDropdown ref={mentionDropdownRef} listboxId={mentionListboxId} isOpen={showMentions} onClose={onCloseMentions} onSelect={onSelectMention} searchQuery={mentionQuery} clients={clients} projects={projects} teams={teams} users={users} isLoading={mentionsLoading}/>

        <div className={cn('rounded-2xl border border-border/70 bg-card p-3 shadow-sm transition-shadow', 'focus-within:border-primary/30 focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/15', disabled && 'opacity-60')}>
          <AgentComposerInput inputRef={inputRef} value={inputValue} onChange={onInputChange} onKeyDown={onKeyDown} placeholder={isCentered
            ? 'Create projects, run analytics, send messages, or navigate…'
            : 'Ask about tasks, projects, analytics, ads, or meetings…'} disabled={disabled} mentionLabels={mentionLabels} maxLength={maxMessageLength} mentionListboxId={mentionListboxId} showMentions={showMentions}/>

          <div className="mt-2 flex items-center justify-end gap-1.5">
            <VoiceInputButton variant="standalone" showWaveform={false} onTranscript={onVoiceTranscript} onInterimTranscript={onVoiceInterim} disabled={disabled}/>

            <Button type="button" variant="ghost" size="icon" onClick={onOpenFilePicker} disabled={disabled} className="size-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground" aria-label="Attach context files" title="Attach context files (⌘⇧U)">
              {isExtractingAttachments ? (<Loader2 className="size-4 animate-spin"/>) : (<Paperclip className="size-4"/>)}
            </Button>

            <Button size="icon" onClick={onSubmit} disabled={!inputValue.trim() || disabled} className="size-9 shrink-0 rounded-full bg-primary shadow-sm hover:bg-primary/90 disabled:opacity-40" aria-label="Send message" title={!inputValue.trim() ? 'Type a message to send' : 'Send message'}>
              <Send className="size-4"/>
            </Button>
          </div>
        </div>
      </div>

      {isCentered && quickSuggestions.length > 0 && onSuggestionClick ? (<div className="mx-auto mt-4 grid max-w-xl gap-2 sm:grid-cols-2">
          {quickSuggestions.map((suggestion) => (<SuggestionButton key={suggestion.id} suggestion={suggestion} disabled={disabled} onSuggestionClick={onSuggestionClick}/>))}
        </div>) : null}
    </div>);
}
export { ConnectionIndicator };
