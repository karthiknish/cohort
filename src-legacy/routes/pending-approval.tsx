import { Suspense } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { PendingApprovalContent } from '@/features/auth/pending-approval-content'

function PendingApprovalFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16">
      <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4 shadow-sm">
        <LoaderCircle className="size-5 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          Checking your account status…
        </span>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/pending-approval')({
  head: () => ({
    meta: [{ title: 'Account Status | Cohorts' }],
  }),
  component: () => (
    <Suspense fallback={<PendingApprovalFallback />}>
      <PendingApprovalContent />
    </Suspense>
  ),
})
