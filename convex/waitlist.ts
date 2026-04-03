import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const join = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const userId = (await getAuthUserId(ctx)) ?? undefined;

    // Don't insert duplicates
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("waitlist", {
      email,
      userId,
      createdAt: Date.now(),
    });
  },
});

export const check = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { joined: false };
    const entry = await ctx.db
      .query("waitlist")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    return { joined: !!entry };
  },
});
