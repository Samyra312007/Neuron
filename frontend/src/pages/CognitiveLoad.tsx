import { useCognitiveLoad, useAnalyzeCognitiveLoad } from '../hooks/useCognitiveLoad';
import CognitiveHeatmap from '../components/CognitiveHeatmap';
import MetricCard from '../components/MetricCard';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function CognitiveLoad() {
  const { data: metric, isLoading, error } = useCognitiveLoad();
  const analyze = useAnalyzeCognitiveLoad();

  const heatmapData = metric?.team_breakdown
    ? Object.entries(metric.team_breakdown).map(([team, score]) => ({
        team,
        metrics: [
          { label: 'Composite', value: (score as number) || 0, color: (score as number) > 0.6 ? '#ef4444' : (score as number) > 0.3 ? '#f59e0b' : '#10b981' },
        ],
      }))
    : [];

  if (!error && !isLoading && metric?.team_breakdown) {
    const labels = ['Workload', 'Interactn', 'Meetings', 'Fragmentn', 'Decision Fat.', 'Burnout'];
    const values = [
      metric.workload_score,
      metric.interaction_density,
      metric.meeting_pressure,
      metric.task_fragmentation,
      metric.decision_fatigue,
      metric.burnout_risk,
    ];
    heatmapData.unshift({
      team: 'ORG AVG',
      metrics: values.map((v, i) => ({
        label: labels[i],
        value: v,
        color: v > 0.6 ? '#ef4444' : v > 0.3 ? '#f59e0b' : '#10b981',
      })),
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cognitive Load</h1>
          <p className="text-gray-400 mt-1">Team overload, burnout risk & interaction density</p>
        </div>
        <button
          onClick={() => analyze.mutate()}
          disabled={analyze.isPending}
          className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {analyze.isPending ? 'Analyzing...' : 'Analyze Cognitive Load'}
        </button>
      </div>

      {error && (
        <AlertBanner type="info">
          No cognitive load data yet. Click <strong>"Analyze Cognitive Load"</strong> to begin.
        </AlertBanner>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : metric ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <MetricCard title="Workload" value={`${Math.round(metric.workload_score * 100)}%`} subtitle="Volume vs capacity" icon="📊" color="#f59e0b" />
            <MetricCard title="Interactions" value={`${Math.round(metric.interaction_density * 100)}%`} subtitle="Cross-team pings" icon="🔄" color="#00b8f0" />
            <MetricCard title="Meeting Pressure" value={`${Math.round(metric.meeting_pressure * 100)}%`} subtitle="Meeting vs focus time" icon="📅" color="#8b5cf6" />
            <MetricCard title="Fragmentation" value={`${Math.round(metric.task_fragmentation * 100)}%`} subtitle="Context switches" icon="🧩" color="#ef4444" />
            <MetricCard title="Decision Fatigue" value={`${Math.round(metric.decision_fatigue * 100)}%`} subtitle="Decisions per day" icon="🧠" color="#f97316" />
            <MetricCard title="Burnout Risk" value={`${Math.round(metric.burnout_risk * 100)}%`} subtitle="Exhaustion risk" icon="🔥" color={metric.burnout_risk > 0.6 ? '#ef4444' : '#10b981'} />
          </div>

          <div className="neuron-card">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Composite Score</h2>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${metric.composite_score > 0.6 ? 'text-red-400' : metric.composite_score > 0.3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {Math.round(metric.composite_score * 100)}%
              </div>
              <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${metric.composite_score > 0.6 ? 'bg-red-500' : metric.composite_score > 0.3 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                  style={{ width: `${metric.composite_score * 100}%` }}
                />
              </div>
            </div>
          </div>

          {heatmapData.length > 0 && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-4">Team Breakdown Heatmap</h2>
              <CognitiveHeatmap data={heatmapData} />
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
