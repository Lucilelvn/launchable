import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const evidencePoint = v.object({
  text: v.string(),
  source: v.optional(v.string()),
});

const dimensionScore = v.object({
  score: v.number(),
  summary: v.string(),
  evidence: v.array(evidencePoint),
});

const mutation = v.object({
  type: v.union(v.literal("pivot"), v.literal("niche"), v.literal("expand")),
  idea: v.string(),
  score_indication: v.optional(v.string()),
});

const persona = v.object({
  name: v.string(),
  description: v.string(),
  pain_points: v.array(v.string()),
});

const feature = v.object({
  id: v.string(),
  name: v.string(),
  description: v.string(),
  priority: v.union(v.literal("must-have"), v.literal("nice-to-have")),
  complexity: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  user_appetite: v.string(),
  accepted: v.boolean(),
});

export default defineSchema({
  ...authTables,

  ideas: defineTable({
    userId: v.id("users"),
    title: v.optional(v.string()),
    concept: v.string(),
    audience: v.optional(v.string()),
    score: v.number(),
    verdict: v.string(),
    demand: dimensionScore,
    competition: dimensionScore,
    shippability: dimensionScore,
    mutations: v.optional(v.array(mutation)),
    persona: v.optional(persona),
    features: v.optional(v.array(feature)),
    buildPrompt: v.optional(v.string()),
    buildTool: v.optional(v.string()),
    starred: v.boolean(),
    deleted: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_starred", ["userId", "starred"])
    .searchIndex("search_ideas", {
      searchField: "concept",
      filterFields: ["userId", "deleted"],
    }),

  usage: defineTable({
    userId: v.id("users"),
    count: v.number(),
    periodStart: v.number(),
  }).index("by_user", ["userId"]),

  waitlist: defineTable({
    email: v.string(),
    userId: v.optional(v.id("users")),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_user", ["userId"]),
});
