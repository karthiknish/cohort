import { Suspense } from 'react'
import { LoaderCircle } from 'lucide-react'

import { PendingApprovalContent } from './pending-approval-content'

export default function PendingApprovalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-muted/30 px-4 py-16">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4 shadow-sm">
            <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Checking your account status…</span>
          </div>
        </div>
      }
    >
      <PendingApprovalContent />
    </Suspense>
  )
}