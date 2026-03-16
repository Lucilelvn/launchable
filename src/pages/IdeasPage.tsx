import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import {
  Trash2,
  User,
  Copy,
  Check,
  Lightbulb,
  Star,
  Loader2,
} from 'lucide-react';
import { api } from '../../convex/_generated/api';
import PageLayout from '../components/PageLayout';
import type { Id } from '../../convex/_generated/dataModel';

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

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
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

  const allIdeas = useQuery(api.ideas.list);
  const starredIdeas = useQuery(api.ideas.listStarred);
  const removeIdea = useMutation(api.ideas.remove);
  const toggleStarMutation = useMutation(api.ideas.toggleStar);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ideas = isStarredView ? starredIdeas : allIdeas;
  const isLoading = ideas === undefined;

  function handleDelete(id: Id<"ideas">) {
    void removeIdea({ id });
  }

  function handleToggleStar(id: Id<"ideas">) {
    void toggleStarMutation({ id });
  }

  async function handleCopyPrompt(idea: { _id: Id<"ideas">; buildPrompt?: string }) {
    if (!idea.buildPrompt) return;
    await navigator.clipboard.writeText(idea.buildPrompt);
    setCopiedId(idea._id);
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
          {isLoading
            ? 'Loading...'
            : ideas.length === 0
              ? emptyMessage
              : `${ideas.length} idea${ideas.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
        </div>
      ) : ideas.length === 0 ? (
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
          {ideas.map((idea) => (
            <IdeaCard
              key={idea._id}
              idea={idea}
              expanded={expandedId === idea._id}
              copied={copiedId === idea._id}
              onToggle={() => setExpandedId(expandedId === idea._id ? null : idea._id)}
              onDelete={() => handleDelete(idea._id)}
              onToggleStar={() => handleToggleStar(idea._id)}
              onCopyPrompt={() => handleCopyPrompt(idea)}
            />
          ))}
        </div>
      )}
    </PageLayout>
  );
}

function condensedTitle(concept: string): string {
  const words = concept.split(/\s+/).slice(0, 8);
  let title = words.join(' ');
  if (concept.split(/\s+/).length > 8) title += '...';
  return title;
}

interface IdeaDoc {
  _id: Id<"ideas">;
  title?: string;
  concept: string;
  audience?: string;
  score: number;
  verdict: string;
  demand: { score: number };
  competition: { score: number };
  shippability: { score: number };
  persona?: { name: string; description: string; pain_points: string[] };
  features?: { id: string; name: string; description: string; priority: string; complexity: string; user_appetite: string; accepted: boolean }[];
  buildPrompt?: string;
  starred: boolean;
  createdAt: number;
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
  idea: IdeaDoc;
  expanded: boolean;
  copied: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
  onCopyPrompt: () => void;
}) {
  const title = idea.title ?? condensedTitle(idea.concept);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-md">
      <button onClick={onToggle} className="w-full text-left p-5 cursor-pointer">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold ${
              idea.score >= 7.5
                ? 'bg-green-50 text-green-600'
                : idea.score >= 5.5
                  ? 'bg-orange-50 text-orange-500'
                  : 'bg-red-50 text-red-500'
            }`}>
              {idea.score}
              <span className="font-medium text-[10px]">/ 10</span>
            </div>
            <span className={`text-[10px] font-semibold ${verdictColor(idea.score)}`}>
              {verdictLabel(idea.score)}
            </span>
          </div>
          {idea.starred ? <Star className="h-3.5 w-3.5 text-orange-400 fill-orange-400" /> : null}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">{idea.concept}</p>

        <div className="grid grid-cols-3 gap-2 text-[10px] text-gray-400 font-medium">
          <div>
            <div className="flex justify-between mb-1">
              <span>Demand</span>
              <span className="text-gray-600">{idea.demand.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-green-400 transition-all" style={{ width: `${idea.demand.score * 10}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Competition</span>
              <span className="text-gray-600">{idea.competition.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-amber-400 transition-all" style={{ width: `${idea.competition.score * 10}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span>Shippability</span>
              <span className="text-gray-600">{idea.shippability.score}</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-orange-400 transition-all" style={{ width: `${idea.shippability.score * 10}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {idea.persona ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
              <User className="h-2.5 w-2.5" />
              {idea.persona.name}
            </span>
          ) : null}
          {idea.features ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
              {idea.features.length} features
            </span>
          ) : null}
          <span className="ml-auto text-[10px] text-gray-300">{timeAgo(idea.createdAt)}</span>
        </div>
      </button>

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
