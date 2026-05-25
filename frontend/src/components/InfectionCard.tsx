import { cn } from '../lib/utils';

interface InfectionCardProps {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  spreadCount: number;
  treatment: string | null;
  onTreat?: () => void;
}

const severityColors = {
  low: 'bg-infection-low/10 border-infection-low/20 text-infection-low',
  medium: 'bg-infection-medium/10 border-infection-medium/20 text-infection-medium',
  high: 'bg-infection-high/10 border-infection-high/20 text-infection-high',
};

export default function InfectionCard({ type, severity, description, spreadCount, treatment, onTreat }: InfectionCardProps) {
  return (
    <div className="neuron-card space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">{type}</h3>
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium border', severityColors[severity])}>
              {severity}
            </span>
          </div>
          <p className="text-sm text-gray-400 mt-1">{description}</p>
        </div>
        <span className="text-sm text-gray-500 whitespace-nowrap">Spread: {spreadCount} teams</span>
      </div>
      {treatment && (
        <div className="bg-gray-800/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Recommended Treatment</p>
          <p className="text-sm text-gray-300">{treatment}</p>
        </div>
      )}
      {onTreat && (
        <button
          onClick={onTreat}
          className="w-full py-2 px-4 bg-neuron-500/10 hover:bg-neuron-500/20 border border-neuron-500/20 rounded-lg text-sm text-neuron-400 font-medium transition-colors"
        >
          Apply Treatment
        </button>
      )}
    </div>
  );
}
