import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
    return ideas.filter((i) => !i.deleted);
  },
});

export const listStarred = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user_starred", (q) =>
        q.eq("userId", userId).eq("starred", true),
      )
      .order("desc")
      .collect();
    return ideas.filter((i) => !i.deleted);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, { query: searchQuery }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    if (!searchQuery.trim()) return [];
    const results = await ctx.db
      .query("ideas")
      .withSearchIndex("search_ideas", (q) =>
        q.search("concept", searchQuery).eq("userId", userId).eq("deleted", false),
      )
      .collect();
    return results;
  },
});

export const save = mutation({
  args: {
    title: v.optional(v.string()),
    concept: v.string(),
    audience: v.optional(v.string()),
    score: v.number(),
    verdict: v.string(),
    demand: v.object({
      score: v.number(),
      summary: v.string(),
      evidence: v.array(v.object({ text: v.string(), source: v.optional(v.string()) })),
    }),
    competition: v.object({
      score: v.number(),
      summary: v.string(),
      evidence: v.array(v.object({ text: v.string(), source: v.optional(v.string()) })),
    }),
    shippability: v.object({
      score: v.number(),
      summary: v.string(),
      evidence: v.array(v.object({ text: v.string(), source: v.optional(v.string()) })),
    }),
    mutations: v.optional(v.array(v.object({
      type: v.union(v.literal("pivot"), v.literal("niche"), v.literal("expand")),
      idea: v.string(),
      score_indication: v.optional(v.string()),
    }))),
    persona: v.optional(v.object({
      name: v.string(),
      description: v.string(),
      pain_points: v.array(v.string()),
    })),
    features: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      priority: v.union(v.literal("must-have"), v.literal("nice-to-have")),
      complexity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
      user_appetite: v.string(),
      accepted: v.boolean(),
    }))),
    buildPrompt: v.optional(v.string()),
    buildTool: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("ideas", {
      ...args,
      userId,
      starred: false,
      deleted: false,
      createdAt: Date.now(),
    });
  },
});

export const toggleStar = mutation({
  args: { id: v.id("ideas") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const idea = await ctx.db.get(id);
    if (!idea || idea.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { starred: !idea.starred });
  },
});

export const remove = mutation({
  args: { id: v.id("ideas") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const idea = await ctx.db.get(id);
    if (!idea || idea.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(id, { deleted: true });
  },
});
