'use client';
import { useCallback } from 'react';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { Calendar as CalendarIcon, LoaderCircle, Paperclip, Sparkles } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { PendingAttachmentsList } from '@/features/dashboard/collaboration/components/message-composer';
import { Button } from '@/shared/ui/button';
import { Calendar } from '@/shared/ui/calendar';
import { Input } from '@/shared/ui/input';
import { MentionInput } from '@/shared/ui/mention-input';
import { Popover, PopoverContent, PopoverTrigger, } from '@/shared/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/lib/utils';
import type { PendingTaskAttachment } from '@/services/task-attachments';
import type { TaskPriority, TaskStatus } from '@/types/tasks';
import { useAiGenerate } from '../shared/hooks/use-ai-generate';
import { TaskContextChip, TaskFormField, TaskFormSection, } from './task-modal-primitives';
import { TaskProjectPicker } from './task-project-picker';
import { TASKS_THEME } from './tasks-theme';
import { formatPriorityLabel, formatStatusLabel, isTaskDueDateDisabled, priorityAccentColors, type TaskFormState, } from './task-types';
import type { TaskProjectOption } from './hooks/use-task-project-options';
type MentionableUsers = Array<{
    id: string;
    name: string;
    role?: string;
}>;
type TaskSheetFieldsProps = {
    ids: {
        title: string;
        description: string;
        status: string;
        priority: string;
        client: string;
        project: string;
        dueDate: string;
    };
    formState: TaskFormState;
    setFormState: Dispatch<SetStateAction<TaskFormState>>;
    disabled: boolean;
    mentionableUsers: MentionableUsers;
    titlePlaceholder: string;
    clientPlaceholder: string;
    projectPlaceholder: string;
    clientHelpText?: string;
    projectHelpText?: string;
    dueDateLayout?: 'compact' | 'full';
    showStatus?: boolean;
    projectOptions?: TaskProjectOption[];
    projectOptionsLoading?: boolean;
    allowProjectSelection?: boolean;
};
const EMPTY_PROJECT_OPTIONS: TaskProjectOption[] = [];
function PrioritySelectItem({ value }: {
    value: TaskPriority;
}) {
    return (<span className="flex items-center gap-2">
      <span className={cn('size-2 shrink-0 rounded-full', priorityAccentColors[value])} aria-hidden/>
      {formatPriorityLabel(value)}
    </span>);
}
export function TaskSheetFields({ ids, formState, setFormState, disabled, mentionableUsers, titlePlaceholder, clientPlaceholder, projectPlaceholder, clientHelpText, projectHelpText, dueDateLayout = 'full', showStatus = true, projectOptions = EMPTY_PROJECT_OPTIONS, projectOptionsLoading = false, allowProjectSelection = false, }: TaskSheetFieldsProps) {
    const { generate, isGenerating } = useAiGenerate('task');
    const handleDueDateSelect = (date: Date | undefined) => {
        setFormState((prev) => ({
            ...prev,
            dueDate: date ? format(date, 'yyyy-MM-dd') : '',
        }));
    };
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({ ...prev, title: event.target.value }));
    };
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setFormState((prev) => ({ ...prev, description: event.target.value }));
    };
    const handleStatusChange = (value: string) => {
        setFormState((prev) => ({ ...prev, status: value as TaskStatus }));
    };
    const handlePriorityChange = (value: string) => {
        setFormState((prev) => ({ ...prev, priority: value as TaskPriority }));
    };
    const handleAssignedToChange = (value: string) => {
        setFormState((prev) => ({ ...prev, assignedTo: value }));
    };
    const handleProjectChange = (project: { id: string | null; name: string }) => {
        setFormState((prev) => ({
            ...prev,
            projectId: project.id,
            projectName: project.name,
        }));
    };
    const handleGenerateTitle = () => {
        void generate('title', { currentTitle: formState.title, currentDescription: formState.description, priority: formState.priority, status: formState.status, assignee: formState.assignedTo }).then((result) => {
            if (result && 'title' in result) {
                setFormState((prev) => ({ ...prev, title: result.title }));
            }
        });
    };
    const handleGenerateDescription = () => {
        void generate('description', { currentTitle: formState.title, currentDescription: formState.description, priority: formState.priority, status: formState.status, assignee: formState.assignedTo }).then((result) => {
            if (result && 'description' in result) {
                setFormState((prev) => ({ ...prev, description: result.description }));
            }
        });
    };
    const dueDateField = (<TaskFormField id={ids.dueDate} label="Due date">
      <Popover>
        <PopoverTrigger asChild>
          <Button id={ids.dueDate} type="button" variant="outline" className={cn(TASKS_THEME.selectTrigger, 'w-full justify-start text-left font-normal', !formState.dueDate && 'text-muted-foreground')} disabled={disabled}>
            <CalendarIcon className="mr-2 size-4 shrink-0"/>
            {formState.dueDate ? format(parseISO(formState.dueDate), 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={formState.dueDate ? parseISO(formState.dueDate) : undefined} disabled={isTaskDueDateDisabled} onSelect={handleDueDateSelect} initialFocus/>
        </PopoverContent>
      </Popover>
    </TaskFormField>);
    return (<>
      <TaskFormSection title="Essentials">
        <TaskFormField id={ids.title} label="Title" required labelAction={<Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary" onClick={handleGenerateTitle} disabled={disabled || isGenerating}>
              {isGenerating ? (<LoaderCircle className="size-3.5 animate-spin"/>) : (<Sparkles className="size-3.5"/>)}
              AI Generate
            </Button>}>
          <Input id={ids.title} value={formState.title} onChange={handleTitleChange} placeholder={titlePlaceholder} required disabled={disabled || isGenerating} className={TASKS_THEME.input}/>
        </TaskFormField>

        <TaskFormField id={ids.description} label="Description" labelAction={<Button type="button" variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-primary" onClick={handleGenerateDescription} disabled={disabled || isGenerating}>
              {isGenerating ? (<LoaderCircle className="size-3.5 animate-spin"/>) : (<Sparkles className="size-3.5"/>)}
              AI Generate
            </Button>}>
          <Textarea id={ids.description} value={formState.description} onChange={handleDescriptionChange} placeholder="Add context, goals, or next steps" rows={4} disabled={disabled || isGenerating} className={TASKS_THEME.textarea}/>
        </TaskFormField>
      </TaskFormSection>

      <TaskFormSection title="Workflow">
        <div className="grid gap-3.5 sm:grid-cols-2">
          {showStatus ? (<TaskFormField id={ids.status} label="Status">
              <Select value={formState.status} onValueChange={handleStatusChange} disabled={disabled}>
                <SelectTrigger id={ids.status} className={TASKS_THEME.selectTrigger}>
                  <SelectValue placeholder="Select status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">{formatStatusLabel('todo')}</SelectItem>
                  <SelectItem value="in-progress">{formatStatusLabel('in-progress')}</SelectItem>
                  <SelectItem value="review">{formatStatusLabel('review')}</SelectItem>
                  <SelectItem value="completed">{formatStatusLabel('completed')}</SelectItem>
                </SelectContent>
              </Select>
            </TaskFormField>) : null}

          <TaskFormField id={ids.priority} label="Priority">
            <Select value={formState.priority} onValueChange={handlePriorityChange} disabled={disabled}>
              <SelectTrigger id={ids.priority} className={TASKS_THEME.selectTrigger}>
                <SelectValue placeholder="Select priority"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <PrioritySelectItem value="low"/>
                </SelectItem>
                <SelectItem value="medium">
                  <PrioritySelectItem value="medium"/>
                </SelectItem>
                <SelectItem value="high">
                  <PrioritySelectItem value="high"/>
                </SelectItem>
                <SelectItem value="urgent">
                  <PrioritySelectItem value="urgent"/>
                </SelectItem>
              </SelectContent>
            </Select>
          </TaskFormField>
        </div>

        <TaskFormField label="Assigned to">
          <MentionInput value={formState.assignedTo} onChange={handleAssignedToChange} users={mentionableUsers} placeholder="Type @ to assign teammates" disabled={disabled} allowMultiple/>
        </TaskFormField>

        {dueDateLayout === 'compact' ? (<div className="grid gap-3.5 sm:grid-cols-2">{dueDateField}</div>) : (dueDateField)}
      </TaskFormSection>

      <TaskFormSection title="Context">
        <div className="grid gap-3.5 sm:grid-cols-2">
          <TaskFormField id={ids.client} label="Client" hint={clientHelpText}>
            <TaskContextChip>
              <span className={cn(!formState.clientName && 'text-muted-foreground')}>
                {formState.clientName || clientPlaceholder}
              </span>
            </TaskContextChip>
          </TaskFormField>

          <TaskFormField id={ids.project} label="Project" hint={projectHelpText}>
            {allowProjectSelection ? (<TaskProjectPicker value={formState.projectId} projectName={formState.projectName} options={projectOptions} loading={projectOptionsLoading} disabled={disabled} placeholder={projectPlaceholder} onChange={handleProjectChange}/>) : (<TaskContextChip>
              <span className={cn(!formState.projectName && 'text-muted-foreground')}>
                {formState.projectName || projectPlaceholder}
              </span>
            </TaskContextChip>)}
          </TaskFormField>
        </div>
      </TaskFormSection>
    </>);
}
type TaskSheetAttachmentsSectionProps = {
    disabled: boolean;
    pendingAttachments: PendingTaskAttachment[];
    onAddAttachments: (files: FileList | null) => void;
    onRemoveAttachment: (attachmentId: string) => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
};
export function TaskSheetAttachmentsSection({ disabled, pendingAttachments, onAddAttachments, onRemoveAttachment, fileInputRef, }: TaskSheetAttachmentsSectionProps) {
    const handleAttachFilesClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onAddAttachments(event.target.files);
        event.currentTarget.value = '';
    };
    return (<TaskFormSection title="Attachments">
      <div className="flex items-center justify-between gap-2">
        <p className={TASKS_THEME.hint}>Up to 10 files, 15MB each.</p>
        <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 gap-1.5" onClick={handleAttachFilesClick} disabled={disabled}>
          <Paperclip className="size-3.5"/>
          Attach
        </Button>
      </div>

      <input ref={fileInputRef} type="file" multiple aria-label="Attach files to task" className="hidden" onChange={handleFileInputChange}/>

      {pendingAttachments.length > 0 ? (<PendingAttachmentsList attachments={pendingAttachments} uploading={disabled} onRemove={onRemoveAttachment}/>) : null}
    </TaskFormSection>);
}
