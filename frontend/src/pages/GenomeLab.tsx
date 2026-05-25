import { useGenome, useAnalyzeGenome } from '../hooks/useGenome';
import GeneBar from '../components/GeneBar';
import HealthGauge from '../components/HealthGauge';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { GENE_LABELS } from '../types';

const GENE_COLORS: Record<string, string> = {
  collaboration: '#00b8f0',
  decision_making: '#8b5cf6',
  knowledge_flow: '#10b981',
  innovation: '#f59e0b',
  resilience: '#ef4444',
  vitality: '#ec4899',
};

export default function GenomeLab() {
  const { data: genome, isLoading, error } = useGenome();
  const analyze = useAnalyzeGenome();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Genome Lab</h1>
          <p className="text-gray-400 mt-1">Organizational DNA Sequencing</p>
        </div>
        <button
          onClick={() => analyze.mutate()}
          disabled={analyze.isPending}
          className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {analyze.isPending ? 'Sequencing...' : 'Sequence Genome'}
        </button>
      </div>

      {error && (
        <AlertBanner type="info">
          No genome data yet. Click <strong>"Sequence Genome"</strong> to analyze your organization.
        </AlertBanner>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={8} />
      ) : genome ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="neuron-card flex items-center justify-center">
              <HealthGauge score={genome.health_score} />
            </div>
            <div className="lg:col-span-2 neuron-card space-y-5">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Gene Expression</h2>
              {Object.entries(GENE_LABELS).map(([key, label]) => (
                <GeneBar
                  key={key}
                  label={label}
                  score={genome[key as keyof typeof genome] as number}
                  color={GENE_COLORS[key] || '#6366f1'}
                />
              ))}
            </div>
          </div>

          {genome.summary && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Genome Summary</h2>
              <p className="text-gray-200 text-sm leading-relaxed">{genome.summary}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
