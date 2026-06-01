'use client';
import { useCallback } from 'react';
import { ChevronDown, CircleAlert, Clock, Eye, History, LoaderCircle, RotateCcw, Save, User } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from '@/shared/ui/alert-dialog';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from '@/shared/ui/dialog';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from '@/shared/ui/dropdown-menu';
import { ScrollArea } from '@/shared/ui/scroll-area';
import type { ProposalFormData } from '@/lib/proposals';
import type { ProposalVersion } from '@/types/proposal-versions';
import { formatFullDate, formatRelativeTime } from './proposal-version-history-utils';
export function ProposalVersionHistoryTrigger({ disabled, open, proposalId, versionCount, versionSummary, }: {
    disabled: boolean;
    open: boolean;
    proposalId: string | null;
    versionCount: number;
    versionSummary: string | null;
}) {
    return (<DropdownMenuTrigger asChild>
      <Button variant="outline" size="sm" disabled={disabled || !proposalId} className="gap-2">
        <History className="size-4"/>
        <span className="hidden sm:inline">History</span>
        {versionSummary && open ? (<Badge variant="secondary" className="ml-1 text-xs">
            {versionCount}
          </Badge>) : null}
        <ChevronDown className="size-3 opacity-50"/>
      </Button>
    </DropdownMenuTrigger>);
}
function ProposalVersionHistoryRow({ onPreview, onRestore, restoring, version, }: {
    onPreview: (version: ProposalVersion) => void;
    onRestore: (version: ProposalVersion) => void;
    restoring: boolean;
    version: ProposalVersion;
}) {
    const handlePreview = () => {
        onPreview(version);
    };
    const handleRestore = () => {
        onRestore(version);
    };
    const handleSelect = (event: Event) => {
        event.preventDefault();
    };
    return (<DropdownMenuItem className="flex cursor-default flex-col items-start gap-1 p-2" onSelect={handleSelect}>
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">v{version.versionNumber}</Badge>
          <span className="text-xs text-muted-foreground">{formatRelativeTime(version.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="size-6" onClick={handlePreview} aria-label={`Preview version ${version.versionNumber}`}>
            <Eye className="size-3"/>
          </Button>
          <Button variant="ghost" size="icon" className="size-6" disabled={restoring} onClick={handleRestore} aria-label={`Restore version ${version.versionNumber}`}>
            <RotateCcw className="size-3"/>
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3"/>
        <span>{formatFullDate(version.createdAt)}</span>
        {version.createdBy ? (<>
            <span className="text-muted-foreground/40">·</span>
            <User className="size-3"/>
            <span>{version.createdBy}</span>
          </>) : null}
      </div>
    </DropdownMenuItem>);
}
export function ProposalVersionHistoryMenuContent({ handleSaveVersion, latestVersion, loading, proposalId, restoring, saving, setPreviewVersion, setRestoreConfirmVersion, versions, }: {
    handleSaveVersion: () => void;
    latestVersion: ProposalVersion | undefined;
    loading: boolean;
    proposalId: string | null;
    restoring: boolean;
    saving: boolean;
    setPreviewVersion: (version: ProposalVersion) => void;
    setRestoreConfirmVersion: (version: ProposalVersion) => void;
    versions: ProposalVersion[];
}) {
    return (<DropdownMenuContent align="end" className="w-80">
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-sm font-medium">Version History</span>
        <Button variant="ghost" size="sm" onClick={handleSaveVersion} disabled={saving || !proposalId} className="h-7 gap-1 text-xs">
          {saving ? <LoaderCircle className="size-3 animate-spin"/> : <Save className="size-3"/>}
          Save Point
        </Button>
      </div>
      <DropdownMenuSeparator />

      {loading ? (<div className="flex items-center justify-center py-6">
          <LoaderCircle className="size-5 animate-spin text-muted-foreground"/>
        </div>) : versions.length === 0 ? (<div className="px-2 py-6 text-center text-sm text-muted-foreground">
          No versions yet. Click &quot;Save Point&quot; to create one.
        </div>) : (<ScrollArea className="max-h-64">
          {versions.map((version) => (<ProposalVersionHistoryRow key={version.id} onPreview={setPreviewVersion} onRestore={setRestoreConfirmVersion} restoring={restoring} version={version}/>))}
        </ScrollArea>)}

      {latestVersion?.createdAt ? (<div className="mt-2 px-2 pb-1 text-xs text-muted-foreground">Latest: {formatFullDate(latestVersion.createdAt)}</div>) : null}
    </DropdownMenuContent>);
}
export function ProposalVersionPreviewDialog({ currentFormData, previewVersion, setPreviewVersion, }: {
    currentFormData: ProposalFormData;
    previewVersion: ProposalVersion | null;
    setPreviewVersion: (version: ProposalVersion | null) => void;
}) {
    const handleClose = () => {
        setPreviewVersion(null);
    };
    return (<DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Eye className="size-4"/> Version {previewVersion?.versionNumber}
        </DialogTitle>
        <DialogDescription>Saved {formatFullDate(previewVersion?.createdAt ?? null)}</DialogDescription>
      </DialogHeader>
      <div className="rounded-md border bg-muted/30 p-4">
        <pre className="max-h-[50vh] overflow-auto text-xs">{JSON.stringify(previewVersion?.formData ?? currentFormData, null, 2)}</pre>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={handleClose}>Close</Button>
      </DialogFooter>
    </DialogContent>);
}
export function ProposalVersionRestoreDialog({ open, onOpenChange, handleRestoreVersion, restoreConfirmVersion, restoring, }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    handleRestoreVersion: () => void;
    restoreConfirmVersion: ProposalVersion | null;
    restoring: boolean;
}) {
    return (<AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md border-destructive/25">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <CircleAlert className="size-4 shrink-0" aria-hidden/>
            Replace form with this version?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left text-foreground/90">
            This permanently replaces the current proposal form with version {restoreConfirmVersion?.versionNumber}. Your
            current editor state is saved as a new backup version before the restore runs. This action cannot be undone
            from here.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel type="button" disabled={restoring} className="mt-0">
            Cancel
          </AlertDialogCancel>
          <Button type="button" variant="destructive" onClick={handleRestoreVersion} disabled={restoring} className="gap-2">
            {restoring ? <LoaderCircle className="size-4 animate-spin" aria-hidden/> : <RotateCcw className="size-4" aria-hidden/>}
            Yes, restore this version
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>);
}
