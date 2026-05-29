import { useState } from 'react';
import { useDecisions, useCreateDecision, useTransitionDecision, useAutoDiscoverDecisions } from '../hooks/useDecisions';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';

const STATUS_STYLES: Record<string, string> = {
  proposed: 'bg-health-functional/10 text-health-functional',
  decided: 'bg-primary-95 text-primary-40',
  completed: 'bg-health-optimal/10 text-health-optimal',
  reverted: 'bg-health-critical/10 text-health-critical',
  cancelled: 'bg-neutral-80/50 text-neutral-50',
};

const NEXT_ACTIONS: Record<string, string[]> = {
  proposed: ['decide', 'cancel'],
  decided: ['complete', 'revert', 'cancel'],
  completed: ['revert'],
  reverted: [], cancelled: [],
};

export default function Decisions() {
  const { data: decisions, isLoading } = useDecisions();
  const create = useCreateDecision();
  const transition = useTransitionDecision();
  const autoDiscover = useAutoDiscoverDecisions();
  const { addToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [initiator, setInitiator] = useState('');

  const handleCreate = () => {
    create.mutate({ title, description: desc, initiator_name: initiator }, {
      onSuccess: () => { addToast('Decision recorded', 'success'); setShowForm(false); setTitle(''); setDesc(''); setInitiator(''); },
      onError: () => addToast('Failed to create decision', 'error'),
    });
  };

  const handleTransition = (id: string, action: string) => {
    transition.mutate({ id, action }, {
      onSuccess: () => addToast(`Decision ${action}d`, 'success'),
      onError: () => addToast('Failed to update decision', 'error'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div />
        <div className="flex items-center gap-2">
          <button onClick={() => autoDiscover.mutate(undefined, {
            onSuccess: (d) => addToast(`Discovered ${d.discovered} decisions`, 'success'),
            onError: () => addToast('Auto-discovery failed', 'error'),
          })} disabled={autoDiscover.isPending} className="btn-secondary gap-2">
            <Icon name="search" size={16} />{autoDiscover.isPending ? 'Searching...' : 'Auto-Discover'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary gap-2">
            <Icon name="add" size={18} />{showForm ? 'Cancel' : 'New Decision'}
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="card space-y-3 animate-slide-up">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="edit_note" size={18} className="text-primary-40" />
            <h3 className="section-label">Record Decision</h3>
          </div>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Decision title"
            className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)"
            className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
          <input value={initiator} onChange={e => setInitiator(e.target.value)} placeholder="Initiator name (optional)"
            className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
          <button onClick={handleCreate} disabled={!title || create.isPending} className="btn-primary gap-2">
            <Icon name="check" size={18} />Record Decision
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 animate-shimmer rounded-2xl" />)}
        </div>
      )}

      {/* Decision cards */}
      {decisions && decisions.length > 0 ? (
        <div className="space-y-3">
          {decisions.map((d) => (
            <div key={d.id} className="card hover:shadow-card-hover transition-all animate-slide-up">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge text-[10px] ${STATUS_STYLES[d.status] || 'bg-neutral-80/50 text-neutral-50'}`}>{d.status}</span>
                    <h3 className="text-sm font-semibold text-neutral-20">{d.title}</h3>
                  </div>
                  {d.description && <p className="text-xs text-neutral-50 mb-2">{d.description}</p>}
                  <div className="flex items-center gap-3 text-[11px] text-neutral-60">
                    {d.initiator_name && <span>By: {d.initiator_name}</span>}
                    {d.decided_at && <span>Decided: {new Date(d.decided_at).toLocaleDateString()}</span>}
                    {d.completed_at && <span>Completed: {new Date(d.completed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-4 shrink-0">
                  {NEXT_ACTIONS[d.status]?.map((action) => (
                    <button key={action} onClick={() => handleTransition(d.id, action)} disabled={transition.isPending}
                      className="btn-ghost text-xs capitalize">{action}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="card flex items-center gap-3">
          <Icon name="info" size={18} className="text-primary-40" />
          <span className="text-sm text-neutral-50">No decisions recorded. Create one or use auto-discover.</span>
        </div>
      ) : null}
    </div>
  );
}
