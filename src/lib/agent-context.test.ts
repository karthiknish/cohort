import { describe, expect, it } from 'vitest'

import {
  buildAgentContextChips,
  deriveActiveContextFromPath,
} from './agent-context'
import { getAgentSuggestions } from './agent-suggestions'

describe('agent-context', () => {
  it('derives entity ids from dashboard paths', () => {
    expect(deriveActiveContextFromPath('/dashboard/projects/proj-1')).toEqual({
      activeProjectId: 'proj-1',
    })
    expect(deriveActiveContextFromPath('/dashboard/proposals/prop-9')).toEqual({
      activeProposalId: 'prop-9',
    })
  })

  it('returns route-specific quick suggestions', () => {
    const ads = getAgentSuggestions('/dashboard/ads', { role: 'admin' })
    expect(ads.some((suggestion) => suggestion.prompt.includes('Meta ads'))).toBe(true)
  })

  it('builds context chips for client and page', () => {
    const chips = buildAgentContextChips({
      pathname: '/dashboard/analytics',
      ids: { activeClientId: 'c1' },
      selectedClientName: 'Acme',
    })
    expect(chips.some((chip) => chip.label.includes('Acme'))).toBe(true)
    expect(chips.some((chip) => chip.label === 'Analytics')).toBe(true)
  })
})
