'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useReducer, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { Briefcase, LoaderCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { projectsApi } from '@/lib/convex-api';
import { emitDashboardRefresh } from '@/lib/refresh-bus';
import { getIconContainerClasses } from '@/lib/dashboard-theme';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { Button } from '@/shared/ui/button';
import { FormSheetClose, ResponsiveFormSheet } from '@/shared/ui/responsive-form-sheet';
import type { ProjectRecord, ProjectStatus } from '@/types/projects';
import { PROJECTS_THEME } from './components/projects-theme';
import { CreateProjectFormFields } from './create-project-dialog-form';
type CreateProjectSheetProps = {
    onProjectCreated?: (project: ProjectRecord) => void;
    trigger?: React.ReactNode;
};
type CreateProjectPayload = {
    name: string;
    description?: string;
    status: ProjectStatus;
    clientId?: string;
    clientName?: string;
    startDate?: string;
    endDate?: string;
    tags: string[];
};
export type ProjectFormState = {
    name: string;
    description: string;
    status: ProjectStatus;
    clientId: string;
    startDate: Date | undefined;
    endDate: Date | undefined;
    tags: string[];
    tagInput: string;
};
type ProjectFormAction = {
    type: 'reset';
    clientId: string;
} | {
    type: 'setName';
    value: string;
} | {
    type: 'setDescription';
    value: string;
} | {
    type: 'setStatus';
    value: ProjectStatus;
} | {
    type: 'setClientId';
    value: string;
} | {
    type: 'setStartDate';
    value: Date | undefined;
} | {
    type: 'setEndDate';
    value: Date | undefined;
} | {
    type: 'setTagInput';
    value: string;
} | {
    type: 'addTag';
    value: string;
} | {
    type: 'removeTag';
    value: string;
};
function createInitialFormState(selectedClientId: string | null | undefined): ProjectFormState {
    return {
        name: '',
        description: '',
        status: 'planning',
        clientId: selectedClientId ?? '',
        startDate: undefined,
        endDate: undefined,
        tags: [],
        tagInput: '',
    };
}
function projectFormReducer(state: ProjectFormState, action: ProjectFormAction): ProjectFormState {
    switch (action.type) {
        case 'reset':
            return createInitialFormState(action.clientId);
        case 'setName':
            return { ...state, name: action.value };
        case 'setDescription':
            return { ...state, description: action.value };
        case 'setStatus':
            return { ...state, status: action.value };
        case 'setClientId':
            return { ...state, clientId: action.value };
        case 'setStartDate':
            return { ...state, startDate: action.value };
        case 'setEndDate':
            return { ...state, endDate: action.value };
        case 'setTagInput':
            return { ...state, tagInput: action.value };
        case 'addTag':
            return { ...state, tags: [...state.tags, action.value], tagInput: '' };
        case 'removeTag':
            return { ...state, tags: state.tags.filter((tag) => tag !== action.value) };
        default:
            return state;
    }
}
function formatStatusLabel(value: ProjectStatus): string {
    return value
        .replace('_', ' ')
        .split(' ')
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}
export function CreateProjectSheet({ onProjectCreated, trigger }: CreateProjectSheetProps) {
    const { user } = useAuth();
    const workspaceId = user?.agencyId ?? null;
    const createProject = useMutation(projectsApi.create);
    const { clients, selectedClientId } = useClientContext();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [nameError, setNameError] = useState<string | null>(null);
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const [formState, dispatch] = useReducer(projectFormReducer, selectedClientId, createInitialFormState);
    const resetForm = () => {
        dispatch({ type: 'reset', clientId: selectedClientId ?? '' });
    };
    const handleOpenChange = (value: boolean) => {
        setOpen(value);
        if (value) {
            setNameError(null);
            resetForm();
        }
    };
    const handleAddTag = () => {
        const trimmed = formState.tagInput.trim();
        if (trimmed && !formState.tags.includes(trimmed) && formState.tags.length < 10) {
            dispatch({ type: 'addTag', value: trimmed });
        }
    };
    const handleRemoveTag = (tag: string) => {
        dispatch({ type: 'removeTag', value: tag });
    };
    const handleTagKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleAddTag();
        }
    };
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?.id || !workspaceId) {
            notifyFailure({
                title: 'Authentication required',
                message: 'Please sign in to create a project.',
            });
            return;
        }
        if (!formState.name.trim()) {
            setNameError('Give your project a name to get started.');
            nameInputRef.current?.focus();
            return;
        }
        setLoading(true);
        const selectedClientData = clients.find((c) => c.id === formState.clientId);
        const payload: CreateProjectPayload = {
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            status: formState.status,
            clientId: formState.clientId && formState.clientId !== 'none' ? formState.clientId : undefined,
            clientName: selectedClientData?.name || undefined,
            startDate: formState.startDate ? format(formState.startDate, 'yyyy-MM-dd') : undefined,
            endDate: formState.endDate ? format(formState.endDate, 'yyyy-MM-dd') : undefined,
            tags: formState.tags,
        };
        const legacyId = uuidv4();
        void createProject({
            workspaceId,
            legacyId,
            name: payload.name,
            description: payload.description ?? null,
            status: payload.status,
            clientId: payload.clientId ?? null,
            clientName: payload.clientName ?? null,
            startDateMs: payload.startDate ? new Date(payload.startDate).getTime() : null,
            endDateMs: payload.endDate ? new Date(payload.endDate).getTime() : null,
            tags: payload.tags,
            ownerId: user?.id ?? null,
        })
            .then(() => {
            const nowMs = Date.now();
            const createdProject: ProjectRecord = {
                id: legacyId,
                name: payload.name,
                description: payload.description ?? null,
                status: payload.status,
                clientId: payload.clientId ?? null,
                clientName: payload.clientName ?? null,
                startDate: payload.startDate ? new Date(payload.startDate).toISOString() : null,
                endDate: payload.endDate ? new Date(payload.endDate).toISOString() : null,
                tags: payload.tags,
                ownerId: user?.id ?? null,
                createdAt: new Date(nowMs).toISOString(),
                updatedAt: new Date(nowMs).toISOString(),
                taskCount: 0,
                openTaskCount: 0,
                recentActivityAt: null,
                deletedAt: null,
            };
            notifySuccess({
                title: 'Project created!',
                message: `"${createdProject.name}" is ready. Start adding tasks and collaborating.`,
            });
            onProjectCreated?.(createdProject);
            emitDashboardRefresh({ reason: 'project-mutated', clientId: createdProject.clientId ?? null });
            setOpen(false);
            resetForm();
        })
            .catch((error) => {
            reportConvexFailure({
                error,
                context: 'CreateProjectSheet:handleSubmit',
                title: 'Creation failed',
                fallbackMessage: 'Creation failed',
            });
        })
            .finally(() => {
            setLoading(false);
        });
    };
    const handleNameChange = (value: string) => {
        setNameError(null);
        dispatch({ type: 'setName', value });
    };
    const handleDescriptionChange = (value: string) => {
        dispatch({ type: 'setDescription', value });
    };
    const handleStatusChange = (value: ProjectStatus) => {
        dispatch({ type: 'setStatus', value });
    };
    const handleClientChange = (value: string) => {
        dispatch({ type: 'setClientId', value });
    };
    const handleStartDateChange = (value: Date | undefined) => {
        dispatch({ type: 'setStartDate', value });
    };
    const handleEndDateChange = (value: Date | undefined) => {
        dispatch({ type: 'setEndDate', value });
    };
    const handleTagInputChange = (value: string) => {
        dispatch({ type: 'setTagInput', value });
    };
    const handleTriggerClick = () => handleOpenChange(true);
    const triggerNode = trigger ?? (<Button id="create-project-trigger" type="button" onClick={handleTriggerClick} className="gap-2 shadow-sm transition-shadow hover:shadow-md">
        <Plus className="size-4" aria-hidden/>
        New project
      </Button>);
    return (<ResponsiveFormSheet open={open} onOpenChange={handleOpenChange} trigger={triggerNode} contentClassName={PROJECTS_THEME.sheet.content}>
      <form className="flex h-full min-h-0 flex-col" onSubmit={handleSubmit}>
        <div className={PROJECTS_THEME.sheet.header}>
          <div className="flex items-start gap-3">
            <div className={cn(getIconContainerClasses('medium'), 'size-10 shrink-0')}>
              <Briefcase className="size-5" aria-hidden/>
            </div>
            <div className="min-w-0 space-y-1">
              <h2 className="text-lg font-semibold tracking-tight text-foreground">Create new project</h2>
              <p className="text-sm text-muted-foreground">
                Add a new project to track work, tasks, and team collaboration.
              </p>
            </div>
          </div>
        </div>

        <div className={PROJECTS_THEME.sheet.body}>
          <CreateProjectFormFields loading={loading} clients={clients} state={formState} nameError={nameError} nameInputRef={nameInputRef} onNameChange={handleNameChange} onDescriptionChange={handleDescriptionChange} onStatusChange={handleStatusChange} onClientChange={handleClientChange} onStartDateChange={handleStartDateChange} onEndDateChange={handleEndDateChange} onTagInputChange={handleTagInputChange} onTagKeyDown={handleTagKeyDown} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} formatStatusLabel={formatStatusLabel}/>
        </div>

        <div className={PROJECTS_THEME.sheet.footer}>
          <Button type="submit" disabled={loading || !formState.name.trim()} className="h-9 min-w-[7.5rem] font-medium">
            {loading && <LoaderCircle className="mr-2 size-4 animate-spin"/>}
            Create project
          </Button>
          <FormSheetClose asChild>
            <Button type="button" variant="outline" className="h-9" disabled={loading}>
              Cancel
            </Button>
          </FormSheetClose>
        </div>
      </form>
    </ResponsiveFormSheet>);
}
/** @deprecated Use CreateProjectSheet */
export const CreateProjectDialog = CreateProjectSheet;
