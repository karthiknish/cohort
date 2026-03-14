import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it } from 'vitest'

import {
  ProposalStepIndicatorProgressBar,
  ProposalStepIndicatorSummary,
} from './proposal-step-indicator-sections'

describe('proposal step indicator sections', () => {
  it('renders the summary row', () => {
    const markup = renderToStaticMarkup(
      <ProposalStepIndicatorSummary
        activeStepTitle="Company Information"
        currentStep={1}
        percentage={40}
        totalSteps={5}
      />,
    )

    expect(markup).toContain('Step 2')
    expect(markup).toContain('of 5')
    expect(markup).toContain('Company Information')
    expect(markup).toContain('40%')
  })

  it('renders the progress bar width', () => {
    const markup = renderToStaticMarkup(<ProposalStepIndicatorProgressBar percentage={75} />)

    expect(markup).toContain('width:75%')
  })
})