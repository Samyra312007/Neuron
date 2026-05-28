import { useState, useCallback } from 'react';
import { useDarkMatter, useAnalyzeDarkMatter } from '../hooks/useDarkMatter';
import { getDarkMatterCsvUrl, getDarkMatterPdfUrl } from '../api/darkMatter';
import { triggerBlobDownload } from '../api/exportAll';
import { useTeamFilter } from '../hooks/useTeamFilter';
import TeamFilter from '../components/TeamFilter';
import MetricCard from '../components/MetricCard';
import DarkMatterTreemap from '../components/DarkMatterTreemap';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { formatCurrency } from '../lib/utils';
import type { TreemapItem } from '../types';

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
  const { teamId, setTeamId } = useTeamFilter();
  const [selected, setSelected] = useState<TreemapItem | null>(null);

  const download = useCallback(async (fn: () => Promise<string>, name: string) => {
    const url = await fn();
    await triggerBlobDownload(url, name);
  }, []);

  const treemapData = report ? CATEGORIES.map(({ key, label, costKey, color }) => ({
    name: key,
    label,
    value: report[key as keyof typeof report] as number,
    cost: report[costKey as keyof typeof report] as number,
    color,
  })) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dark Matter Detector</h1>
          <p className="text-gray-400 mt-1">Invisible work & unmeasured organizational cost</p>
        </div>
        <div className="flex items-center gap-2">
          <TeamFilter value={teamId} onChange={setTeamId} />
          {report && (
            <>
              <button onClick={() => download(getDarkMatterCsvUrl, 'dark_matter_report.csv')} className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">CSV</button>
              <button onClick={() => download(getDarkMatterPdfUrl, 'dark_matter_report.pdf')} className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">PDF</button>
            </>
          )}
          <button
            onClick={() => analyze.mutate()}
            disabled={analyze.isPending}
            className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {analyze.isPending ? 'Scanning...' : 'Scan Dark Matter'}
          </button>
        </div>
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

          <div className="neuron-card">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Cost Breakdown — Treemap (click a block for details)</h2>
            <DarkMatterTreemap data={treemapData} onItemClick={setSelected} />
          </div>

          {selected && (
            <div className="neuron-card border-neuron-500/30">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">{selected.label}</h3>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-gray-300 text-sm">✕ Dismiss</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Monthly Hours</div>
                  <div className="text-2xl font-bold text-white">{selected.value}h</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Monthly Cost</div>
                  <div className="text-2xl font-bold text-yellow-400">{formatCurrency(selected.cost)}</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-400">
                {selected.name === 'invisible_work_hours' && 'Work performed but not tracked in any system — task-switching, ad-hoc requests, and shadow work that escapes formal reporting.'}
                {selected.name === 'shadow_coordination_hours' && 'Effort spent aligning across teams without formal structure — the hidden overhead of keeping everyone on the same page.'}
                {selected.name === 'unlogged_hours' && 'Overtime and after-hours work not recorded in timesheets or project plans.'}
                {selected.name === 'meeting_overhead_hours' && 'Excessive meeting time including preparation, attendance, and follow-up that could have been async communication.'}
                {selected.name === 'context_switching_hours' && 'Productivity loss from frequent task switching — the cognitive cost of juggling multiple projects and priorities.'}
              </div>
            </div>
          )}

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
