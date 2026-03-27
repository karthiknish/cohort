import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

import { ProposalStepContent } from './proposal-step-content'

const baseFormState = {
  company: {
    name: 'Acme',
    website: 'https://acme.com',
    industry: 'SaaS',
    size: '25 employees',
    locations: 'London, Remote',
  },
  marketing: {
    budget: '£7,500',
    adAccounts: 'Yes',
    platforms: ['Google Ads'],
    socialHandles: {
      Facebook: '@acmefb',
      Instagram: '@acmeig',
      LinkedIn: '@acmeli',
      TikTok: '@acmett',
      'X / Twitter': '@acmex',
      YouTube: '@acmeyt',
    },
  },
  goals: {
    objectives: ['Lead generation'],
    audience: 'B2B SaaS buyers',
    challenges: ['Low leads'],
    customChallenge: '',
  },
  scope: {
    services: ['SEO & Content Marketing'],
    otherService: 'Landing page refresh',
  },
  timelines: {
    startTime: 'Within 1 month',
    upcomingEvents: 'Spring launch',
  },
  value: {
    proposalSize: '£5,000 – £10,000',
    engagementType: 'Ongoing monthly support',
    presentationTheme: 'modern-professional',
  },
} as const

const companyValidationErrors = { 'company.name': 'Company name is required.' }
const emptyValidationErrors = {}

describe('ProposalStepContent', () => {
  it('renders the company step through the thin dispatcher', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepContent
        stepId="company"
        formState={baseFormState as never}
        summary={baseFormState as never}
        validationErrors={companyValidationErrors}
        onUpdateField={vi.fn()}
        onToggleArrayValue={vi.fn()}
        onChangeSocialHandle={vi.fn()}
      />,
    )

    expect(markup).toContain('Company Name')
    expect(markup).toContain('Industry / Sector')
    expect(markup).toContain('Company name is required.')
  })

  it('renders the value step summary through the thin dispatcher', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepContent
        stepId="value"
        formState={baseFormState as never}
        summary={baseFormState as never}
        validationErrors={emptyValidationErrors}
        onUpdateField={vi.fn()}
        onToggleArrayValue={vi.fn()}
        onChangeSocialHandle={vi.fn()}
      />,
    )

    expect(markup).toContain('Estimated Project Value')
    expect(markup).toContain('Presentation Theme')
    expect(markup).toContain('Proposal summary')
    expect(markup).toContain('Acme')
    expect(markup).toContain('SEO &amp; Content Marketing')
  })
})