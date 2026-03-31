import { BarChart3, Bot, LayoutDashboard, Mic2, Shield, Sparkles } from 'lucide-react'
import type { ComponentType } from 'react'

import { cn } from '@/lib/utils'
import { FadeIn, FadeInItem, FadeInStagger } from '@/shared/ui/animate-in'

type IconComponent = ComponentType<{ className?: string }>

type BentoFeature = {
  id: string
  Icon: IconComponent
  title: string
  description: string
  wide: boolean
  iconBg: string
  iconColor: string
  decorativeIconColor: string
}

const BENTO_FEATURES: BentoFeature[] = [
  {
    id: 'campaign-hub',
    Icon: LayoutDashboard,
    title: 'All Campaigns, One Place',
    description: "Manage every client's active campaigns from a unified workspace. No more tab-switching or status Slack threads.",
    wide: true,
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    decorativeIconColor: 'text-info/30',
  },
  {
    id: 'ai-proposals',
    Icon: Sparkles,
    title: 'Proposals That Write Themselves',
    description: "Generate tailored pitch decks using campaign data, benchmarks, and your agency's voice — in seconds.",
    wide: false,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    decorativeIconColor: 'text-warning/30',
  },
  {
    id: 'live-analytics',
    Icon: BarChart3,
    title: 'Metrics That Actually Move',
    description: 'Real-time performance data from every ad platform — surfaced right where decisions get made.',
    wide: false,
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    decorativeIconColor: 'text-success/30',
  },
  {
    id: 'client-portal',
    Icon: Shield,
    title: 'Clients Trust What They Can See',
    description: 'Branded, role-gated client portals with live reporting. Zero technical setup required.',
    wide: false,
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    decorativeIconColor: 'text-primary/20',
  },
  {
    id: 'agent-mode',
    Icon: Bot,
    title: 'Your AI Campaign Partner',
    description: 'An agentic AI that monitors performance, drafts responses, and escalates the signals that matter — while you focus elsewhere.',
    wide: true,
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    decorativeIconColor: 'text-warning/30',
  },
  {
    id: 'meeting-intel',
    Icon: Mic2,
    title: 'Capture Every Decision',
    description: 'Auto-transcribed meeting notes with action items surfaced and synced to client records instantly.',
    wide: false,
    iconBg: 'bg-info/10',
    iconColor: 'text-info',
    decorativeIconColor: 'text-info/30',
  },
]

export function FeaturesBento() {
  return (
    <FadeInStagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {BENTO_FEATURES.map((feature) => (
        <FadeInItem
          key={feature.id}
          as="div"
          className={cn(
            'group relative overflow-hidden rounded-2xl border border-border/60 bg-background p-6 shadow-sm transition-[border-color,box-shadow] duration-200 hover:border-primary/20 hover:shadow-md',
            feature.wide ? 'md:col-span-2 lg:col-span-2' : 'col-span-1',
          )}
        >
          <div className={cn('mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl', feature.iconBg)}>
            <feature.Icon className={cn('h-5 w-5', feature.iconColor)} />
          </div>
          <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
          {feature.wide && (
            <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-4 opacity-20">
              <feature.Icon className={cn('h-32 w-32', feature.decorativeIconColor)} />
            </div>
          )}
        </FadeInItem>
      ))}
    </FadeInStagger>
  )
}
