import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Rocket,
  User,
  Loader2,
  Check,
  X,
  Plus,
  Star,
  Sparkles,
} from 'lucide-react';
import { useRefineIdea } from '../hooks/useRefineIdea';
import type { Assessment, Feature } from '../types';

interface LocationState {
  concept: string;
  audience?: string;
  assessment: Assessment;
}

export default function RefinePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const { isLoading, refinement, setRefinement, error, refine } = useRefineIdea();
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (state && !refinement && !isLoading) {
      refine(state.concept, state.audience, state.assessment);
    }
  }, [state, refinement, isLoading, refine]);

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

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center gap-3 px-6 py-4 max-w-6xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="rounded-lg p-2 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gradient-to-br from-orange-400 to-pink-400 p-1.5">
            <Rocket className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold">Launchable</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 pb-12">
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
          <div className="space-y-8">
            {/* Persona card */}
            <section className="rounded-2xl border border-gray-200 p-6 space-y-4">
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

            {/* Features */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-gray-400 uppercase tracking-wide">
                  Features
                </h3>
                <span className="text-xs text-gray-400">
                  {refinement.features.filter((f) => f.accepted).length} selected
                </span>
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

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={refinement.features.filter((f) => f.accepted).length === 0}
              className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate build prompt
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
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

  return (
    <div
      className={`group flex items-start gap-3 rounded-xl border p-3.5 transition-all ${
        feature.accepted
          ? 'border-gray-200 bg-white'
          : 'border-gray-100 bg-gray-50 opacity-60'
      }`}
    >
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
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${feature.accepted ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
            {feature.name}
          </span>
          {feature.priority === 'must-have' ? (
            <Star className="h-3 w-3 text-orange-400 shrink-0" />
          ) : null}
          {isCustom ? (
            <span className="text-[10px] font-medium text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded-full">
              Custom
            </span>
          ) : null}
        </div>
        {feature.description ? (
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{feature.description}</p>
        ) : null}
      </div>

      <button
        onClick={onRemove}
        className="shrink-0 opacity-0 group-hover:opacity-100 rounded-md p-1 hover:bg-gray-100 transition-all cursor-pointer"
      >
        <X className="h-3.5 w-3.5 text-gray-400" />
      </button>
    </div>
  );
}
