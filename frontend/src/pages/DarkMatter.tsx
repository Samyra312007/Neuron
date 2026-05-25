import { useDarkMatter, useAnalyzeDarkMatter } from '../hooks/useDarkMatter';
import MetricCard from '../components/MetricCard';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatCurrency } from '../lib/utils';

const CATEGORIES = [
  { key: 'invisible_work_hours', label: 'Invisible Work', costKey: 'invisible_work_cost', color: '#f59e0b' },
  { key: 'shadow_coordination_hours', label: 'Shadow Coordination', costKey: 'shadow_coordination_cost', color: '#8b5cf6' },
  { key: 'unlogged_hours', label: 'Unlogged Hours', costKey: 'unlogged_hours_cost', color: '#ef4444' },
  { key: 'meeting_overhead_hours', label: 'Meeting Overhead', costKey: 'meeting_overhead_cost', color: '#ec4899' },
  { key: 'context_switching_hours', label: 'Context Switching', costKey: 'context_switching_cost', color: '#10b981' },
];

export default function DarkMatter() {
  const { data: report, isLoading, error } = useDarkMatter();
  const analyze = useAnalyzeDarkMatter();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dark Matter Detector</h1>
          <p className="text-gray-400 mt-1">Invisible work & unmeasured organizational cost</p>
        </div>
        <button
          onClick={() => analyze.mutate()}
          disabled={analyze.isPending}
          className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {analyze.isPending ? 'Scanning...' : 'Scan Dark Matter'}
        </button>
      </div>

      {error && (
        <AlertBanner type="info">
          No dark matter data yet. Click <strong>"Scan Dark Matter"</strong> to detect invisible work.
        </AlertBanner>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : report ? (
        <>
          <div className="neuron-card">
            <h2 className="text-sm font-semibold text-gray-400 mb-1">Total Monthly Cost</h2>
            <p className="text-4xl font-bold text-yellow-400">{formatCurrency(Number(report.total_cost))}</p>
            <p className="text-xs text-gray-500 mt-1">Estimated organizational friction cost per month</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CATEGORIES.map(({ key, label, costKey, color }) => {
              const hours = report[key as keyof typeof report] as number;
              const cost = report[costKey as keyof typeof report] as number;
              return (
                <MetricCard
                  key={key}
                  title={label}
                  value={`${hours}h`}
                  subtitle={formatCurrency(cost)}
                  color={color}
                />
              );
            })}
          </div>

          {report.summary && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Dark Matter Analysis</h2>
              <p className="text-gray-200 text-sm leading-relaxed">{report.summary}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
