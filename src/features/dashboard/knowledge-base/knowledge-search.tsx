import { Search } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function KnowledgeSearch() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Knowledge search</CardTitle>
        <CardDescription>Surface SOP answers before they become another chat interruption.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 rounded-2xl border border-muted/50 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          Search launch playbooks, escalation policy, or client handoff notes
        </div>
      </CardContent>
    </Card>
  )
}
