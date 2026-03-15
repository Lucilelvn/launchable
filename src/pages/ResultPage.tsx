import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Loader2,
  Rocket,
  User,
  Star,
} from 'lucide-react';
import { getAnthropicClient } from '../lib/claude';
import { BUILD_PROMPT_SYSTEM } from '../lib/prompts';
import { BUILD_TOOLS } from '../lib/constants';
import type { Assessment, Persona, Feature, BuildPrompt } from '../types';

interface RefinedResultState {
  concept: string;
  audience?: string;
  assessment: Assessment;
  persona: Persona;
  features: Feature[];
}

interface LegacyResultState {
  title: string;
  concept: string;
  assessment: { demand: number; competition: number; shippability: number; summary: string };
}

const TOOL_URLS: Record<string, string> = {
  'claude-code': 'https://claude.ai',
  lovable: 'https://lovable.dev',
  bolt: 'https://bolt.new',
  replit: 'https://replit.com',
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RefinedResultState | LegacyResultState | null;

  const [buildPrompt, setBuildPrompt] = useState<BuildPrompt | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  const isRefined = state !== null && 'persona' in state;

  useEffect(() => {
    if (!state || started.current) return;
    started.current = true;

    if (isRefined) {
      generateRefinedPrompt(state as RefinedResultState);
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

  async function generateRefinedPrompt(s: RefinedResultState) {
    setLoading(true);
    setError(null);

    const featureList = s.features
      .map((f) => `- ${f.name}: ${f.description}${f.priority === 'must-have' ? ' [MUST-HAVE]' : ' [NICE-TO-HAVE]'}`)
      .join('\n');

    const userMessage = [
      `Idea: ${s.concept}`,
      s.audience ? `Audience: ${s.audience}` : null,
      `\nTarget Persona: ${s.persona.name}`,
      s.persona.description,
      `Pain points: ${s.persona.pain_points.join('; ')}`,
      `\nAccepted Features:\n${featureList}`,
      `\nAssessment: Demand ${s.assessment.demand.score}/10, Competition ${s.assessment.competition.score}/10, Shippability ${s.assessment.shippability.score}/10`,
    ].filter(Boolean).join('\n');

    try {
      const client = getAnthropicClient();
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2048,
        system: BUILD_PROMPT_SYSTEM,
        messages: [{ role: 'user', content: userMessage }],
      });

      const textBlock = response.content.find((b) => b.type === 'text');
      const text = textBlock && 'text' in textBlock ? textBlock.text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No valid JSON in response');

      const parsed = JSON.parse(jsonMatch[0]) as BuildPrompt;
      setBuildPrompt(parsed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!buildPrompt) return;
    await navigator.clipboard.writeText(buildPrompt.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Render the refined flow
  if (!isRefined) {
    // Legacy explore flow — redirect to home
    navigate('/');
    return null;
  }

  const refined = state as RefinedResultState;
  const toolKey = buildPrompt?.tool as keyof typeof BUILD_TOOLS | undefined;
  const tool = toolKey ? BUILD_TOOLS[toolKey] : null;
  const toolUrl = toolKey ? TOOL_URLS[toolKey] : null;

  return (
    <div className="min-h-screen bg-white">
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

      <div className="w-[min(90%,1200px)] mx-auto pb-12 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Your Build Prompt</h1>
          <p className="text-gray-500">Tailored to your persona and selected features. Copy and paste to start building.</p>
        </div>

        <div className="grid grid-cols-5 gap-6">
          {/* Left column — context: persona + features (2/5) */}
          <div className="col-span-2 space-y-4">
            {/* Persona recap */}
            <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-gradient-to-br from-violet-100 to-pink-100 p-2">
                  <User className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{refined.persona.name}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Persona</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{refined.persona.description}</p>
            </div>

            {/* Features recap */}
            <div className="rounded-2xl border border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {refined.features.length} Features Included
                </p>
              </div>
              <ul className="space-y-2">
                {refined.features.map((f) => (
                  <li key={f.id} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-medium text-gray-900">{f.name}</span>
                      {f.priority === 'must-have' ? (
                        <Star className="inline h-2.5 w-2.5 text-orange-400 fill-orange-400 ml-1" />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column — build prompt (3/5) */}
          <div className="col-span-3 space-y-4">
            {loading ? (
              <div className="rounded-2xl border border-gray-200 p-12 flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
                <p className="text-sm text-gray-500">Generating your tailored build prompt...</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            ) : buildPrompt ? (
              <>
                <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-pink-50 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-orange-400 to-pink-400 p-2.5">
                      <Terminal className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Ready to paste</h3>
                      <p className="text-xs text-gray-500">{buildPrompt.reasoning}</p>
                    </div>
                    {tool ? (
                      <span
                        className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white shrink-0"
                        style={{ backgroundColor: tool.color }}
                      >
                        {tool.name}
                      </span>
                    ) : null}
                  </div>

                  <div className="relative">
                    <pre className="rounded-xl bg-white border border-gray-200 p-4 text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto max-h-[28rem] overflow-y-auto leading-relaxed">
                      {buildPrompt.prompt}
                    </pre>
                    <button
                      onClick={handleCopy}
                      className="absolute top-3 right-3 rounded-lg bg-white border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium shadow-sm"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-500">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {toolUrl ? (
                  <a
                    href={toolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-center gap-3 w-full rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-4 text-base font-bold text-white hover:from-orange-500 hover:to-pink-500 transition-all shadow-md shadow-orange-200/50 hover:shadow-orange-300/50 hover:scale-[1.01]"
                  >
                    Open in {tool?.name ?? buildPrompt.tool}
                    <ExternalLink className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
