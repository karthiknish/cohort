"use client"

import { CircleCheck, Circle, LoaderCircle } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

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
    <Card className="border-muted/60 bg-background">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Onboarding</CardTitle>
        <p className="text-sm text-muted-foreground">
          {completed === total && total > 0
            ? `Onboarding complete for ${clientName}`
            : `${completed}/${total} steps done`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{progress}% complete</span>
            <span>
              {completed}/{total}
            </span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const Icon = item.loading ? LoaderCircle : item.done ? CircleCheck : Circle
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-md border border-muted/60 bg-muted/10 px-3 py-2"
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 ${
                    item.loading
                      ? 'animate-spin text-muted-foreground'
                      : item.done
                        ? 'text-emerald-500'
                        : 'text-muted-foreground'
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  {item.helper ? <p className="text-xs text-muted-foreground">{item.helper}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
