import { useCallback } from 'react';
import { useGenome, useAnalyzeGenome } from '../hooks/useGenome';
import { useDarkMatter, useAnalyzeDarkMatter } from '../hooks/useDarkMatter';
import { useInfections, useAnalyzeInfections } from '../hooks/useImmune';
import { useMetabolic, useAnalyzeMetabolic } from '../hooks/useMetabolic';
import { usePolling } from '../hooks/usePolling';
import { useQueryClient } from '@tanstack/react-query';
import HealthGauge from '../components/HealthGauge';
import MetricCard from '../components/MetricCard';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const qc = useQueryClient();
  const { data: genome, isLoading: genomeLoading, error: genomeError } = useGenome();
  const { data: darkMatter, isLoading: dmLoading } = useDarkMatter();
  const { data: infections, isLoading: infLoading } = useInfections();
  const { data: metabolic, isLoading: metLoading } = useMetabolic();

  const analyzeGenome = useAnalyzeGenome();
  const analyzeDM = useAnalyzeDarkMatter();
  const analyzeInf = useAnalyzeInfections();
  const analyzeMet = useAnalyzeMetabolic();

  usePolling(useCallback(() => {
    qc.invalidateQueries({ queryKey: ['genome'] });
    qc.invalidateQueries({ queryKey: ['darkMatter'] });
    qc.invalidateQueries({ queryKey: ['infections'] });
    qc.invalidateQueries({ queryKey: ['metabolic'] });
  }, [qc]), 30000);

  const isLoading = genomeLoading || dmLoading || infLoading || metLoading;

  const handleRunAll = () => {
    analyzeGenome.mutate();
    analyzeDM.mutate();
    analyzeInf.mutate();
    analyzeMet.mutate();
  };

  const isRunning = analyzeGenome.isPending || analyzeDM.isPending || analyzeInf.isPending || analyzeMet.isPending;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Organizational Health Overview</p>
        </div>
        <button
          onClick={handleRunAll}
          disabled={isRunning}
          className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {isRunning ? 'Analyzing...' : 'Run All Agents'}
        </button>
      </div>

      {genomeError && (
        <AlertBanner type="info">
          No data yet. Click <strong>"Run All Agents"</strong> to generate your first insights.
        </AlertBanner>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="neuron-card flex items-center justify-center">
              <HealthGauge score={genome?.health_score ?? 0} />
            </div>
            <MetricCard
              title="Genome Score"
              value={genome ? `${Math.round(genome.health_score * 100)}%` : 'N/A'}
              subtitle="Overall org health"
              icon="🧬"
              color="#00b8f0"
            />
            <MetricCard
              title="Dark Matter Cost"
              value={darkMatter ? formatCurrency(Number(darkMatter.total_cost)) : '₹0'}
              subtitle="Invisible work / month"
              icon="◈"
              color="#f59e0b"
            />
            <MetricCard
              title="Active Infections"
              value={String(infections?.length ?? 0)}
              subtitle="Health threats"
              icon="🛡"
              color={infections && infections.length > 0 ? '#ef4444' : '#10b981'}
            />
            <MetricCard
              title="Metabolic Rate"
              value={metabolic ? `${Math.round(metabolic.composite_score * 100)}%` : 'N/A'}
              subtitle="Org velocity"
              icon="⚡"
              color="#8b5cf6"
            />
          </div>

          {genome?.summary && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Executive Summary</h2>
              <p className="text-gray-200 text-sm leading-relaxed">{genome.summary}</p>
            </div>
          )}

          {infections && infections.length > 0 && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Active Infections</h2>
              <div className="space-y-2">
                {infections.slice(0, 3).map((inf) => (
                  <div key={inf.id} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full ${
                      inf.severity === 'high' ? 'bg-red-500' : inf.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`} />
                    <span className="text-gray-300">{inf.infection_type}</span>
                    <span className="text-gray-500 ml-auto">{inf.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
