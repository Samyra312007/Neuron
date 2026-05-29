import { useState } from 'react';
import { useActivity } from '../hooks/useActivity';
import Icon from '../components/Icon';

const TYPE_ICONS: Record<string, string> = {
  genome_sequenced: 'dna',
  dark_matter_scanned: 'radar',
  infections_scanned: 'verified',
  metabolic_analyzed: 'speed',
  cognitive_load_analyzed: 'psychiatry',
  snapshot_taken: 'layers',
  decision_made: 'list_alt',
  infection_treated: 'vaccines',
};

export default function Activity() {
  const [limit, setLimit] = useState(50);
  const [filter, setFilter] = useState('');
  const { data: events, isLoading } = useActivity(limit);

  const filtered = filter ? events?.filter(e => e.event_type === filter) : events;
  const eventTypes = events ? [...new Set(events.map(e => e.event_type))] : [];

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="card h-16 animate-shimmer rounded-2xl" />)}
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center">
          <Icon name="monitoring" size={32} className="text-primary-40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">No Activity Yet</h2>
          <p className="text-sm text-neutral-50">Run agents to generate activity events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-50">{events.length} events</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="bg-surface-container border border-neutral-80/50 rounded-lg px-3 py-1.5 text-xs text-neutral-40 focus:outline-none focus:border-primary-40">
            <option value="">All Events</option>
            {eventTypes.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <button onClick={() => setLimit(limit + 50)} className="btn-secondary"><Icon name="expand_more" size={16} />Load More</button>
        </div>
      </div>

      {/* Event list */}
      <div className="card p-0 divide-y divide-neutral-80/30 overflow-hidden">
        {filtered?.map((ev) => (
          <div key={ev.id} className="flex items-start gap-4 px-5 py-4 hover:bg-surface-container/50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
              <Icon name={TYPE_ICONS[ev.event_type] || 'event'} size={18} className="text-primary-40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-neutral-30">{ev.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  ev.severity === 'critical' ? 'bg-health-critical' :
                  ev.severity === 'warning' ? 'bg-health-functional' : 'bg-neutral-70'
                }`} />
                <span className="text-xs text-neutral-60 capitalize">{ev.source}</span>
                {ev.related_entity_type && <span className="text-xs text-neutral-60">· {ev.related_entity_type}</span>}
                <span className="text-xs text-neutral-60 ml-auto font-mono">{new Date(ev.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
