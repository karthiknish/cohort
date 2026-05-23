import type { MetaPlacementDetailDraft } from '@/lib/meta-placement-positions'

import type { TargetingData } from './audience-control-types'

export type Insights = {
  totalEntities: number
  demographicCoverage: {
    hasAgeTargeting: boolean
    hasGenderTargeting: boolean
    hasLocationTargeting: boolean
  }
  audienceStats: {
    totalAudiences: number
    hasCustomAudiences: boolean
    hasRemarketingLists: boolean
  }
  interestStats: {
    totalInterests: number
    totalKeywords: number
  }
}

export type AudienceControlSectionState = {
  targeting: TargetingData[]
  insights: Insights | null
  loading: boolean
  expandedSections: Set<string>
  builderOpen: boolean
  hasLoaded: boolean
  editingSection: string | null
  selectedTargetingId: string
  draftInterests: Array<{ id: string; name: string }> | null
  draftLocations: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  } | null
  draftAudiences: {
    included: Array<{ id: string; name: string; type: string }>
    excluded: Array<{ id: string; name: string }>
  } | null
  draftDemographics: {
    ageMin: number
    ageMax: number
    genders: string[]
  } | null
  draftPlacements: string[] | null
  draftPlacementDetail: MetaPlacementDetailDraft | null
  savingTargeting: boolean
}

export type AudienceControlSectionAction =
  | { type: 'setTargeting'; value: TargetingData[] }
  | { type: 'setInsights'; value: Insights | null }
  | { type: 'setLoading'; value: boolean }
  | { type: 'setExpandedSections'; value: Set<string> }
  | { type: 'toggleSection'; section: string }
  | { type: 'setBuilderOpen'; value: boolean }
  | { type: 'setHasLoaded'; value: boolean }
  | { type: 'setEditingSection'; value: string | null }
  | { type: 'toggleEditing'; section: string }
  | { type: 'setSelectedTargetingId'; value: string }
  | { type: 'setDraftInterests'; value: Array<{ id: string; name: string }> | null }
  | { type: 'updateDraftInterests'; updater: (prev: Array<{ id: string; name: string }> | null) => Array<{ id: string; name: string }> | null }
  | {
      type: 'setDraftLocations'
      value: {
        included: Array<{ id: string; name: string; type: string }>
        excluded: Array<{ id: string; name: string }>
      } | null
    }
  | {
      type: 'updateDraftLocations'
      updater: (
        prev: {
          included: Array<{ id: string; name: string; type: string }>
          excluded: Array<{ id: string; name: string }>
        } | null,
      ) => {
        included: Array<{ id: string; name: string; type: string }>
        excluded: Array<{ id: string; name: string }>
      } | null
    }
  | {
      type: 'setDraftAudiences'
      value: {
        included: Array<{ id: string; name: string; type: string }>
        excluded: Array<{ id: string; name: string }>
      } | null
    }
  | {
      type: 'updateDraftAudiences'
      updater: (
        prev: {
          included: Array<{ id: string; name: string; type: string }>
          excluded: Array<{ id: string; name: string }>
        } | null,
      ) => {
        included: Array<{ id: string; name: string; type: string }>
        excluded: Array<{ id: string; name: string }>
      } | null
    }
  | {
      type: 'setDraftDemographics'
      value: { ageMin: number; ageMax: number; genders: string[] } | null
    }
  | {
      type: 'updateDraftDemographics'
      updater: (
        prev: { ageMin: number; ageMax: number; genders: string[] } | null,
      ) => { ageMin: number; ageMax: number; genders: string[] } | null
    }
  | { type: 'setDraftPlacements'; value: string[] | null }
  | {
      type: 'updateDraftPlacements'
      updater: (prev: string[] | null) => string[] | null
    }
  | { type: 'setDraftPlacementDetail'; value: MetaPlacementDetailDraft | null }
  | {
      type: 'updateDraftPlacementDetail'
      updater: (prev: MetaPlacementDetailDraft | null) => MetaPlacementDetailDraft | null
    }
  | { type: 'setSavingTargeting'; value: boolean }
  | { type: 'applyTargetingFetch'; targeting: TargetingData[]; insights: Insights | null }

