export interface IdeaInput {
  concept: string;
}

export interface Assessment {
  demand: number;
  competition: number;
  shippability: number;
  summary: string;
  mutations: Mutation[];
}

export interface Mutation {
  label: string;
  type: 'pivot' | 'niche' | 'expand';
  description: string;
}

export interface BuildPrompt {
  tool: 'claude-code' | 'lovable' | 'bolt' | 'replit';
  prompt: string;
  reasoning: string;
}

export interface ExploreMessage {
  role: 'assistant' | 'user';
  content: string;
}

export type EntryPath = 'explore' | 'assess';
