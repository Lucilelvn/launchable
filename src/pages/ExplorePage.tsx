import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, SendHorizonal, Rocket } from 'lucide-react';
import { getClient } from '../lib/groq';
import { CONCEPT_PROMPT } from '../lib/prompts';

// ---------- pill data ----------

const STEP1_PILLS = [
  { label: '\u{1F4BC} My job or work', value: 'job' },
  { label: '\u{1F3AF} A hobby or interest', value: 'hobby' },
] as const;

const JOB_PILLS = [
  'Healthcare or medicine',
  'Sales or business development',
  'Operations or logistics',
  'Creative or design',
  'Education or training',
  'Finance or accounting',
  'Tech or engineering',
];

const HOBBY_PILLS = [
  'Sport or fitness',
  'Music or audio',
  'Food or cooking',
  'Gaming',
  'Art or visual creative',
  'Writing or content',
  'Community or events',
];

const JOB_METHOD_PILLS = [
  'Spreadsheet or shared doc',
  'A tool my company gave me',
  'Email or group chat',
  'Sticky notes or memory',
  'A mix of all of the above',
];

const HOBBY_METHOD_PILLS = [
  'WhatsApp or group chat',
  'Notes app or spreadsheet',
  'Facebook group or forum',
  'Dedicated app (but it\u2019s not quite right)',
  'Just in my head',
];

// ---------- types ----------

interface ThreadMessage {
  role: 'assistant' | 'user';
  content: string;
}

type Step = 1 | 2 | 3 | 'concept';
type Branch = 'job' | 'hobby' | null;

// ---------- component ----------

