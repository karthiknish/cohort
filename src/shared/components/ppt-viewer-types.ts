export interface PptViewerProps {
  url: string
  className?: string
  title?: string
}

export interface Slide {
  index: number
  imageUrl: string | null
  textContent: string
}

export type PptViewerState = {
  slides: Slide[]
  currentSlide: number
  isLoading: boolean
  error: string | null
  isFullscreen: boolean
}

export type PptViewerAction =
  | { type: 'beginLoad' }
  | { type: 'loadResolved'; slides: Slide[]; error?: string | null }
  | { type: 'setCurrentSlide'; value: number }
  | { type: 'toggleFullscreen' }
  | { type: 'setFullscreen'; value: boolean }

export function createInitialPptViewerState(): PptViewerState {
  return {
    slides: [],
    currentSlide: 0,
    isLoading: true,
    error: null,
    isFullscreen: false,
  }
}

export function pptViewerReducer(state: PptViewerState, action: PptViewerAction): PptViewerState {
  switch (action.type) {
    case 'beginLoad':
      return { ...state, isLoading: true, error: null, slides: [], currentSlide: 0 }
    case 'loadResolved':
      return {
        ...state,
        isLoading: false,
        slides: action.slides,
        currentSlide: 0,
        error: action.error ?? null,
      }
    case 'setCurrentSlide':
      return { ...state, currentSlide: action.value }
    case 'toggleFullscreen':
      return { ...state, isFullscreen: !state.isFullscreen }
    case 'setFullscreen':
      return { ...state, isFullscreen: action.value }
    default:
      return state
  }
}
