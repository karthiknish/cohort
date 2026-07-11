'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { useMutation } from 'convex/react';
import { v4 as uuidv4 } from 'uuid';
import { Calendar as CalendarIcon, LoaderCircle, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/shared/contexts/auth-context';
import { projectMilestonesApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { Button } from '@/shared/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Popover, PopoverContent, PopoverTrigger, } from '@/shared/ui/popover';
import { Calendar } from '@/shared/ui/calendar';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/lib/utils';
import type { MilestoneRecord, MilestoneStatus } from '@/types/milestones';
import type { ProjectRecord } from '@/types/projects';
import { MILESTONE_STATUSES } from '@/types/milestones';
const MIN_CALENDAR_DATE = new Date('1900-01-01');
const STATUS_LABELS: Record<MilestoneStatus, string> = {
    planned: 'Planned',
    in_progress: 'In progress',
    blocked: 'Blocked',
    completed: 'Completed',
};
export type CreateMilestoneDialogProps = {
    projects: ProjectRecord[];
    trigger?: React.ReactNode;
    defaultProjectId?: string;
    onCreated?: (milestone: MilestoneRecord) => void;
};
type MilestoneFormState = {
    projectId: string;
    title: string;
    status: MilestoneStatus;
    startDate: Date | undefined;
    endDate: Date | undefined;
    description: string;
};
type MilestoneFormAction = {
    type: 'reset';
    projectId: string;
} | {
    type: 'setProjectId';
    value: string;
} | {
    type: 'setTitle';
    value: string;
} | {
    type: 'setStatus';
    value: MilestoneStatus;
} | {
    type: 'setStartDate';
    value: Date | undefined;
} | {
    type: 'setEndDate';
    value: Date | undefined;
} | {
    type: 'setDescription';
    value: string;
};
function createInitialMilestoneFormState(projectId: string): MilestoneFormState {
    return {
        projectId,
        title: '',
        status: 'planned',
        startDate: undefined,
        endDate: undefined,
        description: '',
    };
}
function milestoneFormReducer(state: MilestoneFormState, action: MilestoneFormAction): MilestoneFormState {
    switch (action.type) {
        case 'reset':
            return createInitialMilestoneFormState(action.projectId);
        case 'setProjectId':
            return { ...state, projectId: action.value };
        case 'setTitle':
            return { ...state, title: action.value };
        case 'setStatus':
            return { ...state, status: action.value };
        case 'setStartDate':
            return { ...state, startDate: action.value };
        case 'setEndDate':
            return { ...state, endDate: action.value };
        case 'setDescription':
            return { ...state, description: action.value };
        default:
            return state;
    }
}
export function CreateMilestoneDialog({ projects, trigger, defaultProjectId, onCreated }: CreateMilestoneDialogProps) {
    const { user } = useAuth();
    const createMilestone = useMutation(projectMilestonesApi.create);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formState, dispatch] = useReducer(milestoneFormReducer, defaultProjectId ?? '', createInitialMilestoneFormState);
    const { projectId, title, status, startDate, endDate, description } = formState;
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setTitle', value: event.target.value });
    };
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'setDescription', value: event.target.value });
    };
    const handleStatusChange = (value: MilestoneStatus) => {
        dispatch({ type: 'setStatus', value });
    };
    const handleProjectChange = (value: string) => {
        dispatch({ type: 'setProjectId', value });
    };
    const handleStartDateSelect = (date: Date | undefined) => {
        dispatch({ type: 'setStartDate', value: date });
    };
    const handleEndDateSelect = (date: Date | undefined) => {
        dispatch({ type: 'setEndDate', value: date });
    };
    const handleStartDateDisabled = (date: Date) => date < MIN_CALENDAR_DATE;
    const handleEndDateDisabled = (date: Date) => (startDate ? date < startDate : false) || date < MIN_CALENDAR_DATE;
    const handleCancel = () => {
        setOpen(false);
    };
    useEffect(() => {
        if (!open)
            return;
        const frame = requestAnimationFrame(() => {
            dispatch({ type: 'reset', projectId: defaultProjectId ?? '' });
        });
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [open, defaultProjectId]);
    const sortedProjects = projects.toSorted((a, b) => a.name.localeCompare(b.name));
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!user?.id) {
            notifyFailure({
                title: 'Sign in required',
                message: 'Please sign in to create milestones.',
            });
            return;
        }
        if (!projectId) {
            notifyFailure({
                title: 'Project required',
                message: 'Choose a project for this milestone.',
            });
            return;
        }
        if (!title.trim()) {
            notifyFailure({
                title: 'Title required',
                message: 'Give this milestone a name.',
            });
            return;
        }
        if (!startDate) {
            notifyFailure({
                title: 'Start date required',
                message: 'A milestone needs a start date to appear on the timeline.',
            });
            return;
        }
        setLoading(true);
        if (!user?.agencyId) {
            notifyFailure({
                title: 'Could not create',
                message: 'Missing workspace',
            });
            setLoading(false);
            return;
        }
        const legacyId = uuidv4();
        void createMilestone({
            workspaceId: user.agencyId,
            legacyId,
            projectId,
            title: title.trim(),
            status,
            description: description.trim() || null,
            startDateMs: startDate ? startDate.getTime() : null,
            endDateMs: endDate ? endDate.getTime() : null,
            ownerId: user.id,
            order: null,
        })
            .then(() => {
            const milestone: MilestoneRecord = {
                id: legacyId,
                projectId,
                title: title.trim(),
                description: description.trim() || null,
                status,
                startDate: startDate ? startDate.toISOString() : null,
                endDate: endDate ? endDate.toISOString() : null,
                ownerId: user.id,
                order: null,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            onCreated?.(milestone);
            notifySuccess({ title: 'Milestone created', message: `“${milestone.title}” added to the timeline.` });
            setOpen(false);
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CreateMilestoneDialog:handleSubmit',
                title: 'Could not create',
                fallbackMessage: 'Could not create',
            });
        })
            .finally(() => {
            setLoading(false);
        });
    };
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (<Button size="sm" className="gap-2">
            <Plus className="size-4"/>
            Add milestone
          </Button>)}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add milestone</DialogTitle>
            <DialogDescription>Plan key delivery points and keep teams aligned.</DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-project">Project</Label>
              <Select value={projectId} onValueChange={handleProjectChange} disabled={loading}>
                <SelectTrigger id="milestone-project">
                  <SelectValue placeholder="Select project"/>
                </SelectTrigger>
                <SelectContent>
                  {sortedProjects.map((project) => (<SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-title">Title</Label>
              <Input id="milestone-title" placeholder="e.g., Launch beta cohort" value={title} onChange={handleTitleChange} disabled={loading} required/>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !startDate && 'text-muted-foreground')} disabled={loading}>
                      <CalendarIcon className="mr-2 size-4"/>
                      {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={handleStartDateSelect} initialFocus disabled={handleStartDateDisabled}/>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !endDate && 'text-muted-foreground')} disabled={loading}>
                      <CalendarIcon className="mr-2 size-4"/>
                      {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={handleEndDateSelect} initialFocus disabled={handleEndDateDisabled}/>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-status">Status</Label>
              <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
                <SelectTrigger id="milestone-status">
                  <SelectValue placeholder="Select status"/>
                </SelectTrigger>
                <SelectContent>
                  {MILESTONE_STATUSES.map((s) => (<SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="milestone-description">Notes</Label>
              <Textarea id="milestone-description" placeholder="Optional context or acceptance criteria…" value={description} onChange={handleDescriptionChange} rows={3} disabled={loading}/>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !projectId || !title.trim() || !startDate}>
              {loading && <LoaderCircle className="mr-2 size-4 animate-spin"/>}
              Add milestone
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
