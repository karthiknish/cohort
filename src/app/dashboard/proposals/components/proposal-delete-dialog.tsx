'use client'

import { memo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete proposal</DialogTitle>
          <DialogDescription>
            This action cannot be undone. {proposalName ? `${proposalName} ` : ''}and its data will be removed permanently.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export const ProposalDeleteDialog = memo(ProposalDeleteDialogComponent)
