'use client'

import { notifyFailure } from '@/lib/notifications'
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

type DeleteAccountCardProps = {
  /** Renders inside a parent danger-zone shell without an extra card frame. */
  embedded?: boolean
}

export function DeleteAccountCard({ embedded = false }: DeleteAccountCardProps) {
  const { isPreviewMode } = usePreview()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleOpenDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(true)
  }, [])

  const body = (
    <>
      <CardHeader className={embedded ? 'px-0 pt-0' : undefined}>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="size-5" aria-hidden />
          Delete account
        </CardTitle>
        <CardDescription>
          Permanently remove your account and all associated data (GDPR Article 17 - Right to Erasure).
        </CardDescription>
      </CardHeader>
      <CardContent className={embedded ? 'px-0' : undefined}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Deleting your account will revoke access across all connected workspaces, stop integrations, and
          permanently erase stored reports, messages, and personal information. This action cannot be undone.
          We recommend exporting your data before proceeding.
        </p>
        {isPreviewMode ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Preview mode keeps this action local-only and does not remove any real account data.
          </p>
        ) : null}
      </CardContent>
      <CardFooter className={embedded ? 'flex justify-end px-0 pb-0' : 'flex justify-end'}>
        <Button variant="destructive" onClick={handleOpenDeleteDialog}>
          <Trash2 className="mr-2 size-4" aria-hidden />
          Delete account
        </Button>
      </CardFooter>
    </>
  )

  return (
    <>
      {embedded ? (
        <div className="space-y-0">{body}</div>
      ) : (
        <Card className="border-destructive/40">{body}</Card>
      )}

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
  const { push } = useRouter()

  const [deleteDialogState, setDeleteDialogState] = useState({
    confirm: '',
    error: null as string | null,
    loading: false,
  })
  const { confirm: deleteConfirm, error: deleteAccountError, loading: deleteAccountLoading } = deleteDialogState

  useEffect(() => {
    if (open) return

    const frame = requestAnimationFrame(() => {
      setDeleteDialogState({ confirm: '', error: null, loading: false })
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
      setDeleteDialogState((prev) => ({ ...prev, error: 'You must be signed in to delete your account.' }))
      return
    }

    if (deleteConfirm.trim().toLowerCase() !== 'delete') {
      setDeleteDialogState((prev) => ({ ...prev, error: 'Type DELETE to confirm this action.' }))
      return
    }

    setDeleteDialogState((prev) => ({ ...prev, loading: true, error: null }))

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
        push('/')
      })
      .catch((accountError) => {
        const message = accountError instanceof Error ? accountError.message : 'Failed to delete account'
        setDeleteDialogState((prev) => ({ ...prev, error: message }))
        notifyFailure({
        title: 'Account deletion failed',
        message: message,
      })
      })
      .finally(() => {
        setDeleteDialogState((prev) => ({ ...prev, loading: false }))
      })
  }, [deleteAccount, deleteConfirm, isPreviewMode, onOpenChange, push, toast, user])

  const handleDeleteConfirmChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDeleteDialogState((prev) => ({ ...prev, confirm: event.target.value, error: null }))
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
            {deleteAccountLoading ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : null}
            Delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
