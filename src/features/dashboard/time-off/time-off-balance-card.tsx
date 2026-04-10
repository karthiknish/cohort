import type { TimeOffBalance } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function TimeOffBalanceCard({ balance }: { balance: TimeOffBalance }) {
  return (
    <Card className="border-muted/50">
      <CardHeader>
        <CardTitle className="text-base">{balance.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>{balance.used}</p>
        <p className="font-medium text-foreground">{balance.remaining}</p>
      </CardContent>
    </Card>
  )
}
