# Launchable — Product Overview

## What Is It

Launchable is an AI-powered product idea validator. It takes users from a vague product concept to a ready-to-paste build prompt in minutes, using real web research to score ideas honestly.

## Tech Stack

- **Frontend:** React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4, React Router 7
- **AI (Assessment):** Anthropic Claude Sonnet + web_search tool
- **AI (Explore):** Groq Llama 3.3 70B
- **AI (Build Prompt):** Anthropic Claude Haiku
- **Persistence:** localStorage (no backend)
- **Auth:** Fake (name input only, localStorage)
- **Payments:** Stripe checkout link (not fully wired)

## Core User Flow

```
Landing Page
├── "I have an idea" ─────────────────────────┐
│                                              ▼
└── "I don't know" → Explore (3-step tree) → Assess
                                               │
                     ┌─────────────────────────┘
                     ▼
              Results (scores + mutations)
                     │
            ┌────────┴────────┐
            ▼                 ▼
     Re-assess with      Refine & Build
     mutations/tweak          │
                              ▼
                     Persona + Features
                     (accept/reject/add)
                              │
                              ▼
                     Build Prompt + Save
                     (copy → Claude Code / Lovable / etc.)
```

## Pages (8)

| Page | Route | Status | Purpose |
|------|-------|--------|---------|
| Landing | `/` | Complete | Two entry paths: "have idea" or "explore" |
| Explore | `/explore` | Complete | 3-step guided idea discovery via chat pills |
| Assess | `/assess` | Complete | Idea input → AI research → scored results |
| Refine | `/refine` | Complete | Persona generation + feature curation |
| Result | `/result` | Complete | Build prompt + tool selector + save |
| Ideas | `/ideas` | Complete | Saved ideas grid with star/delete/expand |
| Search | `/search` | Complete | Live search across all saved ideas |
| Resources | `/resources` | Complete | 4 static help articles |

## What's Built and Working

### Assessment Engine
- Form: concept (required), audience (optional), timeline (optional)
- Claude Sonnet with web_search (up to 5 searches per request)
- Scores demand (0-10), competition (0-10), shippability (0-10)
- Composite "Launchability" score with verdict (Strong/Promising/Weak)
- Each dimension has 2-3 evidence points with source links
- AI wrapper detection flag
- 3 mutations generated: Pivot, Niche, Expand

### Re-Assessment
- Multi-select mutations (combine directions)
- Custom tweak textarea (user's own direction)
- Delta badges on dimension cards showing score changes
- Composite score delta in hero

### Guided Explore
- 3-step pill-based decision tree (job/hobby → role → current method)
- "Other..." free-text option at each step
- Groq Llama generates product concept from answers
- Optional email capture (stored in localStorage)
- Auto-navigates to Assess with concept pre-filled

### Refinement
- Persona card: name, description, 3 pain points
- 5-8 AI-generated features with priority/complexity/user appetite
- Accept/reject individual features
- Add custom features
- Delete features
- Must-have vs nice-to-have distinction

### Build Prompt
- Claude Haiku generates detailed, tool-aware build prompt
- Tool selector: Claude Code, Codex, Lovable, Bolt, Replit
- Copy to clipboard
- Direct "Open in [Tool]" link
- Save idea with auto-generated title

### Ideas Management
- Grid view with expandable cards
- Score badge (color-coded), concept, verdict, persona/feature counts
- Star/unstar, copy prompt, delete
- Starred filter view
- Live search across all fields

### Auth & Billing (Stubs)
- Fake login: name input → localStorage
- Sidebar nav when logged in, top nav when logged out
- Free tier: 3 assessments (waived on localhost)
- Paywall modal with Stripe redirect (price ID not configured)
- Premium flag in localStorage (not server-verified)

### Dev Modes
- `VITE_MOCK_API=true` — hardcoded responses, no API calls
- `VITE_LOCAL_LLM=true` — routes to local Claude CLI via dev proxy (zero API cost)
- Default — real Anthropic + Groq API calls

## File Structure

```
src/
├── pages/           8 page components
├── components/
│   ├── PageLayout   Shared layout (sidebar + top nav)
│   ├── assess/      DimensionCard, MutationCard, PaywallModal, BuildPromptSection
│   └── explore/     ChatInput, ChatMessage
├── hooks/           useAssessIdea, useRefineIdea
├── lib/             auth, claude, groq, local-llm, mock, prompts, ideas, usage, constants
└── types/           All TypeScript interfaces
server/
└── dev-proxy.mjs    Local Claude CLI proxy
```

## What's NOT Built

- Real authentication (Google OAuth, sessions, tokens)
- Backend / database (all data in localStorage)
- Server-side payment verification
- Analytics / event tracking
- Email delivery (leads stored locally, never sent)
- CI/CD / deployment pipeline
- Rate limiting / abuse prevention
- Multi-device sync
- Sharing / collaboration
