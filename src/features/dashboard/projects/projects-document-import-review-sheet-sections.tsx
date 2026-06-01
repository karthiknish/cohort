'use client';
import { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/shared/ui/badge';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/lib/utils';
import { PROJECT_STATUSES, type ProjectStatus } from '@/types/projects';
import { formatStatusLabel } from './components/utils';
import type { ProposedImportProject } from './projects-document-import-types';
import { buildClientReviewPrompt, projectNeedsClientReview, projectNeedsEndDateReview, projectNeedsStartDateReview, } from './projects-document-import-review';
type ImportReviewProjectRowProps = {
    project: ProposedImportProject;
    index: number;
    clients: Array<{
        id: string;
        name: string;
    }>;
    preferredClientName: string | null;
    onUpdateProject: (localId: string, patch: Partial<ProposedImportProject>) => void;
};
export function ImportReviewProjectRow({ project, index, clients, preferredClientName, onUpdateProject, }: ImportReviewProjectRowProps) {
    const needsClientReview = projectNeedsClientReview(project);
    const needsStartDateReview = projectNeedsStartDateReview(project);
    const needsEndDateReview = projectNeedsEndDateReview(project);
    const handleIncludeChange = (checked: boolean | 'indeterminate') => {
        onUpdateProject(project.localId, { include: checked === true });
    };
    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateProject(project.localId, { name: event.target.value });
    };
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateProject(project.localId, { description: event.target.value });
    };
    const handleStatusChange = (value: ProjectStatus) => {
        onUpdateProject(project.localId, { status: value });
    };
    const handleClientChange = (value: string) => {
        onUpdateProject(project.localId, {
            clientId: value === 'none' ? '' : value,
            clientStatus: value === 'none' ? 'unassigned' : 'resolved',
        });
    };
    const handleStartDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateProject(project.localId, {
            startDate: event.target.value,
            startDateStatus: event.target.value ? 'resolved' : project.startDateStatus,
        });
    };
    const handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateProject(project.localId, {
            endDate: event.target.value,
            endDateStatus: event.target.value ? 'resolved' : project.endDateStatus,
        });
    };
    const resolvedClientName = clients.find((client) => client.id === project.clientId)?.name ??
        (project.clientStatus === 'preferred' ? preferredClientName : null);
    return (<article className={cn('rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm', !project.include && 'opacity-60')}>
      <div className="flex items-start gap-3">
        <Checkbox id={`import-project-${project.localId}`} checked={project.include} onCheckedChange={handleIncludeChange} className="mt-1"/>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor={`import-project-${project.localId}`} className="text-sm font-semibold">
              Project {index + 1}
            </Label>
            {project.clientStatus === 'preferred' && resolvedClientName ? (<Badge variant="secondary" className="text-[10px]">
                {resolvedClientName}
              </Badge>) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`import-project-name-${project.localId}`}>Name</Label>
            <Input id={`import-project-name-${project.localId}`} value={project.name} onChange={handleNameChange}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`import-project-description-${project.localId}`}>Description</Label>
            <Textarea id={`import-project-description-${project.localId}`} value={project.description} onChange={handleDescriptionChange} rows={2}/>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={project.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STATUSES.map((status) => (<SelectItem key={status} value={status}>
                      {formatStatusLabel(status)}
                    </SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            {needsClientReview ? (<div className="space-y-2 sm:col-span-2">
                <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden/>
                  <p>{buildClientReviewPrompt(project)}</p>
                </div>
                <Label htmlFor={`import-project-client-${project.localId}`}>Client</Label>
                <Select value={project.clientId || 'none'} onValueChange={handleClientChange}>
                  <SelectTrigger id={`import-project-client-${project.localId}`}>
                    <SelectValue placeholder="Select client"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (<SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>))}
                  </SelectContent>
                </Select>
              </div>) : resolvedClientName ? (<div className="space-y-1 sm:col-span-2">
                <Label>Client</Label>
                <p className="text-sm text-muted-foreground">{resolvedClientName}</p>
              </div>) : null}

            {needsStartDateReview ? (<div className="space-y-2">
                <Label htmlFor={`import-project-start-${project.localId}`}>Start date</Label>
                {project.startDateHint ? (<p className="text-xs text-muted-foreground">Document hint: {project.startDateHint}</p>) : null}
                <Input id={`import-project-start-${project.localId}`} type="date" value={project.startDate} onChange={handleStartDateChange}/>
              </div>) : project.startDate ? (<div className="space-y-1">
                <Label>Start date</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(project.startDate), 'MMM d, yyyy')}
                </p>
              </div>) : null}

            {needsEndDateReview ? (<div className="space-y-2">
                <Label htmlFor={`import-project-end-${project.localId}`}>End date</Label>
                {project.endDateHint ? (<p className="text-xs text-muted-foreground">Document hint: {project.endDateHint}</p>) : null}
                <Input id={`import-project-end-${project.localId}`} type="date" value={project.endDate} onChange={handleEndDateChange}/>
              </div>) : project.endDate ? (<div className="space-y-1">
                <Label>End date</Label>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(project.endDate), 'MMM d, yyyy')}
                </p>
              </div>) : null}
          </div>

          {project.tags.length > 0 ? (<div className="flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (<Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>))}
            </div>) : null}

          {project.sourceExcerpt ? (<p className="text-xs italic text-muted-foreground">“{project.sourceExcerpt}”</p>) : null}
        </div>
      </div>
    </article>);
}
