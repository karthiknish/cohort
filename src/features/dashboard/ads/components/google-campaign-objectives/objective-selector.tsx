// =============================================================================
// GOOGLE ADS OBJECTIVE SELECTOR
// =============================================================================

'use client'

import { useCallback, useMemo } from 'react'

import { ShoppingCart, Users, ExternalLink, Eye, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GOOGLE_OBJECTIVE_CONFIGS } from './types'
import type { GoogleCampaignObjective } from './types'

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart,
  Users,
  ExternalLink,
  Eye,
  Smartphone,
}

interface ObjectiveSelectorProps {
  value?: GoogleCampaignObjective
  onChange: (objective: GoogleCampaignObjective) => void
  disabled?: boolean
}

type ObjectiveConfig = (typeof GOOGLE_OBJECTIVE_CONFIGS)[number]

function ObjectiveSelectorCard({
  config,
  disabled,
  isSelected,
  onChange,
}: {
  config: ObjectiveConfig
  disabled?: boolean
  isSelected: boolean
  onChange: (objective: GoogleCampaignObjective) => void
}) {
  const Icon = ICON_MAP[config.icon]

  const handleClick = useCallback(() => {
    onChange(config.value)
  }, [config.value, onChange])

  const selectedIndicatorStyle = useMemo(() => ({ backgroundColor: config.color }), [config.color])
  const iconContainerStyle = useMemo(
    () => ({
      backgroundColor: isSelected ? config.color : `${config.color}20`,
    }),
    [config.color, isSelected]
  )
  const iconStyle = useMemo(
    () => ({
      color: isSelected ? 'var(--primary-foreground)' : config.color,
    }),
    [config.color, isSelected]
  )
  const checkStyle = useMemo(() => ({ color: 'var(--primary-foreground)' }), [])

  if (!Icon) return null

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'relative flex flex-col items-start p-4 rounded-lg border-2 text-left transition-[color,background-color,border-color,text-decoration-color,fill,stroke,opacity,box-shadow,transform,filter,backdrop-filter] duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-primary/50',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isSelected && (
        <div
          className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full"
          style={selectedIndicatorStyle}
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={checkStyle}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg" style={iconContainerStyle}>
        <Icon className="h-6 w-6" style={iconStyle} />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold">{config.label}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{config.description}</p>
      </div>

      <div className="mt-3 w-full border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Available on:</span> {config.channelTypes.slice(0, 3).join(', ')}
          {config.channelTypes.length > 3 && '...'}
        </p>
      </div>
    </button>
  )
}

export function GoogleObjectiveSelector({ value, onChange, disabled }: ObjectiveSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {GOOGLE_OBJECTIVE_CONFIGS.map((config) => (
        <ObjectiveSelectorCard
          key={config.value}
          config={config}
          disabled={disabled}
          isSelected={value === config.value}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
