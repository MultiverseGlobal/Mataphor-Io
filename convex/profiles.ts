import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// --- Queries ---

/**
 * Returns the authenticated user's active Context Profile.
 * Creates a default one if none exists yet.
 */
export const getActiveProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .first();

    return profile ?? null;
  },
});

/**
 * Returns a specific profile by its Convex document ID.
 * Only accessible by the owning user.
 */
export const getProfileById = query({
  args: { id: v.id("profiles") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db.get(args.id);
    if (!profile || profile.userId !== userId) return null;

    return profile;
  },
});

// --- Mutations ---

const emptyLayers = {
  identity: { name: "", role: "", bio: "", organization: "" },
  mission: { goals: [], currentProject: "", successCriteria: "" },
  projects: { activeItems: [], priorities: [], timeline: "" },
  preferences: { communicationStyle: "", tone: "", format: "" },
  memory: { keyFacts: [], decisions: [], staticGuidelines: "" },
  org: { companyContext: "", brandVoice: "" },
};

/**
 * Creates the initial default profile for a new user.
 * Safe to call multiple times — no-ops if one already exists.
 */
export const createDefaultProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    const id = await ctx.db.insert("profiles", {
      userId,
      name: "Default Profile",
      isActive: true,
      version: 1,
      ...emptyLayers,
    });

    return id;
  },
});

/**
 * Updates the active profile for the authenticated user.
 * Accepts partial layer updates and auto-increments version.
 */
export const updateProfile = mutation({
  args: {
    name: v.optional(v.string()),
    identity: v.optional(v.any()),
    mission: v.optional(v.any()),
    projects: v.optional(v.any()),
    preferences: v.optional(v.any()),
    memory: v.optional(v.any()),
    org: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", userId).eq("isActive", true)
      )
      .first();

    if (!profile) {
      // Auto-create if missing, then patch
      const id = await ctx.db.insert("profiles", {
        userId,
        name: args.name ?? "Default Profile",
        isActive: true,
        version: 1,
        identity: args.identity ?? emptyLayers.identity,
        mission: args.mission ?? emptyLayers.mission,
        projects: args.projects ?? emptyLayers.projects,
        preferences: args.preferences ?? emptyLayers.preferences,
        memory: args.memory ?? emptyLayers.memory,
        org: args.org ?? emptyLayers.org,
      });
      return id;
    }

    // Deep-merge layers with incoming updates
    const patch: Record<string, any> = {
      version: profile.version + 1,
    };

    if (args.name !== undefined) patch.name = args.name;

    const layerKeys = ["identity", "mission", "projects", "preferences", "memory", "org"] as const;
    for (const key of layerKeys) {
      if (args[key] !== undefined) {
        patch[key] = { ...(profile[key] as object), ...(args[key] as object) };
      }
    }

    await ctx.db.patch(profile._id, patch);
    return profile._id;
  },
});

export const getActiveProfileByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("profiles")
      .withIndex("by_user_active", (q) =>
        q.eq("userId", args.userId).eq("isActive", true)
      )
      .first();
  },
});
