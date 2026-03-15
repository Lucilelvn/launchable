import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Trash2,
  User,
  Copy,
  Check,
  Lightbulb,
  Star,
} from 'lucide-react';
import { getSavedIdeas, deleteIdea, toggleStar } from '../lib/ideas';
import PageLayout from '../components/PageLayout';
import type { SavedIdea } from '../types';

function verdictColor(score: number): string {
  if (score >= 7.5) return 'text-green-500';
  if (score >= 5.5) return 'text-orange-400';
  return 'text-red-400';
}

function verdictLabel(score: number): string {
  if (score >= 7.5) return 'Strong';
  if (score >= 5.5) return 'Promising';
  return 'Weak';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function IdeasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isStarredView = location.pathname === '/ideas/starred';
  const [ideas, setIdeas] = useState<SavedIdea[]>(getSavedIdeas);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = isStarredView ? ideas.filter((i) => i.starred) : ideas;

  function handleDelete(id: string) {
    deleteIdea(id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  function handleToggleStar(id: string) {
    toggleStar(id);
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i)),
    );
  }

  async function handleCopyPrompt(idea: SavedIdea) {
    if (!idea.buildPrompt) return;
    await navigator.clipboard.writeText(idea.buildPrompt);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const title = isStarredView ? 'Starred Ideas' : 'All Ideas';
  const emptyMessage = isStarredView
    ? 'No starred ideas yet. Star an idea to see it here.'
    : 'No saved ideas yet. Assess an idea and save it to see it here.';

  return (
    <PageLayout width="wide">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-gray-500">
          {filtered.length === 0
            ? emptyMessage
            : `${filtered.length} idea${filtered.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-6">
          <div className="rounded-full bg-gray-100 p-6">
            {isStarredView ? (
              <Star className="h-10 w-10 text-gray-300" />
            ) : (
              <Lightbulb className="h-10 w-10 text-gray-300" />
            )}
          </div>
          {isStarredView ? null : (
            <button
              onClick={() => navigate('/assess')}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all cursor-pointer shadow-sm"
            >
              Assess your first idea
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              expanded={expandedId === idea.id}
              copied={copiedId === idea.id}
              onToggle={() => setExpandedId(expandedId === idea.id ? null : idea.id)}
              onDelete={() => handleDelete(idea.id)}
              onToggleStar={() => handleToggleStar(idea.id)}
              onCopyPrompt={() => handleCopyPrompt(idea)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function IdeaCard({
  idea,
  expanded,
  copied,
  onToggle,
  onDelete,
  onToggleStar,
  onCopyPrompt,
}: {
  idea: SavedIdea;
  expanded: boolean;
  copied: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
  onCopyPrompt: () => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <button onClick={onToggle} className="w-full text-left p-5 cursor-pointer">
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">{idea.concept}</p>
          <div className="shrink-0 text-right">
            <span className={`text-xl font-black ${verdictColor(idea.score)}`}>{idea.score}</span>
            <p className={`text-[10px] font-semibold ${verdictColor(idea.score)}`}>{verdictLabel(idea.score)}</p>
          </div>
        </div>

        {/* Score bars */}
        <div className="flex gap-3 text-[10px] text-gray-400 font-medium">
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span>Demand</span>
              <span className="text-gray-600">{idea.demand}</span>
            </div>
            <div className="h-1 rounded-full bg-gray-100">
              <div className="h-1 rounded-full bg-green-400" style={{ width: `${idea.demand * 10}%` }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span>Competition</span>
              <span className="text-gray-600">{idea.competition}</span>
            </div>
            <div className="h-1 rounded-full bg-gray-100">
              <div className="h-1 rounded-full bg-amber-400" style={{ width: `${idea.competition * 10}%` }} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-0.5">
              <span>Ship</span>
              <span className="text-gray-600">{idea.shippability}</span>
            </div>
            <div className="h-1 rounded-full bg-gray-100">
              <div className="h-1 rounded-full bg-orange-400" style={{ width: `${idea.shippability * 10}%` }} />
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400">
          {idea.persona ? (
            <span className="flex items-center gap-1">
              <User className="h-2.5 w-2.5" />
              {idea.persona.name}
            </span>
          ) : null}
          {idea.features ? (
            <span>{idea.features.length} features</span>
          ) : null}
          <span className="ml-auto">{timeAgo(idea.savedAt)}</span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded ? (
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">{idea.verdict}</p>

          {idea.features && idea.features.length > 0 ? (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Features</p>
              <ul className="space-y-0.5">
                {idea.features.map((f) => (
                  <li key={f.id} className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Check className="h-2.5 w-2.5 text-green-500 shrink-0" />
                    {f.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onToggleStar}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                idea.starred
                  ? 'border-orange-200 bg-orange-50 text-orange-500'
                  : 'border-gray-200 text-gray-400 hover:bg-gray-50'
              }`}
            >
              <Star className={`h-3 w-3 ${idea.starred ? 'fill-orange-400' : ''}`} />
              {idea.starred ? 'Starred' : 'Star'}
            </button>
            {idea.buildPrompt ? (
              <button
                onClick={onCopyPrompt}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {copied ? (
                  <><Check className="h-3 w-3 text-green-500" /> Copied!</>
                ) : (
                  <><Copy className="h-3 w-3" /> Copy prompt</>
                )}
              </button>
            ) : null}
            <button
              onClick={onDelete}
              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
