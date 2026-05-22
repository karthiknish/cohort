'use client'

import { Edit3, Layout, Sparkles } from 'lucide-react'

import type { AlgorithmicInsight } from '@/lib/ad-algorithms'

import type { Creative } from './types'
import type { CreativePerformanceSummary } from './creative-social-preview'
import {
  CreativeEditorDetailsTab,
  CreativeEditorEditTab,
  CreativeEditorInsightsTab,
} from './creative-editor-tabs-sections'
import type { CreativeEditorTabSharedProps } from './creative-editor-tabs-utils'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

export function CreativeEditorTabs(props: {
  creative: Creative
  copiedField: string | null
  onCopy: (text: string, field: string) => void

  isEditing: boolean
  isDirty?: boolean
  editedHeadlines: string[]
  editedDescriptions: string[]
  editedCta: string
  editedLandingPage: string
  previewHeadlineIndex?: number
  previewDescriptionIndex?: number
  onPreviewHeadlineIndexChange?: (index: number) => void
  onPreviewDescriptionIndexChange?: (index: number) => void
  onAddHeadline: () => void
  onRemoveHeadline: (index: number) => void
  onUpdateHeadline: (index: number, value: string) => void
  onAddDescription: () => void
  onRemoveDescription: (index: number) => void
  onUpdateDescription: (index: number, value: string) => void
  onChangeCta: (value: string) => void
  onChangeLandingPage: (value: string) => void

  generatingHeadlines?: boolean
  generatingDescriptions?: boolean
  onGenerateHeadlines?: () => void
  onGenerateDescriptions?: () => void

  performanceSummary?: CreativePerformanceSummary | null
  onRefreshPerformance?: () => void
  algorithmicInsights: AlgorithmicInsight[]
}) {
  const { isDirty = false, previewHeadlineIndex = 0, previewDescriptionIndex = 0, ...rest } = props

  const tabProps: CreativeEditorTabSharedProps = {
    ...rest,
    previewHeadlineIndex,
    previewDescriptionIndex,
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="edit" className="w-full">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="h-10 bg-muted/40 p-1">
            <TabsTrigger value="edit" className="gap-2 px-3 text-xs">
              <Edit3 className="size-3.5" />
              Content
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Sparkles className="size-3.5 text-primary" />
              AI Insights
            </TabsTrigger>
            <TabsTrigger value="details" className="gap-2">
              <Layout className="size-3.5" />
              Technical
            </TabsTrigger>
          </TabsList>

          <p className="text-xs text-muted-foreground">
            {isDirty ? 'You have unsaved edits.' : 'Edit copy below — preview updates live on the left.'}
          </p>
        </div>

        <TabsContent value="edit" className="mt-0 space-y-5">
          <CreativeEditorEditTab {...tabProps} />
        </TabsContent>

        <TabsContent value="insights" className="mt-0 space-y-4">
          <CreativeEditorInsightsTab
            performanceSummary={tabProps.performanceSummary}
            onRefreshPerformance={tabProps.onRefreshPerformance}
            algorithmicInsights={tabProps.algorithmicInsights}
          />
        </TabsContent>

        <TabsContent value="details" className="mt-0 space-y-4">
          <CreativeEditorDetailsTab
            creative={tabProps.creative}
            copiedField={tabProps.copiedField}
            onCopy={tabProps.onCopy}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