export const DEFAULT_EXPANDED_SECTIONS = new Set(['demographics', 'locations', 'interests', 'placements'])

export function createInitialAudienceControlSectionState(): AudienceControlSectionState {
  return {
    targeting: [],
    insights: null,
    loading: true,
    expandedSections: DEFAULT_EXPANDED_SECTIONS,
    builderOpen: false,
    hasLoaded: false,
    editingSection: null,
    selectedTargetingId: 'all',
    draftInterests: null,
    draftLocations: null,
    draftAudiences: null,
    draftDemographics: null,
    draftPlacements: null,
    draftPlacementDetail: null,
    savingTargeting: false,
  }
}

export function audienceControlSectionReducer(
  state: AudienceControlSectionState,
  action: AudienceControlSectionAction,
): AudienceControlSectionState {
  switch (action.type) {
    case 'setTargeting':
      return { ...state, targeting: action.value }
    case 'setInsights':
      return { ...state, insights: action.value }
    case 'setLoading':
      return { ...state, loading: action.value }
    case 'setExpandedSections':
      return { ...state, expandedSections: action.value }
    case 'toggleSection': {
      const next = new Set(state.expandedSections)
      if (next.has(action.section)) {
        next.delete(action.section)
      } else {
        next.add(action.section)
      }
      return { ...state, expandedSections: next }
    }
    case 'setBuilderOpen':
      return { ...state, builderOpen: action.value }
    case 'setHasLoaded':
      return { ...state, hasLoaded: action.value }
    case 'setEditingSection':
      return { ...state, editingSection: action.value }
    case 'toggleEditing':
      return {
        ...state,
        editingSection: state.editingSection === action.section ? null : action.section,
      }
    case 'setSelectedTargetingId':
      return { ...state, selectedTargetingId: action.value }
    case 'setDraftInterests':
      return { ...state, draftInterests: action.value }
    case 'updateDraftInterests':
      return { ...state, draftInterests: action.updater(state.draftInterests) }
    case 'setDraftLocations':
      return { ...state, draftLocations: action.value }
    case 'updateDraftLocations':
      return { ...state, draftLocations: action.updater(state.draftLocations) }
    case 'setDraftAudiences':
      return { ...state, draftAudiences: action.value }
    case 'updateDraftAudiences':
      return { ...state, draftAudiences: action.updater(state.draftAudiences) }
    case 'setDraftDemographics':
      return { ...state, draftDemographics: action.value }
    case 'updateDraftDemographics':
      return { ...state, draftDemographics: action.updater(state.draftDemographics) }
    case 'setDraftPlacements':
      return { ...state, draftPlacements: action.value }
    case 'updateDraftPlacements':
      return { ...state, draftPlacements: action.updater(state.draftPlacements) }
    case 'setDraftPlacementDetail':
      return { ...state, draftPlacementDetail: action.value }
    case 'updateDraftPlacementDetail':
      return { ...state, draftPlacementDetail: action.updater(state.draftPlacementDetail) }
    case 'setSavingTargeting':
      return { ...state, savingTargeting: action.value }
    case 'applyTargetingFetch': {
      const nextTargeting = action.targeting
      let selectedTargetingId = state.selectedTargetingId
      if (nextTargeting.length <= 1) {
        selectedTargetingId = 'all'
      } else if (selectedTargetingId === 'all') {
        const firstId = typeof nextTargeting[0]?.entityId === 'string' ? nextTargeting[0].entityId : null
        selectedTargetingId = firstId ?? selectedTargetingId
      }
      return {
        ...state,
        targeting: nextTargeting,
        insights: action.insights,
        hasLoaded: true,
        selectedTargetingId,
      }
    }
    default:
      return state
  }
}
