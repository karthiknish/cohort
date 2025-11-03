export const COLLABORATION_REACTIONS = ['👍', '🎉', '❤️', '🚀', '👀', '😄'] as const

export type CollaborationReactionEmoji = typeof COLLABORATION_REACTIONS[number]

export const COLLABORATION_REACTION_SET = new Set<string>(COLLABORATION_REACTIONS)
