'use client'

import { useMutation } from 'convex/react'
import { useCallback } from 'react'

import { reportConvexFailure } from '@/lib/handle-convex-error'
import { collaborationApi, directMessagesApi } from '@/lib/convex-api'

type UsePollMessageActionsOptions = {
  workspaceId: string | null
  mode: 'channel' | 'dm'
}

export function usePollMessageActions({ workspaceId, mode }: UsePollMessageActionsOptions) {
  const voteOnChannelPoll = useMutation(collaborationApi.voteOnPoll)
  const endChannelPoll = useMutation(collaborationApi.endPollMessage)
  const voteOnDmPoll = useMutation(directMessagesApi.voteOnPoll)
  const endDmPoll = useMutation(directMessagesApi.endPollMessage)

  const handleVote = useCallback(
    async (messageLegacyId: string, optionIds: string[]) => {
      if (!workspaceId || optionIds.length === 0) {
        return
      }

      try {
        if (mode === 'channel') {
          await voteOnChannelPoll({
            workspaceId,
            legacyId: messageLegacyId,
            optionIds,
          })
        } else {
          await voteOnDmPoll({
            workspaceId,
            messageLegacyId,
            optionIds,
          })
        }
      } catch (error: unknown) {
        reportConvexFailure({
          error,
          context: 'usePollMessageActions:handleVote',
          title: 'Could not record vote',
        })
        throw error
      }
    },
    [mode, voteOnChannelPoll, voteOnDmPoll, workspaceId],
  )

  const handleEndPoll = useCallback(
    async (messageLegacyId: string) => {
      if (!workspaceId) {
        return
      }

      try {
        if (mode === 'channel') {
          await endChannelPoll({
            workspaceId,
            legacyId: messageLegacyId,
          })
        } else {
          await endDmPoll({
            workspaceId,
            messageLegacyId,
          })
        }
      } catch (error: unknown) {
        reportConvexFailure({
          error,
          context: 'usePollMessageActions:handleEndPoll',
          title: 'Could not end poll',
        })
        throw error
      }
    },
    [endChannelPoll, endDmPoll, mode, workspaceId],
  )

  return {
    handleVote,
    handleEndPoll,
  }
}
