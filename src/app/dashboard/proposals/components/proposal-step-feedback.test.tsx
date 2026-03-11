import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import { ProposalStepFeedback } from './proposal-step-feedback'

describe('ProposalStepFeedback', () => {
  it('renders validation guidance when required fields are still missing', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepFeedback
        currentStep={1}
        totalSteps={6}
        stepTitle="Company Information"
        stepDescription="Tell us who you are and where you operate."
        requiredFieldLabels={['Company Name', 'Industry / Sector']}
        validationMessages={['Company name is required.', 'Industry is required.']}
      />,
    )

    expect(markup).toContain('Step 2 of 6')
    expect(markup).toContain('0/2 required ready')
    expect(markup).toContain('2 required inputs still needed')
    expect(markup).toContain('Company name is required.')
  })

  it('renders a ready state once required inputs are complete', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepFeedback
        currentStep={4}
        totalSteps={6}
        stepTitle="Timelines & Priorities"
        stepDescription="Let us know when you want to get started."
        requiredFieldLabels={['Preferred start timeline']}
        validationMessages={[]}
      />,
    )

    expect(markup).toContain('Step 5 of 6')
    expect(markup).toContain('1/1 required ready')
    expect(markup).toContain('Required inputs complete')
    expect(markup).toContain('Everything required for this step is in place.')
  })
})