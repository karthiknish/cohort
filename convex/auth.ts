// Re-export from the new Better Auth component location
export { authComponent, createAuth, options } from "./betterAuth/auth";

import { query } from "./_generated/server";
import { authComponent } from "./betterAuth/auth";

// Example function for getting the current user
// Returns the Better Auth user object or null if not authenticated
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});

// Type exports for better TypeScript integration
// Use: import type { Session, User } from '@/convex/auth'
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { DataModel } from "./_generated/dataModel";
import { createAuth as _createAuth } from "./betterAuth/auth";

export type Auth = ReturnType<typeof _createAuth>;
export type Session = Auth["$Infer"]["Session"];
export type User = Session["user"];
