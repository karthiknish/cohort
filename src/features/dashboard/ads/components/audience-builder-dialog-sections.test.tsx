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
    const markup = renderToStaticMarkup(
      <AudienceBuilderDialogHeader
        activeTab="basics"
        completionSteps={[{ id: 'basics', label: 'Basics', complete: true }, { id: 'locations', label: 'Locations', complete: false }]}
        onSelectStep={vi.fn()}
        providerId="facebook"
      />,
    )

    expect(markup).toContain('Build New Audience')
    expect(markup).toContain('Create a custom audience for facebook campaigns')
    expect(markup).toContain('Basics')
    expect(markup).toContain('Locations')
  })

  it('renders the targeting tab and footer summary', () => {
    const tabsMarkup = renderToStaticMarkup(
      <AudienceBuilderDialogTabs
        activeTab="targeting"
        formData={{ name: 'Audience A', description: '', segments: [], locations: [], interests: ['Travel'], genders: [] }}
        newInterest=""
        newSegment=""
        onAddInterest={vi.fn()}
        onAddSegment={vi.fn()}
        onAgePreset={vi.fn()}
        onDescriptionChange={vi.fn()}
        onGenderToggle={vi.fn()}
        onInterestInputChange={vi.fn()}
        onLocationRemove={vi.fn()}
        onLocationSelect={vi.fn()}
        onNameChange={vi.fn()}
        onRemoveInterest={vi.fn()}
        onRemoveSegment={vi.fn()}
        onResetGenders={vi.fn()}
        onSegmentInputChange={vi.fn()}
        providerId="linkedin"
        setActiveTab={vi.fn()}
      />,
    )

    const footerMarkup = renderToStaticMarkup(
      <AudienceBuilderDialogFooter completedCount={2} loading={false} onCancel={vi.fn()} onCreate={vi.fn()} totalSteps={4} />,
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