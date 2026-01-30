// =============================================================================
// OBJECTIVE SELECTOR - Visual campaign objective selection
// =============================================================================

'use client'

import { ShoppingCart, Users, ExternalLink, Heart, Eye, Smartphone, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CampaignObjective, CAMPAIGN_OBJECTIVES } from './types'

const ICON_MAP: Record<string, LucideIcon> = {
  ShoppingCart: ShoppingCart,
  Users: Users,
  ExternalLink: ExternalLink,
  Heart: Heart,
  Eye: Eye,
  Smartphone: Smartphone,
}

interface ObjectiveSelectorProps {
  value?: CampaignObjective
  onChange: (objective: CampaignObjective) => void
  disabled?: boolean
}

export function ObjectiveSelector({ value, onChange, disabled }: ObjectiveSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {CAMPAIGN_OBJECTIVES.map((objective) => {
        const Icon = ICON_MAP[objective.icon]
        const isSelected = value === objective.objective
        
        if (!Icon) return null
        
        return (
          <button
            key={objective.objective}
            type="button"
            disabled={disabled}
            onClick={() => onChange(objective.objective)}
            className={cn(
              'relative flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all duration-200',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            style={{
              '--objective-color': objective.color,
            } as React.CSSProperties}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div 
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: objective.color }}
              >
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {/* Icon */}
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
              style={{ 
                backgroundColor: isSelected ? objective.color : `${objective.color}20`,
              }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ color: isSelected ? 'white' : objective.color }}
              />
            </div>
            
            {/* Text content */}
            <div className="space-y-1">
              <h3 className="font-semibold text-base">{objective.displayName}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {objective.description}
              </p>
            </div>
            
            {/* Optimization goals preview */}
            <div className="mt-3 pt-3 border-t border-border/50 w-full">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Optimizes for:</span>{' '}
                {objective.optimizationGoals.slice(0, 2).join(', ')}
                {objective.optimizationGoals.length > 2 && '...'}
              </p>
            </div>
          </button>
        )
      })}
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
      {CAMPAIGN_OBJECTIVES.map((objective) => {
        const Icon = ICON_MAP[objective.icon]
        const isSelected = value === objective.objective
        
        if (!Icon) return null
        
        return (
          <button
            key={objective.objective}
            type="button"
            disabled={disabled}
            onClick={() => onChange(objective.objective)}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-muted',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className="w-4 h-4" />
            {objective.displayName}
          </button>
        )
      })}
    </div>
  )
}
