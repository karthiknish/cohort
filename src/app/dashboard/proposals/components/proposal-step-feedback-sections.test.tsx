import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import {
  ProposalStepFeedbackHeader,
  ProposalStepFeedbackRequiredBadges,
  ProposalStepFeedbackValidationBody,
} from './proposal-step-feedback-sections'

describe('proposal step feedback sections', () => {
  it('renders the header status summary', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepFeedbackHeader
        completedRequiredFields={1}
        currentStep={1}
        hasErrors={true}
        requiredFieldCount={2}
        stepDescription="Tell us who you are"
        stepTitle="Company Information"
        totalSteps={6}
        validationMessageCount={1}
      />,
    )

    expect(markup).toContain('Step 2 of 6')
    expect(markup).toContain('1/2 required ready')
    expect(markup).toContain('1 required input still needed')
  })

  it('renders required badges and the ready/error body variants', () => {
    const errorMarkup = renderToStaticMarkup(
      <>
        <ProposalStepFeedbackRequiredBadges requiredFieldLabels={['Budget', 'Timeline']} />
        <ProposalStepFeedbackValidationBody hasErrors={true} validationMessages={['Budget is required.']} />
      </>,
    )

    const readyMarkup = renderToStaticMarkup(
      <ProposalStepFeedbackValidationBody hasErrors={false} validationMessages={[]} />,
    )

    expect(errorMarkup).toContain('Budget')
    expect(errorMarkup).toContain('Timeline')
    expect(errorMarkup).toContain('Budget is required.')
    expect(readyMarkup).toContain('Everything required for this step is in place.')
  })
})