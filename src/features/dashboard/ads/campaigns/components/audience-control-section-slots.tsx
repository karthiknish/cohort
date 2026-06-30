'use client';
import { memo } from 'react';
import { AudienceControlHeaderActions, AudienceControlInterestEditorSection, type AudienceControlInterestEditorSectionProps, } from './audience-control-sections';
type AudienceControlInterestSectionSlotProps = AudienceControlInterestEditorSectionProps;
type AudienceControlHeaderActionsSlotProps = {
    loading: boolean;
    onOpenBuilder: () => void;
    onRefresh: () => void;
};
export const AudienceControlHeaderActionsSlot = function AudienceControlHeaderActionsSlot({ loading, onOpenBuilder, onRefresh, }: AudienceControlHeaderActionsSlotProps) {
    return (<AudienceControlHeaderActions loading={loading} onOpenBuilder={onOpenBuilder} onRefresh={onRefresh}/>);
};
export const AudienceControlInterestSectionSlot = function AudienceControlInterestSectionSlot({ aggregatedData, expandedSections, toggleSection, editingSection, onToggleEditing, canEditMetaTargeting, workspaceId, clientId, onAddInterest, onRemoveInterest, onSaveTargeting, savingTargeting, }: AudienceControlInterestSectionSlotProps) {
    return (<AudienceControlInterestEditorSection aggregatedData={aggregatedData} expandedSections={expandedSections} toggleSection={toggleSection} editingSection={editingSection} onToggleEditing={onToggleEditing} canEditMetaTargeting={canEditMetaTargeting} workspaceId={workspaceId} clientId={clientId} onAddInterest={onAddInterest} onRemoveInterest={onRemoveInterest} onSaveTargeting={onSaveTargeting} savingTargeting={savingTargeting}/>);
};
