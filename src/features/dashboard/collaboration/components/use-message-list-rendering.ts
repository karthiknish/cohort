import type { CollaborationMessage } from '@/types/collaboration'

/**
 * Hook for efficient message list rendering
 * Automatically selects between virtualized and regular rendering based on message count
 */
export function useMessageListRendering(messages: CollaborationMessage[]) {
  const VIRTUALIZATION_THRESHOLD = 50

  const shouldVirtualize = messages.length > VIRTUALIZATION_THRESHOLD

  return {
    shouldVirtualize,
    VirtualizationThreshold: VIRTUALIZATION_THRESHOLD,
  }
}
