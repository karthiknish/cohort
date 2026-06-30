'use client';
import { useCallback } from 'react';
import { notifyInfo, notifySuccess } from '@/lib/notifications';
import { isPreviewModeEnabled, withPreviewModeSearchParamIfEnabled } from '@/lib/preview-data';
import type { ProposalFormData } from '@/lib/proposals';
import type { ProposalDraft } from '@/types/proposals';
import type { FormStateUpdateOptions } from './use-proposal-wizard';
export function useProposalPageInteractions(props: {
    routerPush: (href: string) => void;
    setIsWizardOpen: (open: boolean) => void;
    setFormState: (formData: ProposalFormData, options?: FormStateUpdateOptions) => void;
    setCurrentStep: (step: number) => void;
    handleCreateNewProposal: () => Promise<void>;
    handleResumeProposal: (proposal: ProposalDraft, forceEdit?: boolean) => void;
    handleContinueEditingFromSnapshot: () => Promise<void>;
}) {
    const { routerPush, setIsWizardOpen, setFormState, setCurrentStep, handleCreateNewProposal, handleResumeProposal, handleContinueEditingFromSnapshot, } = props;
    const buildProposalDeckHref = (proposalId: string) => {
        return withPreviewModeSearchParamIfEnabled(`/dashboard/proposals/${proposalId}/deck`, isPreviewModeEnabled());
    };
    const handleSelectTemplate = (templateFormData: ProposalFormData) => {
        setFormState(templateFormData, { resetHistory: true });
        setCurrentStep(0);
        notifySuccess({
            title: 'Template applied',
            message: 'The template has been applied to your proposal. You can customize it as needed.',
        });
    };
    const handleVersionRestored = (restoredFormData: ProposalFormData) => {
        setFormState(restoredFormData, { resetHistory: true });
        setCurrentStep(0);
        notifySuccess({
            title: 'Version restored',
            message: 'The proposal has been restored to the selected version.',
        });
    };
    const handleStartProposal = async () => {
        await handleCreateNewProposal();
        setIsWizardOpen(true);
    };
    const handleResumeProposalInModal = (proposal: ProposalDraft, forceEdit?: boolean) => {
        if (proposal.status === 'ready' && !forceEdit) {
            routerPush(buildProposalDeckHref(proposal.id));
            return;
        }
        handleResumeProposal(proposal, forceEdit);
        setIsWizardOpen(true);
    };
    const handleContinueEditingInModal = async () => {
        await handleContinueEditingFromSnapshot();
        setIsWizardOpen(true);
    };
    const handlePreviewRefresh = () => {
        notifyInfo({ title: 'Preview data refreshed', message: 'Showing sample proposal history.' });
    };
    const handlePreviewResume = (proposal: ProposalDraft) => {
        if (proposal.status === 'ready' || proposal.status === 'sent') {
            routerPush(buildProposalDeckHref(proposal.id));
            return;
        }
        notifyInfo({
            title: 'Preview mode',
            message: 'Sample proposals are read-only. Exit preview mode to create or edit live proposals.',
        });
    };
    const handlePreviewRequestDelete = () => {
        notifyInfo({
            title: 'Preview mode',
            message: 'Sample proposals cannot be deleted.',
        });
    };
    const handlePreviewDownloadDeck = (proposal: ProposalDraft) => {
        routerPush(buildProposalDeckHref(proposal.id));
    };
    const handlePreviewCreateNew = () => {
        notifyInfo({
            title: 'Preview mode',
            message: 'Switch off preview mode to start a real proposal.',
        });
    };
    return {
        handleSelectTemplate,
        handleVersionRestored,
        handleStartProposal,
        handleResumeProposalInModal,
        handleContinueEditingInModal,
        handlePreviewRefresh,
        handlePreviewResume,
        handlePreviewRequestDelete,
        handlePreviewDownloadDeck,
        handlePreviewCreateNew,
    };
}
