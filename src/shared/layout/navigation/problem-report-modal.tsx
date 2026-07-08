'use client';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useState } from 'react';
import { useMutation } from 'convex/react';
import { AlertCircle, LoaderCircle, MessageSquare } from 'lucide-react';
import { asErrorMessage } from '@/lib/convex-errors';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { notifySuccess } from '@/lib/notifications';
import { problemReportsApi } from '@/lib/convex-api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
interface ProblemReportModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export function ProblemReportModal({ open, onOpenChange }: ProblemReportModalProps) {
    const { user } = useAuth();
    const { selectedClientId } = useClientContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
    const [submitting, setSubmitting] = useState(false);
    const createProblemReport = useMutation(problemReportsApi.create);
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    };
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(event.target.value);
    };
    const handleSeverityChange = (value: string) => {
        if (value === 'low' || value === 'medium' || value === 'high' || value === 'critical') {
            setSeverity(value);
        }
    };
    const handleClose = () => {
        onOpenChange(false);
    };
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!user)
            return;
        setSubmitting(true);
        void createProblemReport({
            legacyId: `pr_${Date.now()}_${user.id ?? 'anon'}`,
            userId: user.id ?? null,
            userEmail: user.email ?? null,
            userName: user.name ?? null,
            workspaceId: selectedClientId || null,
            title,
            description,
            severity,
            status: 'open',
            createdAtMs: Date.now(),
            updatedAtMs: Date.now(),
        })
            .then(() => {
            notifySuccess({
                title: 'Report submitted',
                message: "Thank you for your feedback. We'll look into it as soon as possible.",
            });
            onOpenChange(false);
            setTitle('');
            setDescription('');
            setSeverity('medium');
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'problem-report-modal.tsx:catch',
                title: 'Could not submit report',
                fallbackMessage: 'Could not submit report',
            });
        })
            .finally(() => {
            setSubmitting(false);
        });
    };
    return (<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="size-5 text-primary" aria-hidden/>
            Report a Problem
          </DialogTitle>
          <DialogDescription>
            Found a bug or having trouble? Let us know and we&apos;ll fix it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input id="title" placeholder="Brief summary of the problem" value={title} onChange={handleTitleChange} required disabled={submitting}/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">Severity Level</Label>
            <Select value={severity} onValueChange={handleSeverityChange} disabled={submitting}>
              <SelectTrigger id="severity">
                <SelectValue placeholder="Select severity"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor annoyance</SelectItem>
                <SelectItem value="medium">Medium - Important but usable</SelectItem>
                <SelectItem value="high">High - Limits functionality</SelectItem>
                <SelectItem value="critical">Critical - System broken / Data loss</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea id="description" placeholder="What happened? What did you expect to happen?" value={description} onChange={handleDescriptionChange} className="min-h-[120px]" required disabled={submitting}/>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (<>
                  <LoaderCircle className="mr-2 size-4 animate-spin"/>
                  Submitting…
                </>) : (<>
                  <MessageSquare className="mr-2 size-4"/>
                  Submit Report
                </>)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>);
}
