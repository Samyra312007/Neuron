import { cn } from '../lib/utils';

interface HealthGaugeProps {
  score: number;
  size?: number;
  className?: string;
}

export default function HealthGauge({ score, size = 180, className }: HealthGaugeProps) {
  const radius = size * 0.4;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 1);
  const offset = circumference * (1 - progress);
  const strokeWidth = size * 0.06;

  const color = progress > 0.7 ? '#10b981' : progress > 0.4 ? '#f59e0b' : '#ef4444';
  const label = progress > 0.7 ? 'Healthy' : progress > 0.4 ? 'At Risk' : 'Critical';

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(55, 65, 81)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color }}>{Math.round(progress * 100)}</span>
        <span className="text-xs text-gray-400 mt-1">{label}</span>
      </div>
    </div>
  );
}
