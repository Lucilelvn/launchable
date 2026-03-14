import { Shuffle, Target, Rocket } from 'lucide-react';
import type { AssessmentMutation } from '../../types';

interface MutationCardProps {
  mutation: AssessmentMutation;
  selected: boolean;
  onSelect: () => void;
}

const TYPE_CONFIG: Record<AssessmentMutation['type'], { label: string; icon: typeof Shuffle; color: string }> = {
  pivot: { label: 'Pivot', icon: Shuffle, color: '#f59e0b' },
  niche: { label: 'Go Niche', icon: Target, color: '#8b5cf6' },
  expand: { label: 'Go Bigger', icon: Rocket, color: '#06b6d4' },
};

export default function MutationCard({ mutation, selected, onSelect }: MutationCardProps) {
  const config = TYPE_CONFIG[mutation.type];
  const Icon = config.icon;

  return (
    <button
      onClick={onSelect}
      className={`group text-left rounded-xl border p-3.5 transition-all duration-200 cursor-pointer w-full ${
        selected
          ? 'border-orange-300 bg-orange-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <div
          className="shrink-0 rounded-md p-1.5 mt-0.5"
          style={{ backgroundColor: `${config.color}15` }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
        </div>
        <div className="min-w-0">
          <span
            className="text-[10px] font-bold uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
          <p className="text-xs text-gray-700 mt-0.5 leading-relaxed">{mutation.idea}</p>
        </div>
      </div>
    </button>
  );
}
