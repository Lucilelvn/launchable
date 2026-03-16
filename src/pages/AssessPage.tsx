import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Wrench,
  AlertTriangle,
  Sparkles,
  Zap,
  Search,
  BarChart3,
  Swords,
  Hammer,
  Dna,
  FileCode,
  Check,
  Pencil,
} from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAssessIdea } from '../hooks/useAssessIdea';
import { FREE_ASSESSMENT_LIMIT } from '../lib/constants';
import PageLayout from '../components/PageLayout';
import DimensionCard from '../components/assess/DimensionCard';
import MutationCard from '../components/assess/MutationCard';
import PaywallModal from '../components/assess/PaywallModal';

// ---------- loading steps ----------

const LOADING_STEPS = [
  { icon: Search, label: 'Researching demand signals...' },
  { icon: Swords, label: 'Searching for competitors...' },
  { icon: BarChart3, label: 'Scoring with market evidence...' },
  { icon: Hammer, label: 'Evaluating shippability...' },
  { icon: Dna, label: 'Generating smarter mutations...' },
  { icon: FileCode, label: 'Crafting your build prompt...' },
];

// ---------- helpers ----------

function compositeScore(d: number, c: number, s: number): number {
  return Math.round((d * 0.4 + (10 - c) * 0.25 + s * 0.35) * 10) / 10;
}

function verdictLabel(score: number): string {
  if (score >= 7.5) return 'Strong';
  if (score >= 5.5) return 'Promising';
  return 'Weak';
}

function verdictGradient(score: number): string {
  if (score >= 7.5) return 'from-green-500 to-emerald-400';
  if (score >= 5.5) return 'from-orange-400 to-amber-400';
  return 'from-red-500 to-orange-400';
}

// ---------- types ----------

type Phase = 'input' | 'loading' | 'results';

interface LocationState {
  concept?: string;
  autoSubmit?: boolean;
}

// ---------- component ----------

