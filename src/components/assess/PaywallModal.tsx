import { X, Zap } from 'lucide-react';

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

export default function PaywallModal({ open, onClose }: PaywallModalProps) {
  if (!open) return null;

  const priceId = import.meta.env.VITE_STRIPE_PRICE_ID as string | undefined;

  function handleUpgrade() {
    if (!priceId) return;
    const successUrl = `${window.location.origin}/assess?upgraded=true`;
    const cancelUrl = window.location.href;
    window.location.href = `https://buy.stripe.com/${priceId}?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
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
            Upgrade to get unlimited idea assessments, mutations, and build prompts.
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

        <button
          onClick={handleUpgrade}
          disabled={!priceId}
          className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Upgrade Now
        </button>
      </div>
    </div>
  );
}
