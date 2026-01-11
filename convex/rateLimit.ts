import { RateLimiter, MINUTE } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  // Mirrors the presets in src/lib/rate-limiter.ts
  standard: { kind: "fixed window", rate: 100, period: MINUTE },
  sensitive: { kind: "fixed window", rate: 10, period: MINUTE },
  critical: { kind: "fixed window", rate: 3, period: MINUTE },
  bulk: { kind: "fixed window", rate: 20, period: MINUTE },
});
