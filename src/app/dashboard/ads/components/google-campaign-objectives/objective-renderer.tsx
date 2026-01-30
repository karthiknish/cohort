// =============================================================================
// GOOGLE ADS OBJECTIVE RENDERER
// =============================================================================

'use client'

import { GoogleSalesSection } from './sales-section'
import { GoogleLeadsSection } from './leads-section'
import { GoogleTrafficSection } from './traffic-section'
import { GoogleBrandAwarenessSection } from './brand-awareness-section'
import { GoogleAppPromotionSection } from './app-promotion-section'
import { GoogleCampaignObjective, GoogleCampaignFormData, GoogleObjectiveComponentProps } from './types'

interface ObjectiveRendererProps extends GoogleObjectiveComponentProps {
  objective?: GoogleCampaignObjective
}

export function GoogleObjectiveRenderer({ objective, formData, onChange, disabled }: ObjectiveRendererProps) {
  switch (objective) {
    case 'SALES':
      return <GoogleSalesSection formData={formData} onChange={onChange} disabled={disabled} />
    
    case 'LEADS':
      return <GoogleLeadsSection formData={formData} onChange={onChange} disabled={disabled} />
    
    case 'WEBSITE_TRAFFIC':
      return <GoogleTrafficSection formData={formData} onChange={onChange} disabled={disabled} />
    
    case 'BRAND_AWARENESS_AND_REACH':
      return <GoogleBrandAwarenessSection formData={formData} onChange={onChange} disabled={disabled} />
    
    case 'APP_PROMOTION':
      return <GoogleAppPromotionSection formData={formData} onChange={onChange} disabled={disabled} />
    
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
