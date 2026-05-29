import { useMetabolic, useAnalyzeMetabolic } from '../hooks/useMetabolic';
import SpeedometerGauge from '../components/SpeedometerGauge';
import WaterfallChart from '../components/WaterfallChart';
import Icon from '../components/Icon';

function MetricBar({ label, value, max, color, suffix, reverse }: { label: string; value: number; max: number; color: string; suffix: string; reverse?: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-50">{label}</span>
        <span className="text-neutral-30 font-mono font-medium">{reverse ? max - value : Math.round(value)}{suffix}</span>
      </div>
      <div className="h-2.5 bg-surface-container rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${reverse ? 100 - pct : pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function MetabolicRate() {
  const { data: metric, isLoading, error } = useMetabolic();
  const analyze = useAnalyzeMetabolic();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Icon name="speed" size={32} className="text-secondary-40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">No Metabolic Data</h2>
          <p className="text-sm text-neutral-50 mb-4">Measure your organization's velocity and efficiency.</p>
          <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
            <Icon name="play_arrow" size={18} />{analyze.isPending ? 'Measuring...' : 'Measure Metabolic Rate'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card h-56 animate-shimmer rounded-2xl" />
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-shimmer rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!metric) return null;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
          <Icon name="refresh" size={18} />{analyze.isPending ? 'Measuring...' : 'Measure'}
        </button>
      </div>

      {/* Top row: gauge + key metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Speedometer */}
        <div className="card flex flex-col items-center justify-center py-6">
          <SpeedometerGauge value={metric.composite_score} label="Composite Score" color="#006972" />
          <div className="mt-3 text-center">
            <div className="text-[10px] text-neutral-50 uppercase tracking-wider">Org Velocity Score</div>
          </div>
        </div>

        {/* Key metrics */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="timer" size={18} className="text-health-functional" />
              <span className="text-xs text-neutral-50">Decision Cycle Time</span>
            </div>
            <div className="metric-value text-health-functional">{Math.round(metric.decision_cycle_time_hours)}h</div>
            <div className="text-[11px] text-neutral-60">Avg time to make decisions</div>
            <div className="h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-health-functional" style={{ width: `${Math.min((metric.decision_cycle_time_hours / 168) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="radar" size={18} className="text-primary-40" />
              <span className="text-xs text-neutral-50">Information Half-Life</span>
            </div>
            <div className="metric-value text-primary-40">{Math.round(metric.info_half_life_hours)}h</div>
            <div className="text-[11px] text-neutral-60">Info relevance duration</div>
            <div className="h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-primary-40" style={{ width: `${Math.min((metric.info_half_life_hours / 720) * 100, 100)}%` }} />
            </div>
          </div>
          <div className="card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="flash_on" size={18} className="text-health-optimal" />
              <span className="text-xs text-neutral-50">Execution Velocity</span>
            </div>
            <div className="metric-value text-health-optimal">{Math.round(metric.execution_velocity * 100)}%</div>
            <div className="text-[11px] text-neutral-60">Task completion speed</div>
            <div className="h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-health-optimal" style={{ width: `${metric.execution_velocity * 100}%` }} />
            </div>
          </div>
          <div className="card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="psychology" size={18} className="text-dark-matter" />
              <span className="text-xs text-neutral-50">Bottleneck Risk</span>
            </div>
            <div className="metric-value text-dark-matter">{Math.round((1 - metric.execution_velocity) * 100)}%</div>
            <div className="text-[11px] text-neutral-60">Potential throughput loss</div>
            <div className="h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
              <div className="h-full rounded-full bg-dark-matter" style={{ width: `${(1 - metric.execution_velocity) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Two column: Bottleneck Spotlight + Waterfall */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bottleneck spotlight */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="find_in_page" size={18} className="text-health-critical" />
            <h3 className="section-label">Bottleneck Spotlight</h3>
          </div>
          <div className="space-y-1">
            {[
              { label: 'Decision Cycle Time', value: metric.decision_cycle_time_hours, max: 168, color: '#EAB308', suffix: 'h' },
              { label: 'Info Half-Life', value: metric.info_half_life_hours, max: 720, color: '#065291', suffix: 'h' },
              { label: 'Execution Velocity', value: metric.execution_velocity * 100, max: 100, color: '#22C55E', suffix: '%' },
            ].map((item) => (
              <MetricBar key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Waterfall */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="waterfall_chart" size={18} className="text-primary-40" />
            <h3 className="section-label">Waterfall Analysis</h3>
          </div>
          <WaterfallChart
            items={[
              { label: 'Decision Cycle Time', value: metric.decision_cycle_time_hours, color: '#EAB308', suffix: 'h' },
              { label: 'Info Half-Life', value: metric.info_half_life_hours, color: '#065291', suffix: 'h' },
              { label: 'Execution Velocity', value: metric.execution_velocity * 100, color: '#22C55E', suffix: '%' },
            ]}
            total={metric.composite_score}
          />
        </div>
      </div>
    </div>
  );
}
