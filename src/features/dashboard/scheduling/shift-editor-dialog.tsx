import { LoaderCircle, Plus } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'

interface ShiftEditorDialogProps {
  pending: boolean
  onCreateShift: () => void
}

export function ShiftEditorDialog({ pending, onCreateShift }: ShiftEditorDialogProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Shift editor scaffold</CardTitle>
        <CardDescription>Create an open coverage block in Convex while recurring rules stay in scaffold mode.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-muted/50 bg-muted/10 p-4 text-sm">
            <p className="font-medium text-foreground">Shift type</p>
            <p className="mt-1 text-muted-foreground">Client escalation desk</p>
          </div>
          <div className="rounded-xl border border-muted/50 bg-muted/10 p-4 text-sm">
            <p className="font-medium text-foreground">Window</p>
            <p className="mt-1 text-muted-foreground">Tue · 14:00 - 18:00</p>
          </div>
          <div className="rounded-xl border border-muted/50 bg-muted/10 p-4 text-sm">
            <p className="font-medium text-foreground">Coverage rule</p>
            <p className="mt-1 text-muted-foreground">At least one senior owner on every escalation block</p>
          </div>
          <div className="rounded-xl border border-muted/50 bg-muted/10 p-4 text-sm">
            <p className="font-medium text-foreground">Assignment</p>
            <p className="mt-1 text-muted-foreground">Open shift with auto-notify enabled</p>
          </div>
        </div>
        <Button variant="outline" className="rounded-xl gap-2" onClick={onCreateShift} disabled={pending}>
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create open coverage shift
        </Button>
      </CardContent>
    </Card>
  )
}
