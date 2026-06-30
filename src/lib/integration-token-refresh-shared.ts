export interface RefreshParams {
    userId: string;
    clientId?: string | null;
    forceRefresh?: boolean;
    providerId?: 'google' | 'google-analytics';
}
export class IntegrationTokenError extends Error {
    userId?: string;
    providerId?: string;
    isRetryable: boolean;
    httpStatus?: number;
    constructor(message: string, providerId?: string, userId?: string, options?: {
        isRetryable?: boolean;
        httpStatus?: number;
    }) {
        super(message);
        this.name = 'IntegrationTokenError';
        this.providerId = providerId;
        this.userId = userId;
        this.isRetryable = options?.isRetryable ?? false;
        this.httpStatus = options?.httpStatus;
    }
}
