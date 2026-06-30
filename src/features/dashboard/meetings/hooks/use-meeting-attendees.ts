'use client';
import { notifyFailure } from '@/lib/notifications';
import { type KeyboardEvent, useCallback, useMemo, useState } from 'react';
import { buildMeetingAttendeeDraft, buildMeetingAttendeeSuggestions, mergeMeetingParticipantEmails, normalizeEmail, parseAttendeeInput, sanitizeMeetingParticipantEmails, } from '@/lib/meetings/attendees';
import type { WorkspaceMember } from '../types';
type UseMeetingAttendeesOptions = {
    workspaceMembers: WorkspaceMember[];
    platformUsers: WorkspaceMember[];
    organizerId?: string | null;
    organizerEmail?: string | null;
};
function useAttendeeController(options: UseMeetingAttendeesOptions) {
    const [input, setInput] = useState('');
    const [emails, setEmailsState] = useState<string[]>([]);
    const suggestions = buildMeetingAttendeeSuggestions({ ...options, queryValue: input, selectedEmails: emails });
    const setEmails = (nextEmails: string[]) => {
        setEmailsState(sanitizeMeetingParticipantEmails(nextEmails, options.organizerEmail));
    };
    const addEmails = (entries: string[]) => {
        const organizer = options.organizerEmail ? normalizeEmail(options.organizerEmail) : null;
        const includesOrganizer = organizer ? entries.some((entry) => normalizeEmail(entry) === organizer) : false;
        const participantEntries = sanitizeMeetingParticipantEmails(entries, options.organizerEmail);
        if (includesOrganizer && participantEntries.length === 0) {
            notifyFailure({
                title: 'Add another participant',
                message: 'Your own profile is already the meeting organizer. Add at least one other participant.',
            });
            return;
        }
        if (participantEntries.length === 0)
            return;
        setEmailsState((current) => mergeMeetingParticipantEmails(current, participantEntries, options.organizerEmail));
    };
    const commitInput = () => {
        const parsed = parseAttendeeInput(input);
        if (parsed.length === 0 && input.trim().length > 0) {
            notifyFailure({
                title: 'Invalid attendee email',
                message: 'Enter a valid email or choose a teammate from suggestions.',
            });
            return false;
        }
        addEmails(parsed);
        setInput('');
        return true;
    };
    const addSuggestedEmail = (email: string) => {
        addEmails([email]);
        setInput('');
    };
    const removeEmail = (email: string) => {
        const normalized = normalizeEmail(email);
        setEmailsState((current) => current.filter((value) => normalizeEmail(value) !== normalized));
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter' || event.key === 'Tab') {
            const firstSuggestion = suggestions[0];
            if (firstSuggestion && input.trim().length > 0) {
                event.preventDefault();
                addSuggestedEmail(firstSuggestion.email);
                return;
            }
            event.preventDefault();
            void commitInput();
            return;
        }
        if (event.key === ',' || event.key === ';') {
            event.preventDefault();
            void commitInput();
        }
    };
    const resolveSubmission = () => buildMeetingAttendeeDraft({ selectedEmails: emails, pendingInput: input, organizerEmail: options.organizerEmail });
    const reset = () => {
        setInput('');
        setEmailsState([]);
    };
    return { input, setInput, emails, setEmails, suggestions, commitInput, addSuggestedEmail, removeEmail, handleKeyDown, resolveSubmission, reset };
}
export function useMeetingAttendees(options: UseMeetingAttendeesOptions) {
    const schedule = useAttendeeController(options);
    const quick = useAttendeeController(options);
    return { schedule, quick };
}
