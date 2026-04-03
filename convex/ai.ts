"use node";

import Anthropic from "@anthropic-ai/sdk";
import Groq from "groq-sdk";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import {
  ASSESS_SYSTEM_PROMPT,
  REFINE_SYSTEM_PROMPT,
  BUILD_PROMPT_SYSTEM,
  CONCEPT_PROMPT,
} from "./prompts";

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY environment variable");
  return new Anthropic({ apiKey });
}

function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY environment variable");
  return new Groq({ apiKey });
}

function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No valid JSON found in AI response");
  // Validate it parses
  JSON.parse(match[0]);
  return match[0];
}

// ---------- assess ----------

export const assess = action({
  args: {
    concept: v.string(),
    audience: v.optional(v.string()),
    timeline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check usage limit server-side
    const { allowed } = await ctx.runQuery(api.usage.checkLimit);
    if (!allowed) throw new Error("Free assessment limit reached");

    const parts = [`Idea: ${args.concept}`];
    if (args.audience) parts.push(`Target audience: ${args.audience}`);
    if (args.timeline) parts.push(`Timeline: ${args.timeline}`);
    const userMessage = parts.join("\n");

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: ASSESS_SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305" as const, name: "web_search", max_uses: 5 }],
      messages: [{ role: "user", content: userMessage }],
    });

    // Find the last text block (after web search tool use)
    const textBlocks = response.content.filter((b: { type: string }) => b.type === "text");
    const lastText = textBlocks[textBlocks.length - 1];
    const text = lastText && "text" in lastText ? (lastText as { text: string }).text : "";

    const json = extractJSON(text);

    // Increment usage after successful assessment
    await ctx.runMutation(api.usage.increment);

    return JSON.parse(json);
  },
});

// ---------- refine ----------

export const refine = action({
  args: {
    concept: v.string(),
    audience: v.optional(v.string()),
    verdict: v.string(),
    demandScore: v.number(),
    demandSummary: v.string(),
    competitionScore: v.number(),
    competitionSummary: v.string(),
    shippabilityScore: v.number(),
    shippabilitySummary: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const parts = [
      `Idea: ${args.concept}`,
      `Verdict: ${args.verdict}`,
      `Demand: ${args.demandScore}/10 \u2014 ${args.demandSummary}`,
      `Competition: ${args.competitionScore}/10 \u2014 ${args.competitionSummary}`,
      `Shippability: ${args.shippabilityScore}/10 \u2014 ${args.shippabilitySummary}`,
    ];
    if (args.audience) parts.push(`Target audience: ${args.audience}`);

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: REFINE_SYSTEM_PROMPT,
      messages: [{ role: "user", content: parts.join("\n") }],
    });

    const textBlock = response.content.find((b: { type: string }) => b.type === "text");
    const text = textBlock && "text" in textBlock ? (textBlock as { text: string }).text : "";

    const json = extractJSON(text);
    const parsed = JSON.parse(json);
    // Mark all features as accepted by default
    parsed.features = parsed.features.map((f: Record<string, unknown>) => ({ ...f, accepted: true }));

    return parsed;
  },
});

// ---------- buildPrompt ----------

export const buildPrompt = action({
  args: {
    concept: v.string(),
    audience: v.optional(v.string()),
    personaName: v.string(),
    personaDescription: v.string(),
    personaPainPoints: v.array(v.string()),
    features: v.array(v.object({
      name: v.string(),
      description: v.string(),
      priority: v.string(),
    })),
    demandScore: v.number(),
    competitionScore: v.number(),
    shippabilityScore: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const featureList = args.features
      .map((f) => `- ${f.name}: ${f.description}${f.priority === "must-have" ? " [MUST-HAVE]" : " [NICE-TO-HAVE]"}`)
      .join("\n");

    const userMessage = [
      `Idea: ${args.concept}`,
      args.audience ? `Audience: ${args.audience}` : null,
      `\nTarget Persona: ${args.personaName}`,
      args.personaDescription,
      `Pain points: ${args.personaPainPoints.join("; ")}`,
      `\nAccepted Features:\n${featureList}`,
      `\nAssessment: Demand ${args.demandScore}/10, Competition ${args.competitionScore}/10, Shippability ${args.shippabilityScore}/10`,
    ].filter(Boolean).join("\n");

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: BUILD_PROMPT_SYSTEM,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((b: { type: string }) => b.type === "text");
    const text = textBlock && "text" in textBlock ? (textBlock as { text: string }).text : "";

    return JSON.parse(extractJSON(text));
  },
});

// ---------- generateTitle ----------

export const generateTitle = action({
  args: { concept: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 30,
      messages: [{
        role: "user",
        content: `Summarize this product idea into exactly 3-5 words as a short catchy title. No quotes, no punctuation, no explanation \u2014 just the title.\n\nIdea: ${args.concept}`,
      }],
    });

    const block = response.content.find((b: { type: string }) => b.type === "text");
    return block && "text" in block ? (block as { text: string }).text.trim() : args.concept.split(/\s+/).slice(0, 5).join(" ");
  },
});

// ---------- generateConcept (Explore flow) ----------

export const generateConcept = action({
  args: {
    branch: v.string(),
    role: v.string(),
    method: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const userInput = `Branch: ${args.branch}\nRole/interest: ${args.role}\nCurrent method: ${args.method}`;

    const client = getGroqClient();
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 100,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: CONCEPT_PROMPT },
        { role: "user", content: userInput },
      ],
    });

    const text = response.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(text) as { concept: string };
    return parsed;
  },
});
