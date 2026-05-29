import { useState, useCallback } from 'react';
import { useGenome, useGenomeHistory, useAnalyzeGenome } from '../hooks/useGenome';
import { getGenomeCsvUrl, getGenomePdfUrl } from '../api/genome';
import { triggerBlobDownload } from '../api/exportAll';
import { useTeamFilter } from '../hooks/useTeamFilter';
import TeamFilter from '../components/TeamFilter';
import DNAHelix from '../components/DNAHelix';
import Icon from '../components/Icon';
import { GENE_LABELS } from '../types';
import { scoreColor } from '../lib/utils';

const GENE_COLORS: Record<string, string> = {
  collaboration: '#065291',
  decision_making: '#8B5CF6',
  knowledge_flow: '#22C55E',
  innovation: '#EAB308',
  resilience: '#EF4444',
  vitality: '#006972',
};

const GENE_DEFINITIONS: Record<string, string> = {
  collaboration: 'Cross-team communication frequency and quality — measures how effectively teams share information and work together.',
  decision_making: 'Speed and clarity of decisions — how quickly the organization moves from deliberation to action.',
  knowledge_flow: 'Information sharing across teams — the ease with which knowledge moves between departments and individuals.',
  innovation: 'New ideas, experimentation, and learning — the organization\'s capacity for creative problem-solving and adaptation.',
  resilience: 'Ability to absorb shocks and recover — how well the organization maintains function under stress or change.',
  vitality: 'Overall energy, engagement, and momentum — the collective drive and enthusiasm of the workforce.',
};

const GENE_ICONS: Record<string, string> = {
  collaboration: 'groups',
  decision_making: 'psychology',
  knowledge_flow: 'hub',
  innovation: 'lightbulb',
  resilience: 'bolt',
  vitality: 'monitoring',
};

