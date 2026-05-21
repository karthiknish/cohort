import { describe, expect, it } from 'vitest'

import {
  buildAgentContextChips,
  deriveActiveContextFromPath,
  getAgentQuickSuggestions,
} from './agent-context'

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
    const ads = getAgentQuickSuggestions('/dashboard/ads')
    expect(ads[0]).toContain('Meta ads')
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