export default function ExplorePage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'interstitial' | 'tree'>('interstitial');

  const [step, setStep] = useState<Step>(1);
  const [branch, setBranch] = useState<Branch>(null);
  const [role, setRole] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [concept, setConcept] = useState<string | null>(null);
  const [conceptLoading, setConceptLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherValue, setOtherValue] = useState('');

  // Email capture
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [proceedToAssess, setProceedToAssess] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, step, showEmailCapture, conceptLoading, concept]);

  useEffect(() => {
    if (phase === 'tree' && messages.length === 0) {
      setMessages([{ role: 'assistant', content: 'Is the thing you want to build more about...' }]);
    }
  }, [phase, messages.length]);

  useEffect(() => {
    if (proceedToAssess && concept) {
      const timeout = setTimeout(() => {
        navigate('/assess', { state: { concept, autoSubmit: true } });
      }, emailSaved ? 800 : 100);
      return () => clearTimeout(timeout);
    }
  }, [proceedToAssess, concept, emailSaved, navigate]);

  // ---------- handlers ----------

  function selectStep1(value: 'job' | 'hobby', label: string) {
    setBranch(value);
    const nextMsg = value === 'job' ? 'What kind of work do you do?' : "What's the interest?";
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: label },
      { role: 'assistant', content: nextMsg },
    ]);
    setOtherOpen(false);
    setOtherValue('');
    setStep(2);
  }

  function selectStep2(answer: string) {
    setRole(answer);
    const nextMsg = branch === 'job'
      ? 'How do you handle that kind of thing today?'
      : 'How do you currently manage it?';
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: answer },
      { role: 'assistant', content: nextMsg },
    ]);
    setOtherOpen(false);
    setOtherValue('');
    setStep(3);
  }

  async function selectStep3(answer: string) {
    setMethod(answer);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: answer },
      { role: 'assistant', content: "OK \u2014 I've got what I need." },
    ]);
    setOtherOpen(false);
    setOtherValue('');
    setStep('concept');

    setConceptLoading(true);
    setError(null);
    try {
      const client = getClient();
      const response = await client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 100,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: CONCEPT_PROMPT },
          {
            role: 'user',
            content: `Branch: ${branch}\nRole/interest: ${role}\nCurrent method: ${answer}`,
          },
        ],
      });

      const text = response.choices[0]?.message?.content ?? '';
      const parsed = JSON.parse(text) as { concept: string };

      await new Promise((r) => setTimeout(r, 600));

      setConcept(parsed.concept);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `You're describing: ${parsed.concept}` },
      ]);
      setShowEmailCapture(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setConceptLoading(false);
    }
  }

  function handleOtherSubmit() {
    const trimmed = otherValue.trim();
    if (!trimmed) return;
    if (step === 2) selectStep2(trimmed);
    else if (step === 3) selectStep3(trimmed);
  }

  function handleSaveEmail() {
    if (!email.trim() || !concept) return;
    const saved = JSON.parse(localStorage.getItem('launchable_leads') ?? '[]');
    saved.push({ email: email.trim(), concept, timestamp: Date.now() });
    localStorage.setItem('launchable_leads', JSON.stringify(saved));
    setEmailSaved(true);
    setTimeout(() => {
      setShowEmailCapture(false);
      setProceedToAssess(true);
    }, 600);
  }

  function handleSkipEmail() {
    setShowEmailCapture(false);
    setProceedToAssess(true);
  }

  // ---------- pill renderer ----------

  function renderPills(
    options: string[],
    onSelect: (v: string) => void,
    showOther: boolean,
  ) {
    return (
      <div className="space-y-2 pl-1 pt-1">
        <div className="flex flex-wrap gap-2">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => onSelect(opt)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer min-h-[44px]"
            >
              {opt}
            </button>
          ))}
          {showOther ? (
            <button
              onClick={() => setOtherOpen(true)}
              className={`rounded-full border px-4 py-2.5 text-sm transition-all cursor-pointer min-h-[44px] ${
                otherOpen
                  ? 'border-orange-300 text-orange-500'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500'
              }`}
            >
              Other...
            </button>
          ) : null}
        </div>
        {otherOpen ? (
          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleOtherSubmit(); } }}
              placeholder="Type yours..."
              autoFocus
              className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 min-h-[44px]"
            />
            <button
              onClick={handleOtherSubmit}
              disabled={!otherValue.trim()}
              className="rounded-full bg-gradient-to-r from-orange-400 to-pink-400 px-3 py-2.5 text-white hover:from-orange-500 hover:to-pink-500 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed min-h-[44px]"
            >
              <SendHorizonal className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    );
  }

  // ---------- interstitial ----------

  if (phase === 'interstitial') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-md space-y-8">
          <div className="space-y-3">
            <p className="text-xl text-gray-900 leading-relaxed">
              You just saw someone build an app in 20 minutes and thought — <em className="text-gray-500">I could do that.</em>
            </p>
            <p className="text-gray-400 text-sm">Let's find your idea.</p>
          </div>
          <button
            onClick={() => setPhase('tree')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-6 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all cursor-pointer shadow-sm"
          >
            Let's go
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // ---------- pill tree ----------

  return (
    <div className="min-h-screen bg-white flex flex-col max-w-2xl mx-auto px-4">
      <header className="flex items-center gap-3 py-4 shrink-0">
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
          <span className="font-bold text-sm">Launchable</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {/* Thread */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-gray-50 text-gray-700'
                  : 'bg-gradient-to-r from-orange-400 to-pink-400 text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Active pills */}
        {step === 1 ? (
          <div className="flex flex-wrap gap-2 pl-1 pt-1">
            {STEP1_PILLS.map((p) => (
              <button
                key={p.value}
                onClick={() => selectStep1(p.value, p.label)}
                className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer min-h-[44px]"
              >
                {p.label}
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? renderPills(
          branch === 'job' ? JOB_PILLS : HOBBY_PILLS,
          selectStep2,
          true,
        ) : null}

        {step === 3 ? renderPills(
          branch === 'job' ? JOB_METHOD_PILLS : HOBBY_METHOD_PILLS,
          selectStep3,
          true,
        ) : null}

        {/* Concept loading */}
        {conceptLoading ? (
          <div className="flex items-center gap-2 pl-1 pt-2">
            <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
            <span className="text-sm text-gray-400">Forming your idea...</span>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {/* Email capture */}
        {showEmailCapture && !proceedToAssess ? (
          <div className="space-y-2">
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
                Want to save this idea and come back to it?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[80%] w-full space-y-2">
                {emailSaved ? (
                  <p className="text-sm text-orange-500 px-1">Saved.</p>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSaveEmail(); } }}
                        className="flex-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                      />
                      <button
                        onClick={handleSaveEmail}
                        disabled={!email.trim()}
                        className="rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-2.5 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-colors disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      >
                        Save it
                      </button>
                    </div>
                    <button
                      onClick={handleSkipEmail}
                      className="text-xs text-gray-400 hover:text-gray-500 transition-colors cursor-pointer px-1"
                    >
                      No thanks, just show me the assessment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Assessing transition */}
        {proceedToAssess && concept ? (
          <div className="flex items-center gap-2 justify-center pt-4">
            <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
            <span className="text-sm text-gray-400">Assessing your idea...</span>
          </div>
        ) : null}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
