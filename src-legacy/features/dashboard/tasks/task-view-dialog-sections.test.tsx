import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { TaskRecord } from '@/types/tasks';
vi.mock('next/link', () => ({
    default: ({ children, href }: {
        children: ReactNode;
        href: string;
    }) => <a href={href}>{children}</a>,
}));
vi.mock('@/shared/ui/dialog', () => ({
    DialogDescription: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DialogFooter: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DialogHeader: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DialogTitle: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
}));
vi.mock('@/shared/ui/tabs', () => ({
    TabsContent: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    TabsList: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    TabsTrigger: ({ children }: {
        children: ReactNode;
    }) => <button type="button">{children}</button>,
}));
vi.mock('@/shared/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DropdownMenuContent: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DropdownMenuItem: ({ children }: {
        children: ReactNode;
    }) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
}));
vi.mock('./task-comments', () => ({
    TaskCommentsPanel: () => <div>TaskCommentsPanel</div>,
}));
import { TaskViewCommentsTab, TaskViewDetailsTab, TaskViewDialogFooter, TaskViewDialogHeader, TaskViewDialogTabsList, } from './task-view-dialog-sections';
const task: TaskRecord = {
    id: 'task-1',
    title: 'Review launch brief',
    description: 'Check timeline and owner list.',
    status: 'todo',
    priority: 'medium',
    assignedTo: ['Alex Kim'],
    clientId: 'client-1',
    client: 'Acme Corp',
    projectId: 'project-1',
    projectName: 'Spring Launch',
    dueDate: '2026-03-20',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-10',
    attachments: [{ url: 'https://example.com/file.pdf', name: 'Brief.pdf', type: 'pdf', size: '2 MB' }],
};
const taskWithoutAttachments: TaskRecord = { ...task, attachments: [] };
describe('task view dialog sections', () => {
    it('renders the header, tabs list, and footer without duplicate summary', () => {
        const markup = renderToStaticMarkup(<>
        <TaskViewDialogHeader title="Review launch brief" status="todo" priority="medium" client="Acme Corp" assignedTo={['Alex Kim']} dueDate="2026-03-20" timeSpentMinutes={0}/>
        <TaskViewDialogTabsList commentCount={3}/>
        <TaskViewDialogFooter onClose={vi.fn()} onEdit={vi.fn()} onMarkComplete={vi.fn()}/>
      </>);
        expect(markup).toContain('Review launch brief');
        expect(markup).toContain('To Do');
        expect(markup).toContain('Medium');
        expect(markup).toContain('Alex Kim');
        expect(markup).not.toContain('Task summary');
        expect(markup).not.toContain('Quick actions');
        expect(markup).toContain('Mark complete');
        expect(markup).toContain('Edit task');
    });
    it('renders a minimal details tab without info cards', () => {
        const markup = renderToStaticMarkup(<TaskViewDetailsTab task={task}/>);
        expect(markup).toContain('Description');
        expect(markup).toContain('Check timeline and owner list.');
        expect(markup).toContain('Project');
        expect(markup).toContain('Brief.pdf');
        expect(markup).toContain('Created');
        expect(markup).toContain('Updated');
        expect(markup).not.toContain('ASSIGNEE');
        expect(markup).not.toContain('TIME SPENT');
    });
    it('renders the comments tab', () => {
        const markup = renderToStaticMarkup(<TaskViewCommentsTab onCommentCountChange={vi.fn()} participants={[]} taskId="task-1" userId={null} userName={null} userRole={null} workspaceId={null}/>);
        expect(markup).toContain('TaskCommentsPanel');
    });
    it('renders empty attachments as plain text', () => {
        const markup = renderToStaticMarkup(<TaskViewDetailsTab task={taskWithoutAttachments}/>);
        expect(markup).toContain('No attachments.');
        expect(markup).not.toContain('Drag and drop');
    });
});
