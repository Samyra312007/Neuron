import { useState } from 'react';
import { useActivity } from '../hooks/useActivity';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AlertBanner from '../components/AlertBanner';

const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-gray-500',
};

const TYPE_ICONS: Record<string, string> = {
  genome_sequenced: '🧬',
  dark_matter_scanned: '◈',
  infections_scanned: '🛡',
  metabolic_analyzed: '⚡',
  cognitive_load_analyzed: '🧠',
  snapshot_taken: '🪨',
  decision_made: '📋',
  infection_treated: '💊',
};

export default function Activity() {
  const [limit, setLimit] = useState(50);
  const [filter, setFilter] = useState('');
  const { data: events, isLoading } = useActivity(limit);

  const filtered = filter ? events?.filter(e => e.event_type === filter) : events;

  const eventTypes = events ? [...new Set(events.map(e => e.event_type))] : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
          <p className="text-gray-400 mt-1">Real-time organizational event stream</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300">
            <option value="">All Events</option>
            {eventTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <button onClick={() => setLimit(limit + 50)} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">Load More</button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton lines={10} />
      ) : filtered && filtered.length > 0 ? (
        <div className="neuron-card p-0 divide-y divide-gray-800">
          {filtered.map((ev) => (
            <div key={ev.id} className="flex items-start gap-3 px-5 py-3">
              <span className="text-lg mt-0.5">{TYPE_ICONS[ev.event_type] || '📌'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">{ev.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_COLORS[ev.severity] || 'bg-gray-500'}`} />
                  <span className="text-xs text-gray-500 capitalize">{ev.source}</span>
                  {ev.related_entity_type && <span className="text-xs text-gray-600">· {ev.related_entity_type}</span>}
                  <span className="text-xs text-gray-600 ml-auto">{new Date(ev.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AlertBanner type="info">No activity events yet. Run agents to generate activity.</AlertBanner>
      )}
    </div>
  );
}
