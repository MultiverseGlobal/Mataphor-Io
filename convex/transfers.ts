import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Log a transfer event (called by platforms after injecting a context).
 */
export const logTransfer = mutation({
  args: {
    contextId: v.id("contexts"),
    sourcePlatform: v.string(),
    targetPlatform: v.string(),
    transferTimeMs: v.optional(v.float64()),
    manualFixesRequired: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthenticated");

    return await ctx.db.insert("transfers", {
      userId,
      contextId: args.contextId,
      sourcePlatform: args.sourcePlatform,
      targetPlatform: args.targetPlatform,
      transferTimeMs: args.transferTimeMs,
      manualFixesRequired: args.manualFixesRequired,
    });
  },
});

/**
 * Get all transfers for the authenticated user, most recent first.
 */
export const getTransfers = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("transfers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

/**
 * Aggregate stats for the dashboard metric cards.
 */
export const getTransferStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const transfers = await ctx.db
      .query("transfers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    if (transfers.length === 0) {
      return {
        total: 0,
        avgTransferMs: 0,
        manualFixRate: 0,
        platformBreakdown: {} as Record<string, number>,
        recentActivity: [] as { date: string; count: number }[],
      };
    }

    // Average transfer time
    const timed = transfers.filter((t) => t.transferTimeMs != null);
    const avgTransferMs =
      timed.length > 0
        ? timed.reduce((sum, t) => sum + (t.transferTimeMs ?? 0), 0) / timed.length
        : 0;

    // Manual fix rate
    const manualFixRate =
      transfers.filter((t) => t.manualFixesRequired).length / transfers.length;

    // Platform breakdown (target platforms)
    const platformBreakdown: Record<string, number> = {};
    for (const t of transfers) {
      platformBreakdown[t.targetPlatform] =
        (platformBreakdown[t.targetPlatform] ?? 0) + 1;
    }

    // Last 7 days activity for sparkline
    const now = Date.now();
    const days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = now - i * 86400000;
      const dayEnd = dayStart + 86400000;
      const count = transfers.filter(
        (t) => t._creationTime >= dayStart && t._creationTime < dayEnd
      ).length;
      days.push({
        date: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
        count,
      });
    }

    return {
      total: transfers.length,
      avgTransferMs: Math.round(avgTransferMs),
      manualFixRate: Math.round(manualFixRate * 100),
      platformBreakdown,
      recentActivity: days,
    };
  },
});

export const createTransfer = mutation({
  args: {
    userId: v.id("users"),
    contextId: v.id("contexts"),
    sourcePlatform: v.string(),
    targetPlatform: v.string(),
    transferTimeMs: v.optional(v.float64()),
    manualFixesRequired: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("transfers", {
      userId: args.userId,
      contextId: args.contextId,
      sourcePlatform: args.sourcePlatform,
      targetPlatform: args.targetPlatform,
      transferTimeMs: args.transferTimeMs,
      manualFixesRequired: args.manualFixesRequired,
    });
  },
});
