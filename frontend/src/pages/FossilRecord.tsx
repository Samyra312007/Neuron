import { useState, useCallback } from 'react';
import { useSnapshots, useTakeSnapshot, useCompare } from '../hooks/useFossil';
import { useCrisisMatches, useSeedCrisisPatterns } from '../hooks/useCrisis';
import { getFossilCsvUrl, getFossilPdfUrl } from '../api/fossil';
import TimelineSlider from '../components/TimelineSlider';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import { useTeams } from '../hooks/useTeams';

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
  const sliderSnapshots = snaps.map((s, i) => ({
    ...s,
    index: snaps.length - 1 - i,
  })).reverse();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fossil Record</h1>
          <p className="text-gray-400 mt-1">Organizational state snapshots & diff comparisons</p>
        </div>
        <div className="flex items-center gap-2">
          {snapshots && snapshots.length > 0 && (
            <>
              <button onClick={() => download(getFossilCsvUrl)} className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">CSV</button>
              {beforeId && afterId && (
                <button onClick={() => download(() => getFossilPdfUrl(beforeId, afterId))} className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">PDF</button>
              )}
            </>
          )}
          <button
            onClick={handleTakeSnapshot}
            disabled={takeSnap.isPending}
            className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {takeSnap.isPending ? 'Capturing...' : '📸 Take Snapshot'}
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : snapshots && snapshots.length > 0 ? (
        <>
          <div className="neuron-card">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">
              Timeline — click dot to set <span className="text-amber-400">Before</span>, click another for <span className="text-purple-400">After</span>
            </h2>
            <TimelineSlider
              snapshots={sliderSnapshots.slice(0, snapLimit)}
              selectedBefore={beforeId}
              selectedAfter={afterId}
              onSelectBefore={setBeforeId}
              onSelectAfter={setAfterId}
            />
            {snaps.length > snapLimit && (
              <button onClick={() => setSnapLimit(snapLimit + 10)} className="mt-3 text-xs text-neuron-400 hover:text-neuron-300">Load More Snapshots</button>
            )}
          </div>

          {comparison && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Diff: {comparison.before.snapshot_date} → {comparison.after.snapshot_date}
              </h2>
              {Object.entries(comparison.delta).map(([section, metrics]) => (
                <div key={section} className="neuron-card">
                  <h3 className="text-sm font-semibold text-gray-400 mb-3 capitalize">{section.replace(/_/g, ' ')}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Object.entries(metrics as Record<string, number | null>).map(([key, val]) => {
                      if (val === null) return null;
                      const isPositive = val > 0;
                      const color = section === 'genome' || key === 'composite_score'
                        ? (isPositive ? 'text-emerald-400' : 'text-red-400')
                        : (isPositive ? 'text-red-400' : 'text-emerald-400');
                      return (
                        <div key={key} className="p-3 rounded-lg bg-gray-800/30 border border-gray-700/30">
                          <div className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</div>
                          <div className={`text-lg font-bold ${color}`}>
                            {isPositive ? '+' : ''}{val}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {Object.keys(comparison.delta).length === 0 && (
                <AlertBanner type="info">No significant differences between these snapshots.</AlertBanner>
              )}
            </div>
          )}

          {!crisisData && !seedCrisis.isPending && (
            <button
              onClick={() => seedCrisis.mutate(undefined, {
                onSuccess: () => addToast('Crisis patterns seeded', 'success'),
                onError: () => addToast('Failed to seed patterns', 'error'),
              })}
              className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors"
            >
              Load Crisis Patterns
            </button>
          )}

          {crisisData?.matches && crisisData.matches.length > 0 && (
            <div className="neuron-card border-red-500/30">
              <h2 className="text-sm font-semibold text-red-400 mb-3 uppercase tracking-wider">Crisis Pattern Matches</h2>
              <p className="text-xs text-gray-500 mb-3">Based on snapshot from {crisisData.snapshot_date}</p>
              <div className="space-y-3">
                {crisisData.matches.map((m, i) => (
                  <div key={i} className="p-3 rounded-lg bg-red-900/10 border border-red-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        m.severity === 'critical' ? 'bg-red-600 text-white' :
                        m.severity === 'high' ? 'bg-orange-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>{m.severity}</span>
                      <span className="text-sm font-medium text-white">{m.pattern_name}</span>
                      <span className="text-xs text-gray-500 ml-auto">Match: {Math.round(m.match_score * 100)}%</span>
                    </div>
                    <p className="text-xs text-gray-400">{m.pattern_description}</p>
                    {Object.keys(m.details).length > 0 && (
                      <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                        {Object.entries(m.details).map(([k, v]) => (
                          <div key={k}>{k}: {v}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {crisisData?.matches && crisisData.matches.length === 0 && crisisData.message && (
            <AlertBanner type="info">{crisisData.message}</AlertBanner>
          )}
        </>
      ) : (
        <AlertBanner type="info">
          No snapshots yet. Click <strong>"Take Snapshot"</strong> to capture the current organizational state.
        </AlertBanner>
      )}
    </div>
  );
}
