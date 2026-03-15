import { useState } from 'react';
import { ArrowLeft, BookOpen, Rocket, Lightbulb, Zap, Target } from 'lucide-react';
import PageLayout from '../components/PageLayout';

interface Article {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'guides' | 'tips';
  icon: typeof BookOpen;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: 'what-is-launchable',
    title: 'What is Launchable?',
    description: 'An overview of what Launchable does and how it helps you go from idea to build prompt.',
    category: 'getting-started',
    icon: Rocket,
    content: [
      'Launchable is an AI-powered idea validator that helps you go from a vague concept to a ready-to-build product spec in minutes.',
      'Here\'s how it works:',
      '1. **Assess** — Describe your idea in one sentence. Launchable runs web research to score it on demand, competition, and shippability. You get a composite score, evidence-backed analysis, and an honest verdict.',
      '2. **Refine** — Launchable generates a target persona and a prioritized feature set based on your assessment. You can accept, discard, or add your own features. Each feature shows complexity (how hard to build) and user appetite (why users want it).',
      '3. **Build** — Once you\'ve curated your features, Launchable generates a detailed, ready-to-paste prompt tailored to your chosen tool — Claude Code, Codex, or Lovable. Copy it, paste it, and start building.',
      'Every idea you assess can be saved, starred, and revisited later. Think of Launchable as your product co-pilot — it doesn\'t build the product for you, but it makes sure you\'re building the right thing.',
    ],
  },
  {
    id: 'how-to-assess',
    title: 'How to Assess an Idea',
    description: 'Step-by-step guide to getting the most out of the assessment engine.',
    category: 'getting-started',
    icon: Target,
    content: [
      'Getting a useful assessment starts with how you describe your idea. Here are some tips:',
      '**Be specific, not generic.** "An app for freelancers" is too vague. "A tool that helps freelance designers track unpaid invoices and send automatic payment reminders" gives the AI much more to work with.',
      '**Add your audience.** The "Who is this for?" field is optional but powerful. It helps the AI generate a more accurate persona and tailor the feature set. "Freelance designers with 5-15 clients" is better than "freelancers".',
      '**Don\'t worry about the timeline.** This is mostly for your own reference. The assessment engine doesn\'t weight it heavily.',
      '**Read the evidence.** Each dimension card (Demand, Competition, Shippability) has an expandable evidence section. Click "Show evidence" to see what the AI actually found during its web research. This is where the real value is — it\'s not just a score, it\'s grounded in real data.',
      '**Try the mutations.** Even if your idea scores well, look at the three mutations (Pivot, Niche, Expand). They\'re often better than the original. You can re-assess any mutation with one click.',
    ],
  },
  {
    id: 'adding-products',
    title: 'How to Add and Manage Products',
    description: 'Learn how to save ideas, star your favorites, and build your product pipeline.',
    category: 'guides',
    icon: Lightbulb,
    content: [
      'Every idea you take through the full flow (Assess → Refine → Build Prompt) can be saved to your idea library.',
      '**Saving an idea:** On the Build Prompt page, click the "Save idea" button in the top nav. This saves a snapshot of everything — your scores, persona, accepted features, and the generated build prompt.',
      '**Finding your ideas:** Click "All Ideas" in the sidebar to see every saved idea. Each card shows the composite score, dimension breakdown, persona, and feature count. Click a card to expand it and see the full verdict, features list, and actions.',
      '**Starring ideas:** Expand an idea card and click the Star button to mark it as a favorite. Starred ideas appear in the "Starred" section of the sidebar. Use this to separate your best ideas from experiments.',
      '**Copying a build prompt:** Expand a saved idea and click "Copy prompt" to grab the build prompt without re-running the full flow.',
      '**Deleting ideas:** Expand a card and click the red trash icon. This is permanent — there\'s no undo.',
      '**Searching:** Use the Search page (sidebar) to filter your ideas by concept, persona name, audience, or feature names. This is useful once you have 10+ ideas saved.',
    ],
  },
  {
    id: 'choosing-build-tool',
    title: 'Choosing the Right Build Tool',
    description: 'Claude Code vs Codex vs Lovable — which one should you paste your prompt into?',
    category: 'tips',
    icon: Zap,
    content: [
      'Launchable generates a build prompt and recommends a tool, but you can choose any of the three. Here\'s how to decide:',
      '**Claude Code** — Best for developers comfortable with a terminal. Handles complex full-stack apps, backend logic, APIs, databases, and multi-file projects. If your idea needs authentication, a database, or server-side logic, start here.',
      '**Codex** — OpenAI\'s autonomous coding agent. Good for self-contained tasks and iterative development. Works well when you want the AI to make decisions about implementation details. Best for developers who want to review and approve changes.',
      '**Lovable** — Best for non-developers or visual-first builders. Generates beautiful UIs with a visual editor. Perfect for landing pages, simple SaaS dashboards, and products where design matters more than complex logic. If your idea is mostly frontend, start here.',
      'You can always switch tools later — the build prompt is tool-agnostic enough to work in any of them. The tool selector on the Build Prompt page lets you pick after seeing the prompt.',
    ],
  },
];

const CATEGORY_LABELS = {
  'getting-started': 'Getting Started',
  guides: 'Guides',
  tips: 'Tips & Best Practices',
} as const;

export default function ResourcesPage() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  if (selectedArticle) {
    return (
      <PageLayout width="medium">
        <div className="py-4">
          <button
            onClick={() => setSelectedArticle(null)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Resources
          </button>

          <article className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{selectedArticle.title}</h1>
              <p className="text-gray-500">{selectedArticle.description}</p>
            </div>

            <div className="space-y-4">
              {selectedArticle.content.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-sm text-gray-600 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: paragraph
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>'),
                  }}
                />
              ))}
            </div>
          </article>
        </div>
      </PageLayout>
    );
  }

  const categories = Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>;

  return (
    <PageLayout width="wide">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Resources</h1>
          <p className="text-gray-500">Learn how to get the most out of Launchable.</p>
        </div>

        {categories.map((category) => {
          const articles = ARTICLES.filter((a) => a.category === category);
          if (articles.length === 0) return null;

          return (
            <section key={category} className="space-y-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {CATEGORY_LABELS[category]}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {articles.map((article) => {
                  const Icon = article.icon;
                  return (
                    <button
                      key={article.id}
                      onClick={() => setSelectedArticle(article)}
                      className="group text-left rounded-2xl border border-gray-200 p-5 hover:border-orange-200 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="shrink-0 rounded-xl bg-gradient-to-br from-orange-50 to-pink-50 p-2.5 group-hover:from-orange-100 group-hover:to-pink-100 transition-colors">
                          <Icon className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                            {article.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                            {article.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </PageLayout>
  );
}
