'use client'

import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'

interface QuickActionCardProps {
  href: string
  icon: React.ElementType
  title: string
  description: string
  color: 'blue' | 'emerald' | 'amber' | 'violet'
}

const colorClasses = {
  blue: 'text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30',
  emerald: 'text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30',
  amber: 'text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30',
  violet: 'text-violet-600 dark:text-violet-400 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30',
}

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  color,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="border-muted/60 bg-background transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className={cn('rounded-lg p-2 transition-colors', colorClasses[color])}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">{title}</p>
            <p className="truncate text-xs text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
