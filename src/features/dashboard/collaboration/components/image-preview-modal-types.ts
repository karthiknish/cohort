export type ImagePreviewImage = {
    url: string;
    name: string;
    size?: string;
};
export type ImagePreviewModalProps = {
    images: ImagePreviewImage[];
    initialIndex?: number;
    isOpen: boolean;
    onClose: () => void;
};
export type ImagePreviewState = {
    indexOffset: number;
    zoom: number;
    isDragging: boolean;
    position: {
        x: number;
        y: number;
    };
};
export type ImagePreviewAction = {
    type: 'setIndexOffset';
    value: number | ((prev: number) => number);
} | {
    type: 'setZoom';
    value: number | ((prev: number) => number);
} | {
    type: 'setIsDragging';
    value: boolean;
} | {
    type: 'setPosition';
    value: {
        x: number;
        y: number;
    };
} | {
    type: 'resetView';
} | {
    type: 'navigate';
    direction: 'previous' | 'next';
} | {
    type: 'selectThumbnail';
    offset: number;
} | {
    type: 'zoomIn';
} | {
    type: 'zoomOut';
} | {
    type: 'close';
};
