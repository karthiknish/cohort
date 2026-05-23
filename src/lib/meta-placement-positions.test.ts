import { describe, expect, it } from 'vitest'

import {
  buildPlacementDetailDraftFromSource,
  placementDetailToMetaTargetingFields,
  togglePlacementDraftValue,
} from './meta-placement-positions'

describe('meta-placement-positions', () => {
  it('builds draft from aggregated placement source', () => {
    const draft = buildPlacementDetailDraftFromSource({
      metaPlacements: {
        facebook: ['feed'],
        instagram: ['story'],
        audienceNetwork: [],
        messenger: [],
      },
      devices: ['mobile'],
    })
    expect(draft.facebookPositions).toEqual(['feed'])
    expect(draft.instagramPositions).toEqual(['story'])
    expect(draft.devicePlatforms).toEqual(['mobile'])
  })

  it('toggles position ids', () => {
    expect(togglePlacementDraftValue(['feed'], 'story')).toEqual(['feed', 'story'])
    expect(togglePlacementDraftValue(['feed', 'story'], 'feed')).toEqual(['story'])
  })

  it('maps non-empty draft arrays to Meta targeting keys', () => {
    const fields = placementDetailToMetaTargetingFields({
      facebookPositions: ['feed'],
      instagramPositions: [],
      audienceNetworkPositions: ['classic'],
      messengerPositions: [],
      devicePlatforms: ['desktop'],
    })
    expect(fields).toEqual({
      facebook_positions: ['feed'],
      audience_network_positions: ['classic'],
      device_platforms: ['desktop'],
    })
  })
})
