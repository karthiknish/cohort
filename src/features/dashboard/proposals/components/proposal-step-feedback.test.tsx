import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { ProposalStepFeedback } from './proposal-step-feedback'

describe('ProposalStepFeedback', () => {
  it('renders nothing when there are no validation errors', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepFeedback validationMessages={[]} />,
    )

    expect(markup).toBe('')
  })

  it('renders validation guidance when required fields are still missing', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepFeedback
        validationMessages={['Company name is required.', 'Industry is required.']}
      />,
    )

    expect(markup).toContain('Fix these before continuing')
    expect(markup).toContain('Company name is required.')
  })
})
