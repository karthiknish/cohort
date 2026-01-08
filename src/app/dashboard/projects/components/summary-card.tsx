import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export interface SummaryCardProps {
  label: string
  value: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
}

export function SummaryCard({ label, value, icon: Icon, description }: SummaryCardProps) {
  return (
    <Card className="overflow-hidden border-muted/50 bg-background shadow-sm transition-all hover:shadow-md dark:hover:bg-muted/5">
      <CardContent className="flex items-center gap-5 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary shadow-sm dark:bg-primary/10">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-none">
            {label}
          </p>
          <div className="flex items-baseline gap-2 mt-1.5">
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
            {description && (
              <span className="text-[10px] font-semibold text-muted-foreground/60 tabular-nums uppercase tracking-wide">
                {description}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
