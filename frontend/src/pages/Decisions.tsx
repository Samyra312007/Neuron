import { useState } from 'react';
import { useDecisions, useCreateDecision, useTransitionDecision, useAutoDiscoverDecisions } from '../hooks/useDecisions';
import { useToast } from '../components/Toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import AlertBanner from '../components/AlertBanner';

const STATUS_COLORS: Record<string, string> = {
  proposed: 'text-yellow-400 bg-yellow-600/10',
  decided: 'text-blue-400 bg-blue-600/10',
  completed: 'text-emerald-400 bg-emerald-600/10',
  reverted: 'text-red-400 bg-red-600/10',
  cancelled: 'text-gray-500 bg-gray-600/10',
};

const NEXT_ACTIONS: Record<string, string[]> = {
  proposed: ['decide', 'cancel'],
  decided: ['complete', 'revert', 'cancel'],
  completed: ['revert'],
  reverted: [],
  cancelled: [],
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Decision Archaeology</h1>
          <p className="text-gray-400 mt-1">Track decisions from proposal to completion</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => autoDiscover.mutate(undefined, {
            onSuccess: (d) => addToast(`Discovered ${d.discovered} decisions`, 'success'),
            onError: () => addToast('Auto-discovery failed', 'error'),
          })} disabled={autoDiscover.isPending} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg text-xs transition-colors">
            {autoDiscover.isPending ? 'Searching...' : 'Auto-Discover'}
          </button>
          <button onClick={() => setShowForm(!showForm)} className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 text-white rounded-lg font-medium text-sm transition-colors">
            {showForm ? 'Cancel' : 'New Decision'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="neuron-card space-y-3">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Decision title" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />
          <input value={initiator} onChange={e => setInitiator(e.target.value)} placeholder="Initiator name (optional)" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />
          <button onClick={handleCreate} disabled={!title || create.isPending} className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg text-sm transition-colors">Record Decision</button>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : decisions && decisions.length > 0 ? (
        <div className="space-y-3">
          {decisions.map((d) => (
            <div key={d.id} className="neuron-card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[d.status] || 'text-gray-400'}`}>{d.status}</span>
                    <h3 className="text-sm font-medium text-white">{d.title}</h3>
                  </div>
                  {d.description && <p className="text-xs text-gray-400 mb-2">{d.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {d.initiator_name && <span>By: {d.initiator_name}</span>}
                    {d.decided_at && <span>Decided: {new Date(d.decided_at).toLocaleDateString()}</span>}
                    {d.completed_at && <span>Completed: {new Date(d.completed_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <div className="flex gap-1 ml-4">
                  {NEXT_ACTIONS[d.status]?.map((action) => (
                    <button key={action} onClick={() => handleTransition(d.id, action)} disabled={transition.isPending}
                      className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors">{action}</button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AlertBanner type="info">No decisions recorded. Create one or use auto-discover to find decisions in event data.</AlertBanner>
      )}
    </div>
  );
}
