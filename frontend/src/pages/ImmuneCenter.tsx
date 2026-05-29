import { useInfections, useAnalyzeInfections, useTreatInfection } from '../hooks/useImmune';
import { useTeamFilter } from '../hooks/useTeamFilter';
import TeamFilter from '../components/TeamFilter';
import SpreadBubble from '../components/SpreadBubble';
import Icon from '../components/Icon';

const COLOR_MAP: Record<string, string> = { high: '#EF4444', medium: '#EAB308', low: '#22C55E' };
const SEVERITY_LABEL: Record<string, string> = { high: 'Critical', medium: 'Moderate', low: 'Low' };

function InfectionCard({ inf, onTreat, treating }: { inf: any; onTreat: () => void; treating: boolean }) {
  return (
    <div className="card hover:shadow-card-hover transition-all animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            inf.severity === 'high' ? 'bg-health-critical/10' : inf.severity === 'medium' ? 'bg-health-functional/10' : 'bg-health-optimal/10'
          }`}>
            <Icon name="bug_report" size={20} className={
              inf.severity === 'high' ? 'text-health-critical' : inf.severity === 'medium' ? 'text-health-functional' : 'text-health-optimal'
            } />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-20">{inf.infection_type}</h3>
            <span className={`badge text-[10px] mt-0.5 ${
              inf.severity === 'high' ? 'bg-health-critical/10 text-health-critical' :
              inf.severity === 'medium' ? 'bg-health-functional/10 text-health-functional' :
              'bg-health-optimal/10 text-health-optimal'
            }`}>{SEVERITY_LABEL[inf.severity] || inf.severity}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-neutral-50">Spread</div>
          <div className="text-sm font-bold text-neutral-30">{inf.spread_count}</div>
        </div>
      </div>
      <p className="text-sm text-neutral-50 leading-relaxed mb-3">{inf.description}</p>
      {inf.treatment && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-primary-95/50 mb-3">
          <Icon name="medication" size={16} className="text-primary-40 mt-0.5" />
          <div>
            <div className="text-xs font-semibold text-primary-40">Recommended Treatment</div>
            <p className="text-xs text-neutral-50">{inf.treatment}</p>
          </div>
        </div>
      )}
      {inf.treatment && (
        <button onClick={onTreat} disabled={treating}
          className="btn-primary w-full justify-center gap-2">
          <Icon name="vaccines" size={16} />{treating ? 'Applying...' : 'Apply Treatment'}
        </button>
      )}
    </div>
  );
}

export default function ImmuneCenter() {
  const { data: infections, isLoading, error } = useInfections();
  const analyze = useAnalyzeInfections();
  const treat = useTreatInfection();
  const { teamId, setTeamId } = useTeamFilter();

  const bubbleData = (infections || []).map((inf) => ({
    id: inf.id, label: inf.infection_type,
    value: inf.severity_score * 50 + 10,
    color: COLOR_MAP[inf.severity] || '#6b7280', severity: inf.severity,
  }));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
          <Icon name="verified" size={32} className="text-health-critical" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">No Infection Data</h2>
          <p className="text-sm text-neutral-50 mb-4">Scan your organization to detect health threats.</p>
          <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
            <Icon name="play_arrow" size={18} />{analyze.isPending ? 'Scanning...' : 'Scan for Infections'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="card h-64 animate-shimmer rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[1,2].map(i => <div key={i} className="card h-48 animate-shimmer rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <TeamFilter value={teamId} onChange={setTeamId} />
        <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
          <Icon name="radar" size={18} />{analyze.isPending ? 'Scanning...' : 'Scan for Infections'}
        </button>
      </div>

      {infections && infections.length > 0 ? (
        <>
          {/* Alert banner */}
          <div className={`card flex items-center gap-3 ${
            infections.filter(i => i.severity === 'high').length > 0 ? 'border-health-critical/30 bg-health-critical/5' : 'border-health-functional/30 bg-health-functional/5'
          }`}>
            <Icon name={infections.filter(i => i.severity === 'high').length > 0 ? 'warning' : 'info'} size={24} className={
              infections.filter(i => i.severity === 'high').length > 0 ? 'text-health-critical' : 'text-health-functional'
            } />
            <div className="flex-1">
              <div className="text-sm font-semibold text-neutral-20">
                {infections.length} active infection{infections.length > 1 ? 's' : ''} detected
              </div>
              <div className="text-xs text-neutral-50">
                {infections.filter(i => i.severity === 'high').length > 0 ? '⚠ Critical threats require immediate attention' :
                 infections.filter(i => i.severity === 'medium').length > 0 ? '◆ Moderate threats present' : '● Low-level threats detected'}
              </div>
            </div>
            <div className="flex gap-1">
              {['high', 'medium', 'low'].map(s => {
                const count = infections.filter(i => i.severity === s).length;
                if (!count) return null;
                return (
                  <span key={s} className={`badge text-[10px] ${
                    s === 'high' ? 'bg-health-critical/10 text-health-critical' :
                    s === 'medium' ? 'bg-health-functional/10 text-health-functional' :
                    'bg-health-optimal/10 text-health-optimal'
                  }`}>{count} {s}</span>
                );
              })}
            </div>
          </div>

          {/* Spread bubble */}
          {bubbleData.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Icon name="bubble_chart" size={18} className="text-primary-40" />
                <h3 className="section-label">Infection Network</h3>
              </div>
              <SpreadBubble data={bubbleData} />
            </div>
          )}

          {/* Infection cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {infections.map((inf) => (
              <InfectionCard key={inf.id} inf={inf} treating={treat.isPending} onTreat={() => treat.mutate(inf.id)} />
            ))}
          </div>
        </>
      ) : (
        <div className="card flex items-center gap-4 border-health-optimal/30 bg-health-optimal/5">
          <Icon name="check_circle" size={24} className="text-health-optimal" />
          <div>
            <div className="text-sm font-semibold text-neutral-20">No Infections Detected</div>
            <p className="text-xs text-neutral-50">Your organization appears healthy. All systems nominal.</p>
          </div>
        </div>
      )}
    </div>
  );
}
