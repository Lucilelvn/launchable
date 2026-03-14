import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  TrendingUp,
  Shield,
  Wrench,
  Loader2,
  Rocket,
} from 'lucide-react';
import { getClient } from '../lib/anthropic';
import { BUILD_PROMPT_SYSTEM } from '../lib/prompts';
import { BUILD_TOOLS } from '../lib/constants';
import type { LegacyAssessment, BuildPrompt, Mutation } from '../types';

interface ResultState {
  title: string;
  concept: string;
  assessment: LegacyAssessment;
}

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ResultState | null;

  const [buildPrompt, setBuildPrompt] = useState<BuildPrompt | null>(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedMutation, setSelectedMutation] = useState<Mutation | null>(null);

  const activeIdea = selectedMutation
    ? { title: selectedMutation.label, concept: selectedMutation.description }
    : { title: state?.title ?? '', concept: state?.concept ?? '' };

  useEffect(() => {
    if (!state) return;
    generateBuildPrompt(activeIdea.title, activeIdea.concept);
  }, [selectedMutation]);

  useEffect(() => {
    if (state && !buildPrompt && !loadingPrompt) {
      generateBuildPrompt(activeIdea.title, activeIdea.concept);
    }
  }, [state]);

  if (!state) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 gap-4">
        <p className="text-gray-500">No results to show.</p>
        <button
          onClick={() => navigate('/')}
          className="text-orange-500 hover:text-orange-600 text-sm cursor-pointer"
        >
          Go back home
        </button>
      </div>
    );
  }

  async function generateBuildPrompt(title: string, concept: string) {
    setLoadingPrompt(true);
    setBuildPrompt(null);
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2048,
        messages: [
          { role: 'system', content: BUILD_PROMPT_SYSTEM },
          {
            role: 'user',
            content: `Idea: ${title}\n\nDescription: ${concept}`,
          },
        ],
      });
      const text = response.choices[0]?.message?.content ?? '';
      const parsed = JSON.parse(text) as BuildPrompt;
      setBuildPrompt(parsed);
    } catch {
      setBuildPrompt(null);
    } finally {
      setLoadingPrompt(false);
    }
  }

  const { assessment } = state;

  function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
    const barColor = value >= 7 ? 'bg-green-400' : value >= 4 ? 'bg-orange-400' : 'bg-red-400';
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-gray-500">
            {icon}
            {label}
          </span>
          <span className="font-semibold text-gray-900">{value}/10</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${value * 10}%` }}
          />
        </div>
      </div>
    );
  }

  async function handleCopy() {
    if (!buildPrompt) return;
    await navigator.clipboard.writeText(buildPrompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center gap-3 px-6 py-4 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-br from-orange-400 to-pink-400 p-1.5">
            <Rocket className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold">Your Results</span>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 pb-16 space-y-8">
        {/* Idea */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">{activeIdea.title}</h2>
          <p className="text-sm text-gray-500">{activeIdea.concept}</p>
        </section>

        {/* Scores */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
            Assessment
          </h3>
          <ScoreBar label="Demand" value={assessment.demand} icon={<TrendingUp className="h-4 w-4" />} />
          <ScoreBar label="Competition" value={assessment.competition} icon={<Shield className="h-4 w-4" />} />
          <ScoreBar label="Shippability" value={assessment.shippability} icon={<Wrench className="h-4 w-4" />} />
          <p className="text-sm text-gray-500 pt-2">{assessment.summary}</p>
        </section>

        {/* Mutations */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
            Smarter Mutations
          </h3>
          <div className="grid gap-3">
            {assessment.mutations.map((m, i) => (
              <button
                key={i}
                onClick={() => setSelectedMutation(selectedMutation?.label === m.label ? null : m)}
                className={`text-left rounded-xl border p-4 transition-all cursor-pointer ${
                  selectedMutation?.label === m.label
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium uppercase tracking-wide bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    {m.type}
                  </span>
                  <span className="font-semibold text-sm text-gray-900">{m.label}</span>
                </div>
                <p className="text-sm text-gray-500">{m.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Build Prompt */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
          <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
            Build Prompt
          </h3>

          {loadingPrompt ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating your build prompt...
            </div>
          ) : buildPrompt ? (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                Recommended tool:{' '}
                <span className="font-semibold text-gray-900">
                  {BUILD_TOOLS[buildPrompt.tool].name}
                </span>
              </div>
              <p className="text-xs text-gray-400">{buildPrompt.reasoning}</p>
              <div className="relative">
                <pre className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-80 overflow-y-auto">
                  {buildPrompt.prompt}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 rounded-lg bg-white border border-gray-200 p-2 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Could not generate a build prompt. Try again.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
