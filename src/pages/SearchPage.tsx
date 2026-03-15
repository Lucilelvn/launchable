import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, Star, Lightbulb } from 'lucide-react';
import { getSavedIdeas } from '../lib/ideas';
import PageLayout from '../components/PageLayout';

function verdictColor(score: number): string {
  if (score >= 7.5) return 'text-green-500';
  if (score >= 5.5) return 'text-orange-400';
  return 'text-red-400';
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const ideas = getSavedIdeas();

  const results = useMemo(() => {
    if (!query.trim()) return ideas;
    const q = query.toLowerCase();
    return ideas.filter(
      (idea) =>
        idea.concept.toLowerCase().includes(q) ||
        idea.verdict.toLowerCase().includes(q) ||
        idea.persona?.name.toLowerCase().includes(q) ||
        idea.audience?.toLowerCase().includes(q) ||
        idea.features?.some((f) => f.name.toLowerCase().includes(q)),
    );
  }, [query, ideas]);

  return (
    <PageLayout width="wide">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Search</h1>
          <p className="text-gray-500">Find ideas by concept, persona, features, or audience.</p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your ideas..."
            autoFocus
            className="w-full rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Results */}
        {ideas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="rounded-full bg-gray-100 p-6">
              <Lightbulb className="h-10 w-10 text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No ideas saved yet. Assess an idea first.</p>
            <button
              onClick={() => navigate('/assess')}
              className="rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all cursor-pointer shadow-sm"
            >
              Assess your first idea
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-400">No ideas match "{query}"</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-gray-400">
              {query.trim()
                ? `${results.length} result${results.length === 1 ? '' : 's'}`
                : `${ideas.length} idea${ideas.length === 1 ? '' : 's'}`}
            </p>
            <div className="space-y-1">
              {results.map((idea) => (
                <button
                  key={idea.id}
                  onClick={() => navigate('/ideas')}
                  className="w-full flex items-center gap-4 rounded-xl border border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-gray-900 truncate">{idea.concept}</p>
                      {idea.starred ? <Star className="h-3 w-3 text-orange-400 fill-orange-400 shrink-0" /> : null}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400">
                      {idea.persona ? (
                        <span className="flex items-center gap-1">
                          <User className="h-2.5 w-2.5" />
                          {idea.persona.name}
                        </span>
                      ) : null}
                      {idea.features ? (
                        <span>{idea.features.length} features</span>
                      ) : null}
                      {idea.audience ? (
                        <span>{idea.audience}</span>
                      ) : null}
                    </div>
                  </div>
                  <span className={`text-lg font-black shrink-0 ${verdictColor(idea.score)}`}>
                    {idea.score}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
