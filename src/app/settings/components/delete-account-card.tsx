'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoaderCircle, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

export function DeleteAccountCard() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

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
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
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
  const { toast } = useToast()
  const router = useRouter()

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteAccountError, setDeleteAccountError] = useState<string | null>(null)
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setDeleteConfirm('')
      setDeleteAccountError(null)
      setDeleteAccountLoading(false)
    }
  }, [open])

  const handleAccountDeletion = useCallback(async () => {
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

    try {
      // Clear all localStorage data before deleting account
      const keysToRemove = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith('cohorts_') ||
          key.startsWith('tips_dismissed')
      )
      keysToRemove.forEach((key) => localStorage.removeItem(key))

      await deleteAccount()
      toast({ title: 'Account deleted', description: 'Your account and associated data have been removed.' })
      onOpenChange(false)
      router.push('/')
    } catch (accountError) {
      const message = accountError instanceof Error ? accountError.message : 'Failed to delete account'
      setDeleteAccountError(message)
      toast({ title: 'Account deletion failed', description: message, variant: 'destructive' })
    } finally {
      setDeleteAccountLoading(false)
    }
  }, [deleteAccount, deleteConfirm, onOpenChange, router, toast, user])

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
            value={deleteConfirm}
            onChange={(event) => {
              setDeleteConfirm(event.target.value)
              setDeleteAccountError(null)
            }}
            placeholder="Type DELETE to confirm"
            autoFocus
          />
          {deleteAccountError ? <p className="text-sm text-destructive">{deleteAccountError}</p> : null}
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
            onClick={() => void handleAccountDeletion()}
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
