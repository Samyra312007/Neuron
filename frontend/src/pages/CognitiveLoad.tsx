import { useMemo } from 'react';
import { useCognitiveLoad, useAnalyzeCognitiveLoad } from '../hooks/useCognitiveLoad';
import CognitiveHeatmap from '../components/CognitiveHeatmap';
import Icon from '../components/Icon';
import { scoreColor } from '../lib/utils';

function RiskGauge({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="card hover:shadow-card-hover transition-all">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <span className="text-lg font-bold font-display" style={{ color }}>{Math.round(value * 100)}%</span>
        </div>
        <span className="text-xs text-neutral-50">{label}</span>
      </div>
      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${value * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function CognitiveLoad() {
  const { data: metric, isLoading, error } = useCognitiveLoad();
  const analyze = useAnalyzeCognitiveLoad();

  const metrics = metric ? [
    { key: 'Workload', value: metric.workload_score, icon: 'assignment' as const, color: '#EAB308' },
    { key: 'Interactions', value: metric.interaction_density, icon: 'hub' as const, color: '#065291' },
    { key: 'Meeting Pressure', value: metric.meeting_pressure, icon: 'calendar_today' as const, color: '#8B5CF6' },
    { key: 'Fragmentation', value: metric.task_fragmentation, icon: 'puzzle' as const, color: '#EF4444' },
    { key: 'Decision Fatigue', value: metric.decision_fatigue, icon: 'psychology' as const, color: '#F97316' },
    { key: 'Burnout Risk', value: metric.burnout_risk, icon: 'local_fire_department' as const, color: metric.burnout_risk > 0.6 ? '#EF4444' : '#22C55E' },
  ] : [];

  const heatmapData = useMemo(() => {
    const base = metric?.team_breakdown
      ? Object.entries(metric.team_breakdown).map(([team, score]) => ({
          team, metrics: [{ label: 'Composite', value: (score as number) || 0, color: scoreColor(score as number) }],
        }))
      : [];
    if (metric?.team_breakdown) {
      base.unshift({
        team: 'ORG AVG',
        metrics: [
          { label: 'Workload', value: metric.workload_score, color: scoreColor(metric.workload_score) },
          { label: 'Interactn', value: metric.interaction_density, color: scoreColor(metric.interaction_density) },
          { label: 'Meetings', value: metric.meeting_pressure, color: scoreColor(metric.meeting_pressure) },
          { label: 'Fragmentn', value: metric.task_fragmentation, color: scoreColor(metric.task_fragmentation) },
          { label: 'Dec. Fatigue', value: metric.decision_fatigue, color: scoreColor(metric.decision_fatigue) },
          { label: 'Burnout', value: metric.burnout_risk, color: scoreColor(metric.burnout_risk) },
        ],
      });
    }
    return base;
  }, [metric]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
          <Icon name="psychiatry" size={32} className="text-health-critical" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">No Cognitive Load Data</h2>
          <p className="text-sm text-neutral-50 mb-4">Analyze team overload and burnout risk.</p>
          <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
            <Icon name="play_arrow" size={18} />{analyze.isPending ? 'Analyzing...' : 'Analyze Cognitive Load'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-24 animate-shimmer rounded-2xl" />)}
        </div>
        <div className="card h-64 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (!metric) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
          <Icon name="refresh" size={18} />{analyze.isPending ? 'Analyzing...' : 'Analyze'}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map(m => <RiskGauge key={m.key} value={m.value} label={m.key} color={m.color} />)}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Icon name="equalizer" size={18} className="text-primary-40" />
          <h3 className="section-label">Cognitive Load Index</h3>
        </div>
        <div className="flex items-center gap-5">
          <div className={`text-4xl font-bold font-display ${metric.composite_score > 0.6 ? 'text-health-critical' : metric.composite_score > 0.3 ? 'text-health-functional' : 'text-health-optimal'}`}>
            {Math.round(metric.composite_score * 100)}%
          </div>
          <div className="flex-1 h-4 bg-surface-container rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${
              metric.composite_score > 0.6 ? 'bg-health-critical' : metric.composite_score > 0.3 ? 'bg-health-functional' : 'bg-health-optimal'
            }`} style={{ width: `${metric.composite_score * 100}%` }} />
          </div>
          <div className="text-xs text-neutral-50 text-right">
            <div className="font-semibold text-neutral-30">
              {metric.composite_score > 0.6 ? 'High Risk' : metric.composite_score > 0.3 ? 'Moderate' : 'Healthy'}
            </div>
            <span>Composite Score</span>
          </div>
        </div>
      </div>

      {heatmapData.length > 0 && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="grid_on" size={18} className="text-primary-40" />
            <h3 className="section-label">Team Breakdown</h3>
          </div>
          <CognitiveHeatmap data={heatmapData} />
        </div>
      )}
    </div>
  );
}
