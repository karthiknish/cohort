import type { DeckProgressStage } from './deck-progress-overlays-types'

const deckStageMessages: Record<DeckProgressStage, { title: string; description: string }> = {
  initializing: {
    title: 'Starting deck request...',
    description: 'Collecting your proposal details and preparing the presentation export.',
  },
  polling: {
    title: 'Generating slides & saving...',
    description: 'We are exporting the PPT and saving a copy for you.',
  },
  launching: {
    title: 'Deck ready',
    description: 'We saved a copy and are opening it for you now.',
  },
  queued: {
    title: 'Still processing',
    description: "The presentation export is still processing. We'll save it automatically as soon as it lands.",
  },
  error: {
    title: 'Deck preparation failed',
    description: 'We could not finish the export. Please retry or regenerate the proposal.',
  },
}

export function getDeckStageCopy(stage: DeckProgressStage) {
  return deckStageMessages[stage]
}
