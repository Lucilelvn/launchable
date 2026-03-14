import { useEffect, useState } from 'react';
import type { DimensionScore } from '../../types';

interface DimensionCardProps {
  label: string;
  dimension: DimensionScore;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

export default function DimensionCard({ label, dimension, icon, color, delay = 0 }: DimensionCardProps) {
  const [animated, setAnimated] = useState(false);

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
      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
        {icon}
        {label}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed">{dimension.summary}</p>
    </div>
  );
}
