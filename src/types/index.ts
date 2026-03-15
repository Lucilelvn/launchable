export interface IdeaInput {
  concept: string;
  audience?: string;
  timeline?: string;
}

export interface EvidencePoint {
  text: string;
  source?: string;
}

export interface DimensionScore {
  score: number;
  summary: string;
  evidence: EvidencePoint[];
}

export interface Assessment {
  demand: DimensionScore;
  competition: DimensionScore;
  shippability: DimensionScore;
  verdict: string;
  ai_wrapper_flag: boolean;
  ai_wrapper_explanation?: string;
  mutations: AssessmentMutation[];
  build_tool: string;
  build_prompt: string;
  web_research?: WebResearchResults;
}

export interface AssessmentMutation {
  type: 'pivot' | 'niche' | 'expand';
  idea: string;
  score_indication?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebResearchResults {
  demand: SearchResult[];
  competition: SearchResult[];
}

/** @deprecated Use Assessment instead — kept for explore flow compatibility */
export interface LegacyAssessment {
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

export interface Persona {
  name: string;
  description: string;
  pain_points: string[];
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  priority: 'must-have' | 'nice-to-have';
  complexity: 'low' | 'medium' | 'high';
  user_appetite: string;
  accepted: boolean;
}

export interface Refinement {
  persona: Persona;
  features: Feature[];
}

export interface BuildPrompt {
  tool: 'claude-code' | 'lovable' | 'bolt' | 'replit';
  prompt: string;
  reasoning: string;
}

export interface SavedIdea {
  id: string;
  title?: string;
  concept: string;
  audience?: string;
  score: number;
  verdict: string;
  demand: number;
  competition: number;
  shippability: number;
  persona?: Persona;
  features?: Feature[];
  buildPrompt?: string;
  buildTool?: string;
  starred?: boolean;
  savedAt: string;
}

export interface ExploreMessage {
  role: 'assistant' | 'user';
  content: string;
}

export type EntryPath = 'explore' | 'assess';
