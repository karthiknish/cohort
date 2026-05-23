import * as z from 'zod'

export function wrappedResponseZ<T extends z.ZodTypeAny>(schema: T) {
  return z.object({
    ok: z.literal(true),
    data: schema,
  })
}
