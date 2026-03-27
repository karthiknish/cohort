import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/ui/dialog', () => ({
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/location-map', () => ({
  LocationMap: ({ selectedLocations }: { selectedLocations: Array<{ name: string }> }) => <div>Locations: {selectedLocations.length}</div>,
}))

import { AudienceBuilderDialogFooter, AudienceBuilderDialogHeader, AudienceBuilderDialogTabs } from './audience-builder-dialog-sections'

describe('audience builder dialog sections', () => {
  it('renders the dialog header and progress steps', () => {
    const completionSteps = [
      { id: 'basics', label: 'Basics', complete: true },
      { id: 'locations', label: 'Locations', complete: false },
    ]
    const onSelectStep = vi.fn()
    const markup = renderToStaticMarkup(
      <AudienceBuilderDialogHeader
        activeTab="basics"
        completionSteps={completionSteps}
        onSelectStep={onSelectStep}
        providerId="facebook"
      />,
    )

    expect(markup).toContain('Build New Audience')
    expect(markup).toContain('Create a custom audience for facebook campaigns')
    expect(markup).toContain('Basics')
    expect(markup).toContain('Locations')
  })

  it('renders the targeting tab and footer summary', () => {
    const formData = { name: 'Audience A', description: '', segments: [], locations: [], interests: ['Travel'], genders: [] }
    const onAddInterest = vi.fn()
    const onAddSegment = vi.fn()
    const onAgePreset = vi.fn()
    const onDescriptionChange = vi.fn()
    const onGenderToggle = vi.fn()
    const onInterestInputChange = vi.fn()
    const onLocationRemove = vi.fn()
    const onLocationSelect = vi.fn()
    const onNameChange = vi.fn()
    const onRemoveInterest = vi.fn()
    const onRemoveSegment = vi.fn()
    const onResetGenders = vi.fn()
    const onSegmentInputChange = vi.fn()
    const setActiveTab = vi.fn()
    const tabsMarkup = renderToStaticMarkup(
      <AudienceBuilderDialogTabs
        activeTab="targeting"
        formData={formData}
        newInterest=""
        newSegment=""
        onAddInterest={onAddInterest}
        onAddSegment={onAddSegment}
        onAgePreset={onAgePreset}
        onDescriptionChange={onDescriptionChange}
        onGenderToggle={onGenderToggle}
        onInterestInputChange={onInterestInputChange}
        onLocationRemove={onLocationRemove}
        onLocationSelect={onLocationSelect}
        onNameChange={onNameChange}
        onRemoveInterest={onRemoveInterest}
        onRemoveSegment={onRemoveSegment}
        onResetGenders={onResetGenders}
        onSegmentInputChange={onSegmentInputChange}
        providerId="linkedin"
        setActiveTab={setActiveTab}
      />,
    )

    const onCancel = vi.fn()
    const onCreate = vi.fn()
    const footerMarkup = renderToStaticMarkup(
      <AudienceBuilderDialogFooter completedCount={2} loading={false} onCancel={onCancel} onCreate={onCreate} totalSteps={4} />,
    )

    expect(tabsMarkup).toContain('Custom Segments')
    expect(tabsMarkup).toContain('Enter job title or skill')
    expect(tabsMarkup).toContain('No segments added yet')
    expect(tabsMarkup).toContain('Suggested interests')
    expect(tabsMarkup).toContain('Travel')
    expect(footerMarkup).toContain('of 4 sections completed')
    expect(footerMarkup).toContain('Create Audience')
  })
})