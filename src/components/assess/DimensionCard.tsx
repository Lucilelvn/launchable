import { useEffect, useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';
import type { DimensionScore } from '../../types';

interface DimensionCardProps {
  label: string;
  dimension: DimensionScore;
  icon: React.ReactNode;
  color: string;
  delay?: number;
  delta?: number;
}

export default function DimensionCard({ label, dimension, icon, color, delay = 0, delta }: DimensionCardProps) {
  const [animated, setAnimated] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const hasEvidence = dimension.evidence && dimension.evidence.length > 0;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = animated ? dimension.score / 10 : 0;
  const offset = circumference * (1 - progress);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 flex flex-col items-center text-center space-y-3">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="6"
          />
          <circle
            cx="40" cy="40" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{dimension.score}</span>
        </div>
      </div>
      {delta !== undefined && delta !== 0 ? (
        <div className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
          delta > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
        }`}>
          {delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta > 0 ? '+' : ''}{delta}
        </div>
      ) : null}
      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
        {icon}
        {label}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{dimension.summary}</p>
      {hasEvidence ? (
        <div className="w-full">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600 transition-colors cursor-pointer mx-auto"
          >
            <span>{showEvidence ? 'Hide' : 'Show'} evidence</span>
            <ChevronDown className={`h-3 w-3 transition-transform ${showEvidence ? 'rotate-180' : ''}`} />
          </button>
          {showEvidence ? (
            <ul className="mt-2 space-y-1.5 text-left">
              {dimension.evidence.map((e, i) => (
                <li key={i} className="text-[11px] text-gray-500 leading-relaxed">
                  <span className="text-gray-300 mr-1">&bull;</span>
                  {e.text}
                  {e.source ? (
                    <a
                      href={e.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-orange-400 hover:text-orange-500 underline"
                    >
                      source
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
