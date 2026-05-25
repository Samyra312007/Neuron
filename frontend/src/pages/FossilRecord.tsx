import { useState } from 'react';
import { useSnapshots, useTakeSnapshot, useCompare } from '../hooks/useFossil';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';

export default function FossilRecord() {
  const { data: snapshots, isLoading } = useSnapshots();
  const takeSnap = useTakeSnapshot();
  const { addToast } = useToast();

  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [afterId, setAfterId] = useState<string | null>(null);
  const { data: comparison } = useCompare(beforeId, afterId);

  const handleTakeSnapshot = () => {
    takeSnap.mutate(undefined, {
      onSuccess: () => addToast('Snapshot taken', 'success'),
      onError: () => addToast('Failed to take snapshot', 'error'),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fossil Record</h1>
          <p className="text-gray-400 mt-1">Organizational state snapshots & diff comparisons</p>
        </div>
        <button
          onClick={handleTakeSnapshot}
          disabled={takeSnap.isPending}
          className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {takeSnap.isPending ? 'Capturing...' : '📸 Take Snapshot'}
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={4} />
      ) : snapshots && snapshots.length > 0 ? (
        <>
          <div className="neuron-card">
            <h2 className="text-sm font-semibold text-gray-400 mb-4">Timeline</h2>
            <div className="space-y-3">
              {snapshots.map((s, i) => (
                <div key={s.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <div className="w-8 h-8 rounded-full bg-neuron-500/20 text-neuron-400 flex items-center justify-center text-sm font-bold">
                    {snapshots.length - i}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white font-medium">Snapshot {snapshots.length - i}</div>
                    <div className="text-xs text-gray-500">{s.snapshot_date}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setBeforeId(s.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        beforeId === s.id ? 'bg-neuron-500 border-neuron-500 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      Before
                    </button>
                    <button
                      onClick={() => setAfterId(s.id)}
                      className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                        afterId === s.id ? 'bg-neuron-500 border-neuron-500 text-white' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      After
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
        </>
      ) : (
        <AlertBanner type="info">
          No snapshots yet. Click <strong>"Take Snapshot"</strong> to capture the current organizational state.
        </AlertBanner>
      )}
    </div>
  );
}
