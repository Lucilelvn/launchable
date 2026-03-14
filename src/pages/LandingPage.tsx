import { useNavigate } from 'react-router-dom';
import { Lightbulb, Compass } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            <span className="text-brand-400">Launchable</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-lg mx-auto">
            Turn a vague idea into a ready-to-paste prompt for your favorite AI
            build tool. No product experience needed.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 max-w-lg mx-auto pt-4">
          <button
            onClick={() => navigate('/assess')}
            className="group flex flex-col items-center gap-3 rounded-2xl bg-surface-raised p-6 border border-white/5 hover:border-brand-500/40 hover:bg-surface-overlay transition-all cursor-pointer"
          >
            <div className="rounded-full bg-brand-500/10 p-3 group-hover:bg-brand-500/20 transition-colors">
              <Lightbulb className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">I have an idea</p>
              <p className="text-sm text-text-muted mt-1">
                Get it scored, mutated, and turned into a build prompt
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="group flex flex-col items-center gap-3 rounded-2xl bg-surface-raised p-6 border border-white/5 hover:border-brand-500/40 hover:bg-surface-overlay transition-all cursor-pointer"
          >
            <div className="rounded-full bg-brand-500/10 p-3 group-hover:bg-brand-500/20 transition-colors">
              <Compass className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">I don't know where to start</p>
              <p className="text-sm text-text-muted mt-1">
                We'll help you discover an idea worth building
              </p>
            </div>
          </button>
        </div>

        <p className="text-xs text-text-muted pt-6">
          Works with Claude Code, Lovable, Bolt, and Replit
        </p>
      </div>
    </div>
  );
}
