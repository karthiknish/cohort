import { describe, expect, it } from 'vitest'

import { agentPanelHref, applyAgentPanelUrl, parseAgentPanelUrl } from './agent-panel-url'

describe('agent panel url', () => {
  it('parses open, history view, and conversation id', () => {
    const params = new URLSearchParams('agent=open&agentView=history&agentConversation=abc')
    expect(parseAgentPanelUrl(params)).toEqual({
      open: true,
      view: 'history',
      conversationId: 'abc',
    })
  })

  it('clears agent params when closed', () => {
    const params = new URLSearchParams('agent=open&agentView=history&agentConversation=abc&tab=tasks')
    const next = applyAgentPanelUrl(params, { open: false })
    expect(next.get('agent')).toBeNull()
    expect(next.get('agentView')).toBeNull()
    expect(next.get('agentConversation')).toBeNull()
    expect(next.get('tab')).toBe('tasks')
  })

  it('builds href with merged query', () => {
    const href = agentPanelHref('/dashboard', new URLSearchParams('tab=tasks'), {
      open: true,
      view: 'history',
      conversationId: 'xyz',
    })
    expect(href).toContain('/dashboard?')
    expect(href).toContain('agent=open')
    expect(href).toContain('agentView=history')
    expect(href).toContain('agentConversation=xyz')
    expect(href).toContain('tab=tasks')
  })
})
