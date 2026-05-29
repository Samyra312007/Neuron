import { useState, useCallback } from 'react';
import { useSnapshots, useTakeSnapshot, useCompare } from '../hooks/useFossil';
import { useCrisisMatches, useSeedCrisisPatterns } from '../hooks/useCrisis';
import { getFossilCsvUrl, getFossilPdfUrl } from '../api/fossil';
import TimelineSlider from '../components/TimelineSlider';
import Icon from '../components/Icon';
import { useToast } from '../components/Toast';

function DeltaBlock({ section, metrics }: { section: string; metrics: Record<string, number | null> }) {
  return (
    <div className="card">
      <div className="section-label mb-3 capitalize">{section.replace(/_/g, ' ')}</div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {Object.entries(metrics).map(([key, val]) => {
          if (val === null) return null;
          const isPositive = val > 0;
          const color = section === 'genome' || key === 'composite_score'
            ? (isPositive ? 'text-health-optimal' : 'text-health-critical')
            : (isPositive ? 'text-health-critical' : 'text-health-optimal');
          return (
            <div key={key} className="p-3 rounded-xl bg-surface-container">
              <div className="text-[10px] text-neutral-50 capitalize mb-1">{key.replace(/_/g, ' ')}</div>
              <div className={`text-lg font-bold font-display ${color}`}>{isPositive ? '+' : ''}{val}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FossilRecord() {
  const { data: snapshots, isLoading } = useSnapshots();
  const takeSnap = useTakeSnapshot();
  const { data: crisisData } = useCrisisMatches();
  const seedCrisis = useSeedCrisisPatterns();
  const { addToast } = useToast();

  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [afterId, setAfterId] = useState<string | null>(null);
  const [snapLimit, setSnapLimit] = useState(10);
  const { data: comparison } = useCompare(beforeId, afterId);

  const download = useCallback(async (fn: () => Promise<string>) => {
    const url = await fn();
    window.open(url, '_blank');
  }, []);

  const handleTakeSnapshot = () => {
    takeSnap.mutate(undefined, {
      onSuccess: () => addToast('Snapshot taken', 'success'),
      onError: () => addToast('Failed to take snapshot', 'error'),
    });
  };

  const snaps = snapshots || [];
  const sliderSnapshots = snaps.map((s, i) => ({ ...s, index: snaps.length - 1 - i })).reverse();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card h-32 animate-shimmer rounded-2xl" />
        <div className="card h-64 animate-shimmer rounded-2xl" />
      </div>
    );
  }

  if (!snapshots || snapshots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center">
          <Icon name="layers" size={32} className="text-primary-40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">No Snapshots Yet</h2>
          <p className="text-sm text-neutral-50 mb-4">Capture the current organizational state to start tracking changes over time.</p>
          <button onClick={handleTakeSnapshot} disabled={takeSnap.isPending} className="btn-primary gap-2">
            <Icon name={takeSnap.isPending ? 'sync' : 'add_a_photo'} size={18} />
            {takeSnap.isPending ? 'Capturing...' : 'Take Snapshot'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-50">{snaps.length} snapshot{snaps.length > 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => download(getFossilCsvUrl)} className="btn-secondary"><Icon name="download" size={16} />CSV</button>
          {beforeId && afterId && (
            <button onClick={() => download(() => getFossilPdfUrl(beforeId, afterId))} className="btn-secondary"><Icon name="picture_as_pdf" size={16} />PDF Diff</button>
          )}
          <button onClick={handleTakeSnapshot} disabled={takeSnap.isPending} className="btn-primary gap-2">
            <Icon name="add_a_photo" size={18} />{takeSnap.isPending ? 'Capturing...' : 'Snapshot'}
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="timeline" size={18} className="text-primary-40" />
          <h3 className="section-label">Timeline</h3>
          <span className="text-[10px] text-neutral-60 ml-auto">Select two points to compare</span>
        </div>
        <TimelineSlider
          snapshots={sliderSnapshots.slice(0, snapLimit)}
          selectedBefore={beforeId}
          selectedAfter={afterId}
          onSelectBefore={setBeforeId}
          onSelectAfter={setAfterId}
        />
        {snaps.length > snapLimit && (
          <button onClick={() => setSnapLimit(snapLimit + 10)} className="btn-ghost text-xs mt-2">Load More Snapshots</button>
        )}
      </div>

      {/* Selection status */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-health-functional" />
          <span className="text-neutral-50">Before: <span className="text-neutral-30 font-medium">{beforeId ? snaps.find(s => s.id === beforeId)?.snapshot_date || 'selected' : '—'}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-dark-matter" />
          <span className="text-neutral-50">After: <span className="text-neutral-30 font-medium">{afterId ? snaps.find(s => s.id === afterId)?.snapshot_date || 'selected' : '—'}</span></span>
        </div>
      </div>

      {/* Comparison */}
      {comparison && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-2">
            <Icon name="compare_arrows" size={20} className="text-primary-40" />
            <h2 className="text-base font-display font-semibold text-neutral-20">
              Diff: {comparison.before.snapshot_date} → {comparison.after.snapshot_date}
            </h2>
          </div>
          {Object.entries(comparison.delta).map(([section, metrics]) => (
            <DeltaBlock key={section} section={section} metrics={metrics as Record<string, number | null>} />
          ))}
          {Object.keys(comparison.delta).length === 0 && (
            <div className="card flex items-center gap-3">
              <Icon name="info" size={18} className="text-primary-40" />
              <span className="text-sm text-neutral-50">No significant differences between these snapshots.</span>
            </div>
          )}
        </div>
      )}

      {/* Crisis patterns */}
      {!crisisData && !seedCrisis.isPending && (
        <button onClick={() => seedCrisis.mutate(undefined, {
          onSuccess: () => addToast('Crisis patterns seeded', 'success'),
          onError: () => addToast('Failed to seed patterns', 'error'),
        })} className="btn-secondary gap-2">
          <Icon name="pattern" size={16} />Load Crisis Patterns
        </button>
      )}

      {crisisData?.matches && crisisData.matches.length > 0 && (
        <div className="card border-health-critical/30">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="crisis_alert" size={18} className="text-health-critical" />
            <h3 className="section-label text-health-critical">Crisis Pattern Matches</h3>
          </div>
          <p className="text-xs text-neutral-50 mb-3">Based on snapshot from {crisisData.snapshot_date}</p>
          <div className="space-y-3">
            {crisisData.matches.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-health-critical/5 border border-health-critical/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`badge text-[10px] ${
                    m.severity === 'critical' ? 'bg-health-critical text-white' :
                    m.severity === 'high' ? 'bg-health-degraded text-white' :
                    'bg-health-functional text-white'
                  }`}>{m.severity}</span>
                  <span className="text-sm font-medium text-neutral-20">{m.pattern_name}</span>
                  <span className="text-xs text-neutral-50 ml-auto">Match: {Math.round(m.match_score * 100)}%</span>
                </div>
                <p className="text-xs text-neutral-50 leading-relaxed">{m.pattern_description}</p>
                {Object.keys(m.details).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-60">
                    {Object.entries(m.details).map(([k, v]) => (
                      <span key={k}><span className="text-neutral-50">{k}:</span> {String(v)}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {crisisData?.matches && crisisData.matches.length === 0 && crisisData.message && (
        <div className="card flex items-center gap-3">
          <Icon name="check_circle" size={18} className="text-health-optimal" />
          <span className="text-sm text-neutral-50">{crisisData.message}</span>
        </div>
      )}
    </div>
  );
}
