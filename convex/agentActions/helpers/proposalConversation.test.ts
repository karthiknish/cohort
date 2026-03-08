import { describe, expect, it } from 'vitest'

import {
  extractClientNameFromProposalRequest,
  getNextRequiredProposalPrompt,
  getProposalConversationPromptIdFromAssistantMessage,
  isProposalConversationRequest,
  parseProposalConversationAnswer,
} from './proposalConversation'

describe('proposalConversation helpers', () => {
  it('detects proposal builder requests', () => {
    expect(isProposalConversationRequest('Can you make a proposal for Acme Health?')).toBe(true)
    expect(isProposalConversationRequest('Generate this proposal now')).toBe(false)
  })

  it('extracts the trailing client name from proposal requests', () => {
    expect(extractClientNameFromProposalRequest('Make a proposal for Acme Health')).toBe('Acme Health')
  })

  it('maps assistant prompts back to proposal prompt ids', () => {
    expect(
      getProposalConversationPromptIdFromAssistantMessage(
        'Perfect. Any extra audience details, challenges, or notes I should add before I generate it? You can say skip.'
      )
    ).toBe('additionalNotes')
  })

  it('normalizes list-based proposal answers', () => {
    expect(parseProposalConversationAnswer('services', 'SEO, Google Ads and email marketing')).toEqual({
      formPatch: {
        scope: {
          services: ['SEO', 'PPC', 'Email Marketing'],
        },
      },
    })
  })

  it('asks for the next required field based on current draft completeness', () => {
    expect(
      getNextRequiredProposalPrompt({
        clientName: 'Acme Health',
        formData: {
          company: { name: 'Acme Health', industry: 'Healthcare' },
          marketing: { budget: '£5,000/month' },
          goals: { objectives: ['Lead Generation'] },
          scope: { services: ['SEO'] },
          timelines: { startTime: 'ASAP' },
          value: { proposalSize: '£5,000 – £10,000' },
        },
      })
    ).toBe('engagementType')
  })
})