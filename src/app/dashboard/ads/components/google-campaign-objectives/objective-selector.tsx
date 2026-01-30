// =============================================================================
// GOOGLE ADS OBJECTIVE SELECTOR
// =============================================================================

'use client'

import { ShoppingCart, Users, ExternalLink, Eye, Smartphone, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GoogleCampaignObjective, GOOGLE_OBJECTIVE_CONFIGS } from './types'

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

export function GoogleObjectiveSelector({ value, onChange, disabled }: ObjectiveSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {GOOGLE_OBJECTIVE_CONFIGS.map((config) => {
        const Icon = ICON_MAP[config.icon]
        const isSelected = value === config.value
        
        if (!Icon) return null
        
        return (
          <button
            key={config.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(config.value)}
            className={cn(
              'relative flex flex-col items-start p-4 rounded-lg border-2 text-left transition-all duration-200',
              'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              isSelected
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border bg-card hover:border-primary/50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Selection indicator */}
            {isSelected && (
              <div 
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ backgroundColor: config.color }}
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
                backgroundColor: isSelected ? config.color : `${config.color}20`,
              }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ color: isSelected ? 'white' : config.color }}
              />
            </div>
            
            {/* Text content */}
            <div className="space-y-1">
              <h3 className="font-semibold text-base">{config.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {config.description}
              </p>
            </div>
            
            {/* Channel types */}
            <div className="mt-3 pt-3 border-t border-border/50 w-full">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Available on:</span>{' '}
                {config.channelTypes.slice(0, 3).join(', ')}
                {config.channelTypes.length > 3 && '...'}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
