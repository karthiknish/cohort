// =============================================================================
// OBJECTIVE SELECTOR - Visual campaign objective selection
// =============================================================================

'use client'

import { useCallback, useMemo } from 'react'
import { ShoppingCart, Users, ExternalLink, Heart, Eye, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CAMPAIGN_OBJECTIVES } from './types'
import type { CampaignObjective } from './types'

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart: ShoppingCart,
  Users: Users,
  ExternalLink: ExternalLink,
  Heart: Heart,
  Eye: Eye,
  Smartphone: Smartphone,
}

const selectedIconForegroundStyle = { color: 'var(--primary-foreground)' }

interface ObjectiveSelectorProps {
  value?: CampaignObjective
  onChange: (objective: CampaignObjective) => void
  disabled?: boolean
}

function ObjectiveOptionCard({
  disabled,
  isSelected,
  objective,
  onChange,
}: {
  disabled?: boolean
  isSelected: boolean
  objective: (typeof CAMPAIGN_OBJECTIVES)[number]
  onChange: (objective: CampaignObjective) => void
}) {
  const Icon = ICON_MAP[objective.icon]

  const handleClick = useCallback(() => {
    onChange(objective.objective)
  }, [objective.objective, onChange])

  const buttonStyle = useMemo(
    () => ({
      '--objective-color': objective.color,
    } as React.CSSProperties),
    [objective.color]
  )
  const selectionIndicatorStyle = useMemo(
    () => ({ backgroundColor: objective.color }),
    [objective.color]
  )
  const iconContainerStyle = useMemo(
    () => ({
      backgroundColor: isSelected ? objective.color : `${objective.color}20`,
    }),
    [isSelected, objective.color]
  )
  const iconStyle = useMemo(
    () => ({ color: isSelected ? 'var(--primary-foreground)' : objective.color }),
    [isSelected, objective.color]
  )

  if (!Icon) return null

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative flex flex-col items-start rounded-lg border-2 p-4 text-left transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
        isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/50',
        disabled && 'cursor-not-allowed opacity-50'
      )}
      style={buttonStyle}
    >
      {isSelected && (
        <div className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full" style={selectionIndicatorStyle}>
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={selectedIconForegroundStyle}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg" style={iconContainerStyle}>
        <Icon className="h-6 w-6" style={iconStyle} />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold">{objective.displayName}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{objective.description}</p>
      </div>

      <div className="mt-3 w-full border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Optimizes for:</span>{' '}
          {objective.optimizationGoals.slice(0, 2).join(', ')}
          {objective.optimizationGoals.length > 2 && '...'}
        </p>
      </div>
    </button>
  )
}

function CompactObjectiveOptionButton({
  disabled,
  isSelected,
  objective,
  onChange,
}: {
  disabled?: boolean
  isSelected: boolean
  objective: (typeof CAMPAIGN_OBJECTIVES)[number]
  onChange: (objective: CampaignObjective) => void
}) {
  const Icon = ICON_MAP[objective.icon]

  const handleClick = useCallback(() => {
    onChange(objective.objective)
  }, [objective.objective, onChange])

  if (!Icon) return null

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter]',
        isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:bg-muted',
        disabled && 'cursor-not-allowed opacity-50'
      )}
    >
      <Icon className="h-4 w-4" />
      {objective.displayName}
    </button>
  )
}

export function ObjectiveSelector({ value, onChange, disabled }: ObjectiveSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CAMPAIGN_OBJECTIVES.map((objective) => (
        <ObjectiveOptionCard
          key={objective.objective}
          disabled={disabled}
          isSelected={value === objective.objective}
          objective={objective}
          onChange={onChange}
        />
      ))}
    </div>
  )
}

// Compact version for smaller spaces
interface CompactObjectiveSelectorProps {
  value?: CampaignObjective
  onChange: (objective: CampaignObjective) => void
  disabled?: boolean
}

export function CompactObjectiveSelector({ value, onChange, disabled }: CompactObjectiveSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {CAMPAIGN_OBJECTIVES.map((objective) => (
        <CompactObjectiveOptionButton
          key={objective.objective}
          disabled={disabled}
          isSelected={value === objective.objective}
          objective={objective}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
