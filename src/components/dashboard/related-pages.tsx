'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface RelatedPage {
  name: string
  href: string
  description: string
  icon: LucideIcon
}

interface RelatedPagesProps {
  title?: string
  description?: string
  pages: RelatedPage[]
  className?: string
}

export function RelatedPages({ title = 'Related pages', description, pages, className }: RelatedPagesProps) {
  const pathname = usePathname()
  
  // Filter out current page
  const filteredPages = pages.filter((page) => page.href !== pathname)
  
  if (filteredPages.length === 0) {
    return null
  }

  return (
    <Card className={cn('shadow-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page) => {
            const Icon = page.icon
            return (
              <Link
                key={page.href}
                href={page.href}
                className="group flex items-center gap-3 rounded-lg border border-muted/40 p-3 transition-all hover:border-primary/40 hover:bg-muted/30"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                    {page.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {page.description}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
