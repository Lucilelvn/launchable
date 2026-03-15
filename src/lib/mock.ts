import type { Assessment, Refinement, BuildPrompt } from '../types';

export const IS_MOCK = import.meta.env.VITE_MOCK_API === 'true';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function mockAssess(): Promise<Assessment> {
  await delay(2500);
  return {
    demand: {
      score: 8,
      summary: 'Strong demand signal. Multiple Reddit threads and forum posts show people actively looking for a simpler way to validate product ideas before building.',
      evidence: [
        { text: 'r/SideProject has 200k+ members regularly asking for idea validation tools', source: 'https://reddit.com/r/SideProject' },
        { text: 'Google Trends shows rising interest in "idea validation" over the past 12 months', source: 'https://trends.google.com' },
        { text: 'Multiple Indie Hackers posts asking "how do I know if my idea is worth building?"', source: 'https://indiehackers.com' },
      ],
    },
    competition: {
      score: 6,
      summary: 'Moderate competition. A few established players exist but none combine web research, scoring, and build prompt generation in one flow.',
      evidence: [
        { text: 'Validately and Javelin exist but focus on user testing, not idea scoring', source: 'https://validately.com' },
        { text: 'No direct competitor offers AI-generated build prompts as an output' },
        { text: 'Most existing tools require extensive input — surveys, interviews, landing pages' },
      ],
    },
    shippability: {
      score: 9,
      summary: 'Highly shippable. The core is a form → API call → results display. No complex backend, auth, or real-time features needed for MVP.',
      evidence: [
        { text: 'Simple React frontend with a single API integration' },
        { text: 'No database required for MVP — localStorage is sufficient' },
      ],
    },
    verdict: 'This is a solid idea with clear demand and a feasible build path. The competition exists but hasn\'t nailed the "idea to build prompt" flow. Ship fast and differentiate on speed and simplicity.',
    ai_wrapper_flag: false,
    mutations: [
      { type: 'pivot', idea: 'A tool that validates business models, not just ideas — includes revenue projections and pricing strategy', score_indication: 'Higher demand, more complex to ship' },
      { type: 'niche', idea: 'Idea validator specifically for solo developers building SaaS products on weekends', score_indication: 'Lower competition, strong niche demand' },
      { type: 'expand', idea: 'Full product studio: validate, spec, build prompt, track progress, and launch — all in one tool', score_indication: 'Much higher demand, significantly harder to ship' },
    ],
    build_tool: 'claude-code',
    build_prompt: 'Build a product idea validator web app...',
  };
}

export async function mockRefine(): Promise<Refinement> {
  await delay(1500);
  return {
    persona: {
      name: 'Alex, the Curious First-Timer',
      description: 'Alex is a 28-year-old marketing manager who watches YouTube videos about building apps but has never shipped anything. They have a notebook full of ideas but no way to know which ones are worth pursuing. They\'re intimidated by code but excited about AI coding tools.',
      pain_points: [
        'Has 10+ ideas but no framework to evaluate which one to build first',
        'Spends hours researching competitors manually before giving up',
        'Doesn\'t know what features to include in an MVP vs what to cut',
      ],
    },
    features: [
      { id: 'f1', name: 'One-sentence idea input', description: 'Simple form where users describe their idea in plain English', priority: 'must-have', complexity: 'low', user_appetite: 'First-timers are overwhelmed by lengthy forms. A single sentence removes friction.', accepted: true },
      { id: 'f2', name: 'Web-researched scoring', description: 'AI searches the web for demand signals and competitors before scoring', priority: 'must-have', complexity: 'medium', user_appetite: 'Manual competitor research takes hours and Alex usually gives up halfway.', accepted: true },
      { id: 'f3', name: 'Evidence-backed dimension cards', description: 'Show demand, competition, and shippability scores with clickable evidence', priority: 'must-have', complexity: 'medium', user_appetite: 'Alex needs to see WHY an idea scored the way it did, not just a number.', accepted: true },
      { id: 'f4', name: 'Idea mutations', description: 'Generate 3 alternative directions: pivot, niche down, or expand', priority: 'must-have', complexity: 'low', user_appetite: 'Best ideas often come from tweaking an existing concept, not starting fresh.', accepted: true },
      { id: 'f5', name: 'Persona generation', description: 'AI generates a target user persona with pain points', priority: 'nice-to-have', complexity: 'low', user_appetite: 'Helps think about who you\'re building for instead of building for everyone.', accepted: true },
      { id: 'f6', name: 'Feature curator', description: 'Interactive checklist of AI-suggested features that can be accepted or rejected', priority: 'nice-to-have', complexity: 'medium', user_appetite: 'Alex always over-scopes. A curated list with complexity ratings prevents feature creep.', accepted: true },
      { id: 'f7', name: 'Ready-to-paste build prompt', description: 'Generate a detailed prompt tailored to selected features and chosen AI tool', priority: 'must-have', complexity: 'medium', user_appetite: 'The whole point — paste into Claude Code and start building immediately.', accepted: true },
    ],
  };
}

export async function mockBuildPrompt(): Promise<BuildPrompt> {
  await delay(1500);
  return {
    tool: 'claude-code',
    reasoning: 'This app needs form handling, API integration, and multi-step state management — Claude Code handles full-stack complexity well.',
    prompt: `Build a product idea validator called "Launchable" with the following specs:

## What it does
A web app that takes a one-sentence product idea, researches the market using web search, scores it on demand/competition/shippability, and generates a ready-to-paste build prompt for AI coding tools.

## Core Features
- One-sentence idea input form with optional audience and timeline fields
- AI-powered assessment with web research (demand signals, competitor analysis)
- Three dimension cards showing scores with expandable evidence
- Composite "Launchability" score (1-10) with verdict (Strong/Promising/Weak)
- Three idea mutations: pivot, niche, and expand alternatives
- Target persona generation with pain points
- Interactive feature curator with complexity and user appetite indicators
- Build prompt generation tailored to selected features
- Multi-tool selector (Claude Code, Codex, Lovable)
- Save ideas to local storage with star/unstar

## Tech Stack
- React 19 + TypeScript + Vite
- Tailwind CSS for styling
- Anthropic Claude API for assessments and refinement
- localStorage for persistence (no backend needed)

## Pages
1. Landing — two entry paths (have idea / need help finding one)
2. Assess — input form → loading animation → results with scores
3. Refine — persona card + feature checklist with accept/reject
4. Result — build prompt with copy button + tool selector
5. Ideas — saved ideas grid with star, search, and filter
6. Search — instant filter across all saved ideas
7. Resources — help articles and guides`,
  };
}

export async function mockGenerateTitle(concept: string): Promise<string> {
  await delay(500);
  const words = concept.split(/\s+/);
  if (words.length <= 5) return concept;
  const skip = new Set(['a', 'an', 'the', 'for', 'to', 'of', 'in', 'on', 'is', 'it', 'and', 'or', 'that', 'who', 'with', 'by', 'from']);
  const key = words.filter((w) => !skip.has(w.toLowerCase())).slice(0, 4);
  return key.join(' ').replace(/[.,;:!?]$/, '') || words.slice(0, 4).join(' ');
}
