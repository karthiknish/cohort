"use client"

import { CircleCheck, Circle, LoaderCircle } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

export type ClientChecklistItem = {
  id: string
  label: string
  done: boolean
  helper?: string
  loading?: boolean
}

export function ClientOnboardingChecklist({ clientName, items }: { clientName: string; items: ClientChecklistItem[] }) {
  const total = items.length
  const completed = items.filter((item) => item.done).length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

  return (
    <Card className="overflow-hidden border-muted/40 bg-background shadow-sm transition-all hover:shadow-md">
      <CardHeader className="border-b border-muted/20 bg-muted/5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground/80">Onboarding Objectives</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
              {completed === total && total > 0
                ? "Workspace fully initialized"
                : `${completed} of ${total} benchmarks secured`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            <span>{progress}% complete</span>
            <span className="text-foreground/60">{completed}/{total}</span>
          </div>
          <Progress value={progress} className="h-1.5 bg-muted/10" />
        </div>

        <div className="space-y-2.5">
          {items.map((item) => {
            const Icon = item.loading ? LoaderCircle : item.done ? CircleCheck : Circle
            return (
              <div
                key={item.id}
                className={cn(
                  "group flex items-start gap-3 rounded-xl border border-muted/30 p-3 transition-all",
                  item.done ? "bg-primary/[0.03] border-primary/20" : "bg-muted/5"
                )}
              >
                <div className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors",
                  item.done ? "bg-primary/10 text-primary" : "bg-muted/20 text-muted-foreground/30"
                )}>
                  <Icon
                    className={cn(
                      "h-3 w-3",
                      item.loading && "animate-spin"
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    "text-xs font-bold tracking-tight transition-colors",
                    item.done ? "text-primary" : "text-foreground/80"
                  )}>{item.label}</p>
                  {item.helper ? (
                    <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-muted-foreground/50">
                      {item.helper}
                    </p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
