import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const FREE_ASSESSMENT_LIMIT = 3;

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { count: 0 };
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return { count: usage?.count ?? 0 };
  },
});

export const increment = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const existing = await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { count: existing.count + 1 });
      return existing.count + 1;
    }
    await ctx.db.insert("usage", {
      userId,
      count: 1,
      periodStart: Date.now(),
    });
    return 1;
  },
});

export const checkLimit = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { allowed: false, count: 0, limit: FREE_ASSESSMENT_LIMIT };
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    const count = usage?.count ?? 0;
    return {
      allowed: count < FREE_ASSESSMENT_LIMIT,
      count,
      limit: FREE_ASSESSMENT_LIMIT,
    };
  },
});
