'use client'

import Link from 'next/link'

import { Card, CardContent } from '@/components/ui/card'

interface QuickActionCardProps {
  href: string
  icon: React.ElementType
  title: string
  description: string
  color?: string // Kept for backwards compatibility, but no longer used
}

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
}: QuickActionCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="border-muted/60 bg-background transition-all hover:border-primary/30 hover:shadow-md">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-lg p-2 transition-colors text-muted-foreground group-hover:bg-muted group-hover:text-foreground">
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
