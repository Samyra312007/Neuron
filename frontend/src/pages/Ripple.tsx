import { useState, useRef } from 'react';
import { useSimulateRipple } from '../hooks/useRipple';
import { useGenome } from '../hooks/useGenome';
import { useMetabolic } from '../hooks/useMetabolic';
import Icon from '../components/Icon';
import type { RippleResult } from '../api/ripple';

function EffectCard({ metric, effect, current }: { metric: string; effect: any; current: number }) {
  const predicted = effect.direction === 'positive'
    ? current + effect.magnitude * (1 - current)
    : effect.direction === 'negative'
    ? current - effect.magnitude * current
    : current;
  const diff = predicted - current;
  const dir = effect.direction === 'positive' ? 'up' : effect.direction === 'negative' ? 'down' : 'neutral';
  return (
    <div className={`card border-l-4 animate-slide-up ${
      dir === 'up' ? 'border-l-health-optimal' : dir === 'down' ? 'border-l-health-critical' : 'border-l-neutral-70'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-neutral-30 capitalize">{metric.replace(/_/g, ' ')}</h4>
        <span className={`flex items-center gap-0.5 text-sm font-bold ${
          dir === 'up' ? 'text-health-optimal' : dir === 'down' ? 'text-health-critical' : 'text-neutral-50'
        }`}>
          <Icon name={dir === 'up' ? 'arrow_upward' : dir === 'down' ? 'arrow_downward' : 'remove'} size={16} />
          {diff > 0 ? '+' : ''}{(diff * 100).toFixed(0)}%
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-neutral-50 mb-2">
        <span>Current: {metric.includes('_hours') || metric === 'dark_matter_cost' ? current.toFixed(1) : `${Math.round(current * 100)}%`}</span>
        <span>→</span>
        <span className="font-medium text-neutral-30">Predicted: {metric.includes('_hours') || metric === 'dark_matter_cost' ? predicted.toFixed(1) : `${Math.round(predicted * 100)}%`}</span>
      </div>
      <div className="h-2 bg-surface-container rounded-full overflow-hidden relative">
        <div className={`h-full rounded-full transition-all ${
          dir === 'up' ? 'bg-health-optimal' : dir === 'down' ? 'bg-health-critical' : 'bg-neutral-70'
        }`} style={{ width: `${effect.magnitude * 100}%` }} />
      </div>
      <p className="text-xs text-neutral-50 mt-2">{effect.description}</p>
      {effect.affected_teams?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {effect.affected_teams.map((t: string) => (
            <span key={t} className="chip bg-surface-container text-neutral-50 text-[10px]">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

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

  return (
    <div className="space-y-6">
      {/* Simulate form */}
      <div className="card max-w-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="water_drop" size={20} className="text-primary-40" />
          <h3 className="section-label">New Simulation</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-30 mb-1">Change Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Implement a 4-day workweek, restructure Engineering into pods, migrate to microservices..."
              rows={3}
              className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40 transition-colors resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-30 mb-1">Target Team <span className="text-neutral-60 font-normal">(optional)</span></label>
              <input type="text" value={target} onChange={(e) => setTarget(e.target.value)} placeholder="e.g., Engineering"
                className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-30 mb-1">Intensity</label>
              <select value={intensity} onChange={(e) => setIntensity(e.target.value)}
                className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 focus:outline-none focus:border-primary-40">
                <option value="low">Low — Incremental</option>
                <option value="medium">Medium — Moderate Shift</option>
                <option value="high">High — Radical</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={simulate.isPending || !description.trim()}
            className="btn-primary gap-2">
            <Icon name={simulate.isPending ? 'sync' : 'play_arrow'} size={18} />
            {simulate.isPending ? 'Simulating...' : 'Run Simulation'}
          </button>
        </form>
      </div>

      {/* Error */}
      {simulate.error && (
        <div className="card border-health-critical/30 bg-health-critical/5 flex items-center gap-3">
          <Icon name="error" size={20} className="text-health-critical" />
          <span className="text-sm text-neutral-30">Simulation failed. Please try again.</span>
        </div>
      )}

      {/* Results */}
      {result && currentBaseline.current && (
        <div className="space-y-5 animate-slide-up">
          <div className="flex items-center gap-2">
            <Icon name="neurology" size={20} className="text-primary-40" />
            <h2 className="text-lg font-display font-semibold text-neutral-20">Ripple Impact</h2>
          </div>

          {/* Comparison table */}
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-80/50 bg-surface-container/50">
                  <th className="text-left py-3 px-4 text-neutral-50 font-medium text-[11px] uppercase tracking-wider">Metric</th>
                  <th className="text-right py-3 px-4 text-neutral-50 font-medium text-[11px] uppercase tracking-wider">Current</th>
                  <th className="text-right py-3 px-4 text-neutral-50 font-medium text-[11px] uppercase tracking-wider">Predicted</th>
                  <th className="text-right py-3 px-4 text-neutral-50 font-medium text-[11px] uppercase tracking-wider">Change</th>
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
                    <tr key={metric} className="border-b border-neutral-80/20 hover:bg-surface-container/30 transition-colors">
                      <td className="py-3 px-4 text-neutral-30 capitalize">{metric.replace(/_/g, ' ')}</td>
                      <td className={`py-3 px-4 text-right font-mono ${current > 0 ? 'text-neutral-30' : 'text-neutral-60'}`}>
                        {metric.includes('_hours') || metric === 'dark_matter_cost' ? current.toFixed(1) : `${Math.round(current * 100)}%`}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono ${predicted > 0 ? 'text-neutral-20 font-semibold' : 'text-neutral-60'}`}>
                        {metric.includes('_hours') || metric === 'dark_matter_cost' ? predicted.toFixed(1) : `${Math.round(predicted * 100)}%`}
                      </td>
                      <td className={`py-3 px-4 text-right font-semibold font-mono ${
                        diff > 0 ? 'text-health-optimal' : diff < 0 ? 'text-health-critical' : 'text-neutral-50'
                      }`}>
                        {diff > 0 ? '+' : ''}{(diff * 100).toFixed(0)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Effect cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result).map(([metric, effect]) => {
              const current = currentBaseline.current![metric] ?? 0;
              return <EffectCard key={metric} metric={metric} effect={effect} current={current} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
