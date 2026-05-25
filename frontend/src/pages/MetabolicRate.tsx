import { useMetabolic, useAnalyzeMetabolic } from '../hooks/useMetabolic';
import SpeedometerGauge from '../components/SpeedometerGauge';
import MetricCard from '../components/MetricCard';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function MetabolicRate() {
  const { data: metric, isLoading, error } = useMetabolic();
  const analyze = useAnalyzeMetabolic();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Metabolic Rate</h1>
          <p className="text-gray-400 mt-1">Organizational velocity, decision speed & efficiency</p>
        </div>
        <button
          onClick={() => analyze.mutate()}
          disabled={analyze.isPending}
          className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {analyze.isPending ? 'Measuring...' : 'Measure Metabolic Rate'}
        </button>
      </div>

      {error && (
        <AlertBanner type="info">
          No metabolic data yet. Click <strong>"Measure Metabolic Rate"</strong> to analyze.
        </AlertBanner>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : metric ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="neuron-card">
              <SpeedometerGauge
                value={metric.composite_score}
                label="Composite Score"
                color="#8b5cf6"
              />
            </div>
            <MetricCard
              title="Decision Cycle Time"
              value={`${Math.round(metric.decision_cycle_time_hours)}h`}
              subtitle="Avg time to make decisions"
              icon="⏱"
              color="#f59e0b"
            />
            <MetricCard
              title="Information Half-Life"
              value={`${Math.round(metric.info_half_life_hours)}h`}
              subtitle="Info relevance duration"
              icon="📡"
              color="#00b8f0"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <MetricCard
              title="Execution Velocity"
              value={`${Math.round(metric.execution_velocity * 100)}%`}
              subtitle="Task completion speed"
              icon="⚡"
              color="#10b981"
            />
            <div className="neuron-card lg:col-span-2">
              <h2 className="text-sm font-semibold text-gray-400 mb-3">Sub-Metrics Breakdown</h2>
              <div className="space-y-4">
                {[
                  { label: 'Decision Cycle Time', value: metric.decision_cycle_time_hours, max: 168, color: '#f59e0b' },
                  { label: 'Info Half-Life', value: metric.info_half_life_hours, max: 720, color: '#00b8f0' },
                  { label: 'Execution Velocity', value: metric.execution_velocity * 100, max: 100, color: '#10b981' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-gray-400">{Math.round(item.value)}{item.label === 'Execution Velocity' ? '%' : 'h'}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
