import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Fetch a context by its public slug (used on /c/[slug] page).
 * No auth required — slug is the access key.
 */
export const getContextBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contexts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

/**
 * Fetch the most recent contexts for the authenticated user.
 */
export const getRecentContexts = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const results = await ctx.db
      .query("contexts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 10);

    return results;
  },
});

/**
 * Count total contexts for the authenticated user.
 */
export const getContextCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;

    const results = await ctx.db
      .query("contexts")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return results.length;
  },
});

/**
 * Save a new extracted context to the database.
 */
export const createContext = mutation({
  args: {
    sourcePlatform: v.string(),
    structuredContext: v.any(),
    originalUrl: v.optional(v.string()),
    rawContent: v.optional(v.string()),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const id = await ctx.db.insert("contexts", {
      userId,
      sourcePlatform: args.sourcePlatform,
      structuredContext: args.structuredContext,
      originalUrl: args.originalUrl,
      rawContent: args.rawContent,
      slug: args.slug,
    });

    return id;
  },
});
