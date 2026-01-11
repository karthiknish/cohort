import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { rateLimiter } from "./rateLimit";

export const limit = mutation({
  args: {
    name: v.string(),
    key: v.string(),
    count: v.optional(v.number()),
    // Optional one-off configuration for custom limits.
    config: v.optional(
      v.object({
        kind: v.union(v.literal("fixed window"), v.literal("token bucket")),
        rate: v.number(),
        period: v.number(),
        capacity: v.optional(v.number()),
        shards: v.optional(v.number()),
        start: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const opts: { key: string; count?: number; config?: any } = {
      key: args.key,
      count: args.count,
    }

    if (args.config) {
      opts.config = args.config
    }

    const status = await rateLimiter.limit(ctx, args.name, opts as any);

    // `retryAfter` is a delay in milliseconds.
    return {
      ok: status.ok,
      retryAfterMs: status.retryAfter ?? null,
    };
  },
});
