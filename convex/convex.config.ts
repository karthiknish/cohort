import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config.js";
import r2 from "@convex-dev/r2/convex.config.js";
import presence from "@convex-dev/presence/convex.config.js";

const app = defineApp();

app.use(betterAuth);
app.use(rateLimiter);
app.use(r2);
app.use(presence);

export default app;
