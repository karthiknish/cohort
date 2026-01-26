'use client'

import { CircleCheck } from 'lucide-react'

import { FadeIn, FadeInItem, FadeInStagger } from '@/components/ui/animate-in'

import type { HERO_HIGHLIGHTS } from './home-content'

type Highlight = (typeof HERO_HIGHLIGHTS)[number]

type HomeHeroProps = {
  headline: string
  subhead: string
  highlights: readonly Highlight[]
}

export function HomeHero({ headline, subhead, highlights }: HomeHeroProps) {
  return (
    <FadeIn as="section" className="flex w-full max-w-2xl flex-col justify-center space-y-10 lg:py-12">
      <div className="space-y-6">
        <div className="inline-flex items-center rounded-full border bg-background px-3 py-1 text-sm font-medium shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2" aria-hidden="true"></span>
          Now in public beta
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
          {headline}
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">{subhead}</p>
      </div>

      <FadeInStagger className="grid gap-5 sm:grid-cols-2">
        {highlights.map((item) => (
          <FadeInItem
            key={item.title}
            as="div"
            className="group flex gap-4 rounded-2xl border border-border/50 bg-background/50 p-5 shadow-sm transition-all hover:border-primary/20 hover:bg-background hover:shadow-md"
          >
            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <CircleCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-snug">{item.description}</p>
            </div>
          </FadeInItem>
        ))}
      </FadeInStagger>
    </FadeIn>
  )
}
