import { useTeams } from '../hooks/useTeams';

interface TeamFilterProps {
  value: string;
  onChange: (teamId: string) => void;
}

export default function TeamFilter({ value, onChange }: TeamFilterProps) {
  const { data: teams } = useTeams();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-container border border-neutral-80/50 rounded-lg px-3 py-1.5 text-xs text-neutral-50 focus:outline-none focus:border-primary-40"
    >
      <option value="">All Teams</option>
      {teams?.map((t) => (
        <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
      ))}
    </select>
  );
}
