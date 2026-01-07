import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface SummaryCardProps {
  label: string
  value: number
  caption: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export function SummaryCard({ label, value, caption, icon: Icon }: SummaryCardProps) {
  return (
    <Card className="border-muted/60 bg-background">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-foreground">{value}</div>
        <p className="text-xs text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  )
}
