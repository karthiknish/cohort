import { z } from 'zod'

export const channelTypeSchema = z.enum(['client', 'team', 'project'])
export const messageFormatSchema = z.enum(['markdown', 'plaintext'])

export const mentionSchema = z.object({
  slug: z.string().trim().min(1).max(160),
  name: z.string().trim().min(1).max(160),
  role: z
    .string()
    .trim()
    .max(120)
    .nullable()
    .optional(),
})
