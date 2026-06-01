'use client';
import { useMemo } from 'react';
import { Lightbulb, LoaderCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/lib/utils';
import type { FeatureItem, FeatureStatus } from '@/types/features';
import { AdminPageShell } from '../components/admin-page-shell';
import { AdminQueryErrorAlert } from '../components/admin-query-error-alert';
import { FeatureKanbanBoard } from './components/feature-kanban-board';
import { FeatureFormDialog } from './components/feature-form-dialog';
import type { FeatureSubmitData } from './admin-features-types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/shared/ui/alert-dialog';
export function AdminFeaturesToolbarActions({ refreshing, onRefresh, }: {
    refreshing: boolean;
    onRefresh: () => void;
}) {
    return (<Button type="button" variant="outline" size="sm" onClick={onRefresh} disabled={refreshing}>
      <RefreshCw className={cn('mr-2 size-4', refreshing && 'animate-spin')} aria-hidden/>
      Refresh
    </Button>);
}
export function AdminFeaturesLoadingShell() {
    return (<AdminPageShell title="Feature planning" description="Loading the platform backlog…">
      <div className="grid gap-4 lg:grid-cols-4">
        {['sk-a', 'sk-b', 'sk-c', 'sk-d'].map((key) => (<div key={key} className="space-y-3 rounded-lg border border-border/60 bg-card/50 p-4">
            <Skeleton className="h-4 w-24"/>
            <div className="space-y-2">
              <Skeleton className="h-16 w-full rounded-md"/>
              <Skeleton className="h-16 w-full rounded-md"/>
              <Skeleton className="h-16 w-full rounded-md"/>
            </div>
          </div>))}
      </div>
    </AdminPageShell>);
}
type AdminFeaturesDeleteDialogProps = {
    open: boolean;
    featureToDelete: FeatureItem | null;
    isDeleting: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};
export function AdminFeaturesDeleteDialog({ open, featureToDelete, isDeleting, onOpenChange, onConfirm, }: AdminFeaturesDeleteDialogProps) {
    return (<AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Feature</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{featureToDelete?.title}&quot;? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isDeleting && <LoaderCircle className="mr-2 size-4 animate-spin"/>}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>);
}
type AdminFeaturesPageContentProps = {
    isPreviewMode: boolean;
    features: FeatureItem[];
    featuresQueryError: string | null;
    refreshing: boolean;
    formDialogOpen: boolean;
    editingFeature: FeatureItem | null;
    defaultStatus: FeatureStatus;
    deleteConfirmOpen: boolean;
    featureToDelete: FeatureItem | null;
    isDeleting: boolean;
    onRefresh: () => void;
    onAddFeature: (status: FeatureStatus) => void;
    onEditFeature: (feature: FeatureItem) => void;
    onDeleteFeature: (feature: FeatureItem) => void;
    onFormDialogOpenChange: (open: boolean) => void;
    onDeleteConfirmOpenChange: (open: boolean) => void;
    onConfirmDelete: () => void;
    onMoveFeature: (featureId: string, newStatus: FeatureStatus) => void;
    onSubmitFeature: (data: FeatureSubmitData) => Promise<void>;
};
export function AdminFeaturesPageContent({ isPreviewMode, features, featuresQueryError, refreshing, formDialogOpen, editingFeature, defaultStatus, deleteConfirmOpen, featureToDelete, isDeleting, onRefresh, onAddFeature, onEditFeature, onDeleteFeature, onFormDialogOpenChange, onDeleteConfirmOpenChange, onConfirmDelete, onMoveFeature, onSubmitFeature, }: AdminFeaturesPageContentProps) {
    const toolbarActions = <AdminFeaturesToolbarActions refreshing={refreshing} onRefresh={onRefresh}/>;
    return (<>
      <AdminPageShell title="Feature planning" description={<>
            Plan and track platform features on a visual Kanban board.
            {isPreviewMode ? ' Preview mode uses a local sample backlog.' : ''}
          </>} isPreviewMode={isPreviewMode} actions={toolbarActions}>
        <AdminQueryErrorAlert error={featuresQueryError} title="Unable to load features"/>

        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-8 items-center justify-center rounded-md bg-accent/10 text-primary">
            <Lightbulb className="size-4"/>
          </span>
          <span>Drag cards between columns or open a card to edit details.</span>
        </div>

        <FeatureKanbanBoard features={features} onAddFeature={onAddFeature} onEditFeature={onEditFeature} onDeleteFeature={onDeleteFeature} onMoveFeature={onMoveFeature}/>
      </AdminPageShell>

      <FeatureFormDialog open={formDialogOpen} onOpenChange={onFormDialogOpenChange} feature={editingFeature} defaultStatus={defaultStatus} onSubmit={onSubmitFeature}/>

      <AdminFeaturesDeleteDialog open={deleteConfirmOpen} featureToDelete={featureToDelete} isDeleting={isDeleting} onOpenChange={onDeleteConfirmOpenChange} onConfirm={onConfirmDelete}/>
    </>);
}
