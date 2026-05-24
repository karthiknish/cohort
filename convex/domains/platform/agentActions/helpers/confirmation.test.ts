import { describe, expect, it } from 'vitest'

import {
  buildConfirmationProposal,
  operationRequiresConfirmation,
  parseConfirmationDecision,
  resolvePendingConfirmation,
} from './confirmation'

describe('agent confirmation helpers', () => {
  it('requires confirmation for write operations', () => {
    expect(operationRequiresConfirmation('createTask')).toBe(true)
    expect(operationRequiresConfirmation('summarizeClientTasks')).toBe(false)
  })

  it('parses confirmation decisions from short replies', () => {
    expect(parseConfirmationDecision('confirm')).toBe('confirm')
    expect(parseConfirmationDecision('Cancel')).toBe('cancel')
    expect(parseConfirmationDecision('edit fields')).toBe('edit')
    expect(parseConfirmationDecision('create a task')).toBe(null)
  })

  it('builds a proposal with fields and affected records', () => {
    const proposal = buildConfirmationProposal('createTask', {
      title: 'Review ads',
      priority: 'high',
    })
    expect(proposal.summary).toContain('Review ads')
    expect(proposal.fields?.Title).toBe('Review ads')
    expect(proposal.affectedRecords?.[0]).toContain('Review ads')
  })

  it('resolves pending confirmation from request context', () => {
    const pending = resolvePendingConfirmation({
      pendingConfirmation: {
        confirmationId: 'conf-1',
        operation: 'createTask',
        params: { title: 'Ship report' },
      },
    })
    expect(pending?.operation).toBe('createTask')
    expect(pending?.params.title).toBe('Ship report')
  })
})
