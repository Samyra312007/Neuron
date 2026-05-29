import { useState, useCallback } from 'react';
import { useDarkMatter, useAnalyzeDarkMatter } from '../hooks/useDarkMatter';
import { getDarkMatterCsvUrl, getDarkMatterPdfUrl } from '../api/darkMatter';
import { triggerBlobDownload } from '../api/exportAll';
import { useTeamFilter } from '../hooks/useTeamFilter';
import TeamFilter from '../components/TeamFilter';
import DarkMatterTreemap from '../components/DarkMatterTreemap';
import Icon from '../components/Icon';
import { formatCurrency } from '../lib/utils';
import type { TreemapItem } from '../types';

const CATEGORIES = [
  { key: 'invisible_work_hours', label: 'Invisible Work', costKey: 'invisible_work_cost', color: '#EAB308', icon: 'visibility_off', desc: 'Work performed but not tracked in any system — task-switching, ad-hoc requests, and shadow work that escapes formal reporting.' },
  { key: 'shadow_coordination_hours', label: 'Shadow Coordination', costKey: 'shadow_coordination_cost', color: '#8B5CF6', icon: 'group_work', desc: 'Effort spent aligning across teams without formal structure — the hidden overhead of keeping everyone on the same page.' },
  { key: 'unlogged_hours', label: 'Unlogged Hours', costKey: 'unlogged_hours_cost', color: '#EF4444', icon: 'schedule', desc: 'Overtime and after-hours work not recorded in timesheets or project plans.' },
  { key: 'meeting_overhead_hours', label: 'Meeting Overhead', costKey: 'meeting_overhead_cost', color: '#006972', icon: 'meeting_room', desc: 'Excessive meeting time including preparation, attendance, and follow-up that could have been async communication.' },
  { key: 'context_switching_hours', label: 'Context Switching', costKey: 'context_switching_cost', color: '#22C55E', icon: 'swap_horiz', desc: 'Productivity loss from frequent task switching — the cognitive cost of juggling multiple projects and priorities.' },
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
    name: key, label, value: report[key as keyof typeof report] as number,
    cost: report[costKey as keyof typeof report] as number, color,
  })) : [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center">
          <Icon name="radar" size={32} className="text-dark-matter" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">No Dark Matter Data</h2>
          <p className="text-sm text-neutral-50 mb-4">Scan for invisible work to uncover hidden organizational costs.</p>
          <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
            <Icon name="play_arrow" size={18} />{analyze.isPending ? 'Scanning...' : 'Scan Dark Matter'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card h-32 animate-shimmer rounded-2xl" />
        <div className="card h-72 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TeamFilter value={teamId} onChange={setTeamId} />
        <div className="flex items-center gap-2">
          <button onClick={() => download(getDarkMatterCsvUrl, 'dark_matter_report.csv')} className="btn-secondary"><Icon name="download" size={16} />CSV</button>
          <button onClick={() => download(getDarkMatterPdfUrl, 'dark_matter_report.pdf')} className="btn-secondary"><Icon name="picture_as_pdf" size={16} />PDF</button>
          <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
            <Icon name="radar" size={18} />{analyze.isPending ? 'Scanning...' : 'Scan Dark Matter'}
          </button>
        </div>
      </div>

      {/* Total cost banner */}
      <div className="card bg-gradient-to-br from-dark-matter/[0.08] to-transparent border-dark-matter/20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-dark-matter/10 flex items-center justify-center">
            <Icon name="payments" size={28} className="text-dark-matter" />
          </div>
          <div>
            <div className="section-label mb-0.5">Total Monthly Dark Matter Cost</div>
            <div className="text-3xl font-bold font-display text-dark-matter">{formatCurrency(Number(report.total_cost))}</div>
            <div className="text-xs text-neutral-50 mt-0.5">Estimated organizational friction cost per month</div>
          </div>
        </div>
      </div>

      {/* Treemap */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="grid_view" size={18} className="text-primary-40" />
            <h3 className="section-label">Cost Breakdown</h3>
          </div>
          <span className="text-xs text-neutral-50">Click a block for details</span>
        </div>
        <DarkMatterTreemap data={treemapData} onItemClick={setSelected} />
      </div>

      {/* Selected detail */}
      {selected && (
        <div className="card border-dark-matter/30 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${selected.color}15` }}>
                <Icon name={CATEGORIES.find(c => c.key === selected.name)?.icon || 'help'} size={18} style={{ color: selected.color }} />
              </div>
              <h3 className="text-base font-semibold font-display text-neutral-20">{selected.label}</h3>
            </div>
            <button onClick={() => setSelected(null)} className="btn-ghost"><Icon name="close" size={16} /></button>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-surface-container">
              <div className="text-xs text-neutral-50">Monthly Hours</div>
              <div className="text-2xl font-bold font-display text-neutral-20">{selected.value}h</div>
            </div>
            <div className="p-4 rounded-xl bg-surface-container">
              <div className="text-xs text-neutral-50">Monthly Cost</div>
              <div className="text-2xl font-bold font-display" style={{ color: selected.color }}>{formatCurrency(selected.cost)}</div>
            </div>
          </div>
          <p className="text-sm text-neutral-50 leading-relaxed">{CATEGORIES.find(c => c.key === selected.name)?.desc}</p>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map(({ key, label, costKey, color, icon }) => {
          const hours = report[key as keyof typeof report] as number;
          const cost = report[costKey as keyof typeof report] as number;
          return (
            <div key={key} className="card hover:shadow-card-hover transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <Icon name={icon} size={18} style={{ color }} />
                <span className="text-sm font-medium text-neutral-30">{label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="metric-value" style={{ color }}>{hours}h</span>
                <span className="text-xs text-neutral-50">{formatCurrency(cost)}</span>
              </div>
              <div className="h-1.5 bg-surface-container rounded-full mt-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((hours / 500) * 100, 100)}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {report.summary && (
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="summarize" size={18} className="text-dark-matter" />
            <h3 className="section-label">Dark Matter Analysis</h3>
          </div>
          <p className="text-sm text-neutral-30 leading-relaxed">{report.summary}</p>
        </div>
      )}
    </div>
  );
}
