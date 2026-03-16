# Launchable MVP

## Overview
Launchable is an AI-powered product idea validator that takes users from a vague concept to a scored assessment, refined feature set, and ready-to-paste build prompt. The MVP ships the core assess-refine-build loop with Google authentication, persistent storage via Convex, and deployment to production.

## Success Criteria
- [ ] Users can sign up / log in with Google and have their data persist across devices
- [ ] Core flow (Assess → Refine → Build Prompt) works end-to-end with real AI
- [ ] Saved ideas, usage counts, and premium status are stored server-side
- [ ] Free tier (3 assessments) enforced server-side
- [ ] Deployed to production at join-launchable.com

## Phase 1: Auth & User Management
Replace fake localStorage auth with Convex + Google OAuth. Users can sign in, sign out, and have a persistent identity.

### Screens
| Screen | Route | Purpose |
|--------|-------|---------|
| Login | `/login` | Google OAuth sign-in button + redirect |
| Callback | `/auth/callback` | Handle OAuth redirect |
| Landing | `/` | Show user avatar/name when logged in, sign-in CTA when not |
| Layout | all routes | Replace fake auth in sidebar/nav with real session state |

### Dependencies
- Convex project (free tier)
- Google Cloud OAuth credentials (client ID + secret)
- Convex Auth configured with Google provider

### Constraints
- Auth state must be reactive (sidebar updates on login/logout without refresh)
- Existing localStorage user data should not break (graceful migration)
- Session management handled by Convex Auth SDK

## Phase 2: Data Persistence
Migrate localStorage data to Convex. Ideas, usage, and premium status become server-side.

### Schema (Convex Tables)
| Table | Operations | Purpose |
|-------|-----------|---------|
| `users` | auto-create on signup | User profile (name, avatar_url, plan, created_at) |
| `ideas` | create, list, update, delete | Saved ideas with full assessment/refinement data |
| `usage` | get, increment | Assessment count per user per billing period |

### Dependencies
- Phase 1 (auth must work first)
- Convex schema + query/mutation functions

### Constraints
- All queries scoped to authenticated user (Convex identity checks in every function)
- Usage count enforced server-side via Convex mutations (not bypassable from client)
- Idea schema matches existing `SavedIdea` TypeScript interface
- Starred, deleted (soft), and search must work against Convex

## Phase 3: Core AI Flow
The assess → refine → build prompt loop. Already built client-side. This phase moves API keys server-side and hardens for production.

### Screens
| Screen | Route | Purpose |
|--------|-------|---------|
| Assess | `/assess` | Input idea → AI research → scored results with evidence |
| Refine | `/refine` | Persona generation + feature curation (accept/reject/add) |
| Result | `/result` | Build prompt generation + tool selector + copy + save |

### Convex Actions
| Action | Purpose |
|--------|---------|
| `ai:assess` | Calls Claude Sonnet with web_search, returns Assessment JSON |
| `ai:refine` | Calls Claude Sonnet, returns Refinement JSON (persona + features) |
| `ai:buildPrompt` | Calls Claude Haiku, returns BuildPrompt JSON |
| `ai:generateTitle` | Calls Claude Haiku, returns short title string |
| `ai:generateConcept` | Calls Groq Llama, returns concept JSON (for Explore) |

### Dependencies
- Phase 2 (ideas must save to Convex)
- Anthropic API key (stored as Convex environment variable)
- Groq API key (stored as Convex environment variable)

### Constraints
- API keys live only in Convex environment variables — never in browser
- Convex actions are the server-side proxy (no separate backend needed)
- Assessment must use web_search tool for evidence-backed scoring
- Free tier: 3 assessments per user, enforced via `usage` table before AI call
- Re-assessment with mutations/custom tweak must preserve delta tracking

## Phase 4: Explore Flow
Guided idea discovery for users who don't have an idea yet. Already built, needs server-side API key protection.

### Screens
| Screen | Route | Purpose |
|--------|-------|---------|
| Explore | `/explore` | 3-step pill tree → concept generation → auto-navigate to Assess |

### Dependencies
- Phase 3 (assess must work for the handoff, `ai:generateConcept` action)

### Constraints
- Concept generation routed through Convex action (no API keys in browser)

## Phase 5: Billing & Premium
Deferred — monetization model still being refined. Placeholder phase for when Stripe is ready.

### Screens
| Screen | Route | Purpose |
|--------|-------|---------|
| Paywall modal | `/assess` (modal) | Shows when free limit reached, CTA to upgrade |
| Success callback | `/assess?upgraded=true` | Post-payment redirect, update user plan |

### Dependencies
- Phase 2 (users table with `plan` field)
- Stripe account + product/price (TBD)

### Constraints
- Premium status verified server-side via Stripe webhook → Convex mutation
- Client reads plan from user profile, not localStorage
- Not blocking MVP launch — free tier works without Stripe

## Phase 6: Ideas & Search
Saved ideas management. Already built against localStorage, needs migration to Convex queries.

### Screens
| Screen | Route | Purpose |
|--------|-------|---------|
| Ideas | `/ideas` | Grid of saved ideas with expand/star/delete |
| Starred | `/ideas/starred` | Filtered view of starred ideas only |
| Search | `/search` | Live search across all saved ideas |

### Dependencies
- Phase 2 (ideas table)

### Constraints
- Search uses Convex full-text search index
- Delete is soft-delete (flag, not remove)
- Star/unstar is a field toggle via Convex mutation
- Idea cards load via reactive Convex query (real-time updates)

## Phase 7: Deployment & CI/CD
Ship to production.

### Deliverables
| Item | Purpose |
|------|---------|
| Vercel deployment | Production hosting with preview deploys |
| GitHub Actions CI | Lint + typecheck on PR |
| Convex production deployment | Production Convex backend |
| Environment variables | API keys in Convex env, Vercel env for frontend |
| Custom domain | `join-launchable.com` |

### Dependencies
- All previous phases
- Domain DNS configured
- Vercel account

### Constraints
- Preview deploys for PRs
- Convex has separate dev/prod deployments
- Build must pass `tsc --noEmit` and `eslint` with zero errors

---

## Technical Decisions

- **Database**: Convex (real-time, managed, TypeScript-native schema + functions)
- **Auth**: Convex Auth with Google OAuth provider
- **API Key Protection**: Convex actions as server-side proxy for Anthropic/Groq calls — no separate backend needed
- **Hosting**: Vercel (optimized for Vite/React, preview deploys)
- **Payments**: Stripe (deferred — monetization model TBD)
- **Domain**: join-launchable.com
- **Local Dev**: Keep `VITE_LOCAL_LLM` mode for zero-cost development via Claude CLI proxy

## Open Questions

- [x] ~~Database~~ — Convex (Lucile creating account)
- [x] ~~Google OAuth~~ — needs Google Cloud project setup
- [x] ~~Domain~~ — join-launchable.com
- [x] ~~API key proxy~~ — Convex actions (server-side functions, no separate backend)
- [x] ~~Email capture~~ — deferred, not in MVP scope
- [ ] Stripe: account + pricing model — deferred, not blocking MVP
- [ ] Google Cloud: Lucile to create project + OAuth credentials and share client ID
- [ ] Convex: Lucile to create account and share project details
