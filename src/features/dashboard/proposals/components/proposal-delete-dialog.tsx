'use client'

import { memo } from 'react'

import { Dialog } from '@/shared/ui/dialog'

import { ProposalDeleteDialogContent } from './proposal-delete-dialog-sections'

interface ProposalDeleteDialogProps {
  open: boolean
  isDeleting: boolean
  proposalName: string | null
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

function ProposalDeleteDialogComponent({ open, isDeleting, proposalName, onOpenChange, onConfirm }: ProposalDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ProposalDeleteDialogContent
        isDeleting={isDeleting}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
        proposalName={proposalName}
      />
    </Dialog>
  )
}

export const ProposalDeleteDialog = memo(ProposalDeleteDialogComponent)
