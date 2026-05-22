'use client'

import { useMentionInput } from './use-mention-input'

import type { MentionInputComponentProps } from './mention-input-types'

export type { MentionableUser, MentionInputProps } from './mention-input-types'

export function MentionInput(props: MentionInputComponentProps) {
  return useMentionInput(props)
}
