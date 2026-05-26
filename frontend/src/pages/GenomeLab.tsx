import { useState, useCallback } from 'react';
import { useGenome, useGenomeHistory, useAnalyzeGenome } from '../hooks/useGenome';
import { getGenomeCsvUrl, getGenomePdfUrl } from '../api/genome';
import { useTeamFilter } from '../hooks/useTeamFilter';
import TeamFilter from '../components/TeamFilter';
import DNAHelix from '../components/DNAHelix';
import HealthGauge from '../components/HealthGauge';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { GENE_LABELS } from '../types';

const GENE_COLORS: Record<string, string> = {
  collaboration: '#00b8f0',
  decision_making: '#8b5cf6',
  knowledge_flow: '#10b981',
  innovation: '#f59e0b',
  resilience: '#ef4444',
  vitality: '#ec4899',
};

const GENE_DEFINITIONS: Record<string, string> = {
  collaboration: 'Cross-team communication frequency and quality — measures how effectively teams share information and work together.',
  decision_making: 'Speed and clarity of decisions — how quickly the organization moves from deliberation to action.',
  knowledge_flow: 'Information sharing across teams — the ease with which knowledge moves between departments and individuals.',
  innovation: 'New ideas, experimentation, and learning — the organization\'s capacity for creative problem-solving and adaptation.',
  resilience: 'Ability to absorb shocks and recover — how well the organization maintains function under stress or change.',
  vitality: 'Overall energy, engagement, and momentum — the collective drive and enthusiasm of the workforce.',
};

export default function GenomeLab() {
  const { data: genome, isLoading, error } = useGenome();
  const { data: history } = useGenomeHistory();
  const analyze = useAnalyzeGenome();
  const { teamId, setTeamId } = useTeamFilter();
  const [compareIdx, setCompareIdx] = useState<number>(-1);
  const [historyLimit, setHistoryLimit] = useState(10);

  const download = useCallback(async (fn: () => Promise<string>) => {
    const url = await fn();
    window.open(url, '_blank');
  }, []);

  const genes = genome ? Object.entries(GENE_LABELS).map(([key, label]) => ({
    label,
    score: genome[key as keyof typeof genome] as number,
    color: GENE_COLORS[key] || '#6366f1',
  })) : [];

  const previousGenome = (compareIdx >= 0 && history && history.length > compareIdx + 1)
    ? history[compareIdx + 1]
    : null;

  const previousGenes = previousGenome
    ? Object.entries(GENE_LABELS).map(([key, label]) => ({
        label,
        score: previousGenome[key as keyof typeof previousGenome] as number,
        color: GENE_COLORS[key] || '#6366f1',
      }))
    : undefined;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Genome Lab</h1>
          <p className="text-gray-400 mt-1">Organizational DNA Sequencing</p>
        </div>
        <div className="flex items-center gap-2">
          <TeamFilter value={teamId} onChange={setTeamId} />
          {genome && (
            <>
              <button onClick={() => download(getGenomeCsvUrl)} className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">CSV</button>
              <button onClick={() => download(getGenomePdfUrl)} className="py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">PDF</button>
            </>
          )}
          <button
            onClick={() => analyze.mutate()}
            disabled={analyze.isPending}
            className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
          >
            {analyze.isPending ? 'Sequencing...' : 'Sequence Genome'}
          </button>
        </div>
      </div>

      {error && (
        <AlertBanner type="info">
          No genome data yet. Click <strong>"Sequence Genome"</strong> to analyze your organization.
        </AlertBanner>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={8} />
      ) : genome ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="neuron-card flex items-center justify-center">
              <HealthGauge score={genome.health_score} />
            </div>
            <div className="lg:col-span-2 neuron-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">DNA Helix</h2>
                {history && history.length > 1 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={compareIdx}
                      onChange={(e) => setCompareIdx(Number(e.target.value))}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-neuron-500"
                    >
                      <option value={-1}>No comparison</option>
                      {history.slice(1, historyLimit).map((h, i) => (
                        <option key={h.id} value={i}>vs {h.week_start}</option>
                      ))}
                    </select>
                    {history.length >= historyLimit && (
                      <button onClick={() => setHistoryLimit(historyLimit + 10)} className="text-xs text-neuron-400 hover:text-neuron-300">Load More</button>
                    )}
                  </div>
                )}
              </div>
              <DNAHelix genes={genes} previousGenes={previousGenes} />
              {previousGenome && (
                <p className="text-xs text-gray-500 mt-2">
                  Dashed lines show previous genome ({previousGenome.week_start}). <span className="text-emerald-400">▲</span> = improved, <span className="text-red-400">▼</span> = declined.
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {genome && Object.entries(GENE_LABELS).map(([key, label]) => {
              const score = genome[key as keyof typeof genome] as number;
              const color = GENE_COLORS[key] || '#6366f1';
              const prevScore = previousGenome ? previousGenome[key as keyof typeof previousGenome] as number : null;
              const diff = prevScore !== null ? score - prevScore : null;
              return (
                <div key={key} className="neuron-card group relative" title={GENE_DEFINITIONS[key]}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">{label}</span>
                    <div className="flex items-center gap-2">
                      {diff !== null && (
                        <span className={`text-xs font-medium ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-500'}`}>
                          {diff > 0 ? '▲' : diff < 0 ? '▼' : '◆'} {(diff * 100).toFixed(0)}%
                        </span>
                      )}
                      <span className="text-lg font-bold" style={{ color }}>{Math.round(score * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden relative">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score * 100}%`, backgroundColor: color }} />
                    {prevScore !== null && (
                      <div className="absolute top-0 h-full border-l-2 border-dashed border-gray-500" style={{ left: `${prevScore * 100}%`, opacity: 0.6 }} />
                    )}
                  </div>
                  {prevScore !== null && (
                    <div className="text-xs text-gray-600 mt-1">Previous: {Math.round(prevScore * 100)}%</div>
                  )}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-xs text-gray-300 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {GENE_DEFINITIONS[key]}
                  </div>
                </div>
              );
            })}
          </div>

          {genome.summary && (
            <div className="neuron-card">
              <h2 className="text-sm font-semibold text-gray-400 mb-2">Genome Summary</h2>
              <p className="text-gray-200 text-sm leading-relaxed">{genome.summary}</p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
