import { useCallback, useRef } from 'react';
import { useGenome, useAnalyzeGenome } from '../hooks/useGenome';
import { useDarkMatter, useAnalyzeDarkMatter } from '../hooks/useDarkMatter';
import { useInfections, useAnalyzeInfections } from '../hooks/useImmune';
import { useMetabolic, useAnalyzeMetabolic } from '../hooks/useMetabolic';
import { useCognitiveLoad, useAnalyzeCognitiveLoad } from '../hooks/useCognitiveLoad';
import { useActivity } from '../hooks/useActivity';
import { useBenchmarks } from '../hooks/useBenchmarks';
import { useSentiment } from '../hooks/useSentiment';
import { useVulnerabilities } from '../hooks/useVulnerability';
import { useTeamFilter } from '../hooks/useTeamFilter';
import { usePolling } from '../hooks/usePolling';
import { getExportAllPdfUrl, triggerBlobDownload } from '../api/exportAll';
import { useToast } from '../components/Toast';
import { useQueryClient } from '@tanstack/react-query';
import HealthGauge from '../components/HealthGauge';
import MetricCard from '../components/MetricCard';
import TeamFilter from '../components/TeamFilter';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatCurrency } from '../lib/utils';

export default function Dashboard() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const prevInfectionCount = useRef<number | null>(null);

  const { data: genome, isLoading: genomeLoading, error: genomeError } = useGenome();
  const { data: darkMatter, isLoading: dmLoading } = useDarkMatter();
  const { data: infections, isLoading: infLoading } = useInfections();
  const { data: metabolic, isLoading: metLoading } = useMetabolic();
  const { data: cognitiveLoad, isLoading: clLoading } = useCognitiveLoad();
  const { data: activityFeed } = useActivity(10);
  const { teamId, setTeamId } = useTeamFilter();
  const { data: benchmarks } = useBenchmarks();
  const { data: sentiment } = useSentiment();
  const { data: vuln } = useVulnerabilities();

  const curCount = infections?.length ?? 0;
  if (prevInfectionCount.current !== null && curCount !== prevInfectionCount.current && curCount > 0) {
    const diff = curCount - prevInfectionCount.current;
    if (diff > 0) {
      addToast(`${diff} new infection${diff > 1 ? 's' : ''} detected`, 'error');
    } else {
      addToast(`${Math.abs(diff)} infection${Math.abs(diff) > 1 ? 's' : ''} resolved`, 'success');
    }
  }
  prevInfectionCount.current = curCount;

  const analyzeGenome = useAnalyzeGenome();
  const analyzeDM = useAnalyzeDarkMatter();
  const analyzeInf = useAnalyzeInfections();
  const analyzeMet = useAnalyzeMetabolic();
  const analyzeCL = useAnalyzeCognitiveLoad();

  usePolling(useCallback(() => {
    qc.invalidateQueries({ queryKey: ['genome'] });
    qc.invalidateQueries({ queryKey: ['darkMatter'] });
    qc.invalidateQueries({ queryKey: ['infections'] });
    qc.invalidateQueries({ queryKey: ['metabolic'] });
    qc.invalidateQueries({ queryKey: ['cognitiveLoad'] });
  }, [qc]), 30000);

  const isLoading = genomeLoading || dmLoading || infLoading || metLoading || clLoading;

  const handleRunAll = () => {
    analyzeGenome.mutate();
    analyzeDM.mutate();
    analyzeInf.mutate();
    analyzeMet.mutate();
    analyzeCL.mutate();
  };

  const isRunning = analyzeGenome.isPending || analyzeDM.isPending || analyzeInf.isPending || analyzeMet.isPending || analyzeCL.isPending;

  const handleExportAll = useCallback(async () => {
    const url = await getExportAllPdfUrl();
    await triggerBlobDownload(url, 'neuron_full_report.pdf');
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Organizational Health Overview</p>
        </div>
        <div className="flex items-center gap-2">
          <TeamFilter value={teamId} onChange={setTeamId} />
          <button onClick={handleExportAll} className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">Export All</button>
          <button
            onClick={handleRunAll}
            disabled={isRunning}
            className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {isRunning ? 'Analyzing...' : 'Run All Agents'}
          </button>
        </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <MetricCard
              title="Cognitive Load"
              value={cognitiveLoad ? `${Math.round(cognitiveLoad.composite_score * 100)}%` : 'N/A'}
              subtitle="Burnout risk"
              icon="🧠"
              color={cognitiveLoad?.composite_score && cognitiveLoad.composite_score > 0.6 ? '#ef4444' : '#8b5cf6'}
            />
            <MetricCard
              title="Sentiment"
              value={sentiment ? sentiment.trend : 'N/A'}
              subtitle={`Avg: ${sentiment?.avg_sentiment ?? 0}`}
              icon="💬"
              color={sentiment?.avg_sentiment && sentiment.avg_sentiment > 0 ? '#10b981' : '#ef4444'}
            />
            <MetricCard
              title="Vulnerabilities"
              value={vuln ? String(vuln.vulnerabilities.length) : '0'}
              subtitle="Knowledge risks"
              icon="⚠"
              color={vuln?.vulnerabilities && vuln.vulnerabilities.length > 0 ? '#ef4444' : '#10b981'}
            />
          </div>

          {genome?.summary && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Executive Summary</h2>
              <p className="text-gray-200 text-sm leading-relaxed">{genome.summary}</p>
            </div>
          )}

          {benchmarks && benchmarks.benchmarks.length > 0 && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Industry Benchmark Comparison <span className="text-xs text-gray-600 font-normal">({benchmarks.industry_label})</span></h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                      <th className="pb-2 font-medium">Metric</th>
                      <th className="pb-2 font-medium">Your Org</th>
                      <th className="pb-2 font-medium">Industry Avg</th>
                      <th className="pb-2 font-medium">Top Quartile</th>
                      <th className="pb-2 font-medium">Gap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benchmarks.benchmarks.map((b, i) => (
                      <tr key={i} className="border-b border-gray-800/50">
                        <td className="py-2 text-gray-300">{b.metric}</td>
                        <td className="py-2 text-white">{b.current}</td>
                        <td className="py-2 text-gray-400">{b.industry_avg}</td>
                        <td className="py-2 text-gray-400">{b.top_quartile}</td>
                        <td className={`py-2 ${b.gap_vs_avg > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {b.gap_vs_avg > 0 ? '+' : ''}{b.gap_vs_avg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {infections && infections.length > 0 && (
              <div className="neuron-card">
                <h2 className="text-sm font-semibold text-gray-400 mb-3">Active Infections</h2>
                <div className="space-y-2">
                  {infections.slice(0, 5).map((inf) => (
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

            {activityFeed && activityFeed.length > 0 && (
              <div className="neuron-card">
                <h2 className="text-sm font-semibold text-gray-400 mb-3">Activity Feed</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activityFeed.map((ev) => (
                    <div key={ev.id} className="flex items-start gap-2 text-xs">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                        ev.severity === 'critical' ? 'bg-red-500' :
                        ev.severity === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-300 truncate">{ev.description}</p>
                        <p className="text-gray-600">{ev.source} · {new Date(ev.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
