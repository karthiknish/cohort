'use client';
import { FeatureFormDialogBody, FeatureFormDialogShell } from './feature-form-dialog-sections';
import type { FeatureFormDialogProps } from './feature-form-dialog-types';
import { useFeatureFormDialog } from './hooks/use-feature-form-dialog';
export type { FeatureFormDialogProps } from './feature-form-dialog-types';
export function FeatureFormDialog(props: FeatureFormDialogProps) {
    const form = useFeatureFormDialog(props);
    return (<FeatureFormDialogShell open={props.open} onOpenChange={props.onOpenChange}>
      <FeatureFormDialogBody {...form}/>
    </FeatureFormDialogShell>);
}
