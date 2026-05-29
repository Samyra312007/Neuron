import { useCallback, useRef, useState, useEffect } from 'react';
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
import TeamFilter from '../components/TeamFilter';
import Icon from '../components/Icon';
import { formatCurrency, scoreColor } from '../lib/utils';

function MiniGauge({ score, size = 88 }: { score: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score);
  const color = scoreColor(score);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 text-neutral-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold font-display" style={{ color }}>{Math.round(score * 100)}%</span>
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, trend }: { title: string; value: string; subtitle: string; icon: string; color: string; trend?: { dir: 'up' | 'down' | 'neutral'; label: string } }) {
  return (
    <div className="card hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon name={icon} size={20} style={{ color }} />
        </div>
        {trend && (
          <span className={`text-xs font-medium flex items-center gap-0.5 ${
            trend.dir === 'up' ? 'text-health-optimal' : trend.dir === 'down' ? 'text-health-critical' : 'text-neutral-50'
          }`}>
            <Icon name={trend.dir === 'up' ? 'trending_up' : trend.dir === 'down' ? 'trending_down' : 'remove'} size={14} />
            {trend.label}
          </span>
        )}
      </div>
      <div className="metric-value" style={{ color }}>{value}</div>
      <div className="text-xs text-neutral-50 mt-0.5">{title}</div>
      <div className="text-[10px] text-neutral-60 mt-0.5">{subtitle}</div>
    </div>
  );
}

