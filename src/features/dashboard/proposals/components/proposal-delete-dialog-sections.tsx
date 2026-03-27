'use client'

import { useCallback } from 'react'
import { Button } from '@/shared/ui/button'
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'

export function ProposalDeleteDialogContent({
  isDeleting,
  onConfirm,
  onOpenChange,
  proposalName,
}: {
  isDeleting: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  proposalName: string | null
}) {
  const handleCancel = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Delete proposal</DialogTitle>
        <DialogDescription>
          This action cannot be undone. {proposalName ? `${proposalName} ` : ''}and its data will be removed permanently.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
          {isDeleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}