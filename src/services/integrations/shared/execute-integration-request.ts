import type { BaseRequestOptions, IntegrationApiClient, RequestResult } from './base-client'

export async function executeIntegrationRequest<T>(
  client: IntegrationApiClient,
  options: BaseRequestOptions,
  config?: { defaultMethod?: BaseRequestOptions['method'] }
): Promise<RequestResult<T>> {
  const resolvedMethod = options.method ?? config?.defaultMethod

  const resolvedOptions: BaseRequestOptions = resolvedMethod
    ? { ...options, method: resolvedMethod }
    : options

  return client.executeRequest<T>(resolvedOptions)
}