export default function AssessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const locationState = location.state as LocationState | null;
  const [concept, setConcept] = useState(locationState?.concept ?? '');
  const [audience, setAudience] = useState('');
  const [timeline, setTimeline] = useState('');
  const [selectedMutations, setSelectedMutations] = useState<Set<number>>(new Set());
  const [customTweak, setCustomTweak] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const { isLoading, assessment, error, assess } = useAssessIdea();
  const autoSubmitted = useRef(false);

  const [phase, setPhase] = useState<Phase>('input');
  const [activeStep, setActiveStep] = useState(0);
  const [apiDone, setApiDone] = useState(false);
  const [prevScores, setPrevScores] = useState<{ demand: number; competition: number; shippability: number } | null>(null);

  const usageData = useQuery(api.usage.get);
  const usageCount = usageData?.count ?? 0;
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const premium = false; // TODO: read from user profile when billing is wired
  const remaining = Math.max(0, FREE_ASSESSMENT_LIMIT - usageCount);
  const atLimit = !isLocalhost && !premium && usageCount >= FREE_ASSESSMENT_LIMIT;

  useEffect(() => {
    if (searchParams.get('upgraded') === 'true') {
      // TODO: verify upgrade via Convex when billing is wired
      window.history.replaceState({}, '', '/assess');
    }
  }, [searchParams]);

  useEffect(() => {
    if (locationState?.autoSubmit && locationState.concept && !autoSubmitted.current) {
      autoSubmitted.current = true;
      setPhase('loading');
      assess({ concept: locationState.concept });
    }
  }, [locationState, assess]);

  // Animate loading steps
  useEffect(() => {
    if (phase !== 'loading') return;
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < LOADING_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [phase]);

  // Track when API finishes
  useEffect(() => {
    if (!isLoading && phase === 'loading' && (assessment || error)) {
      setApiDone(true);
    }
  }, [isLoading, phase, assessment, error]);

  // Transition to results after all steps animate + API done
  useEffect(() => {
    if (!apiDone || phase !== 'loading') return;
    const minDelay = Math.max(0, (LOADING_STEPS.length - activeStep) * 400);
    const timeout = setTimeout(() => {
      setActiveStep(LOADING_STEPS.length);
      setTimeout(() => {
        if (error) {
          setPhase('input');
        } else {
          setPhase('results');
        }
      }, 600);
    }, minDelay);
    return () => clearTimeout(timeout);
  }, [apiDone, phase, activeStep, error]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!concept.trim() || isLoading) return;
    if (atLimit) {
      setShowPaywall(true);
      return;
    }
    if (assessment) {
      setPrevScores({ demand: assessment.demand.score, competition: assessment.competition.score, shippability: assessment.shippability.score });
    }
    setSelectedMutations(new Set());
    setCustomTweak('');
    setApiDone(false);
    setPhase('loading');
    assess({
      concept: concept.trim(),
      audience: audience.trim() || undefined,
      timeline: timeline.trim() || undefined,
    });
  }

  function handleEnhance() {
    if (!assessment || (selectedMutations.size === 0 && !customTweak.trim())) return;
    setPrevScores({ demand: assessment.demand.score, competition: assessment.competition.score, shippability: assessment.shippability.score });

    const parts: string[] = [`Original idea: ${concept}`];
    if (selectedMutations.size > 0) {
      const directions = Array.from(selectedMutations).map((i) => assessment.mutations[i].idea);
      parts.push(`Apply these directions:\n${directions.map((d) => `- ${d}`).join('\n')}`);
    }
    if (customTweak.trim()) {
      parts.push(`Additional direction from user: ${customTweak.trim()}`);
    }
    parts.push('Combine the above into one refined product idea and assess it.');

    const newConcept = selectedMutations.size === 1 && !customTweak.trim()
      ? assessment.mutations[Array.from(selectedMutations)[0]].idea
      : parts.join('\n\n');

    setConcept(newConcept);
    setSelectedMutations(new Set());
    setCustomTweak('');
    setApiDone(false);
    setPhase('loading');
    assess({
      concept: newConcept,
      audience: audience.trim() || undefined,
      timeline: timeline.trim() || undefined,
    });
  }

  function handleStartOver() {
    setConcept('');
    setAudience('');
    setTimeline('');
    setPrevScores(null);
    setSelectedMutations(new Set());
    setCustomTweak('');
    setPhase('input');
  }

  const score = assessment
    ? compositeScore(assessment.demand.score, assessment.competition.score, assessment.shippability.score)
    : 0;
  const prevComposite = prevScores
    ? compositeScore(prevScores.demand, prevScores.competition, prevScores.shippability)
    : null;
  const scoreDelta = prevComposite !== null ? Math.round((score - prevComposite) * 10) / 10 : null;

  const usageAction = (
    <span className="text-xs text-gray-400">
      {premium
        ? 'Unlimited assessments'
        : remaining > 0
          ? `${remaining} free assessment${remaining === 1 ? '' : 's'} remaining`
          : 'Free assessments used'}
    </span>
  );

  // ===================== STEP 1: INPUT =====================
  if (phase === 'input') {
    return (
      <PageLayout back="/" width="narrow" actions={usageAction}>
        <div className="py-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Assess Your Idea</h1>
            <p className="text-gray-500">Drop in your concept and we'll give you an honest score.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="concept" className="block text-sm font-medium text-gray-700">
                Describe your idea in one sentence <span className="text-orange-400">*</span>
              </label>
              <textarea
                id="concept"
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="e.g. An app that helps freelancers track unpaid invoices and send automatic reminders..."
                rows={3}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
                  Who is this for?
                </label>
                <input
                  id="audience"
                  type="text"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="e.g. Freelance designers"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="timeline" className="block text-sm font-medium text-gray-700">
                  Timeline?
                </label>
                <input
                  id="timeline"
                  type="text"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g. This weekend"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!concept.trim()}
              className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              Assess my idea &rarr;
            </button>
          </form>

          {error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          ) : null}
        </div>

        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </PageLayout>
    );
  }

  // ===================== STEP 2: LOADING =====================
  if (phase === 'loading') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full space-y-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Assessing</p>
            <p className="text-lg text-gray-900 font-semibold leading-snug">{concept}</p>
          </div>

          <div className="space-y-3">
            {LOADING_STEPS.map((step, i) => {
              const Icon = step.icon;
              const isDone = i < activeStep;
              const isActive = i === activeStep;
              const isPending = i > activeStep;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 transition-all duration-500 ${
                    isPending ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                  }`}
                >
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isDone
                        ? 'bg-green-100'
                        : isActive
                          ? 'bg-gradient-to-br from-orange-100 to-pink-100'
                          : 'bg-gray-100'
                    }`}
                  >
                    {isDone ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive ? 'text-orange-500 animate-pulse' : 'text-gray-300'
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${
                      isDone
                        ? 'text-green-600'
                        : isActive
                          ? 'text-gray-900 font-medium'
                          : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-1 rounded-full bg-gradient-to-r from-orange-400 to-pink-400 transition-all duration-700 ease-out"
              style={{ width: `${(Math.min(activeStep + 1, LOADING_STEPS.length) / LOADING_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ===================== STEP 3: RESULTS =====================
  if (!assessment) return null;

  return (
    <PageLayout back="/" width="wide" actions={usageAction}>
      {/* Compact hero — score + idea side by side */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-50 via-white to-pink-50 border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-8">
          <div className="text-center shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Launchability
            </p>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-5xl font-black bg-gradient-to-r ${verdictGradient(score)} bg-clip-text text-transparent`}>
                {score}
              </span>
              <span className="text-lg font-bold text-gray-300">/10</span>
            </div>
            <div className="mt-1 flex items-center justify-center gap-1">
              <Zap className={`h-3 w-3 ${score >= 7.5 ? 'text-green-500' : score >= 5.5 ? 'text-orange-400' : 'text-red-400'}`} />
              <span className="text-xs font-semibold text-gray-500">
                {verdictLabel(score)}
              </span>
              {scoreDelta !== null && scoreDelta !== 0 ? (
                <span className={`text-[10px] font-bold ml-1 ${scoreDelta > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {scoreDelta > 0 ? '+' : ''}{scoreDelta}
                </span>
              ) : null}
            </div>
          </div>
          <div className="w-px h-16 bg-gray-200 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm text-gray-900 font-medium mb-1">{concept}</p>
            <p className="text-sm text-gray-500 leading-relaxed">{assessment.verdict}</p>
            {assessment.ai_wrapper_flag ? (
              <div className="flex items-center gap-1.5 mt-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="text-xs text-amber-600 font-medium">
                  {assessment.ai_wrapper_explanation ?? 'AI wrapper risk — consider the mutations below to differentiate.'}
                </span>
              </div>
            ) : null}
          </div>
          <button
            onClick={handleStartOver}
            className="shrink-0 ml-auto text-xs text-gray-400 hover:text-gray-600 cursor-pointer transition-colors self-start"
          >
            &larr; New idea
          </button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-3 mb-6">
        <DimensionCard label="Demand" dimension={assessment.demand} icon={<TrendingUp className="h-4 w-4" />} color="#22c55e" delay={200} delta={prevScores ? assessment.demand.score - prevScores.demand : undefined} />
        <DimensionCard label="Competition" dimension={assessment.competition} icon={<Shield className="h-4 w-4" />} color="#f59e0b" delay={400} delta={prevScores ? assessment.competition.score - prevScores.competition : undefined} />
        <DimensionCard label="Shippability" dimension={assessment.shippability} icon={<Wrench className="h-4 w-4" />} color="#fb923c" delay={600} delta={prevScores ? assessment.shippability.score - prevScores.shippability : undefined} />
      </div>

      <div className="grid gap-6 grid-cols-5">
        <section className="col-span-2 space-y-3">
          <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">Make It Better</h3>
          <div className="grid gap-2">
            {assessment.mutations.map((m, i) => (
              <MutationCard
                key={i}
                mutation={m}
                selected={selectedMutations.has(i)}
                onSelect={() => setSelectedMutations((prev) => {
                  const next = new Set(prev);
                  if (next.has(i)) next.delete(i);
                  else next.add(i);
                  return next;
                })}
              />
            ))}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="custom-tweak" className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              <Pencil className="h-3 w-3" />
              Or describe your own twist
            </label>
            <textarea
              id="custom-tweak"
              value={customTweak}
              onChange={(e) => setCustomTweak(e.target.value)}
              placeholder="e.g. Focus on solo freelancers, add Stripe billing..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 resize-none"
            />
          </div>

          {selectedMutations.size > 0 || customTweak.trim() ? (
            <button
              onClick={handleEnhance}
              className="w-full rounded-xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 px-3 py-2.5 text-sm font-bold text-orange-600 hover:from-orange-100 hover:to-pink-100 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Re-assess {selectedMutations.size > 1 ? `with ${selectedMutations.size} mutations` : customTweak.trim() && selectedMutations.size === 0 ? 'with your twist' : 'with mutation'}
            </button>
          ) : null}
        </section>

        <div className="col-span-3 flex flex-col justify-center">
          <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50 p-8 text-center space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Ready to refine?</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              We'll generate a target persona and feature set based on your assessment.
              You can accept, discard, or add your own features before we generate your build prompt.
            </p>
            <button
              onClick={() => navigate('/refine', { state: { concept, audience, assessment } })}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all cursor-pointer shadow-sm"
            >
              Refine & Build
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </PageLayout>
  );
}
