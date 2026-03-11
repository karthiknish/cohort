'use client'

import { useCallback } from 'react'

import type { ProposalFormData } from '@/lib/proposals'
import type { ProposalDraft } from '@/types/proposals'

type ToastFn = (options: { title: string; description: string }) => void

export function useProposalPageInteractions(props: {
  toast: ToastFn
  routerPush: (href: string) => void
  setIsWizardOpen: (open: boolean) => void
  setFormState: (formData: ProposalFormData) => void
  setCurrentStep: (step: number) => void
  handleCreateNewProposal: () => Promise<void>
  handleResumeProposal: (proposal: ProposalDraft, forceEdit?: boolean) => void
  handleContinueEditingFromSnapshot: () => Promise<void>
}) {
  const {
    toast,
    routerPush,
    setIsWizardOpen,
    setFormState,
    setCurrentStep,
    handleCreateNewProposal,
    handleResumeProposal,
    handleContinueEditingFromSnapshot,
  } = props

  const handleSelectTemplate = useCallback((templateFormData: ProposalFormData) => {
    setFormState(templateFormData)
    setCurrentStep(0)
    toast({
      title: 'Template applied',
      description: 'The template has been applied to your proposal. You can customize it as needed.',
    })
  }, [setCurrentStep, setFormState, toast])

  const handleVersionRestored = useCallback((restoredFormData: ProposalFormData) => {
    setFormState(restoredFormData)
    setCurrentStep(0)
    toast({
      title: 'Version restored',
      description: 'The proposal has been restored to the selected version.',
    })
  }, [setCurrentStep, setFormState, toast])

  const handleStartProposal = useCallback(async () => {
    await handleCreateNewProposal()
    setIsWizardOpen(true)
  }, [handleCreateNewProposal, setIsWizardOpen])

  const handleResumeProposalInModal = useCallback((proposal: ProposalDraft, forceEdit?: boolean) => {
    if (proposal.status === 'ready' && !forceEdit) {
      routerPush(`/dashboard/proposals/${proposal.id}/deck`)
      return
    }

    handleResumeProposal(proposal, forceEdit)
    setIsWizardOpen(true)
  }, [handleResumeProposal, routerPush, setIsWizardOpen])

  const handleContinueEditingInModal = useCallback(async () => {
    await handleContinueEditingFromSnapshot()
    setIsWizardOpen(true)
  }, [handleContinueEditingFromSnapshot, setIsWizardOpen])

  const handlePreviewRefresh = useCallback(() => {
    toast({ title: 'Preview data refreshed', description: 'Showing sample proposal history.' })
  }, [toast])

  const handlePreviewResume = useCallback((proposal: ProposalDraft) => {
    if (proposal.status === 'ready' || proposal.status === 'sent') {
      routerPush(`/dashboard/proposals/${proposal.id}/deck`)
      return
    }

    toast({
      title: 'Preview mode',
      description: 'Sample proposals are read-only. Exit preview mode to create or edit live proposals.',
    })
  }, [routerPush, toast])

  const handlePreviewRequestDelete = useCallback(() => {
    toast({
      title: 'Preview mode',
      description: 'Sample proposals cannot be deleted.',
    })
  }, [toast])

  const handlePreviewDownloadDeck = useCallback((proposal: ProposalDraft) => {
    routerPush(`/dashboard/proposals/${proposal.id}/deck`)
  }, [routerPush])

  const handlePreviewCreateNew = useCallback(() => {
    toast({
      title: 'Preview mode',
      description: 'Switch off preview mode to start a real proposal.',
    })
  }, [toast])

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
  }
}

