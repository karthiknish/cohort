export type OperationStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface Operation {
    id: string;
    name: string;
    description?: string;
    status: OperationStatus;
    progress: number;
    total?: number;
    current?: number;
    startTime?: number;
    endTime?: number;
    error?: string;
    steps?: Array<{
        name: string;
        status: 'pending' | 'running' | 'completed' | 'failed';
        timestamp?: number;
    }>;
    onPause?: () => void;
    onResume?: () => void;
    onCancel?: () => void;
    onRetry?: () => void;
}
