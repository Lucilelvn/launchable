import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  User,
  Loader2,
  Check,
  X,
  Plus,
  Star,
  Sparkles,
  Gauge,
  Heart,
} from 'lucide-react';
import PageLayout from '../components/PageLayout';
import { useRefineIdea } from '../hooks/useRefineIdea';
import type { Assessment, Feature } from '../types';

interface LocationState {
  concept: string;
  audience?: string;
  assessment: Assessment;
}

const COMPLEXITY_CONFIG = {
  low: { label: 'Low', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', dots: 1 },
  medium: { label: 'Medium', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', dots: 2 },
  high: { label: 'High', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', dots: 3 },
} as const;

export default function RefinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { isLoading, refinement, setRefinement, error, refine } = useRefineIdea();
  const [newFeature, setNewFeature] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (state && !started.current) {
      started.current = true;
      refine(state.concept, state.audience, state.assessment);
    }
  }, [state, refine]);

  if (!state) {
    navigate('/assess');
    return null;
  }

  function toggleFeature(id: string) {
    if (!refinement) return;
    setRefinement({
      ...refinement,
      features: refinement.features.map((f) =>
        f.id === id ? { ...f, accepted: !f.accepted } : f,
      ),
    });
  }

  function removeFeature(id: string) {
    if (!refinement) return;
    setRefinement({
      ...refinement,
      features: refinement.features.filter((f) => f.id !== id),
    });
  }

  function addFeature() {
    if (!refinement || !newFeature.trim()) return;
    const feature: Feature = {
      id: `custom-${Date.now()}`,
      name: newFeature.trim(),
      description: '',
      priority: 'must-have',
      complexity: 'medium',
      user_appetite: '',
      accepted: true,
    };
    setRefinement({
      ...refinement,
      features: [...refinement.features, feature],
    });
    setNewFeature('');
  }

  function handleContinue() {
    const acceptedFeatures = refinement?.features.filter((f) => f.accepted) ?? [];
    navigate('/result', {
      state: {
        concept: state.concept,
        audience: state.audience,
        assessment: state.assessment,
        persona: refinement?.persona,
        features: acceptedFeatures,
      },
    });
  }

  const acceptedCount = refinement?.features.filter((f) => f.accepted).length ?? 0;
  const mustHaveCount = refinement?.features.filter((f) => f.accepted && f.priority === 'must-have').length ?? 0;
  const niceToHaveCount = refinement?.features.filter((f) => f.accepted && f.priority === 'nice-to-have').length ?? 0;

  return (
    <PageLayout back="history" width="wide">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-3xl font-bold">Refine Your Idea</h1>
        <p className="text-gray-500">Review your target user and pick the features you want to ship.</p>
      </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
            <p className="text-sm text-gray-500">Generating persona & features...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : refinement ? (
          <div className="space-y-6">
            {/* Two-column: Persona (left) + Summary (right) */}
            <div className="grid grid-cols-5 gap-6">
              {/* Persona — 3/5 */}
              <section className="col-span-3 rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-br from-violet-100 to-pink-100 p-2.5">
                    <User className="h-5 w-5 text-violet-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{refinement.persona.name}</h2>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Target Persona</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{refinement.persona.description}</p>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pain Points</p>
                  <ul className="space-y-1">
                    {refinement.persona.pain_points.map((point, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-orange-400 mt-0.5 shrink-0">&bull;</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Summary stats — 2/5 */}
              <div className="col-span-2 space-y-4">
                <div className="rounded-2xl border border-gray-200 p-5 space-y-4">
                  <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">Scope Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-orange-50 p-3 text-center">
                      <p className="text-2xl font-bold text-orange-500">{mustHaveCount}</p>
                      <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider">Must-have</p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 text-center">
                      <p className="text-2xl font-bold text-gray-500">{niceToHaveCount}</p>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nice-to-have</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {acceptedCount === 0
                      ? 'Select at least one feature to continue.'
                      : `${acceptedCount} feature${acceptedCount === 1 ? '' : 's'} selected. Toggle features below to adjust your MVP scope.`}
                  </p>
                </div>

                {/* Continue button */}
                <button
                  onClick={handleContinue}
                  disabled={acceptedCount === 0}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate build prompt
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Features — full width */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
                  Features
                </h3>
                <div className="flex items-center gap-4 text-[11px] text-gray-400">
                  <span className="flex items-center gap-1"><Star className="h-3 w-3 text-orange-400" /> Must-have</span>
                  <span className="flex items-center gap-1"><Gauge className="h-3 w-3" /> Complexity</span>
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> User appetite</span>
                </div>
              </div>

              <div className="space-y-2">
                {refinement.features.map((feature) => (
                  <FeatureRow
                    key={feature.id}
                    feature={feature}
                    onToggle={() => toggleFeature(feature.id)}
                    onRemove={() => removeFeature(feature.id)}
                  />
                ))}
              </div>

              {/* Add custom feature */}
              <form
                onSubmit={(e) => { e.preventDefault(); addFeature(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a custom feature..."
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
                <button
                  type="submit"
                  disabled={!newFeature.trim()}
                  className="rounded-xl bg-gray-100 px-3 py-2.5 hover:bg-gray-200 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4 text-gray-600" />
                </button>
              </form>
            </section>
          </div>
        ) : null}
    </PageLayout>
  );
}

function FeatureRow({
  feature,
  onToggle,
  onRemove,
}: {
  feature: Feature;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const isCustom = feature.id.startsWith('custom-');
  const complexity = COMPLEXITY_CONFIG[feature.complexity] ?? COMPLEXITY_CONFIG.medium;

  return (
    <div
      className={`group rounded-xl border transition-all ${
        feature.accepted
          ? 'border-gray-200 bg-white'
          : 'border-gray-100 bg-gray-50 opacity-50'
      }`}
    >
      {/* Main row */}
      <div className="flex items-start gap-3 p-4">
        <button
          onClick={onToggle}
          className={`shrink-0 mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${
            feature.accepted
              ? 'border-orange-400 bg-orange-400'
              : 'border-gray-300 bg-white'
          }`}
        >
          {feature.accepted ? <Check className="h-3 w-3 text-white" /> : null}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-sm font-medium ${feature.accepted ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
              {feature.name}
            </span>
            {feature.priority === 'must-have' ? (
              <Star className="h-3 w-3 text-orange-400 fill-orange-400 shrink-0" />
            ) : null}
            {isCustom ? (
              <span className="text-[10px] font-medium text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full">
                Custom
              </span>
            ) : null}
          </div>
          {feature.description ? (
            <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
          ) : null}
        </div>

        {/* Complexity badge */}
        <div className={`shrink-0 flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border ${complexity.bg} ${complexity.border} ${complexity.color}`}>
          <Gauge className="h-3 w-3" />
          {complexity.label}
        </div>

        <button
          onClick={onRemove}
          className="shrink-0 opacity-0 group-hover:opacity-100 rounded-md p-1 hover:bg-gray-100 transition-all cursor-pointer"
        >
          <X className="h-3.5 w-3.5 text-gray-400" />
        </button>
      </div>

      {/* User appetite bar */}
      {feature.user_appetite && feature.accepted ? (
        <div className="px-4 pb-3 pl-12">
          <div className="flex items-start gap-1.5 text-[11px] text-gray-400 leading-relaxed">
            <Heart className="h-3 w-3 shrink-0 mt-0.5 text-pink-400" />
            <span>{feature.user_appetite}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
