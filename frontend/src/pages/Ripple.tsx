import { useState, useRef } from 'react';
import { useSimulateRipple } from '../hooks/useRipple';
import { useGenome } from '../hooks/useGenome';
import { useMetabolic } from '../hooks/useMetabolic';
import AlertBanner from '../components/AlertBanner';
import type { RippleResult } from '../api/ripple';

const BASELINE_METRICS = ['collaboration', 'decision_making', 'knowledge_flow', 'innovation', 'resilience', 'vitality', 'cognitive_load', 'dark_matter_cost'];

export default function Ripple() {
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const simulate = useSimulateRipple();
  const { data: genome } = useGenome();
  const { data: metabolic } = useMetabolic();
  const currentBaseline = useRef<Record<string, number> | null>(null);

  const result = simulate.data as RippleResult | undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    currentBaseline.current = {
      collaboration: genome?.collaboration ?? 0,
      decision_making: genome?.decision_making ?? 0,
      knowledge_flow: genome?.knowledge_flow ?? 0,
      innovation: genome?.innovation ?? 0,
      resilience: genome?.resilience ?? 0,
      vitality: genome?.vitality ?? 0,
      cognitive_load: 0,
      dark_matter_cost: 0,
      decision_cycle_time_hours: metabolic?.decision_cycle_time_hours ?? 0,
      info_half_life_hours: metabolic?.info_half_life_hours ?? 0,
      execution_velocity: metabolic?.execution_velocity ?? 0,
    };
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

      {result && currentBaseline.current && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-white">Before / After Comparison</h2>
          <div className="neuron-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-2 px-3 text-gray-400 font-medium">Metric</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Current</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Predicted</th>
                  <th className="text-right py-2 px-3 text-gray-400 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result).map(([metric, effect]) => {
                  const current = currentBaseline.current![metric] ?? 0;
                  const predicted = effect.direction === 'positive'
                    ? current + effect.magnitude * (1 - current)
                    : effect.direction === 'negative'
                    ? current - effect.magnitude * current
                    : current;
                  const diff = predicted - current;
                  return (
                    <tr key={metric} className="border-b border-gray-800/50">
                      <td className="py-2 px-3 text-gray-300 capitalize">{metric.replace(/_/g, ' ')}</td>
                      <td className={`py-2 px-3 text-right ${current > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                        {metric.includes('_hours') || metric === 'dark_matter_cost'
                          ? (current).toFixed(1)
                          : `${Math.round(current * 100)}%`}
                      </td>
                      <td className={`py-2 px-3 text-right ${predicted > 0 ? 'text-gray-200' : 'text-gray-600'}`}>
                        {metric.includes('_hours') || metric === 'dark_matter_cost'
                          ? (predicted).toFixed(1)
                          : `${Math.round(predicted * 100)}%`}
                      </td>
                      <td className={`py-2 px-3 text-right font-medium ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                        {diff > 0 ? '+' : ''}{(diff * 100).toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <h2 className="text-lg font-semibold text-white">Ripple Details</h2>
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
