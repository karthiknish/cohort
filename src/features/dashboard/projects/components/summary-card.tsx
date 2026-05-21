import {
  Card,
  CardContent,
} from '@/shared/ui/card'
import { cn } from '@/lib/utils'

export interface SummaryCardProps {
  label: string
  value: number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  description?: string
  onClick?: () => void
  active?: boolean
}

export function SummaryCard({ label, value, icon: Icon, description, onClick, active }: SummaryCardProps) {
  const inner = (
    <Card
      className={cn(
        'overflow-hidden border-muted/50 bg-background shadow-sm motion-chromatic',
        onClick && 'hover:border-primary/20 hover:shadow-md',
        active && 'border-primary/25 ring-1 ring-primary/15',
      )}
    >
      <CardContent className="flex items-center gap-5 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent/5 text-primary shadow-sm">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 leading-none">
            {label}
          </p>
          <div className="mt-1.5 flex items-baseline gap-2">
            <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
            {description ? (
              <span className="text-[10px] font-semibold text-muted-foreground/60 tabular-nums uppercase tracking-wide">
                {description}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (!onClick) {
    return inner
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
      aria-pressed={active}
    >
      {inner}
    </button>
  )
}
