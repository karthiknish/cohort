import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { TaskCreationModalFormFields } from './task-creation-modal-form';
const EMPTY_FILE_INPUT_REF = { current: null };
describe('TaskCreationModalFormFields', () => {
    it('renders modal form sections and summaries', () => {
        const markup = renderToStaticMarkup(<TaskCreationModalFormFields title="Plan launch retro" description="Prepare questions and stakeholders." priority="urgent" dueDate="2026-03-20" projectName="Spring Launch" projectId="proj-1" clientName="Acme Corp" assigneeValue="@[Jane Doe]" mentionableUsers={[{ id: 'u1', name: 'Jane Doe' }]} projectOptions={[{ id: 'proj-1', name: 'Spring Launch' }]} projectOptionsLoading={false} error={null} isLoading={false} pendingAttachments={[]} fileInputRef={EMPTY_FILE_INPUT_REF} onTitleChange={vi.fn()} onDescriptionChange={vi.fn()} onPriorityChange={vi.fn()} onDateSelect={vi.fn()} onAssigneeChange={vi.fn()} onProjectChange={vi.fn()} onAddAttachments={vi.fn()} onRemoveAttachment={vi.fn()} onCancel={vi.fn()}/>);
        expect(markup).toContain('Title');
        expect(markup).toContain('Plan launch retro');
        expect(markup).toContain('Acme Corp');
        expect(markup).toContain('Assigned to');
        expect(markup).toContain('Create task');
    });
});
