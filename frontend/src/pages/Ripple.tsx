import { useState } from 'react';
import { useSimulateRipple } from '../hooks/useRipple';
import AlertBanner from '../components/AlertBanner';
import type { RippleResult } from '../api/ripple';

export default function Ripple() {
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const simulate = useSimulateRipple();

  const result = simulate.data as RippleResult | undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    simulate.mutate({
      change_description: description,
      target_team: target || undefined,
      intensity,
    });
  };

  const directionColor = (dir: string) =>
    dir === 'positive' ? 'text-emerald-400' : dir === 'negative' ? 'text-red-400' : 'text-gray-400';
  const directionIcon = (dir: string) =>
    dir === 'positive' ? '▲' : dir === 'negative' ? '▼' : '◆';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Ripple Simulator</h1>
        <p className="text-gray-400 mt-1">Model the organizational impact of any proposed change</p>
      </div>

      <div className="neuron-card max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Change Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Implement a 4-day workweek, restructure Engineering into pods, migrate to microservices..."
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neuron-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Target Team (optional)</label>
              <input
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="e.g., Engineering"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-neuron-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Intensity</label>
              <select
                value={intensity}
                onChange={(e) => setIntensity(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-neuron-500"
              >
                <option value="low">Low — Incremental Change</option>
                <option value="medium">Medium — Moderate Shift</option>
                <option value="high">High — Radical Transformation</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={simulate.isPending || !description.trim()}
            className="py-2.5 px-6 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {simulate.isPending ? 'Simulating...' : 'Run Simulation'}
          </button>
        </form>
      </div>

      {simulate.error && (
        <AlertBanner type="error">Simulation failed. Please try again.</AlertBanner>
      )}

      {result && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Predicted Ripple Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(result).map(([metric, effect]) => (
              <div key={metric} className="neuron-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-300 capitalize">{metric.replace(/_/g, ' ')}</h3>
                  <span className={`text-lg font-bold ${directionColor(effect.direction)}`}>
                    {directionIcon(effect.direction)}
                  </span>
                </div>
                <div className="mb-3">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        effect.direction === 'positive' ? 'bg-emerald-500' :
                        effect.direction === 'negative' ? 'bg-red-500' : 'bg-gray-600'
                      }`}
                      style={{ width: `${effect.magnitude * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-1 block">
                    Magnitude: {Math.round(effect.magnitude * 100)}%
                  </span>
                </div>
                <p className="text-sm text-gray-400">{effect.description}</p>
                {effect.affected_teams && effect.affected_teams.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {effect.affected_teams.map((t: string) => (
                      <span key={t} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