function ActivityItem({ ev }: { ev: any }) {
  const severityDot = ev.severity === 'critical' ? 'bg-health-critical' : ev.severity === 'warning' ? 'bg-health-functional' : 'bg-neutral-70';
  return (
    <div className="flex items-start gap-3 px-4 py-3 hover:bg-surface-container rounded-xl transition-colors group">
      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 animate-pulse-dot ${severityDot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-30 truncate group-hover:text-neutral-10 transition-colors">{ev.description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-neutral-50 font-mono">{new Date(ev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-[11px] text-neutral-60">·</span>
          <span className="text-[11px] text-neutral-60 capitalize">{ev.source}</span>
        </div>
      </div>
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
        ev.severity === 'critical' ? 'bg-health-critical/10 text-health-critical' :
        ev.severity === 'warning' ? 'bg-health-functional/10 text-health-functional' :
        'bg-neutral-80/50 text-neutral-50'
      }`}>{ev.severity}</span>
    </div>
  );
}

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
  const [activeTab, setActiveTab] = useState<'all' | 'activity' | 'benchmarks'>('all');

  const curCount = infections?.length ?? 0;
  useEffect(() => {
    if (prevInfectionCount.current !== null && curCount !== prevInfectionCount.current && curCount > 0) {
      const diff = curCount - prevInfectionCount.current;
      addToast(diff > 0 ? `${diff} new infection${diff > 1 ? 's' : ''} detected` : `${Math.abs(diff)} infection${Math.abs(diff) > 1 ? 's' : ''} resolved`, diff > 0 ? 'error' : 'success');
    }
    prevInfectionCount.current = curCount;
  }, [curCount, addToast]);

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

  const handleRunAll = () => {
    analyzeGenome.mutate(); analyzeDM.mutate(); analyzeInf.mutate(); analyzeMet.mutate(); analyzeCL.mutate();
  };

  const isRunning = analyzeGenome.isPending || analyzeDM.isPending || analyzeInf.isPending || analyzeMet.isPending || analyzeCL.isPending;

  const handleExportAll = useCallback(async () => {
    const url = await getExportAllPdfUrl();
    await triggerBlobDownload(url, 'neuron_full_report.pdf');
  }, []);

  const hasData = genome?.health_score != null;

  if (!hasData && !genomeLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-20 h-20 rounded-2xl bg-primary-95 flex items-center justify-center">
          <Icon name="dashboard" size={40} className="text-primary-40" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">Welcome to NEURON</h2>
          <p className="text-sm text-neutral-50">Run your first analysis to discover your organization's genome, dark matter, and health metrics.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRunAll} disabled={isRunning} className="btn-primary gap-2">
            <Icon name="play_arrow" size={18} />{isRunning ? 'Analyzing...' : 'Run All Agents'}
          </button>
          <TeamFilter value={teamId} onChange={setTeamId} />
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'all' as const, label: 'Overview', icon: 'grid_view' },
    { id: 'activity' as const, label: 'Activity', icon: 'monitoring' },
    { id: 'benchmarks' as const, label: 'Benchmarks', icon: 'bar_chart' },
  ];

  return (
    <div className="space-y-6">
      {/* Actions bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-surface-container-lowest rounded-xl p-1 border border-neutral-80/40 shadow-card">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.id ? 'bg-primary-20 text-white shadow-sm' : 'text-neutral-50 hover:text-neutral-30'
              }`}>
              <Icon name={t.icon} size={16} />{t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <TeamFilter value={teamId} onChange={setTeamId} />
          <button onClick={handleExportAll} className="btn-secondary"><Icon name="download" size={16} />Export</button>
          <button onClick={handleRunAll} disabled={isRunning} className="btn-primary gap-2">
            <Icon name="play_arrow" size={18} />{isRunning ? 'Analyzing...' : 'Run All'}
          </button>
        </div>
      </div>

      {/* Metric cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card flex flex-col items-center justify-center py-6 hover:shadow-card-hover transition-shadow">
          <MiniGauge score={genome?.health_score ?? 0} size={100} />
          <div className="text-xs text-neutral-50 mt-2 text-center">
            <span className="font-semibold text-neutral-30">Organizational Health</span><br />Overall wellness score
          </div>
        </div>
        <StatCard title="Genome Score" value={genome ? `${Math.round(genome.health_score * 100)}%` : 'N/A'} subtitle="Overall org health" icon="genetics" color="#065291" />
        <StatCard title="Dark Matter Cost" value={darkMatter ? formatCurrency(Number(darkMatter.total_cost)) : '₹0'} subtitle="Invisible work / month" icon="radar" color="#8B5CF6" />
        <StatCard title="Active Infections" value={String(infections?.length ?? 0)} subtitle="Health threats" icon="verified" color={infections && infections.length > 0 ? '#EF4444' : '#22C55E'} />
        <StatCard title="Metabolic Rate" value={metabolic ? `${Math.round(metabolic.composite_score * 100)}%` : 'N/A'} subtitle="Org velocity" icon="speed" color="#006972" />
        <StatCard title="Cognitive Load" value={cognitiveLoad ? `${Math.round(cognitiveLoad.composite_score * 100)}%` : 'N/A'} subtitle="Burnout risk" icon="psychiatry" color={cognitiveLoad?.composite_score && cognitiveLoad.composite_score > 0.6 ? '#EF4444' : '#8B5CF6'} />
        <StatCard title="Sentiment" value={sentiment ? sentiment.trend : 'N/A'} subtitle={`Avg: ${sentiment?.avg_sentiment ?? 0}`} icon="sentiment_satisfied" color="#22C55E" />
        <StatCard title="Vulnerabilities" value={vuln ? String(vuln.vulnerabilities.length) : '0'} subtitle="Knowledge risks" icon="warning" color={vuln?.vulnerabilities && vuln.vulnerabilities.length > 0 ? '#EF4444' : '#22C55E'} />
      </div>

      {/* Executive Summary */}
      {genome?.summary && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="summarize" size={18} className="text-primary-40" />
            <h3 className="section-label">Executive Summary</h3>
          </div>
          <p className="text-sm text-neutral-30 leading-relaxed">{genome.summary}</p>
        </div>
      )}

      {/* Two-column: In focus + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* In focus */}
        {infections && infections.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="warning" size={18} className="text-health-critical" />
                <h3 className="section-label">Active Threats</h3>
              </div>
              <span className="badge bg-health-critical/10 text-health-critical text-[10px]">{infections.length} active</span>
            </div>
            <div className="space-y-2">
              {infections.slice(0, 5).map((inf) => (
                <div key={inf.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors">
                  <span className={`w-2 h-2 rounded-full ${
                    inf.severity === 'high' ? 'bg-health-critical' : inf.severity === 'medium' ? 'bg-health-functional' : 'bg-health-optimal'
                  }`} />
                  <span className="text-sm text-neutral-30 flex-1">{inf.infection_type}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    inf.severity === 'high' ? 'bg-health-critical/10 text-health-critical' :
                    inf.severity === 'medium' ? 'bg-health-functional/10 text-health-functional' :
                    'bg-health-optimal/10 text-health-optimal'
                  }`}>{inf.severity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity feed */}
        {activityFeed && activityFeed.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icon name="monitoring" size={18} className="text-primary-40" />
                <h3 className="section-label">Activity Feed</h3>
              </div>
              <span className="text-[10px] text-neutral-50">{activityFeed.length} events</span>
            </div>
            <div className="divide-y divide-neutral-80/30 max-h-[280px] overflow-y-auto -mx-4 -mb-4">
              {activityFeed.map((ev) => <ActivityItem key={ev.id} ev={ev} />)}
            </div>
          </div>
        )}
      </div>

      {/* Benchmarks */}
      {benchmarks && benchmarks.benchmarks.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="bar_chart" size={18} className="text-primary-40" />
            <h3 className="section-label">Industry Benchmarks <span className="font-normal text-neutral-60">({benchmarks.industry_label})</span></h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-neutral-50 border-b border-neutral-80/50">
                  <th className="pb-2.5 font-medium text-[11px] uppercase tracking-wider">Metric</th>
                  <th className="pb-2.5 font-medium text-[11px] uppercase tracking-wider">Your Org</th>
                  <th className="pb-2.5 font-medium text-[11px] uppercase tracking-wider">Industry Avg</th>
                  <th className="pb-2.5 font-medium text-[11px] uppercase tracking-wider">Top Quartile</th>
                  <th className="pb-2.5 font-medium text-[11px] uppercase tracking-wider">Gap</th>
                  <th className="pb-2.5" />
                </tr>
              </thead>
              <tbody>
                {benchmarks.benchmarks.map((b, i) => (
                  <tr key={i} className="border-b border-neutral-80/20 hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 text-neutral-30 font-medium">{b.metric}</td>
                    <td className="py-3 text-neutral-20 font-semibold">{b.current}</td>
                    <td className="py-3 text-neutral-50">{b.industry_avg}</td>
                    <td className="py-3 text-neutral-50">{b.top_quartile}</td>
                    <td className={`py-3 font-medium ${b.gap_vs_avg > 0 ? 'text-health-optimal' : 'text-health-critical'}`}>
                      {b.gap_vs_avg > 0 ? '+' : ''}{b.gap_vs_avg}
                    </td>
                    <td className="py-3">
                      <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${b.gap_vs_avg > 0 ? 'bg-health-optimal' : 'bg-health-critical'}`}
                          style={{ width: `${Math.min(Math.abs(b.gap_vs_avg) * 10, 100)}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
