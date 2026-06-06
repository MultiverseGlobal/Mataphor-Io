import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  // Auth tables required by @convex-dev/auth
  ...authTables,

  // 6-layer Context Profile — the atomic unit of Metaphor IO
  profiles: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isActive: v.boolean(),
    version: v.float64(),
    // 6 context layers stored as flexible JSON objects
    identity: v.any(),    // Who you are
    mission: v.any(),     // What you're doing
    projects: v.any(),    // What's active right now
    preferences: v.any(), // How you work
    memory: v.any(),      // What shouldn't disappear
    org: v.any(),         // Company/team context
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  // Legacy context captures (kept for backward compatibility)
  contexts: defineTable({
    userId: v.id("users"),
    sourcePlatform: v.string(),
    structuredContext: v.any(),
    originalUrl: v.optional(v.string()),
    rawContent: v.optional(v.string()),
    slug: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_slug", ["slug"]),

  // Transfer event tracking
  transfers: defineTable({
    contextId: v.id("contexts"),
    userId: v.id("users"),
    sourcePlatform: v.string(),
    targetPlatform: v.string(),
    transferTimeMs: v.optional(v.float64()),
    manualFixesRequired: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_context", ["contextId"]),

  // Developer API Keys
  apiKeys: defineTable({
    userId: v.id("users"),
    key: v.string(), // The actual hashed or raw token (for demo we can store simple token)
    name: v.string(), // "Linear Production", etc.
    lastUsed: v.optional(v.float64()),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_key", ["key"]),
});
