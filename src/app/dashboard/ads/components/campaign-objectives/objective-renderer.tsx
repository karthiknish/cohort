// =============================================================================
// OBJECTIVE RENDERER - Dynamically render the appropriate objective section
// =============================================================================

'use client'

import { SalesObjectiveSection } from './sales-objective-section'
import { LeadsObjectiveSection } from './leads-objective-section'
import { TrafficObjectiveSection } from './traffic-objective-section'
import { EngagementObjectiveSection } from './engagement-objective-section'
import { AwarenessObjectiveSection } from './awareness-objective-section'
import { AppPromotionSection } from './app-promotion-section'
import { CampaignObjective, CampaignFormData, ObjectiveComponentProps } from './types'

interface ObjectiveRendererProps extends ObjectiveComponentProps {
  objective?: CampaignObjective
}

export function ObjectiveRenderer({ objective, formData, onChange, disabled }: ObjectiveRendererProps) {
  switch (objective) {
    case 'OUTCOME_SALES':
      return <SalesObjectiveSection formData={formData} onChange={onChange} disabled={disabled} providerId={formData.providerId || 'facebook'} />
    
    case 'OUTCOME_LEADS':
      return <LeadsObjectiveSection formData={formData} onChange={onChange} disabled={disabled} providerId={formData.providerId || 'facebook'} />
    
    case 'OUTCOME_TRAFFIC':
      return <TrafficObjectiveSection formData={formData} onChange={onChange} disabled={disabled} providerId={formData.providerId || 'facebook'} />
    
    case 'OUTCOME_ENGAGEMENT':
      return <EngagementObjectiveSection formData={formData} onChange={onChange} disabled={disabled} providerId={formData.providerId || 'facebook'} />
    
    case 'OUTCOME_AWARENESS':
      return <AwarenessObjectiveSection formData={formData} onChange={onChange} disabled={disabled} providerId={formData.providerId || 'facebook'} />
    
    case 'OUTCOME_APP_PROMOTION':
      return <AppPromotionSection formData={formData} onChange={onChange} disabled={disabled} providerId={formData.providerId || 'facebook'} />
    
    default:
      return (
        <div className="p-8 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            Select a campaign objective to see objective-specific settings
          </p>
        </div>
      )
  }
}
