# Launchable

An AI-powered product idea validator that takes you from a vague concept to a ready-to-paste build prompt in minutes.

## What it does

1. **Assess** — Describe your idea in one sentence. Launchable runs web research via Claude to score it on demand, competition, and shippability. You get a composite score, evidence-backed analysis, and an honest verdict.
2. **Refine** — Generates a target persona and prioritized feature set. You can accept, discard, or add your own features. Each feature shows complexity (how hard to build) and user appetite (why users want it).
3. **Build** — Generates a detailed, ready-to-paste prompt tailored to your selected features and chosen tool (Claude Code, Codex, or Lovable).

Ideas can be saved, starred, searched, and revisited from the sidebar.

## Tech Stack

- **Frontend**: React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4
- **AI**: Anthropic Claude API (Sonnet for assessment with web search, Haiku for refinement/prompts)
- **Explore flow**: Groq SDK (Llama 3.3 70B) for guided idea discovery
- **Persistence**: localStorage (no backend)

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and add your keys
cp .env.example .env.local

# Start dev server
npm run dev
```

Open http://localhost:5173

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_ANTHROPIC_API_KEY` | Yes* | Anthropic API key for assessment, refinement, and build prompts |
| `VITE_GROQ_API_KEY` | Yes* | Groq API key for the Explore flow (guided idea discovery) |
| `VITE_MOCK_API` | No | Set to `true` to bypass all API calls with mock data (default: `false`) |
| `VITE_STRIPE_PRICE_ID` | No | Stripe price ID for the upgrade paywall |

*Not required when `VITE_MOCK_API=true`

### Mock Mode

Set `VITE_MOCK_API=true` in `.env.local` to run locally without any API keys. All AI calls return realistic static data with fake delays:

- Assessment: 2.5s delay, scores 8/6/9 with evidence
- Refinement: 1.5s delay, persona + 7 features
- Build prompt: 1.5s delay, detailed Claude Code prompt
- Title generation: 0.5s delay, extracted from concept

## Project Structure

```
src/
├── components/
│   ├── PageLayout.tsx          # Shared layout (top nav when logged out, sidebar when logged in)
│   └── assess/
│       ├── DimensionCard.tsx    # Score ring with expandable evidence
│       ├── MutationCard.tsx     # Pivot/niche/expand suggestion card
│       ├── BuildPromptSection.tsx
│       └── PaywallModal.tsx
├── hooks/
│   ├── useAssessIdea.ts        # Assessment pipeline (web search → Claude → scores)
│   └── useRefineIdea.ts        # Persona + feature generation
├── lib/
│   ├── auth.ts                 # Fake auth (localStorage name/initials)
│   ├── claude.ts               # Anthropic client wrapper
│   ├── constants.ts            # Build tools config, storage keys, limits
│   ├── groq.ts                 # Groq client wrapper (Explore flow)
│   ├── ideas.ts                # Save/load/delete/star ideas (localStorage)
│   ├── mock.ts                 # Mock data for all API calls
│   ├── prompts.ts              # System prompts for assess, refine, build
│   └── usage.ts                # Free assessment limit tracking
├── pages/
│   ├── LandingPage.tsx         # Two entry paths: "have idea" / "need help"
│   ├── AssessPage.tsx          # Input → loading → results with scores
│   ├── RefinePage.tsx          # Persona + feature curator
│   ├── ResultPage.tsx          # Build prompt + tool selector + save
│   ├── ExplorePage.tsx         # Guided idea discovery (Groq)
│   ├── IdeasPage.tsx           # Saved ideas grid (All / Starred)
│   ├── SearchPage.tsx          # Search across saved ideas
│   └── ResourcesPage.tsx       # Help articles and guides
├── types/
│   └── index.ts                # All TypeScript interfaces
├── App.tsx                     # Router
└── main.tsx                    # Entry point
```

## User Flow

```
Landing Page
├── "I have an idea" → Assess → Refine → Build Prompt → Save
└── "I don't know where to start" → Explore (guided questions) → Assess
```

### Logged Out
- Top nav with logo, Login button, and Get Started
- Can assess ideas but cannot save them

### Logged In
- Sidebar nav: Home, Search, Resources, All Ideas, Starred
- Avatar with initials + name at bottom
- Save and star ideas from the Build Prompt page

## Assessment Engine

The assessment uses Claude Sonnet with the `web_search` tool:

1. Claude searches the web for demand signals (forums, Reddit, keyword interest)
2. Claude searches for competitors (existing products, funding, traction)
3. Scores each dimension 1-10 with 2-3 evidence points per dimension
4. Shippability is LLM judgment only (no web search needed)
5. Composite score: `(demand × 0.4) + ((10 - competition) × 0.25) + (shippability × 0.35)`
6. Verdict: Strong (7.5+), Promising (5.5-7.4), Weak (<5.5)

## Scripts

```bash
npm run dev      # Start dev server
npm run build    # Type-check + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
```
