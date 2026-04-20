'use client'

import { useState, useCallback, useEffect, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, Trash2 } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { usePreview } from '@/shared/contexts/preview-context'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card'
import { Input } from '@/shared/ui/input'
import { useToast } from '@/shared/ui/use-toast'
import { useAuth } from '@/shared/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/shared/ui/dialog'

export function DeleteAccountCard() {
  const { isPreviewMode } = usePreview()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true)
  }, [])

  return (
    <>
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete account
          </CardTitle>
          <CardDescription>
            Permanently remove your account and all associated data (GDPR Article 17 - Right to Erasure).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Deleting your account will revoke access across all connected workspaces, stop integrations, and permanently erase stored reports, messages, and personal information. This action cannot be undone. We recommend exporting your data before proceeding.
          </p>
          {isPreviewMode ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Preview mode keeps this action local-only and does not remove any real account data.
            </p>
          ) : null}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="destructive" onClick={handleOpenDeleteDialog}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete account
          </Button>
        </CardFooter>
      </Card>

      <DeleteAccountDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}

interface DeleteAccountDialogProps {
  open: boolean
  onOpenChange: (value: boolean) => void
}

export function DeleteAccountDialog({ open, onOpenChange }: DeleteAccountDialogProps) {
  const { user, deleteAccount } = useAuth()
  const { isPreviewMode } = usePreview()
  const { toast } = useToast()
  const router = useRouter()

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false)
  useEffect(() => {
    if (open) return

    const frame = requestAnimationFrame(() => {
      setDeleteConfirm('')
      setDeleteAccountError(null)
      setDeleteAccountLoading(false)
    })

    return () => {
      cancelAnimationFrame(frame)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      document.getElementById('delete-account-confirm')?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [open])

  const handleAccountDeletion = useCallback(() => {
    if (isPreviewMode) {
      toast({
        title: 'Preview mode',
        description: 'Sample account deletion is disabled. No real data was changed.',
      })
      onOpenChange(false)
      return
    }

    if (!user) {
      setDeleteAccountError('You must be signed in to delete your account.')
      return
    }

    if (deleteConfirm.trim().toLowerCase() !== 'delete') {
      setDeleteAccountError('Type DELETE to confirm this action.')
      return
    }

    setDeleteAccountLoading(true)
    setDeleteAccountError(null)

    // Clear all localStorage data before deleting account
    const keysToRemove = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith('cohorts_') ||
        key.startsWith('tips_dismissed')
    )
    keysToRemove.forEach((key) => localStorage.removeItem(key))

    void deleteAccount()
      .then(() => {
        toast({ title: 'Account deleted', description: 'Your account and associated data have been removed.' })
        onOpenChange(false)
        router.push('/')
      })
      .catch((accountError) => {
        const message = accountError instanceof Error ? accountError.message : 'Failed to delete account'
        setDeleteAccountError(message)
        toast({ title: 'Account deletion failed', description: message, variant: 'destructive' })
      })
      .finally(() => {
        setDeleteAccountLoading(false)
      })
  }, [deleteAccount, deleteConfirm, isPreviewMode, onOpenChange, router, toast, user])

  const handleDeleteConfirmChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDeleteConfirm(event.target.value)
    setDeleteAccountError(null)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm account deletion</DialogTitle>
          <DialogDescription>
            This will permanently remove your account, integrations, and stored analytics. Type <span className="font-semibold">DELETE</span> to confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            id="delete-account-confirm"
            value={deleteConfirm}
            onChange={handleDeleteConfirmChange}
            placeholder="Type DELETE to confirm"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-invalid={deleteAccountError ? true : undefined}
            aria-describedby={deleteAccountError ? 'delete-account-error' : 'delete-account-hint'}
          />
          {deleteAccountError ? (
            <p id="delete-account-error" className="text-sm text-destructive" role="alert">
              {deleteAccountError}
            </p>
          ) : (
            <p id="delete-account-hint" className="sr-only">
              Confirmation must match the word DELETE in any letter case.
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={deleteAccountLoading}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleAccountDeletion}
            disabled={deleteConfirm.trim().toLowerCase() !== 'delete' || deleteAccountLoading}
          >
            {deleteAccountLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : null}
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
