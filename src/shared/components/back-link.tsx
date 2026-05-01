'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'

interface BackLinkProps {
  label: string
  href?: string
  onClick?: () => void
  className?: string
  transitionTypes?: string[]
}

export function BackLink({ label, href, onClick, className, transitionTypes }: BackLinkProps) {
  const sharedClasses = cn(
    '-ml-2 gap-2 text-muted-foreground hover:text-foreground',
    className,
  )

  if (href) {
    return (
      <Button variant="ghost" size="sm" asChild className={sharedClasses}>
        <Link href={href} transitionTypes={transitionTypes} onClick={onClick}>
          <ArrowLeft className="h-4 w-4" />
          {label}
        </Link>
      </Button>
    )
  }

  return (
    <Button variant="ghost" size="sm" type="button" className={sharedClasses} onClick={onClick}>
      <ArrowLeft className="h-4 w-4" />
      {label}
    </Button>
  )
}