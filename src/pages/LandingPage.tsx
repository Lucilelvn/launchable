import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col">
      {/* Header */}
      <header className="h-[72px] flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💡</span>
          <span className="font-[family-name:var(--font-display)] font-bold text-xl text-[#0a0a0a]">
            Launchable
          </span>
        </div>
        <div className="flex items-center gap-8">
          <button
            onClick={() => signIn()}
            className="text-[#4a5565] text-base hover:text-gray-900 transition-colors cursor-pointer"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/assess')}
            className="bg-[#101828] text-white text-base font-medium px-5 py-2 rounded-[10px] hover:bg-[#1e2939] transition-colors cursor-pointer"
          >
            Get started
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center py-[68px]">
        <div className="max-w-[896px] w-full text-center space-y-2">
          <h1 className="font-[family-name:var(--font-display)] font-bold text-[72px] leading-[72px] tracking-[-1.8px] text-[#0a0a0a]">
            Open a build tool.
          </h1>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-[72px] leading-[72px] tracking-[-1.8px] text-[#009689]">
            Know exactly
          </h1>
          <h1 className="font-[family-name:var(--font-display)] font-bold text-[72px] leading-[72px] tracking-[-1.8px] text-[#f6339a]">
            what to type.
          </h1>
        </div>

        <p className="mt-8 max-w-[642px] text-center text-[#4a5565] text-xl leading-[32.5px]">
          Launchable takes what you're thinking — a vague direction, a specific concept, or just a job
          frustration — and turns it into a prompt you can paste into Claude Code, Lovable, or Bolt today.
        </p>

        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={() => navigate('/assess')}
            className="flex items-center gap-2 bg-[#fdc700] text-[#101828] font-medium text-base px-6 py-3 rounded-[10px] hover:bg-[#f0bc00] transition-colors cursor-pointer"
          >
            <span>💡</span>
            I have an idea — assess it
          </button>
          <div className="relative">
            <button
              disabled
              className="text-[#101828] font-medium text-base px-6 py-3 rounded-[10px] border border-[#d1d5dc] bg-white opacity-60 cursor-default"
            >
              I don't know where to start
            </button>
            <span className="absolute -top-2 -right-2 text-[10px] font-bold uppercase tracking-wider text-[#009689] bg-[#ccfbf1] border border-[#99f6e4] rounded-full px-2 py-0.5">
              Soon
            </span>
          </div>
        </div>
      </section>

      {/* Pick your door */}
      <section className="bg-white px-[109px] py-16">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-4xl text-[#0a0a0a]">
          Pick your door
        </h2>
        <p className="mt-2 text-[#4a5565] text-base">
          Both paths end in the same place: a prompt and a build tool to paste it into.
        </p>

        <div className="flex gap-6 mt-8">
          {/* Card 1: Already have an idea */}
          <div className="flex-1 bg-[#fdf2f8] border border-[#fccee8] rounded-2xl p-8 flex flex-col gap-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.6px] text-[#6a7282]">Already have an idea</p>
              <h3 className="font-[family-name:var(--font-display)] font-bold text-2xl text-[#0a0a0a]">
                Is my idea worth building?
              </h3>
              <p className="text-sm text-[#4a5565] leading-5">
                Type your concept in one sentence. We score it on demand, competition, and shippability
                using real web research — and tell you honestly what we find.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Describe your idea in plain English — one sentence is enough',
                'Scores pulled from actual market data, not assumptions',
                'Three alternative directions to consider, plus your build prompt',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#e60076] text-white text-sm shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#364153]">{text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigate('/assess')}
              className="mt-auto w-full bg-[#e60076] text-white font-medium text-base py-3 rounded-[10px] hover:bg-[#cc006a] transition-colors cursor-pointer"
            >
              Assess my idea
            </button>
          </div>

          {/* Card 2: No idea yet */}
          <div className="flex-1 bg-[#f9fafb] border border-[#e5e7eb] rounded-2xl p-8 flex flex-col gap-6 relative">
            <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-[#009689] bg-[#ccfbf1] border border-[#99f6e4] rounded-full px-2 py-0.5">
              Coming soon
            </span>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.6px] text-[#6a7282]">No idea yet</p>
              <h3 className="font-[family-name:var(--font-display)] font-bold text-2xl text-[#0a0a0a]">
                I don't know what to build
              </h3>
              <p className="text-sm text-[#4a5565] leading-5">
                You have a job, a hobby, or a process that drives you up the wall. We ask questions, find
                the idea inside you, and pull out something buildable.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'A short conversation about your work, habits, and daily frustrations',
                'We pull a product concept out of what you tell us',
                'Scores, a verdict, and your build prompt — generated automatically',
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#009689] text-white text-sm shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-[#364153]">{text}</span>
                </div>
              ))}
            </div>

            <button
              disabled
              className="mt-auto w-full bg-[#009689] text-white font-medium text-base py-3 rounded-[10px] opacity-50 cursor-default"
            >
              Start here — find my idea
            </button>
          </div>
        </div>
      </section>

      {/* Doesn't matter who you are */}
      <section className="bg-[#f9fafb] px-[109px] py-16">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-4xl text-[#0a0a0a]">
          Doesn't matter who you are
        </h2>
        <p className="mt-2 text-[#4a5565] text-base">
          Most users start at one door, then come back through the other.
        </p>

        <div className="flex gap-6 mt-8">
          {/* The Idea-Haver */}
          <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#fef9c2] flex items-center justify-center">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] font-bold text-xl text-[#0a0a0a]">
              The Idea-Haver
            </h3>
            <p className="text-xs uppercase tracking-[0.6px] text-[#6a7282]">
              Has a specific concept but can't tell if it's actually good
            </p>
            <p className="text-base italic text-[#4a5565] leading-6">
              "I keep coming back to this one idea. I don't know if it's good or if I'm just too close
              to it. I need someone to be straight with me."
            </p>
          </div>

          {/* The Vibe Coding Curious */}
          <div className="flex-1 bg-white border border-[#e5e7eb] rounded-2xl p-8 flex flex-col gap-4">
            <div className="w-12 h-12 rounded-[10px] bg-[#fef9c2] flex items-center justify-center">
              <span className="text-2xl">🧑‍💻</span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] font-bold text-xl text-[#0a0a0a]">
              The Vibe Coding Curious
            </h3>
            <p className="text-xs uppercase tracking-[0.6px] text-[#6a7282]">
              Has a job, a hobby, a domain — but no product concept yet
            </p>
            <p className="text-base italic text-[#4a5565] leading-6">
              "I saw someone build an entire app in a weekend on Twitter. I want to do that. I just
              don't know what I'd build or where to start."
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="bg-[#101828] px-[109px] py-16 flex flex-col items-center gap-9">
        <h2 className="font-[family-name:var(--font-display)] font-bold text-5xl text-white text-center">
          Stop closing the tab.
        </h2>
        <p className="text-[#99a1af] text-lg text-center">
          Pick a starting point. Ten minutes from now, you'll have something to paste.
        </p>

        <div className="flex items-center justify-between w-full max-w-[896px] border-t border-[#1e2939] pt-6">
          <div className="flex items-center gap-2">
            <span className="text-xl text-white">💡</span>
            <span className="font-semibold text-base text-white">Launchable</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-[#99a1af]">Privacy</span>
            <span className="text-sm text-[#99a1af]">Terms</span>
            <span className="text-sm text-[#99a1af]">Contact</span>
          </div>
          <p className="text-sm text-[#6a7282]">
            © 2026 Launchable. Where builders begin.
          </p>
        </div>
      </footer>
    </div>
  );
}
