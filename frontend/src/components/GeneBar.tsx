import { cn } from '../lib/utils';

interface GeneBarProps {
  label: string;
  score: number;
  color: string;
}

export default function GeneBar({ label, score, color }: GeneBarProps) {
  const pct = Math.round(score * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="font-mono font-medium" style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
