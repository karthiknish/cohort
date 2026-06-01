import { RateLimiter } from "@convex-dev/rate-limiter";
import { components } from '/_generated/api';
import { CONVEX_RATE_LIMITER_PRESETS } from "../../../src/lib/rate-limiter";

export const rateLimiter = new RateLimiter(components.rateLimiter, CONVEX_RATE_LIMITER_PRESETS);
