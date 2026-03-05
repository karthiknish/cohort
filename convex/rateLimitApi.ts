import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { rateLimiter } from "./rateLimit";

type LimitConfig = {
  kind: "fixed window"
  rate: number
  period: number
  capacity?: number
  shards?: number
  start?: number
}

const PRESET_LIMIT_NAMES = ["standard", "sensitive", "critical", "bulk"] as const
type PresetLimitName = (typeof PRESET_LIMIT_NAMES)[number]

function isPresetLimitName(name: string): name is PresetLimitName {
  return (PRESET_LIMIT_NAMES as readonly string[]).includes(name)
}

export const limit = mutation({
  args: {
    name: v.string(),
    key: v.string(),
    count: v.optional(v.number()),
    // Optional one-off configuration for custom limits.
    config: v.optional(
      v.object({
        kind: v.literal("fixed window"),
        rate: v.number(),
        period: v.number(),
        capacity: v.optional(v.number()),
        shards: v.optional(v.number()),
        start: v.optional(v.number()),
      })
    ),
  },
  returns: v.object({
    ok: v.boolean(),
    retryAfterMs: v.union(v.number(), v.null()),
  }),
  handler: async (ctx, args) => {
    const baseOpts: { key: string; count?: number } = {
      key: args.key,
      count: args.count,
    }

    const status = args.config
      ? await rateLimiter.limit(ctx, args.name, {
          ...baseOpts,
          config: args.config as LimitConfig,
        })
      : isPresetLimitName(args.name)
        ? await rateLimiter.limit(ctx, args.name, baseOpts)
        : (() => {
            throw new Error(`Unknown rate limit name '${args.name}' without custom config`)
          })()

    // `retryAfter` is a delay in milliseconds.
    return {
      ok: status.ok,
      retryAfterMs: status.retryAfter ?? null,
    };
  },
});