export default function GenomeLab() {
  const { data: genome, isLoading, error } = useGenome();
  const { data: history } = useGenomeHistory();
  const analyze = useAnalyzeGenome();
  const { teamId, setTeamId } = useTeamFilter();
  const [compareIdx, setCompareIdx] = useState<number>(-1);
  const [historyLimit, setHistoryLimit] = useState(10);

  const download = useCallback(async (fn: () => Promise<string>, name: string) => {
    const url = await fn();
    await triggerBlobDownload(url, name);
  }, []);

  const genes = genome ? Object.entries(GENE_LABELS).map(([key, label]) => ({
    key, label,
    score: genome[key as keyof typeof genome] as number,
    color: GENE_COLORS[key] || '#065291',
    icon: GENE_ICONS[key] || 'genetics',
  })) : [];

  const previousGenome = (compareIdx >= 0 && history && history.length > compareIdx + 1)
    ? history[compareIdx + 1] : null;

  if (!genome && !isLoading && !error) return null;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-95 flex items-center justify-center">
          <Icon name="genetics" size={32} className="text-primary-40" />
        </div>
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-display font-semibold text-neutral-20 mb-1">No Genome Data</h2>
          <p className="text-sm text-neutral-50 mb-4">Sequence your organization's genome to discover its DNA.</p>
          <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
            <Icon name="play_arrow" size={18} />{analyze.isPending ? 'Analyzing...' : 'Sequence Genome'}
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card h-48 animate-shimmer rounded-2xl" />
          <div className="lg:col-span-2 card h-48 animate-shimmer rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card h-28 animate-shimmer rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <TeamFilter value={teamId} onChange={setTeamId} />
        </div>
        <div className="flex items-center gap-2">
          {genome && (
            <>
              <button onClick={() => download(getGenomeCsvUrl, 'genome_history.csv')} className="btn-secondary"><Icon name="download" size={16} />CSV</button>
              <button onClick={() => download(getGenomePdfUrl, 'genome_report.pdf')} className="btn-secondary"><Icon name="picture_as_pdf" size={16} />PDF</button>
            </>
          )}
          <button onClick={() => analyze.mutate()} disabled={analyze.isPending} className="btn-primary gap-2">
            <Icon name={analyze.isPending ? 'sync' : 'play_arrow'} size={18} />{analyze.isPending ? 'Analyzing...' : 'Analyze Genome'}
          </button>
        </div>
      </div>

      {genome && (
        <>
          {/* Health gauge + DNA Helix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card flex flex-col items-center justify-center py-8">
              <div className="section-label mb-3 text-center">Overall Health</div>
              <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90 text-neutral-90">
                <circle cx="70" cy="70" r="58" fill="none" stroke="currentColor" strokeWidth="10" />
                <circle cx="70" cy="70" r="58" fill="none" stroke={scoreColor(genome.health_score)} strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="364.4" strokeDashoffset={364.4 * (1 - genome.health_score)}
                  style={{ transition: 'stroke-dashoffset 1s ease' }} />
              </svg>
              <div className="text-3xl font-bold font-display mt-2" style={{ color: scoreColor(genome.health_score) }}>
                {Math.round(genome.health_score * 100)}%
              </div>
              <div className="text-xs text-neutral-50 mt-1">Composite health score</div>
            </div>
            <div className="lg:col-span-2 card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon name="dna" size={18} className="text-primary-40" />
                  <h3 className="section-label">DNA Helix</h3>
                </div>
                {history && history.length > 1 && (
                  <select
                    value={compareIdx}
                    onChange={(e) => setCompareIdx(Number(e.target.value))}
                    className="bg-surface-container border border-neutral-80/50 rounded-lg px-3 py-1.5 text-xs text-neutral-40 focus:outline-none focus:border-primary-40"
                  >
                    <option value={-1}>No comparison</option>
                    {history.slice(1, historyLimit).map((h, i) => (
                      <option key={h.id} value={i}>vs {h.week_start}</option>
                    ))}
                  </select>
                )}
              </div>
              <DNAHelix
                genes={genes.map(g => ({ label: g.label, score: g.score, color: g.color }))}
                previousGenes={previousGenome ? Object.entries(GENE_LABELS).map(([key, label]) => ({
                  label, score: previousGenome[key as keyof typeof previousGenome] as number,
                  color: GENE_COLORS[key] || '#065291',
                })) : undefined}
              />
              {previousGenome && (
                <p className="text-xs text-neutral-50 mt-3">
                  Dashed lines show previous genome ({previousGenome.week_start}).
                  <span className="text-health-optimal ml-2">▲ improved</span>
                  <span className="text-health-critical ml-2">▼ declined</span>
                </p>
              )}
            </div>
          </div>

          {/* Gene cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {genes.map(({ key, label, score, color, icon }) => {
              const prevScore = previousGenome ? previousGenome[key as keyof typeof previousGenome] as number : null;
              const diff = prevScore !== null ? score - prevScore : null;
              return (
                <div key={key} className="card hover:shadow-card-hover transition-all group relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                        <Icon name={icon} size={18} style={{ color }} />
                      </div>
                      <span className="text-sm font-medium text-neutral-30">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {diff !== null && (
                        <span className={`text-xs font-medium ${diff > 0 ? 'text-health-optimal' : diff < 0 ? 'text-health-critical' : 'text-neutral-50'}`}>
                          {diff > 0 ? '▲' : diff < 0 ? '▼' : '◆'} {(diff * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-lg font-bold font-display" style={{ color }}>{Math.round(score * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-2.5 bg-surface-container rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score * 100}%`, backgroundColor: color }} />
                    {prevScore !== null && (
                      <div className="absolute top-0 h-full border-l-2 border-dashed border-neutral-70" style={{ left: `${prevScore * 100}%`, opacity: 0.6 }} />
                    )}
                  </div>
                  {prevScore !== null && (
                    <div className="text-[11px] text-neutral-50 mt-1">Previous: {Math.round(prevScore * 100)}%</div>
                  )}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-30 text-white text-xs rounded-xl shadow-elevated opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {GENE_DEFINITIONS[key]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {genome.summary && (
            <div className="card">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="summarize" size={18} className="text-primary-40" />
                <h3 className="section-label">Genome Summary</h3>
              </div>
              <p className="text-sm text-neutral-30 leading-relaxed">{genome.summary}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
