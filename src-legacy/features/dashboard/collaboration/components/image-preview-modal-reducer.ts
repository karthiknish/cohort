import type { ImagePreviewAction, ImagePreviewState } from './image-preview-modal-types';
export function createInitialImagePreviewState(): ImagePreviewState {
    return {
        indexOffset: 0,
        zoom: 1,
        isDragging: false,
        position: { x: 0, y: 0 },
    };
}
export function imagePreviewReducer(state: ImagePreviewState, action: ImagePreviewAction): ImagePreviewState {
    switch (action.type) {
        case 'setIndexOffset':
            return {
                ...state,
                indexOffset: typeof action.value === 'function' ? action.value(state.indexOffset) : action.value,
            };
        case 'setZoom':
            return {
                ...state,
                zoom: typeof action.value === 'function' ? action.value(state.zoom) : action.value,
            };
        case 'setIsDragging':
            return { ...state, isDragging: action.value };
        case 'setPosition':
            return { ...state, position: action.value };
        case 'resetView':
            return { ...state, zoom: 1, position: { x: 0, y: 0 } };
        case 'navigate':
            return {
                ...state,
                indexOffset: action.direction === 'previous' ? state.indexOffset - 1 : state.indexOffset + 1,
                zoom: 1,
                position: { x: 0, y: 0 },
            };
        case 'selectThumbnail':
            return {
                ...state,
                indexOffset: action.offset,
                zoom: 1,
                position: { x: 0, y: 0 },
            };
        case 'zoomIn':
            return { ...state, zoom: Math.min(state.zoom + 0.5, 4) };
        case 'zoomOut': {
            const newZoom = Math.max(state.zoom - 0.5, 1);
            return {
                ...state,
                zoom: newZoom,
                position: newZoom === 1 ? { x: 0, y: 0 } : state.position,
            };
        }
        case 'close':
            return createInitialImagePreviewState();
        default:
            return state;
    }
}
