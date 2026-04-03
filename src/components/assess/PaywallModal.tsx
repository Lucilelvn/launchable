import { useState } from 'react';
import { X, Zap, Check } from 'lucide-react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaywallModal({ open, onClose }: PaywallModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const joinWaitlist = useMutation(api.waitlist.join);
  const waitlistStatus = useQuery(api.waitlist.check);

  if (!open) return null;

  const alreadyJoined = waitlistStatus?.joined || submitted;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    try {
      await joinWaitlist({ email: trimmed });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl bg-white border border-gray-200 p-8 max-w-md w-full space-y-6 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4 text-gray-400" />
        </button>

        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
            <Zap className="h-6 w-6 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">You've used all free assessments</h2>
          <p className="text-sm text-gray-500">
            Unlimited assessments are coming soon. Leave your email and we'll let you know when it's ready.
          </p>
        </div>

        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <span className="text-orange-400">&#10003;</span> Unlimited assessments
          </li>
          <li className="flex items-center gap-2">
            <span className="text-orange-400">&#10003;</span> AI wrapper detection
          </li>
          <li className="flex items-center gap-2">
            <span className="text-orange-400">&#10003;</span> Ready-to-paste build prompts
          </li>
          <li className="flex items-center gap-2">
            <span className="text-orange-400">&#10003;</span> Idea mutations & enhancements
          </li>
        </ul>

        {alreadyJoined ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">You're on the list! We'll email you when it's ready.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all cursor-pointer shadow-sm"
            >
              Join the waitlist
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
